import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";
import PaywallModal from "@/components/PaywallModal";
import { useSubscription } from "@/hooks/useSubscription";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const URGENCY_COLORS = {
  red: { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" },
  yellow: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
  green: { bg: "#D1FAE5", text: "#059669", border: "#A7F3D0" },
};

function UrgencyBadge({ urgency, daysRemaining }: { urgency: "red" | "yellow" | "green"; daysRemaining: number }) {
  const colors = URGENCY_COLORS[urgency];
  const label =
    daysRemaining <= 0
      ? "Overdue"
      : daysRemaining === 1
      ? "1 day left"
      : `${daysRemaining} days left`;

  return (
    <View style={[styles.urgencyBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={[styles.urgencyDot, { backgroundColor: colors.text }]} />
      <ThemedText style={[styles.urgencyText, { color: colors.text }]}>
        {label}
      </ThemedText>
    </View>
  );
}

export default function RefillsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { openDrawer } = useDrawer();
  const { isPremium } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  const { data: refillChecks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/refills/check"],
  });

  const { data: refillRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/refills"],
  });

  const requestRefillMutation = useMutation({
    mutationFn: async (item: any) => {
      const res = await apiRequest("POST", "/api/refills/request", {
        medicationId: item.medication.id,
        pharmacyId: item.pharmacy?.id || null,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/refills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/refills/check"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      // Navigate to confirmation screen
      navigation.navigate("RefillConfirm", { refillRequestId: data.id });
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to request refill");
    },
  });

  const handleRequestRefill = (item: any) => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    Alert.alert(
      "Request Refill",
      `Request a refill for ${item.medication.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request",
          onPress: () => requestRefillMutation.mutate(item),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundRoot, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} hitSlop={12} activeOpacity={0.7}>
          <Feather name="menu" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="h4" style={styles.headerTitle}>
          Medication Refills
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.link} />
        </View>
      ) : refillChecks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="package" size={48} color={theme.textTertiary} />
          <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
            No Refill Data
          </ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Add fill dates and day supply to your medications to track refills.
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={{ paddingBottom: insets.bottom + Spacing["3xl"] }}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
              onPress={() => navigation.navigate("AddPharmacy", {})}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={16} color={theme.link} />
              <ThemedText style={[styles.quickActionText, { color: theme.link }]}>
                Manage Pharmacies
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
              onPress={() => navigation.navigate("Physicians")}
              activeOpacity={0.7}
            >
              <Feather name="user-check" size={16} color={theme.link} />
              <ThemedText style={[styles.quickActionText, { color: theme.link }]}>
                My Physicians
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Refill cards */}
          {refillChecks.map((item: any, idx: number) => {
            const med = item.medication;
            // Check if there's a pending refill request
            const hasPending = refillRequests.some(
              (r: any) => r.medicationId === med.id && r.status === "pending"
            );

            return (
              <View
                key={med.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.border,
                    ...Shadows.card,
                  },
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardInfo}>
                    <ThemedText style={[styles.medName, { color: theme.text }]}>
                      {med.name}
                    </ThemedText>
                    {med.dosage && (
                      <ThemedText style={[styles.medDosage, { color: theme.textSecondary }]}>
                        {med.dosage}
                        {med.frequency ? ` - ${med.frequency}` : ""}
                      </ThemedText>
                    )}
                  </View>
                  <UrgencyBadge urgency={item.urgency} daysRemaining={item.daysRemaining} />
                </View>

                <View style={[styles.cardDetails, { borderTopColor: theme.border }]}>
                  <View style={styles.detailRow}>
                    <ThemedText style={[styles.detailLabel, { color: theme.textTertiary }]}>
                      Run-out Date
                    </ThemedText>
                    <ThemedText style={[styles.detailValue, { color: theme.text }]}>
                      {item.runOutDate}
                    </ThemedText>
                  </View>

                  {item.refillsRemaining != null && (
                    <View style={styles.detailRow}>
                      <ThemedText style={[styles.detailLabel, { color: theme.textTertiary }]}>
                        Refills Remaining
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.detailValue,
                          {
                            color: item.refillsRemaining === 0 ? theme.error : theme.text,
                            fontWeight: item.refillsRemaining === 0 ? "700" : "500",
                          },
                        ]}
                      >
                        {item.refillsRemaining}
                      </ThemedText>
                    </View>
                  )}

                  {item.pharmacy && (
                    <View style={styles.detailRow}>
                      <ThemedText style={[styles.detailLabel, { color: theme.textTertiary }]}>
                        Pharmacy
                      </ThemedText>
                      <ThemedText style={[styles.detailValue, { color: theme.text }]}>
                        {item.pharmacy.name}
                      </ThemedText>
                    </View>
                  )}

                  {item.isAutoRefill && (
                    <View style={styles.detailRow}>
                      <Feather name="refresh-cw" size={13} color={theme.success} />
                      <ThemedText style={[styles.autoRefillText, { color: theme.success }]}>
                        Auto-refill enabled
                      </ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  {hasPending ? (
                    <View style={[styles.pendingBadge, { backgroundColor: theme.warning + "20" }]}>
                      <Feather name="clock" size={14} color={theme.warning} />
                      <ThemedText style={[styles.pendingText, { color: theme.warning }]}>
                        Refill Pending
                      </ThemedText>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.refillButton, { backgroundColor: theme.link }]}
                      onPress={() => handleRequestRefill(item)}
                      disabled={requestRefillMutation.isPending}
                      activeOpacity={0.8}
                    >
                      <Feather name="refresh-cw" size={14} color="#FFFFFF" />
                      <ThemedText style={styles.refillButtonText}>
                        Request Refill
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureName="Medication Refills"
        requiredTier="premium"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  list: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  quickActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: Spacing.lg,
  },
  cardInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  medName: {
    fontSize: 16,
    fontWeight: "600",
  },
  medDosage: {
    fontSize: 13,
    marginTop: 2,
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardDetails: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  autoRefillText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: Spacing.xs,
  },
  cardActions: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  refillButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  refillButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  pendingText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
