import { createMCP } from "@modelcontextprotocol/sdk";
import { z } from "zod";
import { generateImages, GenerationRequest } from "./services/gemini.js";
import dotenv from 'dotenv';

dotenv.config();

const { server } = createMCP({
  // No tools are loaded by default in this standalone server
});

const imageGenerationSchema = z.object({
  type: z.enum(['sticker', 'icon', 'emoji']).describe("The type of image to generate."),
  description: z.string().describe("A detailed description of the image content."),
  colors: z.array(z.string()).optional().describe("An array of preferred colors."),
  style: z.string().optional().describe("The artistic style of the image."),
});

server.tool(
  "graphicai_generate_image",
  "Generates images like stickers, icons, or emojis based on a description.",
  imageGenerationSchema,
  async (params: GenerationRequest) => {
    try {
      console.log("Received request to generate image with params:", params);
      const imageUrls = await generateImages(params);
      console.log(`Successfully generated ${imageUrls.length} images.`);
      return {
        success: true,
        images: imageUrls,
      };
    } catch (error: any) {
      console.error("Error in graphicai_generate_image tool:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
);

const port = process.env.GRAPHICAI_PORT || 5001;

server.listen(port, () => {
  console.log(`🎨 GraphicAI MCP Server listening on port ${port}`);
  console.log("Registered tools:", server.getTools().map(t => t.name));
});
