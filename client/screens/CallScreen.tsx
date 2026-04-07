import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface CallLogData {
  id: number;
  profileId: number;
  refillRequestId: number | null;
  callType: string;
  recipientName: string;
  recipientPhone: string;
  scriptContent: string;
  status: string;
  callSid: string | null;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  outcome: string | null;
  transcript: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  queued: { label: "Queued", color: "#9CA3AF" },
  in_progress: { label: "In Progress", color: "#F59E0B" },
  completed: { label: "Completed", color: "#10B981" },
  failed: { label: "Failed", color: "#EF4444" },
  cancelled: { label: "Cancelled", color: "#EF4444" },
};

const OUTCOME_LABELS: Record<string, string> = {
  refill_confirmed: "Refill Confirmed",
  left_voicemail: "Left Voicemail",
  no_answer: "No Answer",
  failed: "Call Failed",
  cancelled: "Cancelled",
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function CallScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Call">>();
  const { callId } = route.params;

  const [callData, setCallData] = useState<CallLogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulsing animation for in_progress status
  useEffect(() => {
    if (callData?.status === "in_progress") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [callData?.status]);

  // Duration timer when in_progress
  useEffect(() => {
    if (callData?.status === "in_progress") {
      const startTime = callData.startedAt
        ? new Date(callData.startedAt).getTime()
        : Date.now();

      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else if (callData?.status === "completed" && callData.duration) {
      setElapsedSeconds(callData.duration);
    }
  }, [callData?.status, callData?.startedAt]);

  const fetchCall = useCallback(async () => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL(`/api/calls/${callId}`, baseUrl).href, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch call");
      const data = await res.json();
      setCallData(data);
      setIsLoading(false);

      // Stop polling when call is in a terminal state
      if (["completed", "failed", "cancelled"].includes(data.status)) {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    } catch (err) {
      setError("Failed to load call details");
      setIsLoading(false);
    }
  }, [callId]);

  // Initial fetch and polling
  useEffect(() => {
    fetchCall();
    pollRef.current = setInterval(fetchCall, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchCall]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await apiRequest("POST", `/api/calls/${callId}/cancel`);
      await fetchCall();
    } catch {
      setError("Failed to cancel call");
    } finally {
      setIsCancelling(false);
    }
  };

  const statusConfig = callData
    ? STATUS_CONFIG[callData.status] || STATUS_CONFIG.queued
    : STATUS_CONFIG.queued;

  const isTerminal =
    callData?.status === "completed" ||
    callData?.status === "failed" ||
    callData?.status === "cancelled";

  if (isLoading) {
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
            Call Details
          </ThemedText>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.link} />
        </View>
      </View>
    );
  }

  if (error && !callData) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.backgroundRoot, paddingTop: insets.top },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText type="h3" style={styles.headerTitle}>
            Call Details
          </ThemedText>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          <Feather name="alert-circle" size={48} color={theme.textTertiary} />
          <ThemedText style={[styles.errorText, { color: theme.textSecondary }]}>
            {error}
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundRoot, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="h3" style={styles.headerTitle}>
          Call Details
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Indicator */}
        <View style={[styles.statusCard, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.statusRow}>
            <Animated.View
              style={[
                styles.statusDot,
                { backgroundColor: statusConfig.color, opacity: pulseAnim },
              ]}
            />
            <ThemedText type="h4" style={{ color: statusConfig.color }}>
              {statusConfig.label}
            </ThemedText>
          </View>
          {callData?.status === "in_progress" && (
            <ThemedText style={[styles.timerText, { color: theme.text }]}>
              {formatDuration(elapsedSeconds)}
            </ThemedText>
          )}
          {callData?.status === "completed" && callData.duration && (
            <ThemedText style={[styles.durationText, { color: theme.textSecondary }]}>
              Duration: {formatDuration(callData.duration)}
            </ThemedText>
          )}
        </View>

        {/* Recipient Info */}
        <View style={[styles.section, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={18} color={theme.link} />
            <ThemedText type="h4" style={styles.sectionTitle}>
              Recipient
            </ThemedText>
          </View>
          <ThemedText style={[styles.recipientName, { color: theme.text }]}>
            {callData?.recipientName}
          </ThemedText>
          <View style={styles.phoneRow}>
            <Feather name="phone" size={14} color={theme.textSecondary} />
            <ThemedText style={[styles.phoneText, { color: theme.textSecondary }]}>
              {callData?.recipientPhone}
            </ThemedText>
          </View>
          <View style={styles.typeBadge}>
            <ThemedText style={styles.typeBadgeText}>
              {callData?.callType === "pharmacy_refill"
                ? "Pharmacy Refill"
                : "Physician Contact"}
            </ThemedText>
          </View>
        </View>

        {/* Outcome */}
        {callData?.outcome && (
          <View style={[styles.section, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.sectionHeader}>
              <Feather
                name={callData.outcome === "refill_confirmed" ? "check-circle" : "info"}
                size={18}
                color={
                  callData.outcome === "refill_confirmed"
                    ? "#10B981"
                    : theme.link
                }
              />
              <ThemedText type="h4" style={styles.sectionTitle}>
                Outcome
              </ThemedText>
            </View>
            <ThemedText style={[styles.outcomeText, { color: theme.text }]}>
              {OUTCOME_LABELS[callData.outcome] || callData.outcome}
            </ThemedText>
            {callData.transcript && (
              <ThemedText style={[styles.transcriptText, { color: theme.textSecondary }]}>
                {callData.transcript}
              </ThemedText>
            )}
          </View>
        )}

        {/* Locked Script */}
        <View style={[styles.section, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.sectionHeader}>
            <Feather name="lock" size={18} color={theme.link} />
            <ThemedText type="h4" style={styles.sectionTitle}>
              Call Script (Locked)
            </ThemedText>
          </View>
          <View style={[styles.scriptBox, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}>
            <ThemedText style={[styles.scriptText, { color: theme.text }]}>
              {callData?.scriptContent}
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!isTerminal && (
            <Button
              onPress={handleCancel}
              variant="outline"
              disabled={isCancelling}
              style={styles.cancelButton}
            >
              {isCancelling ? "Cancelling..." : "Cancel Call"}
            </Button>
          )}
          {isTerminal && (
            <Button
              onPress={() => navigation.goBack()}
              variant="primary"
            >
              Back
            </Button>
          )}
        </View>
      </ScrollView>
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
    gap: Spacing.md,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  statusCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timerText: {
    fontSize: 36,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  durationText: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  section: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  phoneText: {
    fontSize: 14,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#3B82F6",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  outcomeText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
  },
  scriptBox: {
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    padding: Spacing.md,
  },
  scriptText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "monospace",
  },
  actions: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  cancelButton: {
    borderColor: "#EF4444",
  },
});
