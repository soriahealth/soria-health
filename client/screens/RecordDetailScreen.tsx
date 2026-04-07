import React from "react";
import { StyleSheet, View, ScrollView, Pressable, Alert, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";

type RouteParams = { recordType: string; recordId: number };

const API_MAP: Record<string, string> = {
  conditions: "/api/health/conditions",
  medications: "/api/health/medications",
  allergies: "/api/health/allergies",
  surgeries: "/api/health/surgeries",
  metrics: "/api/health/metrics",
};

const TYPE_LABELS: Record<string, string> = {
  conditions: "Condition",
  medications: "Medication",
  allergies: "Allergy",
  surgeries: "Surgery",
  metrics: "Health Metric",
};

function Field({ label, value }: { label: string; value?: string | null }) {
  const { theme } = useTheme();
  if (!value) return null;
  return (
    <View style={styles.field}>
      <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={styles.fieldValue}>{value}</ThemedText>
    </View>
  );
}

export default function RecordDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { recordType, recordId } = route.params;

  const basePath = API_MAP[recordType] ?? `/api/health/${recordType}`;
  const typeLabel = TYPE_LABELS[recordType] ?? recordType;

  const { data: allRecords } = useQuery<any[]>({
    queryKey: [basePath],
  });

  const record = allRecords?.find((r: any) => r.id === recordId);

  const supportsPrivacy = ["conditions", "medications", "allergies", "surgeries"].includes(recordType);

  const privacyMutation = useMutation({
    mutationFn: async (newValue: boolean) => {
      await apiRequest("PUT", `${basePath}/${recordId}`, { isPrivate: newValue });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [basePath] });
      queryClient.invalidateQueries({ queryKey: ["/api/health/summary"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `${basePath}/${recordId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [basePath] });
      queryClient.invalidateQueries({ queryKey: ["/api/health/summary"] });
      navigation.goBack();
    },
  });

  const handleDelete = () => {
    Alert.alert(
      `Delete ${typeLabel}`,
      `Are you sure you want to delete this ${typeLabel.toLowerCase()}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate() },
      ],
    );
  };

  const renderFields = () => {
    if (!record) return null;
    switch (recordType) {
      case "conditions":
        return (
          <>
            <Field label="Name" value={record.name} />
            <Field label="Diagnosis Date" value={record.diagnosisDate} />
            <Field label="Status" value={record.status} />
            <Field label="Clinical Code" value={record.clinicalCode} />
          </>
        );
      case "medications":
        return (
          <>
            <Field label="Name" value={record.name} />
            <Field label="Dosage" value={record.dosage} />
            <Field label="Frequency" value={record.frequency} />
          </>
        );
      case "allergies":
        return (
          <>
            <Field label="Allergen" value={record.allergen} />
            <Field label="Reaction Type" value={record.reactionType} />
            <Field label="Severity" value={record.severity} />
          </>
        );
      case "surgeries":
        return (
          <>
            <Field label="Procedure" value={record.procedure} />
            <Field label="Date" value={record.date} />
            <Field label="Hospital" value={record.hospital} />
          </>
        );
      case "metrics":
        return (
          <>
            <Field label="Type" value={record.type} />
            <Field label="Value" value={String(record.value)} />
            <Field label="Unit" value={record.unit} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4">{typeLabel} Details</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {record ? (
        <>
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            {renderFields()}
          </View>

          {supportsPrivacy && record && (
            <View style={[styles.privacyRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <Feather
                name={record.isPrivate ? "lock" : "unlock"}
                size={18}
                color={record.isPrivate ? theme.error : theme.textSecondary}
              />
              <View style={styles.privacyText}>
                <ThemedText style={styles.privacyLabel}>
                  {record.isPrivate ? "Private" : "Shared with family"}
                </ThemedText>
                <ThemedText style={[styles.privacyHint, { color: theme.textTertiary }]}>
                  {record.isPrivate
                    ? "Only you can see this record"
                    : "Visible to connected family members"}
                </ThemedText>
              </View>
              <Switch
                value={!!record.isPrivate}
                onValueChange={(val) => privacyMutation.mutate(val)}
                trackColor={{ true: theme.error, false: theme.border }}
                disabled={privacyMutation.isPending}
              />
            </View>
          )}

          <Button
            onPress={() =>
              navigation.navigate("RecordForm", { recordType, recordId })
            }
            style={styles.editButton}
          >
            Edit {typeLabel}
          </Button>
          <Button variant="outline" onPress={handleDelete} style={styles.deleteButton}>
            Delete {typeLabel}
          </Button>
        </>
      ) : (
        <ThemedText style={[styles.notFound, { color: theme.textSecondary }]}>
          Record not found.
        </ThemedText>
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  fieldValue: {
    fontSize: 16,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  privacyText: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  privacyHint: {
    fontSize: 13,
    marginTop: 2,
  },
  editButton: {
    marginBottom: Spacing.md,
  },
  deleteButton: {
    marginBottom: Spacing.md,
  },
  notFound: {
    fontSize: 15,
    textAlign: "center",
    marginTop: Spacing["3xl"],
  },
});
