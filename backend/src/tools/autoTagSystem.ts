import { router } from "../Router.js";

interface ContentToTag {
  content: string;
  existingTags?: string[];
  tagOptions?: string[]; // Optional list of possible tags to choose from
}

interface TaggingResult {
  suggestedTags: string[];
  confidence: number;
}

export async function suggestTagsForContent(content: ContentToTag): Promise<TaggingResult> {
  const prompt = `
    Analyze the following content and suggest a list of relevant tags.
    Content: "${content.content}"

    ${content.existingTags ? `Existing Tags: ${content.existingTags.join(', ')}` : ''}
    ${content.tagOptions ? `Only use tags from this list: ${content.tagOptions.join(', ')}` : ''}

    Consider the themes, characters, locations, and plot points in the content.
    Provide a list of suggested tags and a confidence score (0.0 to 1.0).
    Respond with ONLY the raw JSON object, without any markdown formatting or commentary.
    The JSON object should have "suggestedTags" and "confidence" keys.
  `;

  const response = await router.handleQuery({
    query: prompt,
    task: "auto_tag",
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse JSON response from AI:", response.text);
    return {
      suggestedTags: ["error-parsing-response"],
      confidence: 0.0,
    };
  }
}
