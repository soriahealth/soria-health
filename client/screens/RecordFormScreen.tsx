import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Pressable, Alert, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";

import { FormField } from "@/components/FormField";
import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";

type RouteParams = { recordType: string; recordId?: number };

const API_MAP: Record<string, string> = {
  conditions: "/api/health/conditions",
  medications: "/api/health/medications",
  allergies: "/api/health/allergies",
  surgeries: "/api/health/surgeries",
  metrics: "/api/health/metrics",
  "social-history": "/api/health/social-history",
};

const TYPE_LABELS: Record<string, string> = {
  conditions: "Condition",
  medications: "Medication",
  allergies: "Allergy",
  surgeries: "Surgery",
  metrics: "Health Metric",
  "social-history": "Social History",
};

export default function RecordFormScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { recordType, recordId } = route.params;

  const isEditing = !!recordId;
  const basePath = API_MAP[recordType] ?? `/api/health/${recordType}`;
  const typeLabel = TYPE_LABELS[recordType] ?? recordType;

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isPrivate, setIsPrivate] = useState(false);

  const supportsPrivacy = ["conditions", "medications", "allergies", "surgeries"].includes(recordType);

  // For editing, fetch existing data
  const { data: allRecords } = useQuery<any[]>({
    queryKey: [basePath],
    enabled: isEditing && recordType !== "social-history",
  });

  const { data: socialData } = useQuery<any>({
    queryKey: ["/api/health/social-history"],
    enabled: recordType === "social-history",
  });

  // Medication-specific data for refill tracking
  const { data: pharmacies = [] } = useQuery<any[]>({
    queryKey: ["/api/pharmacies"],
    enabled: recordType === "medications",
  });

  const { data: physicians = [] } = useQuery<any[]>({
    queryKey: ["/api/physicians"],
    enabled: recordType === "medications",
  });

  useEffect(() => {
    if (recordType === "social-history" && socialData) {
      setFormData({
        smokingStatus: socialData.smokingStatus ?? "",
        alcoholUse: socialData.alcoholUse ?? "",
        occupation: socialData.occupation ?? "",
        exercise: socialData.exercise ?? "",
      });
    } else if (isEditing && allRecords) {
      const record = allRecords.find((r: any) => r.id === recordId);
      if (record) {
        const data: Record<string, string> = {};
        for (const [key, val] of Object.entries(record)) {
          if (typeof val === "string" || typeof val === "number") {
            data[key] = String(val);
          }
        }
        setFormData(data);
        if (supportsPrivacy && typeof record.isPrivate === "boolean") {
          setIsPrivate(record.isPrivate);
        }
      }
    }
  }, [allRecords, socialData, isEditing, recordId, recordType]);

  const update = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const privacyField = supportsPrivacy ? { isPrivate } : {};
      if (recordType === "social-history") {
        await apiRequest("PUT", "/api/health/social-history", formData);
      } else if (isEditing) {
        const body = recordType === "medications"
          ? {
              ...formData,
              ...privacyField,
              daySupply: formData.daySupply ? parseInt(formData.daySupply) : null,
              refillsRemaining: formData.refillsRemaining ? parseInt(formData.refillsRemaining) : null,
              pharmacyId: formData.pharmacyId ? parseInt(formData.pharmacyId) : null,
              prescribingPhysicianId: formData.prescribingPhysicianId ? parseInt(formData.prescribingPhysicianId) : null,
            }
          : { ...formData, ...privacyField };
        await apiRequest("PUT", `${basePath}/${recordId}`, body);
      } else {
        let body: any;
        if (recordType === "metrics") {
          body = { ...formData, value: parseFloat(formData.value) || 0 };
        } else if (recordType === "medications") {
          body = {
            ...formData,
            ...privacyField,
            daySupply: formData.daySupply ? parseInt(formData.daySupply) : null,
            refillsRemaining: formData.refillsRemaining ? parseInt(formData.refillsRemaining) : null,
            pharmacyId: formData.pharmacyId ? parseInt(formData.pharmacyId) : null,
            prescribingPhysicianId: formData.prescribingPhysicianId ? parseInt(formData.prescribingPhysicianId) : null,
          };
        } else {
          body = { ...formData, ...privacyField };
        }
        await apiRequest("POST", basePath, body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [basePath] });
      queryClient.invalidateQueries({ queryKey: ["/api/health/summary"] });
      navigation.goBack();
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to save");
    },
  });

  const renderFields = () => {
    switch (recordType) {
      case "conditions":
        return (
          <>
            <FormField label="Condition Name" value={formData.name ?? ""} onChangeText={(v) => update("name", v)} placeholder="e.g. Hypertension" />
            <FormField label="Diagnosis Date" value={formData.diagnosisDate ?? ""} onChangeText={(v) => update("diagnosisDate", v)} placeholder="DD-MM-YYYY" keyboardType="numbers-and-punctuation" />
            <FormField label="Status" value={formData.status ?? ""} onChangeText={(v) => update("status", v)} placeholder="e.g. Active, Managed" />
          </>
        );
      case "medications":
        return (
          <>
            <FormField label="Medication Name" value={formData.name ?? ""} onChangeText={(v) => update("name", v)} placeholder="e.g. Lisinopril" />
            <FormField label="Dosage" value={formData.dosage ?? ""} onChangeText={(v) => update("dosage", v)} placeholder="e.g. 10mg" />
            <FormField label="Frequency" value={formData.frequency ?? ""} onChangeText={(v) => update("frequency", v)} placeholder="e.g. Once daily" />
            <FormField label="Last Filled Date" value={formData.lastFilledDate ?? ""} onChangeText={(v) => update("lastFilledDate", v)} placeholder="DD-MM-YYYY" keyboardType="numbers-and-punctuation" />
            <FormField label="Day Supply" value={formData.daySupply ?? ""} onChangeText={(v) => update("daySupply", v)} placeholder="e.g. 30, 90" keyboardType="numeric" />
            <FormField label="Refills Remaining" value={formData.refillsRemaining ?? ""} onChangeText={(v) => update("refillsRemaining", v)} placeholder="e.g. 3" keyboardType="numeric" />
            {pharmacies.length > 0 && (
              <View style={{ marginBottom: Spacing.lg }}>
                <ThemedText style={{ fontSize: 14, fontWeight: "600", marginBottom: Spacing.sm, color: theme.text }}>
                  Pharmacy
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
                  <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                    <Pressable
                      onPress={() => update("pharmacyId", "")}
                      style={{
                        paddingHorizontal: Spacing.md,
                        paddingVertical: Spacing.sm,
                        borderRadius: 20,
                        backgroundColor: !formData.pharmacyId ? theme.link : theme.backgroundSecondary,
                        borderWidth: 1,
                        borderColor: !formData.pharmacyId ? theme.link : theme.border,
                      }}
                    >
                      <ThemedText style={{ fontSize: 13, color: !formData.pharmacyId ? "#FFF" : theme.text }}>
                        None
                      </ThemedText>
                    </Pressable>
                    {pharmacies.map((p: any) => (
                      <Pressable
                        key={p.id}
                        onPress={() => update("pharmacyId", String(p.id))}
                        style={{
                          paddingHorizontal: Spacing.md,
                          paddingVertical: Spacing.sm,
                          borderRadius: 20,
                          backgroundColor: formData.pharmacyId === String(p.id) ? theme.link : theme.backgroundSecondary,
                          borderWidth: 1,
                          borderColor: formData.pharmacyId === String(p.id) ? theme.link : theme.border,
                        }}
                      >
                        <ThemedText style={{ fontSize: 13, color: formData.pharmacyId === String(p.id) ? "#FFF" : theme.text }}>
                          {p.name}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
            {physicians.length > 0 && (
              <View style={{ marginBottom: Spacing.lg }}>
                <ThemedText style={{ fontSize: 14, fontWeight: "600", marginBottom: Spacing.sm, color: theme.text }}>
                  Prescribing Physician
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
                  <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                    <Pressable
                      onPress={() => update("prescribingPhysicianId", "")}
                      style={{
                        paddingHorizontal: Spacing.md,
                        paddingVertical: Spacing.sm,
                        borderRadius: 20,
                        backgroundColor: !formData.prescribingPhysicianId ? theme.link : theme.backgroundSecondary,
                        borderWidth: 1,
                        borderColor: !formData.prescribingPhysicianId ? theme.link : theme.border,
                      }}
                    >
                      <ThemedText style={{ fontSize: 13, color: !formData.prescribingPhysicianId ? "#FFF" : theme.text }}>
                        None
                      </ThemedText>
                    </Pressable>
                    {physicians.map((doc: any) => (
                      <Pressable
                        key={doc.id}
                        onPress={() => update("prescribingPhysicianId", String(doc.id))}
                        style={{
                          paddingHorizontal: Spacing.md,
                          paddingVertical: Spacing.sm,
                          borderRadius: 20,
                          backgroundColor: formData.prescribingPhysicianId === String(doc.id) ? theme.link : theme.backgroundSecondary,
                          borderWidth: 1,
                          borderColor: formData.prescribingPhysicianId === String(doc.id) ? theme.link : theme.border,
                        }}
                      >
                        <ThemedText style={{ fontSize: 13, color: formData.prescribingPhysicianId === String(doc.id) ? "#FFF" : theme.text }}>
                          Dr. {doc.name}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </>
        );
      case "allergies":
        return (
          <>
            <FormField label="Allergen" value={formData.allergen ?? ""} onChangeText={(v) => update("allergen", v)} placeholder="e.g. Penicillin" />
            <FormField label="Reaction Type" value={formData.reactionType ?? ""} onChangeText={(v) => update("reactionType", v)} placeholder="e.g. Hives" />
            <FormField label="Severity" value={formData.severity ?? ""} onChangeText={(v) => update("severity", v)} placeholder="e.g. Mild, Moderate, Severe" />
          </>
        );
      case "surgeries":
        return (
          <>
            <FormField label="Procedure" value={formData.procedure ?? ""} onChangeText={(v) => update("procedure", v)} placeholder="e.g. Appendectomy" />
            <FormField label="Date" value={formData.date ?? ""} onChangeText={(v) => update("date", v)} placeholder="DD-MM-YYYY" keyboardType="numbers-and-punctuation" />
            <FormField label="Hospital" value={formData.hospital ?? ""} onChangeText={(v) => update("hospital", v)} placeholder="e.g. Memorial Hospital" />
          </>
        );
      case "metrics":
        return (
          <>
            <FormField label="Type" value={formData.type ?? ""} onChangeText={(v) => update("type", v)} placeholder="e.g. weight, heart_rate" />
            <FormField label="Value" value={formData.value ?? ""} onChangeText={(v) => update("value", v)} placeholder="e.g. 120" keyboardType="numeric" />
            <FormField label="Unit" value={formData.unit ?? ""} onChangeText={(v) => update("unit", v)} placeholder="e.g. lbs, bpm" />
          </>
        );
      case "social-history":
        return (
          <>
            <FormField label="Smoking Status" value={formData.smokingStatus ?? ""} onChangeText={(v) => update("smokingStatus", v)} placeholder="e.g. Never, Former" />
            <FormField label="Alcohol Use" value={formData.alcoholUse ?? ""} onChangeText={(v) => update("alcoholUse", v)} placeholder="e.g. None, Social" />
            <FormField label="Occupation" value={formData.occupation ?? ""} onChangeText={(v) => update("occupation", v)} placeholder="e.g. Software Engineer" />
            <FormField label="Exercise" value={formData.exercise ?? ""} onChangeText={(v) => update("exercise", v)} placeholder="e.g. Moderate, Active" />
          </>
        );
      default:
        return null;
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
        <ThemedText type="h4">
          {isEditing || recordType === "social-history" ? "Edit" : "Add"} {typeLabel}
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderFields()}

        {supportsPrivacy && (
          <View style={[styles.privacyRow, { borderColor: theme.border }]}>
            <Feather
              name={isPrivate ? "lock" : "unlock"}
              size={18}
              color={isPrivate ? theme.error : theme.textSecondary}
            />
            <View style={styles.privacyText}>
              <ThemedText style={styles.privacyLabel}>
                {isPrivate ? "Private" : "Shared with family"}
              </ThemedText>
              <ThemedText style={[styles.privacyHint, { color: theme.textTertiary }]}>
                {isPrivate
                  ? "Only you can see this record"
                  : "Visible to connected family members"}
              </ThemedText>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ true: theme.error, false: theme.border }}
            />
          </View>
        )}

        <Button
          onPress={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </ScrollView>
    </View>
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
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  form: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing.xl,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
    borderTopWidth: 1,
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
});
