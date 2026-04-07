import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getQueryFn } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ManagedProfileRecords">;

type HealthSummary = {
  conditions: any[];
  medications: any[];
  allergies: any[];
  surgeries: any[];
  healthMetrics: any[];
  socialHistory: any;
  emergencyContacts: any[];
  insurance: any[];
};

function RecordSection({
  title,
  icon,
  items,
  renderItem,
  theme,
}: {
  title: string;
  icon: string;
  items: any[];
  renderItem: (item: any) => string;
  theme: any;
}) {
  if (items.length === 0) return null;
  return (
    <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      <View style={styles.sectionHeader}>
        <Feather name={icon as any} size={18} color={theme.link} />
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
          {title} ({items.length})
        </ThemedText>
      </View>
      {items.map((item, idx) => (
        <View
          key={item.id ?? idx}
          style={[styles.recordRow, idx < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
        >
          <ThemedText style={[styles.recordText, { color: theme.text }]}>
            {renderItem(item)}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

export default function ManagedProfileRecordsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { profileId, firstName } = route.params;

  const { data, isLoading } = useQuery<HealthSummary>({
    queryKey: [`/api/household/health-summary/${profileId}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4">{firstName}'s Records</ThemedText>
        <Pressable
          onPress={() =>
            navigation.navigate("FamilyMemberIntake", { profileId, firstName })
          }
          hitSlop={8}
        >
          <Feather name="plus" size={24} color={theme.link} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.link} />
        </View>
      ) : !data ? (
        <View style={styles.empty}>
          <Feather name="file-text" size={40} color={theme.textTertiary} />
          <ThemedText style={{ color: theme.textTertiary, marginTop: Spacing.md }}>
            No health records found
          </ThemedText>
        </View>
      ) : (
        <>
          <RecordSection
            title="Conditions"
            icon="heart"
            items={data.conditions}
            renderItem={(c) => `${c.name}${c.status ? ` (${c.status})` : ""}`}
            theme={theme}
          />
          <RecordSection
            title="Medications"
            icon="package"
            items={data.medications}
            renderItem={(m) => `${m.name}${m.dosage ? ` - ${m.dosage}` : ""}${m.frequency ? ` (${m.frequency})` : ""}`}
            theme={theme}
          />
          <RecordSection
            title="Allergies"
            icon="alert-triangle"
            items={data.allergies}
            renderItem={(a) => `${a.allergen}${a.severity ? ` - ${a.severity}` : ""}`}
            theme={theme}
          />
          <RecordSection
            title="Surgeries"
            icon="scissors"
            items={data.surgeries}
            renderItem={(s) => `${s.procedure}${s.hospital ? ` at ${s.hospital}` : ""}`}
            theme={theme}
          />
          <RecordSection
            title="Health Metrics"
            icon="activity"
            items={data.healthMetrics}
            renderItem={(m) => `${m.type}: ${m.value} ${m.unit}`}
            theme={theme}
          />

          {data.socialHistory && (
            <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <View style={styles.sectionHeader}>
                <Feather name="coffee" size={18} color={theme.link} />
                <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                  Social History
                </ThemedText>
              </View>
              {data.socialHistory.smokingStatus && (
                <ThemedText style={[styles.recordText, { color: theme.text, paddingVertical: Spacing.xs }]}>
                  Smoking: {data.socialHistory.smokingStatus}
                </ThemedText>
              )}
              {data.socialHistory.alcoholUse && (
                <ThemedText style={[styles.recordText, { color: theme.text, paddingVertical: Spacing.xs }]}>
                  Alcohol: {data.socialHistory.alcoholUse}
                </ThemedText>
              )}
              {data.socialHistory.occupation && (
                <ThemedText style={[styles.recordText, { color: theme.text, paddingVertical: Spacing.xs }]}>
                  Occupation: {data.socialHistory.occupation}
                </ThemedText>
              )}
              {data.socialHistory.exercise && (
                <ThemedText style={[styles.recordText, { color: theme.text, paddingVertical: Spacing.xs }]}>
                  Exercise: {data.socialHistory.exercise}
                </ThemedText>
              )}
            </View>
          )}

          {(data.emergencyContacts?.length ?? 0) > 0 && (
            <RecordSection
              title="Emergency Contacts"
              icon="phone"
              items={data.emergencyContacts}
              renderItem={(ec) => `${ec.name}${ec.relationship ? ` (${ec.relationship})` : ""}${ec.phone ? ` - ${ec.phone}` : ""}`}
              theme={theme}
            />
          )}

          {(data.insurance?.length ?? 0) > 0 && (
            <RecordSection
              title="Insurance"
              icon="shield"
              items={data.insurance}
              renderItem={(ins) => `${ins.provider}${ins.policyNumber ? ` #${ins.policyNumber}` : ""}`}
              theme={theme}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  loading: { paddingVertical: Spacing["4xl"], alignItems: "center" },
  empty: { paddingVertical: Spacing["4xl"], alignItems: "center" },
  section: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  recordRow: { paddingVertical: Spacing.sm },
  recordText: { fontSize: 14 },
});
