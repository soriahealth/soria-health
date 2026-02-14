import React, { useState } from "react";
import { StyleSheet, View, ScrollView, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { FamilyMemberCard } from "@/components/FamilyMemberCard";
import { DeceasedMemberCard } from "@/components/DeceasedMemberCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { familyMembers, deceasedFamilyMembers } from "@/data/mockData";

export default function FamilyNetworkScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = familyMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        style={[styles.inviteButton, { backgroundColor: theme.link }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <Feather name="plus" size={18} color="#FFFFFF" />
        <ThemedText style={styles.inviteButtonText}>
          Invite Family Member
        </ThemedText>
      </Pressable>

      <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
        Living Family Members
      </ThemedText>

      {filteredMembers.length > 0 ? (
        <View style={styles.membersList}>
          {filteredMembers.map((member) => (
            <FamilyMemberCard key={member.id} member={member} />
          ))}
        </View>
      ) : (
        <EmptyState
          image={require("../../assets/images/empty-family.png")}
          title="No Family Members"
          message="Connect with your family to share health information and create your family health network."
          actionLabel="Invite First Member"
          onAction={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }
        />
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

        {deceasedFamilyMembers.map((member) => (
          <DeceasedMemberCard key={member.id} member={member} />
        ))}
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
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  inviteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  membersList: {
    marginTop: Spacing.sm,
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
