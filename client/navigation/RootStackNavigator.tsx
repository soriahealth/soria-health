import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useScreenOptions } from "@/hooks/useScreenOptions";
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
import { SidebarModal } from "@/components/SidebarModal";

export type RootStackParamList = {
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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          ...screenOptions,
          headerShown: false,
        }}
      >
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
      </Stack.Navigator>
      <SidebarModal />
    </>
  );
}
