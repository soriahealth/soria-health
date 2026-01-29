# Family Health Network

## Overview
A family health data management mobile application built with Expo React Native and Express.js. The app allows users to store their health information and share it with family members, creating a connected family health network.

## Current State
The app is in MVP state with the following features implemented:
- Health Dashboard with personal health metrics
- Family Network for viewing connected family members
- Family Medical History with hereditary conditions tracking
- Children's Health Records management
- Health Alerts with personalized recommendations (dedicated screen)
- Wellness Center with workout plans
- User Profile with settings
- **Sidebar Navigation** - Custom drawer-style navigation accessible from hamburger menu on each screen

## Project Architecture

### Frontend (Expo React Native)
- `/client` - Main client directory
  - `/components` - Reusable UI components
    - `MetricCard.tsx` - Health metric display cards
    - `AlertCard.tsx` - Health alert cards
    - `FamilyMemberCard.tsx` - Family member display
    - `ChildCard.tsx` - Child selector chips
    - `PreventiveCareCard.tsx` - Preventive care timeline items
    - `GrandparentCard.tsx` - Grandparent health history
    - `ConditionTag.tsx` - Condition badge tags
    - `SectionHeader.tsx` - Section headers with actions
    - `InfoCard.tsx` - Information/alert banners
    - `TabFilter.tsx` - Horizontal tab filters
    - `EmptyState.tsx` - Empty state illustrations
    - `FormField.tsx` - Form input fields
    - `SidebarModal.tsx` - Sidebar/drawer navigation modal
  - `/screens` - App screens
    - `DashboardScreen.tsx` - Main health dashboard
    - `FamilyNetworkScreen.tsx` - Family member list
    - `FamilyHistoryScreen.tsx` - Medical history tracking
    - `ChildrenRecordsScreen.tsx` - Children's health records
    - `AlertsScreen.tsx` - Health alerts list (dedicated screen)
    - `WellnessScreen.tsx` - Workout plans and wellness content
    - `ProfileScreen.tsx` - User settings
  - `/navigation` - Navigation structure
    - `RootStackNavigator.tsx` - Main stack navigator with sidebar modal
  - `/context` - React contexts
    - `DrawerContext.tsx` - Sidebar/drawer state management
  - `/types` - TypeScript type definitions
    - `health.ts` - Health-related types
  - `/data` - Mock data for development
    - `mockData.ts` - Sample health data
  - `/constants` - Theme and constants
    - `theme.ts` - Colors, spacing, typography

### Backend (Express.js)
- `/server` - Server directory
  - `index.ts` - Server entry point
  - `routes.ts` - API routes
  - `storage.ts` - Data storage utilities

### Shared
- `/shared/schema.ts` - Shared TypeScript schemas

## Design System
- Primary Color: `#6BCFB8` (Soft mint green)
- Background: `#F8FAFB` (Soft off-white)
- Cards: White with subtle shadows
- Typography: System fonts (SF Pro/Roboto)
- Border Radius: Rounded corners (16px for cards)
- Icons: Feather icons from @expo/vector-icons

## Running the App
- Frontend: `npm run expo:dev` (Port 8081)
- Backend: `npm run server:dev` (Port 5000)

## User Preferences
- Clean, modern healthcare aesthetic
- Soft pastel color palette
- Rounded, friendly UI components
- Clear information hierarchy
- Accessible design patterns
