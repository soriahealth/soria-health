import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { FormField } from "@/components/FormField";
import { ClinicalTypeahead } from "@/components/ClinicalTypeahead";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export interface ConditionEntry {
  name: string;
  diagnosisDate: string;
  status: string;
}

interface ConditionsStepProps {
  entries: ConditionEntry[];
  onChange: (entries: ConditionEntry[]) => void;
}

const STATUS_OPTIONS = ["Active", "Managed", "Controlled", "Resolved"];

export function ConditionsStep({ entries, onChange }: ConditionsStepProps) {
  const { theme } = useTheme();

  const addEntry = () => {
    onChange([...entries, { name: "", diagnosisDate: "", status: "Active" }]);
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof ConditionEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleDiagnosisDateChange = (index: number, raw: string) => {
    // Strip non-digits
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = digits.slice(0, 2) + "-" + digits.slice(2, 4) + "-" + digits.slice(4);
    } else if (digits.length > 2) {
      formatted = digits.slice(0, 2) + "-" + digits.slice(2);
    }
    updateEntry(index, "diagnosisDate", formatted);
  };

  return (
    <View>
      <ThemedText type="h4" style={styles.heading}>
        Medical Conditions
      </ThemedText>
      <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
        List any current or past medical conditions.
      </ThemedText>

      {entries.map((entry, index) => (
        <View
          key={index}
          style={[styles.entryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <View style={styles.entryHeader}>
            <ThemedText style={[styles.entryLabel, { color: theme.textSecondary }]}>
              Condition {index + 1}
            </ThemedText>
            <Pressable onPress={() => removeEntry(index)} hitSlop={8}>
              <Feather name="x" size={18} color={theme.textTertiary} />
            </Pressable>
          </View>

          <ClinicalTypeahead
            label="Condition Name"
            value={entry.name}
            onChangeText={(v) => updateEntry(index, "name", v)}
            apiEndpoint="https://clinicaltables.nlm.nih.gov/api/conditions/v3/search"
            placeholder="Search conditions..."
          />
          <FormField
            label="Diagnosis Date"
            value={entry.diagnosisDate}
            onChangeText={(v) => handleDiagnosisDateChange(index, v)}
            placeholder="DD-MM-YYYY"
            keyboardType="number-pad"
            maxLength={10}
          />

          <View style={styles.statusSection}>
            <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>Status</ThemedText>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => updateEntry(index, "status", opt)}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: entry.status === opt ? theme.link : theme.backgroundSecondary,
                      borderColor: entry.status === opt ? theme.link : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.statusText,
                      { color: entry.status === opt ? theme.buttonText : theme.text },
                    ]}
                  >
                    {opt}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      ))}

      <Pressable
        style={[styles.addButton, { borderColor: theme.link }]}
        onPress={addEntry}
      >
        <Feather name="plus" size={16} color={theme.link} />
        <ThemedText style={[styles.addButtonText, { color: theme.link }]}>
          Add another condition
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 15,
    marginBottom: Spacing.xl,
  },
  entryCard: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  entryLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  statusSection: {
    marginBottom: Spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  statusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
