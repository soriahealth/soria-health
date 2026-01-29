export interface HealthMetric {
  id: string;
  type: "blood_pressure" | "heart_rate" | "blood_type" | "weight" | "height" | "glucose";
  value: string;
  unit: string;
  updatedAt: Date;
  icon: string;
}

export interface MedicalCondition {
  id: string;
  name: string;
  diagnosedAge?: number;
  severity?: "mild" | "moderate" | "severe";
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  refillDate?: Date;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: "mother" | "father" | "sister" | "brother" | "spouse" | "child" | "grandmother" | "grandfather" | "aunt" | "uncle" | "cousin";
  age: number;
  gender: "male" | "female" | "other";
  bloodType?: string;
  conditions: MedicalCondition[];
  recordsShared: number;
  avatarColor: string;
}

export interface Child {
  id: string;
  name: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  age: number;
  bloodType?: string;
  height?: string;
  weight?: string;
  allergies?: string;
  medications?: string;
  conditions?: string;
  immunizations?: string;
  pediatricianName?: string;
  pediatricianPhone?: string;
  emergencyContact?: string;
  emergencyRelationship?: string;
}

export interface HealthAlert {
  id: string;
  title: string;
  description: string;
  category: "preventative" | "medication" | "appointment" | "general";
  severity: "info" | "warning" | "urgent";
  createdAt: Date;
}

export interface PreventiveCareItem {
  id: string;
  condition: string;
  testType: string;
  startAge: number;
  frequency: string;
  reason: string;
  affectedMembers: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  bloodType?: string;
  height?: string;
  weight?: string;
  allergies?: string[];
  conditions?: MedicalCondition[];
  medications?: Medication[];
}
