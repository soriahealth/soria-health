import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { InfoCard } from "@/components/InfoCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ConditionTag } from "@/components/ConditionTag";
import { GrandparentCard } from "@/components/GrandparentCard";
import { PreventiveCareCard } from "@/components/PreventiveCareCard";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { grandparents, parents, preventiveCareTimeline } from "@/data/mockData";

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
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();

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
          <Feather name="menu" size={22} color={theme.text} />
        </Pressable>
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="sun" size={20} color={theme.text} />
        </Pressable>
      </View>

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

      <ThemedText style={[styles.groupLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>
        Parents
      </ThemedText>

      {parents.map((parent) => (
        <GrandparentCard
          key={parent.id}
          name={parent.name}
          relationship={parent.relationship}
          conditions={parent.conditions}
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
          This preventive care timeline is based on general medical guidelines and your family history. The recommended screening ages are typically 10 years before the earliest age of diagnosis in your family members.
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
              Screening ages may be adjusted based on additional risk factors or symptoms
            </ThemedText>
          </View>
          <View style={styles.bulletItem}>
            <ThemedText style={styles.bullet}>•</ThemedText>
            <ThemedText style={[styles.bulletText, { color: theme.text }]}>
              Lifestyle modifications can significantly reduce your risk for hereditary conditions
            </ThemedText>
          </View>
          <View style={styles.bulletItem}>
            <ThemedText style={styles.bullet}>•</ThemedText>
            <ThemedText style={[styles.bulletText, { color: theme.text }]}>
              Share this information with your doctors during annual check-ups
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
