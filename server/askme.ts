import type { Express } from "express";
import OpenAI from "openai";
import { authMiddleware, verifiedMiddleware } from "./auth";
import { storage } from "./storage";

function buildHealthContext(summary: any, docs: any[]): string {
  const sections: string[] = [];

  sections.push("=== USER'S HEALTH PROFILE ===");

  if (summary.conditions?.length > 0) {
    sections.push("\n## Medical Conditions:");
    summary.conditions.forEach((c: any) => {
      sections.push(
        `- ${c.name}${c.status ? ` (${c.status})` : ""}${c.diagnosisDate ? `, diagnosed ${c.diagnosisDate}` : ""}`,
      );
    });
  }

  if (summary.medications?.length > 0) {
    sections.push("\n## Current Medications:");
    summary.medications.forEach((m: any) => {
      sections.push(
        `- ${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? `, ${m.frequency}` : ""}`,
      );
    });
  }

  if (summary.allergies?.length > 0) {
    sections.push("\n## Known Allergies:");
    summary.allergies.forEach((a: any) => {
      sections.push(
        `- ${a.allergen}${a.severity ? ` (${a.severity})` : ""}${a.reactionType ? ` — ${a.reactionType}` : ""}`,
      );
    });
  }

  if (summary.surgeries?.length > 0) {
    sections.push("\n## Surgical History:");
    summary.surgeries.forEach((s: any) => {
      sections.push(
        `- ${s.procedure}${s.date ? ` on ${s.date}` : ""}${s.hospital ? ` at ${s.hospital}` : ""}`,
      );
    });
  }

  if (summary.healthMetrics?.length > 0) {
    sections.push("\n## Vitals & Metrics:");
    summary.healthMetrics.forEach((m: any) => {
      sections.push(
        `- ${m.type.replace(/_/g, " ")}: ${m.value} ${m.unit}`,
      );
    });
  }

  if (summary.socialHistory) {
    const sh = summary.socialHistory;
    sections.push("\n## Social History:");
    if (sh.smokingStatus) sections.push(`- Smoking: ${sh.smokingStatus}`);
    if (sh.alcoholUse) sections.push(`- Alcohol: ${sh.alcoholUse}`);
    if (sh.occupation) sections.push(`- Occupation: ${sh.occupation}`);
    if (sh.exercise) sections.push(`- Exercise: ${sh.exercise}`);
  }

  if (summary.emergencyContacts?.length > 0) {
    sections.push("\n## Emergency Contacts:");
    summary.emergencyContacts.forEach((ec: any) => {
      sections.push(
        `- ${ec.name}${ec.relationship ? ` (${ec.relationship})` : ""}${ec.phone ? ` — ${ec.phone}` : ""}`,
      );
    });
  }

  if (summary.insurance?.length > 0) {
    sections.push("\n## Insurance:");
    summary.insurance.forEach((ins: any) => {
      sections.push(
        `- ${ins.provider}${ins.planType ? ` (${ins.planType})` : ""}${ins.policyNumber ? ` — Policy: ${ins.policyNumber}` : ""}`,
      );
    });
  }

  if (docs.length > 0) {
    sections.push("\n## Uploaded Documents:");
    docs.forEach((d: any) => {
      sections.push(
        `- [Doc #${d.id}] ${d.label || "Untitled"}${d.description ? `: ${d.description}` : ""}`,
      );
      if (d.aiAnalysis) sections.push(`  AI Analysis: ${d.aiAnalysis}`);
    });
  }

  return sections.join("\n");
}

export function registerAskMeRoutes(app: Express) {
  app.post("/api/askme/chat", authMiddleware, verifiedMiddleware, async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res
        .status(503)
        .json({ message: "AI assistant not configured (OPENAI_API_KEY missing)" });
    }

    try {
      const profile = await storage.getProfileByUserId(req.session.userId!);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      const profileId = profile.id;

      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "messages array is required" });
      }

      // Fetch all health data + documents for context
      const [conds, meds, allgs, surgs, social, metrics, emergContacts, ins, docs] =
        await Promise.all([
          storage.getConditionsByProfileId(profileId),
          storage.getMedicationsByProfileId(profileId),
          storage.getAllergiesByProfileId(profileId),
          storage.getSurgeriesByProfileId(profileId),
          storage.getSocialHistoryByProfileId(profileId),
          storage.getHealthMetricsByProfileId(profileId),
          storage.getEmergencyContactsByProfileId(profileId),
          storage.getInsuranceByProfileId(profileId),
          storage.getDocumentsByProfileId(profileId),
        ]);

      const healthContext = buildHealthContext(
        {
          conditions: conds,
          medications: meds,
          allergies: allgs,
          surgeries: surgs,
          socialHistory: social,
          healthMetrics: metrics,
          emergencyContacts: emergContacts,
          insurance: ins,
        },
        docs,
      );

      const systemMessage = `You are Soria, a friendly and knowledgeable health assistant for the Soria Health app. You have access to the user's complete health profile below.

Your role:
- Answer health questions using the user's specific data when relevant
- Help them understand their conditions, medications, and health records
- Reference their uploaded documents and AI analyses when asked
- Be warm, empathetic, and clear — avoid overly clinical language
- Always remind users that you're an AI assistant, not a doctor, and important decisions should involve their healthcare provider
- If asked about something not in their records, be honest that you don't have that information
- Keep responses concise but thorough
- The user's name is ${profile.firstName}

${healthContext}`;

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const openai = new OpenAI({ apiKey });
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemMessage },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
        max_tokens: 1000,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err) {
      console.error("Ask Me error:", err);
      if (!res.headersSent) {
        return res.status(500).json({ message: "Internal server error" });
      }
      res.write(
        `data: ${JSON.stringify({ error: "Something went wrong" })}\n\n`,
      );
      res.end();
    }
  });
}
