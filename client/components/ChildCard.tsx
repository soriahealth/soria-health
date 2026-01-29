import React from "react";
import { StyleSheet, Pressable } from "react-native";
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
import { Child } from "@/types/health";

interface ChildCardProps {
  child: Child;
  isSelected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ChildCard({ child, isSelected, onPress }: ChildCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? theme.link : theme.backgroundDefault,
          borderColor: isSelected ? theme.link : theme.border,
        },
        animatedStyle,
      ]}
    >
      <Feather
        name="user"
        size={16}
        color={isSelected ? "#FFFFFF" : theme.textSecondary}
      />
      <ThemedText
        style={[
          styles.name,
          { color: isSelected ? "#FFFFFF" : theme.text },
        ]}
      >
        {child.name}
      </ThemedText>
      <ThemedText
        style={[
          styles.age,
          {
            backgroundColor: isSelected
              ? "rgba(255,255,255,0.2)"
              : theme.backgroundSecondary,
            color: isSelected ? "#FFFFFF" : theme.textSecondary,
          },
        ]}
      >
        Age {child.age}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.sm,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
  },
  age: {
    fontSize: 11,
    fontWeight: "500",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
});
