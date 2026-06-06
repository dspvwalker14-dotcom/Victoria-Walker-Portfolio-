import { runOnboardingWorkflow } from './workflow/onboardingWorkflow';
import { validateConfig } from './config';
import { error } from './utils/logger';

async function main() {
  const configErrors = validateConfig();
  if (configErrors.length > 0) {
    throw new Error(`Configuration validation failed: ${configErrors.join('; ')}`);
  }

  // The entrypoint should receive the Jira webhook payload from a webhook listener.
  // For local testing, pass a payload object to `handleJiraWebhook`.
  console.log('Newbie AI Agent onboarding workflow ready.');
}

export async function handleJiraWebhook(payload: any) {
  return runOnboardingWorkflow(payload);
}

if (require.main === module) {
  main().catch((err) => {
    error('Startup failed', { err });
    process.exit(1);
  });
}
