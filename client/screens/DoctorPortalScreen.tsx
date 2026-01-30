import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SharedRecord {
  id: string;
  doctorName: string;
  specialty: string;
  sharedDate: string;
  accessLevel: "full" | "limited";
}

const sharedRecords: SharedRecord[] = [
  {
    id: "1",
    doctorName: "Dr. Sarah Chen",
    specialty: "Primary Care",
    sharedDate: "Jan 15, 2026",
    accessLevel: "full",
  },
  {
    id: "2",
    doctorName: "Dr. Michael Roberts",
    specialty: "Cardiologist",
    sharedDate: "Dec 20, 2025",
    accessLevel: "limited",
  },
];

export default function DoctorPortalScreen() {
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
      </View>

      <ThemedText type="h2" style={styles.title}>
        Doctor Portal
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Manage access to your health records
      </ThemedText>

      <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryValue}>2</ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Active Shares
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryValue}>3</ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Pending Requests
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Feather name="share" size={18} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>Share Records</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, borderWidth: 1 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="link" size={18} color={theme.text} />
          <ThemedText style={[styles.actionButtonText, { color: theme.text }]}>Generate Link</ThemedText>
        </Pressable>
      </View>

      <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
        Shared With Doctors
      </ThemedText>

      {sharedRecords.map((record) => (
        <Pressable
          key={record.id}
          style={[styles.doctorCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[styles.doctorAvatar, { backgroundColor: "#DBEAFE" }]}>
            <Feather name="user" size={24} color={theme.primary} />
          </View>
          <View style={styles.doctorInfo}>
            <ThemedText style={styles.doctorName}>{record.doctorName}</ThemedText>
            <ThemedText style={[styles.doctorSpecialty, { color: theme.textSecondary }]}>
              {record.specialty}
            </ThemedText>
            <ThemedText style={[styles.sharedDate, { color: theme.textTertiary }]}>
              Shared on {record.sharedDate}
            </ThemedText>
          </View>
          <View style={styles.accessBadgeContainer}>
            <View
              style={[
                styles.accessBadge,
                { backgroundColor: record.accessLevel === "full" ? "#D1FAE5" : "#FEF3C7" },
              ]}
            >
              <ThemedText
                style={[
                  styles.accessBadgeText,
                  { color: record.accessLevel === "full" ? "#059669" : "#D97706" },
                ]}
              >
                {record.accessLevel === "full" ? "Full Access" : "Limited"}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              hitSlop={8}
            >
              <Feather name="more-vertical" size={20} color={theme.textTertiary} />
            </Pressable>
          </View>
        </Pressable>
      ))}

      <Pressable
        style={[styles.addDoctorButton, { borderColor: theme.border }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <Feather name="plus" size={20} color={theme.primary} />
        <ThemedText style={[styles.addDoctorText, { color: theme.primary }]}>
          Add New Doctor
        </ThemedText>
      </Pressable>
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
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
  },
  divider: {
    width: 1,
    height: 40,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    marginBottom: 2,
  },
  sharedDate: {
    fontSize: 12,
  },
  accessBadgeContainer: {
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  accessBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  accessBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  addDoctorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  addDoctorText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
