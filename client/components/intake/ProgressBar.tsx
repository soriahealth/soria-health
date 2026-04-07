import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const SECTION_NAMES = [
  "Basic Vitals",
  "Medical History",
  "Medications",
  "Allergies",
  "Surgeries",
  "Social History",
  "Review",
];

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const { theme } = useTheme();
  const progress = (currentStep + 1) / totalSteps;

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
        Section {currentStep + 1} of {totalSteps} — {SECTION_NAMES[currentStep]}
      </ThemedText>
      <View style={[styles.track, { backgroundColor: theme.backgroundTertiary }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: theme.link, width: `${progress * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});
