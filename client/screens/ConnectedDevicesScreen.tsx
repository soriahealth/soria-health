import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface Device {
  id: string;
  name: string;
  type: string;
  icon: keyof typeof Feather.glyphMap;
  connected: boolean;
  lastSync?: string;
  color: string;
}

const devices: Device[] = [
  {
    id: "1",
    name: "Apple Watch",
    type: "Smartwatch",
    icon: "watch",
    connected: true,
    lastSync: "2 minutes ago",
    color: "#000000",
  },
  {
    id: "2",
    name: "Oura Ring",
    type: "Sleep & Activity Tracker",
    icon: "circle",
    connected: true,
    lastSync: "1 hour ago",
    color: "#C4A77D",
  },
  {
    id: "3",
    name: "Whoop",
    type: "Fitness Tracker",
    icon: "activity",
    connected: false,
    color: "#00A86B",
  },
];

interface DeviceCardProps {
  device: Device;
}

function DeviceCard({ device }: DeviceCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={[styles.deviceCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.deviceIcon, { backgroundColor: device.color }]}>
        <Feather name={device.icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.deviceInfo}>
        <ThemedText style={styles.deviceName}>{device.name}</ThemedText>
        <ThemedText style={[styles.deviceType, { color: theme.textSecondary }]}>
          {device.type}
        </ThemedText>
        {device.connected && device.lastSync ? (
          <ThemedText style={[styles.lastSync, { color: theme.textTertiary }]}>
            Last synced {device.lastSync}
          </ThemedText>
        ) : null}
      </View>
      <View style={styles.deviceStatus}>
        {device.connected ? (
          <View style={[styles.connectedBadge, { backgroundColor: "#D1FAE5" }]}>
            <ThemedText style={[styles.connectedText, { color: "#059669" }]}>
              Connected
            </ThemedText>
          </View>
        ) : (
          <Pressable
            style={[styles.connectButton, { backgroundColor: theme.primary }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <ThemedText style={styles.connectButtonText}>Connect</ThemedText>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export default function ConnectedDevicesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();

  const connectedCount = devices.filter((d) => d.connected).length;

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
      </View>

      <ThemedText type="h2" style={styles.title}>
        Connected Devices
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Manage your health tracking devices
      </ThemedText>

      <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.summaryIcon}>
          <Feather name="bluetooth" size={24} color={theme.primary} />
        </View>
        <View style={styles.summaryText}>
          <ThemedText style={styles.summaryTitle}>
            {connectedCount} device{connectedCount !== 1 ? "s" : ""} connected
          </ThemedText>
          <ThemedText style={[styles.summarySubtitle, { color: theme.textSecondary }]}>
            Syncing health data automatically
          </ThemedText>
        </View>
      </View>

      <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
        Your Devices
      </ThemedText>

      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}

      <Pressable
        style={[styles.addDeviceButton, { borderColor: theme.border }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <Feather name="plus" size={20} color={theme.primary} />
        <ThemedText style={[styles.addDeviceText, { color: theme.primary }]}>
          Add New Device
        </ThemedText>
      </Pressable>
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
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
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
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  summaryIcon: {
    marginRight: Spacing.md,
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  deviceType: {
    fontSize: 14,
    marginBottom: 2,
  },
  lastSync: {
    fontSize: 12,
  },
  deviceStatus: {
    marginLeft: Spacing.sm,
  },
  connectedBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  connectedText: {
    fontSize: 12,
    fontWeight: "600",
  },
  connectButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addDeviceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  addDeviceText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
