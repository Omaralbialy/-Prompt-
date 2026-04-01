import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateContent(prompt: string, systemInstruction?: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are an expert SEO and content strategist. Provide detailed, actionable, and high-quality content.",
        temperature: 0.7,
      },
    });
    return response.text || "No content generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
