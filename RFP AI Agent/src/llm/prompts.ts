import { VectorStoreResult } from '../vectorstore/vectorStoreClient';
import { RFPRequest } from '../validation';

export function buildAugmentedPrompt(rfpRequest: RFPRequest, retrievedDocs: VectorStoreResult[]): string {
  const context = retrievedDocs.map((doc, idx) => `[Source ${idx + 1}] ${doc.chunk.metadata.title}\n${doc.chunk.text}`).join('\n\n');

  const prompt = `You are an expert RFP response generator for a software company. Based on the following context from our internal knowledge base, generate an accurate, professional RFP response.

RFP Question: ${rfpRequest.rfpQuestion}

${rfpRequest.context ? `Context: ${rfpRequest.context}\n` : ''}
${rfpRequest.constraints?.length ? `Constraints: ${rfpRequest.constraints.join(', ')}\n` : ''}

Retrieved Knowledge Base Context:
${context}

Please generate a comprehensive, well-structured RFP response that addresses the question directly, incorporates relevant details from the knowledge base, and maintains our company's tone and standards. Include citations to the source documents where appropriate.

Response:`;

  return prompt;
}

export function buildIndexingPrompt(content: string): string {
  return `Summarize the following document in 2-3 sentences for use in a knowledge base:\n\n${content}`;
}
