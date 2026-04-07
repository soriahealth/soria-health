import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { FormField } from "@/components/FormField";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getQueryFn, apiRequest, queryClient } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Route = RouteProp<RootStackParamList, "EditManagedProfile">;

const SEX_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const RELATIONSHIP_OPTIONS = [
  "Child", "Parent", "Spouse", "Sibling",
  "Grandparent", "Grandchild", "Other",
];

type ProfileData = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  biologicalSex: string | null;
  profileType: string;
  onboardingCompleted: boolean;
  relationship?: string;
};

export default function EditManagedProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { profileId } = route.params;

  const { data: profileData } = useQuery<ProfileData>({
    queryKey: [`/api/family/${profileId}/details`],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [biologicalSex, setBiologicalSex] = useState("");
  const [relationship, setRelationship] = useState("");

  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.firstName);
      setLastName(profileData.lastName);
      // Convert YYYY-MM-DD to DD-MM-YYYY for display
      if (profileData.dateOfBirth) {
        const parts = profileData.dateOfBirth.split("-");
        if (parts.length === 3 && parts[0].length === 4) {
          setDateOfBirth(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          setDateOfBirth(profileData.dateOfBirth);
        }
      }
      setBiologicalSex(profileData.biologicalSex ?? "");
      setRelationship(profileData.relationship ?? "");
    }
  }, [profileData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/family/${profileId}/edit`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim() || undefined,
        biologicalSex: biologicalSex || undefined,
        relationship: relationship || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/household/profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/family"] });
      queryClient.invalidateQueries({ queryKey: ["/api/family/managed"] });
      queryClient.invalidateQueries({ queryKey: [`/api/family/${profileId}/details`] });
      navigation.goBack();
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to save changes");
    },
  });

  const canSave = firstName.trim() && lastName.trim();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4">Edit Profile</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormField
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          autoCapitalize="words"
        />
        <FormField
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          autoCapitalize="words"
        />
        <FormField
          label="Date of Birth"
          value={dateOfBirth}
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, "").slice(0, 8);
            let formatted = digits;
            if (digits.length > 4) formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
            else if (digits.length > 2) formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
            setDateOfBirth(formatted);
          }}
          placeholder="DD-MM-YYYY"
          keyboardType="number-pad"
        />

        <View style={styles.chipSection}>
          <ThemedText style={[styles.chipLabel, { color: theme.text }]}>
            Biological Sex
          </ThemedText>
          <View style={styles.chipRow}>
            {SEX_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setBiologicalSex(opt)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: biologicalSex === opt ? theme.link : theme.backgroundSecondary,
                    borderColor: biologicalSex === opt ? theme.link : theme.border,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.chipText,
                    { color: biologicalSex === opt ? theme.buttonText : theme.text },
                  ]}
                >
                  {opt}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.chipSection}>
          <ThemedText style={[styles.chipLabel, { color: theme.text }]}>
            Relationship
          </ThemedText>
          <View style={styles.chipRow}>
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setRelationship(opt)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: relationship === opt ? theme.link : theme.backgroundSecondary,
                    borderColor: relationship === opt ? theme.link : theme.border,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.chipText,
                    { color: relationship === opt ? theme.buttonText : theme.text },
                  ]}
                >
                  {opt}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <Button
          onPress={() => saveMutation.mutate()}
          disabled={!canSave || saveMutation.isPending}
          style={{ marginTop: Spacing.lg }}
        >
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  form: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing.xl,
  },
  chipSection: { marginBottom: Spacing.lg },
  chipLabel: {
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: "500" },
});
