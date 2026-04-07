import React, { ReactNode } from "react";
import { StyleSheet, TouchableOpacity, ViewStyle, StyleProp, Platform } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export default function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (variant === "outline") return "transparent";
    if (variant === "secondary") return theme.backgroundSecondary;
    return theme.link;
  };

  const getBorderColor = () => {
    if (variant === "outline") return theme.border;
    return "transparent";
  };

  const getTextColor = () => {
    if (variant === "outline") return theme.link;
    if (variant === "secondary") return theme.text;
    return theme.buttonText;
  };

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? 1 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <ThemedText
        type="body"
        style={[styles.buttonText, { color: getTextColor() }]}
      >
        {children}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
});
