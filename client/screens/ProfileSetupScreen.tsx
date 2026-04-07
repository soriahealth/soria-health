import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { FormField } from "@/components/FormField";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
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

const TOTAL_STEPS = 10;
const SEX_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

const INITIAL_VITALS: VitalEntry[] = [
  { type: "systolic_bp", value: "", unit: "mmHg" },
  { type: "diastolic_bp", value: "", unit: "mmHg" },
  { type: "heart_rate", value: "", unit: "bpm" },
  { type: "weight", value: "", unit: "lbs" },
  { type: "height", value: "", unit: "in" },
  { type: "blood_type", value: "", unit: "type" },
];

export default function ProfileSetupScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, completeProfileSetup } = useAuth();

  // Step 0: Basic info
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [biologicalSex, setBiologicalSex] = useState("");

  // Steps 1-8: Health intake data
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

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  const canContinueBasicInfo = firstName.trim() && lastName.trim() && dateOfBirth.trim();
  const isReviewStep = currentStep === TOTAL_STEPS - 1;

  const submitMutation = useMutation({
    mutationFn: async () => {
      // 1. Build and submit health intake data FIRST (before profile setup
      //    marks onboarding complete, which would unmount this screen)
      const body: Record<string, any> = {};

      const filledVitals = vitals.filter((v) => v.value.trim());
      if (filledVitals.length > 0) {
        body.healthMetrics = filledVitals.map((v) => {
          // Blood type is stored as a string in the unit field
          if (v.type === "blood_type") {
            return { type: v.type, value: 0, unit: v.value };
          }
          return { type: v.type, value: parseFloat(v.value) || 0, unit: v.unit };
        });
      }

      const filledConditions = conditions.filter((c) => c.name.trim());
      if (filledConditions.length > 0) {
        body.conditions = filledConditions.map((c) => ({
          name: c.name,
          diagnosisDate: c.diagnosisDate || undefined,
          status: c.status || undefined,
        }));
      }

      const filledMedications = medications.filter((m) => m.name.trim());
      if (filledMedications.length > 0) {
        body.medications = filledMedications.map((m) => ({
          name: m.name,
          dosage: m.dosage || undefined,
          frequency: m.frequency || undefined,
        }));
      }

      const filledAllergies = allergies.filter((a) => a.allergen.trim());
      if (filledAllergies.length > 0) {
        body.allergies = filledAllergies.map((a) => ({
          allergen: a.allergen,
          reactionType: a.reactionType || undefined,
          severity: a.severity || undefined,
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

      // Submit health intake if there's data
      if (Object.keys(body).length > 0) {
        await apiRequest("POST", "/api/health/intake", body);
      }

      // 2. LAST: Save basic profile + mark onboarding complete
      //    (this triggers navigation away from this screen)
      await completeProfileSetup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim(),
        biologicalSex: biologicalSex || "Prefer not to say",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health/summary"] });
    },
    onError: (err: Error) => {
      const msg = err?.message || "Something went wrong";
      const cleaned = msg.replace(/^\d+:\s*/, "");
      setError(cleaned);
    },
  });

  const goNext = () => {
    if (currentStep === 0 && !canContinueBasicInfo) return;
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <ThemedText type="h4" style={styles.heading}>
              Complete Your Profile
            </ThemedText>
            <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
              Tell us a bit about yourself so we can personalize your experience.
            </ThemedText>

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
                // Auto-insert dashes: DD-MM-YYYY
                const digits = text.replace(/\D/g, "").slice(0, 8);
                let formatted = digits;
                if (digits.length > 4) formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
                else if (digits.length > 2) formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
                setDateOfBirth(formatted);
              }}
              placeholder="DD-MM-YYYY"
              keyboardType="number-pad"
            />

            <View style={styles.sexSection}>
              <ThemedText style={[styles.sexLabel, { color: theme.text }]}>
                Biological Sex
              </ThemedText>
              <View style={styles.sexOptions}>
                {SEX_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setBiologicalSex(option)}
                    style={[
                      styles.sexOption,
                      {
                        backgroundColor:
                          biologicalSex === option ? theme.link : theme.backgroundSecondary,
                        borderColor:
                          biologicalSex === option ? theme.link : theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.sexOptionText,
                        {
                          color:
                            biologicalSex === option ? theme.buttonText : theme.text,
                        },
                      ]}
                    >
                      {option}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        );
      case 1:
        return <VitalsStep entries={vitals} onChange={setVitals} />;
      case 2:
        return <ConditionsStep entries={conditions} onChange={setConditions} />;
      case 3:
        return <MedicationsStep entries={medications} onChange={setMedications} />;
      case 4:
        return <AllergiesStep entries={allergies} onChange={setAllergies} />;
      case 5:
        return <SurgeriesStep entries={surgeries} onChange={setSurgeries} />;
      case 6:
        return <SocialHistoryStep data={socialHistory} onChange={setSocialHistory} />;
      case 7:
        return <EmergencyContactStep data={emergencyContact} onChange={setEmergencyContact} />;
      case 8:
        return <InsuranceStep data={insurance} onChange={setInsurance} />;
      case 9:
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
            onEditSection={(step) => setCurrentStep(step + 1)}
          />
        );
      default:
        return null;
    }
  };

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
      <View style={styles.topBar}>
        {currentStep > 0 ? (
          <Pressable onPress={goBack} hitSlop={8}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <ThemedText style={[styles.topBarTitle, { color: theme.textSecondary }]}>
          {currentStep === 0
            ? "Getting Started"
            : `Building ${firstName || "Your"}'s Health Profile`}
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </View>

      {error ? (
        <View
          style={[
            styles.errorBox,
            { backgroundColor: theme.error + "15", borderColor: theme.error },
          ]}
        >
          <ThemedText style={[styles.errorText, { color: theme.error }]}>
            {error}
          </ThemedText>
        </View>
      ) : null}

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
            {currentStep > 0 && (
              <Button variant="outline" onPress={goNext} style={styles.skipButton}>
                Skip for now
              </Button>
            )}
            <Button
              onPress={goNext}
              disabled={currentStep === 0 && !canContinueBasicInfo}
              style={currentStep > 0 ? styles.continueButton : styles.saveButton}
            >
              Continue
            </Button>
          </>
        ) : (
          <Button
            onPress={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            style={styles.saveButton}
          >
            {submitMutation.isPending ? "Saving..." : "Save & Get Started"}
          </Button>
        )}
      </View>
    </View>
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
  progressContainer: {
    paddingHorizontal: Spacing.lg,
  },
  errorBox: {
    marginHorizontal: Spacing["2xl"],
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing.xl,
  },
  heading: {
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing["2xl"],
  },
  sexSection: {
    marginBottom: Spacing.lg,
  },
  sexLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  sexOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  sexOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  sexOptionText: {
    fontSize: 14,
    fontWeight: "500",
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
});
