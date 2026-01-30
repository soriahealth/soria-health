import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HealthMetric } from "@/types/health";

interface MetricCardProps {
  metric: HealthMetric;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MetricCard({ metric, onPress }: MetricCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Updated today";
    if (diffDays === 1) return "Updated yesterday";
    if (diffDays < 7) return `Updated ${diffDays} days ago`;
    return "Updated On file";
  };

  const getMetricLabel = (type: string) => {
    switch (type) {
      case "blood_pressure":
        return "Blood Pressure";
      case "heart_rate":
        return "Heart Rate";
      case "blood_type":
        return "Blood Type";
      case "weight":
        return "Weight";
      case "height":
        return "Height";
      case "glucose":
        return "Glucose";
      default:
        return type;
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <ThemedText style={[styles.label, { color: theme.text }]}>
          {getMetricLabel(metric.type)}
        </ThemedText>
        <Feather
          name={metric.icon as any}
          size={20}
          color={theme.success}
        />
      </View>
      <View style={styles.valueContainer}>
        <ThemedText type="h3" style={styles.value}>
          {metric.value}
        </ThemedText>
        {metric.unit ? (
          <ThemedText style={[styles.unit, { color: theme.textSecondary }]}>
            {metric.unit}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText style={[styles.updated, { color: theme.textTertiary }]}>
        {getTimeAgo(metric.updatedAt)}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.xs,
  },
  value: {
    fontWeight: "700",
  },
  unit: {
    fontSize: 14,
    marginLeft: Spacing.xs,
  },
  updated: {
    fontSize: 12,
  },
});
