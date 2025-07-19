import { notion } from "../src/services/notion.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function getPodcastData(databaseId: string) {
  console.log("📊 Fetching podcast data from Notion...");
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });
    console.log(`✅ Found ${response.results.length} episodes.`);
    return response.results;
  } catch (error) {
    console.error("❌ Error fetching podcast data:", error);
    return [];
  }
}

function formatDataForAI(episodes: any[]): string {
  return episodes.map(episode => {
    const props = episode.properties;
    return JSON.stringify({
      title: props["Episode Title"]?.title[0]?.plain_text || "N/A",
      publishDate: props["Publish Date"]?.date?.start || "N/A",
      likes: props["Likes"]?.number || 0,
      views: props["Views"]?.number || 0,
      topic: props["Topic/Category"]?.multi_select?.map((s: any) => s.name).join(", ") || "N/A",
      guest: props["Guest"]?.rich_text[0]?.plain_text || "N/A",
    });
  }).join("\n");
}

async function analyzePodcastPerformance(databaseId: string) {
  const episodes = await getPodcastData(databaseId);
  if (episodes.length === 0) {
    console.log("No data to analyze.");
    return;
  }

  const formattedData = formatDataForAI(episodes);

  const prompt = `
    You are a world-class podcast strategist and data analyst.
    Your task is to analyze the performance data of my podcast episodes from my Notion database.

    **Raw Data (JSON format, one episode per line):**
    """
    ${formattedData}
    """

    **Your Analysis Must Include:**
    1.  **Overall Performance Summary:** A brief overview of the podcast's performance.
    2.  **Trend Analysis:**
        - Are likes and views generally increasing, decreasing, or stable over time?
        - Are there any noticeable patterns related to the publish dates?
    3.  **Top & Low Performing Episodes:**
        - Identify the top 3 episodes with the highest likes/views and analyze why they might be successful (e.g., topic, guest).
        - Identify the 3 lowest-performing episodes and suggest potential reasons for their performance.
    4.  **Topic/Category Insights:**
        - Which topics or categories generate the most engagement (likes/views)?
        - Are there any underserved topics that could be explored?
    5.  **Strategic Recommendations:**
        - Provide 3-5 actionable recommendations to improve the podcast's performance.
        - Suggest potential new topics or guests based on the data.
        - Recommend strategies to convert views into likes.

    Provide the output in a structured and easy-to-read Markdown format.
  `;

  console.log("\n🤖 Sending data to AI for strategic analysis...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();
    
    console.log("\n--- 📈 AI Podcast Strategist Report ---");
    console.log(analysis);
    console.log("------------------------------------");
    
    return analysis;
  } catch (error) {
    console.error("Error during AI analysis:", error);
    return null;
  }
}

// --- How to run this script ---
// 1. Make sure your .env file has NOTION_PODCAST_DB_ID and GEMINI_API_KEY
// 2. Run from your terminal: ts-node scripts/analyze-podcast-performance.ts

(async () => {
  const podcastDbId = process.env.NOTION_PODCAST_DB_ID;
  if (!podcastDbId) {
    console.error("Please set NOTION_PODCAST_DB_ID in your .env file.");
    return;
  }
  await analyzePodcastPerformance(podcastDbId);
})();
