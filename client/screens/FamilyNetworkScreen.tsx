import React, { useState } from "react";
import { StyleSheet, View, ScrollView, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { FamilyMemberCard } from "@/components/FamilyMemberCard";
import { DeceasedMemberCard } from "@/components/DeceasedMemberCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getQueryFn, apiRequest, queryClient } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type FamilyMemberWithProfile = {
  id: number;
  profileId: number;
  relatedProfileId: number;
  relationship: string;
  status: string;
  profile?: {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    biologicalSex: string | null;
    profileType: string;
    managedById: number | null;
    onboardingCompleted: boolean;
  };
};

type ManagedProfile = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  biologicalSex: string | null;
  profileType: string;
  onboardingCompleted: boolean;
  isDeceased?: boolean;
  causeOfDeath?: string | null;
  dateOfDeath?: string | null;
  relationship?: string | null;
};

type IncomingRequest = {
  id: number;
  status: string;
  expiresAt: string;
};

export default function FamilyNetworkScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const navigation = useNavigation<Nav>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: familyLinks = [], isLoading: linksLoading } = useQuery<FamilyMemberWithProfile[]>({
    queryKey: ["/api/family"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: managedProfiles = [], isLoading: managedLoading } = useQuery<ManagedProfile[]>({
    queryKey: ["/api/family/managed"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: incomingRequests = [] } = useQuery<IncomingRequest[]>({
    queryKey: ["/api/connections/incoming"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const isLoading = linksLoading || managedLoading;

  const pendingIncomingCount = incomingRequests.filter(
    (r) => r.status === "pending" && new Date() <= new Date(r.expiresAt)
  ).length;

  const disconnectMutation = useMutation({
    mutationFn: async (memberId: number) => {
      const res = await apiRequest("DELETE", `/api/family/${memberId}/disconnect`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family"] });
      queryClient.invalidateQueries({ queryKey: ["/api/family/managed"] });
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to disconnect");
    },
  });

  const handleDisconnect = (memberId: number, name: string) => {
    Alert.alert(
      "Disconnect",
      `Are you sure you want to disconnect from ${name}? You will no longer be able to see each other's health records.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => disconnectMutation.mutate(memberId),
        },
      ]
    );
  };

  // Build display list from family links (enriched with profiles)
  const familyDisplayMembers = familyLinks
    .filter((link) => link.profile)
    .map((link) => ({
      id: link.id,
      profileId: link.profile!.id,
      name: `${link.profile!.firstName} ${link.profile!.lastName}`,
      relationship: link.relationship,
      onboardingCompleted: link.profile!.onboardingCompleted,
      biologicalSex: link.profile!.biologicalSex,
      isManaged: link.profile!.managedById != null,
      status: link.status,
    }));

  const filteredMembers = familyDisplayMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("AddFamilyMember");
  };

  const handleBuildProfile = (profileId: number, firstName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("FamilyMemberIntake", { profileId, firstName });
  };

  const handleViewRequests = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ConnectionRequests");
  };

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

      <ThemedText type="h2" style={styles.title}>
        Soria Network
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        View and manage your family's shared health information.
      </ThemedText>

      {/* Connection Requests Banner */}
      <Pressable
        style={[
          styles.requestsBanner,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: pendingIncomingCount > 0 ? theme.link : theme.border,
          },
        ]}
        onPress={handleViewRequests}
      >
        <Feather name="mail" size={18} color={theme.link} />
        <ThemedText style={[styles.requestsBannerText, { color: theme.text }]}>
          Connection Requests
        </ThemedText>
        {pendingIncomingCount > 0 && (
          <View style={[styles.notificationBadge, { backgroundColor: theme.error }]}>
            <ThemedText style={styles.notificationBadgeText}>
              {pendingIncomingCount}
            </ThemedText>
          </View>
        )}
        <Feather name="chevron-right" size={18} color={theme.textTertiary} style={{ marginLeft: "auto" }} />
      </Pressable>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
          },
        ]}
      >
        <Feather name="search" size={18} color={theme.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search family members..."
          placeholderTextColor={theme.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Pressable
        style={[styles.addButton, { backgroundColor: theme.link }]}
        onPress={handleAddMember}
      >
        <Feather name="plus" size={18} color="#FFFFFF" />
        <ThemedText style={styles.addButtonText}>
          Add Family Member
        </ThemedText>
      </Pressable>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.link} />
        </View>
      ) : (
        <>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Family Members
          </ThemedText>

          {filteredMembers.length > 0 ? (
            <View style={styles.membersList}>
              {filteredMembers.map((member) => (
                <Pressable
                  key={member.id}
                  style={[
                    styles.memberCard,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => {
                    if (member.isManaged && !member.onboardingCompleted) {
                      handleBuildProfile(member.profileId, member.name.split(" ")[0]);
                    }
                  }}
                >
                  <View style={[styles.avatar, { backgroundColor: theme.link + "20" }]}>
                    <Feather name="user" size={20} color={theme.link} />
                  </View>
                  <View style={styles.memberInfo}>
                    <ThemedText style={[styles.memberName, { color: theme.text }]}>
                      {member.name}
                    </ThemedText>
                    <ThemedText style={[styles.memberRelationship, { color: theme.textSecondary }]}>
                      {member.relationship}
                    </ThemedText>
                  </View>
                  {/* Badge: Managed vs Connected vs Needs Profile */}
                  {member.isManaged ? (
                    !member.onboardingCompleted ? (
                      <View style={[styles.badge, { backgroundColor: theme.warning + "20" }]}>
                        <ThemedText style={[styles.badgeText, { color: theme.warning }]}>
                          Needs Profile
                        </ThemedText>
                      </View>
                    ) : (
                      <View style={[styles.badge, { backgroundColor: theme.textTertiary + "20" }]}>
                        <ThemedText style={[styles.badgeText, { color: theme.textTertiary }]}>
                          Managed
                        </ThemedText>
                      </View>
                    )
                  ) : member.status === "pending" ? (
                    <View style={[styles.badge, { backgroundColor: theme.warning + "20" }]}>
                      <ThemedText style={[styles.badgeText, { color: theme.warning }]}>
                        Pending
                      </ThemedText>
                    </View>
                  ) : (
                    <View style={[styles.badge, { backgroundColor: theme.success + "20" }]}>
                      <ThemedText style={[styles.badgeText, { color: theme.success }]}>
                        Connected
                      </ThemedText>
                    </View>
                  )}
                  {/* Actions for non-managed (connected) members */}
                  {!member.isManaged && member.status === "active" ? (
                    <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          navigation.navigate("SharingSettings", {
                            connectedProfileId: member.profileId,
                            connectedName: member.name,
                          });
                        }}
                        hitSlop={8}
                      >
                        <Feather name="shield" size={18} color={theme.link} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDisconnect(member.id, member.name)}
                        hitSlop={8}
                      >
                        <Feather name="user-x" size={18} color={theme.error} />
                      </Pressable>
                    </View>
                  ) : (
                    <Feather name="chevron-right" size={18} color={theme.textTertiary} />
                  )}
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyState
              image={require("../../assets/images/empty-family.png")}
              title="No Family Members"
              message="Add family members to manage their health profiles and build your family health network."
              actionLabel="Add First Member"
              onAction={handleAddMember}
            />
          )}
        </>
      )}

      <View style={[styles.deceasedSection, { borderTopColor: theme.border }]}>
        <View style={styles.deceasedHeader}>
          <Feather name="archive" size={18} color={theme.textSecondary} />
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary, marginBottom: 0 }]}>
            Post-Mortem Records
          </ThemedText>
        </View>
        <ThemedText style={[styles.deceasedSubtitle, { color: theme.textTertiary }]}>
          Medical history of deceased relatives for hereditary tracking
        </ThemedText>

        {managedProfiles
          .filter((p) => p.isDeceased)
          .map((p) => (
            <DeceasedMemberCard
              key={p.id}
              member={{
                id: p.id,
                name: `${p.firstName} ${p.lastName}`,
                relationship: p.relationship || "Family Member",
                dateOfBirth: p.dateOfBirth,
                dateOfDeath: p.dateOfDeath,
                causeOfDeath: p.causeOfDeath,
              }}
              onPress={() => navigation.navigate("FamilyMemberIntake", { profileId: p.id, firstName: p.firstName, isPostMortem: true })}
            />
          ))}
        {managedProfiles.filter((p) => p.isDeceased).length === 0 && (
          <ThemedText style={[styles.deceasedSubtitle, { color: theme.textTertiary }]}>
            No post-mortem records added yet.
          </ThemedText>
        )}
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
  requestsBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  requestsBannerText: {
    fontSize: 15,
    fontWeight: "500",
  },
  notificationBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.sm,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    paddingVertical: Spacing["4xl"],
    alignItems: "center",
  },
  membersList: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
  },
  memberRelationship: {
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  deceasedSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
  },
  deceasedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  deceasedSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.lg,
  },
});
