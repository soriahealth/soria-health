import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { authMiddleware } from "./auth";
import { premiumMiddleware } from "./billing";
import { storage } from "./storage";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Generate a professional call script using OpenAI, or fall back to a template.
 */
async function generateCallScript(opts: {
  callType: string;
  recipientName: string;
  recipientPhone: string;
  patientName: string;
  medicationName?: string;
  dosage?: string;
  pharmacyName?: string;
}): Promise<string> {
  const { callType, recipientName, patientName, medicationName, dosage, pharmacyName } = opts;

  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional healthcare call script writer. Generate a clear, polite, and professional phone call script for a healthcare-related call. The script should be concise and include appropriate greetings, the purpose of the call, key details, and a polite closing. Format it as a readable script with speaker labels.",
          },
          {
            role: "user",
            content:
              callType === "pharmacy_refill"
                ? `Generate a pharmacy refill call script.\nPatient: ${patientName}\nPharmacy: ${pharmacyName || recipientName}\nMedication: ${medicationName || "N/A"}\nDosage: ${dosage || "N/A"}\nRecipient: ${recipientName}\nCall type: Prescription refill request`
                : `Generate a physician contact call script.\nPatient: ${patientName}\nPhysician: ${recipientName}\nMedication: ${medicationName || "N/A"}\nDosage: ${dosage || "N/A"}\nCall type: Physician contact regarding prescription`,
          },
        ],
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || generateFallbackScript(opts);
    } catch {
      return generateFallbackScript(opts);
    }
  }

  return generateFallbackScript(opts);
}

function generateFallbackScript(opts: {
  callType: string;
  recipientName: string;
  patientName: string;
  medicationName?: string;
  dosage?: string;
  pharmacyName?: string;
}): string {
  const { callType, recipientName, patientName, medicationName, dosage, pharmacyName } = opts;

  if (callType === "pharmacy_refill") {
    return [
      `CALLER: Hello, this is an automated call from Soria Health on behalf of ${patientName}.`,
      ``,
      `CALLER: I'm calling ${pharmacyName || recipientName} to request a prescription refill.`,
      ``,
      medicationName
        ? `CALLER: The medication is ${medicationName}${dosage ? `, ${dosage}` : ""}.`
        : `CALLER: The patient would like to refill their current prescription on file.`,
      ``,
      `CALLER: Could you please process this refill request? The patient can be reached through their Soria Health account for any questions.`,
      ``,
      `CALLER: Thank you for your time. Have a good day.`,
    ].join("\n");
  }

  return [
    `CALLER: Hello, this is an automated call from Soria Health on behalf of ${patientName}.`,
    ``,
    `CALLER: I'm calling to speak with ${recipientName} regarding a prescription matter.`,
    ``,
    medicationName
      ? `CALLER: This is regarding ${medicationName}${dosage ? `, ${dosage}` : ""}.`
      : `CALLER: The patient has a prescription inquiry.`,
    ``,
    `CALLER: Could you please have the doctor's office follow up with the patient through their Soria Health account?`,
    ``,
    `CALLER: Thank you for your time. Have a good day.`,
  ].join("\n");
}

/**
 * Simulate a phone call (MVP mock). Transitions queued -> in_progress -> completed.
 */
function simulateCall(callId: number): void {
  // After 1 second, move to in_progress
  setTimeout(async () => {
    try {
      await storage.updateCallLog(callId, {
        status: "in_progress",
        startedAt: new Date(),
      });
    } catch (err) {
      console.error("Error updating call to in_progress:", err);
    }

    // After another 4 seconds, move to completed with mock transcript
    setTimeout(async () => {
      try {
        const outcomes = [
          "refill_confirmed",
          "left_voicemail",
          "refill_confirmed",
          "refill_confirmed",
        ];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

        const transcripts: Record<string, string> = {
          refill_confirmed:
            "Pharmacy confirmed the refill request. Prescription will be ready for pickup within 2 hours.",
          left_voicemail:
            "Call went to voicemail. Left a detailed message requesting a callback regarding the prescription refill.",
        };

        await storage.updateCallLog(callId, {
          status: "completed",
          endedAt: new Date(),
          duration: 45 + Math.floor(Math.random() * 60),
          outcome,
          transcript:
            transcripts[outcome] ||
            "Call completed successfully. Details have been recorded.",
        });
      } catch (err) {
        console.error("Error updating call to completed:", err);
      }
    }, 4000);
  }, 1000);
}

