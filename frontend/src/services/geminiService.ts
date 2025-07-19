// frontend/src/services/geminiService.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-2.5-flash-latest";

async function getApiKey(apiKey?: string): Promise<string> {
  if (apiKey) {
    return apiKey;
  }
  // In a real app, you might fetch this from a secure backend endpoint
  // For now, we'll rely on it being passed or available in an env var
  const serverApiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!serverApiKey) {
    throw new Error("Gemini API key is not configured.");
  }
  return serverApiKey;
}

export async function* generateAiContentStream(
  systemInstruction: string,
  userPrompt: string,
  chatHistory: any[], // Define a proper type for chatHistory
  apiKey?: string,
  modelName: string = MODEL_NAME
): AsyncGenerator<string, void, unknown> {
  try {
    const key = await getApiKey(apiKey);
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
    });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: chatHistory,
    });

    const result = await chat.sendMessageStream(userPrompt);
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  } catch (error: any) {
    console.error("Error in generateAiContentStream:", error);
    yield `[[STREAM_ERROR]]<p class="text-red-400">Error: ${error.message}</p>`;
  }
}

export async function generateSubtasksForTask(
  taskTitle: string,
  taskCategory: string,
  apiKey?: string,
  modelName: string = MODEL_NAME
): Promise<string[]> {
    const prompt = `Based on the task titled "${taskTitle}" in the category "${taskCategory}", generate a list of 3-5 actionable subtasks. Return ONLY a JSON array of strings. Example: ["Subtask 1", "Subtask 2", "Subtask 3"]`;
    
    try {
        const key = await getApiKey(apiKey);
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim().replace(/```json|```/g, '');
        
        const subtasks = JSON.parse(text);
        if (Array.isArray(subtasks) && subtasks.every(item => typeof item === 'string')) {
            return subtasks;
        }
        return [];
    } catch (error) {
        console.error("Error generating subtasks:", error);
        return [];
    }
}

export async function generateImage(prompt: string, apiKey?: string): Promise<string | undefined> {
  try {
    const key = await getApiKey(apiKey);
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateContent(prompt, { responseFormat: "image" });
    const imageUrl = result.response.text().trim();

    if (imageUrl.startsWith("data:image/")) {
      return imageUrl; // Base64 image
    } else {
      return imageUrl; // URL to the generated image
    }
  } catch (error: any) {
    console.error("Error generating image:", error);
    return undefined;
  }
}