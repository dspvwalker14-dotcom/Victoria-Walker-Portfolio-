export class ValidationError extends Error {
  public details: string[];
  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class WorkflowError extends Error {
  public step: string;
  constructor(step: string, message: string) {
    super(message);
    this.name = 'WorkflowError';
    this.step = step;
  }
}
