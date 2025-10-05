import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import { storage } from "./storage";
import { insertGenerationSchema } from "@shared/schema";
import { generateImages as generateWithOpenAI } from "./services/openai";
import { generateImages as generateWithGemini } from "./services/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());
  app.use(csrf({ cookie: true }));
  // Generate images endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      let imageUrls: string[];
      
      try {
        // Determine AI provider (default to OpenAI)
        const aiProvider = req.body.aiProvider || 'openai';
        
        const request = {
          type: req.body.type as 'sticker' | 'icon' | 'emoji',
          description: req.body.description,
          colors: req.body.colors as string[],
          style: req.body.style,
        };
        
        if (aiProvider === 'gemini') {
          imageUrls = await generateWithGemini(request);
        } else {
          imageUrls = await generateWithOpenAI(request);
        }
      } catch (primaryError) {
        // If primary AI provider fails, try fallback
        console.error(`${aiProvider} generation error:`, primaryError);
        
        try {
          const fallbackProvider = aiProvider === 'gemini' ? 'openai' : 'gemini';
          console.log(`Trying fallback provider: ${fallbackProvider}`);
          
          if (fallbackProvider === 'gemini') {
            imageUrls = await generateWithGemini(request);
          } else {
            imageUrls = await generateWithOpenAI(request);
          }
        } catch (fallbackError) {
          console.error("Fallback provider also failed:", fallbackError);
          
          let errorMessage = "การสร้างรูปภาพล้มเหลว / Failed to generate images";
          
          if (primaryError instanceof Error) {
            if (primaryError.message.includes("API key")) {
              errorMessage = "กรุณาตรวจสอบ API Key / Please check your API key";
            } else if (primaryError.message.includes("Content policy")) {
              errorMessage = "เนื้อหาไม่เหมาะสม กรุณาเปลี่ยนคำอธิบาย / Content not appropriate, please change description";
            } else {
              errorMessage = `การสร้างรูปภาพล้มเหลว: ${primaryError.message}`;
            }
          }
          
          return res.status(500).json({ message: errorMessage });
        }
      }
      
      // Then validate and store the complete generation data
      const generationData = {
        ...req.body,
        imageUrls,
      };
      
      const validatedData = insertGenerationSchema.parse(generationData);
      
      // Store generation in storage
      const generation = await storage.createGeneration(validatedData);
      
      res.json(generation);
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด / Unexpected error occurred" 
      });
    }
  });

  // Get recent generations
  app.get("/api/generations/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const generations = await storage.getRecentGenerations(null, limit);
      res.json(generations);
    } catch (error) {
      console.error("Error fetching recent generations:", error);
      res.status(500).json({ message: "Failed to fetch recent generations" });
    }
  });

  // Get user usage stats
  app.get("/api/usage", async (req, res) => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const usageCount = await storage.getUserUsageCount(null, currentMonth, currentYear);
      
      res.json({
        current: usageCount,
        limit: 100, // Default limit
        month: currentMonth,
        year: currentYear,
      });
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      res.status(500).json({ message: "Failed to fetch usage stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
