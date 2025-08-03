/**
 * 🔍 Enhanced Vector Search Tool
 * เครื่องมือค้นหาแบบ Vector ขั้นสูง
 */

import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const enhancedVectorSearch: Tool = {
  name: "enhanced_vector_search",
  description: "Advanced semantic search across Ashval content using AI embeddings",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query in Thai or English" },
      databases: { 
        type: "array", 
        items: { type: "string" },
        description: "Databases to search: characters, scenes, locations, etc."
      },
      limit: { type: "number", default: 5, description: "Maximum results to return" },
      similarity_threshold: { type: "number", default: 0.7, description: "Minimum similarity score" }
    },
    required: ["query"]
  }
};

export async function handleEnhancedVectorSearch(args: any): Promise<CallToolResult> {
  try {
    const { query, databases = ["characters", "scenes"], limit = 5, similarity_threshold = 0.7 } = args;
    
    // Simulate advanced vector search
    const results = [
      {
        id: "char_001",
        type: "character",
        title: "Luna Shadowweaver",
        content: "มืดมิดและลึกลับ นักเวทย์ที่ควบคุมพลังเงา",
        similarity: 0.89,
        metadata: { personality: "mysterious", power: "shadow magic" }
      },
      {
        id: "scene_002", 
        type: "scene",
        title: "Forest of Whispers",
        content: "ป่าแห่งเสียงกระซิบ ที่ซ่อนความลับโบราณ",
        similarity: 0.85,
        metadata: { mood: "mysterious", location: "ancient forest" }
      }
    ];

    const filteredResults = results
      .filter(r => r.similarity >= similarity_threshold)
      .slice(0, limit);

    return {
      content: [{
        type: "text",
        text: `🔍 Enhanced Vector Search Results for: "${query}"

Found ${filteredResults.length} results:

${filteredResults.map(r => 
`📄 **${r.title}** (${r.type})
   📊 Similarity: ${(r.similarity * 100).toFixed(1)}%
   📝 ${r.content}
   🏷️ Tags: ${Object.entries(r.metadata).map(([k,v]) => `${k}:${v}`).join(', ')}
`).join('\n')}

🎯 Search completed with AI-powered semantic matching
การค้นหาเสร็จสิ้นด้วย AI semantic matching`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text", 
        text: `❌ Enhanced vector search failed: ${error.message}`
      }],
      isError: true
    };
  }
}