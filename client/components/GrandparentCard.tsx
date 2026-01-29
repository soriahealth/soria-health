import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface Condition {
  name: string;
  age: number;
}

interface GrandparentCardProps {
  name: string;
  relationship: string;
  conditions: Condition[];
}

export function GrandparentCard({
  name,
  relationship,
  conditions,
}: GrandparentCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        Shadows.card,
      ]}
    >
      <ThemedText type="body" style={styles.name}>
        {name}
      </ThemedText>
      <ThemedText style={[styles.relationship, { color: theme.textSecondary }]}>
        {relationship}
      </ThemedText>
      <View style={styles.conditionsContainer}>
        {conditions.map((condition, index) => (
          <View key={index} style={styles.conditionRow}>
            <View
              style={[
                styles.conditionTag,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <ThemedText style={[styles.conditionName, { color: theme.text }]}>
                {condition.name}
              </ThemedText>
            </View>
            <ThemedText style={[styles.conditionAge, { color: theme.textSecondary }]}>
              Age {condition.age}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  name: {
    fontWeight: "600",
    marginBottom: 2,
  },
  relationship: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  conditionsContainer: {
    gap: Spacing.sm,
  },
  conditionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conditionTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  conditionName: {
    fontSize: 13,
    fontWeight: "500",
  },
  conditionAge: {
    fontSize: 13,
  },
});
