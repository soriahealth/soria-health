import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { FormField } from "@/components/FormField";
import { KeyboardSafeView } from "@/components/KeyboardSafeView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";

import { ProgressBar } from "@/components/intake/ProgressBar";
import { VitalsStep, type VitalEntry } from "@/components/intake/VitalsStep";
import { ConditionsStep, type ConditionEntry } from "@/components/intake/ConditionsStep";
import { MedicationsStep, type MedicationEntry } from "@/components/intake/MedicationsStep";
import { AllergiesStep, type AllergyEntry } from "@/components/intake/AllergiesStep";
import { SurgeriesStep, type SurgeryEntry } from "@/components/intake/SurgeriesStep";
import { SocialHistoryStep, type SocialHistoryData } from "@/components/intake/SocialHistoryStep";
import { EmergencyContactStep, type EmergencyContactData } from "@/components/intake/EmergencyContactStep";
import { InsuranceStep, type InsuranceData } from "@/components/intake/InsuranceStep";
import { ReviewStep } from "@/components/intake/ReviewStep";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "FamilyMemberIntake">;

const INITIAL_VITALS: VitalEntry[] = [
  { type: "systolic_bp", value: "", unit: "mmHg" },
  { type: "diastolic_bp", value: "", unit: "mmHg" },
  { type: "heart_rate", value: "", unit: "bpm" },
  { type: "weight", value: "", unit: "lbs" },
  { type: "height", value: "", unit: "in" },
  { type: "blood_type", value: "", unit: "type" },
];

// ── Post-Mortem Steps ──────────────────────────────────────────

function CauseOfDeathStep({
  causeOfDeath,
  dateOfDeath,
  onChangeCause,
  onChangeDate,
}: {
  causeOfDeath: string;
  dateOfDeath: string;
  onChangeCause: (v: string) => void;
  onChangeDate: (v: string) => void;
}) {
  const { theme } = useTheme();

  const formatDate = (text: string) => {
    const digits = text.replace(/\D/g, "");
    let formatted = "";
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length > 2) formatted += "-" + digits.slice(2, 4);
    if (digits.length > 4) formatted += "-" + digits.slice(4, 8);
    onChangeDate(formatted);
  };

  return (
    <View>
      <ThemedText type="h4" style={styles.stepHeading}>
        Cause of Death
      </ThemedText>
      <ThemedText style={[styles.stepDescription, { color: theme.textSecondary }]}>
        Record the primary cause of death and approximate date.
      </ThemedText>

      <FormField
        label="Cause of Death"
        value={causeOfDeath}
        onChangeText={onChangeCause}
        placeholder="e.g. Heart disease, Cancer, Stroke"
      />

      <FormField
        label="Date of Death (DD-MM-YYYY)"
        value={dateOfDeath}
        onChangeText={formatDate}
        placeholder="DD-MM-YYYY or approximate year"
        keyboardType="number-pad"
        maxLength={10}
      />
    </View>
  );
}

