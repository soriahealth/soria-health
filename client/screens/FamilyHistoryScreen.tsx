import React from "react";
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { InfoCard } from "@/components/InfoCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ConditionTag } from "@/components/ConditionTag";
import { GrandparentCard } from "@/components/GrandparentCard";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { getQueryFn } from "@/lib/query-client";

type FamilyLink = {
  id: number;
  relatedProfileId: number;
  relationship: string;
  profile?: {
    id: number;
    firstName: string;
    lastName: string;
  };
};

type HealthSummary = {
  conditions?: { name: string; status?: string; diagnosisDate?: string }[];
  medications?: { name: string }[];
  allergies?: { allergen: string }[];
  surgeries?: { procedure: string }[];
};

export default function FamilyHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();

  const { data: familyLinks = [], isLoading } = useQuery<FamilyLink[]>({
    queryKey: ["/api/family"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: managedProfiles = [] } = useQuery<any[]>({
    queryKey: ["/api/family/managed"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Combine all family members with their conditions
  const allMembers = [
    ...managedProfiles.map((mp: any) => ({
      id: mp.id,
      name: `${mp.firstName} ${mp.lastName}`,
      relationship: mp.relationship || "Family Member",
      profileId: mp.id,
    })),
    ...familyLinks
      .filter((l) => l.profile)
      .map((l) => ({
        id: l.id,
        name: `${l.profile!.firstName} ${l.profile!.lastName}`,
        relationship: l.relationship,
        profileId: l.relatedProfileId,
      })),
  ];

  // Fetch health summaries for managed profiles
  const managedSummaries = useQuery<Record<number, HealthSummary>>({
    queryKey: ["/api/family-history/summaries", managedProfiles.map((m: any) => m.id)],
    queryFn: async () => {
      const results: Record<number, HealthSummary> = {};
      for (const mp of managedProfiles) {
        try {
          const res = await fetch(`/api/household/health-summary/${mp.id}`, { credentials: "include" });
          if (res.ok) results[mp.id] = await res.json();
        } catch {}
      }
      return results;
    },
    enabled: managedProfiles.length > 0,
  });

  // Build conditions summary from managed profiles
  const conditionCounts: Record<string, number> = {};
  if (managedSummaries.data) {
    for (const summary of Object.values(managedSummaries.data)) {
      for (const c of summary.conditions ?? []) {
        conditionCounts[c.name] = (conditionCounts[c.name] || 0) + 1;
      }
    }
  }
  const conditionsWithCounts = Object.entries(conditionCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Group members by relationship type
  const groupedMembers: Record<string, typeof allMembers> = {};
  for (const member of allMembers) {
    const group = member.relationship;
    if (!groupedMembers[group]) groupedMembers[group] = [];
    groupedMembers[group].push(member);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openDrawer();
          }}
        >
          <Feather name="sidebar" size={20} color={theme.text} />
        </Pressable>
      </View>

      <ThemedText type="h2" style={styles.title}>
        Family Medical History
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Track hereditary conditions and get personalized preventive care recommendations.
      </ThemedText>

      {conditionsWithCounts.length > 0 && (
        <InfoCard
          title="Genetic Predisposition Alert"
          message={`Based on your family history, you may have increased risk for ${conditionsWithCounts.length} conditions. Early screening and preventive care can significantly reduce your risk.`}
          variant="info"
        />
      )}

      <SectionHeader
        title="Family Tree & Conditions"
        icon="users"
        subtitle="Medical conditions in your immediate family members"
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.link} />
      ) : allMembers.length === 0 ? (
        <View style={[styles.conditionsCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.conditionsSubtitle, { color: theme.textSecondary }]}>
            No family members added yet. Add family members to see their medical history here.
          </ThemedText>
        </View>
      ) : (
        Object.entries(groupedMembers).map(([relationship, members]) => (
          <View key={relationship}>
            <ThemedText style={[styles.groupLabel, { color: theme.textSecondary }]}>
              {relationship}
            </ThemedText>
            {members.map((member) => {
              const summary = managedSummaries.data?.[member.profileId];
              const conditions = (summary?.conditions ?? []).map((c) => ({
                name: c.name,
                age: c.diagnosisDate ? new Date().getFullYear() - new Date(c.diagnosisDate).getFullYear() : 0,
              }));
              return (
                <GrandparentCard
                  key={member.id}
                  name={member.name}
                  relationship={member.relationship}
                  conditions={conditions}
                />
              );
            })}
          </View>
        ))
      )}

      {conditionsWithCounts.length > 0 && (
        <View
          style={[
            styles.conditionsCard,
            { backgroundColor: theme.backgroundDefault },
            Shadows.card,
          ]}
        >
          <View style={styles.conditionsHeader}>
            <Feather name="activity" size={22} color={theme.text} />
            <ThemedText type="h4" style={styles.conditionsTitle}>
              Conditions Summary
            </ThemedText>
          </View>
          <ThemedText
            style={[styles.conditionsSubtitle, { color: theme.textSecondary }]}
          >
            All hereditary conditions identified in your family history
          </ThemedText>
          <View style={styles.tagsContainer}>
            {conditionsWithCounts.map((condition, index) => (
              <ConditionTag
                key={index}
                name={condition.name}
                count={condition.count}
              />
            ))}
          </View>
        </View>
      )}

      <View
        style={[
          styles.importantNotesCard,
          { backgroundColor: theme.backgroundDefault },
          Shadows.card,
        ]}
      >
        <ThemedText type="h4" style={styles.importantNotesTitle}>
          Important Notes
        </ThemedText>
        <ThemedText style={[styles.importantNotesIntro, { color: theme.text }]}>
          This family medical history is based on the health records of your connected and managed family members.
        </ThemedText>
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <ThemedText style={styles.bullet}>•</ThemedText>
            <ThemedText style={[styles.bulletText, { color: theme.text }]}>
              Always consult with your healthcare provider for personalized recommendations
            </ThemedText>
          </View>
          <View style={styles.bulletItem}>
            <ThemedText style={styles.bullet}>•</ThemedText>
            <ThemedText style={[styles.bulletText, { color: theme.text }]}>
              Keep your family medical history updated as new information becomes available
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  conditionsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  conditionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  conditionsTitle: {
    fontWeight: "600",
  },
  conditionsSubtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  importantNotesCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  importantNotesTitle: {
    marginBottom: Spacing.md,
  },
  importantNotesIntro: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  bulletList: {
    gap: Spacing.sm,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 14,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
