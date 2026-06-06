import dotenv from 'dotenv';

dotenv.config();

function parseTime(value: string, fallback: string): string {
  return value?.trim() || fallback;
}

export interface AppConfig {
  jiraBaseUrl: string;
  jiraEmail: string;
  jiraApiToken: string;
  azureTenantId: string;
  azureClientId: string;
  azureClientSecret: string;
  itOwnerEmail: string;
  itOwnerDisplayName: string;
  defaultTimezone: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  meetingDurationMinutes: number;
}

export const config: AppConfig = {
  jiraBaseUrl: process.env.JIRA_BASE_URL || '',
  jiraEmail: process.env.JIRA_EMAIL || '',
  jiraApiToken: process.env.JIRA_API_TOKEN || '',
  azureTenantId: process.env.AZURE_TENANT_ID || '',
  azureClientId: process.env.AZURE_CLIENT_ID || '',
  azureClientSecret: process.env.AZURE_CLIENT_SECRET || '',
  itOwnerEmail: process.env.IT_OWNER_EMAIL || '',
  itOwnerDisplayName: process.env.IT_OWNER_DISPLAY_NAME || '',
  defaultTimezone: process.env.DEFAULT_TIMEZONE || 'UTC',
  businessHoursStart: parseTime(process.env.BUSINESS_HOURS_START || '', '09:00'),
  businessHoursEnd: parseTime(process.env.BUSINESS_HOURS_END || '', '17:00'),
  meetingDurationMinutes: Number(process.env.MEETING_DURATION_MINUTES || 30)
};

export function validateConfig(): string[] {
  const errors: string[] = [];

  if (!config.jiraBaseUrl) errors.push('JIRA_BASE_URL is required.');
  if (!config.jiraEmail) errors.push('JIRA_EMAIL is required.');
  if (!config.jiraApiToken) errors.push('JIRA_API_TOKEN is required.');
  if (!config.azureTenantId) errors.push('AZURE_TENANT_ID is required.');
  if (!config.azureClientId) errors.push('AZURE_CLIENT_ID is required.');
  if (!config.azureClientSecret) errors.push('AZURE_CLIENT_SECRET is required.');
  if (!config.itOwnerEmail) errors.push('IT_OWNER_EMAIL is required.');
  if (!config.itOwnerDisplayName) errors.push('IT_OWNER_DISPLAY_NAME is required.');

  return errors;
}
