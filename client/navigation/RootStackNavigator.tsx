import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import AlertsScreen from "@/screens/AlertsScreen";
import ChildrenRecordsScreen from "@/screens/ChildrenRecordsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  Alerts: undefined;
  ChildrenRecords: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          headerTitle: "Health Alerts",
        }}
      />
      <Stack.Screen
        name="ChildrenRecords"
        component={ChildrenRecordsScreen}
        options={{
          headerTitle: "Children's Records",
        }}
      />
    </Stack.Navigator>
  );
}
