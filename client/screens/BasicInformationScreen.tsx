import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface InfoFieldProps {
  label: string;
  value: string;
}

function InfoField({ label, value }: InfoFieldProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.fieldContainer}>
      <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>
        {label}
      </ThemedText>
      <View style={[styles.fieldInput, { borderColor: theme.border }]}>
        <ThemedText style={[styles.fieldValue, { color: theme.textSecondary }]}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

interface UploadBoxProps {
  label: string;
  description: string;
}

function UploadBox({ label, description }: UploadBoxProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.uploadContainer}>
      <ThemedText style={[styles.uploadLabel, { color: theme.text }]}>
        {label}
      </ThemedText>
      <Pressable
        style={[styles.uploadBox, { borderColor: theme.border }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <Feather name="upload" size={24} color={theme.textTertiary} />
        <ThemedText style={[styles.uploadText, { color: theme.textSecondary }]}>
          {description}
        </ThemedText>
        <View style={[styles.chooseFileButton, { borderColor: theme.border }]}>
          <ThemedText style={[styles.chooseFileText, { color: theme.textSecondary }]}>
            Choose File
          </ThemedText>
          <ThemedText style={[styles.noFileText, { color: theme.textTertiary }]}>
            {" "}no file selected
          </ThemedText>
        </View>
      </Pressable>
    </View>
  );
}

export default function BasicInformationScreen() {
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
        Basic Information
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Manage your contact details, address, and insurance information.
      </ThemedText>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Contact Information
            </ThemedText>
            <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Your primary contact details
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

        <InfoField label="Phone Number" value="(555) 123-4567" />
        <InfoField label="Email Address" value="john.doe@example.com" />
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Current Address
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary, marginBottom: Spacing.lg }]}>
          Your residential address
        </ThemedText>

        <InfoField label="Street Address" value="123 Main Street" />
        <InfoField label="City" value="Springfield" />
        <InfoField label="State" value="IL" />
        <InfoField label="ZIP Code" value="62701" />
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Insurance Information
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary, marginBottom: Spacing.lg }]}>
          Your health insurance details
        </ThemedText>

        <InfoField label="Provider Name" value="Blue Cross Blue Shield" />
        <InfoField label="Policy Number" value="BCBS123456789" />
        <InfoField label="Group Number" value="GRP987654" />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <ThemedText style={styles.uploadSectionTitle}>Insurance Card Images</ThemedText>
        <ThemedText style={[styles.uploadSectionSubtitle, { color: theme.textSecondary }]}>
          Upload photos of your insurance card for quick reference
        </ThemedText>

        <UploadBox label="Front of Insurance Card" description="Click to upload front of card" />
        <UploadBox label="Back of Insurance Card" description="Click to upload back of card" />
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Legal Identification
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary, marginBottom: Spacing.lg }]}>
          Upload your government-issued ID for verification
        </ThemedText>

        <ThemedText style={[styles.idLabel, { color: theme.text }]}>
          ID Document (Passport, Driver's License, or Real ID)
        </ThemedText>
        <Pressable
          style={[styles.idUploadBox, { borderColor: theme.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="upload" size={24} color={theme.textTertiary} />
          <ThemedText style={[styles.uploadText, { color: theme.textSecondary }]}>
            Click to upload your legal ID
          </ThemedText>
          <View style={[styles.chooseFileButton, { borderColor: theme.border }]}>
            <ThemedText style={[styles.chooseFileText, { color: theme.textSecondary }]}>
              Choose File
            </ThemedText>
            <ThemedText style={[styles.noFileText, { color: theme.textTertiary }]}>
              {" "}no file selected
            </ThemedText>
          </View>
          <ThemedText style={[styles.acceptedText, { color: theme.textTertiary }]}>
            Accepted: Passport, Driver's License, or Real ID
          </ThemedText>
        </Pressable>

        <View style={[styles.privacyNotice, { backgroundColor: "#F3F4F6" }]}>
          <ThemedText style={styles.privacyTitle}>Privacy & Security</ThemedText>
          <ThemedText style={[styles.privacyText, { color: theme.textSecondary }]}>
            Your identification documents are encrypted and stored securely. They are only accessible to you and authorized healthcare providers you explicitly grant access to.
          </ThemedText>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Primary Care Physician
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary, marginBottom: Spacing.lg }]}>
          Your primary care doctor information
        </ThemedText>

        <InfoField label="Doctor Name" value="Dr. Sarah Chen" />
        <InfoField label="Phone Number" value="(555) 234-5678" />
        <InfoField label="Office Address" value="456 Medical Plaza" />
        <InfoField label="City" value="Springfield" />
        <InfoField label="State" value="IL" />
        <InfoField label="ZIP Code" value="62701" />
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
  fieldValue: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  uploadSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  uploadSectionSubtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  uploadContainer: {
    marginBottom: Spacing.lg,
  },
  uploadLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
  },
  uploadText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chooseFileButton: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chooseFileText: {
    fontSize: 13,
  },
  noFileText: {
    fontSize: 13,
  },
  idLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  idUploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  acceptedText: {
    fontSize: 12,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  privacyNotice: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
