import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { FormField } from "@/components/FormField";
import Button from "@/components/Button";
import { KeyboardSafeView } from "@/components/KeyboardSafeView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const RELATIONSHIPS = ["Child", "Parent", "Grandparent", "Spouse", "Sibling", "Other"];
const SEX_OPTIONS = ["Male", "Female", "Other"];

export default function AddFamilyMemberScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [biologicalSex, setBiologicalSex] = useState("");
  const [relationship, setRelationship] = useState("");
  const [isDeceased, setIsDeceased] = useState(false);

  const addMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, any> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        relationship,
        profileType: "managed",
        isDeceased,
      };
      if (dateOfBirth.trim()) body.dateOfBirth = dateOfBirth.trim();
      if (biologicalSex) body.biologicalSex = biologicalSex;

      const res = await apiRequest("POST", "/api/family/add", body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family"] });
      queryClient.invalidateQueries({ queryKey: ["/api/family/managed"] });
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to add family member");
    },
  });

  const handleAddWithProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !relationship) {
      Alert.alert("Required", "Please fill in first name, last name, and relationship.");
      return;
    }
    try {
      const result = await addMutation.mutateAsync();
      navigation.replace("FamilyMemberIntake", {
        profileId: result.profile.id,
        firstName: result.profile.firstName,
        isPostMortem: isDeceased,
      });
    } catch {
      // error handled in onError
    }
  };

  const handleAddWithout = async () => {
    if (!firstName.trim() || !lastName.trim() || !relationship) {
      Alert.alert("Required", "Please fill in first name, last name, and relationship.");
      return;
    }
    try {
      await addMutation.mutateAsync();
      navigation.goBack();
    } catch {
      // error handled in onError
    }
  };

  const formatDob = (text: string) => {
    // Auto-format DD-MM-YYYY
    const digits = text.replace(/\D/g, "");
    let formatted = "";
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length > 2) formatted += "-" + digits.slice(2, 4);
    if (digits.length > 4) formatted += "-" + digits.slice(4, 8);
    setDateOfBirth(formatted);
  };

  return (
    <KeyboardSafeView>
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
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={[styles.topBarTitle, { color: theme.textSecondary }]}>
          Add Family Member
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Invite an existing Soria user */}
        <View style={[styles.inviteSection, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.inviteSectionHeader}>
            <Feather name="user-plus" size={18} color={theme.link} />
            <ThemedText style={[styles.inviteSectionTitle, { color: theme.text }]}>
              Invite Someone to Connect
            </ThemedText>
          </View>
          <ThemedText style={[styles.inviteSectionDesc, { color: theme.textSecondary }]}>
            Send a connection request to another Soria user. Once they accept, you can view each other's health records.
          </ThemedText>
          <Pressable
            style={[styles.inviteButton, { backgroundColor: theme.link }]}
            onPress={() => navigation.navigate("SendConnection")}
          >
            <Feather name="send" size={16} color="#FFFFFF" />
            <ThemedText style={styles.inviteButtonText}>
              Send Connection Request
            </ThemedText>
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <ThemedText style={[styles.dividerText, { color: theme.textTertiary }]}>
            Or Create a Managed Profile
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <ThemedText type="h3" style={styles.heading}>
          Who would you like to add?
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Create a profile that you manage on behalf of a family member.
        </ThemedText>

        <FormField
          label="First Name"
          placeholder="Enter first name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />

        <FormField
          label="Last Name"
          placeholder="Enter last name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />

        <FormField
          label="Date of Birth (DD-MM-YYYY)"
          placeholder="DD-MM-YYYY"
          value={dateOfBirth}
          onChangeText={formatDob}
          keyboardType="number-pad"
          maxLength={10}
        />

        {/* Biological Sex */}
        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>
            Biological Sex
          </ThemedText>
          <View style={styles.chipRow}>
            {SEX_OPTIONS.map((opt) => {
              const selected = biologicalSex === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setBiologicalSex(selected ? "" : opt)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.link : theme.backgroundDefault,
                      borderColor: selected ? theme.link : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.chipText,
                      { color: selected ? "#FFFFFF" : theme.text },
                    ]}
                  >
                    {opt}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Relationship */}
        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>
            Relationship *
          </ThemedText>
          <View style={styles.chipRow}>
            {RELATIONSHIPS.map((rel) => {
              const selected = relationship === rel;
              return (
                <Pressable
                  key={rel}
                  onPress={() => setRelationship(rel)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.link : theme.backgroundDefault,
                      borderColor: selected ? theme.link : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.chipText,
                      { color: selected ? "#FFFFFF" : theme.text },
                    ]}
                  >
                    {rel}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Deceased / Post-Mortem Toggle */}
        <View style={[styles.deceasedSection, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.deceasedRow}>
            <View style={styles.deceasedTextArea}>
              <View style={styles.deceasedHeader}>
                <Feather name="bookmark" size={16} color={theme.textSecondary} />
                <ThemedText style={[styles.deceasedTitle, { color: theme.text }]}>
                  Post-Mortem Record
                </ThemedText>
              </View>
              <ThemedText style={[styles.deceasedDesc, { color: theme.textSecondary }]}>
                This person has passed. Only genetic medical history will be collected.
              </ThemedText>
            </View>
            <Switch
              value={isDeceased}
              onValueChange={setIsDeceased}
              trackColor={{ false: theme.border, true: theme.link }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          variant="outline"
          onPress={handleAddWithout}
          disabled={addMutation.isPending}
          style={styles.flexButton}
        >
          {addMutation.isPending ? "Adding..." : "Add Without Health Profile"}
        </Button>
        <Button
          onPress={handleAddWithProfile}
          disabled={addMutation.isPending}
          style={styles.flexButton}
        >
          {addMutation.isPending ? "Adding..." : "Add & Build Health Profile"}
        </Button>
      </View>
    </View>
    </KeyboardSafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing.xl,
  },
  inviteSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  inviteSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  inviteSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  inviteSectionDesc: {
    fontSize: 14,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  inviteButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "500",
  },
  heading: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: Spacing["2xl"],
  },
  fieldContainer: {
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  deceasedSection: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  deceasedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deceasedTextArea: {
    flex: 1,
    marginRight: Spacing.md,
  },
  deceasedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  deceasedTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  deceasedDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: "column",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  flexButton: {
    width: "100%",
  },
});
