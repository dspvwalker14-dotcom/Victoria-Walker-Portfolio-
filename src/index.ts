import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const tenantId = process.env.AZURE_TENANT_ID;
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
const jiraBaseUrl = process.env.JIRA_BASE_URL;
const jiraEmail = process.env.JIRA_EMAIL;
const jiraApiToken = process.env.JIRA_API_TOKEN;
const jiraIssueKey = process.env.JIRA_ISSUE_KEY;
const targetUserEmail = process.env.TARGET_USER_EMAIL;

if (!tenantId || !clientId || !clientSecret || !jiraBaseUrl || !jiraEmail || !jiraApiToken || !jiraIssueKey || !targetUserEmail) {
  throw new Error('Missing required environment variables. Please populate .env before running.');
}

const graphBaseUrl = 'https://graph.microsoft.com/v1.0';

interface AzureUser {
  id: string;
  userPrincipalName: string;
  displayName: string;
  userType: string;
}

interface Snapshot {
  user: AzureUser;
  groups: Array<{ id: string; displayName: string }>;
  appRoleAssignments: Array<{ id: string; resourceId: string; appRoleId: string; principalDisplayName: string; principalId: string }>;
}

async function getAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  const response = await axios.post(tokenUrl, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return response.data.access_token as string;
}

async function graphqlFetch(url: string, token: string) {
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

async function patchGraph(url: string, token: string, data: any) {
  const response = await axios.patch(url, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

async function postGraph(url: string, token: string, data: any) {
  const response = await axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

async function getUserByEmail(token: string, email: string): Promise<AzureUser> {
  const data = await graphqlFetch(`${graphBaseUrl}/users?$filter=userPrincipalName eq '${encodeURIComponent(email)}'`, token);
  const user = data.value?.[0];
  if (!user) {
    throw new Error(`Cannot find user with email ${email}`);
  }
  return user;
}

async function getUserMemberships(token: string, userId: string) {
  const groupsData = await graphqlFetch(`${graphBaseUrl}/users/${userId}/memberOf?$select=id,displayName`, token);
  const groups = groupsData.value?.filter((entry: any) => entry['@odata.type'] === '#microsoft.graph.group') || [];

  const appRoleData = await graphqlFetch(`${graphBaseUrl}/users/${userId}/appRoleAssignments`, token);
  const assignments = appRoleData.value || [];

  return { groups, assignments };
}

async function changeUserType(token: string, userId: string) {
  await patchGraph(`${graphBaseUrl}/users/${userId}`, token, { userType: 'Member' });
}

async function addGroupMembership(token: string, userId: string, groupId: string) {
  const url = `${graphBaseUrl}/groups/${groupId}/members/$ref`;
  const body = {
    '@odata.id': `${graphBaseUrl}/directoryObjects/${userId}`
  };
  await postGraph(url, token, body);
}

async function addAppRoleAssignment(token: string, userId: string, resourceId: string, appRoleId: string) {
  const url = `${graphBaseUrl}/servicePrincipals/${resourceId}/appRoleAssignedTo`;
  const body = {
    principalId: userId,
    resourceId,
    appRoleId
  };
  await postGraph(url, token, body);
}

async function updateJiraComment(message: string) {
  const url = `${jiraBaseUrl}/rest/api/3/issue/${jiraIssueKey}/comment`;
  const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');

  await axios.post(url, { body: message }, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });
}

function writeSnapshot(snapshot: Snapshot) {
  const fileName = `access-snapshot-${snapshot.user.userPrincipalName.replace(/[@.]/g, '_')}.json`;
  fs.writeFileSync(path.resolve(process.cwd(), fileName), JSON.stringify(snapshot, null, 2), 'utf-8');
  return fileName;
}

async function main() {
  const token = await getAccessToken();
  const user = await getUserByEmail(token, targetUserEmail);
  const { groups, assignments } = await getUserMemberships(token, user.id);

  const snapshot: Snapshot = {
    user,
    groups: groups.map((group: any) => ({ id: group.id, displayName: group.displayName })),
    appRoleAssignments: assignments.map((assignment: any) => ({
      id: assignment.id,
      resourceId: assignment.resourceId,
      appRoleId: assignment.appRoleId,
      principalDisplayName: assignment.principalDisplayName,
      principalId: assignment.principalId
    }))
  };

  const snapshotFile = writeSnapshot(snapshot);
  console.log(`Snapshot written to ${snapshotFile}`);

  console.log(`Converting user ${user.userPrincipalName} to Member...`);
  await changeUserType(token, user.id);
  console.log('User type updated. Verifying membership restoration...');

  for (const group of snapshot.groups) {
    try {
      await addGroupMembership(token, user.id, group.id);
      console.log(`Ensured member of ${group.displayName}`);
    } catch (error: any) {
      console.warn(`Group ${group.displayName} may already include the user or could not be added: ${error.message}`);
    }
  }

  for (const assignment of snapshot.appRoleAssignments) {
    try {
      await addAppRoleAssignment(token, user.id, assignment.resourceId, assignment.appRoleId);
      console.log(`Ensured app role assignment ${assignment.appRoleId} on resource ${assignment.resourceId}`);
    } catch (error: any) {
      console.warn(`App role assignment ${assignment.appRoleId} could not be recreated: ${error.message}`);
    }
  }

  const jiraMessage = `Guest-to-member conversion completed for ${user.userPrincipalName}.

- Snapshot file: ${snapshotFile}
- Groups preserved: ${snapshot.groups.length}
- App role assignments preserved: ${snapshot.appRoleAssignments.length}`;

  await updateJiraComment(jiraMessage);
  console.log('Updated Jira ticket successfully.');
}

main().catch(async (err) => {
  console.error('Workflow failed:', err.message || err);
  try {
    await updateJiraComment(`Guest-to-member workflow failed for ${targetUserEmail}: ${err.message || err}`);
  } catch {
    console.error('Failed to post Jira error comment.');
  }
  process.exit(1);
});
