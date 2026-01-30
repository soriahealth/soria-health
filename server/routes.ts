import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/health-chat", async (req: Request, res: Response) => {
    try {
      const { message, healthContext, history = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const systemPrompt = `You are a helpful health assistant for a family health data management app. You have access to the user's health information and can answer questions about their medical data, conditions, medications, test results, and family medical history.

Here is the patient's current health information:
${healthContext}

Guidelines:
- Provide helpful, accurate information based on the patient's health data
- Always remind users to consult healthcare professionals for medical decisions
- Be empathetic and supportive
- Explain medical terms in simple language
- When discussing family history, mention relevant hereditary risk factors
- Keep responses concise but informative
- Never make diagnoses or prescribe treatments`;

      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user", content: message },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages,
        max_completion_tokens: 1024,
      });

      const assistantMessage = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

      res.json({ response: assistantMessage });
    } catch (error) {
      console.error("Error in health chat:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
