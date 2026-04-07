import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { FormField } from "@/components/FormField";
import { ClinicalTypeahead } from "@/components/ClinicalTypeahead";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export interface AllergyEntry {
  allergen: string;
  reactionType: string;
  severity: string;
}

interface AllergiesStepProps {
  entries: AllergyEntry[];
  onChange: (entries: AllergyEntry[]) => void;
}

const SEVERITY_OPTIONS = ["Mild", "Moderate", "Severe"];

export function AllergiesStep({ entries, onChange }: AllergiesStepProps) {
  const { theme } = useTheme();

  const addEntry = () => {
    onChange([...entries, { allergen: "", reactionType: "", severity: "Mild" }]);
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof AllergyEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <View>
      <ThemedText type="h4" style={styles.heading}>
        Allergies
      </ThemedText>
      <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
        List any known allergies (medications, food, environmental).
      </ThemedText>

      {entries.map((entry, index) => (
        <View
          key={index}
          style={[styles.entryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <View style={styles.entryHeader}>
            <ThemedText style={[styles.entryLabel, { color: theme.textSecondary }]}>
              Allergy {index + 1}
            </ThemedText>
            <Pressable onPress={() => removeEntry(index)} hitSlop={8}>
              <Feather name="x" size={18} color={theme.textTertiary} />
            </Pressable>
          </View>

          <ClinicalTypeahead
            label="Allergen"
            value={entry.allergen}
            onChangeText={(v) => updateEntry(index, "allergen", v)}
            apiEndpoint="https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search"
            placeholder="Search allergens..."
          />
          <FormField
            label="Reaction Type"
            value={entry.reactionType}
            onChangeText={(v) => updateEntry(index, "reactionType", v)}
            placeholder="e.g. Hives, anaphylaxis"
          />

          <View style={styles.severitySection}>
            <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>Severity</ThemedText>
            <View style={styles.severityRow}>
              {SEVERITY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => updateEntry(index, "severity", opt)}
                  style={[
                    styles.severityChip,
                    {
                      backgroundColor: entry.severity === opt ? theme.link : theme.backgroundSecondary,
                      borderColor: entry.severity === opt ? theme.link : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.severityText,
                      { color: entry.severity === opt ? theme.buttonText : theme.text },
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
          Add another allergy
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
  severitySection: {
    marginBottom: Spacing.sm,
  },
  severityRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  severityChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  severityText: {
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
