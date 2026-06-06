import { JiraIssuePayload } from './jiraWebhookHandler';

export interface NewHireInfo {
  ticketKey: string;
  newHireName: string;
  newHireEmail: string;
  startDate: string;
  jobTitle?: string;
  department?: string;
  managerName?: string;
  managerEmail?: string;
  location?: string;
  timezone?: string;
  notes?: string;
}

export function mapIssueToNewHire(issue: JiraIssuePayload): NewHireInfo {
  const fields = issue.fields.customFields;

  // Customize these field names to match your Jira custom field IDs.
  return {
    ticketKey: issue.ticketKey,
    newHireName: fields.customfield_10010 || fields.customfield_1001 || '',
    newHireEmail: fields.customfield_10011 || fields.customfield_1002 || '',
    startDate: fields.customfield_10012 || fields.customfield_1003 || '',
    jobTitle: fields.customfield_10013 || fields.customfield_1004 || '',
    department: fields.customfield_10014 || fields.customfield_1005 || '',
    managerName: fields.customfield_10015 || fields.customfield_1006 || '',
    managerEmail: fields.customfield_10016 || fields.customfield_1007 || '',
    location: fields.customfield_10017 || fields.customfield_1008 || '',
    timezone: fields.customfield_10018 || fields.customfield_1009 || '',
    notes: fields.customfield_10019 || fields.customfield_10010 || issue.description || ''
  };
}
