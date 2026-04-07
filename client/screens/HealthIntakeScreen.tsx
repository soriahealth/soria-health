import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing } from "@/constants/theme";
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

const TOTAL_STEPS = 9;

const INITIAL_VITALS: VitalEntry[] = [
  { type: "systolic_bp", value: "", unit: "mmHg" },
  { type: "diastolic_bp", value: "", unit: "mmHg" },
  { type: "heart_rate", value: "", unit: "bpm" },
  { type: "weight", value: "", unit: "lbs" },
  { type: "height", value: "", unit: "in" },
  { type: "blood_type", value: "", unit: "type" },
];

export default function HealthIntakeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { profile } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
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

  const submitMutation = useMutation({
    mutationFn: async () => {
      const filledVitals = vitals.filter((v) => v.value.trim());
      const filledConditions = conditions.filter((c) => c.name.trim());
      const filledMedications = medications.filter((m) => m.name.trim());
      const filledAllergies = allergies.filter((a) => a.allergen.trim());
      const filledSurgeries = surgeries.filter((s) => s.procedure.trim());

      const body: Record<string, any> = {};

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

      await apiRequest("POST", "/api/health/intake", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health/summary"] });
      navigation.navigate("Dashboard" as never);
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
        <Pressable onPress={goBack} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={[styles.topBarTitle, { color: theme.textSecondary }]}>
          Building {profile?.firstName ?? "Your"}'s Health Profile
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

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
            {submitMutation.isPending ? "Saving..." : "Save Health Profile"}
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
});
