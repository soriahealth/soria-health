import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest, queryClient, getQueryFn } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type IncomingRequest = {
  id: number;
  fromProfileId: number;
  toEmail: string;
  toProfileId: number | null;
  relationship: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  fromProfile?: {
    id: number;
    firstName: string;
    lastName: string;
  };
};

type OutgoingRequest = {
  id: number;
  fromProfileId: number;
  toEmail: string;
  toProfileId: number | null;
  relationship: string;
  status: string;
  expiresAt: string;
  createdAt: string;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function isExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt);
}

export default function ConnectionRequestsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<"incoming" | "sent">("incoming");

  const { data: incoming = [], isLoading: incomingLoading } = useQuery<IncomingRequest[]>({
    queryKey: ["/api/connections/incoming"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: outgoing = [], isLoading: outgoingLoading } = useQuery<OutgoingRequest[]>({
    queryKey: ["/api/connections/outgoing"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const isLoading = incomingLoading || outgoingLoading;

  const pendingIncoming = incoming.filter((r) => r.status === "pending" && !isExpired(r.expiresAt));

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/connections/incoming"] });
    queryClient.invalidateQueries({ queryKey: ["/api/connections/outgoing"] });
    queryClient.invalidateQueries({ queryKey: ["/api/family"] });
    queryClient.invalidateQueries({ queryKey: ["/api/family/managed"] });
  };

  const acceptMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/connections/${id}/accept`);
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
      Alert.alert("Connected", "You are now connected.");
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to accept request");
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/connections/${id}/decline`);
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to decline request");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/connections/${id}`);
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to cancel request");
    },
  });

  const handleAccept = (request: IncomingRequest) => {
    const fromName = request.fromProfile
      ? `${request.fromProfile.firstName} ${request.fromProfile.lastName}`
      : "Unknown";
    navigation.navigate("PrivacyReview", {
      requestId: request.id,
      fromName,
      relationship: request.relationship,
    });
  };

  const handleDecline = (id: number) => {
    Alert.alert("Decline Connection", "Are you sure you want to decline this connection request?", [
      { text: "Cancel", style: "cancel" },
      { text: "Decline", style: "destructive", onPress: () => declineMutation.mutate(id) },
    ]);
  };

  const handleCancel = (id: number) => {
    Alert.alert("Cancel Request", "Are you sure you want to cancel this connection request?", [
      { text: "No", style: "cancel" },
      { text: "Yes, Cancel", style: "destructive", onPress: () => cancelMutation.mutate(id) },
    ]);
  };

  const getStatusBadge = (request: OutgoingRequest) => {
    if (request.status === "accepted") {
      return { label: "Accepted", color: theme.success };
    }
    if (request.status === "declined") {
      return { label: "Declined", color: theme.error };
    }
    if (isExpired(request.expiresAt)) {
      return { label: "Expired", color: theme.textTertiary };
    }
    return { label: "Pending", color: theme.warning };
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={[styles.topBarTitle, { color: theme.textSecondary }]}>
          Connection Requests
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "incoming" && { borderBottomColor: theme.link, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab("incoming")}
        >
          <ThemedText
            style={[
              styles.tabText,
              { color: activeTab === "incoming" ? theme.link : theme.textSecondary },
            ]}
          >
            Incoming
          </ThemedText>
          {pendingIncoming.length > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: theme.error }]}>
              <ThemedText style={styles.tabBadgeText}>{pendingIncoming.length}</ThemedText>
            </View>
          )}
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === "sent" && { borderBottomColor: theme.link, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab("sent")}
        >
          <ThemedText
            style={[
              styles.tabText,
              { color: activeTab === "sent" ? theme.link : theme.textSecondary },
            ]}
          >
            Sent
          </ThemedText>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.link} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "incoming" ? (
            pendingIncoming.length > 0 ? (
              pendingIncoming.map((request) => (
                <View
                  key={request.id}
                  style={[
                    styles.requestCard,
                    { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                  ]}
                >
                  <View style={[styles.avatar, { backgroundColor: theme.link + "20" }]}>
                    <Feather name="user-plus" size={18} color={theme.link} />
                  </View>
                  <View style={styles.requestInfo}>
                    <ThemedText style={[styles.requestName, { color: theme.text }]}>
                      {request.fromProfile
                        ? `${request.fromProfile.firstName} ${request.fromProfile.lastName}`
                        : "Unknown User"}
                    </ThemedText>
                    <ThemedText style={[styles.requestDetail, { color: theme.textSecondary }]}>
                      {request.relationship}
                    </ThemedText>
                    <ThemedText style={[styles.requestDate, { color: theme.textTertiary }]}>
                      Sent {formatDate(request.createdAt)}
                    </ThemedText>
                  </View>
                  <View style={styles.actionButtons}>
                    <Pressable
                      style={[styles.actionBtn, { backgroundColor: theme.success }]}
                      onPress={() => handleAccept(request)}
                      disabled={acceptMutation.isPending}
                    >
                      <Feather name="check" size={16} color="#FFFFFF" />
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, { backgroundColor: theme.error }]}
                      onPress={() => handleDecline(request.id)}
                      disabled={declineMutation.isPending}
                    >
                      <Feather name="x" size={16} color="#FFFFFF" />
                    </Pressable>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={48} color={theme.textTertiary} />
                <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
                  No Incoming Requests
                </ThemedText>
                <ThemedText style={[styles.emptyMessage, { color: theme.textSecondary }]}>
                  When someone sends you a connection request, it will appear here.
                </ThemedText>
              </View>
            )
          ) : (
            outgoing.length > 0 ? (
              outgoing.map((request) => {
                const badge = getStatusBadge(request);
                const canCancel = request.status === "pending" && !isExpired(request.expiresAt);
                return (
                  <View
                    key={request.id}
                    style={[
                      styles.requestCard,
                      { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                    ]}
                  >
                    <View style={[styles.avatar, { backgroundColor: theme.link + "20" }]}>
                      <Feather name="send" size={16} color={theme.link} />
                    </View>
                    <View style={styles.requestInfo}>
                      <ThemedText style={[styles.requestName, { color: theme.text }]}>
                        {request.toEmail}
                      </ThemedText>
                      <ThemedText style={[styles.requestDetail, { color: theme.textSecondary }]}>
                        {request.relationship}
                      </ThemedText>
                      <ThemedText style={[styles.requestDate, { color: theme.textTertiary }]}>
                        Sent {formatDate(request.createdAt)}
                      </ThemedText>
                    </View>
                    <View style={styles.rightSection}>
                      <View style={[styles.statusBadge, { backgroundColor: badge.color + "20" }]}>
                        <ThemedText style={[styles.statusBadgeText, { color: badge.color }]}>
                          {badge.label}
                        </ThemedText>
                      </View>
                      {canCancel && (
                        <Pressable
                          onPress={() => handleCancel(request.id)}
                          disabled={cancelMutation.isPending}
                          hitSlop={8}
                        >
                          <ThemedText style={[styles.cancelText, { color: theme.error }]}>
                            Cancel
                          </ThemedText>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Feather name="send" size={48} color={theme.textTertiary} />
                <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
                  No Sent Requests
                </ThemedText>
                <ThemedText style={[styles.emptyMessage, { color: theme.textSecondary }]}>
                  Connection requests you send will appear here.
                </ThemedText>
              </View>
            )
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 15,
    fontWeight: "600",
  },
  requestDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  requestDate: {
    fontSize: 11,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rightSection: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cancelText: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
});
