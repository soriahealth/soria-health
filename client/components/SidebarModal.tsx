import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(280, SCREEN_WIDTH * 0.8);

type ScreenName = "Dashboard" | "Family" | "FamilyHistory" | "ChildrenRecords" | "Wellness" | "HealthAlerts" | "Profile" | "ConnectedDevices" | "NewPatientForm" | "DoctorPortal" | "BasicInformation" | "AskMe" | "Reports" | "HealthIntake" | "Documents" | "HouseholdDashboard" | "Settings" | "FamilyInsights" | "Subscription" | "CallHistory" | "Physicians" | "Refills";

interface DrawerItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
  badge?: number;
}

function DrawerItem({ icon, label, isActive, onPress, badge }: DrawerItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[
        styles.drawerItem,
        {
          backgroundColor: isActive ? theme.backgroundSecondary : "transparent",
        },
      ]}
    >
      <Feather
        name={icon}
        size={20}
        color={isActive ? theme.text : theme.textSecondary}
      />
      <ThemedText
        style={[
          styles.drawerItemLabel,
          {
            color: isActive ? theme.text : theme.textSecondary,
            fontWeight: isActive ? "600" : "400",
          },
        ]}
      >
        {label}
      </ThemedText>
      {badge != null && badge > 0 && (
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>
            {badge > 99 ? "99+" : String(badge)}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

export function SidebarModal() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { isOpen, currentScreen, navigate, closeDrawer } = useDrawer();
  const { logout } = useAuth();

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/alerts/unread-count"],
    enabled: isOpen,
  });
  const unreadCount = unreadData?.count ?? 0;

  const handleLogout = async () => {
    closeDrawer();
    await logout();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent
      onRequestClose={closeDrawer}
    >
      <Pressable style={styles.overlay} onPress={closeDrawer}>
        <Pressable
          style={[
            styles.sidebar,
            {
              width: DRAWER_WIDTH,
              backgroundColor: theme.backgroundRoot,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView
            style={styles.sidebarScroll}
            contentContainerStyle={{
              paddingTop: insets.top + Spacing.lg,
              paddingBottom: insets.bottom + Spacing.lg,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: theme.link }]}>
                <Feather name="activity" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.headerText}>
                <ThemedText type="h4" style={styles.appName}>
                  Soria
                </ThemedText>
                <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
                  Soria Health Hub
                </ThemedText>
              </View>
              <Pressable
                onPress={closeDrawer}
                style={styles.closeButton}
                hitSlop={12}
              >
                <Feather name="x" size={22} color={theme.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: theme.textTertiary }]}>
                Main
              </ThemedText>
              <DrawerItem
                icon="activity"
                label="Dashboard"
                isActive={currentScreen === "Dashboard"}
                onPress={() => navigate("Dashboard")}
              />
              <DrawerItem
                icon="users"
                label="Family"
                isActive={currentScreen === "Family"}
                onPress={() => navigate("Family")}
              />
              <DrawerItem
                icon="home"
                label="Household Manager"
                isActive={currentScreen === "HouseholdDashboard"}
                onPress={() => navigate("HouseholdDashboard")}
              />
              <DrawerItem
                icon="git-branch"
                label="Family History"
                isActive={currentScreen === "FamilyHistory"}
                onPress={() => navigate("FamilyHistory")}
              />
              <DrawerItem
                icon="smile"
                label="Children's Records"
                isActive={currentScreen === "ChildrenRecords"}
                onPress={() => navigate("ChildrenRecords")}
              />
              <DrawerItem
                icon="folder"
                label="Health Records"
                isActive={currentScreen === "Reports"}
                onPress={() => navigate("Reports")}
              />
              <DrawerItem
                icon="zap"
                label="Health Insights"
                isActive={currentScreen === "FamilyInsights"}
                onPress={() => navigate("FamilyInsights")}
              />
              <DrawerItem
                icon="file-text"
                label="Documents"
                isActive={currentScreen === "Documents"}
                onPress={() => navigate("Documents")}
              />
              <DrawerItem
                icon="user-check"
                label="My Physicians"
                isActive={currentScreen === "Physicians"}
                onPress={() => navigate("Physicians")}
              />
              <DrawerItem
                icon="package"
                label="Refills"
                isActive={currentScreen === "Refills"}
                onPress={() => navigate("Refills")}
              />
              <DrawerItem
                icon="heart"
                label="Wellness"
                isActive={currentScreen === "Wellness"}
                onPress={() => navigate("Wellness")}
              />
              <DrawerItem
                icon="bell"
                label="Health Alerts"
                isActive={currentScreen === "HealthAlerts"}
                onPress={() => navigate("HealthAlerts")}
                badge={unreadCount}
              />
            </View>

            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: theme.textTertiary }]}>
                Tools
              </ThemedText>
              <DrawerItem
                icon="file-text"
                label="New Patient Form"
                isActive={currentScreen === "NewPatientForm"}
                onPress={() => navigate("NewPatientForm")}
              />
              <DrawerItem
                icon="briefcase"
                label="Doctor Portal"
                isActive={currentScreen === "DoctorPortal"}
                onPress={() => navigate("DoctorPortal")}
              />
              <DrawerItem
                icon="message-circle"
                label="Ask Me"
                isActive={currentScreen === "AskMe"}
                onPress={() => navigate("AskMe")}
              />
              <DrawerItem
                icon="phone"
                label="Call History"
                isActive={currentScreen === "CallHistory"}
                onPress={() => navigate("CallHistory")}
              />
            </View>

            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: theme.textTertiary }]}>
                Account
              </ThemedText>
              <DrawerItem
                icon="user"
                label="My Profile"
                isActive={currentScreen === "Profile"}
                onPress={() => navigate("Profile")}
              />
              <DrawerItem
                icon="info"
                label="Basic Information"
                isActive={currentScreen === "BasicInformation"}
                onPress={() => navigate("BasicInformation")}
              />
              <DrawerItem
                icon="settings"
                label="Settings"
                isActive={currentScreen === "Settings"}
                onPress={() => navigate("Settings")}
              />
              <DrawerItem
                icon="watch"
                label="Connected Devices"
                isActive={currentScreen === "ConnectedDevices"}
                onPress={() => navigate("ConnectedDevices")}
              />
            </View>

            <View style={styles.section}>
              <DrawerItem
                icon="log-out"
                label="Log Out"
                isActive={false}
                onPress={handleLogout}
              />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "row",
  },
  sidebar: {
    height: "100%",
  },
  sidebarScroll: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    marginBottom: Spacing.md,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  appName: {
    fontSize: 18,
  },
  tagline: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: 2,
    gap: Spacing.md,
  },
  drawerItemLabel: {
    fontSize: 15,
    flex: 1,
  },
  badge: {
    backgroundColor: "#EF4444",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700" as const,
    lineHeight: 14,
  },
});
