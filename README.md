# Soria Health — Product Flow & Feature Specification

> **v2.0 · User & Admin Perspective**
>
> This document defines every product flow in Soria Health — the multi-generational family health platform. It is written for engineers, designers, and product managers who need to understand exactly how the product behaves, screen by screen, for both end users and household managers.

---

## How to Read This Document

Each section covers one product flow end-to-end, broken into numbered steps with the screen name and what the user sees or does at that step.

| Convention | Meaning |
|---|---|
| **User Flow** | Numbered step table — screen name + what the user sees/does |
| `> 🔐 ADMIN VIEW` | Callout block — what the Household Manager sees or can do differently |
| `> ℹ️ Note` | Design or engineering note — not visible to users |
| **HM Only** | Screen or feature exclusive to the Household Manager role |
| **Premium** | Feature requiring a Premium subscription |

---

## Table of Contents

1. [Onboarding & Sign-Up](#1-onboarding--sign-up)
2. [Health Intake Form](#2-health-intake-form)
3. [Adding Family Members](#3-adding-family-members)
4. [Connecting & Disconnecting](#4-connecting--disconnecting)
5. [Privacy Review & Record Privacy](#5-privacy-review--record-privacy)
6. [Viewing & Editing Records](#6-viewing--editing-records)
7. [Document Uploads](#7-document-uploads)
8. [Alerts & Notifications](#8-alerts--notifications)
9. [Household Manager Admin View](#9-household-manager-admin-view)
10. [Ask Me — AI Health Assistant](#10-ask-me--ai-health-assistant)
11. [Screen Inventory & Navigation](#11-screen-inventory--navigation)
12. [Permission Rules — Quick Reference](#12-permission-rules--quick-reference)

---

## 1. Onboarding & Sign-Up

The onboarding flow runs once — on first app launch. Its purpose is to get the user signed in, set their role, capture consent, and bring them to their first populated dashboard as fast as possible. Every step except consent is skippable.

### 1.1 First Launch

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Splash Screen** | Soria Health logo and tagline displayed for 1.5 seconds. Transitions automatically to Welcome. |
| 2 | **Welcome Screen** | Two CTAs: 'Create Account' and 'I already have an account — Log In'. Tagline: 'Your family's health, across generations.' |
| 3 | **Sign-Up Method** | User selects: Continue with Apple, Continue with Google, or Sign Up with Email. Apple and Google use SSO; email requires name + email + password (min 8 chars, 1 number). |
| 4 | **Email Verification** | If email sign-up: verification code sent to email. User enters 6-digit code. 'Resend code' available after 30 seconds. Max 3 attempts before lockout (10 min). |
| 5 | **Consent & Privacy** | Full-screen consent screen. User must scroll to bottom before 'Agree & Continue' activates. Shows: Data Use Policy summary, HIPAA notice, and explicit opt-in checkboxes for (a) storing health data and (b) family sharing. **This step cannot be skipped.** |
| 6 | **Your Profile** | User enters: first name, last name, date of birth (date picker), biological sex (dropdown), profile photo (optional). 'Continue' is active as soon as name and DOB are filled. |
| 7 | **Your Role** | User selects their primary reason for using Soria: 'Managing my own health', 'Managing my family's health', 'Caring for a parent or loved one', or 'All of the above'. Selection determines default dashboard layout. Can be changed later in Settings. |
| 8 | **Add Family Member** | Prompt: 'Would you like to add a family member now?' CTA: 'Add a Family Member' or 'Skip for now'. Skipping goes directly to Step 9. |
| 9 | **Build Your Profile** | Prompt to complete the Health Intake Form (see [Section 2](#2-health-intake-form)). CTA: 'Start My Health Profile' or 'Skip for now — I'll do this later'. |
| 10 | **Home Dashboard** | User lands on the Home screen. If intake form was skipped, a Profile Completion ring and nudge card are shown. If completed, a populated Health Summary card is shown. |

> 🔐 **ADMIN VIEW** — The first user to sign up on a household is automatically assigned the Household Manager role. This role can be transferred to another adult connected member at any time from Settings > Household > Transfer Manager Role.

### 1.2 Returning User — Log In

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Welcome Screen** | User taps 'I already have an account — Log In'. |
| 2 | **Log In Method** | Same SSO options as sign-up, plus email + password. 'Forgot password?' link triggers email reset flow. |
| 3 | **Biometric Prompt** | If device supports Face ID / Touch ID and user has enabled it, biometric prompt shown on return visits. User can dismiss and use password instead. |
| 4 | **Home Dashboard** | User lands on their last-viewed screen or Home if first login of the day. |

> ℹ️ Session timeout is 15 minutes of inactivity. On timeout, user is returned to the Log In screen and must re-authenticate.

---

## 2. Health Intake Form

The Health Intake Form is a guided, sectioned form modelled on a clinical new patient intake form. It is triggered at Step 9 of onboarding for the user's own profile, and again whenever a family member profile is created (managed or connected). It is the primary mechanism for populating Soria's health data.

| Property | Detail |
|---|---|
| **Entry points** | Onboarding Step 9; Add Family Member flow (all paths); Profile > 'Complete Your Profile' |
| **Label** | Always pre-labelled with the subject's name — e.g. 'Building Sarah's Health Profile' |
| **Progress indicator** | Step counter at top: 'Section 2 of 6 — Medications'. Progress bar fills as sections complete. |
| **Skip behaviour** | Every section has a 'Skip for now' option. Skipped sections accessible from Profile > Complete Your Profile at any time. |
| **Autocomplete** | All medical term fields use NLM Clinical Tables / RxNorm typeahead. Free-text entry always permitted as fallback. |

### 2.1 Section Flow

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Basic Vitals** | Height (ft/in or cm), Weight (lbs or kg), Blood type (dropdown), Biological sex (pre-filled if completing own profile). |
| 2 | **Medical History** | Repeatable entries. Each: Condition name (ICD-10/SNOMED typeahead), Date of diagnosis, Status (Active / Chronic / Resolved). Min 0 entries. |
| 3 | **Current Medications** | Repeatable entries. Each: Medication name (RxNorm), Dosage, Frequency (dropdown), Start date (optional), Prescribing physician (optional). |
| 4 | **Known Allergies** | Repeatable entries. Each: Allergen (SNOMED/RxNorm typeahead), Reaction type, Severity (Mild / Moderate / Severe). |
| 5 | **Past Surgical History** | Repeatable entries. Each: Procedure (CPT typeahead), Date, Hospital, Surgeon, Notes. Note shown: 'You can upload documents for this surgery after completing your profile.' |
| 6 | **Social History** | Single form. Fields: Smoking status, Alcohol use (drinks/week), Recreational drug use, Occupation, Exercise (days/week + type), Diet notes. |
| 7 | **Review & Save** | Summary of all entered data grouped by section. Each section has an 'Edit' link. CTA: 'Save My Profile'. On save: user goes to Profile screen or, if in onboarding, to Home Dashboard. |

> 🔐 **ADMIN VIEW** — When a Household Manager completes the intake form for a managed profile (child Path B, parent Path B, or legacy), the form is identical but labelled with the managed member's name. The HM can return to edit any section at any time from the managed member's Profile screen. If the managed member later gains their own active account, they take full ownership and can edit all records directly.

> ℹ️ Each record stores both the human-readable term and the clinical code (ICD-10, RxNorm CUI, CPT, etc.) as separate database fields, plus a boolean `is_coded` flag. Free-text entries are stored with `is_coded = false`.

---

## 3. Adding Family Members

The 'Add Family Member' flow is accessed from the Family Network screen or during onboarding. It always starts with a path selection screen, then branches into one of three paths depending on the type of member being added.

### 3.0 Path Selection Screen

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Family Network** | User taps '+' or 'Add Family Member'. |
| 2 | **Choose Member Type** | Three cards: **'Child (under 21)'** · **'Parent / Grandparent'** · **'Post-Mortem Account'** |

---

### 3.1 Path 1 — Child (Under 21)

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Child Details** | User enters: first name, last name, DOB, biological sex, relationship (Son / Daughter / Stepchild / Ward / Other). |
| 2 | **Active Account?** | 'Do they have their own device and can use the app?' → **'Yes — invite them to connect'** (Path 1A) or **'No — I'll manage their profile'** (Path 1B) |

#### Path 1A — Child Has Their Own Account (Connection Flow)

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 3 | **Enter Contact** | User enters child's email address or phone number for SMS invite. |
| 4 | **Confirm & Send** | Preview of request: '[Your name] wants to connect with you on Soria Health as your Parent/Guardian.' User confirms. Request expires in 14 days. |
| 5 | **Pending State** | Child's card appears in Family Network with a 'Pending' badge. No data shared while pending. |
| 6 | **Child Receives Invite** | Child receives email/SMS deep link. If no Soria account: link opens App Store / Play Store, auto-links after sign-up. If existing account: opens accept screen. |
| 7 | **Privacy Review** | Before accepting, child sees Pre-Connection Privacy Review (see [Section 5](#5-privacy-review--record-privacy)). All records default to Shared. Child can flip any to Private. |
| 8 | **Child Accepts** | Child taps 'Confirm & Connect'. Both users appear in each other's Family Network. All non-private records are visible. |
| 9 | **Expiry / No Response** | After 14 days: parent notified. Parent can re-send or switch to Path 1B. |

#### Path 1B — Child Does Not Have Their Own Account (Managed Profile)

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 3 | **Guardian Confirmation** | 'I am the parent or legal guardian of this child and am authorised to manage their health records on their behalf.' Must tap 'I Confirm'. Cannot skip. |
| 4 | **Intake Form** | Health Intake Form launched, labelled 'Building [Child's Name]'s Profile'. All 6 sections available, each skippable. |
| 5 | **Profile Created** | Child appears in Family Network with a 'Managed' badge. Parent has full read/write access to all non-private records. Child can add and edit their own records if they later gain app access. |
| 6 | **Age Milestone** | When child turns 21: parent receives push notification to invite them to take ownership. Parent can send invite (triggers Path 1A) or dismiss. |

> 🔐 **ADMIN VIEW** — Managed profiles created by the HM are fully editable. Name, DOB, and relationship are editable from Profile > Edit Details. The HM can delete a managed profile from Profile > Settings > Remove Profile — this permanently deletes all data and cannot be undone. A confirmation dialog is required: 'This will permanently delete all health records for [name]. This cannot be undone.'

---

### 3.2 Path 2 — Parent / Grandparent

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Member Details** | User enters: name, DOB, biological sex, relationship (Mother / Father / Grandmother / Grandfather / Step-parent / Other). |
| 2 | **Active Account?** | 'Are they able to use the app themselves?' → **'Yes — invite them to connect'** (Path 2A) or **'No — I'll manage their profile for them'** (Path 2B) |

#### Path 2A — They Use the App (Connection Flow)

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 3 | **Enter Contact** | User enters family member's email address. |
| 4 | **Confirm & Send** | Preview of connection request. User confirms. Request expires in 14 days. |
| 5 | **Pending State** | Card appears in Family Network with 'Pending' badge. No data shared while pending. |
| 6 | **Recipient Receives** | Email with deep link. If no account: App Store/Play Store link, auto-links after sign-up. If existing account: opens accept screen. |
| 7 | **Privacy Review** | Recipient sees Pre-Connection Privacy Review before accepting. All records default to Shared. |
| 8 | **Recipient Accepts** | Taps 'Confirm & Connect'. Both appear in each other's Family Network. |
| 9 | **Expiry** | After 14 days without response: sender notified. Can re-send or switch to Path 2B. |

#### Path 2B — They Don't Use the App (Managed Profile)

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 3 | **Caregiver Confirmation** | 'I am an authorised caregiver or family representative for this person and have their permission to manage their health records.' Must tap 'I Confirm'. |
| 4 | **Intake Form** | Health Intake Form launched, labelled 'Building [Name]'s Profile'. |
| 5 | **Profile Created** | Member appears in Family Network with 'Managed' badge. HM has full read/write access to all non-private records. |
| 6 | **Upgrade Path** | At any time: HM can tap 'Invite to Join Soria' from the managed member's Profile. On acceptance, profile converts from Managed to Connected. |

> 🔐 **ADMIN VIEW** — Path 2B managed profiles behave identically to Path 1B for the HM — full read/write access to all non-private records. The 'Managed' badge is displayed on the card in Family Network and on the Profile header. HM can access all managed profiles from Family Network without a connection request.

---

### 3.3 Path 3 — Post-Mortem Account

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Deceased Member Details** | User enters: first name, last name, DOB, date of death, biological sex, relationship. |
| 2 | **Next of Kin Confirmation** | 'I am next of kin or an authorised representative and am submitting this health information in good faith.' Must tap 'I Confirm'. Cannot skip. |
| 3 | **Intake Form** | Health Intake Form launched, labelled 'Building [Name]'s Legacy Profile'. Social History section is optional. |
| 4 | **Legacy Profile Created** | Profile appears in Family Network with a 'Legacy' badge and distinct visual treatment (muted colours, memorial-style header). Creator has full read/write access. |
| 5 | **Sharing** | Creator can share the legacy profile with other connected family members from Profile > Sharing Settings. Recipient sees it in their Family Network as read-only. |

> 🔐 **ADMIN VIEW** — Legacy profiles cannot be converted to active accounts. The 'Legacy' badge is permanent. Only the creating HM can edit or delete the profile. Shared recipients can view non-private records only — they cannot add, edit, or delete. The HM can revoke sharing from Profile > Sharing Settings at any time.

---

## 4. Connecting & Disconnecting

Connections are the links between independently-owned Soria accounts. They are mutual — both parties must agree — and either party can sever them at any time. The Household Manager role carries no special connection privileges.

### 4.1 Sending a Connection Request

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Entry Point** | Via Add Family Member flow (Paths 1A, 2A) or via Family Network > 'Find & Connect'. |
| 2 | **Enter Details** | Sender enters recipient's email address and selects relationship label. |
| 3 | **Preview & Send** | Sender sees preview of request message. Taps 'Send Request'. |
| 4 | **Pending Badge** | Recipient's card appears in Family Network with yellow 'Pending' badge. Sender can cancel the request by tapping the card > 'Cancel Request'. |
| 5 | **Notification Sent** | Recipient receives push notification and email: '[Name] wants to connect with you on Soria Health as your [relationship].' Email contains 'Accept' and 'Decline' buttons. |

### 4.2 Receiving a Connection Request

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Notification** | Push or email received. Tapping opens the app to the Connection Request screen. |
| 2 | **Request Screen** | Shows: sender's name, profile photo (if set), relationship label, and 'Accept' / 'Decline' buttons. |
| 3 | **Privacy Review** | On tapping 'Accept': full-screen Privacy Review screen appears before connection is confirmed. The connection is **NOT** confirmed until the user taps 'Confirm & Connect' at the end of the Privacy Review. |
| 4 | **Confirm & Connect** | Connection established. Both users appear in each other's Family Network. |
| 5 | **Decline** | Sender notified — '[Name] has declined your connection request.' No data is shared. The request is removed. |
| 6 | **Expiry** | Requests expire after 14 days. Both parties are notified. Sender can re-send. |

### 4.3 Disconnecting

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Entry Point** | Family Network > tap a connected member's card > tap '⋯' menu > 'Disconnect from [Name]'. |
| 2 | **Confirmation Dialog** | 'Are you sure you want to disconnect from [Name]? They will be removed from your Family Network and will no longer be able to see your shared records.' Buttons: 'Disconnect' (red) and 'Cancel'. |
| 3 | **Immediate Effect** | Both users removed from each other's Family Network instantly. All shared record access revoked immediately. No health data is deleted from either account. |
| 4 | **Notification** | Disconnected party receives push: '[Name] has disconnected from you on Soria Health.' |
| 5 | **Reconnecting** | Either party can send a new connection request at any time. No block or cooldown. The Privacy Review runs again as a fresh request. |

> 🔐 **ADMIN VIEW** — The HM can disconnect from any connected member via the same flow. Disconnecting does not affect managed profiles — managed profiles are sub-profiles owned by the HM, not connections. To remove a managed profile entirely, use Profile > Settings > Remove Profile.

---

## 5. Privacy Review & Record Privacy

Privacy in Soria is **public-by-default** within the connected family network. All records are visible to all connected members unless explicitly marked private.

| Property | Detail |
|---|---|
| **Default state** | All records visible to all connected members (and the creating HM for managed profiles) |
| **Private records** | Hidden from everyone — including the Household Manager. No exceptions. |
| **Privacy granularity** | Per-record. Each individual entry can be independently set to private. |
| **Who can make private** | Only the record owner. For managed profiles: the HM marks records private on behalf of the managed member. |

### 5.1 Pre-Connection Privacy Review

This screen is shown to the accepting user immediately before any connection is confirmed. It **cannot be skipped** — the user must tap 'Confirm & Connect' to proceed, even if no changes are made.

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Privacy Review Opens** | Triggered when user taps 'Accept' on an incoming connection request, or 'Confirm & Connect' in the Add Family Member flow (Paths 1A and 2A). |
| 2 | **Prompt** | Header: 'Is there anything you want to make private before connecting with [Name]?' Subtext: 'All your records will be visible to [Name] by default. You can hide anything you'd like to keep personal.' |
| 3 | **Suggested Categories** | Soft reminder banner (not a restriction): 'Some people choose to keep these private: Mental health records · Reproductive health · Substance use · Sensitive medications.' Tapping a category scrolls to those records. |
| 4 | **Full Record List** | Scrollable list of all records grouped by category: Conditions, Medications, Allergies, Surgical History, Social History. Each record has a toggle (default: Shared / green). |
| 5 | **Toggling Private** | User flips any toggle to 'Private' (grey with lock icon). Counter at top updates: 'X records will be kept private.' The sender does not see which records were hidden. |
| 6 | **Confirm & Connect** | User taps 'Confirm & Connect'. Any records toggled to Private are immediately hidden. Connection is established. User lands on Family Network. |
| 7 | **Empty Profile** | If the user has no records yet: 'You don't have any records yet — your new records will be shared by default.' User taps 'Continue & Connect'. |

### 5.2 Making a Record Private After Connecting

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Entry Point** | From any Record Detail screen: tap '⋯' menu > 'Make Private'. |
| 2 | **Confirmation** | Toast: 'This record is now private. It won't be visible to your family connections.' |
| 3 | **Immediate Effect** | Record hidden from all connected members immediately. A lock icon appears on the record card in the user's own view. |
| 4 | **Privacy Overview** | All private records visible in one place at Profile > Privacy Overview. 'Make Shared' button on each row to reverse. |
| 5 | **Making Shared Again** | From Record Detail '⋯' menu or Privacy Overview: 'Make Shared'. Record becomes visible to all connected members immediately. |

> 🔐 **ADMIN VIEW** — Household Managers cannot see or access records marked private on any profile — including managed profiles they created. Private records are excluded from all views, exports, and Claude-powered risk analysis. The HM sees no indication that private records exist on a profile.

---

## 6. Viewing & Editing Records

Records are the core data unit of Soria Health. Each record belongs to one profile and has a type (condition, medication, allergy, surgical history, social history, procedure/test). Records are viewed on the Reports screen and edited from the Record Detail screen.

### 6.1 Viewing Your Own Records

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Reports Tab** | User taps 'Reports' in the bottom nav. Categorised list: Conditions, Medications, Allergies, Surgeries, Tests & Procedures, Social History. |
| 2 | **Category View** | Tapping a category expands it in-line or opens a full-screen list. Each record card shows: name, date, status, and lock icon if private. |
| 3 | **Record Detail** | Tapping a record opens Record Detail showing all fields and any attached documents. |
| 4 | **Empty State** | 'No [conditions] added yet. Tap + to add your first.' with a shortcut CTA. |

### 6.2 Adding a New Record

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Entry Point** | From Reports screen: tap '+' FAB or tap '+' within a category. From Home Dashboard: tap a shortcut card. |
| 2 | **Select Record Type** | From global '+': user selects type from a bottom sheet: Condition / Medication / Allergy / Surgery / Test or Procedure / Social History note. |
| 3 | **Record Form** | Form for the selected type shown. All medical term fields use NLM/RxNorm typeahead. Free text always permitted. |
| 4 | **Save** | User taps 'Save'. Record created. User returned to Reports screen. |
| 5 | **Post-Save** | For surgical history and procedure records: toast — 'Record saved. Tap here to upload documents for this entry.' Tapping opens Document Upload flow ([Section 7](#7-document-uploads)). |

### 6.3 Editing a Record

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Entry Point** | From Record Detail: tap '✏ Edit' or tap '⋯' > 'Edit Record'. |
| 2 | **Edit Form** | Same form as creation, pre-populated with existing data. All fields editable. |
| 3 | **Save Changes** | User taps 'Save Changes'. Record updated. 'Last edited [date]' timestamp added. |
| 4 | **Cancel** | User taps 'Cancel'. No changes saved. User returned to Record Detail. |

### 6.4 Deleting a Record

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Entry Point** | From Record Detail: tap '⋯' > 'Delete Record'. |
| 2 | **Confirmation** | 'Delete this record? This will permanently remove [record name] from your profile and cannot be undone.' Buttons: 'Delete' (red) and 'Cancel'. |
| 3 | **Effect** | Record and all attached documents deleted permanently. Clinical codes removed from the family risk analysis engine. |

### 6.5 Viewing a Family Member's Records

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Family Network** | User taps a connected member's card. |
| 2 | **Member Profile** | Member's Profile screen: name, photo, age, relationship. Tabs: Health Summary, Records, Documents. |
| 3 | **Records Tab** | Shows all records this member has not marked private. Categorised identically to the user's own Reports screen. Private records are not shown and their existence is not indicated. |
| 4 | **Record Detail** | Tapping a record opens Record Detail in **read-only mode**. No edit or delete options are shown for another person's records. |
| 5 | **No Records State** | '[Name] hasn't added any records yet.' No add CTA is shown. |

> 🔐 **ADMIN VIEW** — HM viewing a managed member's profile sees all records with full edit/delete capabilities — the HM is the profile owner. HM viewing a connected member's profile sees only non-private records, same as any other connected user — no elevated access.

---

## 7. Document Uploads

Documents (scans, reports, discharge summaries, lab results, prescriptions) can be attached to any record. Uploads are deferred from the intake form — users enter data first, then attach documents at any time.

| Property | Detail |
|---|---|
| **Supported file types** | PDF, JPG, PNG, HEIC. Max file size: 25MB per document. |
| **Storage** | Encrypted at rest (AES-256). Never shared with third parties. |
| **Privacy** | Documents on private records are also private. Documents on non-private records are visible to connected members in read-only mode. |
| **Limit** | No document count limit per record. |

### 7.1 Uploading a Document

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Entry Point** | From Record Detail: tap 'Documents' tab or '+ Add Document'. Also accessible via post-save toast after creating a surgical/procedure record. |
| 2 | **Upload Method** | Bottom sheet: 'Take a Photo', 'Choose from Camera Roll', 'Upload from Files'. |
| 3 | **Document Preview** | Selected file shown in preview. User can: rotate (photo uploads), add a label (e.g. 'Op report — Jan 2023'), see file size. 'Retake' or 'Choose Again' available. |
| 4 | **Save Document** | User taps 'Save'. Upload begins with a progress bar. On completion: document appears in the record's Documents tab. |
| 5 | **Upload Failure** | Error toast: 'Upload failed. Check your connection and try again.' Document is not saved. User can retry. |

### 7.2 Viewing Documents

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Documents Tab** | From Record Detail > Documents tab. List of all attached documents: thumbnail or PDF icon, label, file size, upload date. |
| 2 | **Open Document** | Tap a document to open it in the full-screen in-app viewer. Pinch-to-zoom. 'Share' button allows sharing via iOS/Android share sheet. |
| 3 | **Connected Member View** | Connected members can view (but not download or delete) documents on non-private records. 'Download' and 'Delete' options are hidden in their view. |

### 7.3 Deleting a Document

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Entry Point** | Documents tab > long-press a document or tap '⋯' > 'Delete Document'. |
| 2 | **Confirmation** | 'Delete this document? This cannot be undone.' Buttons: 'Delete' (red) and 'Cancel'. |
| 3 | **Effect** | Document permanently deleted. Record remains intact. |

> 🔐 **ADMIN VIEW** — HMs can upload, view, and delete documents on managed profiles. For connected profiles, the HM has read-only access to documents on non-private records — same as any other connection. Documents on private records are completely inaccessible.

---

## 8. Alerts & Notifications

Soria Health sends two types of notifications: **system notifications** (connection requests, status changes) and **health alerts** (medication reminders, appointment nudges, family activity, Claude-powered insights). All notifications require opt-in at the OS level and can be managed in Settings > Notifications.

### 8.1 Notification Types

| Type | Description |
|---|---|
| **Connection request** | Sent when someone sends a connection request. Action: opens Connection Request screen. |
| **Connection accepted** | Sent when a request is accepted. Action: opens the new connection's profile. |
| **Connection declined** | Sent when a request is declined. No action. |
| **Disconnection** | Sent when a connected member disconnects. No action. |
| **Age milestone** | Sent to HM when a managed child turns 21. Action: opens prompt to invite child to own account. |
| **Medication reminder** *(Premium)* | Daily push at user-set time: '[Medication name] reminder.' Action: opens medication record. |
| **Appointment reminder** *(Premium)* | Sent before a saved appointment date: 'Appointment tomorrow: [details].' Action: opens appointment record. |
| **Family health activity** | Sent when a connected member adds a new record (if that member has opted in). Both parties must opt in. |
| **Risk insight** *(Premium)* | Claude-powered: 'New health insight for your family.' Action: opens Insights screen. |
| **Profile incomplete** | Sent 24 hours after onboarding if intake form was skipped. Action: opens intake form. |
| **Invite re-send nudge** | Sent after 7 days if a connection request is still pending. Action: opens pending request. |

### 8.2 Notification Settings Flow

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Entry Point** | Settings > Notifications, or prompted during onboarding after consent step. |
| 2 | **OS Permission** | If not yet granted: system prompt for push notification permission shown. Must allow for any push notifications to function. |
| 3 | **Notification Prefs** | Settings screen shows toggles for each category. Master toggle: 'All Notifications'. Turning off master disables all but does not revoke OS permission. |
| 4 | **Medication Reminders** | Sub-screen: user sets time of day per medication. Each medication has its own reminder toggle and time picker. |
| 5 | **Quiet Hours** | User can set quiet hours (e.g. 10pm–7am) during which no health alerts are delivered. System notifications (connection requests) still come through. |

### 8.3 In-App Alert Centre

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Entry Point** | Bell icon in top-right of Home Dashboard. Shows badge count of unread alerts. |
| 2 | **Alert List** | Chronological list of all alerts. Each has: icon, title, brief description, timestamp, and a blue dot if unread. Tap to action. |
| 3 | **Mark as Read** | Tapping an alert marks it as read. 'Mark all as read' button at top. |
| 4 | **Delete Alert** | Swipe left on an alert > 'Delete'. Alert removed from list. Does not affect the underlying record or event. |
| 5 | **Empty State** | 'No notifications yet. We'll let you know when something needs your attention.' |

> 🔐 **ADMIN VIEW** — Household Managers receive additional system notifications: (1) Age milestone notifications for managed children turning 21. (2) Managed profile activity — if a managed member edits their own records, the HM is notified. (3) Connection request status updates for requests sent on behalf of managed members. These HM-specific notifications have their own toggle in Settings > Notifications > Household Manager Alerts.

---

## 9. Household Manager Admin View

The Household Manager (HM) is the account holder who created the household. They have the same data access as any connected member for independently-owned accounts, and full ownership access for managed profiles. The HM view surfaces in specific screens and settings not visible to standard members.

### 9.1 Household Dashboard

The HM sees an additional 'Household' tab on the Home Dashboard providing a summary view of the entire household.

| Step | Screen / State | What the HM Sees / Does |
|---|---|---|
| 1 | **Household Tab** | Card for each profile: name, photo, age, profile type (Active / Managed / Legacy / Pending), and profile completion percentage. |
| 2 | **Profile Completion** | Each card shows a completion ring. Tapping 'Complete Profile' on a managed member's card opens the Intake Form for that member. |
| 3 | **Quick Actions** | 'View Profile', 'Add Record' (managed only), 'Invite to Connect' (managed only — triggers upgrade flow), 'Remove' (managed + legacy only). |
| 4 | **Add Member Button** | '+' button at top right of Household tab. Triggers the Add Family Member flow ([Section 3](#3-adding-family-members)). |

> 🔐 **ADMIN VIEW** — Standard connected members do not see the Household tab. They see only the Family Network tab, which shows cards for all their direct connections. The Household tab is exclusive to the HM role.

### 9.2 Managing a Managed Profile

| Step | Screen / State | What the HM Sees / Does |
|---|---|---|
| 1 | **Entry Point** | Household tab > tap a managed member's card > 'View Profile'. Or Family Network > tap the 'Managed' badge card. |
| 2 | **Managed Profile Screen** | Identical layout to a standard Profile screen but with HM-only controls: 'Edit Details' and '⋯' menu with: 'Invite to Join Soria', 'Transfer Ownership', 'Remove Profile'. |
| 3 | **Edit Details** | HM can edit: name, DOB, biological sex, relationship label, profile photo. |
| 4 | **Records View** | HM sees all non-private records with full edit/delete capabilities. |
| 5 | **Add Record** | '+' FAB is visible and functional. HM can add any record type on behalf of the managed member. |
| 6 | **Documents** | HM can upload, view, and delete documents on managed profiles. |
| 7 | **Invite to Join Soria** | Sends a connection request to the managed member's email. If accepted, profile upgrades from Managed to Connected. HM retains view access as a connected member. |
| 8 | **Remove Profile** | Confirmation dialog (permanent delete warning). On confirm: all records and documents permanently deleted. |

### 9.3 Household Settings

| Step | Screen / State | What the HM Sees / Does |
|---|---|---|
| 1 | **Entry Point** | Settings > Household (visible only to HM). |
| 2 | **Household Name** | HM can set a household name (e.g. 'The Johnson Family'). Shown as a label on the Family Network screen for all connected members. |
| 3 | **Transfer Manager Role** | HM can transfer the Household Manager role to any other adult connected member. The recipient must confirm acceptance. |
| 4 | **Subscription** | HM manages the household subscription tier (Basic / Premium / Unlimited). Shows current plan, billing date, 'Upgrade' / 'Manage Plan' CTAs. |
| 5 | **Data Export** | HM can export all household data (for managed profiles only) as a structured JSON or PDF report. Connected members' data is not included. |
| 6 | **Delete Household** | Permanently deletes all managed profiles and HM account. Connected members' accounts are unaffected. Confirmation requires typing the household name. |

### 9.4 Family Health Insights *(HM + Premium)*

| Step | Screen / State | What the HM Sees / Does |
|---|---|---|
| 1 | **Insights Tab** | Visible to HM (and Premium members) on the Home Dashboard. Shows Claude-powered family health risk insights. |
| 2 | **Risk Summary** | Headline card: 'Your Family Health Summary'. Shows most common conditions, hereditary patterns detected, recommended screenings based on family history. |
| 3 | **Individual Insights** | Each connected member with non-private condition records may appear in a personalised risk card. e.g. 'Based on your family history, [Name] may benefit from a cholesterol screening.' |
| 4 | **Insight Detail** | Full-screen detail view: insight summary, family records that contributed (de-identified if from connected members), a recommended action, and a 'Dismiss' option. |
| 5 | **Privacy Safeguard** | Private records never contribute to insights. Connected members' records shown in de-identified form to the HM (e.g. 'A family member has Type 2 Diabetes' rather than the member's name). Managed profile records shown with the member's name. |

---

## 10. Ask Me — AI Health Assistant

Ask Me is Soria Health's persistent AI health assistant — a floating button accessible from every screen in the app. It gives users and household managers a single conversational interface to query, retrieve, and act on health data across the entire family network, combining real-time access to all Soria profile data with Claude's medical knowledge base and agentic capabilities including AI-powered pharmacy and physician calling.

### 10.1 Feature Overview

Ask Me draws from three data sources simultaneously: the user's own profile data, connected family members' non-private data, managed profile data, and Claude's general medical knowledge base.

| Property | Detail |
|---|---|
| **Entry point** | Floating action button (FAB) — bottom-right corner, present on all screens |
| **Trigger** | Tap FAB → full-screen Ask Me sheet slides up |
| **Input methods** | Text (keyboard) and Voice (tap microphone icon — uses on-device speech-to-text) |
| **Data access scope** | Own profile · Managed profiles (full access) · Connected members' non-private records · Claude medical knowledge base |
| **Agentic capability** | AI can initiate outbound phone calls to pharmacies or physicians to request medication refills |
| **Privacy guardrail** | Private records are never accessible to Ask Me — including on managed profiles |
| **Availability** | All tiers. Agentic pharmacy/physician calling is a **Premium** feature. |

### 10.2 UI & Entry Point

#### 10.2.1 The Floating Button

The Ask Me FAB is always visible and always tappable — it is never hidden by other UI elements.

| Property | Detail |
|---|---|
| **Appearance** | Circular button, 56dp diameter. Teal gradient fill (#6BCFB8 → #4DA896). White microphone + chat bubble icon. Subtle drop shadow. |
| **Position** | Bottom-right, 16dp from right edge, 16dp above the bottom navigation bar. |
| **Tap behaviour** | Full-screen Ask Me sheet slides up from the bottom. Previous screen is dimmed behind it. |
| **Long press** | Opens voice input immediately without showing the text interface first. |
| **Dismiss** | Swipe down on the sheet, or tap '✕' top-right. Conversation history is preserved for the session. |

#### 10.2.2 The Ask Me Screen

| Element | Description |
|---|---|
| **Header** | 'Ask Me' title left-aligned. '✕' dismiss top-right. 'New Conversation' icon clears history. |
| **Conversation area** | Scrollable chat thread. User messages right-aligned (teal bubble). AI responses left-aligned (white card with Soria logo avatar). |
| **Input bar** | Pinned to bottom above keyboard. Placeholder: 'Ask anything about your family's health…'. Microphone icon for voice input. Send button activates when text is present. |
| **Suggested prompts** | On first open: 3 rotating suggested prompts as tappable chips. e.g. 'Who in my family takes a blood thinner?', 'Find my wife's latest lab results', 'Does anyone need a medication refill?' |
| **Source indicators** | Each AI response includes small source tags below it: e.g. `[Emma's Profile]` `[Medical Knowledge]` `[Tom's Records]`. Tapping a source tag deep-links to that record or profile. |
| **Loading state** | Typing indicator (animated dots) while AI is processing. For agentic actions, a real-time status card replaces the typing indicator. |

### 10.3 Query Types & Behaviour

Ask Me handles four categories of query. The AI identifies the category automatically from the user's phrasing. Multiple categories can be combined in a single query.

#### 10.3.1 Query Type Reference

| Query Type | Example Query | What the AI Does |
|---|---|---|
| **Record Lookup** | *"Which one of my kids takes trazodone?"* | Searches all children's medication records (own + managed + connected non-private). Returns name(s), medication, dosage, frequency. Links to each record. |
| **Record Lookup** | *"When was my husband's last check-up?"* | Searches husband's profile for appointments, procedures, and test records sorted by date. Returns most recent entry with date and provider. |
| **Record Lookup** | *"Pull all X-ray scans for my son's soccer injury on his foot"* | Searches son's document uploads filtered by type (image/scan/X-ray), body area (foot/ankle), and context (soccer/sports injury). Returns matching document thumbnails with deep links. |
| **Record Lookup** | *"Find my husband's most recent blood work files"* | Searches husband's documents for lab results / blood work, sorted by date. Returns most recent file with upload date and a 'View' button. |
| **Medication Action** | *"Am I running low or need refills on any medications for anyone in my family?"* | Checks all family members' medication records for supply data. Lists anyone with a refill due or low supply. Offers 'Request Refill' action per medication. |
| **Medical Knowledge** | *"My sister was diagnosed with chronic fatigue — explain it to me"* | Searches Claude's medical knowledge base. Returns a plain-language explanation of CFS/ME: what it is, symptoms, typical treatments, and a note to consult their physician. |
| **Medical Knowledge** | *"What medications interact with metformin?"* | Returns interaction list with severity levels. Offers: 'Check if anyone in my family takes these medications' as a follow-up. |
| **Combined** | *"Does my dad's blood pressure medication interact with anything else he's taking?"* | Retrieves dad's medication list from his profile, then runs a Claude interaction check across all his current medications. Returns a clear interaction summary with any flags. |

#### 10.3.2 Ambiguity Resolution

When a query refers to a family member that could match more than one person in the network, the AI does not guess — it lists all matching members and asks the user to confirm.

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Ambiguous Query** | User asks: 'When was my son's last appointment?' — User has two sons: Liam (managed) and Noah (connected). |
| 2 | **AI Lists Matches** | AI responds: 'I found two sons in your family network. Which one did you mean?' — Liam Johnson (14) and Noah Johnson (19) shown as tappable selection chips. |
| 3 | **User Selects** | User taps 'Liam Johnson'. AI immediately processes the original query for Liam. No re-typing required. |
| 4 | **Result** | AI responds with Liam's most recent appointment record, date, provider, and a source tag `[Liam's Profile]` linking to his record. |

> ℹ️ Ambiguity resolution also triggers for relationship terms like 'my parent' (if both parents are in the network), 'my sibling', or any query where the referred member cannot be uniquely identified.

#### 10.3.3 No Results State

The AI never returns a blank response — it always offers constructive next steps.

| Scenario | AI Response |
|---|---|
| **No matching records** | "I couldn't find any X-ray documents for Liam. Would you like to upload one, or check if it was filed under a different record?" |
| **Member not in network** | "I don't have access to records for a family member by that name. If they're connected to your network, check their privacy settings." |
| **Private record inferred** | "It looks like there may be a record matching your query, but it's been marked private. Private records aren't accessible through Ask Me." |
| **Ambiguous medical term** | "I want to make sure I search for the right thing — did you mean [Term A] or [Term B]?" — shown as selection chips. |

### 10.4 Document Retrieval Flow

Ask Me can search, surface, and display documents attached to any accessible record. Documents on private records are never returned.

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Query** | User asks: 'Pull all X-ray scans for my son's soccer injury on his foot.' |
| 2 | **AI Searches** | AI queries the document index for: member = son(s), document type = image/scan/X-ray, body area = foot/ankle, context tags = soccer/sports/injury. Searches document labels, record names, and extracted metadata. |
| 3 | **Results Returned** | AI responds with a document result card listing matching documents with label, upload date, file type icon, and a [View] button for each. |
| 4 | **View Document** | User taps [View]. Full-screen document viewer opens (pinch-to-zoom, share button). |
| 5 | **No Documents** | 'I didn't find any scan documents for Liam's foot. If you have files to upload, I can take you there.' CTA: 'Upload a document for Liam'. |

> 🔒 **PRIVACY RULE** — Documents attached to private records are never returned by Ask Me. The AI will not acknowledge that these documents exist, even if the query closely describes them.

> 🔐 **ADMIN VIEW** — Household Managers can retrieve documents for all managed profiles through Ask Me. For connected members, only documents on non-private records are accessible — identical to standard profile view permissions.

### 10.5 Medication Refill Flow — AI Calling

When a user asks about medication refills, Ask Me can identify who needs refills and — with the user's explicit confirmation — place an AI-generated phone call to the pharmacy or physician on file. This is a **Premium feature**.

#### 10.5.1 Refill Detection

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Trigger Query** | User asks: 'Am I running low or need refills on any medications for anyone in my family?' or any variant. |
| 2 | **AI Scans Records** | AI checks all accessible medication records across the user's own profile and all family members for: supply remaining (if recorded), days supply field, refill due date, last fill date + typical frequency to infer likely depletion. |
| 3 | **Results Card** | AI returns a 'Refill Status' summary card listing each member, their medication, and refill status. Offers 'Request Refill' action per medication. |
| 4 | **No Supply Data** | If no supply/date data is recorded: AI flags it — 'I don't have supply information for [medication]. You may want to check your bottles or contact your pharmacy directly.' |

#### 10.5.2 Initiating a Pharmacy Call

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **User Confirms Members** | User taps 'Request Refill' next to one or more entries — or taps 'Request All'. |
| 2 | **Pharmacy Check** | AI checks if a pharmacy is on file for each selected member. **Pharmacy on file** → proceeds to Step 3. **No pharmacy on file** → escalates to physician (see [Section 10.5.4](#10.5.4-physician-escalation--no-pharmacy-on-file)). |
| 3 | **Pre-Call Confirmation** | Confirmation card shown with the call script: 'Calling on behalf of [Full Name], date of birth [DOB]. Requesting a refill of [Medication name and dosage]. Please call [callback number] with any questions.' Buttons: 'Confirm' and 'Cancel'. |
| 4 | **Call Initiated** | User taps 'Confirm'. AI voice call placed to the pharmacy on file. Real-time status card appears: '📞 Calling CVS Pharmacy on behalf of Emma… ⏳ Waiting for answer…' |
| 5 | **Call in Progress** | Status updates in real time: '✅ Connected — leaving message…' |
| 6 | **Call Complete** | '✅ Message left at CVS Pharmacy for Emma's Trazodone refill. Call time: 2:34 PM · Duration: 0:42.' Log entry saved to Emma's medication record. |
| 7 | **Call Failed** | '⚠ We couldn't complete the call to CVS Pharmacy. Please try again or call them directly at [number].' Options: 'Retry' or 'Copy pharmacy number'. |

> ⚙️ **AGENTIC ACTION** — The pharmacy call is placed by Soria's AI voice agent using a locked script: *'Calling on behalf of [Full Name], date of birth [DOB]. Requesting a refill of [Medication name and dosage]. Please call [callback number] with any questions.'* The script cannot be edited by the user — this ensures the call remains clearly identified as an automated refill request.

#### 10.5.3 Adding a Pharmacy on File

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Trigger** | Ask Me detects no pharmacy on file during refill flow, or user asks 'Add a pharmacy for Emma'. |
| 2 | **Pharmacy Search** | AI prompts: 'What's the name of Emma's pharmacy?' User types name. AI returns top 3 matching pharmacies as selection chips. |
| 3 | **Manual Entry** | If not found: 'Add manually' option — user enters pharmacy name and phone number. |
| 4 | **Confirm & Save** | Pharmacy saved to the medication record under 'Pharmacy on File'. AI confirms: 'Got it — CVS Pharmacy on Lincoln Blvd has been saved for Emma. Would you like me to call them now?' |

#### 10.5.4 Physician Escalation — No Pharmacy on File

When no pharmacy is on file, Ask Me escalates to a physician rather than stopping. The AI follows this priority order:

1. **Pharmacy on file** → call pharmacy
2. **Prescribing physician** on the medication record → call physician's office
3. **Primary care physician** on the member's profile → call PCP's office
4. **Psychiatrist** on the member's profile → call psychiatrist's office
5. **None found** → prompt user to add a pharmacy or physician

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **No Pharmacy Detected** | AI finds no pharmacy on file. Immediately checks the member's profile for a prescribing physician, then PCP, then psychiatrist. First match is used. |
| 2 | **Escalation Notice** | AI notifies the user before proceeding: 'I don't have a pharmacy on file for Emma. I found her prescribing physician, Dr. Sarah Lee. I'll call Dr. Lee's office to request the refill instead. Shall I proceed?' Buttons: 'Yes, call Dr. Lee's office' and 'Cancel — I'll add a pharmacy first'. |
| 3 | **Pre-Call Confirmation** | Confirmation card shown with adapted physician script: 'Calling on behalf of [Name], date of birth [DOB]. This is a refill request for [Medication]. Please call [callback number] to confirm or with any questions.' |
| 4 | **Call Placed & Logged** | Same real-time call status flow as Section 10.5.2 Steps 4–7. Log entry records call type as 'Physician' rather than 'Pharmacy'. |
| 5 | **No Provider Found** | If no pharmacy, prescribing physician, PCP, or psychiatrist is on file: 'I don't have a pharmacy or physician on file for Emma. Would you like to add one?' CTAs: 'Add a Pharmacy' and 'Add a Physician'. |

| Property | Detail |
|---|---|
| **Callback number** | The account holder's phone number on file. Editable in Settings > Account > Contact Number. |
| **One call per refill** | System prevents duplicate calls for the same medication within a 24-hour window. |
| **Call log** | All calls logged in Settings > Ask Me > Call History with: member, medication, pharmacy/physician, date/time, duration, outcome, call type. |
| **Premium gating** | On Basic tier, the AI identifies refills and shows contact details but the 'Confirm Call' button is replaced with 'Upgrade to Premium'. |

### 10.6 Medical Knowledge Queries

Ask Me connects to Claude's medical knowledge base to answer general health questions — functioning as an intelligent medical search engine. It always contextualises knowledge answers with the user's family data when relevant.

| Step | Screen / State | What the User Sees / Does |
|---|---|---|
| 1 | **Knowledge Query** | User asks: 'My sister was diagnosed with chronic fatigue — explain it to me.' |
| 2 | **AI Identifies Type** | AI detects this is primarily a knowledge query but notes the family context ('my sister'). AI checks if the sister is in the network and has a CFS record. |
| 3 | **Response — No Record** | If sister has no CFS record: AI delivers a plain-language explanation — what it is, symptoms, typical treatment approaches — plus a note: 'I haven't found a CFS record in your sister's profile yet.' CTA: 'Add record for [sister's name]'. |
| 4 | **Response — With Record** | If sister has a CFS record: AI personalises the explanation with her data — 'Based on your sister's profile, she was diagnosed in [year]. Here's what you should know about CFS/ME…' |
| 5 | **Follow-Up Actions** | After any knowledge response, AI offers contextual follow-ups: 'Would you like me to check if this condition has any hereditary risk for your family?', 'Should I look for any documents or records related to this in your network?', 'Would you like information about specialists or treatment options?' |

| Property | Detail |
|---|---|
| **Sourcing** | All medical knowledge responses cite Claude as the source with a disclaimer: 'This information is for general reference only and is not medical advice. Always consult a healthcare professional.' |
| **Interaction checks** | When a knowledge response involves medications, AI automatically offers to cross-reference with the user's family medication records. |
| **Condition linking** | When a knowledge query matches a condition in any family member's profile, AI surfaces the relevant record with a source tag. |
| **Language level** | Plain-language by default. Users can ask 'explain it more technically' or 'simplify this' to adjust. |

### 10.7 Privacy & Data Access Rules for Ask Me

Ask Me enforces the same privacy model as the rest of Soria Health — but because it aggregates data across the network, the rules are especially critical to implement correctly at the AI layer.

| Data Source | What Ask Me Can Access | What Ask Me Cannot Access |
|---|---|---|
| **Own profile** | All records and documents | Records marked private by the user |
| **Managed profiles (HM)** | All non-private records and documents | Records marked private on managed profiles |
| **Connected members** | All non-private records and documents | Records marked private by the connected member |
| **Legacy profiles** | All non-private records and documents (HM only) | Records marked private by the HM |
| **Medical knowledge (Claude)** | Full medical knowledge base | User profile data is never sent externally |

> 🔒 **PRIVACY RULE** — Private records are never returned by Ask Me under any circumstances. The AI will not confirm that a private record exists. If a query strongly implies the existence of a private record, the AI responds: 'It looks like the record you're looking for may be marked private and isn't accessible through Ask Me.'

> 🔒 **PRIVACY RULE** — Personal health data is never sent to Claude's external API in identifiable form. All medical knowledge queries are stripped of personal identifiers before being sent. Profile data queries are resolved entirely within Soria's own data layer.

### 10.8 Conversation History & Sessions

| Property | Detail |
|---|---|
| **Session persistence** | Conversation history is preserved for the current app session. Closing the Ask Me sheet and reopening it continues the same conversation. |
| **Session end** | History clears when the user logs out, or taps 'New Conversation' within Ask Me. |
| **No cloud storage** | Conversation transcripts are not stored server-side. Ask Me conversations are ephemeral. |
| **Context window** | The AI maintains the full conversation context within a session, allowing follow-up questions without re-stating context. |
| **Follow-up awareness** | If the user has already scoped a query to a specific member, subsequent queries assume the same member unless redirected. |
| **Action log** | Agentic actions (pharmacy/physician calls) are logged permanently in Settings > Ask Me > Call History regardless of session state. |

### 10.9 Ask Me Settings

Accessible from Settings > Ask Me.

| Setting | Detail |
|---|---|
| **Voice input** | Toggle on/off. If on: microphone permission required. On-device speech-to-text only — audio is never transmitted. |
| **Suggested prompts** | Toggle to show/hide suggested prompts on Ask Me open. |
| **Pharmacy call settings** | Sub-screen: lists all pharmacies saved across all family profiles. Add, edit, or remove pharmacies. View call history. |
| **Call history** | Chronological log of all calls placed via Ask Me. Shows: member, medication, pharmacy/physician, date/time, duration, outcome, call type (Pharmacy / Physician). |
| **Callback number** | Displays and allows editing of the phone number used in call scripts. Defaults to account phone number. |
| **Data scope** | Toggle: 'Include connected members in Ask Me results.' Default: on. Turning off restricts Ask Me to own profile and managed profiles only. |

### 10.10 Screen & State Inventory

| Screen / State | Description | Access |
|---|---|---|
| Ask Me FAB | Floating button on all screens | All users |
| Ask Me Sheet | Full-screen conversation interface | All users |
| Ask Me — Empty State | First open — suggested prompt chips shown | All users |
| Ask Me — Text Input | Keyboard open, text entry active | All users |
| Ask Me — Voice Input | Microphone active, listening for speech | All users (if enabled) |
| Ask Me — Loading | AI processing query — typing indicator shown | All users |
| Ask Me — Results | AI response with source tags and action buttons | All users |
| Ask Me — Ambiguity Card | Multiple member match — selection chips shown | All users |
| Ask Me — Document Result | Document thumbnails with View buttons | All users |
| Ask Me — Refill Summary | Refill status card with per-member Request Refill buttons | All users |
| Ask Me — Pre-Call Card | Confirmation card showing call script before placing call | **Premium** |
| Ask Me — Call Status | Real-time status card during AI call | **Premium** |
| Ask Me — Call Complete | Call outcome card with log entry | **Premium** |
| Ask Me — Call Failed | Error card with retry / copy number options | **Premium** |
| Ask Me Settings | Settings > Ask Me | All users |
| Pharmacy Management | Settings > Ask Me > Pharmacy Call Settings | **Premium** |
| Call History | Settings > Ask Me > Call History | **Premium** |

---

## 11. Screen Inventory & Navigation

Every named screen in this document is listed below with its navigation path and access level. Screens marked **HM Only** are only visible to the Household Manager.

| Screen Name | Navigation Path | Access |
|---|---|---|
| Splash Screen | App launch (once) | All users |
| Welcome Screen | App launch | All users |
| Sign-Up Method | Welcome > Create Account | New users |
| Log In Method | Welcome > Log In | Returning users |
| Email Verification | Sign-Up > Email path | New users (email) |
| Consent & Privacy | Sign-Up step 5 | New users |
| Your Profile | Onboarding step 6 | New users |
| Your Role | Onboarding step 7 | New users |
| Home Dashboard | Bottom nav — Home | All users |
| **Household Tab** | Home > Household | **HM Only** |
| Family Network | Bottom nav — Family | All users |
| Reports | Bottom nav — Reports | All users |
| Record Detail | Reports > tap record | All users |
| Add / Edit Record Form | Reports > + or Record Detail > Edit | All users |
| Documents Tab | Record Detail > Documents | All users |
| Document Viewer | Documents tab > tap document | All users |
| Profile Screen | Family Network > tap member | All users |
| **Managed Profile Screen** | Household tab > managed card | **HM Only** |
| Health Intake Form | Onboarding step 9 or Profile > Complete | All users |
| Choose Member Type | Family Network > Add Member | All users |
| Connection Request Screen | Notification or Family Network > pending | All users |
| Privacy Review Screen | On accepting a connection request | All users |
| Privacy Overview | Profile > Privacy Overview | All users |
| Alert Centre | Home > Bell icon | All users |
| Notification Settings | Settings > Notifications | All users |
| **Household Settings** | Settings > Household | **HM Only** |
| **Subscription & Billing** | Settings > Household > Subscription | **HM Only** |
| **Data Export** | Settings > Household > Data Export | **HM Only** |
| Insights | Home > Insights tab | HM + Premium |
| Insight Detail | Insights > tap insight card | HM + Premium |
| Ask Me FAB | Persistent on all screens | All users |
| Ask Me Sheet | Tap FAB | All users |
| Ask Me Settings | Settings > Ask Me | All users |
| **Pharmacy Management** | Settings > Ask Me > Pharmacy Call Settings | **Premium** |
| **Call History** | Settings > Ask Me > Call History | **Premium** |

---

## 12. Permission Rules — Quick Reference

Three universal rules apply to every profile, every record, every user:

1. **Everyone can always view their own profile** — no exceptions.
2. **Everyone can always add and edit records on their own profile** — regardless of who created it.
3. **Any record marked private is hidden from everyone — including the Household Manager.** No exceptions.

Beyond these rules, visibility is determined by account type:

| Profile Type | View Own | HM Can View | Add/Edit Own | Private Records |
|---|---|---|---|---|
| **Own account — any user** | Always | N/A — not created by HM | Always | Hidden from all |
| **Managed child (Path 1B)** | Always | Yes — all non-private records | Always | Hidden from all incl. HM |
| **Connected child (Path 1A)** | Always | Only when connected — non-private | Always | Hidden from all |
| **Managed parent / grandparent (Path 2B)** | Always | Yes — all non-private records | Always | Hidden from all incl. HM |
| **Connected adult (Path 2A)** | Always | Only when connected — non-private | Always | Hidden from all |
| **Legacy / post-mortem** | N/A | Yes — HM is the owner | HM only | HM controls sharing |

---

*Soria Health Product Flow & Feature Specification · v2.0*
