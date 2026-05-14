import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import bcrypt from "bcrypt";
import {
  signupSchema,
  loginSchema,
  profileSetupSchema,
  createConditionSchema,
  createMedicationSchema,
  createAllergySchema,
  createSurgerySchema,
  createSocialHistorySchema,
  createHealthMetricSchema,
  createEmergencyContactSchema,
  createInsuranceSchema,
  healthIntakeSchema,
  createAlertSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  passwordResetTokens,
  verifyEmailSchema,
  emailVerificationCodes,
  profiles,
  alerts,
} from "@shared/schema";
import { eq, and, lt, sql } from "drizzle-orm";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { familyMembers, users } from "@shared/schema";
import { db } from "./db";
import { storage } from "./storage";
import { authMiddleware, verifiedMiddleware } from "./auth";
import { registerDocumentRoutes } from "./documents";
import { registerAskMeRoutes } from "./askme";
import { registerSSORoutes } from "./sso";
import { registerRefillRoutes } from "./refills";
import { registerCallingRoutes } from "./calling";
import { registerBillingRoutes, premiumMiddleware } from "./billing";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import OpenAI from "openai";

/** Convert DD-MM-YYYY (or DDMMYYYY, DD/MM/YYYY) to YYYY-MM-DD for PostgreSQL date columns. */
function toISODate(dateStr: string): string {
  // DD-MM-YYYY or DD/MM/YYYY
  const dashMatch = dateStr.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (dashMatch) {
    return `${dashMatch[3]}-${dashMatch[2]}-${dashMatch[1]}`;
  }
  // DDMMYYYY (8 digits, no separators)
  const rawMatch = dateStr.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (rawMatch) {
    return `${rawMatch[3]}-${rawMatch[2]}-${rawMatch[1]}`;
  }
  // MMDDYYYY fallback — if it already looks like YYYY-MM-DD, pass through
  return dateStr;
}

