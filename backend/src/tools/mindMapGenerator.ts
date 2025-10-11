import { router } from "../Router.js";

interface MindMapRequest {
  imageUrl?: string;
  imageBase64?: string;
  prompt?: string; // Or generate a mind map from a text prompt
}

interface MindMapNode {
  id: string;
  content: string;
  children: MindMapNode[];
}

interface MindMapResult {
  markdown: string;
  json: MindMapNode;
}

// Function to convert the structured JSON into a Markdown mind map
function formatJsonToMarkdown(node: MindMapNode, depth = 0): string {
  let markdown = `${'  '.repeat(depth)}- ${node.content}\n`;
  for (const child of node.children) {
    markdown += formatJsonToMarkdown(child, depth + 1);
  }
  return markdown;
}

export async function generateMindMapFromImage(request: MindMapRequest): Promise<MindMapResult> {
  let imagePromptPart = '';
  if (request.imageUrl) {
    // In a real implementation, we would download the image and convert it to base64
    // or use a model that accepts URLs.
    imagePromptPart = `Image is at url: ${request.imageUrl}`;
  } else if (request.imageBase64) {
    // For now, we'll just indicate that base64 data is present
    imagePromptPart = `Image is provided in Base64 format.`;
  } else if (request.prompt) {
    imagePromptPart = `Analyze the concepts from the following text: ${request.prompt}`;
  } else {
    throw new Error('You must provide an image URL, Base64 data, or a text prompt.');
  }

  const prompt = `
    Analyze the provided image or text and identify the central theme, main ideas, and key concepts.
    Organize these into a hierarchical mind map structure.
    The structure should have a single root node.

    ${imagePromptPart}

    Return the result as a raw JSON object with the following structure, and no other text or markdown:
    {
      "id": "root",
      "content": "Central Theme",
      "children": [
        {
          "id": "child1",
          "content": "Main Idea 1",
          "children": [
            { "id": "subchild1", "content": "Sub-concept A", "children": [] }
          ]
        }
      ]
    }
  `;

  // Call the AI Gateway to get the structured data
  // We'll use a provider that supports vision, like Gemini.
  const response = await router.handleQuery({
    query: prompt,
    task: "mind_map",
    // In a real scenario, you'd pass the image data here as part of the context or a specific parameter.
  });

  try {
    const mindMapJson: MindMapNode = JSON.parse(response.text);
    const mindMapMarkdown = formatJsonToMarkdown(mindMapJson);
    return {
      markdown: mindMapMarkdown,
      json: mindMapJson,
    };
  } catch (error) {
    console.error("Failed to parse JSON response from AI:", response.text);
    const errorNode = {
      id: "error",
      content: "Error: Could not generate mind map.",
      children: [],
    };
    return {
      markdown: "- Error: Could not generate mind map.",
      json: errorNode,
    };
  }
}
    markdown: mindMapMarkdown,
    json: mindMapJson,
  };
}
