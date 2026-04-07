import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

import DashboardScreen from "@/screens/DashboardScreen";
import FamilyNetworkScreen from "@/screens/FamilyNetworkScreen";
import FamilyHistoryScreen from "@/screens/FamilyHistoryScreen";
import ChildrenRecordsScreen from "@/screens/ChildrenRecordsScreen";
import AlertsScreen from "@/screens/AlertsScreen";
import WellnessScreen from "@/screens/WellnessScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import ConnectedDevicesScreen from "@/screens/ConnectedDevicesScreen";
import NewPatientFormScreen from "@/screens/NewPatientFormScreen";
import DoctorPortalScreen from "@/screens/DoctorPortalScreen";
import BasicInformationScreen from "@/screens/BasicInformationScreen";
import AskMeScreen from "@/screens/AskMeScreen";
import HealthIntakeScreen from "@/screens/HealthIntakeScreen";
import ReportsScreen from "@/screens/ReportsScreen";
import RecordDetailScreen from "@/screens/RecordDetailScreen";
import RecordFormScreen from "@/screens/RecordFormScreen";
import DocumentsScreen from "@/screens/DocumentsScreen";
import DocumentDetailScreen from "@/screens/DocumentDetailScreen";
import AddFamilyMemberScreen from "@/screens/AddFamilyMemberScreen";
import FamilyMemberIntakeScreen from "@/screens/FamilyMemberIntakeScreen";
import SendConnectionScreen from "@/screens/SendConnectionScreen";
import ConnectionRequestsScreen from "@/screens/ConnectionRequestsScreen";
import PrivacyReviewScreen from "@/screens/PrivacyReviewScreen";
import SharingSettingsScreen from "@/screens/SharingSettingsScreen";
import HouseholdDashboardScreen from "@/screens/HouseholdDashboardScreen";
import EditManagedProfileScreen from "@/screens/EditManagedProfileScreen";
import HouseholdSettingsScreen from "@/screens/HouseholdSettingsScreen";
import ManagedProfileRecordsScreen from "@/screens/ManagedProfileRecordsScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import FamilyInsightsScreen from "@/screens/FamilyInsightsScreen";
import SubscriptionScreen from "@/screens/SubscriptionScreen";
import CallScreen from "@/screens/CallScreen";
import CallHistoryScreen from "@/screens/CallHistoryScreen";
import PhysiciansScreen from "@/screens/PhysiciansScreen";
import AddPhysicianScreen from "@/screens/AddPhysicianScreen";
import RefillsScreen from "@/screens/RefillsScreen";
import AddPharmacyScreen from "@/screens/AddPharmacyScreen";
import RefillConfirmScreen from "@/screens/RefillConfirmScreen";
import WelcomeScreen from "@/screens/WelcomeScreen";
import SignUpScreen from "@/screens/SignUpScreen";
import LoginScreen from "@/screens/LoginScreen";
import ForgotPasswordScreen from "@/screens/ForgotPasswordScreen";
import ConsentScreen from "@/screens/ConsentScreen";
import ProfileSetupScreen from "@/screens/ProfileSetupScreen";
import RoleSelectionScreen from "@/screens/RoleSelectionScreen";
import EmailVerificationScreen from "@/screens/EmailVerificationScreen";
import ChangePasswordScreen from "@/screens/ChangePasswordScreen";
import PrivacyPolicyScreen from "@/screens/PrivacyPolicyScreen";
import TermsOfServiceScreen from "@/screens/TermsOfServiceScreen";
import { SidebarModal } from "@/components/SidebarModal";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export type RootStackParamList = {
  // Auth screens
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  EmailVerification: undefined;
  Consent: undefined;
  ProfileSetup: undefined;
  RoleSelection: undefined;
  // App screens
  Dashboard: undefined;
  Family: undefined;
  FamilyHistory: undefined;
  ChildrenRecords: undefined;
  Wellness: undefined;
  HealthAlerts: undefined;
  Profile: undefined;
  ConnectedDevices: undefined;
  NewPatientForm: undefined;
  DoctorPortal: undefined;
  BasicInformation: undefined;
  AskMe: undefined;
  HealthIntake: undefined;
  Reports: undefined;
  RecordDetail: { recordType: string; recordId: number };
  RecordForm: { recordType: string; recordId?: number };
  Documents: undefined;
  DocumentDetail: { documentId: number };
  AddFamilyMember: undefined;
  FamilyMemberIntake: { profileId: number; firstName: string; isPostMortem?: boolean };
  SendConnection: undefined;
  ConnectionRequests: undefined;
  PrivacyReview: { requestId: number; fromName: string; relationship: string };
  SharingSettings: { connectedProfileId: number; connectedName: string };
  HouseholdDashboard: undefined;
  EditManagedProfile: { profileId: number };
  HouseholdSettings: undefined;
  ManagedProfileRecords: { profileId: number; firstName: string };
  Settings: undefined;
  FamilyInsights: undefined;
  Subscription: undefined;
  Call: { callId: number };
  CallHistory: undefined;
  Physicians: undefined;
  AddPhysician: { physicianId?: number };
  Refills: undefined;
  AddPharmacy: { pharmacyId?: number };
  RefillConfirm: { refillRequestId: number };
  ChangePassword: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isLoading, isAuthenticated, needsEmailVerification, needsConsent, needsOnboarding, profile, user } = useAuth();
  const { theme } = useTheme();
  useSessionTimeout();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.link} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        screenOptions={{ ...screenOptions, headerShown: false }}
        initialRouteName="Welcome"
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    );
  }

  if (needsEmailVerification) {
    return (
      <Stack.Navigator
        screenOptions={{ ...screenOptions, headerShown: false }}
        initialRouteName="EmailVerification"
      >
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      </Stack.Navigator>
    );
  }

  if (needsConsent) {
    return (
      <Stack.Navigator
        screenOptions={{ ...screenOptions, headerShown: false }}
        initialRouteName="Consent"
      >
        <Stack.Screen name="Consent" component={ConsentScreen} />
      </Stack.Navigator>
    );
  }

  if (needsOnboarding) {
    return (
      <Stack.Navigator
        screenOptions={{ ...screenOptions, headerShown: false }}
        initialRouteName="ProfileSetup"
      >
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      </Stack.Navigator>
    );
  }

  const needsRoleSelection = !profile?.role;

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          ...screenOptions,
          headerShown: false,
        }}
        initialRouteName={needsRoleSelection ? "RoleSelection" : "Dashboard"}
      >
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Family" component={FamilyNetworkScreen} />
        <Stack.Screen name="FamilyHistory" component={FamilyHistoryScreen} />
        <Stack.Screen name="ChildrenRecords" component={ChildrenRecordsScreen} />
        <Stack.Screen name="Wellness" component={WellnessScreen} />
        <Stack.Screen name="HealthAlerts" component={AlertsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ConnectedDevices" component={ConnectedDevicesScreen} />
        <Stack.Screen name="NewPatientForm" component={NewPatientFormScreen} />
        <Stack.Screen name="DoctorPortal" component={DoctorPortalScreen} />
        <Stack.Screen name="BasicInformation" component={BasicInformationScreen} />
        <Stack.Screen name="AskMe" component={AskMeScreen} />
        <Stack.Screen name="HealthIntake" component={HealthIntakeScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="RecordDetail" component={RecordDetailScreen} />
        <Stack.Screen name="RecordForm" component={RecordFormScreen} />
        <Stack.Screen name="Documents" component={DocumentsScreen} />
        <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
        <Stack.Screen name="AddFamilyMember" component={AddFamilyMemberScreen} />
        <Stack.Screen name="FamilyMemberIntake" component={FamilyMemberIntakeScreen} />
        <Stack.Screen name="SendConnection" component={SendConnectionScreen} />
        <Stack.Screen name="ConnectionRequests" component={ConnectionRequestsScreen} />
        <Stack.Screen name="PrivacyReview" component={PrivacyReviewScreen} />
        <Stack.Screen name="SharingSettings" component={SharingSettingsScreen} />
        <Stack.Screen name="HouseholdDashboard" component={HouseholdDashboardScreen} />
        <Stack.Screen name="EditManagedProfile" component={EditManagedProfileScreen} />
        <Stack.Screen name="HouseholdSettings" component={HouseholdSettingsScreen} />
        <Stack.Screen name="ManagedProfileRecords" component={ManagedProfileRecordsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="FamilyInsights" component={FamilyInsightsScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="Call" component={CallScreen} />
        <Stack.Screen name="CallHistory" component={CallHistoryScreen} />
        <Stack.Screen name="Physicians" component={PhysiciansScreen} />
        <Stack.Screen name="AddPhysician" component={AddPhysicianScreen} />
        <Stack.Screen name="Refills" component={RefillsScreen} />
        <Stack.Screen name="AddPharmacy" component={AddPharmacyScreen} />
        <Stack.Screen name="RefillConfirm" component={RefillConfirmScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      </Stack.Navigator>
      <SidebarModal />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
