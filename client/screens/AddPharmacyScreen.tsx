import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
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
type Route = RouteProp<RootStackParamList, "AddPharmacy">;

export default function AddPharmacyScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const pharmacyId = route.params?.pharmacyId;
  const isEditing = !!pharmacyId;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");
  const [address, setAddress] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Load existing pharmacy data if editing
  const { data: pharmacies = [] } = useQuery<any[]>({
    queryKey: ["/api/pharmacies"],
  });

  useEffect(() => {
    if (isEditing && pharmacies.length > 0) {
      const pharmacy = pharmacies.find((p: any) => p.id === pharmacyId);
      if (pharmacy) {
        setName(pharmacy.name || "");
        setPhone(pharmacy.phone || "");
        setFax(pharmacy.fax || "");
        setAddress(pharmacy.address || "");
        setIsDefault(pharmacy.isDefault || false);
      }
    }
  }, [isEditing, pharmacies, pharmacyId]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: name.trim(),
        phone: phone.trim() || null,
        fax: fax.trim() || null,
        address: address.trim() || null,
        isDefault,
      };
      if (isEditing) {
        await apiRequest("PUT", `/api/pharmacies/${pharmacyId}`, body);
      } else {
        await apiRequest("POST", "/api/pharmacies", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacies"] });
      navigation.goBack();
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to save pharmacy");
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter the pharmacy name.");
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
          {isEditing ? "Edit Pharmacy" : "Add Pharmacy"}
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing["3xl"] }}
        showsVerticalScrollIndicator={false}
      >
        <FormField
          label="Pharmacy Name *"
          placeholder="e.g., CVS Pharmacy"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

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
          label="Address"
          placeholder="123 Main St, City, State ZIP"
          value={address}
          onChangeText={setAddress}
        />

        {/* Is Default Toggle */}
        <View style={[styles.toggleRow, { borderColor: theme.border }]}>
          <View style={styles.toggleInfo}>
            <ThemedText style={[styles.toggleLabel, { color: theme.text }]}>
              Default Pharmacy
            </ThemedText>
            <ThemedText style={[styles.toggleDescription, { color: theme.textSecondary }]}>
              Use this pharmacy by default for new refill requests
            </ThemedText>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
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
            ? "Update Pharmacy"
            : "Add Pharmacy"}
        </Button>

        {/* Show existing pharmacies when adding new */}
        {!isEditing && pharmacies.length > 0 && (
          <View style={{ marginTop: Spacing["2xl"] }}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Your Pharmacies
            </ThemedText>
            {pharmacies.map((p: any) => (
              <View
                key={p.id}
                style={[styles.existingCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
              >
                <View style={styles.existingInfo}>
                  <ThemedText style={[styles.existingName, { color: theme.text }]}>
                    {p.name}
                  </ThemedText>
                  {p.address && (
                    <ThemedText style={[styles.existingDetail, { color: theme.textSecondary }]}>
                      {p.address}
                    </ThemedText>
                  )}
                </View>
                {p.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: theme.success + "20" }]}>
                    <ThemedText style={[styles.defaultBadgeText, { color: theme.success }]}>
                      Default
                    </ThemedText>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  existingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  existingInfo: {
    flex: 1,
  },
  existingName: {
    fontSize: 15,
    fontWeight: "500",
  },
  existingDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  defaultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
