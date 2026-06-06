import { searchVectorStore, VectorStoreResult } from '../vectorstore/vectorStoreClient';
import { RFPRequest } from '../validation';
import { buildAugmentedPrompt } from '../llm/prompts';
import { callLLM } from '../llm/llmClient';
import { RetrievalError } from '../errors';
import { info, warn } from '../utils/logger';

export interface RAGResult {
  question: string;
  response: string;
  retrievedSources: VectorStoreResult[];
  model: string;
  provider: string;
}

export async function runRAGPipeline(rfpRequest: RFPRequest): Promise<RAGResult> {
  info('Starting RAG pipeline', { question: rfpRequest.rfpQuestion });

  // Step 1: Retrieve relevant documents
  let retrievedDocs: VectorStoreResult[] = [];
  try {
    retrievedDocs = await searchVectorStore(rfpRequest.rfpQuestion, 5);
    info('Retrieved documents', { count: retrievedDocs.length });
  } catch (err) {
    warn('Retrieval failed, continuing with empty context', { error: err });
  }

  if (retrievedDocs.length === 0) {
    warn('No relevant documents found in vector store');
  }

  // Step 2: Build augmented prompt
  const prompt = buildAugmentedPrompt(rfpRequest, retrievedDocs);

  // Step 3: Call LLM
  const llmResult = await callLLM(prompt);

  info('RAG pipeline complete', { model: llmResult.model, provider: llmResult.provider });

  return {
    question: rfpRequest.rfpQuestion,
    response: llmResult.text,
    retrievedSources: retrievedDocs,
    model: llmResult.model,
    provider: llmResult.provider
  };
}
