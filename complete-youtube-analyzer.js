import { queryRAG } from './src/services/ragService.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

// This should be initialized once in your main application file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function analyzeYouTubeTranscript(transcript, videoTitle) {
  console.log(`Analyzing transcript for video: "${videoTitle}"`);

  // 1. Use RAG to find relevant context from your ROF vault
  const contextQuery = `Key concepts or characters related to: ${videoTitle}`;
  const relevantDocs = await queryRAG(contextQuery);
  const context = relevantDocs.map(doc => doc.pageContent).join("\n\n---\n\n");

  // 2. Build a detailed prompt for Gemini
  const prompt = `
    You are an expert content analyst. Your task is to analyze the following YouTube video transcript.
    Use the provided context from my personal knowledge base (ROF vault) to enrich your analysis.

    **Video Title:** ${videoTitle}

    **Transcript:**
    """
    ${transcript}
    """

    **Context from ROF Vault:**
    """
    ${context}
    """

    **Your Analysis Should Include:**
    1.  **Main Summary:** A concise summary of the video's key points.
    2.  **Key Topics:** A bulleted list of the main topics discussed.
    3.  **Connection to ROF Vault:** Identify and explain any connections, consistencies, or inconsistencies between the video content and the provided context from the ROF vault.
    4.  **Actionable Insights:** Suggest 3-5 actionable insights or ideas based on the video content. How can this information be used in my project?
    5.  **Sentiment Analysis:** Briefly describe the overall tone and sentiment of the video (e.g., Positive, Neutral, Critical, Educational).

    Provide the output in a structured Markdown format.
  `;

  // 3. Call Gemini API
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();
    
    console.log("\n--- YouTube Transcript Analysis ---");
    console.log(analysis);
    console.log("---------------------------------");
    
    return analysis;
  } catch (error) {
    console.error("Error analyzing YouTube transcript:", error);
    return null;
  }
}

// Example Usage (replace with actual transcript)
/*
(async () => {
  // Make sure RAG is initialized before calling this
  // await initializeRAG(); 

  const exampleTranscript = "This is an example transcript about Ignus Lioren and his journey...";
  const exampleTitle = "The Lore of Ignus Lioren";
  await analyzeYouTubeTranscript(exampleTranscript, exampleTitle);
})();
*/