import { ValidationError } from './errors';

export interface RFPRequest {
  rfpQuestion: string;
  context?: string;
  constraints?: string[];
}

export function validateRFPRequest(request: RFPRequest) {
  const errors: string[] = [];

  if (!request.rfpQuestion?.trim()) errors.push('rfpQuestion is required.');

  if (errors.length > 0) {
    throw new ValidationError('Invalid RFP request', errors);
  }
}