/** Resolve session → profileId. Returns profileId or sends error response. */
async function getProfileId(req: Request, res: Response): Promise<number | null> {
  const profile = await storage.getProfileByUserId(req.session.userId!);
  if (!profile) {
    res.status(404).json({ message: "Profile not found" });
    return null;
  }
  return profile.id;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Request logger for debugging
  app.use((req, _res, next) => {
    if (req.path.startsWith("/api/")) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  registerDocumentRoutes(app);
  registerAskMeRoutes(app);
  registerSSORoutes(app);
  registerRefillRoutes(app);
  registerCallingRoutes(app);
  registerBillingRoutes(app);

  // ── Auth Routes ─────────────────────────────────────────────

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { firstName, lastName, email, password } = parsed.data;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username: email,
        email,
        password: hashedPassword,
        emailVerified: true,
      });

      const profile = await storage.createProfile({
        userId: user.id,
        firstName,
        lastName,
        profileType: "self",
        onboardingCompleted: false,
      });

      req.session.userId = user.id;

      // Generate auth token for mobile clients
      const authToken = crypto.randomUUID();
      await db.update(users).set({ authToken }).where(eq(users.id, user.id));

      // Generate 6-digit email verification code
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await db.insert(emailVerificationCodes).values({
        userId: user.id,
        code,
        expiresAt,
      });
      console.log(`[DEV] Email verification code for ${email}: ${code}`);
      sendVerificationEmail(email, code).catch((err) => console.error("verification email failed:", err));

      // Create basic subscription for new user
      await storage.createSubscription({
        userId: user.id,
        tier: "basic",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      return res.status(201).json({
        user: { id: user.id, email: user.email, emailVerified: false },
        profile,
        token: authToken,
      });
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { email, password } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;

      // Generate auth token for mobile clients
      const authToken = crypto.randomUUID();
      await db.update(users).set({ authToken }).where(eq(users.id, user.id));

      const profile = await storage.getProfileByUserId(user.id);

      return res.json({
        user: { id: user.id, email: user.email, emailVerified: user.emailVerified },
        profile,
        token: authToken,
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const profile = await storage.getProfileByUserId(user.id);

      return res.json({
        user: { id: user.id, email: user.email, emailVerified: user.emailVerified },
        profile,
      });
    } catch (err) {
      console.error("Auth check error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Forgot / Reset Password ────────────────────────────────

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const user = await storage.getUserByEmail(parsed.data.email);
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ message: "If that email exists, a reset link has been sent." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      // In production, send email with reset link. For dev, log token.
      console.log(`[DEV] Password reset token for ${parsed.data.email}: ${token}`);
      sendPasswordResetEmail(parsed.data.email, token).catch((err) => console.error("reset email failed:", err));

      return res.json({ message: "If that email exists, a reset link has been sent." });
    } catch (err) {
      console.error("Forgot password error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const [tokenRow] = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, parsed.data.token))
        .limit(1);

      if (!tokenRow || tokenRow.used || tokenRow.expiresAt < new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10);

      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, tokenRow.userId));

      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, tokenRow.id));

      return res.json({ message: "Password reset successfully" });
    } catch (err) {
      console.error("Reset password error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Change Password ──────────────────────────────────────

  app.put("/api/auth/change-password", authMiddleware, verifiedMiddleware, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));

      return res.json({ message: "Password changed successfully" });
    } catch (err) {
      console.error("Change password error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Delete Account ──────────────────────────────────────

  app.delete("/api/auth/delete-account", authMiddleware, async (req, res) => {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: "Password confirmation is required" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Password is incorrect" });
      }

      // Delete user — FK cascades handle profiles, records, etc.
      await db.delete(users).where(eq(users.id, user.id));

      // Destroy session
      req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
        res.clearCookie("connect.sid");
        return res.json({ message: "Account deleted" });
      });
    } catch (err) {
      console.error("Delete account error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Email Verification ─────────────────────────────────────

  app.post("/api/auth/verify-email", authMiddleware, async (req, res) => {
    try {
      const parsed = verifyEmailSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const userId = req.session.userId!;

      // Get latest unused code for this user
      const [codeRow] = await db
        .select()
        .from(emailVerificationCodes)
        .where(and(
          eq(emailVerificationCodes.userId, userId),
          eq(emailVerificationCodes.used, false),
        ))
        .orderBy(sql`${emailVerificationCodes.createdAt} DESC`)
        .limit(1);

      if (!codeRow) {
        return res.status(400).json({ message: "No verification code found. Please request a new one." });
      }

      if (codeRow.expiresAt < new Date()) {
        return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
      }

      if (codeRow.attempts >= 3) {
        return res.status(429).json({ message: "Too many attempts. Please wait 10 minutes and request a new code." });
      }

      if (codeRow.code !== parsed.data.code) {
        // Increment attempts
        await db
          .update(emailVerificationCodes)
          .set({ attempts: codeRow.attempts + 1 })
          .where(eq(emailVerificationCodes.id, codeRow.id));

        const remaining = 2 - codeRow.attempts;
        return res.status(400).json({
          message: remaining > 0
            ? `Invalid code. ${remaining + 1} attempt${remaining > 0 ? "s" : ""} remaining.`
            : "Too many failed attempts. Please request a new code.",
        });
      }

      // Mark code as used and verify user
      await db
        .update(emailVerificationCodes)
        .set({ used: true })
        .where(eq(emailVerificationCodes.id, codeRow.id));

      await db
        .update(users)
        .set({ emailVerified: true })
        .where(eq(users.id, userId));

      return res.json({ message: "Email verified successfully" });
    } catch (err) {
      console.error("Email verification error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/resend-verification", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId!;

      // Check for recent code (prevent spam — 30 second cooldown)
      const [recentCode] = await db
        .select()
        .from(emailVerificationCodes)
        .where(eq(emailVerificationCodes.userId, userId))
        .orderBy(sql`${emailVerificationCodes.createdAt} DESC`)
        .limit(1);

      if (recentCode) {
        const elapsed = Date.now() - new Date(recentCode.createdAt).getTime();
        if (elapsed < 30_000) {
          const wait = Math.ceil((30_000 - elapsed) / 1000);
          return res.status(429).json({ message: `Please wait ${wait} seconds before requesting a new code.` });
        }
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await db.insert(emailVerificationCodes).values({
        userId,
        code,
        expiresAt,
      });

      const user = await storage.getUser(userId);
      console.log(`[DEV] Resent verification code for ${user?.email}: ${code}`);
      if (user?.email) {
        sendVerificationEmail(user.email, code).catch((err) => console.error("verification email failed:", err));
      }

      return res.json({ message: "Verification code sent" });
    } catch (err) {
      console.error("Resend verification error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Age Milestone Check ───────────────────────────────────────

  app.get("/api/milestones/check", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      // Get managed profiles
      const managed = await storage.getManagedProfiles(profileId);
      const milestones: Array<{ profileId: number; name: string; age: number }> = [];

      const today = new Date();

      for (const mp of managed) {
        if (!mp.dateOfBirth) continue;
        const dob = new Date(mp.dateOfBirth);
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }

        // Check if turning 21 this year (within 30 days before/after)
        const birthday21 = new Date(dob.getFullYear() + 21, dob.getMonth(), dob.getDate());
        const daysDiff = Math.abs(Math.floor((today.getTime() - birthday21.getTime()) / (1000 * 60 * 60 * 24)));

        if (age === 21 || (age === 20 && daysDiff <= 30)) {
          milestones.push({
            profileId: mp.id,
            name: mp.firstName,
            age: 21,
          });
        }
      }

      // Create alerts for any milestones not already alerted
      for (const m of milestones) {
        // Check if we already created this alert
        const existing = await db
          .select()
          .from(alerts)
          .where(and(
            eq(alerts.profileId, profileId),
            eq(alerts.relatedType, "age_milestone"),
            eq(alerts.relatedId, m.profileId),
          ))
          .limit(1);

        if (existing.length === 0) {
          await storage.createAlert({
            profileId,
            type: "system",
            title: `${m.name} is turning 21!`,
            message: `${m.name} is turning 21. Consider inviting them to create their own Soria account so they can manage their health records independently.`,
            relatedType: "age_milestone",
            relatedId: m.profileId,
            isRead: false,
            isDismissed: false,
          });
        }
      }

      return res.json({ milestones });
    } catch (err) {
      console.error("Milestone check error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Insurance Card Scan ─────────────────────────────────────

  const insuranceCardUpload = multer({
    storage: multer.diskStorage({
      destination: path.join(process.cwd(), "uploads"),
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, "insurance-" + uniqueSuffix + ext);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      cb(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype));
    },
  });

  app.post(
    "/api/insurance/scan",
    authMiddleware,
    insuranceCardUpload.fields([
      { name: "front", maxCount: 1 },
      { name: "back", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        if (!files || !files.front || files.front.length === 0) {
          return res.status(400).json({ message: "Front of insurance card is required" });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          // Clean up uploaded files
          for (const key of Object.keys(files)) {
            for (const f of files[key]) {
              fs.unlinkSync(f.path);
            }
          }
          return res.json({
            provider: "",
            policyNumber: "",
            groupNumber: "",
            planType: "",
            subscriberName: "",
            message: "AI analysis unavailable — no API key configured. Please enter details manually.",
          });
        }

        const openai = new OpenAI({ apiKey });

        // Build image messages for front (and optionally back)
        const imageMessages: any[] = [];

        const frontBuffer = fs.readFileSync(files.front[0].path);
        const frontBase64 = frontBuffer.toString("base64");
        imageMessages.push({
          type: "image_url",
          image_url: { url: `data:${files.front[0].mimetype};base64,${frontBase64}`, detail: "high" },
        });

        if (files.back && files.back.length > 0) {
          const backBuffer = fs.readFileSync(files.back[0].path);
          const backBase64 = backBuffer.toString("base64");
          imageMessages.push({
            type: "image_url",
            image_url: { url: `data:${files.back[0].mimetype};base64,${backBase64}`, detail: "high" },
          });
        }

        imageMessages.push({
          type: "text",
          text: `Extract the insurance information from this insurance card image(s). The first image is the front of the card${files.back ? ", and the second image is the back" : ""}.
Extract and return a JSON object with these fields:
- "provider": the insurance company name (e.g. "Blue Cross Blue Shield", "Aetna", "UnitedHealthcare")
- "policyNumber": the member ID or policy number
- "groupNumber": the group number (if visible)
- "planType": the plan type — must be one of "PPO", "HMO", "EPO", "POS", "HDHP", or "Other"
- "subscriberName": the subscriber/member name on the card

If a field is not visible or cannot be determined, use an empty string for that field. Respond ONLY with valid JSON.`,
        });

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an insurance card data extraction assistant. Extract structured data from insurance card images accurately. Always respond with valid JSON.",
            },
            {
              role: "user",
              content: imageMessages,
            },
          ],
          max_tokens: 300,
          response_format: { type: "json_object" },
        });

        // Clean up uploaded files
        for (const key of Object.keys(files)) {
          for (const f of files[key]) {
            fs.unlinkSync(f.path);
          }
        }

        const content = response.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return res.json({
            provider: parsed.provider || "",
            policyNumber: parsed.policyNumber || "",
            groupNumber: parsed.groupNumber || "",
            planType: parsed.planType || "",
            subscriberName: parsed.subscriberName || "",
          });
        }

        return res.json({
          provider: "",
          policyNumber: "",
          groupNumber: "",
          planType: "",
          subscriberName: "",
          message: "Could not extract information from the card image.",
        });
      } catch (err) {
        console.error("Insurance scan error:", err);
        return res.status(500).json({ message: "Failed to analyze insurance card" });
      }
    }
  );

  // ── Consent ──────────────────────────────────────────────────

  app.post("/api/auth/consent", authMiddleware, async (req, res) => {
    try {
      const profile = await storage.getProfileByUserId(req.session.userId!);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      await storage.updateProfile(profile.id, {
        consentAcceptedAt: new Date(),
      });

      return res.json({ message: "Consent recorded" });
    } catch (err) {
      console.error("Consent error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Role Selection ───────────────────────────────────────────

  app.put("/api/profile/role", authMiddleware, async (req, res) => {
    try {
      const { role } = req.body;
      if (!role || typeof role !== "string") {
        return res.status(400).json({ message: "Role is required" });
      }

      const profile = await storage.getProfileByUserId(req.session.userId!);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const updated = await storage.updateProfile(profile.id, { role });
      return res.json(updated);
    } catch (err) {
      console.error("Role update error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Profile Routes ──────────────────────────────────────────

  app.put("/api/profile/setup", authMiddleware, verifiedMiddleware, async (req, res) => {
    try {
      const parsed = profileSetupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const profile = await storage.getProfileByUserId(req.session.userId!);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      if (!profile.consentAcceptedAt) {
        return res.status(403).json({ message: "Consent required before profile setup" });
      }

      const updated = await storage.updateProfile(profile.id, {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        dateOfBirth: toISODate(parsed.data.dateOfBirth),
        biologicalSex: parsed.data.biologicalSex,
        onboardingCompleted: true,
      });

      return res.json(updated);
    } catch (err: any) {
      console.error("Profile setup error:", err?.message, err?.stack);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/profile", authMiddleware, async (req, res) => {
    try {
      const profile = await storage.getProfileByUserId(req.session.userId!);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      return res.json(profile);
    } catch (err) {
      console.error("Get profile error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Profile photo upload
  const photoDir = path.join(process.cwd(), "uploads", "photos");
  if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });

  const photoUpload = multer({
    storage: multer.diskStorage({
      destination: photoDir,
      filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) cb(null, true);
      else cb(new Error("Only image files allowed"));
    },
  });

  app.post("/api/profile/photo", authMiddleware, photoUpload.single("photo"), async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      if (!req.file) return res.status(400).json({ message: "No photo provided" });

      const photoUrl = `/api/profile/photo/${req.file.filename}`;
      await storage.updateProfile(profileId, { profilePhotoUrl: photoUrl } as any);

      return res.json({ photoUrl });
    } catch (err: any) {
      console.error("Photo upload error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/profile/photo/:filename", (req, res) => {
    const filePath = path.join(photoDir, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Not found" });
    return res.sendFile(filePath);
  });

  // ── Health Data: Bulk Intake ────────────────────────────────

  app.post("/api/health/intake", authMiddleware, verifiedMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      const parsed = healthIntakeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const data = parsed.data;

      if (data.healthMetrics) {
        for (const m of data.healthMetrics) {
          await storage.createHealthMetric({ ...m, profileId });
        }
      }
      if (data.conditions) {
        for (const c of data.conditions) {
          await storage.createCondition({ ...c, diagnosisDate: c.diagnosisDate ? toISODate(c.diagnosisDate) : undefined, profileId });
        }
      }
      if (data.medications) {
        for (const m of data.medications) {
          await storage.createMedication({ ...m, profileId });
        }
      }
      if (data.allergies) {
        for (const a of data.allergies) {
          await storage.createAllergy({ ...a, profileId });
        }
      }
      if (data.surgeries) {
        for (const s of data.surgeries) {
          await storage.createSurgery({ ...s, date: s.date ? toISODate(s.date) : undefined, profileId });
        }
      }
      if (data.socialHistory) {
        await storage.upsertSocialHistory({ ...data.socialHistory, profileId });
      }
      if (data.emergencyContacts) {
        for (const ec of data.emergencyContacts) {
          await storage.upsertEmergencyContact({ ...ec, profileId });
        }
      }
      if (data.insurance) {
        for (const ins of data.insurance) {
          await storage.upsertInsurance({ ...ins, profileId });
        }
      }

      // Auto-generate welcome alert
      await storage.createAlert({
        profileId,
        type: "system",
        title: "Health Profile Created",
        message: "Your health profile has been saved. You can update it anytime from your profile.",
        isRead: false,
        isDismissed: false,
      });

      // Generate medication reminders for each medication
      if (data.medications) {
        for (const m of data.medications) {
          await storage.createAlert({
            profileId,
            type: "medication_reminder",
            title: `Medication: ${m.name}`,
            message: `Remember to take ${m.name}${m.dosage ? ` (${m.dosage})` : ""}${m.frequency ? ` - ${m.frequency}` : ""}`,
            isRead: false,
            isDismissed: false,
            relatedType: "medication",
          });
        }
      }

      return res.status(201).json({ message: "Health intake saved" });
    } catch (err: any) {
      console.error("Health intake error:", err?.message, err?.stack);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Health Data: Summary ────────────────────────────────────

  app.get("/api/health/summary", authMiddleware, verifiedMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      const [conds, meds, allgs, surgs, social, metrics, emergContacts, ins] = await Promise.all([
        storage.getConditionsByProfileId(profileId),
        storage.getMedicationsByProfileId(profileId),
        storage.getAllergiesByProfileId(profileId),
        storage.getSurgeriesByProfileId(profileId),
        storage.getSocialHistoryByProfileId(profileId),
        storage.getHealthMetricsByProfileId(profileId),
        storage.getEmergencyContactsByProfileId(profileId),
        storage.getInsuranceByProfileId(profileId),
      ]);

      return res.json({
        conditions: conds,
        medications: meds,
        allergies: allgs,
        surgeries: surgs,
        socialHistory: social || null,
        healthMetrics: metrics,
        emergencyContacts: emergContacts,
        insurance: ins,
      });
    } catch (err) {
      console.error("Health summary error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Health Data: Conditions CRUD ────────────────────────────

  app.get("/api/health/conditions", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      return res.json(await storage.getConditionsByProfileId(profileId));
    } catch (err) {
      console.error("Get conditions error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/health/conditions", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const parsed = createConditionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const condData = { ...parsed.data, profileId, diagnosisDate: parsed.data.diagnosisDate ? toISODate(parsed.data.diagnosisDate) : undefined };
      const created = await storage.createCondition(condData);
      return res.status(201).json(created);
    } catch (err) {
      console.error("Create condition error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/health/conditions/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getCondition(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Condition not found" });
      }
      const parsed = createConditionSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const updated = await storage.updateCondition(id, parsed.data);
      return res.json(updated);
    } catch (err) {
      console.error("Update condition error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/health/conditions/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getCondition(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Condition not found" });
      }
      await storage.deleteCondition(id);
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("Delete condition error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Health Data: Medications CRUD ───────────────────────────

  app.get("/api/health/medications", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      return res.json(await storage.getMedicationsByProfileId(profileId));
    } catch (err) {
      console.error("Get medications error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/health/medications", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const parsed = createMedicationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const created = await storage.createMedication({ ...parsed.data, profileId });
      return res.status(201).json(created);
    } catch (err) {
      console.error("Create medication error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/health/medications/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getMedication(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Medication not found" });
      }
      const parsed = createMedicationSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const updated = await storage.updateMedication(id, parsed.data);
      return res.json(updated);
    } catch (err) {
      console.error("Update medication error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/health/medications/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getMedication(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Medication not found" });
      }
      await storage.deleteMedication(id);
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("Delete medication error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Health Data: Allergies CRUD ─────────────────────────────

  app.get("/api/health/allergies", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      return res.json(await storage.getAllergiesByProfileId(profileId));
    } catch (err) {
      console.error("Get allergies error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/health/allergies", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const parsed = createAllergySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const created = await storage.createAllergy({ ...parsed.data, profileId });
      return res.status(201).json(created);
    } catch (err) {
      console.error("Create allergy error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/health/allergies/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getAllergy(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Allergy not found" });
      }
      const parsed = createAllergySchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const updated = await storage.updateAllergy(id, parsed.data);
      return res.json(updated);
    } catch (err) {
      console.error("Update allergy error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/health/allergies/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getAllergy(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Allergy not found" });
      }
      await storage.deleteAllergy(id);
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("Delete allergy error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Health Data: Surgeries CRUD ─────────────────────────────

  app.get("/api/health/surgeries", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      return res.json(await storage.getSurgeriesByProfileId(profileId));
    } catch (err) {
      console.error("Get surgeries error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/health/surgeries", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const parsed = createSurgerySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const surgData = { ...parsed.data, profileId, date: parsed.data.date ? toISODate(parsed.data.date) : undefined };
      const created = await storage.createSurgery(surgData);
      return res.status(201).json(created);
    } catch (err) {
      console.error("Create surgery error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/health/surgeries/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getSurgery(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Surgery not found" });
      }
      const parsed = createSurgerySchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const updated = await storage.updateSurgery(id, parsed.data);
      return res.json(updated);
    } catch (err) {
      console.error("Update surgery error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/health/surgeries/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getSurgery(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Surgery not found" });
      }
      await storage.deleteSurgery(id);
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("Delete surgery error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Health Data: Metrics CRUD ───────────────────────────────

  app.get("/api/health/metrics", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      return res.json(await storage.getHealthMetricsByProfileId(profileId));
    } catch (err) {
      console.error("Get metrics error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/health/metrics", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const parsed = createHealthMetricSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const created = await storage.createHealthMetric({ ...parsed.data, profileId });
      return res.status(201).json(created);
    } catch (err) {
      console.error("Create metric error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/health/metrics/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getHealthMetric(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Metric not found" });
      }
      const parsed = createHealthMetricSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const updated = await storage.updateHealthMetric(id, parsed.data);
      return res.json(updated);
    } catch (err) {
      console.error("Update metric error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/health/metrics/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getHealthMetric(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Metric not found" });
      }
      await storage.deleteHealthMetric(id);
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("Delete metric error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Health Data: Social History ─────────────────────────────

  app.get("/api/health/social-history", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const record = await storage.getSocialHistoryByProfileId(profileId);
      return res.json(record || null);
    } catch (err) {
      console.error("Get social history error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/health/social-history", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const parsed = createSocialHistorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const record = await storage.upsertSocialHistory({ ...parsed.data, profileId });
      return res.json(record);
    } catch (err) {
      console.error("Upsert social history error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Health Data: Emergency Contacts ─────────────────────────
  app.get("/api/health/emergency-contacts", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      return res.json(await storage.getEmergencyContactsByProfileId(profileId));
    } catch (err) {
      console.error("Get emergency contacts error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/health/emergency-contacts", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const parsed = createEmergencyContactSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const record = await storage.upsertEmergencyContact({ ...parsed.data, profileId });
      return res.json(record);
    } catch (err) {
      console.error("Upsert emergency contact error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Health Data: Insurance ──────────────────────────────────
  app.get("/api/health/insurance", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      return res.json(await storage.getInsuranceByProfileId(profileId));
    } catch (err) {
      console.error("Get insurance error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/health/insurance", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const parsed = createInsuranceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const record = await storage.upsertInsurance({ ...parsed.data, profileId });
      return res.json(record);
    } catch (err) {
      console.error("Upsert insurance error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Family Members ──────────────────────────────────────────
  app.get("/api/family", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const members = await storage.getFamilyMembersByProfileId(profileId);
      // For each member, fetch their profile
      const enriched = await Promise.all(
        members.map(async (m) => {
          const profile = await storage.getProfile(m.relatedProfileId);
          return { ...m, profile };
        })
      );
      return res.json(enriched);
    } catch (err) {
      console.error("Get family error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get managed profiles (children, parents without accounts)
  app.get("/api/family/managed", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      return res.json(await storage.getManagedProfiles(profileId));
    } catch (err) {
      console.error("Get managed profiles error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add a managed family member
  app.post("/api/family/add", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      const { firstName, lastName, dateOfBirth, biologicalSex, relationship, profileType, isDeceased } = req.body;
      if (!firstName || !lastName || !relationship) {
        return res.status(400).json({ message: "First name, last name, and relationship are required" });
      }

      // Create a managed profile (no userId — managed by current user)
      const newProfile = await storage.createProfile({
        userId: null,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? toISODate(dateOfBirth) : null,
        biologicalSex: biologicalSex || null,
        profileType: profileType || "managed",
        isDeceased: isDeceased || false,
        managedById: profileId,
        onboardingCompleted: false,
      });

      // Create family member link
      const link = await storage.createFamilyMember({
        profileId,
        relatedProfileId: newProfile.id,
        relationship,
        status: "active",
      });

      return res.status(201).json({ profile: newProfile, familyMember: link });
    } catch (err) {
      console.error("Add family member error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit health intake for a managed profile
  app.post("/api/family/:profileId/intake", authMiddleware, async (req, res) => {
    try {
      const myProfileId = await getProfileId(req, res);
      if (!myProfileId) return;

      const targetProfileId = Number(req.params.profileId);
      const targetProfile = await storage.getProfile(targetProfileId);
      if (!targetProfile || targetProfile.managedById !== myProfileId) {
        return res.status(403).json({ message: "Not authorized to manage this profile" });
      }

      // Handle post-mortem fields (causeOfDeath, dateOfDeath) outside schema validation
      const { causeOfDeath, dateOfDeath, ...intakeData } = req.body;

      if (causeOfDeath || dateOfDeath) {
        await storage.updateProfile(targetProfileId, {
          causeOfDeath: causeOfDeath || null,
          dateOfDeath: dateOfDeath || null,
        });
      }

      const parsed = healthIntakeSchema.safeParse(intakeData);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const data = parsed.data;
      if (data.healthMetrics) {
        for (const m of data.healthMetrics) await storage.createHealthMetric({ ...m, profileId: targetProfileId });
      }
      if (data.conditions) {
        for (const c of data.conditions) await storage.createCondition({ ...c, diagnosisDate: c.diagnosisDate ? toISODate(c.diagnosisDate) : undefined, profileId: targetProfileId });
      }
      if (data.medications) {
        for (const m of data.medications) await storage.createMedication({ ...m, profileId: targetProfileId });
      }
      if (data.allergies) {
        for (const a of data.allergies) await storage.createAllergy({ ...a, profileId: targetProfileId });
      }
      if (data.surgeries) {
        for (const s of data.surgeries) await storage.createSurgery({ ...s, date: s.date ? toISODate(s.date) : undefined, profileId: targetProfileId });
      }
      if (data.socialHistory) {
        await storage.upsertSocialHistory({ ...data.socialHistory, profileId: targetProfileId });
      }
      if (data.emergencyContacts) {
        for (const ec of data.emergencyContacts) await storage.upsertEmergencyContact({ ...ec, profileId: targetProfileId });
      }
      if (data.insurance) {
        for (const ins of data.insurance) await storage.upsertInsurance({ ...ins, profileId: targetProfileId });
      }

      await storage.updateProfile(targetProfileId, { onboardingCompleted: true });

      return res.status(201).json({ message: "Family member health intake saved" });
    } catch (err) {
      console.error("Family intake error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Connection Requests ─────────────────────────────────────

  // Send a connection request
  app.post("/api/connections/request", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      const { email, relationship } = req.body;
      if (!email || !relationship) {
        return res.status(400).json({ message: "Email and relationship are required" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (user?.email === email) {
        return res.status(400).json({ message: "You cannot send a request to yourself" });
      }

      // Check if target user exists
      const targetUser = await storage.getUserByEmail(email);
      let toProfileId = null;
      if (targetUser) {
        const targetProfile = await storage.getProfileByUserId(targetUser.id);
        toProfileId = targetProfile?.id || null;
      }

      // Set expiry to 14 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);

      const request = await storage.createConnectionRequest({
        fromProfileId: profileId,
        toEmail: email,
        toProfileId,
        relationship,
        status: "pending",
        expiresAt,
      });

      return res.status(201).json(request);
    } catch (err: any) {
      console.error("Send connection request error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get outgoing connection requests
  app.get("/api/connections/outgoing", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const requests = await storage.getConnectionRequestsByProfileId(profileId);
      return res.json(requests);
    } catch (err: any) {
      console.error("Get outgoing requests error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get incoming connection requests
  app.get("/api/connections/incoming", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(404).json({ message: "User not found" });
      const requests = await storage.getIncomingConnectionRequests(user.email);
      // Enrich with sender profile info
      const enriched = await Promise.all(
        requests.map(async (r) => {
          const profile = await storage.getProfile(r.fromProfileId);
          return { ...r, fromProfile: profile };
        })
      );
      return res.json(enriched);
    } catch (err: any) {
      console.error("Get incoming requests error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Accept a connection request
  app.post("/api/connections/:id/accept", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      const request = await storage.getConnectionRequest(Number(req.params.id));
      if (!request || request.status !== "pending") {
        return res.status(404).json({ message: "Request not found or already handled" });
      }

      // Verify this request is for the current user
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.email !== request.toEmail) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Check expiry
      if (new Date() > new Date(request.expiresAt)) {
        await storage.updateConnectionRequest(request.id, { status: "expired" });
        return res.status(410).json({ message: "This request has expired" });
      }

      // Create bidirectional family member links
      await storage.createFamilyMember({
        profileId: request.fromProfileId,
        relatedProfileId: profileId,
        relationship: request.relationship,
        status: "active",
      });
      await storage.createFamilyMember({
        profileId: profileId,
        relatedProfileId: request.fromProfileId,
        relationship: request.relationship,
        status: "active",
      });

      // Sharing preferences are required when accepting
      const { sharingPreferences: prefs } = req.body || {};
      if (!prefs) {
        return res.status(400).json({ message: "Sharing preferences are required when accepting a connection" });
      }

      // Save what the acceptor shares with the sender
      await storage.upsertSharingPreference({
        profileId: profileId,
        connectedProfileId: request.fromProfileId,
        shareConditions: prefs.shareConditions ?? true,
        shareMedications: prefs.shareMedications ?? true,
        shareAllergies: prefs.shareAllergies ?? true,
        shareSurgeries: prefs.shareSurgeries ?? true,
        shareMetrics: prefs.shareMetrics ?? true,
        shareSocialHistory: prefs.shareSocialHistory ?? false,
        shareDocuments: prefs.shareDocuments ?? false,
      });

      // Save default prefs for the reverse direction (sender → acceptor)
      await storage.upsertSharingPreference({
        profileId: request.fromProfileId,
        connectedProfileId: profileId,
        shareConditions: true,
        shareMedications: true,
        shareAllergies: true,
        shareSurgeries: true,
        shareMetrics: true,
        shareSocialHistory: false,
        shareDocuments: false,
      });

      // Update request status
      await storage.updateConnectionRequest(request.id, { status: "accepted", toProfileId: profileId });

      return res.json({ message: "Connection accepted" });
    } catch (err: any) {
      console.error("Accept connection error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Decline a connection request
  app.post("/api/connections/:id/decline", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(404).json({ message: "User not found" });

      const request = await storage.getConnectionRequest(Number(req.params.id));
      if (!request || request.status !== "pending") {
        return res.status(404).json({ message: "Request not found or already handled" });
      }
      if (user.email !== request.toEmail) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.updateConnectionRequest(request.id, { status: "declined" });
      return res.json({ message: "Connection declined" });
    } catch (err: any) {
      console.error("Decline connection error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Cancel an outgoing request
  app.delete("/api/connections/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      const request = await storage.getConnectionRequest(Number(req.params.id));
      if (!request || request.fromProfileId !== profileId) {
        return res.status(404).json({ message: "Request not found" });
      }

      await storage.deleteConnectionRequest(request.id);
      return res.json({ message: "Request cancelled" });
    } catch (err: any) {
      console.error("Cancel connection error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Disconnect from a connected member
  app.delete("/api/family/:memberId/disconnect", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      const memberId = Number(req.params.memberId);
      // Delete both directions of the family link
      const members = await storage.getFamilyMembersByProfileId(profileId);
      const link = members.find((m: any) => m.id === memberId);
      if (!link) {
        return res.status(404).json({ message: "Connection not found" });
      }

      // Delete the forward link
      await storage.deleteFamilyMember(link.id);

      // Delete the reverse link
      const reverseMembers = await storage.getFamilyMembersByProfileId(link.relatedProfileId);
      const reverseLink = reverseMembers.find((m: any) => m.relatedProfileId === profileId);
      if (reverseLink) {
        await storage.deleteFamilyMember(reverseLink.id);
      }

      return res.json({ message: "Disconnected" });
    } catch (err: any) {
      console.error("Disconnect error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Alerts & Notifications ──────────────────────────────────

  app.get("/api/alerts", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const alertsList = await storage.getAlertsByProfileId(profileId);
      return res.json(alertsList);
    } catch (err: any) {
      console.error("Get alerts error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/alerts/unread-count", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const count = await storage.getUnreadAlertCount(profileId);
      return res.json({ count });
    } catch (err: any) {
      console.error("Get unread count error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/alerts", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const parsed = createAlertSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const alert = await storage.createAlert({
        ...parsed.data,
        profileId,
        scheduledFor: parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : undefined,
      });
      return res.status(201).json(alert);
    } catch (err: any) {
      console.error("Create alert error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/alerts/:id/read", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const alert = await storage.markAlertRead(Number(req.params.id));
      if (!alert || alert.profileId !== profileId) {
        return res.status(404).json({ message: "Alert not found" });
      }
      return res.json(alert);
    } catch (err: any) {
      console.error("Mark alert read error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/alerts/:id/dismiss", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const alert = await storage.markAlertDismissed(Number(req.params.id));
      if (!alert || alert.profileId !== profileId) {
        return res.status(404).json({ message: "Alert not found" });
      }
      return res.json(alert);
    } catch (err: any) {
      console.error("Dismiss alert error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/alerts/read-all", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      await storage.markAllAlertsRead(profileId);
      return res.json({ message: "All alerts marked as read" });
    } catch (err: any) {
      console.error("Mark all read error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Sharing Preferences ────────────────────────────────────────

  // Get sharing preferences for a connected member
  app.get("/api/sharing/:connectedProfileId", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const connectedId = Number(req.params.connectedProfileId);
      const pref = await storage.getSharingPreference(profileId, connectedId);
      if (!pref) {
        // Return defaults
        return res.json({
          shareConditions: true,
          shareMedications: true,
          shareAllergies: true,
          shareSurgeries: true,
          shareMetrics: true,
          shareSocialHistory: false,
          shareDocuments: false,
        });
      }
      return res.json(pref);
    } catch (err: any) {
      console.error("Get sharing prefs error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update sharing preferences for a connected member
  app.put("/api/sharing/:connectedProfileId", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const connectedId = Number(req.params.connectedProfileId);
      const pref = await storage.upsertSharingPreference({
        profileId,
        connectedProfileId: connectedId,
        shareConditions: req.body.shareConditions ?? true,
        shareMedications: req.body.shareMedications ?? true,
        shareAllergies: req.body.shareAllergies ?? true,
        shareSurgeries: req.body.shareSurgeries ?? true,
        shareMetrics: req.body.shareMetrics ?? true,
        shareSocialHistory: req.body.shareSocialHistory ?? false,
        shareDocuments: req.body.shareDocuments ?? false,
      });
      return res.json(pref);
    } catch (err: any) {
      console.error("Update sharing prefs error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Household Manager Admin ────────────────────────────────────

  // Get all household profiles (self + managed + connected) with completion stats
  app.get("/api/household/profiles", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const selfProfile = await storage.getProfile(profileId);
      if (!selfProfile) return res.status(404).json({ message: "Profile not found" });

      // Helper: calculate completion percent
      async function completionPercent(pid: number): Promise<number> {
        let filled = 0;
        const total = 8; // conditions, meds, allergies, surgeries, metrics, social, emergency, insurance
        const [conds, meds, allrgs, surgs, metrics, social, ecs, ins] = await Promise.all([
          storage.getConditionsByProfileId(pid),
          storage.getMedicationsByProfileId(pid),
          storage.getAllergiesByProfileId(pid),
          storage.getSurgeriesByProfileId(pid),
          storage.getHealthMetricsByProfileId(pid),
          storage.getSocialHistoryByProfileId(pid),
          storage.getEmergencyContactsByProfileId(pid),
          storage.getInsuranceByProfileId(pid),
        ]);
        if (conds.length > 0) filled++;
        if (meds.length > 0) filled++;
        if (allrgs.length > 0) filled++;
        if (surgs.length > 0) filled++;
        if (metrics.length > 0) filled++;
        if (social) filled++;
        if (ecs.length > 0) filled++;
        if (ins.length > 0) filled++;
        return Math.round((filled / total) * 100);
      }

      async function recordCounts(pid: number) {
        const [conds, meds, allrgs, surgs, metrics, docs] = await Promise.all([
          storage.getConditionsByProfileId(pid),
          storage.getMedicationsByProfileId(pid),
          storage.getAllergiesByProfileId(pid),
          storage.getSurgeriesByProfileId(pid),
          storage.getHealthMetricsByProfileId(pid),
          storage.getDocumentsByProfileId(pid),
        ]);
        return {
          conditions: conds.length,
          medications: meds.length,
          allergies: allrgs.length,
          surgeries: surgs.length,
          metrics: metrics.length,
          documents: docs.length,
        };
      }

      // Self
      const selfCompletion = await completionPercent(profileId);
      const selfCounts = await recordCounts(profileId);

      // Managed profiles
      const managed = await storage.getManagedProfiles(profileId);
      const managedEnriched = await Promise.all(
        managed.map(async (mp) => {
          // Find the family link to get relationship
          const links = await storage.getFamilyMembersByProfileId(profileId);
          const link = links.find((l: any) => l.relatedProfileId === mp.id);
          return {
            ...mp,
            relationship: link?.relationship ?? "Family",
            completionPercent: await completionPercent(mp.id),
            recordCounts: await recordCounts(mp.id),
          };
        })
      );

      // Connected profiles (non-managed family links)
      const allLinks = await storage.getFamilyMembersByProfileId(profileId);
      const connectedLinks = allLinks.filter(
        (l: any) => !managed.some((mp) => mp.id === l.relatedProfileId)
      );
      const connected = await Promise.all(
        connectedLinks.map(async (link: any) => {
          const profile = await storage.getProfile(link.relatedProfileId);
          if (!profile) return null;
          return {
            ...profile,
            relationship: link.relationship,
            completionPercent: 0, // Can't see connected profile's completion
            recordCounts: { conditions: 0, medications: 0, allergies: 0, surgeries: 0, metrics: 0, documents: 0 },
          };
        })
      );

      return res.json({
        self: {
          ...selfProfile,
          relationship: "Self",
          completionPercent: selfCompletion,
          recordCounts: selfCounts,
        },
        managed: managedEnriched,
        connected: connected.filter(Boolean),
      });
    } catch (err: any) {
      console.error("Household profiles error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get details for a managed profile (for editing)
  app.get("/api/family/:profileId/details", authMiddleware, async (req, res) => {
    try {
      const myProfileId = await getProfileId(req, res);
      if (!myProfileId) return;

      const targetId = Number(req.params.profileId);
      const target = await storage.getProfile(targetId);
      if (!target || target.managedById !== myProfileId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Get relationship from family link
      const links = await storage.getFamilyMembersByProfileId(myProfileId);
      const link = links.find((l: any) => l.relatedProfileId === targetId);

      return res.json({
        ...target,
        relationship: link?.relationship ?? "",
      });
    } catch (err: any) {
      console.error("Get managed profile details error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Edit a managed profile
  app.put("/api/family/:profileId/edit", authMiddleware, async (req, res) => {
    try {
      const myProfileId = await getProfileId(req, res);
      if (!myProfileId) return;

      const targetId = Number(req.params.profileId);
      const target = await storage.getProfile(targetId);
      if (!target || target.managedById !== myProfileId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const { firstName, lastName, dateOfBirth, biologicalSex, relationship } = req.body;
      const profileUpdate: any = {};
      if (firstName) profileUpdate.firstName = firstName;
      if (lastName) profileUpdate.lastName = lastName;
      if (dateOfBirth) profileUpdate.dateOfBirth = toISODate(dateOfBirth);
      if (biologicalSex) profileUpdate.biologicalSex = biologicalSex;

      const updated = await storage.updateProfile(targetId, profileUpdate);

      // Update relationship on family link if provided
      if (relationship) {
        const links = await storage.getFamilyMembersByProfileId(myProfileId);
        const link = links.find((l: any) => l.relatedProfileId === targetId);
        if (link) {
          await db.update(familyMembers)
            .set({ relationship })
            .where(eq(familyMembers.id, link.id));
        }
      }

      return res.json(updated);
    } catch (err: any) {
      console.error("Edit managed profile error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove a managed profile permanently
  app.delete("/api/family/:profileId/remove", authMiddleware, async (req, res) => {
    try {
      const myProfileId = await getProfileId(req, res);
      if (!myProfileId) return;

      const targetId = Number(req.params.profileId);
      const target = await storage.getProfile(targetId);
      if (!target || target.managedById !== myProfileId) {
        return res.status(403).json({ message: "Not authorized to remove this profile" });
      }

      // Delete family link first, then profile (cascade deletes all health data)
      const links = await storage.getFamilyMembersByProfileId(myProfileId);
      const link = links.find((l: any) => l.relatedProfileId === targetId);
      if (link) await storage.deleteFamilyMember(link.id);

      await storage.deleteProfile(targetId);

      return res.json({ message: "Profile removed permanently" });
    } catch (err: any) {
      console.error("Remove profile error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get health summary for a managed profile
  app.get("/api/household/health-summary/:profileId", authMiddleware, async (req, res) => {
    try {
      const myProfileId = await getProfileId(req, res);
      if (!myProfileId) return;

      const targetId = Number(req.params.profileId);
      const target = await storage.getProfile(targetId);
      if (!target || target.managedById !== myProfileId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const [conditions, medications, allergies, surgeries, healthMetrics, socialHistory, emergencyContacts, insuranceData] =
        await Promise.all([
          storage.getConditionsByProfileId(targetId),
          storage.getMedicationsByProfileId(targetId),
          storage.getAllergiesByProfileId(targetId),
          storage.getSurgeriesByProfileId(targetId),
          storage.getHealthMetricsByProfileId(targetId),
          storage.getSocialHistoryByProfileId(targetId),
          storage.getEmergencyContactsByProfileId(targetId),
          storage.getInsuranceByProfileId(targetId),
        ]);

      return res.json({
        conditions,
        medications,
        allergies,
        surgeries,
        healthMetrics,
        socialHistory: socialHistory || null,
        emergencyContacts,
        insurance: insuranceData,
      });
    } catch (err: any) {
      console.error("Household health summary error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Export health data for a profile (self or managed)
  app.get("/api/household/export/:profileId", authMiddleware, async (req, res) => {
    try {
      const myProfileId = await getProfileId(req, res);
      if (!myProfileId) return;

      const targetId = Number(req.params.profileId);
      // Allow export of self or managed profiles
      if (targetId !== myProfileId) {
        const target = await storage.getProfile(targetId);
        if (!target || target.managedById !== myProfileId) {
          return res.status(403).json({ message: "Not authorized" });
        }
      }

      const profile = await storage.getProfile(targetId);
      const [conditions, medications, allergies, surgeries, healthMetrics, socialHistory, emergencyContacts, insuranceData, docs] =
        await Promise.all([
          storage.getConditionsByProfileId(targetId),
          storage.getMedicationsByProfileId(targetId),
          storage.getAllergiesByProfileId(targetId),
          storage.getSurgeriesByProfileId(targetId),
          storage.getHealthMetricsByProfileId(targetId),
          storage.getSocialHistoryByProfileId(targetId),
          storage.getEmergencyContactsByProfileId(targetId),
          storage.getInsuranceByProfileId(targetId),
          storage.getDocumentsByProfileId(targetId),
        ]);

      return res.json({
        exportedAt: new Date().toISOString(),
        profile: {
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          dateOfBirth: profile?.dateOfBirth,
          biologicalSex: profile?.biologicalSex,
        },
        conditions,
        medications,
        allergies,
        surgeries,
        healthMetrics,
        socialHistory: socialHistory || null,
        emergencyContacts,
        insurance: insuranceData,
        documents: docs.map((d) => ({ id: d.id, label: d.label, fileType: d.fileType, createdAt: d.createdAt })),
      });
    } catch (err: any) {
      console.error("Export error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transfer Household Manager role
  app.post("/api/household/transfer-role", authMiddleware, async (req, res) => {
    try {
      const myProfileId = await getProfileId(req, res);
      if (!myProfileId) return;

      const { targetProfileId } = req.body;
      if (!targetProfileId) {
        return res.status(400).json({ message: "Target profile is required" });
      }

      // Verify target is a connected (non-managed) member
      const target = await storage.getProfile(targetProfileId);
      if (!target || target.managedById != null) {
        return res.status(400).json({ message: "Target must be a connected adult member" });
      }

      // Transfer all managed profiles from current user to target
      const managed = await storage.getManagedProfiles(myProfileId);
      for (const mp of managed) {
        await storage.updateProfile(mp.id, { managedById: targetProfileId });

        // Update family links: change profileId from myProfileId to targetProfileId
        const links = await storage.getFamilyMembersByProfileId(myProfileId);
        const link = links.find((l: any) => l.relatedProfileId === mp.id);
        if (link) {
          await db.update(familyMembers)
            .set({ profileId: targetProfileId })
            .where(eq(familyMembers.id, link.id));
        }
      }

      return res.json({ message: "Household manager role transferred successfully" });
    } catch (err: any) {
      console.error("Transfer role error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Family Health Insights (AI-powered) ───────────────────
  app.post("/api/health/insights", authMiddleware, verifiedMiddleware, premiumMiddleware("premium"), async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      const selfProfile = await storage.getProfile(profileId);
      if (!selfProfile) return res.status(404).json({ message: "Profile not found" });

      // ── Gather user's own health data ──
      const [ownConditions, ownMedications, ownAllergies, ownSurgeries, ownSocialHistory, ownMetrics] =
        await Promise.all([
          storage.getConditionsByProfileId(profileId),
          storage.getMedicationsByProfileId(profileId),
          storage.getAllergiesByProfileId(profileId),
          storage.getSurgeriesByProfileId(profileId),
          storage.getSocialHistoryByProfileId(profileId),
          storage.getHealthMetricsByProfileId(profileId),
        ]);

      // ── Gather managed profiles' health data ──
      const managedProfiles = await storage.getManagedProfiles(profileId);
      const managedData = await Promise.all(
        managedProfiles.map(async (mp) => {
          const [conditions, medications, allergies, surgeries, socialHistory, metrics] = await Promise.all([
            storage.getConditionsByProfileId(mp.id),
            storage.getMedicationsByProfileId(mp.id),
            storage.getAllergiesByProfileId(mp.id),
            storage.getSurgeriesByProfileId(mp.id),
            storage.getSocialHistoryByProfileId(mp.id),
            storage.getHealthMetricsByProfileId(mp.id),
          ]);
          return {
            profileId: mp.id,
            name: `${mp.firstName} ${mp.lastName}`,
            conditions: conditions.filter((c: any) => !c.isPrivate),
            medications: medications.filter((m: any) => !m.isPrivate),
            allergies: allergies.filter((a: any) => !a.isPrivate),
            surgeries: surgeries.filter((s: any) => !s.isPrivate),
            socialHistory,
            metrics: metrics.filter((m: any) => !m.isPrivate),
          };
        })
      );

      // ── Gather connected (non-managed) family members' data respecting sharing prefs ──
      const allLinks = await storage.getFamilyMembersByProfileId(profileId);
      const connectedLinks = allLinks.filter(
        (l: any) => !managedProfiles.some((mp) => mp.id === l.relatedProfileId)
      );
      const connectedData = await Promise.all(
        connectedLinks.map(async (link: any) => {
          // Look up what this connected member shares with us
          const sharingPref = await storage.getSharingPreference(link.relatedProfileId, profileId);
          // Default prefs if none found
          const shareConditions = sharingPref?.shareConditions ?? true;
          const shareMedications = sharingPref?.shareMedications ?? true;
          const shareAllergies = sharingPref?.shareAllergies ?? true;
          const shareSurgeries = sharingPref?.shareSurgeries ?? true;

          const conditions = shareConditions
            ? (await storage.getConditionsByProfileId(link.relatedProfileId)).filter((c: any) => !c.isPrivate)
            : [];
          const medications = shareMedications
            ? (await storage.getMedicationsByProfileId(link.relatedProfileId)).filter((m: any) => !m.isPrivate)
            : [];
          const allergies = shareAllergies
            ? (await storage.getAllergiesByProfileId(link.relatedProfileId)).filter((a: any) => !a.isPrivate)
            : [];
          const surgeries = shareSurgeries
            ? (await storage.getSurgeriesByProfileId(link.relatedProfileId)).filter((s: any) => !s.isPrivate)
            : [];

          return {
            relationship: link.relationship,
            conditions,
            medications,
            allergies,
            surgeries,
          };
        })
      );

      // ── Build prompt ──
      const promptSections: string[] = [];

      promptSections.push("=== YOUR HEALTH DATA ===");
      promptSections.push(`Name: ${selfProfile.firstName} ${selfProfile.lastName}`);
      if (selfProfile.dateOfBirth) promptSections.push(`DOB: ${selfProfile.dateOfBirth}`);
      if (selfProfile.biologicalSex) promptSections.push(`Sex: ${selfProfile.biologicalSex}`);

      if (ownConditions.length > 0) {
        promptSections.push("\nConditions:");
        ownConditions.filter((c: any) => !c.isPrivate).forEach((c: any) => {
          promptSections.push(`- ${c.name}${c.status ? ` (${c.status})` : ""}${c.diagnosisDate ? `, diagnosed ${c.diagnosisDate}` : ""}`);
        });
      }
      if (ownMedications.length > 0) {
        promptSections.push("\nMedications:");
        ownMedications.filter((m: any) => !m.isPrivate).forEach((m: any) => {
          promptSections.push(`- ${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? `, ${m.frequency}` : ""}`);
        });
      }
      if (ownAllergies.length > 0) {
        promptSections.push("\nAllergies:");
        ownAllergies.filter((a: any) => !a.isPrivate).forEach((a: any) => {
          promptSections.push(`- ${a.allergen}${a.severity ? ` (${a.severity})` : ""}`);
        });
      }
      if (ownSurgeries.length > 0) {
        promptSections.push("\nSurgeries:");
        ownSurgeries.filter((s: any) => !s.isPrivate).forEach((s: any) => {
          promptSections.push(`- ${s.procedure}${s.date ? ` on ${s.date}` : ""}`);
        });
      }
      if (ownMetrics.length > 0) {
        promptSections.push("\nMetrics:");
        ownMetrics.filter((m: any) => !m.isPrivate).forEach((m: any) => {
          promptSections.push(`- ${m.type.replace(/_/g, " ")}: ${m.value} ${m.unit}`);
        });
      }
      if (ownSocialHistory) {
        const sh = ownSocialHistory as any;
        promptSections.push("\nSocial History:");
        if (sh.smokingStatus) promptSections.push(`- Smoking: ${sh.smokingStatus}`);
        if (sh.alcoholUse) promptSections.push(`- Alcohol: ${sh.alcoholUse}`);
        if (sh.exerciseFrequency) promptSections.push(`- Exercise: ${sh.exerciseFrequency}`);
      }

      // Managed profiles (show names)
      if (managedData.length > 0) {
        promptSections.push("\n=== MANAGED FAMILY MEMBERS ===");
        for (const mp of managedData) {
          promptSections.push(`\n--- ${mp.name} ---`);
          if (mp.conditions.length > 0) {
            promptSections.push("Conditions:");
            mp.conditions.forEach((c: any) => promptSections.push(`- ${c.name}${c.status ? ` (${c.status})` : ""}`));
          }
          if (mp.medications.length > 0) {
            promptSections.push("Medications:");
            mp.medications.forEach((m: any) => promptSections.push(`- ${m.name}`));
          }
          if (mp.allergies.length > 0) {
            promptSections.push("Allergies:");
            mp.allergies.forEach((a: any) => promptSections.push(`- ${a.allergen}`));
          }
          if (mp.surgeries.length > 0) {
            promptSections.push("Surgeries:");
            mp.surgeries.forEach((s: any) => promptSections.push(`- ${s.procedure}`));
          }
        }
      }

      // Connected members (de-identified, respecting sharing prefs)
      if (connectedData.length > 0) {
        promptSections.push("\n=== CONNECTED FAMILY MEMBERS (de-identified) ===");
        for (const cm of connectedData) {
          promptSections.push(`\n--- A family member (${cm.relationship}) ---`);
          if (cm.conditions.length > 0) {
            promptSections.push("Conditions:");
            cm.conditions.forEach((c: any) => promptSections.push(`- ${c.name}${c.status ? ` (${c.status})` : ""}`));
          }
          if (cm.medications.length > 0) {
            promptSections.push("Medications:");
            cm.medications.forEach((m: any) => promptSections.push(`- ${m.name}`));
          }
          if (cm.allergies.length > 0) {
            promptSections.push("Allergies:");
            cm.allergies.forEach((a: any) => promptSections.push(`- ${a.allergen}`));
          }
          if (cm.surgeries.length > 0) {
            promptSections.push("Surgeries:");
            cm.surgeries.forEach((s: any) => promptSections.push(`- ${s.procedure}`));
          }
        }
      }

      const userPrompt = promptSections.join("\n");

      const systemPrompt = `You are a hereditary health risk analyst for a family health app called Soria Health. Analyze the provided family health data and identify hereditary patterns, shared conditions, and recommend preventive screenings.

IMPORTANT: You must respond with ONLY valid JSON (no markdown, no code fences) in this exact structure:
{
  "familySummary": "A 2-3 sentence overview of the family's health landscape",
  "heredityPatterns": [
    {
      "pattern": "Name of the hereditary pattern",
      "description": "Explanation of the pattern and its hereditary nature",
      "affectedMembers": ["list of affected member names or 'A family member' for connected members"]
    }
  ],
  "screeningRecommendations": [
    {
      "member": "Name of the member (or 'You' for the user)",
      "screening": "Name of the recommended screening",
      "reason": "Why this screening is recommended based on family history",
      "priority": "high" | "medium" | "low"
    }
  ],
  "individualInsights": [
    {
      "memberName": "Name of the member",
      "insight": "Key health insight for this individual",
      "recommendation": "Specific recommendation"
    }
  ]
}

Guidelines:
- Focus on hereditary and genetic risk factors
- Consider conditions that commonly run in families (diabetes, heart disease, cancer, hypertension, etc.)
- Recommend age-appropriate screenings
- Be specific but not alarmist
- If there is limited data, still provide general recommendations based on available information
- Include the primary user in individualInsights as well
- For connected family members, always use "A family member" instead of real names`;

      // ── Call OpenAI or return mock ──
      if (!process.env.OPENAI_API_KEY) {
        // Return mock response for development
        return res.json({
          familySummary: "Based on the available family health data, your household shows a mix of common conditions. With proper monitoring and preventive care, many hereditary risks can be managed effectively. Consider scheduling annual check-ups for all family members.",
          heredityPatterns: [
            {
              pattern: "Cardiovascular Risk Indicators",
              description: "Heart disease and hypertension can have strong hereditary components. Monitoring blood pressure and cholesterol regularly is recommended for all family members.",
              affectedMembers: ["You"],
            },
            {
              pattern: "Metabolic Health Patterns",
              description: "Conditions like diabetes and metabolic syndrome often run in families. Regular glucose screenings and maintaining a healthy weight are key preventive measures.",
              affectedMembers: ["You"],
            },
          ],
          screeningRecommendations: [
            {
              member: "You",
              screening: "Comprehensive Metabolic Panel",
              reason: "Baseline screening recommended for tracking metabolic health markers across the family.",
              priority: "medium",
            },
            {
              member: "You",
              screening: "Blood Pressure Monitoring",
              reason: "Regular monitoring helps detect early signs of hereditary hypertension.",
              priority: "high",
            },
          ],
          individualInsights: [
            {
              memberName: `${selfProfile.firstName}`,
              insight: "As the primary account holder, your health data forms the baseline for family pattern analysis.",
              recommendation: "Complete your full health profile including family medical history to enable deeper hereditary analysis.",
            },
          ],
          _mock: true,
        });
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2000,
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      // Strip code fences if the model wraps the response
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        console.error("Failed to parse insights JSON:", raw);
        return res.status(500).json({ message: "AI returned invalid JSON" });
      }

      return res.json(parsed);
    } catch (err: any) {
      console.error("Health insights error:", err?.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
