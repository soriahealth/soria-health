import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

export async function verifiedMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user || !user.emailVerified) {
    return res.status(403).json({ message: "Email verification required" });
  }

  next();
}
