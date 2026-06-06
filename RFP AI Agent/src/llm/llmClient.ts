import axios from 'axios';
import { config } from '../config';
import { GenerationError } from '../errors';

export interface LLMResponse {
  text: string;
  model: string;
  provider: string;
}

export async function callLLM(prompt: string): Promise<LLMResponse> {
  if (config.llmProvider === 'openai') {
    return callOpenAI(prompt);
  } else if (config.llmProvider === 'anthropic') {
    return callAnthropic(prompt);
  } else if (config.llmProvider === 'ollama') {
    return callOllama(prompt);
  }

  throw new GenerationError(`Unsupported LLM provider: ${config.llmProvider}`);
}

async function callOpenAI(prompt: string): Promise<LLMResponse> {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: config.openaiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.llmTemperature,
        max_tokens: config.llmMaxTokens
      },
      { headers: { Authorization: `Bearer ${config.openaiApiKey}` } }
    );

    return {
      text: response.data.choices[0]?.message?.content || '',
      model: config.openaiModel,
      provider: 'openai'
    };
  } catch (err: any) {
    throw new GenerationError(`OpenAI API error: ${err.message}`);
  }
}

async function callAnthropic(prompt: string): Promise<LLMResponse> {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: config.anthropicModel,
        max_tokens: config.llmMaxTokens,
        messages: [{ role: 'user', content: prompt }]
      },
      { headers: { Authorization: `Bearer ${config.anthropicApiKey}`, 'anthropic-version': '2023-06-01' } }
    );

    return {
      text: response.data.content[0]?.text || '',
      model: config.anthropicModel,
      provider: 'anthropic'
    };
  } catch (err: any) {
    throw new GenerationError(`Anthropic API error: ${err.message}`);
  }
}

async function callOllama(prompt: string): Promise<LLMResponse> {
  try {
    const response = await axios.post(`${config.ollamaBaseUrl}/api/generate`, {
      model: config.embeddingsModel,
      prompt,
      temperature: config.llmTemperature,
      stream: false
    });

    return {
      text: response.data.response || '',
      model: config.embeddingsModel,
      provider: 'ollama'
    };
  } catch (err: any) {
    throw new GenerationError(`Ollama API error: ${err.message}`);
  }
}
