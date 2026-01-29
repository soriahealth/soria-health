import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ChildCard } from "@/components/ChildCard";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { children } from "@/data/mockData";

export default function ChildrenRecordsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || "");

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const handleAddChild = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const renderField = (label: string, value?: string) => (
    <View style={styles.fieldContainer}>
      <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.fieldInput,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.fieldValue,
            { color: value ? theme.text : theme.textTertiary },
          ]}
        >
          {value || "Not provided"}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText type="h2" style={styles.title}>
        Children's Health Records
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Manage medical information for your children under 18 years old.
      </ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.childSelector}
        contentContainerStyle={styles.childSelectorContent}
      >
        {children.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            isSelected={child.id === selectedChildId}
            onPress={() => setSelectedChildId(child.id)}
          />
        ))}
        <Pressable
          style={[styles.addChildButton, { borderColor: theme.border }]}
          onPress={handleAddChild}
        >
          <Feather name="plus" size={16} color={theme.textSecondary} />
          <ThemedText style={[styles.addChildText, { color: theme.textSecondary }]}>
            Add Child
          </ThemedText>
        </Pressable>
      </ScrollView>

      {selectedChild ? (
        <>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: theme.backgroundDefault },
              Shadows.card,
            ]}
          >
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText type="h4">Personal Information</ThemedText>
                <ThemedText
                  style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
                >
                  {selectedChild.name}'s basic details
                </ThemedText>
              </View>
              <Pressable
                style={[styles.editButton, { borderColor: theme.border }]}
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
              >
                <Feather name="edit-2" size={14} color={theme.textSecondary} />
                <ThemedText
                  style={[styles.editButtonText, { color: theme.textSecondary }]}
                >
                  Edit
                </ThemedText>
              </Pressable>
            </View>

            {renderField("Full Name", selectedChild.name)}
            {renderField(
              "Date of Birth",
              selectedChild.dateOfBirth.toLocaleDateString()
            )}
            {renderField("Gender", selectedChild.gender)}
            {renderField("Age", `${selectedChild.age}`)}
            {renderField("Blood Type", selectedChild.bloodType)}
            {renderField("Height", selectedChild.height)}
            {renderField("Weight", selectedChild.weight)}
          </View>

          <View
            style={[
              styles.sectionCard,
              { backgroundColor: theme.backgroundDefault },
              Shadows.card,
            ]}
          >
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText type="h4">Medical Information</ThemedText>
                <ThemedText
                  style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
                >
                  {selectedChild.name}'s health details
                </ThemedText>
              </View>
            </View>

            {renderField("Allergies", selectedChild.allergies)}
            {renderField("Current Medications", selectedChild.medications)}
            {renderField("Medical Conditions", selectedChild.conditions)}
            {renderField("Immunization Record", selectedChild.immunizations)}
          </View>

          <View
            style={[
              styles.sectionCard,
              { backgroundColor: theme.backgroundDefault },
              Shadows.card,
            ]}
          >
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText type="h4">Pediatrician Information</ThemedText>
                <ThemedText
                  style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
                >
                  {selectedChild.name}'s primary care doctor
                </ThemedText>
              </View>
            </View>

            {renderField("Pediatrician Name", selectedChild.pediatricianName)}
            {renderField("Phone Number", selectedChild.pediatricianPhone)}
          </View>

          <View
            style={[
              styles.sectionCard,
              { backgroundColor: theme.backgroundDefault },
              Shadows.card,
            ]}
          >
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText type="h4">Emergency Contact</ThemedText>
                <ThemedText
                  style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
                >
                  Primary emergency contact for {selectedChild.name}
                </ThemedText>
              </View>
            </View>

            {renderField("Contact Information", selectedChild.emergencyContact)}
            {renderField("Relationship", selectedChild.emergencyRelationship)}
          </View>
        </>
      ) : (
        <EmptyState
          image={require("../../assets/images/empty-health.png")}
          title="No Children Added"
          message="Add your children to manage their health records in one place."
          actionLabel="Add Child"
          onAction={handleAddChild}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: Spacing.xl,
  },
  childSelector: {
    marginBottom: Spacing.xl,
    marginHorizontal: -Spacing.lg,
  },
  childSelectorContent: {
    paddingHorizontal: Spacing.lg,
  },
  addChildButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: Spacing.xs,
  },
  addChildText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sectionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  fieldInput: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  fieldValue: {
    fontSize: 16,
  },
});
