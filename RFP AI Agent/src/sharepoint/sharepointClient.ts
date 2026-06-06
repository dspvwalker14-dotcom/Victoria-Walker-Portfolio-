import axios from 'axios';
import { Base64 } from 'js-base64';
import { config } from '../config';

export interface SharePointDocument {
  id: string;
  name: string;
  webUrl: string;
  content: string;
  lastModified: string;
  createdBy: string;
}

export async function getSharePointAccessToken(): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${config.sharePointTenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: config.sharePointClientId,
    client_secret: config.sharePointClientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  const response = await axios.post(tokenUrl, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return response.data.access_token;
}

export async function listSharePointDocuments(accessToken: string): Promise<SharePointDocument[]> {
  const siteId = await getSharePointSiteId(accessToken);
  const driveId = await getSharePointDriveId(accessToken, siteId);

  const documents: SharePointDocument[] = [];
  const listUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/root/children`;

  const response = await axios.get(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  for (const item of response.data.value || []) {
    if (item.file) {
      const content = await getSharePointDocumentContent(accessToken, siteId, driveId, item.id);
      documents.push({
        id: item.id,
        name: item.name,
        webUrl: item.webUrl,
        content,
        lastModified: item.lastModifiedDateTime,
        createdBy: item.createdBy?.user?.displayName || 'Unknown'
      });
    }
  }

  return documents;
}

async function getSharePointSiteId(accessToken: string): Promise<string> {
  const response = await axios.get(`https://graph.microsoft.com/v1.0/sites/root`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data.id;
}

async function getSharePointDriveId(accessToken: string, siteId: string): Promise<string> {
  const response = await axios.get(`https://graph.microsoft.com/v1.0/sites/${siteId}/drives?$filter=name eq '${config.sharePointLibraryName}'`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data.value[0]?.id || '';
}

async function getSharePointDocumentContent(accessToken: string, siteId: string, driveId: string, itemId: string): Promise<string> {
  const response = await axios.get(`https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/items/${itemId}/content`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    responseType: 'arraybuffer'
  });

  return Buffer.from(response.data).toString('utf-8');
}
