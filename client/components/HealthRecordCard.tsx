import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface HealthRecordCardProps {
  title: string;
  subtitle?: string;
  status?: string;
  date?: string;
  isPrivate?: boolean;
  onPress: () => void;
}

export function HealthRecordCard({ title, subtitle, status, date, isPrivate, onPress }: HealthRecordCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
    >
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {isPrivate && (
            <Feather name="lock" size={13} color={theme.textTertiary} style={styles.lockIcon} />
          )}
        </View>
        {subtitle ? (
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </ThemedText>
        ) : null}
        {date ? (
          <ThemedText style={[styles.date, { color: theme.textTertiary }]}>
            {date}
          </ThemedText>
        ) : null}
      </View>
      <View style={styles.right}>
        {status ? (
          <View style={[styles.statusBadge, { backgroundColor: `${theme.success}20` }]}>
            <ThemedText style={[styles.statusText, { color: theme.success }]}>
              {status}
            </ThemedText>
          </View>
        ) : null}
        <Feather name="chevron-right" size={18} color={theme.textTertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  lockIcon: {
    marginLeft: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
