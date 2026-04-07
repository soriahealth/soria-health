import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import SSOButtons from "@/components/SSOButtons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing["3xl"],
          paddingBottom: insets.bottom + Spacing["2xl"],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.logoContainer, { backgroundColor: theme.link }]}>
          <Feather name="activity" size={40} color="#FFFFFF" />
        </View>
        <ThemedText type="h2" style={styles.title}>
          Soria
        </ThemedText>
        <ThemedText
          style={[styles.tagline, { color: theme.textSecondary }]}
        >
          Your family's health, organized and accessible.
        </ThemedText>
      </View>

      <View style={styles.buttons}>
        <Button onPress={() => navigation.navigate("SignUp")}>
          Create Account
        </Button>
        <Button
          variant="outline"
          onPress={() => navigation.navigate("Login")}
          style={styles.loginButton}
        >
          Log In
        </Button>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <ThemedText style={[styles.dividerText, { color: theme.textSecondary }]}>
            or
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <SSOButtons onSuccess={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["2xl"],
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  title: {
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  buttons: {
    gap: Spacing.md,
  },
  loginButton: {
    marginTop: 0,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: 14,
  },
});
