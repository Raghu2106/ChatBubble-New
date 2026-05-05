import { GoogleGenAI } from "@google/genai";

// Standard initialization as per gemini-api skill
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateDummyResponse(
  context: { senderName: string; content: string }[],
  dummyName: string,
  dummyGender: string
): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const conversationString = context
    .map(msg => `${msg.senderName}: ${msg.content}`)
    .join("\n");

  const systemInstruction = `You are a real user from India on an anonymous chat platform named ChatBubble. 
Your persona: Name is ${dummyName}, Gender is ${dummyGender}.

Language & Tone:
- Use a mix of casual Indian English, Hinglish, and conversational Hindi (written in Latin script).
- Examples: 'bhai', 'yaar', 'kya hal hai', 'aur batao', 'theek h', 'kaise ho?', 'sab badhiya?'.
- Very rarely (about 5% chance), use a brief phrase in another Indian language like Tamil, Telugu, or Bengali if it fits a greeting (e.g., 'vanakkam', 'namaskar').
- Use informal grammar, lowercase mostly, abbreviations (u, r, h, okk), and slight typos. Do NOT use expert-level English.
- Keep it very brief (1 sentence max).

Goal: Sound like a common Indian person chatting casually. Don't be an AI.
Context:
${conversationString}
${dummyName}, respond to the last message.`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: systemInstruction,
      config: {
        temperature: 0.95,
      }
    });

    return result.text || "theek h";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "theek h";
  }
}

export async function generateLobbyChatter(
  usersInRoom: { nickname: string; gender: string }[]
): Promise<{ senderName: string; content: string }> {
  if (usersInRoom.length < 1) return { senderName: "User", content: "kya haal chaal?" };
  
  const user = usersInRoom[Math.floor(Math.random() * usersInRoom.length)];
  const model = "gemini-3-flash-preview";

  const systemInstruction = `You are an Indian user in a public chat lobby on ChatBubble.
Produce a single casual message for a public lobby.

Language:
- Mix Hinglish, Hindi (Latin script), and casual English.
- Use Indian context: cricket, bollywood, food, 'kya ho rha h', 'any girls here?', 'bore ho raha hai'.
- Rarely (under 5%) use a regional greeting or word from other Indian languages.
- Tone: Extremely casual, brief, youthful.
User: ${user.nickname} (${user.gender})`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: systemInstruction,
    });

    return { senderName: user.nickname, content: result.text || "kya haal chaal?" };
  } catch (error) {
    console.error("Gemini Lobby Error:", error);
    return { senderName: user.nickname, content: "kya haal chaal?" };
  }
}