function PostMortemReviewStep({
  causeOfDeath,
  dateOfDeath,
  conditions,
  surgeries,
  onEditSection,
}: {
  causeOfDeath: string;
  dateOfDeath: string;
  conditions: ConditionEntry[];
  surgeries: SurgeryEntry[];
  onEditSection: (step: number) => void;
}) {
  const { theme } = useTheme();
  const filledConditions = conditions.filter((c) => c.name.trim());
  const filledSurgeries = surgeries.filter((s) => s.procedure.trim());

  return (
    <View>
      <ThemedText type="h4" style={styles.stepHeading}>
        Review
      </ThemedText>
      <ThemedText style={[styles.stepDescription, { color: theme.textSecondary }]}>
        Review the information before saving.
      </ThemedText>

      {/* Cause of Death */}
      <View style={[styles.reviewSection, { borderColor: theme.border }]}>
        <View style={styles.reviewHeader}>
          <ThemedText style={[styles.reviewTitle, { color: theme.text }]}>Cause of Death</ThemedText>
          <Pressable onPress={() => onEditSection(0)}>
            <Feather name="edit-2" size={16} color={theme.link} />
          </Pressable>
        </View>
        {causeOfDeath ? (
          <>
            <ThemedText style={{ color: theme.text }}>{causeOfDeath}</ThemedText>
            {dateOfDeath ? (
              <ThemedText style={[styles.reviewDetail, { color: theme.textSecondary }]}>
                Date: {dateOfDeath}
              </ThemedText>
            ) : null}
          </>
        ) : (
          <ThemedText style={{ color: theme.textTertiary }}>Not provided</ThemedText>
        )}
      </View>

      {/* Conditions */}
      <View style={[styles.reviewSection, { borderColor: theme.border }]}>
        <View style={styles.reviewHeader}>
          <ThemedText style={[styles.reviewTitle, { color: theme.text }]}>
            Medical Conditions ({filledConditions.length})
          </ThemedText>
          <Pressable onPress={() => onEditSection(1)}>
            <Feather name="edit-2" size={16} color={theme.link} />
          </Pressable>
        </View>
        {filledConditions.length > 0 ? (
          filledConditions.map((c, i) => (
            <View key={i} style={styles.reviewItem}>
              <ThemedText style={{ color: theme.text }}>{c.name}</ThemedText>
              {c.diagnosisDate ? (
                <ThemedText style={[styles.reviewDetail, { color: theme.textSecondary }]}>
                  Diagnosed: {c.diagnosisDate}
                </ThemedText>
              ) : null}
            </View>
          ))
        ) : (
          <ThemedText style={{ color: theme.textTertiary }}>None added</ThemedText>
        )}
      </View>

      {/* Surgeries */}
      <View style={[styles.reviewSection, { borderColor: theme.border }]}>
        <View style={styles.reviewHeader}>
          <ThemedText style={[styles.reviewTitle, { color: theme.text }]}>
            Surgeries ({filledSurgeries.length})
          </ThemedText>
          <Pressable onPress={() => onEditSection(2)}>
            <Feather name="edit-2" size={16} color={theme.link} />
          </Pressable>
        </View>
        {filledSurgeries.length > 0 ? (
          filledSurgeries.map((s, i) => (
            <View key={i} style={styles.reviewItem}>
              <ThemedText style={{ color: theme.text }}>{s.procedure}</ThemedText>
              {s.date ? (
                <ThemedText style={[styles.reviewDetail, { color: theme.textSecondary }]}>
                  Date: {s.date}
                </ThemedText>
              ) : null}
            </View>
          ))
        ) : (
          <ThemedText style={{ color: theme.textTertiary }}>None added</ThemedText>
        )}
      </View>
    </View>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function FamilyMemberIntakeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { profileId, firstName, isPostMortem } = route.params;

  const [currentStep, setCurrentStep] = useState(0);

  // Living member state
  const [vitals, setVitals] = useState<VitalEntry[]>(INITIAL_VITALS);
  const [conditions, setConditions] = useState<ConditionEntry[]>([]);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [allergies, setAllergies] = useState<AllergyEntry[]>([]);
  const [surgeries, setSurgeries] = useState<SurgeryEntry[]>([]);
  const [socialHistory, setSocialHistory] = useState<SocialHistoryData>({
    smokingStatus: "",
    alcoholUse: "",
    occupation: "",
    exercise: "",
  });
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContactData>({
    name: "",
    relationship: "",
    phone: "",
    email: "",
  });
  const [insurance, setInsurance] = useState<InsuranceData>({
    provider: "",
    policyNumber: "",
    groupNumber: "",
    planType: "",
    subscriberName: "",
  });

  // Post-mortem state
  const [causeOfDeath, setCauseOfDeath] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");

  // Post-mortem: 4 steps (cause of death, conditions, surgeries, review)
  // Living: 9 steps (vitals, conditions, meds, allergies, surgeries, social, emergency, insurance, review)
  const TOTAL_STEPS = isPostMortem ? 4 : 9;

  const submitMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, any> = {};

      if (isPostMortem) {
        // Post-mortem: save cause/date of death + conditions + surgeries
        if (causeOfDeath.trim() || dateOfDeath.trim()) {
          body.causeOfDeath = causeOfDeath.trim();
          body.dateOfDeath = dateOfDeath.trim();
        }

        const filledConditions = conditions.filter((c) => c.name.trim());
        if (filledConditions.length > 0) {
          body.conditions = filledConditions.map((c) => ({
            name: c.name,
            diagnosisDate: c.diagnosisDate || undefined,
            status: c.status || undefined,
          }));
        }

        const filledSurgeries = surgeries.filter((s) => s.procedure.trim());
        if (filledSurgeries.length > 0) {
          body.surgeries = filledSurgeries.map((s) => ({
            procedure: s.procedure,
            date: s.date || undefined,
            hospital: s.hospital || undefined,
          }));
        }
      } else {
        // Living member: full intake
        const filledVitals = vitals.filter((v) => v.value.trim());
        const filledConditions = conditions.filter((c) => c.name.trim());
        const filledMedications = medications.filter((m) => m.name.trim());
        const filledAllergies = allergies.filter((a) => a.allergen.trim());
        const filledSurgeries = surgeries.filter((s) => s.procedure.trim());

        if (filledVitals.length > 0) {
          body.healthMetrics = filledVitals.map((v) => {
            if (v.type === "blood_type") {
              return { type: v.type, value: 0, unit: v.value };
            }
            return { type: v.type, value: parseFloat(v.value) || 0, unit: v.unit };
          });
        }
        if (filledConditions.length > 0) {
          body.conditions = filledConditions.map((c) => ({
            name: c.name,
            diagnosisDate: c.diagnosisDate || undefined,
            status: c.status || undefined,
          }));
        }
        if (filledMedications.length > 0) {
          body.medications = filledMedications.map((m) => ({
            name: m.name,
            dosage: m.dosage || undefined,
            frequency: m.frequency || undefined,
          }));
        }
        if (filledAllergies.length > 0) {
          body.allergies = filledAllergies.map((a) => ({
            allergen: a.allergen,
            reactionType: a.reactionType || undefined,
            severity: a.severity || undefined,
          }));
        }
        if (filledSurgeries.length > 0) {
          body.surgeries = filledSurgeries.map((s) => ({
            procedure: s.procedure,
            date: s.date || undefined,
            hospital: s.hospital || undefined,
          }));
        }

        const hasSocial = socialHistory.smokingStatus || socialHistory.alcoholUse || socialHistory.occupation || socialHistory.exercise;
        if (hasSocial) {
          body.socialHistory = {
            smokingStatus: socialHistory.smokingStatus || undefined,
            alcoholUse: socialHistory.alcoholUse || undefined,
            occupation: socialHistory.occupation || undefined,
            exercise: socialHistory.exercise || undefined,
          };
        }

        if (emergencyContact.name.trim()) {
          body.emergencyContacts = [{
            name: emergencyContact.name,
            relationship: emergencyContact.relationship || undefined,
            phone: emergencyContact.phone || undefined,
            email: emergencyContact.email || undefined,
          }];
        }

        if (insurance.provider.trim()) {
          body.insurance = [{
            provider: insurance.provider,
            policyNumber: insurance.policyNumber || undefined,
            groupNumber: insurance.groupNumber || undefined,
            planType: insurance.planType || undefined,
            subscriberName: insurance.subscriberName || undefined,
          }];
        }
      }

      await apiRequest("POST", `/api/family/${profileId}/intake`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family"] });
      queryClient.invalidateQueries({ queryKey: ["/api/family/managed"] });
      navigation.navigate("Family" as never);
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to save health data");
    },
  });

  const goNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const isReviewStep = currentStep === TOTAL_STEPS - 1;

  const renderStep = () => {
    if (isPostMortem) {
      switch (currentStep) {
        case 0:
          return (
            <CauseOfDeathStep
              causeOfDeath={causeOfDeath}
              dateOfDeath={dateOfDeath}
              onChangeCause={setCauseOfDeath}
              onChangeDate={setDateOfDeath}
            />
          );
        case 1:
          return <ConditionsStep entries={conditions} onChange={setConditions} />;
        case 2:
          return <SurgeriesStep entries={surgeries} onChange={setSurgeries} />;
        case 3:
          return (
            <PostMortemReviewStep
              causeOfDeath={causeOfDeath}
              dateOfDeath={dateOfDeath}
              conditions={conditions}
              surgeries={surgeries}
              onEditSection={setCurrentStep}
            />
          );
        default:
          return null;
      }
    }

    // Living member steps
    switch (currentStep) {
      case 0:
        return <VitalsStep entries={vitals} onChange={setVitals} />;
      case 1:
        return <ConditionsStep entries={conditions} onChange={setConditions} />;
      case 2:
        return <MedicationsStep entries={medications} onChange={setMedications} />;
      case 3:
        return <AllergiesStep entries={allergies} onChange={setAllergies} />;
      case 4:
        return <SurgeriesStep entries={surgeries} onChange={setSurgeries} />;
      case 5:
        return <SocialHistoryStep data={socialHistory} onChange={setSocialHistory} />;
      case 6:
        return <EmergencyContactStep data={emergencyContact} onChange={setEmergencyContact} />;
      case 7:
        return <InsuranceStep data={insurance} onChange={setInsurance} />;
      case 8:
        return (
          <ReviewStep
            vitals={vitals}
            conditions={conditions}
            medications={medications}
            allergies={allergies}
            surgeries={surgeries}
            socialHistory={socialHistory}
            emergencyContact={emergencyContact}
            insurance={insurance}
            onEditSection={setCurrentStep}
          />
        );
      default:
        return null;
    }
  };

  const headerLabel = isPostMortem
    ? `${firstName}'s Legacy Health Record`
    : `Building ${firstName}'s Health Profile`;

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
        <Pressable onPress={goBack} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={[styles.topBarTitle, { color: theme.textSecondary }]}>
          {headerLabel}
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {isPostMortem && currentStep === 0 && (
        <View style={[styles.postMortemBanner, { backgroundColor: theme.warning + "15", borderColor: theme.warning + "40" }]}>
          <Feather name="info" size={16} color={theme.warning} />
          <ThemedText style={[styles.postMortemBannerText, { color: theme.warning }]}>
            Collecting genetic medical history only
          </ThemedText>
        </View>
      )}

      <View style={styles.progressContainer}>
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.bottomBar}>
        {!isReviewStep ? (
          <>
            <Button variant="outline" onPress={goNext} style={styles.skipButton}>
              Skip for now
            </Button>
            <Button onPress={goNext} style={styles.continueButton}>
              Continue
            </Button>
          </>
        ) : (
          <Button
            onPress={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            style={styles.saveButton}
          >
            {submitMutation.isPending ? "Saving..." : `Save ${firstName}'s ${isPostMortem ? "Legacy Record" : "Health Profile"}`}
          </Button>
        )}
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
  postMortemBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  postMortemBannerText: {
    fontSize: 13,
    fontWeight: "500",
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing.xl,
  },
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  skipButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  stepHeading: {
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    fontSize: 15,
    marginBottom: Spacing.xl,
  },
  reviewSection: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  reviewItem: {
    marginBottom: Spacing.sm,
  },
  reviewDetail: {
    fontSize: 13,
    marginTop: 2,
  },
});
