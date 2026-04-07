import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface CallLogItem {
  id: number;
  profileId: number;
  callType: string;
  recipientName: string;
  recipientPhone: string;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  outcome: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  queued: { label: "Queued", color: "#6B7280", bg: "#F3F4F6" },
  in_progress: { label: "In Progress", color: "#D97706", bg: "#FEF3C7" },
  completed: { label: "Completed", color: "#059669", bg: "#D1FAE5" },
  failed: { label: "Failed", color: "#DC2626", bg: "#FEE2E2" },
  cancelled: { label: "Cancelled", color: "#DC2626", bg: "#FEE2E2" },
};

const CALL_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pharmacy_refill: { label: "Pharmacy", color: "#2563EB", bg: "#DBEAFE" },
  physician_contact: { label: "Physician", color: "#7C3AED", bg: "#EDE9FE" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function CallHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: calls = [], isLoading } = useQuery<CallLogItem[]>({
    queryKey: ["/api/calls"],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundRoot, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => openDrawer()} hitSlop={12}>
          <Feather name="menu" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="h3" style={styles.headerTitle}>
          Call History
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.link} />
        </View>
      ) : calls.length === 0 ? (
        <View style={styles.centered}>
          <Feather name="phone-off" size={48} color={theme.textTertiary} />
          <ThemedText
            style={[styles.emptyTitle, { color: theme.textSecondary }]}
          >
            No calls yet
          </ThemedText>
          <ThemedText
            style={[styles.emptySubtitle, { color: theme.textTertiary }]}
          >
            When you initiate calls through Soria, they will appear here.
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {calls.map((call) => {
            const statusCfg =
              STATUS_CONFIG[call.status] || STATUS_CONFIG.queued;
            const typeCfg =
              CALL_TYPE_CONFIG[call.callType] ||
              CALL_TYPE_CONFIG.pharmacy_refill;

            return (
              <TouchableOpacity
                key={call.id}
                style={[
                  styles.callCard,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("Call", { callId: call.id })
                }
              >
                <View style={styles.callCardTop}>
                  <View style={styles.callCardInfo}>
                    <ThemedText
                      style={[styles.recipientName, { color: theme.text }]}
                    >
                      {call.recipientName}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.callDate,
                        { color: theme.textTertiary },
                      ]}
                    >
                      {formatDate(call.createdAt)}
                      {call.duration
                        ? ` - ${formatDuration(call.duration)}`
                        : ""}
                    </ThemedText>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={theme.textTertiary}
                  />
                </View>

                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: typeCfg.bg },
                    ]}
                  >
                    <ThemedText
                      style={[styles.badgeText, { color: typeCfg.color }]}
                    >
                      {typeCfg.label}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: statusCfg.bg },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.badgeText,
                        { color: statusCfg.color },
                      ]}
                    >
                      {statusCfg.label}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  callCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  callCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  callCardInfo: {
    flex: 1,
    gap: 2,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: "600",
  },
  callDate: {
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
