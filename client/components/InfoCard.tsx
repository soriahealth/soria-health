import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface InfoCardProps {
  title: string;
  message: string;
  variant?: "info" | "warning" | "success";
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export function InfoCard({
  title,
  message,
  variant = "warning",
  badge,
  actionLabel = "Learn More",
  onAction,
  onDismiss,
}: InfoCardProps) {
  const { theme } = useTheme();

  const getBorderColor = () => {
    switch (variant) {
      case "warning":
        return theme.warning;
      case "success":
        return theme.success;
      default:
        return theme.info;
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case "warning":
        return "#FEF3C7";
      case "success":
        return "#D1FAE5";
      default:
        return "#DBEAFE";
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderLeftColor: getBorderColor(),
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Feather name="info" size={18} color={getBorderColor()} style={styles.icon} />
          <ThemedText type="body" style={[styles.title, { color: theme.text }]}>
            {title}
          </ThemedText>
          {badge ? (
            <View style={[styles.badge, { borderColor: theme.textTertiary }]}>
              <ThemedText style={[styles.badgeText, { color: theme.textSecondary }]}>
                {badge}
              </ThemedText>
            </View>
          ) : null}
        </View>
        {onDismiss ? (
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Feather name="x" size={20} color={theme.textTertiary} />
          </Pressable>
        ) : null}
      </View>
      <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
        {message}
      </ThemedText>
      {onAction ? (
        <Pressable onPress={onAction}>
          <ThemedText style={[styles.actionText, { color: theme.text }]}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : (
        <ThemedText style={[styles.actionText, { color: theme.text }]}>
          {actionLabel}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
  },
  icon: {
    marginTop: 1,
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
  },
  badge: {
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
