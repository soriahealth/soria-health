import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { getQueryFn } from "@/lib/query-client";

type ManagedChild = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  biologicalSex: string | null;
  relationship?: string | null;
};

const CHILD_RELATIONSHIPS = ["child", "son", "daughter", "stepchild", "stepson", "stepdaughter", "foster child"];

export default function ChildrenRecordsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const navigation = useNavigation<any>();

  const { data: managedProfiles = [], isLoading } = useQuery<ManagedChild[]>({
    queryKey: ["/api/family/managed"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Filter for child relationships
  const children = managedProfiles.filter(
    (p) => CHILD_RELATIONSHIPS.includes((p.relationship || "").toLowerCase())
  );

  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const activeId = selectedChildId ?? children[0]?.id ?? null;
  const selectedChild = children.find((c) => c.id === activeId);

  // Fetch health summary for selected child
  const { data: childSummary } = useQuery<any>({
    queryKey: ["/api/household/health-summary", activeId],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!activeId,
  });

  const handleAddChild = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("AddFamilyMember");
  };

  const getAge = (dob: string | null) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
    return age;
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
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openDrawer();
          }}
        >
          <Feather name="menu" size={22} color={theme.text} />
        </Pressable>
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="sun" size={20} color={theme.text} />
        </Pressable>
      </View>

      <ThemedText type="h2" style={styles.title}>
        Children's Health Records
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Manage medical information for your children under 18 years old.
      </ThemedText>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.link} style={{ marginTop: Spacing.xl }} />
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.childSelector}
            contentContainerStyle={styles.childSelectorContent}
          >
            {children.map((child) => (
              <Pressable
                key={child.id}
                onPress={() => setSelectedChildId(child.id)}
                style={[
                  styles.addChildButton,
                  {
                    borderColor: child.id === activeId ? theme.link : theme.border,
                    backgroundColor: child.id === activeId ? theme.link + "15" : "transparent",
                  },
                ]}
              >
                <ThemedText style={[styles.addChildText, { color: child.id === activeId ? theme.link : theme.textSecondary }]}>
                  {child.firstName}
                </ThemedText>
              </Pressable>
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
                    <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                      {selectedChild.firstName}'s basic details
                    </ThemedText>
                  </View>
                  <Pressable
                    style={[styles.editButton, { borderColor: theme.border }]}
                    onPress={() => navigation.navigate("EditManagedProfile", { profileId: selectedChild.id })}
                  >
                    <Feather name="edit-2" size={14} color={theme.textSecondary} />
                    <ThemedText style={[styles.editButtonText, { color: theme.textSecondary }]}>
                      Edit
                    </ThemedText>
                  </Pressable>
                </View>

                {renderField("Full Name", `${selectedChild.firstName} ${selectedChild.lastName}`)}
                {renderField("Date of Birth", selectedChild.dateOfBirth ? new Date(selectedChild.dateOfBirth).toLocaleDateString() : undefined)}
                {renderField("Sex", selectedChild.biologicalSex || undefined)}
                {renderField("Age", getAge(selectedChild.dateOfBirth) != null ? `${getAge(selectedChild.dateOfBirth)}` : undefined)}
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
                    <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                      {selectedChild.firstName}'s health details
                    </ThemedText>
                  </View>
                </View>

                {renderField("Allergies", childSummary?.allergies?.map((a: any) => a.allergen).join(", ") || undefined)}
                {renderField("Current Medications", childSummary?.medications?.map((m: any) => m.name).join(", ") || undefined)}
                {renderField("Medical Conditions", childSummary?.conditions?.map((c: any) => c.name).join(", ") || undefined)}
              </View>

              <Pressable
                style={[styles.sectionCard, { backgroundColor: theme.link + "10" }, Shadows.card]}
                onPress={() => navigation.navigate("FamilyMemberIntake", { profileId: selectedChild.id, firstName: selectedChild.firstName })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md }}>
                  <Feather name="edit" size={18} color={theme.link} />
                  <ThemedText style={{ color: theme.link, fontWeight: "600" }}>
                    Update {selectedChild.firstName}'s Health Records
                  </ThemedText>
                </View>
              </Pressable>
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
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
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
