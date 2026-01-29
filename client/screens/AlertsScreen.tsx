import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { AlertCard } from "@/components/AlertCard";
import { TabFilter } from "@/components/TabFilter";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing } from "@/constants/theme";
import { healthAlerts } from "@/data/mockData";

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
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
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
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
      </View>

      <ThemedText type="h2" style={styles.title}>
        Health Alerts
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Personalized health recommendations based on your and your family's medical history.
      </ThemedText>

      <TabFilter tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <View style={styles.alertsContainer}>
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
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
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
