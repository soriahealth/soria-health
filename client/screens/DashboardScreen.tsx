import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { MetricCard } from "@/components/MetricCard";
import { SectionHeader } from "@/components/SectionHeader";
import { InfoCard } from "@/components/InfoCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getQueryFn } from "@/lib/query-client";

const METRIC_ICONS: Record<string, string> = {
  systolic_bp: "heart",
  diastolic_bp: "heart",
  heart_rate: "activity",
  weight: "user",
  height: "maximize-2",
  blood_type: "droplet",
};

type AlertData = {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const quickActions = [
  { id: "1", title: "Share with Family Member", icon: "share-2" },
  { id: "2", title: "Generate Patient Form", icon: "plus" },
];

interface ActivityItemProps {
  activity: { id: number; title: string; message: string; createdAt: string };
  isLast: boolean;
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const { theme } = useTheme();

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <View style={[styles.activityItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <View style={[styles.activityDot, { backgroundColor: theme.primary }]} />
      <View style={styles.activityContent}>
        <ThemedText style={styles.activityTitle}>{activity.title}</ThemedText>
        <ThemedText style={[styles.activitySource, { color: theme.textSecondary }]}>
          {activity.message}
        </ThemedText>
        <ThemedText style={[styles.activityTime, { color: theme.textTertiary }]}>
          {timeAgo(activity.createdAt)}
        </ThemedText>
      </View>
    </View>
  );
}

interface QuickActionButtonProps {
  action: { id: string; title: string; icon: string };
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
  const { theme, toggle, isDark } = useTheme();
  const { openDrawer } = useDrawer();
  const navigation = useNavigation<any>();
  const [showAnnualReminder, setShowAnnualReminder] = useState(true);

  const { data: summary } = useQuery<any>({
    queryKey: ["/api/health/summary"],
  });

  const { data: alertsData = [] } = useQuery<AlertData[]>({
    queryKey: ["/api/alerts"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Check age milestones on dashboard load (creates alerts if managed child turning 21)
  useQuery({
    queryKey: ["/api/milestones/check"],
    staleTime: 24 * 60 * 60 * 1000, // Only check once per day
  });

  const dbMetrics = summary?.healthMetrics ?? [];
  const dbConditions = summary?.conditions ?? [];
  const dbMedications = summary?.medications ?? [];

  // Map DB metrics to UI shape
  const uiMetrics = dbMetrics.map((m: any) => ({
    id: String(m.id),
    type: m.type,
    value: String(m.value),
    unit: m.unit,
    updatedAt: new Date(m.measuredAt),
    icon: METRIC_ICONS[m.type] || "bar-chart-2",
  }));

  const latestAlert = alertsData.find((a) => !a.isRead);
  const recentActivities = alertsData.slice(0, 5);

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
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggle();
          }}
        >
          <Feather name={isDark ? "moon" : "sun"} size={20} color={theme.text} />
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
          title={latestAlert.title}
          message={latestAlert.message}
          variant="warning"
          badge={latestAlert.type}
          onDismiss={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAnnualReminder(false);
          }}
        />
      ) : null}

      <SectionHeader
        title="Current Health Metrics"
        actionLabel="Update Metrics"
        onAction={() => navigation.navigate("HealthIntake")}
      />

      {uiMetrics.length > 0 ? (
        uiMetrics.map((metric: any) => (
          <MetricCard key={metric.id} metric={metric} />
        ))
      ) : (
        <Pressable
          onPress={() => navigation.navigate("HealthIntake")}
          style={[styles.emptyCard, { borderColor: theme.border }]}
        >
          <Feather name="plus-circle" size={24} color={theme.link} />
          <ThemedText style={[styles.emptyCardText, { color: theme.textSecondary }]}>
            Complete your health profile to see your metrics here
          </ThemedText>
        </Pressable>
      )}

      <SectionHeader
        title="My Medical Conditions"
        icon="activity"
        actionLabel="Edit"
        onAction={() => navigation.navigate("Reports")}
      />

      {dbConditions.length > 0 ? (
        <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {dbConditions.map((condition: any, index: number) => (
            <View
              key={condition.id}
              style={[
                styles.infoRow,
                index !== dbConditions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
            >
              <View style={styles.infoRowLeft}>
                <View style={[styles.conditionDot, { backgroundColor: theme.warning }]} />
                <View>
                  <ThemedText style={styles.infoRowTitle}>{condition.name}</ThemedText>
                  <ThemedText style={[styles.infoRowSubtitle, { color: theme.textSecondary }]}>
                    {condition.diagnosisDate
                      ? `Diagnosed ${new Date(condition.diagnosisDate).getFullYear()}`
                      : "No date"}
                  </ThemedText>
                </View>
              </View>
              {condition.status ? (
                <View style={[styles.statusBadge, { backgroundColor: `${theme.success}20` }]}>
                  <ThemedText style={[styles.statusText, { color: theme.success }]}>
                    {condition.status}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <Pressable
          onPress={() => navigation.navigate("HealthIntake")}
          style={[styles.emptyCard, { borderColor: theme.border }]}
        >
          <Feather name="plus-circle" size={24} color={theme.link} />
          <ThemedText style={[styles.emptyCardText, { color: theme.textSecondary }]}>
            Add your medical conditions to track them here
          </ThemedText>
        </Pressable>
      )}

      <SectionHeader
        title="Current Medications"
        icon="package"
        actionLabel="Edit"
        onAction={() => navigation.navigate("Reports")}
      />

      {dbMedications.length > 0 ? (
        <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {dbMedications.map((medication: any, index: number) => (
            <View
              key={medication.id}
              style={[
                styles.medicationRow,
                index !== dbMedications.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
            >
              <View style={styles.medicationHeader}>
                <Feather name="circle" size={8} color={theme.primary} style={{ marginTop: 6 }} />
                <View style={styles.medicationInfo}>
                  <ThemedText style={styles.medicationName}>{medication.name}</ThemedText>
                  <ThemedText style={[styles.medicationDosage, { color: theme.textSecondary }]}>
                    {[medication.dosage, medication.frequency].filter(Boolean).join(" - ")}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Pressable
          onPress={() => navigation.navigate("HealthIntake")}
          style={[styles.emptyCard, { borderColor: theme.border }]}
        >
          <Feather name="plus-circle" size={24} color={theme.link} />
          <ThemedText style={[styles.emptyCardText, { color: theme.textSecondary }]}>
            Add your medications to track them here
          </ThemedText>
        </Pressable>
      )}

      <View style={styles.sectionSpacing}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Recent Activity
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Your latest health updates
        </ThemedText>
      </View>

      <View style={[styles.activityCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        {recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isLast={index === recentActivities.length - 1}
            />
          ))
        ) : (
          <View style={styles.activityItem}>
            <ThemedText style={[styles.activitySource, { color: theme.textSecondary }]}>
              No recent activity yet
            </ThemedText>
          </View>
        )}
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
  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: Spacing.md,
  },
  emptyCardText: {
    fontSize: 14,
    flex: 1,
  },
});
