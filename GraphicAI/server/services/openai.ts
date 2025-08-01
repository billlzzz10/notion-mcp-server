import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface GenerationRequest {
  type: 'sticker' | 'icon' | 'emoji';
  description: string;
  colors: string[];
  style: string;
}

export async function generateImages(request: GenerationRequest): Promise<string[]> {
  const { type, description, colors, style } = request;
  
  // Determine number of images based on type - reduced for better performance
  const numImages = type === 'sticker' ? 4 : 8;
  
  // Build enhanced prompt
  const colorText = colors.length > 0 ? ` using colors ${colors.join(', ')}` : '';
  const styleText = style ? ` in ${style} style` : '';
  
  let prompt = `Create a ${type} of ${description}${colorText}${styleText}`;
  
  // Add type-specific instructions
  if (type === 'sticker') {
    prompt += '. Make it vibrant, fun, and suitable for messaging apps. High detail with clear edges.';
  } else if (type === 'icon') {
    prompt += '. Make it simple, clean, and recognizable at small sizes. Perfect for user interfaces.';
  } else if (type === 'emoji') {
    prompt += '. Make it expressive, round, and suitable for text conversations. Clear facial features if applicable.';
  }
  
  const imageUrls: string[] = [];
  
  // Generate images in batches (DALL-E 3 only supports n=1)
  for (let i = 0; i < numImages; i++) {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });
      
      if (response.data[0]?.url) {
        imageUrls.push(response.data[0].url);
      }
    } catch (error) {
      console.error(`Error generating image ${i + 1}:`, error);
      
      // If it's an API key or authentication error, throw immediately
      if (error.status === 401 || error.status === 403) {
        throw new Error("Invalid or expired OpenAI API key. Please check your API key configuration.");
      }
      
      // If it's a content policy violation, throw immediately
      if (error.status === 400 && error.type === 'image_generation_user_error') {
        throw new Error("Content policy violation. Please try with a different description that follows OpenAI's usage policies.");
      }
      
      // Continue with remaining images for other errors
    }
  }
  
  if (imageUrls.length === 0) {
    throw new Error("Failed to generate any images");
  }
  
  return imageUrls;
}
