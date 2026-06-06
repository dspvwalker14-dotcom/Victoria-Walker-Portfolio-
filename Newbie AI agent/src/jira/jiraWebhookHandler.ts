import { JiraIssueFields } from './jiraClient';

export interface JiraWebhookEvent {
  webhookEvent: string;
  issue_event_type_name: string;
  issue: {
    key: string;
    fields: any;
  };
}

export interface JiraIssuePayload {
  ticketKey: string;
  summary: string;
  description?: string;
  status?: string;
  labels: string[];
  fields: JiraIssueFields;
}

export function parseJiraWebhook(payload: JiraWebhookEvent): JiraIssuePayload {
  const issue = payload.issue;

  return {
    ticketKey: issue.key,
    summary: issue.fields.summary || '',
    description: issue.fields.description || '',
    status: issue.fields.status?.name || '',
    labels: Array.isArray(issue.fields.labels) ? issue.fields.labels : [],
    fields: {
      summary: issue.fields.summary || '',
      description: issue.fields.description || '',
      statusName: issue.fields.status?.name || '',
      labels: Array.isArray(issue.fields.labels) ? issue.fields.labels : [],
      customFields: issue.fields
    }
  };
}

export function isOnboardingTicket(issue: JiraIssuePayload): boolean {
  const issueType = issue.fields.customFields.issuetype?.name || '';
  const summary = issue.summary || '';
  const labels = issue.labels || [];

  return [
    issueType.toLowerCase().includes('onboarding'),
    summary.toLowerCase().includes('onboard'),
    labels.includes('onboarding'),
    labels.includes('new-hire')
  ].some(Boolean);
}
