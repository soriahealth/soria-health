import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

import type { VitalEntry } from "./VitalsStep";
import type { ConditionEntry } from "./ConditionsStep";
import type { MedicationEntry } from "./MedicationsStep";
import type { AllergyEntry } from "./AllergiesStep";
import type { SurgeryEntry } from "./SurgeriesStep";
import type { SocialHistoryData } from "./SocialHistoryStep";
import type { EmergencyContactData } from "./EmergencyContactStep";
import type { InsuranceData } from "./InsuranceStep";

interface ReviewStepProps {
  vitals: VitalEntry[];
  conditions: ConditionEntry[];
  medications: MedicationEntry[];
  allergies: AllergyEntry[];
  surgeries: SurgeryEntry[];
  socialHistory: SocialHistoryData;
  emergencyContact: EmergencyContactData;
  insurance: InsuranceData;
  onEditSection: (step: number) => void;
}

interface SectionCardProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  count: number;
  details: string[];
  onEdit: () => void;
}

function SectionCard({ title, icon, count, details, onEdit }: SectionCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Feather name={icon} size={18} color={theme.link} />
          <ThemedText style={styles.cardTitleText}>{title}</ThemedText>
          <View style={[styles.countBadge, { backgroundColor: theme.backgroundTertiary }]}>
            <ThemedText style={[styles.countText, { color: theme.textSecondary }]}>
              {count}
            </ThemedText>
          </View>
        </View>
        <Pressable onPress={onEdit} hitSlop={8}>
          <ThemedText style={[styles.editLink, { color: theme.link }]}>Edit</ThemedText>
        </Pressable>
      </View>
      {details.length > 0 ? (
        details.map((detail, i) => (
          <ThemedText key={i} style={[styles.detailText, { color: theme.textSecondary }]}>
            {detail}
          </ThemedText>
        ))
      ) : (
        <ThemedText style={[styles.detailText, { color: theme.textTertiary }]}>
          None added
        </ThemedText>
      )}
    </View>
  );
}

export function ReviewStep({
  vitals,
  conditions,
  medications,
  allergies,
  surgeries,
  socialHistory,
  emergencyContact,
  insurance,
  onEditSection,
}: ReviewStepProps) {
  const { theme } = useTheme();

  const filledVitals = vitals.filter((v) => v.value.trim());
  const filledConditions = conditions.filter((c) => c.name.trim());
  const filledMedications = medications.filter((m) => m.name.trim());
  const filledAllergies = allergies.filter((a) => a.allergen.trim());
  const filledSurgeries = surgeries.filter((s) => s.procedure.trim());

  const socialDetails: string[] = [];
  if (socialHistory.smokingStatus) socialDetails.push(`Smoking: ${socialHistory.smokingStatus}`);
  if (socialHistory.alcoholUse) socialDetails.push(`Alcohol: ${socialHistory.alcoholUse}`);
  if (socialHistory.occupation) socialDetails.push(`Occupation: ${socialHistory.occupation}`);
  if (socialHistory.exercise) socialDetails.push(`Exercise: ${socialHistory.exercise}`);

  const ecDetails: string[] = [];
  if (emergencyContact.name) ecDetails.push(emergencyContact.name);
  if (emergencyContact.relationship) ecDetails.push(`Relationship: ${emergencyContact.relationship}`);
  if (emergencyContact.phone) ecDetails.push(`Phone: ${emergencyContact.phone}`);
  if (emergencyContact.email) ecDetails.push(`Email: ${emergencyContact.email}`);

  const insDetails: string[] = [];
  if (insurance.provider) insDetails.push(insurance.provider);
  if (insurance.planType) insDetails.push(`Plan: ${insurance.planType}`);
  if (insurance.policyNumber) insDetails.push(`Policy: ${insurance.policyNumber}`);
  if (insurance.groupNumber) insDetails.push(`Group: ${insurance.groupNumber}`);
  if (insurance.subscriberName) insDetails.push(`Subscriber: ${insurance.subscriberName}`);

  return (
    <View>
      <ThemedText type="h4" style={styles.heading}>
        Review Your Health Profile
      </ThemedText>
      <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
        Review the information below before saving.
      </ThemedText>

      <SectionCard
        title="Basic Vitals"
        icon="heart"
        count={filledVitals.length}
        details={filledVitals.map((v) => `${v.type.replace(/_/g, " ")}: ${v.value} ${v.unit}`)}
        onEdit={() => onEditSection(0)}
      />
      <SectionCard
        title="Conditions"
        icon="activity"
        count={filledConditions.length}
        details={filledConditions.map((c) => `${c.name}${c.status ? ` (${c.status})` : ""}`)}
        onEdit={() => onEditSection(1)}
      />
      <SectionCard
        title="Medications"
        icon="package"
        count={filledMedications.length}
        details={filledMedications.map((m) => `${m.name}${m.dosage ? ` - ${m.dosage}` : ""}`)}
        onEdit={() => onEditSection(2)}
      />
      <SectionCard
        title="Allergies"
        icon="alert-triangle"
        count={filledAllergies.length}
        details={filledAllergies.map((a) => `${a.allergen}${a.severity ? ` (${a.severity})` : ""}`)}
        onEdit={() => onEditSection(3)}
      />
      <SectionCard
        title="Surgeries"
        icon="scissors"
        count={filledSurgeries.length}
        details={filledSurgeries.map((s) => `${s.procedure}${s.date ? ` - ${s.date}` : ""}`)}
        onEdit={() => onEditSection(4)}
      />
      <SectionCard
        title="Social History"
        icon="users"
        count={socialDetails.length}
        details={socialDetails}
        onEdit={() => onEditSection(5)}
      />
      <SectionCard
        title="Emergency Contact"
        icon="phone"
        count={ecDetails.length > 0 ? 1 : 0}
        details={ecDetails}
        onEdit={() => onEditSection(6)}
      />
      <SectionCard
        title="Medical Insurance"
        icon="shield"
        count={insDetails.length > 0 ? 1 : 0}
        details={insDetails}
        onEdit={() => onEditSection(7)}
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
  card: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardTitleText: {
    fontSize: 15,
    fontWeight: "600",
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: "500",
  },
  editLink: {
    fontSize: 14,
    fontWeight: "500",
  },
  detailText: {
    fontSize: 14,
    marginTop: 2,
  },
});
