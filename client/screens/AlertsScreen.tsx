import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

type AlertType =
  | "medication_reminder"
  | "appointment"
  | "health_alert"
  | "connection"
  | "system";

interface AlertItem {
  id: number;
  profileId: number;
  type: AlertType;
  title: string;
  message: string;
  isRead: boolean;
  isDismissed: boolean;
  relatedType?: string | null;
  relatedId?: number | null;
  scheduledFor?: string | null;
  createdAt: string;
}

const ALERT_CONFIG: Record<
  string,
  { icon: keyof typeof Feather.glyphMap; color: string }
> = {
  medication_reminder: { icon: "package", color: "#3B82F6" },
  appointment: { icon: "calendar", color: "#8B5CF6" },
  health_alert: { icon: "alert-triangle", color: "#F59E0B" },
  connection: { icon: "users", color: "#10B981" },
  system: { icon: "info", color: "#6B7280" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const queryClient = useQueryClient();

  const { data: alertsList = [], isLoading } = useQuery<AlertItem[]>({
    queryKey: ["/api/alerts"],
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/alerts/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unread-count"] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/alerts/${id}/dismiss`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/alerts/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unread-count"] });
    },
  });

  const visibleAlerts = alertsList.filter((a) => !a.isDismissed);
  const hasUnread = visibleAlerts.some((a) => !a.isRead);

  const handleAlertPress = (alert: AlertItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!alert.isRead) {
      markReadMutation.mutate(alert.id);
    }
  };

  const handleDismiss = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dismissMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    markAllReadMutation.mutate();
  };

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
          style={[
            styles.menuButton,
            { backgroundColor: theme.backgroundDefault },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openDrawer();
          }}
        >
          <Feather name="menu" size={22} color={theme.text} />
        </Pressable>

        {hasUnread && (
          <Pressable
            style={[styles.markAllButton, { backgroundColor: theme.link }]}
            onPress={handleMarkAllRead}
          >
            <Feather name="check-circle" size={16} color="#FFFFFF" />
            <ThemedText style={styles.markAllText}>Mark All as Read</ThemedText>
          </Pressable>
        )}
      </View>

      <ThemedText type="h2" style={styles.title}>
        Notifications
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Stay on top of your health reminders and updates.
      </ThemedText>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.link} />
        </View>
      ) : visibleAlerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather
            name="bell-off"
            size={48}
            color={theme.textTertiary}
            style={styles.emptyIcon}
          />
          <ThemedText
            type="h4"
            style={[styles.emptyTitle, { color: theme.textSecondary }]}
          >
            No notifications
          </ThemedText>
          <ThemedText
            style={[styles.emptyMessage, { color: theme.textTertiary }]}
          >
            You're all caught up! New alerts will appear here.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.alertsContainer}>
          {visibleAlerts.map((alert) => {
            const config = ALERT_CONFIG[alert.type] || ALERT_CONFIG.system;
            return (
              <Pressable
                key={alert.id}
                onPress={() => handleAlertPress(alert)}
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.border,
                  },
                  !alert.isRead && {
                    borderLeftWidth: 3,
                    borderLeftColor: config.color,
                  },
                ]}
              >
                <View style={styles.alertRow}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${config.color}15` },
                    ]}
                  >
                    <Feather
                      name={config.icon}
                      size={18}
                      color={config.color}
                    />
                  </View>

                  <View style={styles.alertContent}>
                    <View style={styles.alertTitleRow}>
                      <ThemedText
                        style={[
                          styles.alertTitle,
                          !alert.isRead && { fontWeight: "700" },
                        ]}
                        numberOfLines={1}
                      >
                        {alert.title}
                      </ThemedText>
                      {!alert.isRead && (
                        <View
                          style={[
                            styles.unreadDot,
                            { backgroundColor: config.color },
                          ]}
                        />
                      )}
                    </View>

                    <ThemedText
                      style={[
                        styles.alertMessage,
                        { color: theme.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      {alert.message}
                    </ThemedText>

                    <ThemedText
                      style={[
                        styles.alertTimestamp,
                        { color: theme.textTertiary },
                      ]}
                    >
                      {formatDate(alert.createdAt)}
                    </ThemedText>
                  </View>

                  <Pressable
                    onPress={() => handleDismiss(alert.id)}
                    hitSlop={12}
                    style={styles.dismissButton}
                  >
                    <Feather name="x" size={16} color={theme.textTertiary} />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
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
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  markAllText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
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
  loadingContainer: {
    paddingVertical: Spacing["5xl"],
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
    paddingHorizontal: Spacing["2xl"],
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  alertsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  alertCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 2,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  alertTimestamp: {
    fontSize: 12,
  },
  dismissButton: {
    padding: Spacing.xs,
    marginTop: -Spacing.xs,
    marginRight: -Spacing.xs,
  },
});
