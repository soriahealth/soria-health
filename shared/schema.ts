import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  serial,
  integer,
  timestamp,
  boolean,
  date,
  real,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Existing tables (unchanged) ────────────────────────────────

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  authProvider: text("auth_provider").notNull().default("email"), // "email" | "google" | "apple"
  providerId: text("provider_id"),
  authToken: text("auth_token"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// ─── Sessions (connect-pg-simple) ───────────────────────────────

export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

// ─── Profiles ───────────────────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  biologicalSex: text("biological_sex"),
  profilePhotoUrl: text("profile_photo_url"),
  profileType: text("profile_type").notNull().default("self"),
  isDeceased: boolean("is_deceased").notNull().default(false),
  causeOfDeath: text("cause_of_death"),
  dateOfDeath: text("date_of_death"),
  managedById: integer("managed_by_id"),
  role: text("role"),
  consentAcceptedAt: timestamp("consent_accepted_at"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

// ─── Family Members ─────────────────────────────────────────────

export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  relatedProfileId: integer("related_profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  relationship: text("relationship").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
  createdAt: true,
});

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;

// ─── Connection Requests ───────────────────────────────────────

export const connectionRequests = pgTable("connection_requests", {
  id: serial("id").primaryKey(),
  fromProfileId: integer("from_profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  toEmail: text("to_email").notNull(),
  toProfileId: integer("to_profile_id")
    .references(() => profiles.id, { onDelete: "cascade" }),
  relationship: text("relationship").notNull(),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertConnectionRequestSchema = createInsertSchema(connectionRequests).omit({
  id: true,
  createdAt: true,
});

export type ConnectionRequest = typeof connectionRequests.$inferSelect;
export type InsertConnectionRequest = z.infer<typeof insertConnectionRequestSchema>;

// ─── Conditions ─────────────────────────────────────────────────

export const conditions = pgTable("conditions", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  clinicalCode: text("clinical_code"),
  isCoded: boolean("is_coded").notNull().default(false),
  diagnosisDate: date("diagnosis_date"),
  status: text("status").notNull().default("active"),
  isPrivate: boolean("is_private").notNull().default(false),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertConditionSchema = createInsertSchema(conditions).omit({
  id: true,
  createdAt: true,
});

export type Condition = typeof conditions.$inferSelect;
export type InsertCondition = z.infer<typeof insertConditionSchema>;

// ─── Medications ────────────────────────────────────────────────

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  rxnormCode: text("rxnorm_code"),
  dosage: text("dosage"),
  frequency: text("frequency"),
  pharmacyId: integer("pharmacy_id"),
  prescribingPhysicianId: integer("prescribing_physician_id"),
  lastFilledDate: date("last_filled_date"),
  daySupply: integer("day_supply"),
  refillsRemaining: integer("refills_remaining"),
  isAutoRefill: boolean("is_auto_refill").notNull().default(false),
  isPrivate: boolean("is_private").notNull().default(false),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;

// ─── Allergies ──────────────────────────────────────────────────

export const allergies = pgTable("allergies", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  allergen: text("allergen").notNull(),
  reactionType: text("reaction_type"),
  severity: text("severity"),
  isPrivate: boolean("is_private").notNull().default(false),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertAllergySchema = createInsertSchema(allergies).omit({
  id: true,
  createdAt: true,
});

export type Allergy = typeof allergies.$inferSelect;
export type InsertAllergy = z.infer<typeof insertAllergySchema>;

// ─── Surgeries ──────────────────────────────────────────────────

export const surgeries = pgTable("surgeries", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  procedure: text("procedure").notNull(),
  cptCode: text("cpt_code"),
  date: date("date"),
  hospital: text("hospital"),
  isPrivate: boolean("is_private").notNull().default(false),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertSurgerySchema = createInsertSchema(surgeries).omit({
  id: true,
  createdAt: true,
});

export type Surgery = typeof surgeries.$inferSelect;
export type InsertSurgery = z.infer<typeof insertSurgerySchema>;

// ─── Social History ─────────────────────────────────────────────

export const socialHistory = pgTable("social_history", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  smokingStatus: text("smoking_status"),
  alcoholUse: text("alcohol_use"),
  occupation: text("occupation"),
  exercise: text("exercise"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertSocialHistorySchema = createInsertSchema(
  socialHistory,
).omit({
  id: true,
  createdAt: true,
});

export type SocialHistory = typeof socialHistory.$inferSelect;
export type InsertSocialHistory = z.infer<typeof insertSocialHistorySchema>;

// ─── Emergency Contacts ────────────────────────────────────────
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  relationship: text("relationship"),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({
  id: true,
  createdAt: true,
});

export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;

// ─── Insurance ─────────────────────────────────────────────────
export const insurance = pgTable("insurance", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  policyNumber: text("policy_number"),
  groupNumber: text("group_number"),
  planType: text("plan_type"),
  subscriberName: text("subscriber_name"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertInsuranceSchema = createInsertSchema(insurance).omit({
  id: true,
  createdAt: true,
});

export type Insurance = typeof insurance.$inferSelect;
export type InsertInsurance = z.infer<typeof insertInsuranceSchema>;

// ─── Documents ──────────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  recordType: text("record_type"),
  recordId: integer("record_id"),
  label: text("label"),
  description: text("description"),
  aiAnalysis: text("ai_analysis"),
  fileType: text("file_type"),
  originalName: text("original_name"),
  storagePath: text("storage_path").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// ─── Health Metrics ─────────────────────────────────────────────

export const healthMetrics = pgTable(
  "health_metrics",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    value: real("value").notNull(),
    unit: text("unit").notNull(),
    measuredAt: timestamp("measured_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [index("health_metrics_profile_idx").on(table.profileId)],
);

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({
  id: true,
  createdAt: true,
});

export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;

// ─── Alerts ────────────────────────────────────────────────────
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "medication_reminder", "appointment", "health_alert", "connection", "system"
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  isDismissed: boolean("is_dismissed").notNull().default(false),
  relatedType: text("related_type"), // "medication", "condition", "appointment", etc.
  relatedId: integer("related_id"),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// ─── Sharing Preferences ──────────────────────────────────────
// Per-connection privacy settings: which data categories to share

export const sharingPreferences = pgTable("sharing_preferences", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  connectedProfileId: integer("connected_profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  shareConditions: boolean("share_conditions").notNull().default(true),
  shareMedications: boolean("share_medications").notNull().default(true),
  shareAllergies: boolean("share_allergies").notNull().default(true),
  shareSurgeries: boolean("share_surgeries").notNull().default(true),
  shareMetrics: boolean("share_metrics").notNull().default(true),
  shareSocialHistory: boolean("share_social_history").notNull().default(false),
  shareDocuments: boolean("share_documents").notNull().default(false),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertSharingPreferencesSchema = createInsertSchema(sharingPreferences).omit({
  id: true,
  createdAt: true,
});

export type SharingPreference = typeof sharingPreferences.$inferSelect;
export type InsertSharingPreference = z.infer<typeof insertSharingPreferencesSchema>;

// ─── Auth Validation Schemas ────────────────────────────────────

export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const profileSetupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  biologicalSex: z.string().min(1, "Biological sex is required"),
});

export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;

// ─── Health Data API Schemas ───────────────────────────────────

export const createConditionSchema = z.object({
  name: z.string().min(1, "Condition name is required"),
  clinicalCode: z.string().optional(),
  diagnosisDate: z.string().optional(),
  status: z.string().optional(),
});

export const createMedicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
});

export const createAllergySchema = z.object({
  allergen: z.string().min(1, "Allergen is required"),
  reactionType: z.string().optional(),
  severity: z.string().optional(),
});

export const createSurgerySchema = z.object({
  procedure: z.string().min(1, "Procedure name is required"),
  date: z.string().optional(),
  hospital: z.string().optional(),
});

export const createSocialHistorySchema = z.object({
  smokingStatus: z.string().optional(),
  alcoholUse: z.string().optional(),
  occupation: z.string().optional(),
  exercise: z.string().optional(),
});

export const createHealthMetricSchema = z.object({
  type: z.string().min(1, "Metric type is required"),
  value: z.number({ required_error: "Value is required" }),
  unit: z.string().min(1, "Unit is required"),
});

export const createEmergencyContactSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  relationship: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export const createInsuranceSchema = z.object({
  provider: z.string().min(1, "Insurance provider is required"),
  policyNumber: z.string().optional(),
  groupNumber: z.string().optional(),
  planType: z.string().optional(),
  subscriberName: z.string().optional(),
});

export const createAlertSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  relatedType: z.string().optional(),
  relatedId: z.number().optional(),
  scheduledFor: z.string().optional(),
});

export const healthIntakeSchema = z.object({
  conditions: z.array(createConditionSchema).optional(),
  medications: z.array(createMedicationSchema).optional(),
  allergies: z.array(createAllergySchema).optional(),
  surgeries: z.array(createSurgerySchema).optional(),
  socialHistory: createSocialHistorySchema.optional(),
  healthMetrics: z.array(createHealthMetricSchema).optional(),
  emergencyContacts: z.array(createEmergencyContactSchema).optional(),
  insurance: z.array(createInsuranceSchema).optional(),
});

// ─── Password Reset Tokens ──────────────────────────────────────

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/\d/, "Password must contain at least one number"),
});

// ─── Email Verification Codes ───────────────────────────────────

export const emailVerificationCodes = pgTable("email_verification_codes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").notNull().default(0),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;

export const verifyEmailSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

// ─── Subscriptions ──────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tier: text("tier").notNull().default("basic"), // "basic" | "premium" | "unlimited"
  status: text("status").notNull().default("active"), // "active" | "cancelled" | "past_due"
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// ─── Physicians ─────────────────────────────────────────────────

export const physicians = pgTable("physicians", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  specialty: text("specialty"), // "PCP", "psychiatrist", "cardiologist", etc.
  phone: text("phone"),
  fax: text("fax"),
  email: text("email"),
  address: text("address"),
  npi: text("npi"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertPhysicianSchema = createInsertSchema(physicians).omit({
  id: true,
  createdAt: true,
});

export type Physician = typeof physicians.$inferSelect;
export type InsertPhysician = z.infer<typeof insertPhysicianSchema>;

// ─── Medication-Physician Links ─────────────────────────────────

export const medicationPhysicians = pgTable("medication_physicians", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id")
    .notNull()
    .references(() => medications.id, { onDelete: "cascade" }),
  physicianId: integer("physician_id")
    .notNull()
    .references(() => physicians.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "prescribing" | "pcp" | "specialist"
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertMedicationPhysicianSchema = createInsertSchema(medicationPhysicians).omit({
  id: true,
  createdAt: true,
});

export type MedicationPhysician = typeof medicationPhysicians.$inferSelect;
export type InsertMedicationPhysician = z.infer<typeof insertMedicationPhysicianSchema>;

// ─── Pharmacies ─────────────────────────────────────────────────

export const pharmacies = pgTable("pharmacies", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  fax: text("fax"),
  address: text("address"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertPharmacySchema = createInsertSchema(pharmacies).omit({
  id: true,
  createdAt: true,
});

export type Pharmacy = typeof pharmacies.$inferSelect;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;

// ─── Refill Requests ────────────────────────────────────────────

export const refillRequests = pgTable("refill_requests", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  medicationId: integer("medication_id")
    .notNull()
    .references(() => medications.id, { onDelete: "cascade" }),
  pharmacyId: integer("pharmacy_id")
    .references(() => pharmacies.id),
  physicianId: integer("physician_id")
    .references(() => physicians.id),
  status: text("status").notNull().default("pending"), // "pending" | "confirmed" | "calling" | "completed" | "failed"
  callLogId: integer("call_log_id"),
  requestedAt: timestamp("requested_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertRefillRequestSchema = createInsertSchema(refillRequests).omit({
  id: true,
  createdAt: true,
});

export type RefillRequest = typeof refillRequests.$inferSelect;
export type InsertRefillRequest = z.infer<typeof insertRefillRequestSchema>;

// ─── Call Logs ──────────────────────────────────────────────────

export const callLogs = pgTable("call_logs", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  refillRequestId: integer("refill_request_id")
    .references(() => refillRequests.id),
  callType: text("call_type").notNull(), // "pharmacy_refill" | "physician_contact"
  recipientName: text("recipient_name").notNull(),
  recipientPhone: text("recipient_phone").notNull(),
  scriptContent: text("script_content").notNull(),
  status: text("status").notNull().default("queued"), // "queued" | "in_progress" | "completed" | "failed" | "cancelled"
  callSid: text("call_sid"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"),
  outcome: text("outcome"), // "refill_confirmed" | "left_voicemail" | "no_answer" | "failed"
  transcript: text("transcript"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertCallLogSchema = createInsertSchema(callLogs).omit({
  id: true,
  createdAt: true,
});

export type CallLog = typeof callLogs.$inferSelect;
export type InsertCallLog = z.infer<typeof insertCallLogSchema>;
