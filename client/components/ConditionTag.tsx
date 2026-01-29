import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ConditionTagProps {
  name: string;
  count?: number;
}

export function ConditionTag({ name, count }: ConditionTagProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <ThemedText style={[styles.name, { color: theme.textSecondary }]}>
        {name}
      </ThemedText>
      {count !== undefined && count > 0 ? (
        <ThemedText style={[styles.count, { color: theme.textTertiary }]}>
          ({count})
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: 13,
    fontWeight: "500",
  },
  count: {
    fontSize: 13,
    marginLeft: 4,
  },
});
