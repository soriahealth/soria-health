import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { FamilyMember } from "@/types/health";

interface FamilyMemberCardProps {
  member: FamilyMember;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FamilyMemberCard({ member, onPress }: FamilyMemberCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

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
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        Shadows.card,
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[styles.avatar, { backgroundColor: member.avatarColor }]}
        >
          <ThemedText style={styles.initials}>{getInitials(member.name)}</ThemedText>
        </View>
        <View style={styles.info}>
          <ThemedText type="body" style={styles.name}>
            {member.name}
          </ThemedText>
          <ThemedText style={[styles.relationship, { color: theme.textSecondary }]}>
            {getRelationshipLabel(member.relationship)}
          </ThemedText>
        </View>
      </View>
      <View style={styles.badges}>
        <View style={[styles.badge, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText style={[styles.badgeText, { color: theme.textSecondary }]}>
            {member.age} years old
          </ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText style={[styles.badgeText, { color: theme.textSecondary }]}>
            {member.recordsShared} records shared
          </ThemedText>
        </View>
      </View>
      <Pressable
        onPress={handlePress}
        style={[styles.viewButton, { borderColor: theme.border }]}
      >
        <Feather name="eye" size={16} color={theme.textSecondary} />
        <ThemedText style={[styles.viewText, { color: theme.textSecondary }]}>
          View Health Data
        </ThemedText>
      </Pressable>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
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
  name: {
    fontWeight: "600",
    marginBottom: 2,
  },
  relationship: {
    fontSize: 14,
  },
  badges: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  viewText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
