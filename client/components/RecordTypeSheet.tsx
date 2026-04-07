import React from "react";
import { View, StyleSheet, Pressable, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const RECORD_TYPES: { type: string; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { type: "conditions", label: "Condition", icon: "activity" },
  { type: "medications", label: "Medication", icon: "package" },
  { type: "allergies", label: "Allergy", icon: "alert-triangle" },
  { type: "surgeries", label: "Surgery", icon: "scissors" },
  { type: "social-history", label: "Social History", icon: "users" },
];

interface RecordTypeSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (recordType: string) => void;
}

export function RecordTypeSheet({ visible, onClose, onSelect }: RecordTypeSheetProps) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.backgroundRoot }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <ThemedText type="h4" style={styles.title}>
            Add Health Record
          </ThemedText>

          {RECORD_TYPES.map((rt) => (
            <Pressable
              key={rt.type}
              style={[styles.option, { borderColor: theme.border }]}
              onPress={() => {
                onClose();
                onSelect(rt.type);
              }}
            >
              <Feather name={rt.icon} size={20} color={theme.link} />
              <ThemedText style={styles.optionLabel}>{rt.label}</ThemedText>
              <Feather name="chevron-right" size={18} color={theme.textTertiary} />
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
});
