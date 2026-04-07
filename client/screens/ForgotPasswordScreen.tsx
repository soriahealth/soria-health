import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { FormField } from "@/components/FormField";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendReset = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      setSuccess("If that email exists, a reset link has been sent. Check your email for the reset code.");
      setStep("reset");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    if (!token.trim()) {
      setError("Please enter the reset code");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/\d/.test(newPassword)) {
      setError("Password must contain at least one number");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", {
        token,
        newPassword,
      });
      setSuccess("Password reset successfully! You can now log in with your new password.");
      setTimeout(() => navigation.navigate("Login"), 2000);
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      setError(msg.replace(/^\d+:\s*/, ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3" style={styles.headerTitle}>
          Reset Password
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconCircle, { backgroundColor: theme.link + "15" }]}>
          <Feather name="lock" size={28} color={theme.link} />
        </View>

        {step === "email" ? (
          <>
            <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
              Enter your email address and we'll send you a code to reset your
              password.
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

            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button onPress={handleSendReset} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
          </>
        ) : (
          <>
            <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
              Enter the reset code from your email and choose a new password.
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

            <FormField
              label="Reset Code"
              value={token}
              onChangeText={setToken}
              placeholder="Enter the code from your email"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <FormField
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 8 characters"
              secureTextEntry
            />
            <FormField
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your new password"
              secureTextEntry
            />

            <Button onPress={handleResetPassword} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>

            <Pressable
              onPress={() => {
                setStep("email");
                setError("");
                setSuccess("");
              }}
              style={styles.backLink}
            >
              <ThemedText style={[styles.backLinkText, { color: theme.link }]}>
                Didn't receive a code? Try again
              </ThemedText>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    textAlign: "center",
  },
  form: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.lg,
    alignItems: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
    alignSelf: "stretch",
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
  },
  backLink: {
    marginTop: Spacing.xl,
    alignItems: "center",
  },
  backLinkText: {
    fontSize: 14,
  },
});
