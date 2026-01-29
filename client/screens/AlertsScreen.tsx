import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ThemedText } from "@/components/ThemedText";
import { AlertCard } from "@/components/AlertCard";
import { TabFilter } from "@/components/TabFilter";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { healthAlerts } from "@/data/mockData";

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { key: "all", label: "All", count: healthAlerts.length },
    {
      key: "preventative",
      label: "Preventative",
      count: healthAlerts.filter((a) => a.category === "preventative").length,
    },
    {
      key: "medication",
      label: "Medication",
      count: healthAlerts.filter((a) => a.category === "medication").length,
    },
    {
      key: "appointment",
      label: "Appointment",
      count: healthAlerts.filter((a) => a.category === "appointment").length,
    },
  ];

  const filteredAlerts =
    activeTab === "all"
      ? healthAlerts
      : healthAlerts.filter((a) => a.category === activeTab);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText type="h2" style={styles.title}>
        Health Alerts
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Personalized health recommendations based on your and your family's medical history.
      </ThemedText>

      <TabFilter tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        contentContainerStyle={styles.alertsContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        ) : (
          <EmptyState
            image={require("../../assets/images/empty-health.png")}
            title="No Alerts"
            message="You're all caught up! No health alerts at this time."
          />
        )}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    lineHeight: 22,
  },
  alertsContainer: {
    paddingHorizontal: Spacing.lg,
  },
});
