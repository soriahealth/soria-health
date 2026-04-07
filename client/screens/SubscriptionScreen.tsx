import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const API_BASE =
  typeof window !== "undefined" && (window as any).location
    ? ""
    : process.env.EXPO_PUBLIC_DOMAIN || "";

interface Subscription {
  id: number;
  userId: string;
  tier: string;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
}

interface TierInfo {
  key: string;
  name: string;
  price: string;
  priceLabel: string;
  color: string;
  icon: keyof typeof Feather.glyphMap;
  features: string[];
  highlighted?: boolean;
}

const TIERS: TierInfo[] = [
  {
    key: "basic",
    name: "Basic",
    price: "Free",
    priceLabel: "forever",
    color: "#6B7280",
    icon: "heart",
    features: [
      "Health records management",
      "Family network",
      "Document uploads",
      "Ask Me AI assistant",
      "Health alerts",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: "$9.99",
    priceLabel: "per month",
    color: "#8B5CF6",
    icon: "star",
    highlighted: true,
    features: [
      "Everything in Basic",
      "Medication refill requests",
      "AI phone calling",
      "Family health insights",
      "Priority email support",
    ],
  },
  {
    key: "unlimited",
    name: "Unlimited",
    price: "$19.99",
    priceLabel: "per month",
    color: "#F59E0B",
    icon: "zap",
    features: [
      "Everything in Premium",
      "Unlimited family members",
      "Priority support",
      "Early access to features",
      "Custom health reports",
    ],
  },
];

export default function SubscriptionScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { openDrawer } = useDrawer();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery<Subscription>({
    queryKey: ["/api/subscription"],
  });

  const upgradeMutation = useMutation({
    mutationFn: async (tier: string) => {
      const res = await fetch(`${API_BASE}/api/subscription/upgrade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/api/subscription/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message);
    },
  });

  const currentTier = subscription?.tier ?? "basic";
  const isCancelled = subscription?.status === "cancelled";
  const isMutating = upgradeMutation.isPending || cancelMutation.isPending;

  const handleUpgrade = (tier: string) => {
    if (tier === currentTier && !isCancelled) return;

    Alert.alert(
      "Confirm Upgrade",
      `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Upgrade", onPress: () => upgradeMutation.mutate(tier) },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Subscription",
      "Your premium features will remain active until the end of the current billing period. Are you sure?",
      [
        { text: "Keep Plan", style: "cancel" },
        {
          text: "Cancel Plan",
          style: "destructive",
          onPress: () => cancelMutation.mutate(),
        },
      ]
    );
  };

  const handleDowngrade = () => {
    Alert.alert(
      "Downgrade",
      "To downgrade, cancel your current plan. It will revert to Basic at the end of the billing period.",
      [{ text: "OK" }]
    );
  };

  const getTierLevel = (tier: string) => {
    if (tier === "unlimited") return 2;
    if (tier === "premium") return 1;
    return 0;
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.link} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
            backgroundColor: theme.backgroundRoot,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => openDrawer()} hitSlop={12}>
          <Feather name="menu" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="h3" style={styles.headerTitle}>
          Subscription
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Banner */}
        {isCancelled && subscription?.currentPeriodEnd && (
          <View
            style={[
              styles.statusBanner,
              { backgroundColor: theme.warningLight, borderColor: theme.warningBorder },
            ]}
          >
            <Feather name="alert-circle" size={16} color={theme.warning} />
            <ThemedText style={[styles.statusText, { color: theme.text }]}>
              Your {currentTier} plan is cancelled. Access continues until{" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-GB")}.
            </ThemedText>
          </View>
        )}

        {/* Tier Cards */}
        {TIERS.map((tier) => {
          const isCurrent = tier.key === currentTier && !isCancelled;
          const tierLevel = getTierLevel(tier.key);
          const currentLevel = getTierLevel(currentTier);
          const isUpgrade = tierLevel > currentLevel;
          const isDowngrade = tierLevel < currentLevel;

          return (
            <View
              key={tier.key}
              style={[
                styles.tierCard,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: isCurrent ? tier.color : theme.border,
                  borderWidth: isCurrent ? 2 : 1,
                },
              ]}
            >
              {/* Current Plan Badge */}
              {isCurrent && (
                <View style={[styles.currentBadge, { backgroundColor: tier.color }]}>
                  <ThemedText style={styles.currentBadgeText}>Current Plan</ThemedText>
                </View>
              )}

              {/* Tier Header */}
              <View style={styles.tierHeader}>
                <View style={[styles.tierIconContainer, { backgroundColor: tier.color + "20" }]}>
                  <Feather name={tier.icon} size={24} color={tier.color} />
                </View>
                <View style={styles.tierHeaderText}>
                  <ThemedText type="h4" style={{ color: theme.text }}>
                    {tier.name}
                  </ThemedText>
                  <View style={styles.priceRow}>
                    <ThemedText style={[styles.price, { color: theme.text }]}>
                      {tier.price}
                    </ThemedText>
                    {tier.priceLabel !== "forever" && (
                      <ThemedText style={[styles.priceLabel, { color: theme.textSecondary }]}>
                        {" "}
                        / {tier.priceLabel.replace("per ", "")}
                      </ThemedText>
                    )}
                    {tier.priceLabel === "forever" && (
                      <ThemedText style={[styles.priceLabel, { color: theme.textSecondary }]}>
                        {" "}
                        {tier.priceLabel}
                      </ThemedText>
                    )}
                  </View>
                </View>
              </View>

              {/* Features */}
              <View style={styles.featuresList}>
                {tier.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Feather name="check" size={16} color={tier.color} />
                    <ThemedText style={[styles.featureText, { color: theme.text }]}>
                      {feature}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {/* Action Button */}
              {isCurrent ? (
                tier.key !== "basic" ? (
                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: theme.error }]}
                    onPress={handleCancel}
                    disabled={isMutating}
                  >
                    <ThemedText style={[styles.cancelButtonText, { color: theme.error }]}>
                      Cancel Plan
                    </ThemedText>
                  </TouchableOpacity>
                ) : null
              ) : isUpgrade || (isCancelled && tier.key !== "basic") ? (
                <TouchableOpacity
                  style={[styles.upgradeButton, { backgroundColor: tier.color }]}
                  onPress={() => handleUpgrade(tier.key)}
                  disabled={isMutating}
                >
                  {isMutating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.upgradeButtonText}>
                      {isCancelled && tier.key === currentTier ? "Reactivate" : "Upgrade"}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              ) : isDowngrade ? (
                <TouchableOpacity
                  style={[styles.downgradeButton, { borderColor: theme.border }]}
                  onPress={handleDowngrade}
                >
                  <ThemedText style={[styles.downgradeButtonText, { color: theme.textSecondary }]}>
                    Downgrade
                  </ThemedText>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}

        {/* Info Note */}
        <View
          style={[
            styles.infoNote,
            { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
          ]}
        >
          <Feather name="info" size={16} color={theme.textSecondary} />
          <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
            This is a demo environment. No real charges will be made. Stripe integration will be
            added in a future update.
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  tierCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    overflow: "hidden",
  },
  currentBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  currentBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tierIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  tierHeaderText: {
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
  },
  priceLabel: {
    fontSize: 14,
  },
  featuresList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  upgradeButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minHeight: 48,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  downgradeButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minHeight: 48,
  },
  downgradeButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  infoNote: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
