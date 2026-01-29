import {
  HealthMetric,
  FamilyMember,
  Child,
  HealthAlert,
  PreventiveCareItem,
  MedicalCondition,
} from "@/types/health";

export const healthMetrics: HealthMetric[] = [
  {
    id: "1",
    type: "blood_pressure",
    value: "120/80",
    unit: "mmHg",
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    icon: "heart",
  },
  {
    id: "2",
    type: "heart_rate",
    value: "72",
    unit: "bpm",
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    icon: "activity",
  },
  {
    id: "3",
    type: "blood_type",
    value: "O+",
    unit: "",
    updatedAt: new Date(),
    icon: "droplet",
  },
  {
    id: "4",
    type: "weight",
    value: "165",
    unit: "lbs",
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    icon: "user",
  },
];

export const familyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    relationship: "mother",
    age: 58,
    gender: "female",
    bloodType: "A+",
    conditions: [
      { id: "c1", name: "High Blood Pressure", diagnosedAge: 45 },
      { id: "c2", name: "Type 2 Diabetes", diagnosedAge: 52 },
    ],
    recordsShared: 12,
    avatarColor: "#A8C5F5",
  },
  {
    id: "2",
    name: "Robert Johnson",
    relationship: "father",
    age: 62,
    gender: "male",
    bloodType: "O+",
    conditions: [
      { id: "c3", name: "High Cholesterol", diagnosedAge: 42 },
      { id: "c4", name: "Pre-Diabetes", diagnosedAge: 50 },
    ],
    recordsShared: 8,
    avatarColor: "#F5C4A8",
  },
  {
    id: "3",
    name: "Emily Johnson",
    relationship: "sister",
    age: 28,
    gender: "female",
    bloodType: "A+",
    conditions: [],
    recordsShared: 15,
    avatarColor: "#E8A8F5",
  },
];

export const children: Child[] = [
  {
    id: "1",
    name: "Emma Doe",
    dateOfBirth: new Date("2023-03-15"),
    gender: "female",
    age: 2,
    bloodType: "A+",
    height: "2'10\"",
    weight: "28 lbs",
    allergies: "None",
    medications: "None",
    conditions: "None",
    immunizations: "Up to date - DTaP, IPV, MMR, Hib, PCV13, Varicella",
    pediatricianName: "Dr. Lisa Martinez",
    pediatricianPhone: "(555) 345-6789",
    emergencyContact: "Jane Doe - (555) 123-4567",
    emergencyRelationship: "Mother",
  },
  {
    id: "2",
    name: "Liam Doe",
    dateOfBirth: new Date("2014-06-22"),
    gender: "male",
    age: 12,
    bloodType: "O+",
    height: "5'2\"",
    weight: "95 lbs",
    allergies: "Peanuts",
    medications: "EpiPen (as needed)",
    conditions: "Mild Asthma",
    immunizations: "Up to date",
    pediatricianName: "Dr. Lisa Martinez",
    pediatricianPhone: "(555) 345-6789",
    emergencyContact: "Jane Doe - (555) 123-4567",
    emergencyRelationship: "Mother",
  },
];

export const healthAlerts: HealthAlert[] = [
  {
    id: "1",
    title: "Colonoscopy Screening Recommended",
    description:
      "Based on your family history of colon cancer (2 family members diagnosed), it's recommended to schedule a preventative screening. Family members with similar history should consider screening by age 45.",
    category: "preventative",
    severity: "warning",
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Blood Pressure Monitoring Suggested",
    description:
      "Your family has a history of hypertension. Regular blood pressure monitoring is recommended, especially after age 40.",
    category: "preventative",
    severity: "info",
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Medication Refill Due Soon",
    description:
      "Your prescription for Lisinopril will need a refill in 7 days. Contact your pharmacy or doctor to arrange a refill.",
    category: "medication",
    severity: "info",
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "Annual Physical Due",
    description:
      "It's been 11 months since your last annual physical exam. Consider scheduling an appointment.",
    category: "appointment",
    severity: "info",
    createdAt: new Date(),
  },
];

export const preventiveCareTimeline: PreventiveCareItem[] = [
  {
    id: "1",
    condition: "Heart Disease",
    testType: "Lipid Panel, Blood Pressure, ECG, Calcium Score",
    startAge: 30,
    frequency: "Annually",
    reason: "Multiple family members with cardiovascular disease",
    affectedMembers: [
      "Maternal Grandfather - Heart Disease Age 55",
      "Mother - High Blood Pressure Age 45",
      "Father - High Cholesterol Age 42",
    ],
  },
  {
    id: "2",
    condition: "Breast Cancer",
    testType: "Mammogram + Clinical Breast Exam",
    startAge: 35,
    frequency: "Annually (10 years before grandmother's diagnosis age)",
    reason: "Family history of breast cancer in grandmother at age 58",
    affectedMembers: ["Maternal Grandmother - Age 58"],
  },
  {
    id: "3",
    condition: "Type 2 Diabetes",
    testType: "Fasting Glucose & HbA1c",
    startAge: 35,
    frequency: "Every 2 years",
    reason: "Multiple family members with diabetes or pre-diabetes",
    affectedMembers: [
      "Maternal Grandmother - Age 62",
      "Paternal Grandfather - Age 58",
      "Father - Pre-Diabetes Age 50",
    ],
  },
  {
    id: "4",
    condition: "Colon Cancer",
    testType: "Colonoscopy",
    startAge: 40,
    frequency: "Every 5 years (10 years before grandfather's diagnosis age)",
    reason: "Family history of colon cancer in grandfather at age 61",
    affectedMembers: ["Paternal Grandfather"],
  },
];

export const familyConditions: MedicalCondition[] = [
  { id: "1", name: "Alzheimer's Disease" },
  { id: "2", name: "Anxiety" },
  { id: "3", name: "Breast Cancer" },
  { id: "4", name: "Colon Cancer" },
  { id: "5", name: "Glaucoma" },
  { id: "6", name: "Heart Disease" },
  { id: "7", name: "High Blood Pressure" },
  { id: "8", name: "High Cholesterol" },
  { id: "9", name: "Osteoporosis" },
  { id: "10", name: "Pre-Diabetes" },
  { id: "11", name: "Type 2 Diabetes" },
];

export const grandparents = [
  {
    id: "gp1",
    name: "Margaret Smith",
    relationship: "Maternal Grandmother",
    conditions: [
      { name: "Breast Cancer", age: 58 },
      { name: "Type 2 Diabetes", age: 62 },
      { name: "Osteoporosis", age: 70 },
    ],
  },
  {
    id: "gp2",
    name: "Robert Smith",
    relationship: "Maternal Grandfather",
    conditions: [
      { name: "Heart Disease", age: 55 },
      { name: "High Blood Pressure", age: 48 },
      { name: "High Cholesterol", age: 50 },
    ],
  },
];
