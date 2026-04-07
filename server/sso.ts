import type { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { storage } from "./storage";

/**
 * SSO Routes for Google and Apple Sign-In.
 *
 * MVP: trusts the idToken and uses the provided email/name directly.
 * Production: verify idToken with Google (googleapis) or Apple (apple-signin-auth)
 * before trusting the payload.
 */
export function registerSSORoutes(app: Express) {
  // ── POST /api/auth/google ──────────────────────────────────────
  app.post("/api/auth/google", async (req: Request, res: Response) => {
    try {
      const { idToken, email, name } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // TODO: In production, verify the Google idToken here:
      // const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
      // const payload = ticket.getPayload();
      // const verifiedEmail = payload.email;

      const result = await handleSSOLogin(req, {
        email,
        name: name || "",
        provider: "google",
      });

      return res.json(result);
    } catch (err: any) {
      console.error("Google SSO error:", err);
      return res.status(500).json({ message: err.message || "SSO login failed" });
    }
  });

  // ── POST /api/auth/apple ───────────────────────────────────────
  app.post("/api/auth/apple", async (req: Request, res: Response) => {
    try {
      const { idToken, email, name } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // TODO: In production, verify the Apple idToken here:
      // import appleSignin from 'apple-signin-auth';
      // const applePayload = await appleSignin.verifyIdToken(idToken, { audience: APPLE_CLIENT_ID });
      // const verifiedEmail = applePayload.email;

      const result = await handleSSOLogin(req, {
        email,
        name: name || "",
        provider: "apple",
      });

      return res.json(result);
    } catch (err: any) {
      console.error("Apple SSO error:", err);
      return res.status(500).json({ message: err.message || "SSO login failed" });
    }
  });
}

/**
 * Shared logic for SSO login/registration.
 * If user exists, log them in. Otherwise, create a new user + profile.
 */
async function handleSSOLogin(
  req: Request,
  opts: { email: string; name: string; provider: "google" | "apple" },
) {
  const { email, name, provider } = opts;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  let user = await storage.getUserByEmail(normalizedEmail);
  let profile;

  if (user) {
    // Existing user — log them in
    profile = await storage.getProfileByUserId(user.id);
  } else {
    // New user — create account
    // Generate a random password hash (user won't use password login)
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Parse first/last name from the full name
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    user = await storage.createUser({
      username: normalizedEmail,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Update authProvider and providerId + emailVerified directly via db
    // since InsertUser schema only picks username/password/email
    const { db } = await import("./db");
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    await db
      .update(users)
      .set({
        authProvider: provider,
        providerId: normalizedEmail,
        emailVerified: true,
      })
      .where(eq(users.id, user.id));

    // Refresh user object
    user = (await storage.getUser(user.id))!;

    // Create profile
    profile = await storage.createProfile({
      userId: user.id,
      firstName,
      lastName: lastName || "",
      onboardingCompleted: false,
    });

    // Create basic subscription for new SSO user
    await storage.createSubscription({
      userId: user.id,
      tier: "basic",
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }

  // Set session
  (req.session as any).userId = user.id;

  return {
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    },
    profile,
  };
}
