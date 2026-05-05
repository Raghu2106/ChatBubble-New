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
- Use a mix of casual Indian English (Desi English), Hinglish, and conversational Hindi (Latin script).
- Use common Indian English turns of phrase: 'what is your good name?', 'tell me one thing', 'i am just saying', 'actually...'.
- Use slang: 'bhai', 'yaar', 'kya hal hai', 'aur batao', 'scene', 'vibe', 'public'.
- Use informal grammar, lowercase mostly, abbreviations (u, r, h, okk, lol, idk, gm, gn).
- Keep it very brief (1 sentence max).

Goal: Sound like a common Indian person chatting casually. Tailor your response specifically to the context. 
- Avoid being generic. If they share something, react to it naturally.
- DO NOT be repetitive. Avoid starting every message with 'hello' or 'hi'.
- NEVER sound like an AI assistant or a customer service bot.`;

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
- Mix Desi English (Indian English), Hinglish, and casual Hindi (Latin script).
- Variety is key: Use Indian context (cricket, food, college, office, weather, movies).
- Use local slang: 'kya scene?', 'anybody here?', 'bore ho raha hai', 'kya chal rha h public?', 'hi friends'.
- Tone: Extremely casual, brief, youthful.
- NEVER start with 'kya haal chaal' or 'hello' every time. Be creative and random.
- React to the vibe of previous messages if they exist.
User: ${user.nickname} (${user.gender})`;

  const contextStr = recentLobbyContext.length > 0 
    ? "Recent lobby messages for context (DO NOT REPEAT THESE):\n" + recentLobbyContext.map(m => `${m.senderName}: ${m.content}`).join("\n")
    : "The lobby is quiet, start a conversation or react to the room vibe.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${contextStr}\n\nProduce a UNIQUE and casual message from ${user.nickname}:`,
      config: {
        systemInstruction,
        temperature: 1.0,
      }
    });

    const text = response.text?.trim() || "";
    if (!text || text.toLowerCase().includes("kya haal chaal")) {
       const fallbacks = [
         "kya chal rha h?", 
         "bore ho rha h yaar", 
         "is anyone active?", 
         "kya scene?", 
         "any girls from mumbai?", 
         "aur batao public", 
         "hello ji, whats up",
         "anyone for private chat?",
         "it is so hot today na",
         "waah kya baat h"
       ];
       return { senderName: user.nickname, content: fallbacks[Math.floor(Math.random() * fallbacks.length)] };
    }
    return { senderName: user.nickname, content: text };
  } catch (error: any) {
    console.error("Gemini Lobby Error:", error);
    const fallbacks = ["theek h", "hummm", "okk", "kya?", "waah", "badhiya"];
    return { senderName: user.nickname, content: fallbacks[Math.floor(Math.random() * fallbacks.length)] };
  }
}
