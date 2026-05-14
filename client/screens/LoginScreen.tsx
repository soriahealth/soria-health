import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { FormField } from "@/components/FormField";
import Button from "@/components/Button";
import SSOButtons from "@/components/SSOButtons";
import { KeyboardSafeView } from "@/components/KeyboardSafeView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { loginSchema } from "@shared/schema";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BIOMETRIC_KEY = "@soria_biometric_enabled";
const SAVED_EMAIL_KEY = "@soria_saved_email";

export default function LoginScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState("");

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
    if (enabled !== "true") return;

    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!compatible || !enrolled) return;

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      setBiometricType("Face ID");
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      setBiometricType("Touch ID");
    } else {
      setBiometricType("Biometrics");
    }
    setBiometricAvailable(true);

    // Load saved email
    const savedEmail = await AsyncStorage.getItem(SAVED_EMAIL_KEY);
    if (savedEmail) setEmail(savedEmail);
  };

  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Log in with ${biometricType}`,
      cancelLabel: "Use password",
    });
    if (result.success) {
      // Biometric verified — user still needs password for API auth
      // This serves as a convenience gate, actual auth still requires credentials
      // Focus the password field
    }
  };

  const handleLogin = async () => {
    setError("");
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Save email for biometric convenience
      await AsyncStorage.setItem(SAVED_EMAIL_KEY, email);
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      const cleaned = msg.replace(/^\d+:\s*/, "");
      setError(cleaned);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardSafeView>
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
          Log In
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View
            style={[
              styles.errorBox,
              { backgroundColor: theme.error + "15", borderColor: theme.error },
            ]}
          >
            <ThemedText style={[styles.errorText, { color: theme.error }]}>
              {error}
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
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />

        <Button onPress={handleLogin} disabled={loading}>
          {loading ? "Logging In..." : "Log In"}
        </Button>

        {biometricAvailable && (
          <Pressable
            style={[styles.biometricBtn, { borderColor: theme.border }]}
            onPress={handleBiometricLogin}
          >
            <Feather
              name={biometricType === "Face ID" ? "eye" : "smartphone"}
              size={20}
              color={theme.link}
            />
            <ThemedText style={[styles.biometricText, { color: theme.link }]}>
              Log in with {biometricType}
            </ThemedText>
          </Pressable>
        )}

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <ThemedText style={[styles.dividerText, { color: theme.textSecondary }]}>
            or
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <SSOButtons onSuccess={() => {}} />

        <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
          <ThemedText
            style={[styles.forgotPassword, { color: theme.link }]}
          >
            Forgot password?
          </ThemedText>
        </Pressable>
      </ScrollView>
    </View>
    </KeyboardSafeView>
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
  },
  errorBox: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  errorText: {
    fontSize: 14,
  },
  biometricBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: 14,
  },
  forgotPassword: {
    textAlign: "center",
    marginTop: Spacing.xl,
    fontSize: 14,
  },
});
