import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Route = RouteProp<RootStackParamList, "PrivacyReview">;

type SharingCategory = {
  key: string;
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  defaultOn: boolean;
};

const CATEGORIES: SharingCategory[] = [
  {
    key: "shareConditions",
    label: "Conditions",
    description: "Diagnoses like hypertension, diabetes, etc.",
    icon: "heart",
    defaultOn: true,
  },
  {
    key: "shareMedications",
    label: "Medications",
    description: "Current prescriptions and dosages",
    icon: "package",
    defaultOn: true,
  },
  {
    key: "shareAllergies",
    label: "Allergies",
    description: "Drug allergies, food allergies, etc.",
    icon: "alert-triangle",
    defaultOn: true,
  },
  {
    key: "shareSurgeries",
    label: "Surgeries",
    description: "Surgical history and procedures",
    icon: "scissors",
    defaultOn: true,
  },
  {
    key: "shareMetrics",
    label: "Health Metrics",
    description: "Vitals like blood pressure, weight, etc.",
    icon: "activity",
    defaultOn: true,
  },
  {
    key: "shareSocialHistory",
    label: "Social History",
    description: "Smoking, alcohol, exercise, occupation",
    icon: "coffee",
    defaultOn: false,
  },
  {
    key: "shareDocuments",
    label: "Documents",
    description: "Uploaded medical documents and images",
    icon: "file-text",
    defaultOn: false,
  },
];

export default function PrivacyReviewScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { requestId, fromName, relationship } = route.params;

  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const cat of CATEGORIES) {
      initial[cat.key] = cat.defaultOn;
    }
    return initial;
  });

  const togglePref = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/connections/${requestId}/accept`, {
        sharingPreferences: prefs,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections/incoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connections/outgoing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/family"] });
      queryClient.invalidateQueries({ queryKey: ["/api/family/managed"] });
      Alert.alert(
        "Connected!",
        `You are now connected with ${fromName}. You can change your sharing preferences anytime.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to accept connection");
    },
  });

  const sharedCount = Object.values(prefs).filter(Boolean).length;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={[styles.topBarTitle, { color: theme.textSecondary }]}>
          Privacy Review
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.headerCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={[styles.headerIcon, { backgroundColor: theme.link + "20" }]}>
            <Feather name="shield" size={24} color={theme.link} />
          </View>
          <ThemedText type="h4" style={styles.headerTitle}>
            Review What You Share
          </ThemedText>
          <ThemedText style={[styles.headerDescription, { color: theme.textSecondary }]}>
            Before connecting with{" "}
            <ThemedText style={{ fontWeight: "600", color: theme.text }}>
              {fromName}
            </ThemedText>{" "}
            ({relationship}), choose which health data categories they can see.
          </ThemedText>
          <ThemedText style={[styles.headerNote, { color: theme.textTertiary }]}>
            Records individually marked as "Private" will always remain hidden regardless of these settings. You can change these preferences anytime.
          </ThemedText>
        </View>

        {/* Toggle Categories */}
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Data Categories ({sharedCount}/{CATEGORIES.length} shared)
        </ThemedText>

        {CATEGORIES.map((cat) => {
          const isOn = prefs[cat.key];
          return (
            <Pressable
              key={cat.key}
              style={[
                styles.categoryRow,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: isOn ? theme.link + "40" : theme.border,
                },
              ]}
              onPress={() => togglePref(cat.key)}
            >
              <View style={[styles.catIcon, { backgroundColor: (isOn ? theme.link : theme.textTertiary) + "15" }]}>
                <Feather name={cat.icon} size={18} color={isOn ? theme.link : theme.textTertiary} />
              </View>
              <View style={styles.catInfo}>
                <ThemedText style={[styles.catLabel, { color: theme.text }]}>
                  {cat.label}
                </ThemedText>
                <ThemedText style={[styles.catDescription, { color: theme.textSecondary }]}>
                  {cat.description}
                </ThemedText>
              </View>
              <Switch
                value={isOn}
                onValueChange={() => togglePref(cat.key)}
                trackColor={{ true: theme.link, false: theme.border }}
              />
            </Pressable>
          );
        })}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable
            style={[styles.quickBtn, { borderColor: theme.border }]}
            onPress={() => {
              const all: Record<string, boolean> = {};
              for (const cat of CATEGORIES) all[cat.key] = true;
              setPrefs(all);
            }}
          >
            <Feather name="check-circle" size={14} color={theme.link} />
            <ThemedText style={[styles.quickBtnText, { color: theme.link }]}>
              Share All
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.quickBtn, { borderColor: theme.border }]}
            onPress={() => {
              const none: Record<string, boolean> = {};
              for (const cat of CATEGORIES) none[cat.key] = false;
              setPrefs(none);
            }}
          >
            <Feather name="x-circle" size={14} color={theme.textSecondary} />
            <ThemedText style={[styles.quickBtnText, { color: theme.textSecondary }]}>
              Share None
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Button
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.cancelBtn}
        >
          Cancel
        </Button>
        <Button
          onPress={() => acceptMutation.mutate()}
          disabled={acceptMutation.isPending}
          style={styles.acceptBtn}
        >
          {acceptMutation.isPending ? "Connecting..." : `Accept & Connect`}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  topBarTitle: { fontSize: 14, fontWeight: "500" },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerCard: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  headerTitle: { marginBottom: Spacing.sm, textAlign: "center" },
  headerDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  headerNote: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    fontStyle: "italic",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  catInfo: { flex: 1 },
  catLabel: { fontSize: 15, fontWeight: "600" },
  catDescription: { fontSize: 12, marginTop: 2 },
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  quickBtnText: { fontSize: 13, fontWeight: "500" },
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  cancelBtn: { flex: 1 },
  acceptBtn: { flex: 2 },
});
