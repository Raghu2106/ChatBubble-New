import { GoogleGenAI } from "@google/genai";

// Initialization as per gemini-api skill (Vite section)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateDummyResponse(
  context: { senderName: string; content: string }[],
  dummyName: string,
  dummyGender: string
): Promise<string> {
  const conversationString = context
    .map(msg => `${msg.senderName}: ${msg.content}`)
    .join("\n");

  const systemInstruction = `You are a real user from India on an anonymous chat platform named ChatBubble. 
Your persona: Name is ${dummyName}, Gender is ${dummyGender}.

Language & Tone:
- Use a mix of casual Indian English, Hinglish, and conversational Hindi (written in Latin script).
- Examples: 'bhai', 'yaar', 'kya hal hai', 'aur batao', 'kaise ho?', 'sab badhiya?', 'bolo', 'ha vohi'.
- Use informal grammar, lowercase mostly, abbreviations (u, r, h, okk, lol, idk), and slight typos. Do NOT use expert-level English.
- Keep it very brief (1 sentence max).

Goal: Sound like a common Indian person chatting casually. Tailor your response specifically to what the other person said. 
- If they ask about you, answer simply. 
- If they are being weird, react accordingly (e.g., 'kya?', 'acha?'). 
- If they are friendly, be casual.
- DO NOT be repetitive. Avoid starting every message with the same word.
- NEVER sound like an AI assistant.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Previous messages for context:\n${conversationString}\n\n${dummyName}, write a natural, brief response to the last message:`,
      config: {
        systemInstruction,
        temperature: 1.0,
      }
    });

    return response.text?.trim() || "theek h";
  } catch (error: any) {
    console.error("Gemini Response Error:", error);
    const fallbacks = ["theek h", "okay", "okk", "ha", "achha", "kya?"];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

export async function generateLobbyChatter(
  usersInRoom: { nickname: string; gender: string }[],
  recentLobbyContext: { senderName: string; content: string }[] = []
): Promise<{ senderName: string; content: string }> {
  if (usersInRoom.length < 1) return { senderName: "User", content: "kya haal chaal?" };
  
  const user = usersInRoom[Math.floor(Math.random() * usersInRoom.length)];
  
  const systemInstruction = `You are an Indian user in a public chat lobby on ChatBubble.
Produce a single casual message for a public lobby.

Language:
- Mix Hinglish, Hindi (Latin script), and casual English.
- Use Indian context: cricket, bollywood, food, 'kya ho rha h', 'any girls here?', 'bore ho raha hai'.
- Tone: Extremely casual, brief, youthful.
User: ${user.nickname} (${user.gender})`;

  const contextStr = recentLobbyContext.length > 0 
    ? "Recent lobby messages:\n" + recentLobbyContext.map(m => `${m.senderName}: ${m.content}`).join("\n")
    : "The lobby is quiet, start a conversation or react to the room vibe.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${contextStr}\n\nProduce a message from ${user.nickname}:`,
      config: {
        systemInstruction,
        temperature: 0.9,
      }
    });

    return { senderName: user.nickname, content: response.text?.trim() || "kya haal chaal?" };
  } catch (error: any) {
    console.error("Gemini Lobby Error:", error);
    return { senderName: user.nickname, content: "kya haal chaal?" };
  }
}
