import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { FormField } from "@/components/FormField";
import { ClinicalTypeahead } from "@/components/ClinicalTypeahead";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export interface SurgeryEntry {
  procedure: string;
  date: string;
  hospital: string;
}

interface SurgeriesStepProps {
  entries: SurgeryEntry[];
  onChange: (entries: SurgeryEntry[]) => void;
}

export function SurgeriesStep({ entries, onChange }: SurgeriesStepProps) {
  const { theme } = useTheme();

  const addEntry = () => {
    onChange([...entries, { procedure: "", date: "", hospital: "" }]);
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof SurgeryEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <View>
      <ThemedText type="h4" style={styles.heading}>
        Surgeries & Procedures
      </ThemedText>
      <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
        List any past surgeries or major procedures.
      </ThemedText>

      {entries.map((entry, index) => (
        <View
          key={index}
          style={[styles.entryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <View style={styles.entryHeader}>
            <ThemedText style={[styles.entryLabel, { color: theme.textSecondary }]}>
              Surgery {index + 1}
            </ThemedText>
            <Pressable onPress={() => removeEntry(index)} hitSlop={8}>
              <Feather name="x" size={18} color={theme.textTertiary} />
            </Pressable>
          </View>

          <ClinicalTypeahead
            label="Procedure"
            value={entry.procedure}
            onChangeText={(v) => updateEntry(index, "procedure", v)}
            apiEndpoint="https://clinicaltables.nlm.nih.gov/api/procedures/v3/search"
            placeholder="Search procedures..."
          />
          <FormField
            label="Date"
            value={entry.date}
            onChangeText={(v) => updateEntry(index, "date", v)}
            placeholder="DD-MM-YYYY"
            keyboardType="numbers-and-punctuation"
          />
          <FormField
            label="Hospital"
            value={entry.hospital}
            onChangeText={(v) => updateEntry(index, "hospital", v)}
            placeholder="e.g. Memorial Hospital"
          />
        </View>
      ))}

      <Pressable
        style={[styles.addButton, { borderColor: theme.link }]}
        onPress={addEntry}
      >
        <Feather name="plus" size={16} color={theme.link} />
        <ThemedText style={[styles.addButtonText, { color: theme.link }]}>
          Add another surgery
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
