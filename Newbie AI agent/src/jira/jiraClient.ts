import axios from 'axios';
import { config } from '../config';

export interface JiraIssueFields {
  summary: string;
  description?: string;
  statusName?: string;
  labels?: string[];
  customFields: Record<string, any>;
}

export async function postInternalJiraComment(ticketKey: string, comment: string) {
  const url = `${config.jiraBaseUrl}/rest/api/3/issue/${ticketKey}/comment`;
  const auth = Buffer.from(`${config.jiraEmail}:${config.jiraApiToken}`).toString('base64');

  await axios.post(
    url,
    { body: comment },
    {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }
  );
}

export async function notifyItOwner(subject: string, message: string) {
  const comment = `**Automation Alert:** ${subject}\n\n${message}`;
  await postInternalJiraComment('TBD', comment);
}
