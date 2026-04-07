import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ThemeMode = "light" | "dark" | "system";

const BIOMETRIC_KEY = "@soria_biometric_enabled";

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
  destructive,
  theme,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  theme: any;
}) {
  return (
    <Pressable
      style={[styles.settingsRow, { borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <Feather
        name={icon}
        size={18}
        color={destructive ? theme.error : theme.textSecondary}
      />
      <ThemedText
        style={[
          styles.rowLabel,
          { color: destructive ? theme.error : theme.text },
        ]}
      >
        {label}
      </ThemedText>
      {value && (
        <ThemedText style={[styles.rowValue, { color: theme.textTertiary }]}>
          {value}
        </ThemedText>
      )}
      {rightElement}
      {onPress && !rightElement && (
        <Feather name="chevron-right" size={16} color={theme.textTertiary} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, mode, setMode, toggle } = useTheme();
  const { logout, user, profile } = useAuth();
  const navigation = useNavigation<Nav>();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState("");

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);

    if (compatible) {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("Face ID");
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType("Touch ID");
      } else {
        setBiometricType("Biometrics");
      }
    }

    const stored = await AsyncStorage.getItem(BIOMETRIC_KEY);
    setBiometricEnabled(stored === "true");
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Enable ${biometricType} for Soria`,
        cancelLabel: "Cancel",
      });
      if (result.success) {
        setBiometricEnabled(true);
        await AsyncStorage.setItem(BIOMETRIC_KEY, "true");
      }
    } else {
      setBiometricEnabled(false);
      await AsyncStorage.setItem(BIOMETRIC_KEY, "false");
    }
  };

  const handleThemeChange = () => {
    Alert.alert("Appearance", "Choose your theme", [
      { text: "Light", onPress: () => setMode("light") },
      { text: "Dark", onPress: () => setMode("dark") },
      { text: "System", onPress: () => setMode("system") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const themeLabel = mode === "system" ? "System" : mode === "dark" ? "Dark" : "Light";

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.prompt(
              "Confirm Deletion",
              "Enter your password to confirm account deletion.",
              async (password) => {
                if (!password) return;
                try {
                  await apiRequest("DELETE", "/api/auth/delete-account", { password });
                  await logout();
                } catch (err: any) {
                  Alert.alert("Error", err.message || "Failed to delete account.");
                }
              },
              "secure-text"
            );
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4">Settings</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Account
        </ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <SettingsRow
            icon="user"
            label="Profile"
            value={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`}
            onPress={() => navigation.navigate("Profile")}
            theme={theme}
          />
          <SettingsRow
            icon="mail"
            label="Email"
            value={user?.email}
            theme={theme}
          />
          <SettingsRow
            icon="clipboard"
            label="Health Profile"
            onPress={() => navigation.navigate("HealthIntake")}
            theme={theme}
          />
        </View>

        {/* Security */}
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Security
        </ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {biometricAvailable && (
            <SettingsRow
              icon="smartphone"
              label={biometricType}
              theme={theme}
              rightElement={
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ true: theme.link, false: theme.border }}
                />
              }
            />
          )}
          <SettingsRow
            icon="lock"
            label="Change Password"
            onPress={() => navigation.navigate("ChangePassword")}
            theme={theme}
          />
        </View>

        {/* Appearance */}
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Appearance
        </ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <SettingsRow
            icon={isDark ? "moon" : "sun"}
            label="Theme"
            value={themeLabel}
            onPress={handleThemeChange}
            theme={theme}
          />
        </View>

        {/* Family & Privacy */}
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Family & Privacy
        </ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <SettingsRow
            icon="users"
            label="Family Network"
            onPress={() => navigation.navigate("Family")}
            theme={theme}
          />
          <SettingsRow
            icon="home"
            label="Household Manager"
            onPress={() => navigation.navigate("HouseholdDashboard")}
            theme={theme}
          />
          <SettingsRow
            icon="shield"
            label="Privacy Settings"
            onPress={() => navigation.navigate("Reports")}
            theme={theme}
          />
        </View>

        {/* Data */}
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Data
        </ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <SettingsRow
            icon="folder"
            label="Health Records"
            onPress={() => navigation.navigate("Reports")}
            theme={theme}
          />
          <SettingsRow
            icon="file-text"
            label="Documents"
            onPress={() => navigation.navigate("Documents")}
            theme={theme}
          />
        </View>

        {/* About */}
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          About
        </ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <SettingsRow
            icon="info"
            label="App Version"
            value="1.0.0"
            theme={theme}
          />
          <SettingsRow
            icon="file"
            label="Privacy Policy"
            onPress={() => navigation.navigate("PrivacyPolicy")}
            theme={theme}
          />
          <SettingsRow
            icon="file"
            label="Terms of Service"
            onPress={() => navigation.navigate("TermsOfService")}
            theme={theme}
          />
        </View>

        {/* Danger Zone */}
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Danger Zone
        </ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <SettingsRow
            icon="log-out"
            label="Log Out"
            onPress={handleLogout}
            destructive
            theme={theme}
          />
          <SettingsRow
            icon="trash-2"
            label="Delete Account"
            onPress={handleDeleteAccount}
            destructive
            theme={theme}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  sectionCard: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 14,
  },
});
