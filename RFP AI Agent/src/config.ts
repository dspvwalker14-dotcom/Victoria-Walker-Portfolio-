import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  sharePointTenantId: string;
  sharePointClientId: string;
  sharePointClientSecret: string;
  sharePointSiteUrl: string;
  sharePointLibraryName: string;
  confluenceBaseUrl: string;
  confluenceEmail: string;
  confluenceApiToken: string;
  confluenceSpaceKeys: string[];
  llmProvider: string;
  openaiApiKey?: string;
  openaiModel: string;
  anthropicApiKey?: string;
  anthropicModel: string;
  ollamaBaseUrl: string;
  embeddingsProvider: string;
  embeddingsModel: string;
  vectorStoreProvider: string;
  vectorStoreCollection: string;
  ragTopK: number;
  ragSimilarityThreshold: number;
  ragChunkSize: number;
  ragChunkOverlap: number;
  llmTemperature: number;
  llmMaxTokens: number;
  port: number;
  logLevel: string;
}

export const config: AppConfig = {
  sharePointTenantId: process.env.SHAREPOINT_TENANT_ID || '',
  sharePointClientId: process.env.SHAREPOINT_CLIENT_ID || '',
  sharePointClientSecret: process.env.SHAREPOINT_CLIENT_SECRET || '',
  sharePointSiteUrl: process.env.SHAREPOINT_SITE_URL || '',
  sharePointLibraryName: process.env.SHAREPOINT_LIBRARY_NAME || 'Shared Documents',
  confluenceBaseUrl: process.env.CONFLUENCE_BASE_URL || '',
  confluenceEmail: process.env.CONFLUENCE_EMAIL || '',
  confluenceApiToken: process.env.CONFLUENCE_API_TOKEN || '',
  confluenceSpaceKeys: (process.env.CONFLUENCE_SPACE_KEYS || '').split(',').map((s) => s.trim()),
  llmProvider: process.env.LLM_PROVIDER || 'openai',
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  embeddingsProvider: process.env.EMBEDDINGS_PROVIDER || 'openai',
  embeddingsModel: process.env.EMBEDDINGS_MODEL || 'text-embedding-3-small',
  vectorStoreProvider: process.env.VECTOR_STORE_PROVIDER || 'chroma',
  vectorStoreCollection: process.env.CHROMA_COLLECTION_NAME || 'rfp-knowledge-base',
  ragTopK: Number(process.env.RAG_TOP_K || 5),
  ragSimilarityThreshold: Number(process.env.RAG_SIMILARITY_THRESHOLD || 0.5),
  ragChunkSize: Number(process.env.RAG_CHUNK_SIZE || 1000),
  ragChunkOverlap: Number(process.env.RAG_CHUNK_OVERLAP || 200),
  llmTemperature: Number(process.env.LLM_TEMPERATURE || 0.7),
  llmMaxTokens: Number(process.env.LLM_MAX_TOKENS || 2000),
  port: Number(process.env.PORT || 3000),
  logLevel: process.env.LOG_LEVEL || 'info'
};

export function validateConfig(): string[] {
  const errors: string[] = [];

  if (!config.llmProvider) errors.push('LLM_PROVIDER is required.');
  if (config.llmProvider === 'openai' && !config.openaiApiKey) errors.push('OPENAI_API_KEY is required for OpenAI provider.');
  if (config.llmProvider === 'anthropic' && !config.anthropicApiKey) errors.push('ANTHROPIC_API_KEY is required for Anthropic provider.');
  if (!config.embeddingsProvider) errors.push('EMBEDDINGS_PROVIDER is required.');
  if (!config.vectorStoreProvider) errors.push('VECTOR_STORE_PROVIDER is required.');

  return errors;
}
