export class ValidationError extends Error {
  public details: string[];
  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class RAGError extends Error {
  public step: string;
  constructor(step: string, message: string) {
    super(message);
    this.name = 'RAGError';
    this.step = step;
  }
}

export class RetrievalError extends RAGError {
  constructor(message: string) {
    super('retrieval', message);
    this.name = 'RetrievalError';
  }
}

export class GenerationError extends RAGError {
  constructor(message: string) {
    super('generation', message);
    this.name = 'GenerationError';
  }
}
