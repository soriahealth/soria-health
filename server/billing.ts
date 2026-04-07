import type { Express, Request, Response, NextFunction } from "express";
import { authMiddleware } from "./auth";
import { storage } from "./storage";

const TIER_LEVELS: Record<string, number> = {
  basic: 0,
  premium: 1,
  unlimited: 2,
};

/**
 * Middleware that checks whether the authenticated user's subscription
 * meets the required tier before allowing access to the route.
 *
 * "premium" allows premium + unlimited.
 * "unlimited" only allows unlimited.
 */
export function premiumMiddleware(requiredTier: "premium" | "unlimited") {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const subscription = await storage.getSubscriptionByUserId(userId);
    const currentTier = subscription?.tier ?? "basic";
    const currentLevel = TIER_LEVELS[currentTier] ?? 0;
    const requiredLevel = TIER_LEVELS[requiredTier] ?? 0;

    if (subscription?.status === "cancelled") {
      // If cancelled but still within the period, allow access
      if (subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) > new Date()) {
        if (currentLevel >= requiredLevel) {
          return next();
        }
      }
      return res.status(403).json({
        message: "Subscription required",
        requiredTier,
        currentTier: "basic",
      });
    }

    if (currentLevel < requiredLevel) {
      return res.status(403).json({
        message: "Subscription required",
        requiredTier,
        currentTier,
      });
    }

    next();
  };
}

export function registerBillingRoutes(app: Express) {
  // ── GET /api/subscription ─────────────────────────────────────
  // Returns the current user's subscription, creating a basic one if none exists.
  app.get("/api/subscription", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      let subscription = await storage.getSubscriptionByUserId(userId);

      if (!subscription) {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        subscription = await storage.createSubscription({
          userId,
          tier: "basic",
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        });
      }

      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // ── PUT /api/subscription/upgrade ─────────────────────────────
  // Mock upgrade — no real Stripe integration.
  app.put("/api/subscription/upgrade", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const { tier } = req.body;

      if (!tier || !["premium", "unlimited"].includes(tier)) {
        return res.status(400).json({ message: "Invalid tier. Must be 'premium' or 'unlimited'." });
      }

      let subscription = await storage.getSubscriptionByUserId(userId);

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      if (!subscription) {
        subscription = await storage.createSubscription({
          userId,
          tier,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          stripeCustomerId: `cus_mock_${userId}`,
          stripeSubscriptionId: `sub_mock_${Date.now()}`,
        });
      } else {
        subscription = await storage.updateSubscription(subscription.id, {
          tier,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          stripeCustomerId: subscription.stripeCustomerId || `cus_mock_${userId}`,
          stripeSubscriptionId: `sub_mock_${Date.now()}`,
        });
      }

      res.json(subscription);
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  // ── PUT /api/subscription/cancel ──────────────────────────────
  // Sets status to "cancelled". Tier stays active until currentPeriodEnd.
  app.put("/api/subscription/cancel", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const subscription = await storage.getSubscriptionByUserId(userId);

      if (!subscription) {
        return res.status(404).json({ message: "No subscription found" });
      }

      if (subscription.tier === "basic") {
        return res.status(400).json({ message: "Cannot cancel a free plan" });
      }

      const updated = await storage.updateSubscription(subscription.id, {
        status: "cancelled",
      });

      res.json(updated);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });
}
