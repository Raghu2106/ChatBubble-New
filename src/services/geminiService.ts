import { GoogleGenAI } from "@google/genai";

// Initialization as per gemini-api skill (Vite section)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// AI functionality is currently disabled per user request (Removal of automated recommendations/bots).
// You can re-enable functions here if needed in the future.
