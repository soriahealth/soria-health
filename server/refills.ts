import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { authMiddleware } from "./auth";
import { premiumMiddleware } from "./billing";
import { medicationPhysicians } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db } from "./db";

/** Resolve session -> profileId. Returns profileId or sends error response. */
async function getProfileId(req: Request, res: Response): Promise<number | null> {
  const profile = await storage.getProfileByUserId(req.session.userId!);
  if (!profile) {
    res.status(404).json({ message: "Profile not found" });
    return null;
  }
  return profile.id;
}

export function registerRefillRoutes(app: Express) {
  // ── Physician Routes ──────────────────────────────────────────

  app.get("/api/physicians", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const list = await storage.getPhysiciansByProfileId(profileId);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/physicians", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const { name, specialty, phone, fax, email, address, npi, isPrimary } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Physician name is required" });
      }
      const physician = await storage.createPhysician({
        profileId,
        name: name.trim(),
        specialty: specialty || null,
        phone: phone || null,
        fax: fax || null,
        email: email || null,
        address: address || null,
        npi: npi || null,
        isPrimary: isPrimary || false,
      });
      res.status(201).json(physician);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/physicians/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getPhysician(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Physician not found" });
      }
      const updated = await storage.updatePhysician(id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/physicians/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getPhysician(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Physician not found" });
      }
      const deleted = await storage.deletePhysician(id);
      res.json(deleted);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── Pharmacy Routes ───────────────────────────────────────────

  app.get("/api/pharmacies", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const list = await storage.getPharmaciesByProfileId(profileId);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/pharmacies", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const { name, phone, fax, address, isDefault } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Pharmacy name is required" });
      }
      const pharmacy = await storage.createPharmacy({
        profileId,
        name: name.trim(),
        phone: phone || null,
        fax: fax || null,
        address: address || null,
        isDefault: isDefault || false,
      });
      res.status(201).json(pharmacy);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/pharmacies/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getPharmacy(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Pharmacy not found" });
      }
      const updated = await storage.updatePharmacy(id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/pharmacies/:id", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const id = Number(req.params.id);
      const existing = await storage.getPharmacy(id);
      if (!existing || existing.profileId !== profileId) {
        return res.status(404).json({ message: "Pharmacy not found" });
      }
      const deleted = await storage.deletePharmacy(id);
      res.json(deleted);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── Escalation Chain ──────────────────────────────────────────

  app.get("/api/medications/:id/escalation-chain", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const medId = Number(req.params.id);
      const medication = await storage.getMedication(medId);
      if (!medication || medication.profileId !== profileId) {
        return res.status(404).json({ message: "Medication not found" });
      }

      // Get all physician links for this medication
      const links = await storage.getMedicationPhysicians(medId);

      // Build chain: prescribing > PCP > specialists
      const chain: Array<{ role: string; physician: any }> = [];
      const missingRoles: string[] = [];

      const prescribingLink = links.find((l) => l.role === "prescribing");
      if (prescribingLink) {
        const doc = await storage.getPhysician(prescribingLink.physicianId);
        if (doc) chain.push({ role: "prescribing", physician: doc });
      } else {
        missingRoles.push("prescribing");
      }

      const pcpLink = links.find((l) => l.role === "pcp");
      if (pcpLink) {
        const doc = await storage.getPhysician(pcpLink.physicianId);
        if (doc) chain.push({ role: "pcp", physician: doc });
      } else {
        missingRoles.push("pcp");
      }

      const specialistLinks = links.filter((l) => l.role === "specialist");
      for (const sl of specialistLinks) {
        const doc = await storage.getPhysician(sl.physicianId);
        if (doc) chain.push({ role: "specialist", physician: doc });
      }

      if (specialistLinks.length === 0) {
        missingRoles.push("specialist");
      }

      res.json({ medicationId: medId, medicationName: medication.name, chain, missingRoles });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── Assign Physicians to Medication ───────────────────────────

  app.put("/api/medications/:id/physicians", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const medId = Number(req.params.id);
      const medication = await storage.getMedication(medId);
      if (!medication || medication.profileId !== profileId) {
        return res.status(404).json({ message: "Medication not found" });
      }

      const { prescribingId, pcpId, specialistId } = req.body;

      // Remove existing links
      const existingLinks = await storage.getMedicationPhysicians(medId);
      for (const link of existingLinks) {
        await storage.deleteMedicationPhysician(link.id);
      }

      // Create new links
      const created: any[] = [];
      if (prescribingId) {
        const link = await storage.createMedicationPhysician({
          medicationId: medId,
          physicianId: prescribingId,
          role: "prescribing",
        });
        created.push(link);
      }
      if (pcpId) {
        const link = await storage.createMedicationPhysician({
          medicationId: medId,
          physicianId: pcpId,
          role: "pcp",
        });
        created.push(link);
      }
      if (specialistId) {
        const link = await storage.createMedicationPhysician({
          medicationId: medId,
          physicianId: specialistId,
          role: "specialist",
        });
        created.push(link);
      }

      // Also update the prescribingPhysicianId on the medication itself
      if (prescribingId) {
        await storage.updateMedication(medId, { prescribingPhysicianId: prescribingId });
      }

      res.json({ medicationId: medId, links: created });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── Refill Check ──────────────────────────────────────────────

  app.get("/api/refills/check", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      const meds = await storage.getMedicationsByProfileId(profileId);
      const now = new Date();
      const results: any[] = [];

      for (const med of meds) {
        if (!med.lastFilledDate || !med.daySupply) continue;

        const filledDate = new Date(med.lastFilledDate);
        const runOutDate = new Date(filledDate);
        runOutDate.setDate(runOutDate.getDate() + med.daySupply);

        const daysRemaining = Math.ceil(
          (runOutDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        let urgency: "red" | "yellow" | "green" = "green";
        if (daysRemaining < 3) urgency = "red";
        else if (daysRemaining < 7) urgency = "yellow";

        // Get pharmacy info if assigned
        let pharmacy = null;
        if (med.pharmacyId) {
          pharmacy = await storage.getPharmacy(med.pharmacyId);
        }

        results.push({
          medication: med,
          daysRemaining: Math.max(0, daysRemaining),
          runOutDate: runOutDate.toISOString().split("T")[0],
          urgency,
          pharmacy,
          refillsRemaining: med.refillsRemaining,
          isAutoRefill: med.isAutoRefill,
        });
      }

      // Sort by urgency: red first, then yellow, then green
      const urgencyOrder: Record<string, number> = { red: 0, yellow: 1, green: 2 };
      results.sort((a: any, b: any) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

      res.json(results);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── Refill Request Routes ─────────────────────────────────────

  app.post("/api/refills/request", authMiddleware, premiumMiddleware("premium"), async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      const { medicationId, pharmacyId, physicianId, notes } = req.body;
      if (!medicationId) {
        return res.status(400).json({ message: "Medication ID is required" });
      }

      const medication = await storage.getMedication(medicationId);
      if (!medication || medication.profileId !== profileId) {
        return res.status(404).json({ message: "Medication not found" });
      }

      const refill = await storage.createRefillRequest({
        profileId,
        medicationId,
        pharmacyId: pharmacyId || medication.pharmacyId || null,
        physicianId: physicianId || medication.prescribingPhysicianId || null,
        status: "pending",
        notes: notes || null,
      });

      // Create an alert for the refill request
      await storage.createAlert({
        profileId,
        type: "medication_reminder",
        title: "Refill Requested",
        message: `Refill request created for ${medication.name}.`,
        relatedType: "medication",
        relatedId: medicationId,
      });

      res.status(201).json(refill);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── Confirm Refill & Initiate Call ──────────────────────────
  app.put("/api/refills/:id/confirm", authMiddleware, premiumMiddleware("premium"), async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;

      const refillId = Number(req.params.id);
      const refill = await storage.getRefillRequest(refillId);
      if (!refill || refill.profileId !== profileId) {
        return res.status(404).json({ message: "Refill request not found" });
      }

      if (refill.status !== "pending") {
        return res.status(400).json({ message: "Refill is not in pending status" });
      }

      // Update status to confirmed
      const updated = await storage.updateRefillRequest(refillId, { status: "confirmed" });

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/refills", authMiddleware, async (req, res) => {
    try {
      const profileId = await getProfileId(req, res);
      if (!profileId) return;
      const list = await storage.getRefillRequestsByProfileId(profileId);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
}
