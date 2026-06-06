import { NewHireInfo } from './jira/jiraMapper';
import { ValidationError } from './errors';

export function validateNewHireInfo(newHire: NewHireInfo) {
  const missingFields: string[] = [];
  if (!newHire.newHireName?.trim()) missingFields.push('newHireName');
  if (!newHire.newHireEmail?.trim()) missingFields.push('newHireEmail');
  if (!newHire.startDate?.trim()) missingFields.push('startDate');

  if (missingFields.length > 0) {
    throw new ValidationError('Missing required new hire fields', missingFields);
  }
}

export function validateWebhookEvent(payload: any) {
  if (!payload || !payload.issue) {
    throw new ValidationError('Invalid Jira webhook payload', ['issue payload missing']);
  }
}
