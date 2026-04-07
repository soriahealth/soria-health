import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";

import { FormField } from "@/components/FormField";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

export interface InsuranceData {
  provider: string;
  policyNumber: string;
  groupNumber: string;
  planType: string;
  subscriberName: string;
}

interface InsuranceStepProps {
  data: InsuranceData;
  onChange: (data: InsuranceData) => void;
}

const PLAN_TYPE_OPTIONS = ["PPO", "HMO", "EPO", "POS", "HDHP", "Other"];

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

export function InsuranceStep({ data, onChange }: InsuranceStepProps) {
  const { theme } = useTheme();
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const update = (field: keyof InsuranceData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const pickImage = async (side: "front" | "back") => {
    const options = ["Take Photo", "Choose from Library", "Cancel"];

    if (Platform.OS === "web") {
      // On web, just use library picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        if (side === "front") setFrontUri(result.assets[0].uri);
        else setBackUri(result.assets[0].uri);
      }
      return;
    }

    Alert.alert("Add Insurance Card Photo", `Capture the ${side} of your card`, [
      {
        text: "Take Photo",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission needed", "Camera access is required to take photos.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            if (side === "front") setFrontUri(result.assets[0].uri);
            else setBackUri(result.assets[0].uri);
          }
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            if (side === "front") setFrontUri(result.assets[0].uri);
            else setBackUri(result.assets[0].uri);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const scanCards = async () => {
    if (!frontUri) {
      Alert.alert("Photo Required", "Please add a photo of the front of your insurance card.");
      return;
    }

    setScanning(true);
    try {
      const formData = new FormData();

      // Add front image
      if (Platform.OS === "web") {
        const frontBlob = await fetch(frontUri).then((r) => r.blob());
        formData.append("front", frontBlob, "front.jpg");
      } else {
        formData.append("front", {
          uri: frontUri,
          type: "image/jpeg",
          name: "front.jpg",
        } as any);
      }

      // Add back image if provided
      if (backUri) {
        if (Platform.OS === "web") {
          const backBlob = await fetch(backUri).then((r) => r.blob());
          formData.append("back", backBlob, "back.jpg");
        } else {
          formData.append("back", {
            uri: backUri,
            type: "image/jpeg",
            name: "back.jpg",
          } as any);
        }
      }

      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/insurance/scan", baseUrl).href, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to scan card");
      }

      const result = await response.json();

      // Update form fields with extracted data
      onChange({
        provider: result.provider || data.provider,
        policyNumber: result.policyNumber || data.policyNumber,
        groupNumber: result.groupNumber || data.groupNumber,
        planType: result.planType || data.planType,
        subscriberName: result.subscriberName || data.subscriberName,
      });

      if (result.message) {
        Alert.alert("Note", result.message);
      }
    } catch (err) {
      console.error("Insurance scan error:", err);
      Alert.alert("Scan Failed", "Could not extract information from the card. Please enter details manually.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <View>
      <ThemedText type="h4" style={styles.heading}>
        Medical Insurance
      </ThemedText>
      <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
        Scan your insurance card or enter details manually.
      </ThemedText>

      {/* Card capture section */}
      <View style={[styles.scanSection, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <View style={styles.scanHeader}>
          <Feather name="camera" size={20} color={theme.link} />
          <ThemedText style={[styles.scanTitle, { color: theme.text }]}>
            Scan Insurance Card
          </ThemedText>
        </View>
        <ThemedText style={[styles.scanSubtitle, { color: theme.textSecondary }]}>
          Take a photo of your card to auto-fill the form
        </ThemedText>

        <View style={styles.cardRow}>
          {/* Front card */}
          <TouchableOpacity
            style={[styles.cardSlot, { borderColor: frontUri ? theme.link : theme.border }]}
            onPress={() => pickImage("front")}
            activeOpacity={0.7}
          >
            {frontUri ? (
              <Image source={{ uri: frontUri }} style={styles.cardImage} resizeMode="cover" />
            ) : (
              <View style={styles.cardPlaceholder}>
                <Feather name="plus" size={24} color={theme.textSecondary} />
                <ThemedText style={[styles.cardLabel, { color: theme.textSecondary }]}>
                  Front
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>

          {/* Back card */}
          <TouchableOpacity
            style={[styles.cardSlot, { borderColor: backUri ? theme.link : theme.border }]}
            onPress={() => pickImage("back")}
            activeOpacity={0.7}
          >
            {backUri ? (
              <Image source={{ uri: backUri }} style={styles.cardImage} resizeMode="cover" />
            ) : (
              <View style={styles.cardPlaceholder}>
                <Feather name="plus" size={24} color={theme.textSecondary} />
                <ThemedText style={[styles.cardLabel, { color: theme.textSecondary }]}>
                  Back
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {frontUri && (
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: scanning ? theme.border : theme.link }]}
            onPress={scanCards}
            activeOpacity={0.8}
            disabled={scanning}
          >
            {scanning ? (
              <View style={styles.scanningRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <ThemedText style={styles.scanButtonText}>Analyzing card...</ThemedText>
              </View>
            ) : (
              <View style={styles.scanningRow}>
                <Feather name="zap" size={16} color="#FFFFFF" />
                <ThemedText style={styles.scanButtonText}>Auto-Fill from Card</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Manual form fields */}
      <FormField
        label="Insurance Provider"
        value={data.provider}
        onChangeText={(v) => update("provider", v)}
        placeholder="e.g. Blue Cross Blue Shield"
      />

      <FormField
        label="Policy Number"
        value={data.policyNumber}
        onChangeText={(v) => update("policyNumber", v)}
        placeholder="Policy or member ID"
      />

      <FormField
        label="Group Number"
        value={data.groupNumber}
        onChangeText={(v) => update("groupNumber", v)}
        placeholder="Group number"
      />

      <ChipGroup
        label="Plan Type"
        options={PLAN_TYPE_OPTIONS}
        selected={data.planType}
        onSelect={(v) => update("planType", v)}
      />

      <FormField
        label="Subscriber Name"
        value={data.subscriberName}
        onChangeText={(v) => update("subscriberName", v)}
        placeholder="If different from you"
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
  scanSection: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  scanHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  scanSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.lg,
  },
  cardRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cardSlot: {
    flex: 1,
    aspectRatio: 1.586, // Standard card ratio (3.375 x 2.125 inches)
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  cardPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  scanButton: {
    marginTop: Spacing.lg,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  scanningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
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
