import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const apiKey = process.env.GEMINI_API_KEY;

export const isGeminiConfigured = Boolean(apiKey && apiKey.trim().length > 10);

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey!) : null;

export async function generateGeminiText(
  systemInstruction: string,
  userPrompt: string,
  modelName: string = "gemini-1.5-flash"
): Promise<string> {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });

  const response = await model.generateContent(userPrompt);
  return response.response.text();
}

export async function generateGeminiJSON<T>(
  systemInstruction: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  modelName: string = "gemini-1.5-flash"
): Promise<T> {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: `${systemInstruction}\nYou MUST return valid, raw JSON only. Do not enclose in markdown code fences.`,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const response = await model.generateContent(userPrompt);
  const rawText = response.response.text().trim();
  const cleaned = rawText.replace(/^```json/i, "").replace(/```$/, "").trim();

  const parsed = JSON.parse(cleaned);
  return schema.parse(parsed);
}

export async function generateGeminiEmbedding(text: string): Promise<number[]> {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}
