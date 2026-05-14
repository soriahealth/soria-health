import React from "react";
import { View, StyleSheet, Pressable } from "react-native";

import { FormField } from "@/components/FormField";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export interface VitalEntry {
  type: string;
  value: string;
  unit: string;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface VitalsStepProps {
  entries: VitalEntry[];
  onChange: (entries: VitalEntry[]) => void;
}

function updateEntry(entries: VitalEntry[], type: string, value: string): VitalEntry[] {
  return entries.map((e) => (e.type === type ? { ...e, value } : e));
}

export function VitalsStep({ entries, onChange }: VitalsStepProps) {
  const { theme } = useTheme();

  const getValue = (type: string) => entries.find((e) => e.type === type)?.value ?? "";
  const bloodType = getValue("blood_type");

  // Parse height stored as total inches into feet and inches
  const heightVal = getValue("height");
  const totalInches = heightVal ? parseInt(heightVal, 10) : 0;
  const feet = totalInches ? String(Math.floor(totalInches / 12)) : "";
  const inches = totalInches ? String(totalInches % 12) : "";

  const handleHeightChange = (newFeet: string, newInches: string) => {
    const f = parseInt(newFeet, 10) || 0;
    const i = parseInt(newInches, 10) || 0;
    const total = f * 12 + i;
    onChange(updateEntry(entries, "height", total > 0 ? String(total) : ""));
  };

  return (
    <View>
      <ThemedText type="h4" style={styles.heading}>
        Basic Vitals
      </ThemedText>
      <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
        Enter your current vital measurements.
      </ThemedText>

      <FormField
        label="Weight (lbs)"
        value={getValue("weight")}
        onChangeText={(v) => onChange(updateEntry(entries, "weight", v))}
        placeholder="165"
        keyboardType="numeric"
      />

      <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>Height</ThemedText>
      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormField
            label="Feet"
            value={feet}
            onChangeText={(v) => handleHeightChange(v, inches)}
            placeholder="5"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfField}>
          <FormField
            label="Inches"
            value={inches}
            onChangeText={(v) => handleHeightChange(feet, v)}
            placeholder="8"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.bloodTypeSection}>
        <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>
          Blood Type
        </ThemedText>
        <View style={styles.bloodTypeGrid}>
          {BLOOD_TYPES.map((bt) => (
            <Pressable
              key={bt}
              onPress={() => onChange(updateEntry(entries, "blood_type", bt))}
              style={[
                styles.bloodTypeChip,
                {
                  backgroundColor: bloodType === bt ? theme.link : theme.backgroundSecondary,
                  borderColor: bloodType === bt ? theme.link : theme.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.bloodTypeText,
                  { color: bloodType === bt ? theme.buttonText : theme.text },
                ]}
              >
                {bt}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>
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
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  bloodTypeSection: {
    marginBottom: Spacing.lg,
  },
  bloodTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  bloodTypeChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  bloodTypeText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
