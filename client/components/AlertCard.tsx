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
import { HealthAlert } from "@/types/health";

interface AlertCardProps {
  alert: HealthAlert;
  onPress?: () => void;
  onDismiss?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AlertCard({ alert, onPress, onDismiss }: AlertCardProps) {
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

  const getBorderColor = () => {
    switch (alert.severity) {
      case "urgent":
        return theme.error;
      case "warning":
        return theme.warning;
      default:
        return theme.info;
    }
  };

  const getIcon = () => {
    switch (alert.severity) {
      case "urgent":
        return "alert-triangle";
      case "warning":
        return "alert-triangle";
      default:
        return "info";
    }
  };

  const getCategoryLabel = () => {
    switch (alert.category) {
      case "preventative":
        return "Preventative";
      case "medication":
        return "Medication";
      case "appointment":
        return "Appointment";
      default:
        return "General";
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
          borderLeftColor: getBorderColor(),
        },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Feather name={getIcon() as any} size={18} color={getBorderColor()} />
          <ThemedText type="body" style={styles.title}>
            {alert.title}
          </ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText style={[styles.badgeText, { color: theme.textSecondary }]}>
            {getCategoryLabel()}
          </ThemedText>
        </View>
      </View>
      <ThemedText
        style={[styles.description, { color: theme.textSecondary }]}
        numberOfLines={3}
      >
        {alert.description}
      </ThemedText>
      <Pressable
        onPress={handlePress}
        hitSlop={8}
      >
        <ThemedText style={[styles.learnMore, { color: theme.link }]}>
          Learn More
        </ThemedText>
      </Pressable>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 4,
    marginBottom: Spacing.md,
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
  title: {
    fontWeight: "600",
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  learnMore: {
    fontSize: 14,
    fontWeight: "500",
  },
});
