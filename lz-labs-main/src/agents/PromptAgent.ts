import { InferenceClient } from '@huggingface/inference';

// Initialize Hugging Face Inference client using API token from environment
const hfToken = process.env.HF_API_TOKEN;
if (!hfToken) {
  throw new Error('HF_API_TOKEN is not defined');
}
const client = new InferenceClient({ token: hfToken });

export interface PromptParams {
  seed?: number;
  gender?: 'male' | 'female';
  custom?: string;
}

/**
 * Fetch a text prompt from a Hugging Face model (e.g., deepseek-free).
 */
export async function fetchPrompt(params: PromptParams): Promise<string> {
  const { seed = 0, gender = 'female', custom = '' } = params;
  // Build input text
  const inputText = `${custom} seed=${seed} gender=${gender}`.trim();
  // Call Hugging Face text-generation endpoint
  const response = await client.textGeneration({
    model: 'bigcode/deepseek-free',
    inputs: inputText,
    parameters: { max_new_tokens: 50 }
  });
  return response.generated_text;
}
