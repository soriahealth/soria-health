import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { FormField } from "@/components/FormField";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "AddPhysician">;

const SPECIALTIES = [
  "PCP",
  "Psychiatrist",
  "Cardiologist",
  "Neurologist",
  "Oncologist",
  "Other",
];

export default function AddPhysicianScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const physicianId = route.params?.physicianId;
  const isEditing = !!physicianId;

  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [npi, setNpi] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  // Load existing physician data if editing
  const { data: physicians = [] } = useQuery<any[]>({
    queryKey: ["/api/physicians"],
    enabled: isEditing,
  });

  useEffect(() => {
    if (isEditing && physicians.length > 0) {
      const doc = physicians.find((p: any) => p.id === physicianId);
      if (doc) {
        setName(doc.name || "");
        setSpecialty(doc.specialty || "");
        setPhone(doc.phone || "");
        setFax(doc.fax || "");
        setEmail(doc.email || "");
        setAddress(doc.address || "");
        setNpi(doc.npi || "");
        setIsPrimary(doc.isPrimary || false);
      }
    }
  }, [isEditing, physicians, physicianId]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: name.trim(),
        specialty: specialty || null,
        phone: phone.trim() || null,
        fax: fax.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        npi: npi.trim() || null,
        isPrimary,
      };
      if (isEditing) {
        await apiRequest("PUT", `/api/physicians/${physicianId}`, body);
      } else {
        await apiRequest("POST", "/api/physicians", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/physicians"] });
      navigation.goBack();
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to save physician");
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter the physician's name.");
      return;
    }
    saveMutation.mutate();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundRoot, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="h4" style={styles.headerTitle}>
          {isEditing ? "Edit Physician" : "Add Physician"}
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing["3xl"] }}
        showsVerticalScrollIndicator={false}
      >
        <FormField
          label="Name *"
          placeholder="Full name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Specialty Picker */}
        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.label, { color: theme.text }]}>
            Specialty
          </ThemedText>
          <View style={styles.chipRow}>
            {SPECIALTIES.map((s) => {
              const isSelected = specialty === s;
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSpecialty(isSelected ? "" : s)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.link : theme.backgroundSecondary,
                      borderColor: isSelected ? theme.link : theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={[
                      styles.chipText,
                      { color: isSelected ? "#FFFFFF" : theme.text },
                    ]}
                  >
                    {s}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <FormField
          label="Phone"
          placeholder="(555) 123-4567"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <FormField
          label="Fax"
          placeholder="(555) 123-4568"
          value={fax}
          onChangeText={setFax}
          keyboardType="phone-pad"
        />

        <FormField
          label="Email"
          placeholder="doctor@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <FormField
          label="Address"
          placeholder="123 Medical Dr, Suite 100"
          value={address}
          onChangeText={setAddress}
        />

        <FormField
          label="NPI Number"
          placeholder="1234567890"
          value={npi}
          onChangeText={setNpi}
          keyboardType="number-pad"
        />

        {/* Is Primary Toggle */}
        <View style={[styles.toggleRow, { borderColor: theme.border }]}>
          <View style={styles.toggleInfo}>
            <ThemedText style={[styles.toggleLabel, { color: theme.text }]}>
              Primary Care Physician
            </ThemedText>
            <ThemedText style={[styles.toggleDescription, { color: theme.textSecondary }]}>
              Mark as your PCP for the escalation chain
            </ThemedText>
          </View>
          <Switch
            value={isPrimary}
            onValueChange={setIsPrimary}
            trackColor={{ false: theme.border, true: theme.link }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Button
          onPress={handleSave}
          disabled={saveMutation.isPending}
          style={{ marginTop: Spacing.xl }}
        >
          {saveMutation.isPending
            ? "Saving..."
            : isEditing
            ? "Update Physician"
            : "Add Physician"}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  form: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
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
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: Spacing.sm,
  },
  toggleInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  toggleDescription: {
    fontSize: 13,
    marginTop: 2,
  },
});
