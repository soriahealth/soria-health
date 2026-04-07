import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  type User,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Condition,
  type InsertCondition,
  type Medication,
  type InsertMedication,
  type Allergy,
  type InsertAllergy,
  type Surgery,
  type InsertSurgery,
  type SocialHistory,
  type InsertSocialHistory,
  type HealthMetric,
  type InsertHealthMetric,
  type EmergencyContact,
  type InsertEmergencyContact,
  type Insurance,
  type InsertInsurance,
  type Document,
  type InsertDocument,
  type ConnectionRequest,
  type InsertConnectionRequest,
  type Alert,
  type InsertAlert,
  type SharingPreference,
  type InsertSharingPreference,
  type Physician,
  type InsertPhysician,
  type MedicationPhysician,
  type InsertMedicationPhysician,
  type Pharmacy,
  type InsertPharmacy,
  type RefillRequest,
  type InsertRefillRequest,
  type CallLog,
  type InsertCallLog,
  type Subscription,
  type InsertSubscription,
  users,
  profiles,
  conditions,
  medications,
  allergies,
  surgeries,
  socialHistory,
  healthMetrics,
  emergencyContacts,
  insurance,
  documents,
  familyMembers,
  connectionRequests,
  alerts,
  sharingPreferences,
  physicians,
  medicationPhysicians,
  pharmacies,
  refillRequests,
  callLogs,
  subscriptions,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(
    id: number,
    data: Partial<InsertProfile>,
  ): Promise<Profile | undefined>;

  // Conditions
  getConditionsByProfileId(profileId: number): Promise<Condition[]>;
  getCondition(id: number): Promise<Condition | undefined>;
  createCondition(data: InsertCondition): Promise<Condition>;
  updateCondition(id: number, data: Partial<InsertCondition>): Promise<Condition | undefined>;
  deleteCondition(id: number): Promise<Condition | undefined>;

  // Medications
  getMedicationsByProfileId(profileId: number): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(data: InsertMedication): Promise<Medication>;
  updateMedication(id: number, data: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<Medication | undefined>;

  // Allergies
  getAllergiesByProfileId(profileId: number): Promise<Allergy[]>;
  getAllergy(id: number): Promise<Allergy | undefined>;
  createAllergy(data: InsertAllergy): Promise<Allergy>;
  updateAllergy(id: number, data: Partial<InsertAllergy>): Promise<Allergy | undefined>;
  deleteAllergy(id: number): Promise<Allergy | undefined>;

  // Surgeries
  getSurgeriesByProfileId(profileId: number): Promise<Surgery[]>;
  getSurgery(id: number): Promise<Surgery | undefined>;
  createSurgery(data: InsertSurgery): Promise<Surgery>;
  updateSurgery(id: number, data: Partial<InsertSurgery>): Promise<Surgery | undefined>;
  deleteSurgery(id: number): Promise<Surgery | undefined>;

  // Health Metrics
  getHealthMetricsByProfileId(profileId: number): Promise<HealthMetric[]>;
  getHealthMetric(id: number): Promise<HealthMetric | undefined>;
  createHealthMetric(data: InsertHealthMetric): Promise<HealthMetric>;
  updateHealthMetric(id: number, data: Partial<InsertHealthMetric>): Promise<HealthMetric | undefined>;
  deleteHealthMetric(id: number): Promise<HealthMetric | undefined>;

  // Social History
  getSocialHistoryByProfileId(profileId: number): Promise<SocialHistory | undefined>;
  upsertSocialHistory(data: InsertSocialHistory): Promise<SocialHistory>;

  // Emergency Contacts
  getEmergencyContactsByProfileId(profileId: number): Promise<EmergencyContact[]>;
  upsertEmergencyContact(data: InsertEmergencyContact): Promise<EmergencyContact>;

  // Insurance
  getInsuranceByProfileId(profileId: number): Promise<Insurance[]>;
  upsertInsurance(data: InsertInsurance): Promise<Insurance>;

  // Documents
  getDocumentsByProfileId(profileId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(data: InsertDocument): Promise<Document>;
  updateDocument(id: number, data: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<Document | undefined>;

  // Alerts
  getAlertsByProfileId(profileId: number): Promise<Alert[]>;
  getUnreadAlertCount(profileId: number): Promise<number>;
  createAlert(data: InsertAlert): Promise<Alert>;
  markAlertRead(id: number): Promise<Alert | undefined>;
  markAlertDismissed(id: number): Promise<Alert | undefined>;
  markAllAlertsRead(profileId: number): Promise<void>;

  // Family Members
  getFamilyMembersByProfileId(profileId: number): Promise<any[]>;
  createFamilyMember(data: any): Promise<any>;
  deleteFamilyMember(id: number): Promise<any>;
  getProfile(id: number): Promise<Profile | undefined>;
  getManagedProfiles(managedById: number): Promise<Profile[]>;
  deleteProfile(id: number): Promise<Profile | undefined>;

  // Connection Requests
  getConnectionRequestsByProfileId(profileId: number): Promise<ConnectionRequest[]>;
  getIncomingConnectionRequests(email: string): Promise<ConnectionRequest[]>;
  getConnectionRequest(id: number): Promise<ConnectionRequest | undefined>;
  createConnectionRequest(data: InsertConnectionRequest): Promise<ConnectionRequest>;
  updateConnectionRequest(id: number, data: Partial<InsertConnectionRequest>): Promise<ConnectionRequest | undefined>;
  deleteConnectionRequest(id: number): Promise<ConnectionRequest | undefined>;

  // Sharing Preferences
  getSharingPreference(profileId: number, connectedProfileId: number): Promise<SharingPreference | undefined>;
  upsertSharingPreference(data: InsertSharingPreference): Promise<SharingPreference>;

  // Physicians
  getPhysiciansByProfileId(profileId: number): Promise<Physician[]>;
  getPhysician(id: number): Promise<Physician | undefined>;
  createPhysician(data: InsertPhysician): Promise<Physician>;
  updatePhysician(id: number, data: Partial<Physician>): Promise<Physician | undefined>;
  deletePhysician(id: number): Promise<Physician | undefined>;

  // Medication-Physician Links
  getMedicationPhysicians(medicationId: number): Promise<MedicationPhysician[]>;
  createMedicationPhysician(data: InsertMedicationPhysician): Promise<MedicationPhysician>;
  deleteMedicationPhysician(id: number): Promise<MedicationPhysician | undefined>;

  // Pharmacies
  getPharmaciesByProfileId(profileId: number): Promise<Pharmacy[]>;
  getPharmacy(id: number): Promise<Pharmacy | undefined>;
  createPharmacy(data: InsertPharmacy): Promise<Pharmacy>;
  updatePharmacy(id: number, data: Partial<Pharmacy>): Promise<Pharmacy | undefined>;
  deletePharmacy(id: number): Promise<Pharmacy | undefined>;

  // Refill Requests
  getRefillRequestsByProfileId(profileId: number): Promise<RefillRequest[]>;
  getRefillRequest(id: number): Promise<RefillRequest | undefined>;
  createRefillRequest(data: InsertRefillRequest): Promise<RefillRequest>;
  updateRefillRequest(id: number, data: Partial<RefillRequest>): Promise<RefillRequest | undefined>;

  // Call Logs
  getCallLogsByProfileId(profileId: number): Promise<CallLog[]>;
  getCallLog(id: number): Promise<CallLog | undefined>;
  createCallLog(data: InsertCallLog): Promise<CallLog>;
  updateCallLog(id: number, data: Partial<CallLog>): Promise<CallLog | undefined>;

  // Subscriptions
  getSubscriptionByUserId(userId: string): Promise<Subscription | undefined>;
  createSubscription(data: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | undefined>;
}

export class DatabaseStorage implements IStorage {
  // ── Users & Profiles ──────────────────────────────────────────

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [created] = await db.insert(profiles).values(profile).returning();
    return created;
  }

  async updateProfile(
    id: number,
    data: Partial<InsertProfile>,
  ): Promise<Profile | undefined> {
    const [updated] = await db
      .update(profiles)
      .set(data)
      .where(eq(profiles.id, id))
      .returning();
    return updated;
  }

  // ── Conditions ────────────────────────────────────────────────

  async getConditionsByProfileId(profileId: number): Promise<Condition[]> {
    return db.select().from(conditions).where(eq(conditions.profileId, profileId));
  }

  async getCondition(id: number): Promise<Condition | undefined> {
    const [row] = await db.select().from(conditions).where(eq(conditions.id, id));
    return row;
  }

  async createCondition(data: InsertCondition): Promise<Condition> {
    const [row] = await db.insert(conditions).values(data).returning();
    return row;
  }

  async updateCondition(id: number, data: Partial<InsertCondition>): Promise<Condition | undefined> {
    const [row] = await db.update(conditions).set(data).where(eq(conditions.id, id)).returning();
    return row;
  }

  async deleteCondition(id: number): Promise<Condition | undefined> {
    const [row] = await db.delete(conditions).where(eq(conditions.id, id)).returning();
    return row;
  }

  // ── Medications ───────────────────────────────────────────────

  async getMedicationsByProfileId(profileId: number): Promise<Medication[]> {
    return db.select().from(medications).where(eq(medications.profileId, profileId));
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    const [row] = await db.select().from(medications).where(eq(medications.id, id));
    return row;
  }

  async createMedication(data: InsertMedication): Promise<Medication> {
    const [row] = await db.insert(medications).values(data).returning();
    return row;
  }

  async updateMedication(id: number, data: Partial<InsertMedication>): Promise<Medication | undefined> {
    const [row] = await db.update(medications).set(data).where(eq(medications.id, id)).returning();
    return row;
  }

  async deleteMedication(id: number): Promise<Medication | undefined> {
    const [row] = await db.delete(medications).where(eq(medications.id, id)).returning();
    return row;
  }

  // ── Allergies ─────────────────────────────────────────────────

  async getAllergiesByProfileId(profileId: number): Promise<Allergy[]> {
    return db.select().from(allergies).where(eq(allergies.profileId, profileId));
  }

  async getAllergy(id: number): Promise<Allergy | undefined> {
    const [row] = await db.select().from(allergies).where(eq(allergies.id, id));
    return row;
  }

  async createAllergy(data: InsertAllergy): Promise<Allergy> {
    const [row] = await db.insert(allergies).values(data).returning();
    return row;
  }

  async updateAllergy(id: number, data: Partial<InsertAllergy>): Promise<Allergy | undefined> {
    const [row] = await db.update(allergies).set(data).where(eq(allergies.id, id)).returning();
    return row;
  }

  async deleteAllergy(id: number): Promise<Allergy | undefined> {
    const [row] = await db.delete(allergies).where(eq(allergies.id, id)).returning();
    return row;
  }

  // ── Surgeries ─────────────────────────────────────────────────

  async getSurgeriesByProfileId(profileId: number): Promise<Surgery[]> {
    return db.select().from(surgeries).where(eq(surgeries.profileId, profileId));
  }

  async getSurgery(id: number): Promise<Surgery | undefined> {
    const [row] = await db.select().from(surgeries).where(eq(surgeries.id, id));
    return row;
  }

  async createSurgery(data: InsertSurgery): Promise<Surgery> {
    const [row] = await db.insert(surgeries).values(data).returning();
    return row;
  }

  async updateSurgery(id: number, data: Partial<InsertSurgery>): Promise<Surgery | undefined> {
    const [row] = await db.update(surgeries).set(data).where(eq(surgeries.id, id)).returning();
    return row;
  }

  async deleteSurgery(id: number): Promise<Surgery | undefined> {
    const [row] = await db.delete(surgeries).where(eq(surgeries.id, id)).returning();
    return row;
  }

  // ── Health Metrics ────────────────────────────────────────────

  async getHealthMetricsByProfileId(profileId: number): Promise<HealthMetric[]> {
    return db.select().from(healthMetrics).where(eq(healthMetrics.profileId, profileId));
  }

  async getHealthMetric(id: number): Promise<HealthMetric | undefined> {
    const [row] = await db.select().from(healthMetrics).where(eq(healthMetrics.id, id));
    return row;
  }

  async createHealthMetric(data: InsertHealthMetric): Promise<HealthMetric> {
    const [row] = await db.insert(healthMetrics).values(data).returning();
    return row;
  }

  async updateHealthMetric(id: number, data: Partial<InsertHealthMetric>): Promise<HealthMetric | undefined> {
    const [row] = await db.update(healthMetrics).set(data).where(eq(healthMetrics.id, id)).returning();
    return row;
  }

  async deleteHealthMetric(id: number): Promise<HealthMetric | undefined> {
    const [row] = await db.delete(healthMetrics).where(eq(healthMetrics.id, id)).returning();
    return row;
  }

  // ── Social History ────────────────────────────────────────────

  async getSocialHistoryByProfileId(profileId: number): Promise<SocialHistory | undefined> {
    const [row] = await db.select().from(socialHistory).where(eq(socialHistory.profileId, profileId));
    return row;
  }

  async upsertSocialHistory(data: InsertSocialHistory): Promise<SocialHistory> {
    const existing = await this.getSocialHistoryByProfileId(data.profileId);
    if (existing) {
      const [row] = await db
        .update(socialHistory)
        .set(data)
        .where(eq(socialHistory.id, existing.id))
        .returning();
      return row;
    }
    const [row] = await db.insert(socialHistory).values(data).returning();
    return row;
  }

  // ── Emergency Contacts ─────────────────────────────────────────
  async getEmergencyContactsByProfileId(profileId: number): Promise<EmergencyContact[]> {
    return db.select().from(emergencyContacts).where(eq(emergencyContacts.profileId, profileId));
  }

  async upsertEmergencyContact(data: InsertEmergencyContact): Promise<EmergencyContact> {
    const existing = await this.getEmergencyContactsByProfileId(data.profileId);
    if (existing.length > 0) {
      const [row] = await db
        .update(emergencyContacts)
        .set(data)
        .where(eq(emergencyContacts.id, existing[0].id))
        .returning();
      return row;
    }
    const [row] = await db.insert(emergencyContacts).values(data).returning();
    return row;
  }

  // ── Insurance ──────────────────────────────────────────────────
  async getInsuranceByProfileId(profileId: number): Promise<Insurance[]> {
    return db.select().from(insurance).where(eq(insurance.profileId, profileId));
  }

  async upsertInsurance(data: InsertInsurance): Promise<Insurance> {
    const existing = await this.getInsuranceByProfileId(data.profileId);
    if (existing.length > 0) {
      const [row] = await db
        .update(insurance)
        .set(data)
        .where(eq(insurance.id, existing[0].id))
        .returning();
      return row;
    }
    const [row] = await db.insert(insurance).values(data).returning();
    return row;
  }
  // ── Documents ──────────────────────────────────────────────────

  async getDocumentsByProfileId(profileId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.profileId, profileId));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [row] = await db.select().from(documents).where(eq(documents.id, id));
    return row;
  }

  async createDocument(data: InsertDocument): Promise<Document> {
    const [row] = await db.insert(documents).values(data).returning();
    return row;
  }

  async updateDocument(id: number, data: Partial<InsertDocument>): Promise<Document | undefined> {
    const [row] = await db.update(documents).set(data).where(eq(documents.id, id)).returning();
    return row;
  }

  async deleteDocument(id: number): Promise<Document | undefined> {
    const [row] = await db.delete(documents).where(eq(documents.id, id)).returning();
    return row;
  }
  // ── Alerts ──────────────────────────────────────────────────

  async getAlertsByProfileId(profileId: number): Promise<Alert[]> {
    return db.select().from(alerts)
      .where(eq(alerts.profileId, profileId))
      .orderBy(desc(alerts.createdAt));
  }

  async getUnreadAlertCount(profileId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(sql`${alerts.profileId} = ${profileId} AND ${alerts.isRead} = false AND ${alerts.isDismissed} = false`);
    return Number(result[0]?.count ?? 0);
  }

  async createAlert(data: InsertAlert): Promise<Alert> {
    const [row] = await db.insert(alerts).values(data).returning();
    return row;
  }

  async markAlertRead(id: number): Promise<Alert | undefined> {
    const [row] = await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id)).returning();
    return row;
  }

  async markAlertDismissed(id: number): Promise<Alert | undefined> {
    const [row] = await db.update(alerts).set({ isDismissed: true }).where(eq(alerts.id, id)).returning();
    return row;
  }

  async markAllAlertsRead(profileId: number): Promise<void> {
    await db.update(alerts).set({ isRead: true }).where(eq(alerts.profileId, profileId));
  }

  // ── Family Members ───────────────────────────────────────────

  async getFamilyMembersByProfileId(profileId: number) {
    return db.select().from(familyMembers).where(eq(familyMembers.profileId, profileId));
  }

  async createFamilyMember(data: any) {
    const [row] = await db.insert(familyMembers).values(data).returning();
    return row;
  }

  async deleteFamilyMember(id: number) {
    const [row] = await db.delete(familyMembers).where(eq(familyMembers.id, id)).returning();
    return row;
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    const [row] = await db.select().from(profiles).where(eq(profiles.id, id));
    return row;
  }

  async getManagedProfiles(managedById: number): Promise<Profile[]> {
    return db.select().from(profiles).where(eq(profiles.managedById, managedById));
  }

  async deleteProfile(id: number): Promise<Profile | undefined> {
    const [row] = await db.delete(profiles).where(eq(profiles.id, id)).returning();
    return row;
  }

  // ── Connection Requests ─────────────────────────────────────────

  async getConnectionRequestsByProfileId(profileId: number): Promise<ConnectionRequest[]> {
    return db.select().from(connectionRequests).where(eq(connectionRequests.fromProfileId, profileId));
  }

  async getIncomingConnectionRequests(email: string): Promise<ConnectionRequest[]> {
    return db.select().from(connectionRequests)
      .where(eq(connectionRequests.toEmail, email));
  }

  async getConnectionRequest(id: number): Promise<ConnectionRequest | undefined> {
    const [row] = await db.select().from(connectionRequests).where(eq(connectionRequests.id, id));
    return row;
  }

  async createConnectionRequest(data: InsertConnectionRequest): Promise<ConnectionRequest> {
    const [row] = await db.insert(connectionRequests).values(data).returning();
    return row;
  }

  async updateConnectionRequest(id: number, data: Partial<InsertConnectionRequest>): Promise<ConnectionRequest | undefined> {
    const [row] = await db.update(connectionRequests).set(data).where(eq(connectionRequests.id, id)).returning();
    return row;
  }

  async deleteConnectionRequest(id: number): Promise<ConnectionRequest | undefined> {
    const [row] = await db.delete(connectionRequests).where(eq(connectionRequests.id, id)).returning();
    return row;
  }

  // ── Sharing Preferences ───────────────────────────────────────

  async getSharingPreference(profileId: number, connectedProfileId: number): Promise<SharingPreference | undefined> {
    const [row] = await db
      .select()
      .from(sharingPreferences)
      .where(
        and(
          eq(sharingPreferences.profileId, profileId),
          eq(sharingPreferences.connectedProfileId, connectedProfileId)
        )
      );
    return row;
  }

  async upsertSharingPreference(data: InsertSharingPreference): Promise<SharingPreference> {
    const existing = await this.getSharingPreference(data.profileId, data.connectedProfileId);
    if (existing) {
      const [row] = await db
        .update(sharingPreferences)
        .set(data)
        .where(eq(sharingPreferences.id, existing.id))
        .returning();
      return row;
    }
    const [row] = await db.insert(sharingPreferences).values(data).returning();
    return row;
  }

  // ── Physicians ──────────────────────────────────────────────────

  async getPhysiciansByProfileId(profileId: number): Promise<Physician[]> {
    return db.select().from(physicians).where(eq(physicians.profileId, profileId));
  }

  async getPhysician(id: number): Promise<Physician | undefined> {
    const [row] = await db.select().from(physicians).where(eq(physicians.id, id));
    return row;
  }

  async createPhysician(data: InsertPhysician): Promise<Physician> {
    const [row] = await db.insert(physicians).values(data).returning();
    return row;
  }

  async updatePhysician(id: number, data: Partial<Physician>): Promise<Physician | undefined> {
    const [row] = await db.update(physicians).set(data).where(eq(physicians.id, id)).returning();
    return row;
  }

  async deletePhysician(id: number): Promise<Physician | undefined> {
    const [row] = await db.delete(physicians).where(eq(physicians.id, id)).returning();
    return row;
  }

  // ── Medication-Physician Links ─────────────────────────────────

  async getMedicationPhysicians(medicationId: number): Promise<MedicationPhysician[]> {
    return db.select().from(medicationPhysicians).where(eq(medicationPhysicians.medicationId, medicationId));
  }

  async createMedicationPhysician(data: InsertMedicationPhysician): Promise<MedicationPhysician> {
    const [row] = await db.insert(medicationPhysicians).values(data).returning();
    return row;
  }

  async deleteMedicationPhysician(id: number): Promise<MedicationPhysician | undefined> {
    const [row] = await db.delete(medicationPhysicians).where(eq(medicationPhysicians.id, id)).returning();
    return row;
  }

  // ── Pharmacies ─────────────────────────────────────────────────

  async getPharmaciesByProfileId(profileId: number): Promise<Pharmacy[]> {
    return db.select().from(pharmacies).where(eq(pharmacies.profileId, profileId));
  }

  async getPharmacy(id: number): Promise<Pharmacy | undefined> {
    const [row] = await db.select().from(pharmacies).where(eq(pharmacies.id, id));
    return row;
  }

  async createPharmacy(data: InsertPharmacy): Promise<Pharmacy> {
    const [row] = await db.insert(pharmacies).values(data).returning();
    return row;
  }

  async updatePharmacy(id: number, data: Partial<Pharmacy>): Promise<Pharmacy | undefined> {
    const [row] = await db.update(pharmacies).set(data).where(eq(pharmacies.id, id)).returning();
    return row;
  }

  async deletePharmacy(id: number): Promise<Pharmacy | undefined> {
    const [row] = await db.delete(pharmacies).where(eq(pharmacies.id, id)).returning();
    return row;
  }

  // ── Refill Requests ────────────────────────────────────────────

  async getRefillRequestsByProfileId(profileId: number): Promise<RefillRequest[]> {
    return db.select().from(refillRequests)
      .where(eq(refillRequests.profileId, profileId))
      .orderBy(desc(refillRequests.createdAt));
  }

  async getRefillRequest(id: number): Promise<RefillRequest | undefined> {
    const [row] = await db.select().from(refillRequests).where(eq(refillRequests.id, id));
    return row;
  }

  async createRefillRequest(data: InsertRefillRequest): Promise<RefillRequest> {
    const [row] = await db.insert(refillRequests).values(data).returning();
    return row;
  }

  async updateRefillRequest(id: number, data: Partial<RefillRequest>): Promise<RefillRequest | undefined> {
    const [row] = await db.update(refillRequests).set(data).where(eq(refillRequests.id, id)).returning();
    return row;
  }

  // ── Call Logs ───────────────────────────────────────────────────

  async getCallLogsByProfileId(profileId: number): Promise<CallLog[]> {
    return db.select().from(callLogs)
      .where(eq(callLogs.profileId, profileId))
      .orderBy(desc(callLogs.createdAt));
  }

  async getCallLog(id: number): Promise<CallLog | undefined> {
    const [row] = await db.select().from(callLogs).where(eq(callLogs.id, id));
    return row;
  }

  async createCallLog(data: InsertCallLog): Promise<CallLog> {
    const [row] = await db.insert(callLogs).values(data).returning();
    return row;
  }

  async updateCallLog(id: number, data: Partial<CallLog>): Promise<CallLog | undefined> {
    const [row] = await db.update(callLogs).set(data).where(eq(callLogs.id, id)).returning();
    return row;
  }

  // ── Subscriptions ──────────────────────────────────────────────

  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    const [row] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return row;
  }

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const [row] = await db.insert(subscriptions).values(data).returning();
    return row;
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | undefined> {
    const [row] = await db
      .update(subscriptions)
      .set(data)
      .where(eq(subscriptions.id, id))
      .returning();
    return row;
  }
}

export const storage = new DatabaseStorage();
