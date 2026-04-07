import React from "react";
import { View, StyleSheet, Pressable } from "react-native";

import { FormField } from "@/components/FormField";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export interface SocialHistoryData {
  smokingStatus: string;
  alcoholUse: string;
  occupation: string;
  exercise: string;
}

interface SocialHistoryStepProps {
  data: SocialHistoryData;
  onChange: (data: SocialHistoryData) => void;
}

const SMOKING_OPTIONS = ["Never", "Former", "Current", "Occasional"];
const ALCOHOL_OPTIONS = ["None", "Social", "Moderate", "Heavy"];
const EXERCISE_OPTIONS = ["None", "Light", "Moderate", "Active", "Very Active"];

interface ChipGroupProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

function ChipGroup({ label, options, selected, onSelect }: ChipGroupProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.chipGroup}>
      <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>{label}</ThemedText>
      <View style={styles.chipRow}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            style={[
              styles.chip,
              {
                backgroundColor: selected === opt ? theme.link : theme.backgroundSecondary,
                borderColor: selected === opt ? theme.link : theme.border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.chipText,
                { color: selected === opt ? theme.buttonText : theme.text },
              ]}
            >
              {opt}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function SocialHistoryStep({ data, onChange }: SocialHistoryStepProps) {
  const { theme } = useTheme();

  const update = (field: keyof SocialHistoryData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <View>
      <ThemedText type="h4" style={styles.heading}>
        Social History
      </ThemedText>
      <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
        Lifestyle factors that affect your health.
      </ThemedText>

      <ChipGroup
        label="Smoking Status"
        options={SMOKING_OPTIONS}
        selected={data.smokingStatus}
        onSelect={(v) => update("smokingStatus", v)}
      />

      <ChipGroup
        label="Alcohol Use"
        options={ALCOHOL_OPTIONS}
        selected={data.alcoholUse}
        onSelect={(v) => update("alcoholUse", v)}
      />

      <FormField
        label="Occupation"
        value={data.occupation}
        onChangeText={(v) => update("occupation", v)}
        placeholder="e.g. Software Engineer"
      />

      <ChipGroup
        label="Exercise Level"
        options={EXERCISE_OPTIONS}
        selected={data.exercise}
        onSelect={(v) => update("exercise", v)}
      />
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
  chipGroup: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
