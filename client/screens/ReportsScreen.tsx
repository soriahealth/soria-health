import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { HealthRecordCard } from "@/components/HealthRecordCard";
import { RecordTypeSheet } from "@/components/RecordTypeSheet";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

type Category = "conditions" | "medications" | "allergies" | "surgeries" | "social-history" | "health-metrics";

const TABS: { key: Category; label: string }[] = [
  { key: "conditions", label: "Conditions" },
  { key: "medications", label: "Medications" },
  { key: "allergies", label: "Allergies" },
  { key: "surgeries", label: "Surgeries" },
  { key: "social-history", label: "Social History" },
  { key: "health-metrics", label: "Vitals" },
];

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<Category>("conditions");
  const [showTypeSheet, setShowTypeSheet] = useState(false);

  const { data: summary } = useQuery<any>({
    queryKey: ["/api/health/summary"],
  });

  const getRecords = () => {
    if (!summary) return [];
    switch (activeTab) {
      case "conditions":
        return summary.conditions ?? [];
      case "medications":
        return summary.medications ?? [];
      case "allergies":
        return summary.allergies ?? [];
      case "surgeries":
        return summary.surgeries ?? [];
      case "social-history":
        return summary.socialHistory ? [summary.socialHistory] : [];
      case "health-metrics":
        return summary.healthMetrics ?? [];
      default:
        return [];
    }
  };

  const records = getRecords();

  const getCardProps = (record: any) => {
    switch (activeTab) {
      case "conditions":
        return {
          title: record.name,
          subtitle: record.diagnosisDate ? `Diagnosed: ${record.diagnosisDate}` : undefined,
          status: record.status,
          isPrivate: record.isPrivate,
        };
      case "medications":
        return {
          title: record.name,
          subtitle: [record.dosage, record.frequency].filter(Boolean).join(" - "),
          isPrivate: record.isPrivate,
        };
      case "allergies":
        return {
          title: record.allergen,
          subtitle: record.reactionType,
          status: record.severity,
          isPrivate: record.isPrivate,
        };
      case "surgeries":
        return {
          title: record.procedure,
          subtitle: record.hospital,
          date: record.date,
          isPrivate: record.isPrivate,
        };
      case "social-history":
        return {
          title: "Social History",
          subtitle: [
            record.smokingStatus && `Smoking: ${record.smokingStatus}`,
            record.alcoholUse && `Alcohol: ${record.alcoholUse}`,
            record.occupation && `Occupation: ${record.occupation}`,
            record.exercise && `Exercise: ${record.exercise}`,
          ]
            .filter(Boolean)
            .join(", "),
        };
      case "health-metrics":
        return {
          title: record.type?.replace(/_/g, " ") || "Metric",
          subtitle: `${record.value} ${record.unit || ""}`.trim(),
          date: record.measuredAt,
        };
      default:
        return { title: "" };
    }
  };

  const typeLabel = TABS.find((t) => t.key === activeTab)?.label ?? "";

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing["5xl"],
          paddingHorizontal: Spacing.lg,
        }}
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
          Health Records
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          View and manage your health records.
        </ThemedText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tab,
                {
                  backgroundColor: activeTab === tab.key ? theme.link : theme.backgroundSecondary,
                  borderColor: activeTab === tab.key ? theme.link : theme.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? theme.buttonText : theme.text },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {records.length > 0 ? (
          records.map((record: any) => (
            <HealthRecordCard
              key={record.id}
              {...getCardProps(record)}
              onPress={() => {
                if (activeTab === "social-history") {
                  navigation.navigate("RecordForm", { recordType: "social-history" });
                } else {
                  navigation.navigate("RecordDetail", { recordType: activeTab, recordId: record.id });
                }
              }}
            />
          ))
        ) : (
          <View style={[styles.emptyState, { borderColor: theme.border }]}>
            <Feather name="inbox" size={40} color={theme.textTertiary} />
            <ThemedText style={[styles.emptyTitle, { color: theme.textSecondary }]}>
              No {typeLabel.toLowerCase()} added yet
            </ThemedText>
            <ThemedText style={[styles.emptyMessage, { color: theme.textTertiary }]}>
              Tap + to add your first {typeLabel.toLowerCase().replace(/s$/, "")}.
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <Pressable
        style={[styles.fab, { backgroundColor: theme.link }, Shadows.fab]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowTypeSheet(true);
        }}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      <RecordTypeSheet
        visible={showTypeSheet}
        onClose={() => setShowTypeSheet(false)}
        onSelect={(recordType) => {
          navigation.navigate("RecordForm", { recordType });
        }}
      />
    </View>
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
  tabBar: {
    marginBottom: Spacing.lg,
  },
  tabBarContent: {
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  emptyMessage: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
