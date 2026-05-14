import React from "react";
import { KeyboardAvoidingView, Platform, StyleProp, ViewStyle } from "react-native";

/**
 * Wraps content so the on-screen keyboard pushes the active input
 * into view instead of covering it. Drop this in around any screen
 * that has inputs.
 */
export function KeyboardSafeView({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
