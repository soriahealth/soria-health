import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

/**
 * SSOButtons — "Continue with Google" and "Continue with Apple" buttons.
 *
 * MVP: prompts for email via Alert since real OAuth requires native SDKs
 * and App Store / Google Cloud Console setup.
 *
 * Production: replace with expo-auth-session (Google) and
 * expo-apple-authentication (Apple) when credentials are configured.
 */

interface SSOButtonsProps {
  onSuccess: () => void;
}

export default function SSOButtons({ onSuccess }: SSOButtonsProps) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);

  const handleSSO = async (provider: "google" | "apple") => {
    if (Platform.OS === "web") {
      const email = window.prompt(
        `Enter your email to continue with ${provider === "google" ? "Google" : "Apple"}:`
      );
      if (!email) return;
      await performSSOLogin(provider, email);
    } else {
      Alert.prompt(
        `Continue with ${provider === "google" ? "Google" : "Apple"}`,
        "Enter your email address:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: (email?: string) => {
              if (email) performSSOLogin(provider, email);
            },
          },
        ],
        "plain-text",
        "",
        "email-address"
      );
    }
  };

  const performSSOLogin = async (provider: "google" | "apple", email: string) => {
    setLoading(provider);
    try {
      const endpoint = provider === "google" ? "/api/auth/google" : "/api/auth/apple";
      await apiRequest("POST", endpoint, {
        idToken: "mvp-dev-token",
        email,
        name: "",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      onSuccess();
    } catch (err: any) {
      const msg = err?.message?.replace(/^\d+:\s*/, "") || "Something went wrong";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Sign In Error", msg);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Google Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: "#FFFFFF",
            borderColor: theme.border,
            borderWidth: 1,
          },
        ]}
        onPress={() => handleSSO("google")}
        disabled={loading !== null}
        activeOpacity={0.7}
      >
        <View style={styles.googleIcon}>
          <ThemedText style={styles.googleG}>G</ThemedText>
        </View>
        <ThemedText style={[styles.buttonText, { color: "#1F1F1F" }]}>
          {loading === "google" ? "Signing in..." : "Continue with Google"}
        </ThemedText>
      </TouchableOpacity>

      {/* Apple Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: "#000000",
          },
        ]}
        onPress={() => handleSSO("apple")}
        disabled={loading !== null}
        activeOpacity={0.7}
      >
        <Feather name="command" size={18} color="#FFFFFF" />
        <ThemedText style={[styles.buttonText, { color: "#FFFFFF" }]}>
          {loading === "apple" ? "Signing in..." : "Continue with Apple"}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4285F4",
    lineHeight: 22,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
