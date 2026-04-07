import type { Express } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import OpenAI from "openai";
import { authMiddleware, verifiedMiddleware } from "./auth";
import { storage } from "./storage";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    cb(null, allowed.includes(file.mimetype));
  },
});

async function analyzeImage(filePath: string, mimeType: string): Promise<{ label: string; description: string; analysis: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      label: "Uploaded Document",
      description: "Document uploaded — AI analysis unavailable (no API key configured)",
      analysis: "",
    };
  }

  try {
    const openai = new OpenAI({ apiKey });
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical document analysis assistant. Analyze the uploaded medical image or document. Provide: 1) A short label (5-8 words max, like 'Left Wrist X-Ray - Fracture' or 'Complete Blood Count Lab Results'), 2) A one-sentence description, 3) A detailed analysis of what you observe. Be factual and clinical. If the image is not medical, still provide a descriptive label.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            },
            {
              type: "text",
              text: "Analyze this medical document or image. Respond in JSON format: { \"label\": \"...\", \"description\": \"...\", \"analysis\": \"...\" }",
            },
          ],
        },
      ],
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return {
        label: parsed.label || "Uploaded Document",
        description: parsed.description || "",
        analysis: parsed.analysis || "",
      };
    }
  } catch (err) {
    console.error("AI analysis error:", err);
  }

  return {
    label: "Uploaded Document",
    description: "Document uploaded — AI analysis failed",
    analysis: "",
  };
}

/** Helper to get profileId from session */
async function getProfileId(req: any, res: any): Promise<number | null> {
  const profile = await storage.getProfileByUserId(req.session.userId!);
  if (!profile) {
    res.status(404).json({ message: "Profile not found" });
    return null;
  }
  return profile.id;
}

export function registerDocumentRoutes(app: Express) {
  // Upload a document
  app.post("/api/documents/upload", authMiddleware, verifiedMiddleware, upload.single("file"), async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Run AI analysis for images
      let label = req.body.label || "Uploaded Document";
      let description = req.body.description || "";
      let aiAnalysis = "";

      if (file.mimetype.startsWith("image/")) {
        const analysis = await analyzeImage(file.path, file.mimetype);
        // Only use AI label/description if user didn't provide their own
        if (!req.body.label) label = analysis.label;
        if (!req.body.description) description = analysis.description;
        aiAnalysis = analysis.analysis;
      }

      const doc = await storage.createDocument({
        profileId,
        recordType: req.body.recordType || null,
        recordId: req.body.recordId ? Number(req.body.recordId) : null,
        label,
        description,
        aiAnalysis,
        fileType: file.mimetype,
        originalName: file.originalname,
        storagePath: file.filename,
      });

      return res.status(201).json(doc);
    } catch (err) {
      console.error("Document upload error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all documents for current user
  app.get("/api/documents", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const docs = await storage.getDocumentsByProfileId(profileId);
      return res.json(docs);
    } catch (err) {
      console.error("Get documents error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single document metadata
  app.get("/api/documents/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const doc = await storage.getDocument(Number(req.params.id));
      if (!doc || doc.profileId !== profileId) {
        return res.status(404).json({ message: "Document not found" });
      }
      return res.json(doc);
    } catch (err) {
      console.error("Get document error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Serve document file
  app.get("/api/documents/:id/file", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const doc = await storage.getDocument(Number(req.params.id));
      if (!doc || doc.profileId !== profileId) {
        return res.status(404).json({ message: "Document not found" });
      }
      const filePath = path.join(UPLOADS_DIR, doc.storagePath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }
      res.setHeader("Content-Type", doc.fileType || "application/octet-stream");
      res.setHeader("Content-Disposition", `inline; filename="${doc.originalName || "document"}"`);
      return res.sendFile(filePath);
    } catch (err) {
      console.error("Serve document error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update document metadata (label, description)
  app.put("/api/documents/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const doc = await storage.getDocument(Number(req.params.id));
      if (!doc || doc.profileId !== profileId) {
        return res.status(404).json({ message: "Document not found" });
      }
      const updated = await storage.updateDocument(doc.id, {
        label: req.body.label ?? doc.label,
        description: req.body.description ?? doc.description,
        recordType: req.body.recordType ?? doc.recordType,
        recordId: req.body.recordId !== undefined ? Number(req.body.recordId) : doc.recordId,
      });
      return res.json(updated);
    } catch (err) {
      console.error("Update document error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const doc = await storage.getDocument(Number(req.params.id));
      if (!doc || doc.profileId !== profileId) {
        return res.status(404).json({ message: "Document not found" });
      }
      // Delete file from disk
      const filePath = path.join(UPLOADS_DIR, doc.storagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await storage.deleteDocument(doc.id);
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("Delete document error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}
