import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ProfileFieldProps {
  label: string;
  value: string;
  multiline?: boolean;
}

function ProfileField({ label, value, multiline }: ProfileFieldProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.fieldContainer}>
      <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>
        {label}
      </ThemedText>
      <View style={[styles.fieldInput, { borderColor: theme.border }, multiline && styles.fieldInputMultiline]}>
        <ThemedText style={[styles.fieldValue, { color: theme.textSecondary }]}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

interface PrivacySettingProps {
  title: string;
  description: string;
  enabled: boolean;
}

function PrivacySetting({ title, description, enabled }: PrivacySettingProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.privacyItem, { borderBottomColor: theme.border }]}>
      <View style={styles.privacyContent}>
        <ThemedText style={styles.privacyTitle}>{title}</ThemedText>
        <ThemedText style={[styles.privacyDescription, { color: theme.textSecondary }]}>
          {description}
        </ThemedText>
      </View>
      <View style={[styles.privacyBadge, { backgroundColor: enabled ? "#D1FAE5" : theme.backgroundTertiary }]}>
        <ThemedText style={[styles.privacyBadgeText, { color: enabled ? "#059669" : theme.textSecondary }]}>
          {enabled ? "Enabled" : "Disabled"}
        </ThemedText>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openDrawer();
          }}
        >
          <Feather name="sidebar" size={20} color={theme.text} />
        </Pressable>
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="sun" size={20} color={theme.text} />
        </Pressable>
      </View>

      <ThemedText type="h2" style={styles.title}>
        My Profile
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Manage your personal health information and account settings.
      </ThemedText>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Personal Information
            </ThemedText>
            <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Your basic health profile
            </ThemedText>
          </View>
          <Pressable
            style={[styles.editButton, { borderColor: theme.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Feather name="edit-2" size={14} color={theme.textSecondary} />
            <ThemedText style={[styles.editButtonText, { color: theme.textSecondary }]}>
              Edit
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: theme.backgroundTertiary }]}>
            <ThemedText style={[styles.avatarText, { color: theme.text }]}>JD</ThemedText>
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>John Doe</ThemedText>
            <ThemedText style={[styles.profileEmail, { color: theme.textSecondary }]}>
              john.doe@example.com
            </ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <ProfileField label="Full Name" value="John Doe" />
        <ProfileField label="Email" value="john.doe@example.com" />
        <ProfileField label="Date of Birth" value="06/15/1985" />
        <ProfileField label="Blood Type" value="O+" />
        <ProfileField label="Height" value="5'10&quot;" />
        <ProfileField label="Weight" value="165 lbs" />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <ThemedText style={styles.subsectionTitle}>Emergency Contact</ThemedText>
        <ProfileField label="Contact Information" value="Jane Doe - (555) 123-4567" />
        <ProfileField label="Relationship" value="Spouse" />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <ThemedText style={styles.subsectionTitle}>Demographics</ThemedText>
        <ProfileField label="Ethnicity" value="Not Hispanic or Latino" />
        <ProfileField label="Race" value="White" />
        <ProfileField label="Marital Status" value="Married" />
        <ProfileField label="Number of Children" value="2" />
        <ProfileField label="Occupation" value="Software Engineer" />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <ThemedText style={styles.subsectionTitle}>Medical Information</ThemedText>
        <ProfileField label="Allergies" value="Penicillin, Peanuts" multiline />
        <ProfileField label="Chronic Conditions" value="None" multiline />
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Privacy Settings
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary, marginBottom: Spacing.lg }]}>
          Control what you share with family members
        </ThemedText>

        <PrivacySetting
          title="Share Medications"
          description="Allow family to view your current medications"
          enabled={true}
        />
        <PrivacySetting
          title="Share Medical History"
          description="Allow family to view your past procedures"
          enabled={true}
        />
      </View>
    </ScrollView>
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
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  section: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "600",
  },
  profileInfo: {
    marginLeft: Spacing.lg,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  fieldInputMultiline: {
    minHeight: 80,
  },
  fieldValue: {
    fontSize: 15,
  },
  privacyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  privacyContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 13,
  },
  privacyBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  privacyBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
