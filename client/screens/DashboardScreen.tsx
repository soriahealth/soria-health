import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { MetricCard } from "@/components/MetricCard";
import { AlertCard } from "@/components/AlertCard";
import { SectionHeader } from "@/components/SectionHeader";
import { InfoCard } from "@/components/InfoCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { healthMetrics, healthAlerts } from "@/data/mockData";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [showAnnualReminder, setShowAnnualReminder] = useState(true);

  const latestAlert = healthAlerts.find((a) => a.category === "appointment");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText type="h2" style={styles.greeting}>
        Health Dashboard
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Welcome back! Here's your health overview.
      </ThemedText>

      {showAnnualReminder && latestAlert ? (
        <InfoCard
          title={latestAlert.title}
          message={latestAlert.description}
          variant="warning"
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
        title="Recent Alerts"
        icon="bell"
        subtitle="Personalized health recommendations"
      />

      {healthAlerts.slice(0, 2).map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}

      <Pressable
        style={[styles.viewAllButton, { borderColor: theme.border }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <ThemedText style={[styles.viewAllText, { color: theme.link }]}>
          View All Alerts
        </ThemedText>
        <Feather name="chevron-right" size={18} color={theme.link} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: Spacing.xl,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: "500",
    marginRight: Spacing.xs,
  },
});
