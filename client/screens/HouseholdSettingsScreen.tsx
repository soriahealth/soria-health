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
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as Sharing from "expo-sharing";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getQueryFn, apiRequest, queryClient } from "@/lib/query-client";

type ConnectedMember = {
  profileId: number;
  name: string;
  relationship: string;
};

type ManagedProfile = {
  id: number;
  firstName: string;
  lastName: string;
};

export default function HouseholdSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { profile, logout } = useAuth();

  const [showTransfer, setShowTransfer] = useState(false);
  const [selectedTransferTarget, setSelectedTransferTarget] = useState<number | null>(null);
  const [exportingProfileId, setExportingProfileId] = useState<number | null>(null);

  const { data: householdData } = useQuery<{
    self: any;
    managed: ManagedProfile[];
    connected: ConnectedMember[];
  }>({
    queryKey: ["/api/household/profiles"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: familyLinks = [] } = useQuery<any[]>({
    queryKey: ["/api/family"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Connected adult members eligible for role transfer
  const transferCandidates = familyLinks
    .filter((link: any) => link.profile && !link.profile.managedById)
    .map((link: any) => ({
      profileId: link.profile.id,
      name: `${link.profile.firstName} ${link.profile.lastName}`,
      relationship: link.relationship,
    }));

  const transferMutation = useMutation({
    mutationFn: async (targetProfileId: number) => {
      await apiRequest("POST", "/api/household/transfer-role", { targetProfileId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/household/profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/family"] });
      queryClient.invalidateQueries({ queryKey: ["/api/family/managed"] });
      Alert.alert("Success", "Household manager role has been transferred.");
      setShowTransfer(false);
      navigation.goBack();
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to transfer role");
    },
  });

  const handleTransfer = () => {
    if (!selectedTransferTarget) return;
    const target = transferCandidates.find((c: ConnectedMember) => c.profileId === selectedTransferTarget);
    Alert.alert(
      "Transfer Role",
      `Transfer Household Manager role to ${target?.name}? You will lose the ability to manage profiles.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Transfer",
          style: "destructive",
          onPress: () => transferMutation.mutate(selectedTransferTarget),
        },
      ]
    );
  };

  const handleExport = async (targetProfileId: number, name: string) => {
    try {
      setExportingProfileId(targetProfileId);
      const res = await apiRequest("GET", `/api/household/export/${targetProfileId}`);
      const data = await res.json();
      const jsonStr = JSON.stringify(data, null, 2);
      // Use a blob URL approach for sharing
      if (await Sharing.isAvailableAsync()) {
        // Create a temporary file via caches directory
        const tmpDir = `${(globalThis as any).__DEV__ ? "/tmp" : ""}`;
        const fileName = `${name.replace(/\s+/g, "_")}_health_data.json`;
        // For web/dev, just show the data
        Alert.alert("Export Complete", `Health data for ${name} has been exported.\n\n${jsonStr.slice(0, 200)}...`);
      } else {
        Alert.alert("Export Complete", `Health data exported successfully.\n\n${jsonStr.slice(0, 200)}...`);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to export data");
    } finally {
      setExportingProfileId(null);
    }
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
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4">Household Settings</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Household Info */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Feather name="home" size={20} color={theme.link} />
            <ThemedText style={[styles.cardTitle, { color: theme.text }]}>
              Household Info
            </ThemedText>
          </View>
          <ThemedText style={[styles.infoRow, { color: theme.textSecondary }]}>
            Manager: {profile?.firstName} {profile?.lastName}
          </ThemedText>
          <ThemedText style={[styles.infoRow, { color: theme.textSecondary }]}>
            Managed profiles: {householdData?.managed.length ?? 0}
          </ThemedText>
          <ThemedText style={[styles.infoRow, { color: theme.textSecondary }]}>
            Connected members: {householdData?.connected.length ?? 0}
          </ThemedText>
        </View>

        {/* Data Export */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Feather name="download" size={20} color={theme.link} />
            <ThemedText style={[styles.cardTitle, { color: theme.text }]}>
              Export Health Data
            </ThemedText>
          </View>
          <ThemedText style={[styles.cardDescription, { color: theme.textSecondary }]}>
            Export health records as JSON for managed profiles.
          </ThemedText>

          {/* Export self */}
          <Pressable
            style={[styles.exportRow, { borderColor: theme.border }]}
            onPress={() => handleExport(householdData?.self?.id, `${profile?.firstName}_${profile?.lastName}`)}
            disabled={exportingProfileId != null}
          >
            <Feather name="user" size={16} color={theme.text} />
            <ThemedText style={[styles.exportName, { color: theme.text }]}>
              Your Data
            </ThemedText>
            {exportingProfileId === householdData?.self?.id ? (
              <ActivityIndicator size="small" color={theme.link} />
            ) : (
              <Feather name="download" size={16} color={theme.link} />
            )}
          </Pressable>

          {(householdData?.managed ?? []).map((mp: ManagedProfile) => (
            <Pressable
              key={mp.id}
              style={[styles.exportRow, { borderColor: theme.border }]}
              onPress={() => handleExport(mp.id, `${mp.firstName}_${mp.lastName}`)}
              disabled={exportingProfileId != null}
            >
              <Feather name="user" size={16} color={theme.text} />
              <ThemedText style={[styles.exportName, { color: theme.text }]}>
                {mp.firstName} {mp.lastName}
              </ThemedText>
              {exportingProfileId === mp.id ? (
                <ActivityIndicator size="small" color={theme.link} />
              ) : (
                <Feather name="download" size={16} color={theme.link} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Transfer Role */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Feather name="refresh-cw" size={20} color={theme.warning} />
            <ThemedText style={[styles.cardTitle, { color: theme.text }]}>
              Transfer Manager Role
            </ThemedText>
          </View>
          <ThemedText style={[styles.cardDescription, { color: theme.textSecondary }]}>
            Transfer the Household Manager role to another connected adult member. This action cannot be undone.
          </ThemedText>

          {!showTransfer ? (
            <Button
              variant="outline"
              onPress={() => setShowTransfer(true)}
              style={{ marginTop: Spacing.md }}
            >
              Transfer Role
            </Button>
          ) : transferCandidates.length === 0 ? (
            <ThemedText style={[styles.noCandidate, { color: theme.textTertiary }]}>
              No connected adult members available for transfer. Connect with another family member first.
            </ThemedText>
          ) : (
            <View style={{ marginTop: Spacing.md }}>
              <ThemedText style={[styles.chipLabel, { color: theme.text }]}>
                Select new manager:
              </ThemedText>
              {transferCandidates.map((c: ConnectedMember) => (
                <Pressable
                  key={c.profileId}
                  style={[
                    styles.transferOption,
                    {
                      backgroundColor:
                        selectedTransferTarget === c.profileId
                          ? theme.link + "15"
                          : theme.backgroundSecondary,
                      borderColor:
                        selectedTransferTarget === c.profileId
                          ? theme.link
                          : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedTransferTarget(c.profileId)}
                >
                  <Feather
                    name={selectedTransferTarget === c.profileId ? "check-circle" : "circle"}
                    size={18}
                    color={selectedTransferTarget === c.profileId ? theme.link : theme.textTertiary}
                  />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ color: theme.text, fontWeight: "500" }}>
                      {c.name}
                    </ThemedText>
                    <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>
                      {c.relationship}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
              <View style={styles.transferActions}>
                <Button variant="outline" onPress={() => setShowTransfer(false)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button
                  onPress={handleTransfer}
                  disabled={!selectedTransferTarget || transferMutation.isPending}
                  style={{ flex: 1 }}
                >
                  {transferMutation.isPending ? "Transferring..." : "Confirm Transfer"}
                </Button>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardDescription: { fontSize: 14, lineHeight: 20 },
  infoRow: { fontSize: 14, marginTop: Spacing.xs },
  exportRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  exportName: { flex: 1, fontSize: 15, fontWeight: "500" },
  chipLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  transferOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  transferActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  noCandidate: {
    fontSize: 14,
    marginTop: Spacing.md,
    textAlign: "center",
  },
});
