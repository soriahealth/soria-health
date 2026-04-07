import React, { createContext, useContext, useState, useCallback } from "react";
import { NavigationContainerRef } from "@react-navigation/native";

type DrawerParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  EmailVerification: undefined;
  Consent: undefined;
  ProfileSetup: undefined;
  RoleSelection: undefined;
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
  FamilyMemberIntake: { profileId: number; firstName: string };
  SendConnection: undefined;
  ConnectionRequests: undefined;
  PrivacyReview: { requestId: number; fromName: string; relationship: string };
  SharingSettings: { connectedProfileId: number; connectedName: string };
  HouseholdDashboard: undefined;
  EditManagedProfile: { profileId: number };
  HouseholdSettings: undefined;
  Settings: undefined;
  ManagedProfileRecords: { profileId: number; firstName: string };
  FamilyInsights: undefined;
  Subscription: undefined;
  Call: { callId: number };
  CallHistory: undefined;
  Physicians: undefined;
  AddPhysician: { physicianId?: number };
  Refills: undefined;
  AddPharmacy: { pharmacyId?: number };
  RefillConfirm: { refillRequestId: number };
};

type DrawerContextType = {
  openDrawer: () => void;
  closeDrawer: () => void;
  isOpen: boolean;
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  navigate: (screen: keyof DrawerParamList) => void;
};

const DrawerContext = createContext<DrawerContextType>({
  openDrawer: () => {},
  closeDrawer: () => {},
  isOpen: false,
  currentScreen: "Dashboard",
  setCurrentScreen: () => {},
  navigate: () => {},
});

export function useDrawer() {
  return useContext(DrawerContext);
}

interface DrawerProviderProps {
  children: React.ReactNode;
  navigationRef: React.RefObject<NavigationContainerRef<any> | null>;
}

export function DrawerProvider({ children, navigationRef }: DrawerProviderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("Dashboard");

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const navigate = useCallback((screen: keyof DrawerParamList) => {
    setCurrentScreen(screen);
    if (navigationRef.current) {
      navigationRef.current.navigate(screen as never);
    }
    closeDrawer();
  }, [navigationRef, closeDrawer]);

  return (
    <DrawerContext.Provider
      value={{
        openDrawer,
        closeDrawer,
        isOpen: isDrawerOpen,
        currentScreen,
        setCurrentScreen,
        navigate,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}
