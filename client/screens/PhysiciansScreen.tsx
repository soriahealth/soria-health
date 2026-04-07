import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SPECIALTY_COLORS: Record<string, string> = {
  PCP: "#3B82F6",
  Psychiatrist: "#8B5CF6",
  Cardiologist: "#EF4444",
  Neurologist: "#F59E0B",
  Oncologist: "#EC4899",
  Other: "#6B7280",
};

function getSpecialtyColor(specialty: string | null): string {
  if (!specialty) return SPECIALTY_COLORS.Other;
  return SPECIALTY_COLORS[specialty] || SPECIALTY_COLORS.Other;
}

export default function PhysiciansScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { openDrawer } = useDrawer();

  const { data: physicians = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/physicians"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/physicians/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/physicians"] });
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to delete physician");
    },
  });

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Remove Physician",
      `Are you sure you want to remove Dr. ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundRoot, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} hitSlop={12} activeOpacity={0.7}>
          <Feather name="menu" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="h4" style={styles.headerTitle}>
          My Physicians
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.link} />
        </View>
      ) : physicians.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="user-check" size={48} color={theme.textTertiary} />
          <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
            No Physicians Added
          </ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Add your doctors to manage prescriptions and refill requests.
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
        >
          {physicians.map((doc: any) => (
            <View
              key={doc.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                  ...Shadows.card,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <View style={styles.nameRow}>
                    <ThemedText style={[styles.docName, { color: theme.text }]}>
                      Dr. {doc.name}
                    </ThemedText>
                    {doc.isPrimary && (
                      <View style={[styles.primaryBadge, { backgroundColor: theme.success + "20" }]}>
                        <ThemedText style={[styles.primaryBadgeText, { color: theme.success }]}>
                          Primary
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  {doc.specialty && (
                    <View style={styles.specialtyRow}>
                      <View
                        style={[
                          styles.specialtyBadge,
                          { backgroundColor: getSpecialtyColor(doc.specialty) + "20" },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.specialtyText,
                            { color: getSpecialtyColor(doc.specialty) },
                          ]}
                        >
                          {doc.specialty}
                        </ThemedText>
                      </View>
                    </View>
                  )}
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("AddPhysician", { physicianId: doc.id })}
                    hitSlop={8}
                    activeOpacity={0.7}
                  >
                    <Feather name="edit-2" size={18} color={theme.link} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(doc.id, doc.name)}
                    hitSlop={8}
                    style={{ marginLeft: Spacing.md }}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={18} color={theme.error} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Contact details */}
              <View style={[styles.contactSection, { borderTopColor: theme.border }]}>
                {doc.phone && (
                  <View style={styles.contactRow}>
                    <Feather name="phone" size={14} color={theme.textSecondary} />
                    <ThemedText style={[styles.contactText, { color: theme.textSecondary }]}>
                      {doc.phone}
                    </ThemedText>
                  </View>
                )}
                {doc.email && (
                  <View style={styles.contactRow}>
                    <Feather name="mail" size={14} color={theme.textSecondary} />
                    <ThemedText style={[styles.contactText, { color: theme.textSecondary }]}>
                      {doc.email}
                    </ThemedText>
                  </View>
                )}
                {doc.fax && (
                  <View style={styles.contactRow}>
                    <Feather name="printer" size={14} color={theme.textSecondary} />
                    <ThemedText style={[styles.contactText, { color: theme.textSecondary }]}>
                      {doc.fax}
                    </ThemedText>
                  </View>
                )}
                {doc.address && (
                  <View style={styles.contactRow}>
                    <Feather name="map-pin" size={14} color={theme.textSecondary} />
                    <ThemedText style={[styles.contactText, { color: theme.textSecondary }]}>
                      {doc.address}
                    </ThemedText>
                  </View>
                )}
                {doc.npi && (
                  <View style={styles.contactRow}>
                    <Feather name="hash" size={14} color={theme.textSecondary} />
                    <ThemedText style={[styles.contactText, { color: theme.textSecondary }]}>
                      NPI: {doc.npi}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.link, ...Shadows.fab }]}
        onPress={() => navigation.navigate("AddPhysician", {})}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  list: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: Spacing.lg,
  },
  cardInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  docName: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  specialtyRow: {
    flexDirection: "row",
    marginTop: Spacing.xs,
  },
  specialtyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactSection: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  contactText: {
    fontSize: 13,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
