import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { InfoCard } from "@/components/InfoCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ConditionTag } from "@/components/ConditionTag";
import { GrandparentCard } from "@/components/GrandparentCard";
import { PreventiveCareCard } from "@/components/PreventiveCareCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import {
  familyConditions,
  grandparents,
  preventiveCareTimeline,
} from "@/data/mockData";

const conditionsWithCounts = [
  { name: "Alzheimer's Disease", count: 1 },
  { name: "Anxiety", count: 1 },
  { name: "Breast Cancer", count: 1 },
  { name: "Colon Cancer", count: 1 },
  { name: "Glaucoma", count: 1 },
  { name: "Heart Disease", count: 1 },
  { name: "High Blood Pressure", count: 2 },
  { name: "High Cholesterol", count: 2 },
  { name: "Osteoporosis", count: 1 },
  { name: "Pre-Diabetes", count: 1 },
  { name: "Type 2 Diabetes", count: 2 },
];

export default function FamilyHistoryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText type="h2" style={styles.title}>
        Family Medical History
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Track hereditary conditions and get personalized preventive care recommendations.
      </ThemedText>

      <InfoCard
        title="Genetic Predisposition Alert"
        message="Based on your family history, you may have increased risk for 11 conditions. Early screening and preventive care can significantly reduce your risk."
        variant="info"
      />

      <SectionHeader
        title="Family Tree & Conditions"
        icon="users"
        subtitle="Medical conditions in your immediate family members"
      />

      <ThemedText style={[styles.groupLabel, { color: theme.textSecondary }]}>
        Grandparents
      </ThemedText>

      {grandparents.map((gp) => (
        <GrandparentCard
          key={gp.id}
          name={gp.name}
          relationship={gp.relationship}
          conditions={gp.conditions}
        />
      ))}

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

      <SectionHeader
        title="Recommended Preventive Care Timeline"
        icon="clipboard"
        subtitle="Personalized screening schedule based on your family medical history"
      />

      {preventiveCareTimeline.map((item) => (
        <PreventiveCareCard key={item.id} item={item} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
