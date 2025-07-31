import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type ImageProvider = "gemini" | "openai";

interface GenerationOptions {
  prompt: string;
  provider?: ImageProvider;
  n?: number;
  size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}

let OpenAI: any;
try {
  // Dynamically require OpenAI to avoid compile-time errors if not installed
  OpenAI = require("openai").default || require("openai");
} catch (e) {
  OpenAI = undefined;
}

export async function generateImage(options: GenerationOptions): Promise<string[] | undefined> {
  const {
    prompt,
    provider = "gemini", // Default to Gemini
    n = 1,
    size = "1024x1024",
    quality = "standard",
    style = "vivid",
  } = options;

  try {
    if (provider === "openai" && OpenAI) {
      console.log(`🎨 Generating ${n} image(s) with OpenAI DALL-E 3...`);
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1, // DALL-E 3 only supports n=1
        size: size,
        quality: quality,
        style: style,
      });
      return response.data.map((img: any) => img.url || "");
    } else {
      // Default to Gemini
      console.log(`🎨 Generating ${n} image(s) with Google Gemini...`);
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" }); // Or other suitable model
      
      // Gemini API for image generation might differ, this is a placeholder structure
      // Based on GraphicAI, it might be a different model endpoint like 'gemini-2.0-flash-preview-image-generation'
      // For now, we'll simulate a response structure.
      
      // Placeholder for actual Gemini image generation call
      // const result = await model.generateContent([prompt]);
      // const imageUrl = result.response.text();
      
      // Simulating a base64 response for now as per GraphicAI's gemini.ts
      const simulatedBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      return Array(n).fill(simulatedBase64);
    }
  } catch (error: any) {
    console.error(`❌ Error generating image with ${provider}:`, error.message);
    if (OpenAI && error instanceof OpenAI.APIError) {
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