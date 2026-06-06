import { runRFPResponseWorkflow } from './workflow/rfpResponseWorkflow';
import { validateConfig } from './config';
import { error } from './utils/logger';

async function main() {
  const configErrors = validateConfig();
  if (configErrors.length > 0) {
    throw new Error(`Configuration validation failed: ${configErrors.join('; ')}`);
  }

  console.log('RFP AI Agent with RAG workflows ready.');
}

export async function handleRFPRequest(payload: any) {
  return runRFPResponseWorkflow(payload);
}

if (require.main === module) {
  main().catch((err) => {
    error('Startup failed', { err });
    process.exit(1);
  });
}
