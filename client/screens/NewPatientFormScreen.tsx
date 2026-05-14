import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Checkbox from "expo-checkbox";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardSafeView } from "@/components/KeyboardSafeView";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const includeOptions = [
  { id: "personal", label: "Personal Information" },
  { id: "allergies", label: "Allergies" },
  { id: "medications", label: "Current Medications" },
  { id: "surgery", label: "Surgery History" },
  { id: "family", label: "Family Medical History" },
  { id: "social", label: "Social History" },
  { id: "symptoms", label: "Current Symptoms" },
];

const symptomCategories = [
  {
    title: "Ears, Nose and Throat",
    symptoms: ["Sore throat", "Bleeding gums"],
  },
  {
    title: "Heart",
    symptoms: ["Chest pain", "Irregular heartbeat", "Murmur", "Swollen feet or ankles"],
  },
  {
    title: "Lungs",
    symptoms: ["Persistent cough", "Coughing up blood", "Shortness of breath", "Wheezing", "Sputum or phlegm production", "Difficulty breathing", "Sinus trouble"],
  },
  {
    title: "Digestion",
    symptoms: ["Difficulty swallowing", "Heartburn", "Excessive gas", "Abdominal pain", "Nausea", "Vomiting", "Diarrhea", "Constipation", "Blood in stools", "Rectal bleeding", "Hemorrhoids"],
  },
  {
    title: "Body",
    symptoms: ["Joint pain", "Bone pain", "Muscle weakness", "Muscle aches"],
  },
  {
    title: "Women Only",
    symptoms: ["Vaginal discharge", "Painful intercourse", "Cramping"],
  },
  {
    title: "Genitourinary",
    symptoms: ["Excessive urination", "Blood in urine", "Urine leakage", "Pain with urination"],
  },
  {
    title: "Nervous System",
    symptoms: ["Headaches", "Dizziness or vertigo", "Fainting", "Seizures", "Memory loss", "Poor coordination", "Weakness in arms or legs", "Numbness in arms or legs"],
  },
  {
    title: "Skin",
    symptoms: ["Hives", "Change in mole or wart"],
  },
  {
    title: "Blood Disorders",
    symptoms: ["Easy bruising", "Abnormal bleeding"],
  },
  {
    title: "Psychiatric",
    symptoms: ["Anxiety", "Depression", "Mania", "Trouble sleeping", "Work/family stress"],
  },
];

