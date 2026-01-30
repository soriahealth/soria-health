import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function NewPatientFormScreen() {
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
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openDrawer();
          }}
        >
          <Feather name="sidebar" size={20} color={theme.text} />
        </Pressable>
      </View>

      <ThemedText type="h2" style={styles.title}>
        New Patient Form
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Generate forms for new healthcare providers
      </ThemedText>

      <View style={[styles.infoCard, { backgroundColor: "#DBEAFE", borderLeftColor: theme.primary }]}>
        <Feather name="info" size={18} color={theme.primary} />
        <ThemedText style={[styles.infoText, { color: theme.text }]}>
          Create a comprehensive patient intake form with your medical history, medications, and family health information.
        </ThemedText>
      </View>

      <View style={styles.optionsContainer}>
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Form Templates
        </ThemedText>

        <Pressable
          style={[styles.optionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[styles.optionIcon, { backgroundColor: "#DBEAFE" }]}>
            <Feather name="file-text" size={24} color={theme.primary} />
          </View>
          <View style={styles.optionContent}>
            <ThemedText style={styles.optionTitle}>Standard Intake Form</ThemedText>
            <ThemedText style={[styles.optionDescription, { color: theme.textSecondary }]}>
              Basic patient information, allergies, and current medications
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textTertiary} />
        </Pressable>

        <Pressable
          style={[styles.optionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[styles.optionIcon, { backgroundColor: "#D1FAE5" }]}>
            <Feather name="heart" size={24} color={theme.success} />
          </View>
          <View style={styles.optionContent}>
            <ThemedText style={styles.optionTitle}>Comprehensive Health History</ThemedText>
            <ThemedText style={[styles.optionDescription, { color: theme.textSecondary }]}>
              Full medical history including family conditions
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textTertiary} />
        </Pressable>

        <Pressable
          style={[styles.optionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[styles.optionIcon, { backgroundColor: "#FEF3C7" }]}>
            <Feather name="users" size={24} color={theme.warning} />
          </View>
          <View style={styles.optionContent}>
            <ThemedText style={styles.optionTitle}>Pediatric Form</ThemedText>
            <ThemedText style={[styles.optionDescription, { color: theme.textSecondary }]}>
              Child-specific form with immunization records
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textTertiary} />
        </Pressable>
      </View>

      <Pressable
        style={[styles.generateButton, { backgroundColor: theme.primary }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <Feather name="download" size={20} color="#FFFFFF" />
        <ThemedText style={styles.generateButtonText}>Generate PDF Form</ThemedText>
      </Pressable>
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
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
