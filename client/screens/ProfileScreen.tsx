import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface SettingsItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingsItem({ icon, label, onPress, danger }: SettingsItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={[styles.settingsItem, { borderBottomColor: theme.border }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={styles.settingsItemLeft}>
        <Feather
          name={icon}
          size={20}
          color={danger ? theme.error : theme.textSecondary}
        />
        <ThemedText
          style={[
            styles.settingsItemLabel,
            { color: danger ? theme.error : theme.text },
          ]}
        >
          {label}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textTertiary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={styles.headerRow}>
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openDrawer();
          }}
        >
          <Feather name="menu" size={22} color={theme.text} />
        </Pressable>
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="sun" size={20} color={theme.text} />
        </Pressable>
      </View>

      <View
        style={[
          styles.profileCard,
          { backgroundColor: theme.backgroundDefault },
          Shadows.card,
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.avatarText}>JD</ThemedText>
        </View>
        <View style={styles.profileInfo}>
          <ThemedText type="h4">John Doe</ThemedText>
          <ThemedText style={[styles.email, { color: theme.textSecondary }]}>
            john.doe@example.com
          </ThemedText>
        </View>
        <Pressable
          style={[styles.editProfileButton, { borderColor: theme.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="edit-2" size={16} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View
        style={[
          styles.settingsSection,
          { backgroundColor: theme.backgroundDefault },
          Shadows.card,
        ]}
      >
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Account
        </ThemedText>
        <SettingsItem
          icon="user"
          label="Personal Information"
          onPress={() => {}}
        />
        <SettingsItem
          icon="shield"
          label="Privacy & Security"
          onPress={() => {}}
        />
        <SettingsItem
          icon="bell"
          label="Notifications"
          onPress={() => {}}
        />
        <SettingsItem
          icon="share-2"
          label="Data Sharing Preferences"
          onPress={() => {}}
        />
      </View>

      <View
        style={[
          styles.settingsSection,
          { backgroundColor: theme.backgroundDefault },
          Shadows.card,
        ]}
      >
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Health
        </ThemedText>
        <SettingsItem
          icon="file-text"
          label="Export Health Data"
          onPress={() => {}}
        />
        <SettingsItem
          icon="link"
          label="Connected Devices"
          onPress={() => {}}
        />
        <SettingsItem
          icon="calendar"
          label="Appointment Reminders"
          onPress={() => {}}
        />
      </View>

      <View
        style={[
          styles.settingsSection,
          { backgroundColor: theme.backgroundDefault },
          Shadows.card,
        ]}
      >
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Support
        </ThemedText>
        <SettingsItem
          icon="help-circle"
          label="Help Center"
          onPress={() => {}}
        />
        <SettingsItem
          icon="message-circle"
          label="Contact Support"
          onPress={() => {}}
        />
        <SettingsItem
          icon="file"
          label="Privacy Policy"
          onPress={() => {}}
        />
        <SettingsItem
          icon="file"
          label="Terms of Service"
          onPress={() => {}}
        />
      </View>

      <View
        style={[
          styles.settingsSection,
          { backgroundColor: theme.backgroundDefault },
          Shadows.card,
        ]}
      >
        <SettingsItem
          icon="log-out"
          label="Log Out"
          onPress={() => {}}
          danger
        />
      </View>

      <ThemedText style={[styles.version, { color: theme.textTertiary }]}>
        Family Health v1.0.0
      </ThemedText>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  email: {
    fontSize: 14,
    marginTop: 2,
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsSection: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingsItemLabel: {
    fontSize: 16,
  },
  version: {
    textAlign: "center",
    fontSize: 13,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
