import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

const CODE_LENGTH = 6;

export default function EmailVerificationScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRef = useRef<TextInput>(null);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Start with 30s cooldown (code was just sent on signup)
  useEffect(() => {
    setResendCooldown(30);
  }, []);

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/verify-email", { code });
      setSuccess("Email verified!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Refresh auth state so the navigator moves on
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    } catch (err: any) {
      const msg = err?.message || "Verification failed";
      setError(msg.replace(/^\d+:\s*/, ""));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setError("");
    setSuccess("");
    try {
      await apiRequest("POST", "/api/auth/resend-verification");
      setSuccess("A new code has been sent to your email");
      setResendCooldown(30);
      setCode("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err: any) {
      const msg = err?.message || "Failed to resend code";
      setError(msg.replace(/^\d+:\s*/, ""));
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow digits
    const digits = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    setError("");
    if (digits.length === CODE_LENGTH) {
      Keyboard.dismiss();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing["2xl"],
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: theme.link + "15" }]}>
          <Feather name="mail" size={32} color={theme.link} />
        </View>

        <ThemedText type="h2" style={styles.title}>
          Verify Your Email
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          We sent a 6-digit code to
        </ThemedText>
        <ThemedText style={styles.email}>
          {user?.email || "your email"}
        </ThemedText>

        {error ? (
          <View
            style={[
              styles.messageBox,
              { backgroundColor: theme.error + "15", borderColor: theme.error },
            ]}
          >
            <ThemedText style={[styles.messageText, { color: theme.error }]}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        {success ? (
          <View
            style={[
              styles.messageBox,
              { backgroundColor: theme.success + "15", borderColor: theme.success },
            ]}
          >
            <ThemedText style={[styles.messageText, { color: theme.success }]}>
              {success}
            </ThemedText>
          </View>
        ) : null}

        <Pressable
          style={styles.codeInputContainer}
          onPress={() => inputRef.current?.focus()}
        >
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.codeBox,
                {
                  borderColor:
                    i === code.length
                      ? theme.link
                      : code[i]
                        ? theme.text
                        : theme.border,
                  backgroundColor: theme.backgroundDefault,
                },
              ]}
            >
              <ThemedText style={styles.codeDigit}>
                {code[i] || ""}
              </ThemedText>
            </View>
          ))}
        </Pressable>

        {/* Hidden input to capture keyboard */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          autoFocus
        />

        <Button
          onPress={handleVerify}
          disabled={code.length !== CODE_LENGTH || loading}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </Button>

        <Pressable
          onPress={handleResend}
          disabled={resendCooldown > 0}
          style={styles.resendButton}
        >
          <ThemedText
            style={[
              styles.resendText,
              {
                color: resendCooldown > 0 ? theme.textTertiary : theme.link,
              },
            ]}
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Resend code"}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["2xl"],
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  email: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  messageBox: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    alignSelf: "stretch",
  },
  messageText: {
    fontSize: 14,
    textAlign: "center",
  },
  codeInputContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  codeDigit: {
    fontSize: 24,
    fontWeight: "700",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  resendButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  resendText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
