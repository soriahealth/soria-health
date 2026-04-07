import { useQuery } from "@tanstack/react-query";

interface Subscription {
  id: number;
  userId: number;
  tier: "basic" | "premium" | "unlimited";
  status: "active" | "cancelled";
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export function useSubscription() {
  const { data: subscription, isLoading } = useQuery<Subscription>({
    queryKey: ["/api/subscription"],
  });

  const tier = subscription?.tier ?? "basic";

  return {
    subscription,
    tier,
    isPremium: tier === "premium" || tier === "unlimited",
    isUnlimited: tier === "unlimited",
    isLoading,
  };
}
