import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function resolveUserId(req: Request): Promise<string | null> {
  // Check Authorization header first (mobile token auth)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.authToken, token)).limit(1);
    if (user) {
      req.session.userId = user.id;
      return user.id;
    }
  }

  // Fall back to session cookie
  return req.session?.userId ?? null;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

export async function verifiedMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await storage.getUser(userId);
  if (!user || !user.emailVerified) {
    return res.status(403).json({ message: "Email verification required" });
  }

  next();
}
