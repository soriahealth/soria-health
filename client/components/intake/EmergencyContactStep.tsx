import React from "react";
import { View, StyleSheet, Pressable } from "react-native";

import { FormField } from "@/components/FormField";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export interface EmergencyContactData {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface EmergencyContactStepProps {
  data: EmergencyContactData;
  onChange: (data: EmergencyContactData) => void;
}

const RELATIONSHIP_OPTIONS = ["Spouse", "Parent", "Sibling", "Child", "Friend", "Other"];

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

export function EmergencyContactStep({ data, onChange }: EmergencyContactStepProps) {
  const { theme } = useTheme();

  const update = (field: keyof EmergencyContactData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <View>
      <ThemedText type="h4" style={styles.heading}>
        Emergency Contact
      </ThemedText>
      <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
        Add someone we can reach in case of emergency.
      </ThemedText>

      <FormField
        label="Contact Name"
        value={data.name}
        onChangeText={(v) => update("name", v)}
        placeholder="Full name"
      />

      <ChipGroup
        label="Relationship"
        options={RELATIONSHIP_OPTIONS}
        selected={data.relationship}
        onSelect={(v) => update("relationship", v)}
      />

      <FormField
        label="Phone Number"
        value={data.phone}
        onChangeText={(v) => update("phone", v)}
        placeholder="(555) 123-4567"
        keyboardType="phone-pad"
      />

      <FormField
        label="Email"
        value={data.email}
        onChangeText={(v) => update("email", v)}
        placeholder="email@example.com"
        keyboardType="email-address"
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
