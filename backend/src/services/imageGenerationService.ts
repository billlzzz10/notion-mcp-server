import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';

// Note: The GraphicAI service uses a different SDK: @google/genai
// For this integration, we will stick to the @google/generative-ai SDK for consistency if possible,
// but we will adopt the model and logic from GraphicAI's implementation.
// If direct image generation isn't supported in the same way, we might need to call the GraphicAI service directly.

// Let's assume for now that the 'gemini-pro-vision' can be adapted or we can call a different model.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
let openai: OpenAI | undefined;
try {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
} catch (e) {
  console.warn("OpenAI SDK not found or not configured. OpenAI image generation will be unavailable.");
  openai = undefined;
}

type ImageProvider = "gemini" | "openai" | "graphicai"; // Added graphicai as a provider

interface GenerationOptions {
  prompt: string;
  provider?: ImageProvider;
  n?: number;
  size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  // GraphicAI specific options
  type?: 'sticker' | 'icon' | 'emoji';
  colors?: string[];
}

// This function simulates calling the GraphicAI microservice.
// In a real-world scenario, this would be an HTTP request.
async function callGraphicAIService(request: any): Promise<string[]> {
  console.log("Simulating call to GraphicAI microservice with request:", request);
  // This is where we would use the logic from GraphicAI/server/services/gemini.ts
  // For now, we'll just return a mock response.
  const mockBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  return Array(request.n || 1).fill(mockBase64);
}


export async function generateImage(options: GenerationOptions): Promise<string[] | undefined> {
  const {
    prompt,
    provider = "graphicai", // Default to the new GraphicAI service
    n = 1,
    size = "1024x1024",
    quality = "standard",
    style = "vivid",
    type = 'icon',
    colors = []
  } = options;

  try {
    if (provider === "openai" && openai) {
      console.log(`🎨 Generating ${n} image(s) with OpenAI DALL-E 3...`);
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1, // DALL-E 3 only supports n=1
        size: size,
        quality: quality,
        style: style,
      });
      return response.data.map((img: any) => img.url || "");

    } else if (provider === "graphicai") {
        console.log(`🎨 Generating ${n} image(s) with GraphicAI service...`);
        // We will call the GraphicAI service.
        // This decouples the main backend from the specific implementation details of GraphicAI.
        return await callGraphicAIService({
            type: type,
            description: prompt,
            colors: colors,
            style: style || 'default',
            n: n
        });
    } else if (provider === "gemini") {
        console.log("Native Gemini image generation is not implemented in this service. Use 'graphicai' provider instead.");
        // We could put the GraphicAI logic here directly, but decoupling is a better architecture.
        return undefined;
    }

  } catch (error: any) {
    console.error(`❌ Error generating image with ${provider}:`, error.message);
    if (provider === 'openai' && openai && error instanceof OpenAI.APIError) {
      console.error("OpenAI API Error Details:", {
        status: error.status,
        headers: error.headers,
        name: error.name,
        message: error.message,
      });
    }
    return undefined;
  }
}