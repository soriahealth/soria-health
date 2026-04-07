import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ROLES = [
  {
    id: "self",
    icon: "user" as const,
    title: "Managing my own health",
    description: "Track your personal health records and history",
  },
  {
    id: "family",
    icon: "users" as const,
    title: "Managing my family's health",
    description: "Organize health data for your household",
  },
  {
    id: "caregiver",
    icon: "heart" as const,
    title: "Caring for a parent or loved one",
    description: "Manage health records for someone you care for",
  },
  {
    id: "all",
    icon: "globe" as const,
    title: "All of the above",
    description: "A comprehensive family health hub",
  },
];

export default function RoleSelectionScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      await apiRequest("PUT", "/api/profile/role", { role: selectedRole });
      navigation.navigate("Dashboard");
    } catch (err) {
      console.error("Role selection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate("Dashboard");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: theme.link + "15" }]}>
          <Feather name="compass" size={32} color={theme.link} />
        </View>
        <ThemedText type="h2" style={styles.title}>
          How will you use Soria?
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          This helps us personalize your experience. You can change this later in
          Settings.
        </ThemedText>

        <View style={styles.roles}>
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <TouchableOpacity
                key={role.id}
                activeOpacity={0.7}
                style={[
                  styles.roleCard,
                  {
                    borderColor: isSelected ? theme.link : theme.border,
                    backgroundColor: isSelected
                      ? theme.link + "08"
                      : theme.backgroundDefault,
                  },
                ]}
                onPress={() => setSelectedRole(role.id)}
              >
                <View
                  style={[
                    styles.roleIconContainer,
                    {
                      backgroundColor: isSelected
                        ? theme.link + "20"
                        : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <Feather
                    name={role.icon}
                    size={20}
                    color={isSelected ? theme.link : theme.textSecondary}
                  />
                </View>
                <View style={styles.roleText}>
                  <ThemedText style={styles.roleTitle}>{role.title}</ThemedText>
                  <ThemedText
                    style={[styles.roleDescription, { color: theme.textSecondary }]}
                  >
                    {role.description}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected ? theme.link : theme.border,
                      backgroundColor: isSelected ? theme.link : "transparent",
                    },
                  ]}
                >
                  {isSelected && (
                    <Feather name="check" size={12} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.buttons}>
        <Button onPress={handleContinue} disabled={!selectedRole || loading}>
          {loading ? "Saving..." : "Continue"}
        </Button>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
          <ThemedText style={[styles.skipText, { color: theme.textSecondary }]}>
            Skip for now
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "space-between",
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
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    paddingHorizontal: Spacing.md,
  },
  roles: {
    width: "100%",
    gap: Spacing.md,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  roleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  roleText: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  roleDescription: {
    fontSize: 13,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  buttons: {
    gap: Spacing.sm,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  skipText: {
    fontSize: 15,
  },
});
