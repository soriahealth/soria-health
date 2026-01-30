import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { MetricCard } from "@/components/MetricCard";
import { SectionHeader } from "@/components/SectionHeader";
import { InfoCard } from "@/components/InfoCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { healthMetrics, healthAlerts, recentActivities, quickActions, myMedications, myConditions } from "@/data/mockData";
import { RecentActivity, QuickAction } from "@/types/health";

interface ActivityItemProps {
  activity: RecentActivity;
  isLast: boolean;
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.activityItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <View style={[styles.activityDot, { backgroundColor: theme.primary }]} />
      <View style={styles.activityContent}>
        <ThemedText style={styles.activityTitle}>{activity.title}</ThemedText>
        <ThemedText style={[styles.activitySource, { color: theme.textSecondary }]}>
          {activity.source}
        </ThemedText>
        <ThemedText style={[styles.activityTime, { color: theme.textTertiary }]}>
          {activity.timestamp}
        </ThemedText>
      </View>
    </View>
  );
}

interface QuickActionButtonProps {
  action: QuickAction;
}

function QuickActionButton({ action }: QuickActionButtonProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={[styles.quickActionButton, { borderColor: theme.border }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <Feather name={action.icon as any} size={18} color={theme.textSecondary} />
      <ThemedText style={styles.quickActionText}>{action.title}</ThemedText>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const [showAnnualReminder, setShowAnnualReminder] = useState(true);

  const latestAlert = healthAlerts.find((a) => a.category === "appointment");

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

      <ThemedText type="h2" style={styles.greeting}>
        Health Dashboard
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Welcome back! Here's your health overview.
      </ThemedText>

      {showAnnualReminder && latestAlert ? (
        <InfoCard
          title="Annual Physical Due"
          message="It's been 11 months since your last annual physical exam. Consider scheduling an appointment."
          variant="warning"
          badge="Preventative"
          onDismiss={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAnnualReminder(false);
          }}
        />
      ) : null}

      <SectionHeader
        title="Current Health Metrics"
        actionLabel="Update Metrics"
        onAction={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      />

      {healthMetrics.length > 0 ? (
        healthMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))
      ) : (
        <EmptyState
          image={require("../../assets/images/empty-health.png")}
          title="No Health Metrics"
          message="Start tracking your health by adding your first metric."
          actionLabel="Add Metric"
          onAction={() => {}}
        />
      )}

      <SectionHeader
        title="My Medical Conditions"
        icon="activity"
        actionLabel="Edit"
        onAction={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      />

      <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        {myConditions.map((condition, index) => (
          <View
            key={condition.id}
            style={[
              styles.infoRow,
              index !== myConditions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
            ]}
          >
            <View style={styles.infoRowLeft}>
              <View style={[styles.conditionDot, { backgroundColor: theme.warning }]} />
              <View>
                <ThemedText style={styles.infoRowTitle}>{condition.name}</ThemedText>
                <ThemedText style={[styles.infoRowSubtitle, { color: theme.textSecondary }]}>
                  Diagnosed {condition.diagnosedYear}
                </ThemedText>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${theme.success}20` }]}>
              <ThemedText style={[styles.statusText, { color: theme.success }]}>
                {condition.status}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      <SectionHeader
        title="Current Medications"
        icon="package"
        actionLabel="Edit"
        onAction={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      />

      <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        {myMedications.map((medication, index) => (
          <View
            key={medication.id}
            style={[
              styles.medicationRow,
              index !== myMedications.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
            ]}
          >
            <View style={styles.medicationHeader}>
              <Feather name="circle" size={8} color={theme.primary} style={{ marginTop: 6 }} />
              <View style={styles.medicationInfo}>
                <ThemedText style={styles.medicationName}>{medication.name}</ThemedText>
                <ThemedText style={[styles.medicationDosage, { color: theme.textSecondary }]}>
                  {medication.dosage} - {medication.frequency}
                </ThemedText>
                <View style={[styles.purposeBadge, { backgroundColor: theme.backgroundSecondary }]}>
                  <ThemedText style={[styles.purposeText, { color: theme.textSecondary }]}>
                    {medication.purpose}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionSpacing}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Recent Activity
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Your latest health updates
        </ThemedText>
      </View>

      <View style={[styles.activityCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        {recentActivities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            isLast={index === recentActivities.length - 1}
          />
        ))}
      </View>

      <View style={styles.sectionSpacing}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Common tasks and tools
        </ThemedText>
      </View>

      <View style={styles.quickActionsContainer}>
        {quickActions.map((action) => (
          <QuickActionButton key={action.id} action={action} />
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
  greeting: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
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
  sectionSpacing: {
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  activityCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  activitySource: {
    fontSize: 14,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
  },
  quickActionsContainer: {
    gap: Spacing.sm,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: "500",
  },
  infoCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  conditionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  infoRowTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  infoRowSubtitle: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  medicationRow: {
    padding: Spacing.lg,
  },
  medicationHeader: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  purposeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.xs,
  },
  purposeText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