export function registerCallingRoutes(app: Express): void {
  // ── POST /api/calls/initiate ────────────────────────────────────
  app.post("/api/calls/initiate", authMiddleware, premiumMiddleware("premium"), async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfileByUserId(req.session.userId!);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const {
        refillRequestId,
        callType,
        recipientPhone,
        recipientName,
        medicationName,
        dosage,
        pharmacyName,
      } = req.body;

      if (!callType || !recipientPhone || !recipientName) {
        return res.status(400).json({
          message: "callType, recipientPhone, and recipientName are required",
        });
      }

      if (!["pharmacy_refill", "physician_contact"].includes(callType)) {
        return res.status(400).json({
          message: "callType must be 'pharmacy_refill' or 'physician_contact'",
        });
      }

      const patientName = `${profile.firstName} ${profile.lastName}`;

      // Generate the locked call script
      const scriptContent = await generateCallScript({
        callType,
        recipientName,
        recipientPhone,
        patientName,
        medicationName,
        dosage,
        pharmacyName,
      });

      // Create the call log
      const callLog = await storage.createCallLog({
        profileId: profile.id,
        refillRequestId: refillRequestId || null,
        callType,
        recipientName,
        recipientPhone,
        scriptContent,
        status: "queued",
      });

      // Start mock call simulation
      simulateCall(callLog.id);

      return res.json(callLog);
    } catch (err) {
      console.error("Error initiating call:", err);
      return res.status(500).json({ message: "Failed to initiate call" });
    }
  });

  // ── GET /api/calls ──────────────────────────────────────────────
  app.get("/api/calls", authMiddleware, async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfileByUserId(req.session.userId!);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const calls = await storage.getCallLogsByProfileId(profile.id);
      return res.json(calls);
    } catch (err) {
      console.error("Error fetching calls:", err);
      return res.status(500).json({ message: "Failed to fetch calls" });
    }
  });

  // ── GET /api/calls/:id ─────────────────────────────────────────
  app.get("/api/calls/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const callLog = await storage.getCallLog(Number(req.params.id));
      if (!callLog) {
        return res.status(404).json({ message: "Call not found" });
      }

      return res.json(callLog);
    } catch (err) {
      console.error("Error fetching call:", err);
      return res.status(500).json({ message: "Failed to fetch call" });
    }
  });

  // ── GET /api/calls/:id/script ──────────────────────────────────
  app.get("/api/calls/:id/script", authMiddleware, async (req: Request, res: Response) => {
    try {
      const callLog = await storage.getCallLog(Number(req.params.id));
      if (!callLog) {
        return res.status(404).json({ message: "Call not found" });
      }

      return res.json({ scriptContent: callLog.scriptContent });
    } catch (err) {
      console.error("Error fetching script:", err);
      return res.status(500).json({ message: "Failed to fetch script" });
    }
  });

  // ── POST /api/calls/:id/cancel ─────────────────────────────────
  app.post("/api/calls/:id/cancel", authMiddleware, async (req: Request, res: Response) => {
    try {
      const callLog = await storage.getCallLog(Number(req.params.id));
      if (!callLog) {
        return res.status(404).json({ message: "Call not found" });
      }

      if (callLog.status !== "queued" && callLog.status !== "in_progress") {
        return res.status(400).json({
          message: "Can only cancel queued or in-progress calls",
        });
      }

      const updated = await storage.updateCallLog(callLog.id, {
        status: "cancelled",
        endedAt: new Date(),
        outcome: "cancelled",
      });

      return res.json(updated);
    } catch (err) {
      console.error("Error cancelling call:", err);
      return res.status(500).json({ message: "Failed to cancel call" });
    }
  });
}