export default function NewPatientFormScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({
    personal: true,
    allergies: true,
    medications: true,
    surgery: true,
    family: true,
    social: true,
    symptoms: true,
  });
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, boolean>>({});
  const [doctorEmail, setDoctorEmail] = useState("");

  const toggleOption = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSymptom = (symptom: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSymptoms(prev => ({ ...prev, [symptom]: !prev[symptom] }));
  };

  return (
    <KeyboardSafeView>
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
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openDrawer();
          }}
        >
          <Feather name="sidebar" size={20} color={theme.text} />
        </Pressable>
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="sun" size={20} color={theme.text} />
        </Pressable>
      </View>

      <ThemedText type="h2" style={styles.title}>
        New Patient Form Generator
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Create a comprehensive patient form to share with your healthcare providers.
      </ThemedText>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Select Information to Include
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Choose which sections of your health data to include in the patient form
        </ThemedText>

        {includeOptions.map((option) => (
          <Pressable
            key={option.id}
            style={styles.checkboxRow}
            onPress={() => toggleOption(option.id)}
          >
            <Checkbox
              value={selectedOptions[option.id]}
              onValueChange={() => toggleOption(option.id)}
              color={selectedOptions[option.id] ? "#3B82F6" : "#93C5FD"}
              style={[styles.checkbox, { borderColor: selectedOptions[option.id] ? "#3B82F6" : "#93C5FD" }]}
            />
            <ThemedText style={styles.checkboxLabel}>{option.label}</ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Form Preview
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Preview of the information that will be shared
        </ThemedText>

        {selectedOptions.personal && (
          <>
            <ThemedText style={styles.previewSectionTitle}>Personal Information</ThemedText>
            <View style={styles.previewGrid}>
              <View style={styles.previewItem}>
                <ThemedText style={[styles.previewLabel, { color: theme.textSecondary }]}>Name:</ThemedText>
                <ThemedText style={styles.previewValue}>John Doe</ThemedText>
              </View>
              <View style={styles.previewItem}>
                <ThemedText style={[styles.previewLabel, { color: theme.textSecondary }]}>DOB:</ThemedText>
                <ThemedText style={styles.previewValue}>1985-06-15</ThemedText>
              </View>
            </View>
            <View style={styles.previewGrid}>
              <View style={styles.previewItem}>
                <ThemedText style={[styles.previewLabel, { color: theme.textSecondary }]}>Blood Type:</ThemedText>
                <ThemedText style={styles.previewValue}>O+</ThemedText>
              </View>
              <View style={styles.previewItem}>
                <ThemedText style={[styles.previewLabel, { color: theme.textSecondary }]}>Height:</ThemedText>
                <ThemedText style={styles.previewValue}>5'10"</ThemedText>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </>
        )}

        {selectedOptions.allergies && (
          <>
            <ThemedText style={styles.previewSectionTitle}>Allergies</ThemedText>
            <View style={styles.badgeRow}>
              <View style={[styles.allergyBadge, { backgroundColor: "#DC2626" }]}>
                <ThemedText style={styles.allergyBadgeText}>Penicillin</ThemedText>
              </View>
              <View style={[styles.allergyBadge, { backgroundColor: "#DC2626" }]}>
                <ThemedText style={styles.allergyBadgeText}>Peanuts</ThemedText>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </>
        )}

        {selectedOptions.medications && (
          <>
            <ThemedText style={styles.previewSectionTitle}>Current Medications</ThemedText>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <ThemedText style={styles.bullet}>•</ThemedText>
                <ThemedText style={styles.bulletText}>Lisinopril 10mg</ThemedText>
              </View>
              <View style={styles.bulletItem}>
                <ThemedText style={styles.bullet}>•</ThemedText>
                <ThemedText style={styles.bulletText}>Vitamin D</ThemedText>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </>
        )}

        {selectedOptions.surgery && (
          <>
            <ThemedText style={styles.previewSectionTitle}>Surgery History</ThemedText>
            <View style={styles.surgeryItem}>
              <ThemedText style={styles.surgeryName}>Appendectomy</ThemedText>
              <ThemedText style={[styles.surgeryDetails, { color: theme.textSecondary }]}>
                2015-03-10 - General Hospital
              </ThemedText>
            </View>
            <View style={styles.surgeryItem}>
              <ThemedText style={styles.surgeryName}>Knee Arthroscopy</ThemedText>
              <ThemedText style={[styles.surgeryDetails, { color: theme.textSecondary }]}>
                2019-07-22 - Sports Medicine Center
              </ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </>
        )}

        {selectedOptions.family && (
          <>
            <ThemedText style={styles.previewSectionTitle}>Family Medical History</ThemedText>
            <View style={styles.familyItem}>
              <ThemedText style={styles.familyCondition}>Colon Cancer</ThemedText>
              <ThemedText style={[styles.familyRelation, { color: theme.textSecondary }]}> - Mother (Age: 58)</ThemedText>
            </View>
            <View style={styles.familyItem}>
              <ThemedText style={styles.familyCondition}>Type 2 Diabetes</ThemedText>
              <ThemedText style={[styles.familyRelation, { color: theme.textSecondary }]}> - Father (Age: 62)</ThemedText>
            </View>
            <View style={styles.familyItem}>
              <ThemedText style={styles.familyCondition}>Hypertension</ThemedText>
              <ThemedText style={[styles.familyRelation, { color: theme.textSecondary }]}> - Both Parents</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </>
        )}

        {selectedOptions.social && (
          <>
            <ThemedText style={styles.previewSectionTitle}>Social History</ThemedText>
            <View style={styles.previewGrid}>
              <View style={styles.previewItem}>
                <ThemedText style={[styles.previewLabel, { color: theme.textSecondary }]}>Smoking:</ThemedText>
                <ThemedText style={styles.previewValue}>Never</ThemedText>
              </View>
              <View style={styles.previewItem}>
                <ThemedText style={[styles.previewLabel, { color: theme.textSecondary }]}>Alcohol:</ThemedText>
                <ThemedText style={styles.previewValue}>Occasional</ThemedText>
              </View>
            </View>
            <View style={styles.previewItem}>
              <ThemedText style={[styles.previewLabel, { color: theme.textSecondary }]}>Exercise:</ThemedText>
              <ThemedText style={styles.previewValue}>3-4 times per week</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </>
        )}

        {selectedOptions.symptoms && (
          <>
            <ThemedText style={styles.previewSectionTitle}>Current Symptoms</ThemedText>
            <ThemedText style={[styles.symptomInstruction, { color: theme.textSecondary }]}>
              Check all symptoms you are currently experiencing
            </ThemedText>

            {symptomCategories.map((category, index) => (
              <View key={category.title}>
                <ThemedText style={styles.symptomCategoryTitle}>{category.title}</ThemedText>
                {category.symptoms.map((symptom) => (
                  <Pressable
                    key={symptom}
                    style={styles.symptomCheckboxRow}
                    onPress={() => toggleSymptom(symptom)}
                  >
                    <Checkbox
                      value={selectedSymptoms[symptom] || false}
                      onValueChange={() => toggleSymptom(symptom)}
                      color={selectedSymptoms[symptom] ? "#3B82F6" : "#93C5FD"}
                      style={[styles.symptomCheckbox, { borderColor: selectedSymptoms[symptom] ? "#3B82F6" : "#93C5FD" }]}
                    />
                    <ThemedText style={styles.symptomLabel}>{symptom}</ThemedText>
                  </Pressable>
                ))}
              </View>
            ))}
          </>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Share with Doctor
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Send this form to your healthcare provider via email or secure link
        </ThemedText>

        <ThemedText style={styles.inputLabel}>Doctor's Email (Optional)</ThemedText>
        <TextInput
          style={[styles.textInput, { borderColor: theme.border, color: theme.text }]}
          placeholder="doctor@example.com"
          placeholderTextColor={theme.textTertiary}
          value={doctorEmail}
          onChangeText={setDoctorEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Pressable
          style={[styles.generateButton, { backgroundColor: theme.primary }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Feather name="file-text" size={18} color="#FFFFFF" />
          <ThemedText style={styles.generateButtonText}>Generate Secure Link</ThemedText>
        </Pressable>
      </View>
    </ScrollView>
    </KeyboardSafeView>
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
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  section: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: Spacing.md,
  },
  checkboxLabel: {
    fontSize: 15,
  },
  previewSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  previewGrid: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  previewItem: {
    flex: 1,
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  previewLabel: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  allergyBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  allergyBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  bulletList: {
    marginTop: Spacing.xs,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  bullet: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  bulletText: {
    fontSize: 14,
  },
  surgeryItem: {
    marginBottom: Spacing.md,
  },
  surgeryName: {
    fontSize: 14,
    fontWeight: "500",
  },
  surgeryDetails: {
    fontSize: 13,
  },
  familyItem: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.xs,
  },
  familyCondition: {
    fontSize: 14,
    fontWeight: "500",
  },
  familyRelation: {
    fontSize: 14,
  },
  symptomInstruction: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  symptomCategoryTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  symptomCheckboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  symptomCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: Spacing.md,
  },
  symptomLabel: {
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 15,
    marginBottom: Spacing.lg,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
