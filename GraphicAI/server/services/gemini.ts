import { GoogleGenAI } from "@google/genai";

export interface GenerationRequest {
  type: 'sticker' | 'icon' | 'emoji';
  description: string;
  colors: string[];
  style: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateImages(request: GenerationRequest): Promise<string[]> {
  const { type, description, colors, style } = request;
  
  // Determine number of images based on type
  const imageCount = type === 'sticker' ? 4 : 8; // Reduced from 20 to 8 for better performance
  
  const colorString = colors.length > 0 ? `using colors: ${colors.join(', ')}` : '';
  
  const typePrompts = {
    sticker: `Create a cute, vibrant sticker design of ${description} ${colorString}. Style: ${style}. High contrast, bold outlines, cheerful and playful aesthetic suitable for messaging apps.`,
    icon: `Design a clean, minimalist icon of ${description} ${colorString}. Style: ${style}. Simple geometric shapes, scalable design, suitable for app interfaces and UI elements.`,
    emoji: `Create an expressive emoji-style illustration of ${description} ${colorString}. Style: ${style}. Round, friendly design with clear emotions, suitable for digital communication.`
  };

  const prompt = typePrompts[type];
  const results: string[] = [];

  try {
    // Generate images in batches for better reliability
    const batchSize = 2;
    const batches = Math.ceil(imageCount / batchSize);

    for (let i = 0; i < batches; i++) {
      const currentBatchSize = Math.min(batchSize, imageCount - (i * batchSize));
      
      for (let j = 0; j < currentBatchSize; j++) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-preview-image-generation",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          });

          const candidates = response.candidates;
          if (candidates && candidates.length > 0) {
            const content = candidates[0].content;
            if (content && content.parts) {
              for (const part of content.parts) {
                if (part.inlineData && part.inlineData.data) {
                  // Convert base64 to data URL
                  const dataUrl = `data:image/png;base64,${part.inlineData.data}`;
                  results.push(dataUrl);
                  break;
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error generating image ${j + 1} in batch ${i + 1}:`, error);
          // Continue with other images even if one fails
        }
      }
      
      // Small delay between batches to avoid rate limiting
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (results.length === 0) {
      throw new Error('No images were generated successfully');
    }

    return results;

  } catch (error) {
    console.error('Gemini generation error:', error);
    throw new Error(`Failed to generate images with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}