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
      contents: `Previous messages for context:\n${conversationString}\n\n${dummyName}, write a natural, desi, brief response to the last message. DO NOT just say "ok" or "theek h" unless it's the only logical answer. Be more expressive:`,
      config: {
        systemInstruction,
        temperature: 1.0,
      }
    });

    const text = response.text?.trim() || "";
    if (text.length < 2) return "kya hua?";
    return text;
  } catch (error: any) {
    console.error("Gemini Response Error:", error);
    const fallbacks = ["bolo yaar", "kya scene?", "okk", "ha", "achha thik h", "kya?"];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

export async function generateLobbyChatter(
  usersInRoom: { nickname: string; gender: string }[],
  recentLobbyContext: { senderName: string; content: string }[] = []
): Promise<{ senderName: string; content: string }> {
  if (usersInRoom.length < 1) return { senderName: "User", content: "anybody active?" };
  
  const user = usersInRoom[Math.floor(Math.random() * usersInRoom.length)];
    const systemInstruction = `You are an Indian user in a public chat lobby on ChatBubble.
Produce a single casual message for a public lobby.

Language:
- Mix Desi English (Indian English), Hinglish, and casual Hindi (Latin script).
- Variety is key: Use Indian context (cricket, food, college, office, weather, movies, startups, travel).
- Use local slang: 'kya scene?', 'is this real?', 'bore ho raha hai', 'kya chal rha h public?', 'hello friends', 'any girls?'.
- Tone: Extremely casual, brief, youthful.
- NEVER start with 'kya haal chaal' or 'hello' every time. Be creative and random.
- React to the vibe of previous messages if they exist.
User: ${user.nickname} (${user.gender})`;

  const contextStr = recentLobbyContext.length > 0 
    ? "Recent lobby messages for context (DO NOT REPEAT THESE):\n" + recentLobbyContext.map(m => `${m.senderName}: ${m.content}`).join("\n")
    : "The lobby is quiet, start a conversation or share something random.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${contextStr}\n\nProduce a UNIQUE and conversational message from ${user.nickname} (not too short):`,
      config: {
        systemInstruction,
        temperature: 1.0,
      }
    });

    const text = response.text?.trim() || "";
    if (!text || text.length < 4) {
       const fallbacks = [
         "kya chal rha h public?", 
         "life is so boring today", 
         "is anyone actually active here?", 
         "kya scene h friday ka?", 
         "anyone up for a voice call later?", 
         "aur batao kya chal rha h", 
         "hello ji, whats up with everyone",
         "it is so hot today, even ac is not working",
         "waah kya message h"
       ];
       return { senderName: user.nickname, content: fallbacks[Math.floor(Math.random() * fallbacks.length)] };
    }
    return { senderName: user.nickname, content: text };
  } catch (error: any) {
    console.error("Gemini Lobby Error:", error);
    const fallbacks = ["kya scene?", "anyone from delhi?", "hi guys", "bore ho rha h", "waah", "badhiya"];
    return { senderName: user.nickname, content: fallbacks[Math.floor(Math.random() * fallbacks.length)] };
  }
}
