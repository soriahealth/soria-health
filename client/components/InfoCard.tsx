import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface InfoCardProps {
  title: string;
  message: string;
  variant?: "info" | "warning" | "success";
  onDismiss?: () => void;
}

export function InfoCard({
  title,
  message,
  variant = "info",
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
        return `${theme.warning}15`;
      case "success":
        return `${theme.success}15`;
      default:
        return `${theme.info}15`;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="info" size={20} color={getBorderColor()} />
        </View>
        <View style={styles.textContainer}>
          <ThemedText type="body" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </ThemedText>
        </View>
        {onDismiss ? (
          <Feather
            name="x"
            size={20}
            color={theme.textTertiary}
            onPress={onDismiss}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});
