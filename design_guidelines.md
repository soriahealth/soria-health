# Family Health Network - Design Guidelines

## Brand Identity

**Purpose**: A trusted companion for families to manage and share health information securely, creating a connected health ecosystem that supports caregiving across generations.

**Aesthetic Direction**: Soft/approachable - This app handles sensitive health data, so the design prioritizes warmth, trust, and clarity. Soft pastels, rounded corners, and gentle gradients create a calming, non-clinical environment. The visual language says "caring" not "medical."

**Memorable Element**: The family tree visualization - an organic, node-based network that visually represents health connections between family members, making abstract permissions tangible and beautiful.

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs + FAB)
- **Home** - Personal health dashboard and quick actions
- **Family** - Family tree network and member profiles
- **FAB (Center)** - Add health record (floating action button with + icon)
- **Reports** - Health history, test results, documents
- **Profile** - Account settings and preferences

**Authentication**: Required (family sharing requires accounts)
- SSO with Apple Sign-In (iOS) and Google Sign-In
- Include privacy policy and data sharing consent during signup
- Profile screen includes: logout, manage permissions, delete account (nested under Settings > Account)

## Screen-by-Screen Specifications

### 1. Home (Dashboard)
- **Purpose**: Quick overview of personal health status and family alerts
- **Header**: Transparent, greeting text ("Good morning, Sarah"), notification bell (right)
- **Layout**: Scrollable with sections:
  - Health Summary Card (medications due, upcoming appointments)
  - Quick Actions (Add Record, Schedule Checkup, View Reports)
  - Family Health Alerts (if any family member has updates)
  - Recent Activity timeline
- **Safe Area**: top: headerHeight + 24px, bottom: tabBarHeight + 24px
- **Empty State**: If no health data, show illustration with "Start your health journey" CTA

### 2. Family Network
- **Purpose**: Visualize and manage family health connections
- **Header**: Transparent, "Family Network" title, add member button (right, person-plus icon)
- **Layout**: Scrollable canvas
  - Interactive family tree visualization (nodes for members, lines showing connections)
  - Below tree: Grid of family member cards (avatar, name, relationship, quick health status)
- **Safe Area**: top: headerHeight + 24px, bottom: tabBarHeight + 24px
- **Empty State**: Illustration of connected people, "Invite your first family member" CTA

### 3. Add Health Record (Modal)
- **Purpose**: Quick entry for medications, appointments, test results, conditions
- **Header**: Standard modal header, "Cancel" (left), "Add Record" title, "Save" (right)
- **Layout**: Scrollable form
  - Record type selector (pills: Medication, Appointment, Test Result, Condition, Allergy)
  - Dynamic form fields based on type
  - Photo attachment option
  - Privacy toggle (personal only or share with family)
- **Safe Area**: top: 16px, bottom: insets.bottom + 24px

### 4. Reports
- **Purpose**: Browse and search health records and documents
- **Header**: Transparent, "Health Reports" title, filter icon (right)
- **Layout**: Scrollable list with search bar
  - Search bar (sticky below header)
  - Category filters (All, Medications, Tests, Appointments, Documents)
  - Chronological list of report cards (icon, title, date, source)
- **Safe Area**: top: headerHeight + 24px, bottom: tabBarHeight + 24px
- **Empty State**: Illustration of documents, "No health records yet"

### 5. Report Detail
- **Purpose**: View full health record with attached documents/images
- **Header**: Standard navigation, back button (left), share icon (right)
- **Layout**: Scrollable
  - Report header (type icon, title, date)
  - Key information cards (test values, medication dosage, etc.)
  - Attached documents/images
  - Notes section
  - Shared with (family members who can see this)
- **Safe Area**: top: 16px, bottom: insets.bottom + 24px

### 6. Family Member Profile
- **Purpose**: View a family member's shared health information
- **Header**: Standard navigation, back button (left), edit permissions (right, settings icon)
- **Layout**: Scrollable
  - Profile header (large avatar, name, relationship, age)
  - Shared health summary cards (conditions, medications, allergies)
  - Recent reports list
  - Permissions notice ("Sarah can view your medications and test results")
- **Safe Area**: top: 16px, bottom: insets.bottom + 24px

### 7. Profile & Settings
- **Purpose**: Manage account, privacy, and app preferences
- **Header**: Transparent, "Profile" title, settings icon (right)
- **Layout**: Scrollable sections
  - Profile card (avatar, name, email, edit button)
  - Account settings (notifications, privacy, data sharing)
  - Support (Help Center, Contact Support)
  - Legal (Privacy Policy, Terms, Data Consent)
  - Logout button
- **Safe Area**: top: headerHeight + 24px, bottom: tabBarHeight + 24px

## Color Palette

**Primary Colors**:
- Primary: `#6BCFB8` (Soft mint green - trust, health, growth)
- Primary Light: `#A8E6D7` (backgrounds, subtle accents)
- Primary Dark: `#4DA896` (active states)

**Background Colors**:
- Background: `#F8FAFB` (Soft off-white)
- Surface: `#FFFFFF` (Cards, modals)
- Surface Secondary: `#F0F4F7` (Subtle sections)

**Text Colors**:
- Text Primary: `#2D3748` (Dark slate)
- Text Secondary: `#64748B` (Medium slate)
- Text Tertiary: `#94A3B8` (Light slate)

**Semantic Colors**:
- Success: `#6BCFB8` (uses primary)
- Warning: `#F6AD55` (Warm orange)
- Error: `#FC8181` (Soft coral)
- Info: `#7AB8F5` (Soft blue)

**Family Member Accent Colors** (for avatars/nodes):
- `#A8C5F5`, `#F5C4A8`, `#E8A8F5`, `#F5E8A8`, `#A8F5C5`

## Typography

**Font**: System fonts (SF Pro for iOS, Roboto for Android) for maximum legibility with health data.

**Type Scale**:
- **Title Large**: 32px, Bold - Screen titles
- **Title**: 24px, Semibold - Section headers
- **Heading**: 18px, Semibold - Card titles
- **Body**: 16px, Regular - Primary content
- **Body Small**: 14px, Regular - Secondary info
- **Caption**: 12px, Regular - Timestamps, labels

## Visual Design

**Cards**: 16px border radius, subtle shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8)

**FAB**: 56px diameter circle, primary color, white + icon, shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)

**Avatars**: Circular, soft gradient backgrounds from family accent colors

**Icons**: Feather icon set from @expo/vector-icons (16-24px size)

**Interactive States**: All touchables have 0.7 opacity on press

**Family Tree Nodes**: 60px circles with avatar/initials, connecting lines in primary color at 50% opacity

## Assets to Generate

1. **icon.png** - App icon with family + health cross symbol in mint gradient - *Used: Device home screen*
2. **splash-icon.png** - Same as app icon - *Used: Launch screen*
3. **empty-health.png** - Illustration of clipboard with heart - *Used: Home screen when no health records*
4. **empty-family.png** - Illustration of connected people holding hands - *Used: Family screen when no members*
5. **empty-reports.png** - Illustration of organized documents/folders - *Used: Reports screen when no records*
6. **onboarding-welcome.png** - Illustration of family around health data - *Used: First launch welcome*
7. **avatar-preset-1.png through avatar-preset-6.png** - Diverse family avatars in soft colors - *Used: Profile setup and family member placeholders*
8. **health-success.png** - Checkmark with heart illustration - *Used: After successfully adding health record*

All illustrations should use the soft pastel palette, rounded friendly shapes, and avoid clinical medical imagery.