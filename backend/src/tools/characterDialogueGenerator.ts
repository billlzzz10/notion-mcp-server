import { router } from "../Router.js";

interface CharacterProfile {
  name: string;
  personality: string;
  situation: string;
}

interface DialogueResult {
  dialogue: string;
  emotions: string[];
}

export async function generateCharacterDialogue(profile: CharacterProfile): Promise<DialogueResult> {
  const prompt = `
    Generate a line of dialogue for the following character:
    Name: ${profile.name}
    Personality: ${profile.personality}
    Situation: ${profile.situation}

    The dialogue should be authentic to the character's personality and the situation.
    Also, provide a list of emotions conveyed in the dialogue.
    Respond with ONLY the raw JSON object, without any markdown formatting or commentary.
    The JSON object should have "dialogue" and "emotions" keys.
  `;

  const response = await router.handleQuery({
    query: prompt,
    task: "generate_dialogue", // This could be used by the RuleEngine
  });

  try {
    // The AI's response should be a raw JSON string.
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse JSON response from AI:", response.text);
    // Return a structured error or a default value
    return {
      dialogue: "Error: Could not generate dialogue.",
      emotions: ["error"],
    };
  }
}
