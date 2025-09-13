import { aigateway } from '../services/ai-gateway';
import { generateImage } from '../services/imageGenerationService';

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

    Return the result as a JSON object with the following structure:
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
  const jsonResponse = await aigateway.generate(prompt, {
    provider: 'gemini', // Assuming Gemini has vision capabilities
    // In a real scenario, you'd pass the image data here.
  });

  // For now, let's use a mock response, as we can't pass image data yet.
  const mockJsonResponse = {
    id: 'root',
    content: 'The Solar System',
    children: [
      { id: 'sun', content: 'Sun', children: [] },
      {
        id: 'inner_planets',
        content: 'Inner Planets',
        children: [
          { id: 'mercury', content: 'Mercury', children: [] },
          { id: 'venus', content: 'Venus', children: [] },
          { id: 'earth', content: 'Earth', children: [] },
          { id: 'mars', content: 'Mars', children: [] },
        ],
      },
      {
        id: 'outer_planets',
        content: 'Outer Planets',
        children: [
          { id: 'jupiter', content: 'Jupiter', children: [] },
          { id: 'saturn', content: 'Saturn', children: [] },
          { id: 'uranus', content: 'Uranus', children: [] },
          { id: 'neptune', content: 'Neptune', children: [] },
        ],
      },
    ],
  };

  const mindMapJson: MindMapNode = mockJsonResponse; // In a real scenario: JSON.parse(jsonResponse);
  const mindMapMarkdown = formatJsonToMarkdown(mindMapJson);

  return {
    markdown: mindMapMarkdown,
    json: mindMapJson,
  };
}
