import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getQueryFn, apiRequest, queryClient } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type HouseholdProfile = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  biologicalSex: string | null;
  profileType: string;
  managedById: number | null;
  onboardingCompleted: boolean;
  relationship?: string;
  completionPercent?: number;
  recordCounts?: {
    conditions: number;
    medications: number;
    allergies: number;
    surgeries: number;
    metrics: number;
    documents: number;
  };
};

function calculateAge(dob: string | null): string {
  if (!dob) return "";
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return `${age} yrs`;
}

function CompletionRing({
  percent,
  size = 40,
  strokeWidth = 3,
  color,
  bgColor,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: bgColor,
          position: "absolute",
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: percent >= 75 ? color : "transparent",
          borderRightColor: percent >= 50 ? color : "transparent",
          borderBottomColor: percent >= 25 ? color : "transparent",
          borderLeftColor: percent >= 100 ? color : "transparent",
          position: "absolute",
          transform: [{ rotate: "-90deg" }],
        }}
      />
      <ThemedText style={{ fontSize: 10, fontWeight: "700", color }}>
        {percent}%
      </ThemedText>
    </View>
  );
}

export default function HouseholdDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const navigation = useNavigation<Nav>();
  const { profile } = useAuth();

  const { data: householdData, isLoading } = useQuery<{
    self: HouseholdProfile;
    managed: HouseholdProfile[];
    connected: HouseholdProfile[];
  }>({
    queryKey: ["/api/household/profiles"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const removeMutation = useMutation({
    mutationFn: async (profileId: number) => {
      await apiRequest("DELETE", `/api/family/${profileId}/remove`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/household/profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/family"] });
      queryClient.invalidateQueries({ queryKey: ["/api/family/managed"] });
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to remove profile");
    },
  });

  const handleRemove = (profileId: number, name: string) => {
    Alert.alert(
      "Remove Profile",
      `Are you sure you want to permanently remove ${name}'s profile? This will delete all their health records and cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove Permanently",
          style: "destructive",
          onPress: () => removeMutation.mutate(profileId),
        },
      ]
    );
  };

  const getStatusBadge = (p: HouseholdProfile) => {
    if (p.profileType === "self") return { label: "You", color: theme.link };
    if (p.managedById != null) {
      if (!p.onboardingCompleted) return { label: "Needs Profile", color: theme.warning };
      return { label: "Managed", color: theme.textTertiary };
    }
    return { label: "Connected", color: theme.success };
  };

  const renderProfileCard = (p: HouseholdProfile, isManaged: boolean) => {
    const badge = getStatusBadge(p);
    const age = calculateAge(p.dateOfBirth);
    const completion = p.completionPercent ?? 0;

    return (
      <View
        key={p.id}
        style={[
          styles.profileCard,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardTop}>
          <View style={[styles.avatar, { backgroundColor: theme.link + "20" }]}>
            <Feather name="user" size={22} color={theme.link} />
          </View>
          <View style={styles.cardInfo}>
            <ThemedText style={[styles.cardName, { color: theme.text }]}>
              {p.firstName} {p.lastName}
            </ThemedText>
            <ThemedText style={[styles.cardMeta, { color: theme.textSecondary }]}>
              {[p.relationship, age, p.biologicalSex].filter(Boolean).join(" \u00B7 ")}
            </ThemedText>
          </View>
          <CompletionRing
            percent={completion}
            color={completion >= 70 ? theme.success : completion >= 40 ? theme.warning : theme.error}
            bgColor={theme.border}
          />
        </View>

        <View style={[styles.badgeRow, { borderTopColor: theme.border }]}>
          <View style={[styles.statusBadge, { backgroundColor: badge.color + "20" }]}>
            <ThemedText style={[styles.statusBadgeText, { color: badge.color }]}>
              {badge.label}
            </ThemedText>
          </View>
          {p.recordCounts && (
            <ThemedText style={[styles.recordSummary, { color: theme.textTertiary }]}>
              {p.recordCounts.conditions + p.recordCounts.medications + p.recordCounts.allergies +
                p.recordCounts.surgeries + p.recordCounts.metrics} records
            </ThemedText>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          {p.profileType === "self" ? (
            <>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: theme.link + "10" }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate("Reports");
                }}
              >
                <Feather name="eye" size={14} color={theme.link} />
                <ThemedText style={[styles.actionText, { color: theme.link }]}>
                  View Records
                </ThemedText>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: theme.link + "10" }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate("Profile");
                }}
              >
                <Feather name="edit-2" size={14} color={theme.link} />
                <ThemedText style={[styles.actionText, { color: theme.link }]}>
                  Edit Profile
                </ThemedText>
              </Pressable>
            </>
          ) : isManaged ? (
            <>
              {!p.onboardingCompleted ? (
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: theme.warning + "10" }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate("FamilyMemberIntake", {
                      profileId: p.id,
                      firstName: p.firstName,
                    });
                  }}
                >
                  <Feather name="clipboard" size={14} color={theme.warning} />
                  <ThemedText style={[styles.actionText, { color: theme.warning }]}>
                    Build Profile
                  </ThemedText>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: theme.link + "10" }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate("ManagedProfileRecords", { profileId: p.id, firstName: p.firstName });
                  }}
                >
                  <Feather name="eye" size={14} color={theme.link} />
                  <ThemedText style={[styles.actionText, { color: theme.link }]}>
                    View Records
                  </ThemedText>
                </Pressable>
              )}
              <Pressable
                style={[styles.actionBtn, { backgroundColor: theme.link + "10" }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate("EditManagedProfile", { profileId: p.id });
                }}
              >
                <Feather name="edit-2" size={14} color={theme.link} />
                <ThemedText style={[styles.actionText, { color: theme.link }]}>
                  Edit
                </ThemedText>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: theme.error + "10" }]}
                onPress={() => handleRemove(p.id, p.firstName)}
              >
                <Feather name="trash-2" size={14} color={theme.error} />
                <ThemedText style={[styles.actionText, { color: theme.error }]}>
                  Remove
                </ThemedText>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: theme.link + "10" }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate("Family");
              }}
            >
              <Feather name="eye" size={14} color={theme.link} />
              <ThemedText style={[styles.actionText, { color: theme.link }]}>
                View Profile
              </ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
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
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("HouseholdSettings");
          }}
        >
          <Feather name="settings" size={20} color={theme.text} />
        </Pressable>
      </View>

      <ThemedText type="h2" style={styles.title}>
        Household Manager
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Manage all profiles in your household.
      </ThemedText>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.link} />
        </View>
      ) : (
        <>
          {/* Self profile */}
          {householdData?.self && (
            <>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                Your Profile
              </ThemedText>
              {renderProfileCard({ ...householdData.self, relationship: "Self" }, false)}
            </>
          )}

          {/* Managed profiles */}
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              Managed Profiles ({householdData?.managed.length ?? 0})
            </ThemedText>
            <Pressable
              style={[styles.addBtn, { backgroundColor: theme.link }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate("AddFamilyMember");
              }}
            >
              <Feather name="plus" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
          {(householdData?.managed.length ?? 0) > 0 ? (
            <View style={styles.cardList}>
              {householdData!.managed.map((p) => renderProfileCard(p, true))}
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <Feather name="users" size={24} color={theme.textTertiary} />
              <ThemedText style={[styles.emptyText, { color: theme.textTertiary }]}>
                No managed profiles yet. Add a family member to get started.
              </ThemedText>
            </View>
          )}

          {/* Connected profiles */}
          {(householdData?.connected.length ?? 0) > 0 && (
            <>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.xl }]}>
                Connected Members ({householdData?.connected.length})
              </ThemedText>
              <View style={styles.cardList}>
                {householdData!.connected.map((p) => renderProfileCard(p, false))}
              </View>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  title: { marginBottom: Spacing.xs },
  subtitle: { fontSize: 15, marginBottom: Spacing.xl },
  loadingContainer: { paddingVertical: Spacing["4xl"], alignItems: "center" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  cardList: { gap: Spacing.md },
  profileCard: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "600" },
  cardMeta: { fontSize: 13, marginTop: 2 },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusBadgeText: { fontSize: 11, fontWeight: "600" },
  recordSummary: { fontSize: 12 },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  actionText: { fontSize: 12, fontWeight: "600" },
  emptyCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.sm,
  },
  emptyText: { fontSize: 14, textAlign: "center" },
});
