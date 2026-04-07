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

  return (
    <View>
      <ThemedText type="h4" style={styles.heading}>
        Basic Vitals
      </ThemedText>
      <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
        Enter your current vital measurements.
      </ThemedText>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormField
            label="Systolic BP"
            value={getValue("systolic_bp")}
            onChangeText={(v) => onChange(updateEntry(entries, "systolic_bp", v))}
            placeholder="120"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfField}>
          <FormField
            label="Diastolic BP"
            value={getValue("diastolic_bp")}
            onChangeText={(v) => onChange(updateEntry(entries, "diastolic_bp", v))}
            placeholder="80"
            keyboardType="numeric"
          />
        </View>
      </View>

      <FormField
        label="Heart Rate (bpm)"
        value={getValue("heart_rate")}
        onChangeText={(v) => onChange(updateEntry(entries, "heart_rate", v))}
        placeholder="72"
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormField
            label="Weight (lbs)"
            value={getValue("weight")}
            onChangeText={(v) => onChange(updateEntry(entries, "weight", v))}
            placeholder="165"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfField}>
          <FormField
            label="Height (in)"
            value={getValue("height")}
            onChangeText={(v) => onChange(updateEntry(entries, "height", v))}
            placeholder="70"
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
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
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
