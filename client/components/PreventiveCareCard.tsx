import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { PreventiveCareItem } from "@/types/health";

interface PreventiveCareCardProps {
  item: PreventiveCareItem;
}

export function PreventiveCareCard({ item }: PreventiveCareCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        Shadows.card,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <ThemedText type="h4" style={styles.condition}>
            {item.condition}
          </ThemedText>
          <ThemedText style={[styles.testType, { color: theme.textSecondary }]}>
            {item.testType}
          </ThemedText>
        </View>
        <View style={styles.ageSection}>
          <ThemedText style={[styles.startAge, { color: theme.link }]}>
            Age {item.startAge}
          </ThemedText>
          <ThemedText style={[styles.startLabel, { color: theme.textTertiary }]}>
            Start screening
          </ThemedText>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <ThemedText style={[styles.detailLabel, { color: theme.text }]}>
            Frequency:
          </ThemedText>
          <ThemedText style={[styles.detailValue, { color: theme.textSecondary }]}>
            {item.frequency}
          </ThemedText>
        </View>
        <View style={styles.reasonRow}>
          <ThemedText style={[styles.detailLabel, { color: theme.text }]}>
            Reason:
          </ThemedText>
          <ThemedText style={[styles.reasonValue, { color: theme.textSecondary }]}>
            {item.reason}
          </ThemedText>
        </View>
      </View>

      <View style={styles.membersSection}>
        <ThemedText style={[styles.membersLabel, { color: theme.textSecondary }]}>
          Family Members Affected:
        </ThemedText>
        {item.affectedMembers.map((member, index) => (
          <View
            key={index}
            style={[styles.memberTag, { backgroundColor: theme.backgroundSecondary }]}
          >
            <ThemedText style={[styles.memberText, { color: theme.text }]}>
              {member}
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
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  titleSection: {
    flex: 1,
  },
  condition: {
    marginBottom: 2,
  },
  testType: {
    fontSize: 14,
  },
  ageSection: {
    alignItems: "flex-end",
  },
  startAge: {
    fontSize: 18,
    fontWeight: "600",
  },
  startLabel: {
    fontSize: 12,
  },
  details: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: Spacing.sm,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  reasonRow: {
    marginTop: Spacing.xs,
  },
  reasonValue: {
    fontSize: 14,
    marginTop: 2,
  },
  membersSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: Spacing.md,
  },
  membersLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  memberTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.xs,
  },
  memberText: {
    fontSize: 13,
  },
});
