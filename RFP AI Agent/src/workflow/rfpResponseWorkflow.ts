import { RFPRequest, validateRFPRequest } from '../validation';
import { runRAGPipeline, RAGResult } from '../rag/ragPipeline';
import { error, info } from '../utils/logger';
import { ValidationError, RAGError } from '../errors';

export interface WorkflowResult {
  success: boolean;
  result?: RAGResult;
  errors?: string[];
}

export async function runRFPResponseWorkflow(request: RFPRequest): Promise<WorkflowResult> {
  try {
    validateRFPRequest(request);
    info('RFP request validated', { question: request.rfpQuestion });

    const ragResult = await runRAGPipeline(request);

    return {
      success: true,
      result: ragResult
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : `${err}`;
    const details = err instanceof ValidationError ? err.details : [];

    error('RFP workflow failed', { error: errorMessage, details });

    return {
      success: false,
      errors: [errorMessage, ...details]
    };
  }
}
