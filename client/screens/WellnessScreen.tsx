import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { InfoCard } from "@/components/InfoCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface WorkoutCardProps {
  title: string;
  intensity: string;
  description: string;
  duration: string;
  focusAreas: string[];
  exercises: string[];
}

function WorkoutCard({
  title,
  intensity,
  description,
  duration,
  focusAreas,
  exercises,
}: WorkoutCardProps) {
  const { theme } = useTheme();

  const getIntensityColor = () => {
    switch (intensity.toLowerCase()) {
      case "low to moderate":
        return theme.info;
      case "moderate":
        return theme.primary;
      case "high":
        return theme.warning;
      default:
        return theme.textSecondary;
    }
  };

  return (
    <View
      style={[
        styles.workoutCard,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutTitleSection}>
          <ThemedText type="h4" style={styles.workoutTitle}>
            {title}
          </ThemedText>
          <View
            style={[
              styles.intensityBadge,
              { backgroundColor: `${getIntensityColor()}20` },
            ]}
          >
            <ThemedText
              style={[styles.intensityText, { color: getIntensityColor() }]}
            >
              {intensity}
            </ThemedText>
          </View>
        </View>
      </View>

      <ThemedText style={[styles.workoutDescription, { color: theme.textSecondary }]}>
        {description}
      </ThemedText>

      <View style={styles.durationRow}>
        <ThemedText style={[styles.durationLabel, { color: theme.text }]}>
          Duration:
        </ThemedText>
        <ThemedText style={[styles.durationValue, { color: theme.textSecondary }]}>
          {duration}
        </ThemedText>
      </View>

      <View style={styles.focusSection}>
        <ThemedText style={[styles.focusLabel, { color: theme.text }]}>
          Focus Areas:
        </ThemedText>
        <View style={styles.focusTags}>
          {focusAreas.map((area, index) => (
            <View
              key={index}
              style={[
                styles.focusTag,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <ThemedText style={[styles.focusTagText, { color: theme.text }]}>
                {area}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.exercisesSection}>
        <ThemedText style={[styles.exercisesLabel, { color: theme.text }]}>
          Exercise Routine:
        </ThemedText>
        {exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseRow}>
            <View style={[styles.bullet, { backgroundColor: theme.textTertiary }]} />
            <ThemedText
              style={[styles.exerciseText, { color: theme.textSecondary }]}
            >
              {exercise}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const workoutPlans = [
  {
    title: "Cardiovascular Health - Beginner",
    intensity: "Low to Moderate",
    description:
      "Ideal for building cardiovascular endurance and reducing heart disease risk (family history of heart disease).",
    duration: "30 minutes",
    focusAreas: ["Heart Health", "Endurance", "Weight Management"],
    exercises: [
      "5 min warm-up: Light walking or marching in place",
      "20 min: Brisk walking or cycling at comfortable pace",
      "5 min cool-down: Gentle stretching",
    ],
  },
  {
    title: "Full Body Strength Training",
    intensity: "Moderate",
    description:
      "Resistance training to improve bone density and prevent osteoporosis (family history).",
    duration: "45 minutes",
    focusAreas: ["Muscle Building", "Bone Density", "Metabolism"],
    exercises: [
      "Bodyweight Squats: 3 sets of 12 reps",
      "Push-ups (modified if needed): 3 sets of 10 reps",
      "Dumbbell Rows: 3 sets of 12 reps each arm",
      "Lunges: 3 sets of 10 reps each leg",
      "Plank: 3 sets of 30 seconds",
      "Wall sits: 3 sets of 30 seconds",
    ],
  },
  {
    title: "Yoga & Flexibility",
    intensity: "Low to Moderate",
    description:
      "Improve flexibility, reduce stress, and support mental wellness.",
    duration: "30 minutes",
    focusAreas: ["Flexibility", "Stress Relief", "Balance"],
    exercises: [
      "Cat-Cow stretches: 2 minutes",
      "Downward Dog: 1 minute hold",
      "Warrior I & II: 1 minute each side",
      "Child's Pose: 2 minutes",
      "Seated forward fold: 2 minutes",
      "Corpse pose (Savasana): 5 minutes",
    ],
  },
];

export default function WellnessScreen() {
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
        Wellness Center
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Personalized workout plans and health tips based on your health profile
        and family history.
      </ThemedText>

      <InfoCard
        title="Personalized Wellness Plan"
        message="These recommendations are tailored to your family medical history to help prevent cardiovascular disease, diabetes, osteoporosis, and support mental wellness."
        variant="info"
      />

      <SectionHeader
        title="Recommended Workout Plans"
        icon="zap"
        subtitle="Exercise routines customized for your health needs"
      />

      {workoutPlans.map((plan, index) => (
        <WorkoutCard key={index} {...plan} />
      ))}
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
    lineHeight: 22,
  },
  workoutCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  workoutHeader: {
    marginBottom: Spacing.sm,
  },
  workoutTitleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  workoutTitle: {
    flex: 1,
  },
  intensityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  workoutDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  durationRow: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: Spacing.sm,
  },
  durationValue: {
    fontSize: 14,
  },
  focusSection: {
    marginBottom: Spacing.md,
  },
  focusLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  focusTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  focusTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  focusTagText: {
    fontSize: 13,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  exercisesSection: {},
  exercisesLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: Spacing.sm,
  },
  exerciseText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
