import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { FormField } from "@/components/FormField";
import { ClinicalTypeahead } from "@/components/ClinicalTypeahead";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export interface MedicationEntry {
  name: string;
  dosage: string;
  frequency: string;
}

interface MedicationsStepProps {
  entries: MedicationEntry[];
  onChange: (entries: MedicationEntry[]) => void;
}

export function MedicationsStep({ entries, onChange }: MedicationsStepProps) {
  const { theme } = useTheme();

  const addEntry = () => {
    onChange([...entries, { name: "", dosage: "", frequency: "" }]);
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof MedicationEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <View>
      <ThemedText type="h4" style={styles.heading}>
        Current Medications
      </ThemedText>
      <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
        List any medications you're currently taking.
      </ThemedText>

      {entries.map((entry, index) => (
        <View
          key={index}
          style={[styles.entryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <View style={styles.entryHeader}>
            <ThemedText style={[styles.entryLabel, { color: theme.textSecondary }]}>
              Medication {index + 1}
            </ThemedText>
            <Pressable onPress={() => removeEntry(index)} hitSlop={8}>
              <Feather name="x" size={18} color={theme.textTertiary} />
            </Pressable>
          </View>

          <ClinicalTypeahead
            label="Medication Name"
            value={entry.name}
            onChangeText={(v) => updateEntry(index, "name", v)}
            apiEndpoint="https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search"
            placeholder="Search medications..."
          />
          <FormField
            label="Dosage"
            value={entry.dosage}
            onChangeText={(v) => updateEntry(index, "dosage", v)}
            placeholder="e.g. 10mg"
          />
          <FormField
            label="Frequency"
            value={entry.frequency}
            onChangeText={(v) => updateEntry(index, "frequency", v)}
            placeholder="e.g. Once daily"
          />
        </View>
      ))}

      <Pressable
        style={[styles.addButton, { borderColor: theme.link }]}
        onPress={addEntry}
      >
        <Feather name="plus" size={16} color={theme.link} />
        <ThemedText style={[styles.addButtonText, { color: theme.link }]}>
          Add another medication
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
