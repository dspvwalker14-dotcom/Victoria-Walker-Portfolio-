import axios from 'axios';
import { config } from '../config';

export async function generateEmbedding(text: string): Promise<number[]> {
  if (config.embeddingsProvider === 'openai') {
    return generateOpenAIEmbedding(text);
  } else if (config.embeddingsProvider === 'ollama') {
    return generateOllamaEmbedding(text);
  }

  throw new Error(`Unsupported embeddings provider: ${config.embeddingsProvider}`);
}

async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    { input: text, model: config.embeddingsModel },
    { headers: { Authorization: `Bearer ${config.openaiApiKey}` } }
  );

  return response.data.data[0].embedding;
}

async function generateOllamaEmbedding(text: string): Promise<number[]> {
  const response = await axios.post(`${config.ollamaBaseUrl}/api/embeddings`, {
    model: config.embeddingsModel,
    prompt: text
  });

  return response.data.embedding;
}
