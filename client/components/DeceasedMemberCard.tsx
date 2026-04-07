import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
interface DeceasedMember {
  id: number;
  name: string;
  relationship: string;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  causeOfDeath?: string | null;
  conditions?: { name: string; diagnosedAge?: string }[];
}

interface DeceasedMemberCardProps {
  member: DeceasedMember;
  onPress?: () => void;
}

export function DeceasedMemberCard({ member, onPress }: DeceasedMemberCardProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelationshipLabel = (relationship: string) => {
    return relationship.charAt(0).toUpperCase() + relationship.slice(1);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.container,
        { 
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: "#9CA3AF" }]}>
          <ThemedText style={styles.initials}>{getInitials(member.name)}</ThemedText>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.name}>{member.name}</ThemedText>
            <View style={[styles.deceasedBadge, { backgroundColor: "#F3F4F6" }]}>
              <ThemedText style={[styles.deceasedText, { color: "#6B7280" }]}>
                Deceased
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.relationship, { color: theme.textSecondary }]}>
            {getRelationshipLabel(member.relationship)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.detailsRow}>
        {member.dateOfBirth && (
          <View style={styles.detailItem}>
            <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Born
            </ThemedText>
            <ThemedText style={styles.detailValue}>{new Date(member.dateOfBirth).getFullYear()}</ThemedText>
          </View>
        )}
        {member.dateOfDeath && (
          <View style={styles.detailItem}>
            <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Passed
            </ThemedText>
            <ThemedText style={styles.detailValue}>{new Date(member.dateOfDeath).getFullYear()}</ThemedText>
          </View>
        )}
        {member.dateOfBirth && member.dateOfDeath && (
          <View style={styles.detailItem}>
            <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Age
            </ThemedText>
            <ThemedText style={styles.detailValue}>
              {new Date(member.dateOfDeath).getFullYear() - new Date(member.dateOfBirth).getFullYear()}
            </ThemedText>
          </View>
        )}
      </View>

      {member.causeOfDeath && (
        <View style={[styles.causeContainer, { backgroundColor: "#FEF2F2" }]}>
          <Feather name="alert-circle" size={14} color="#DC2626" />
          <ThemedText style={[styles.causeText, { color: "#991B1B" }]}>
            Cause of Death: {member.causeOfDeath}
          </ThemedText>
        </View>
      )}

      <View style={[styles.conditionsSection, { borderTopColor: theme.border }]}>
        <ThemedText style={[styles.conditionsLabel, { color: theme.textSecondary }]}>
          Medical Conditions
        </ThemedText>
        <View style={styles.conditionsList}>
          {(member.conditions ?? []).map((condition, index) => (
            <View key={index} style={[styles.conditionBadge, { backgroundColor: theme.backgroundTertiary }]}>
              <ThemedText style={[styles.conditionText, { color: theme.text }]}>
                {condition.name}
              </ThemedText>
              {condition.diagnosedAge && (
                <ThemedText style={[styles.conditionAge, { color: theme.textSecondary }]}>
                  {" "}Age {condition.diagnosedAge}
                </ThemedText>
              )}
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  info: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  deceasedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  deceasedText: {
    fontSize: 11,
    fontWeight: "500",
  },
  relationship: {
    fontSize: 14,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  causeContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  causeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  conditionsSection: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  conditionsLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  conditionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  conditionBadge: {
    flexDirection: "row",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  conditionAge: {
    fontSize: 12,
  },
});
