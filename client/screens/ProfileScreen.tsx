import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getQueryFn, apiRequest, queryClient, getApiUrl } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type HealthSummary = {
  conditions: any[];
  medications: any[];
  allergies: any[];
  surgeries: any[];
  healthMetrics: any[];
  socialHistory: any;
  emergencyContacts: any[];
  insurance: any[];
};

function ProfileField({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={styles.fieldContainer}>
      <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
      <ThemedText style={[styles.fieldValue, { color: theme.text }]}>
        {value || "—"}
      </ThemedText>
    </View>
  );
}

function formatDOB(dob: string | null): string {
  if (!dob) return "—";
  const parts = dob.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dob;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme, toggle, isDark } = useTheme();
  const { openDrawer } = useDrawer();
  const navigation = useNavigation<Nav>();
  const { user, profile } = useAuth();

  const { data: healthData, isLoading: healthLoading } = useQuery<HealthSummary>({
    queryKey: ["/api/health/summary"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const photoMutation = useMutation({
    mutationFn: async (uri: string) => {
      const formData = new FormData();
      formData.append("photo", {
        uri,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any);
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/api/profile/photo`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upload photo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message);
    },
  });

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      photoMutation.mutate(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera access is required to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      photoMutation.mutate(result.assets[0].uri);
    }
  };

  const handlePhotoPress = () => {
    Alert.alert("Profile Photo", "Choose an option", [
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Library", onPress: handlePickPhoto },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const initials = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`
    : "?";

  const bloodType = healthData?.healthMetrics?.find((m: any) => m.type === "blood_type");
  const weight = healthData?.healthMetrics?.find((m: any) => m.type === "weight");
  const height = healthData?.healthMetrics?.find((m: any) => m.type === "height");
  const ec = healthData?.emergencyContacts?.[0];
  const ins = healthData?.insurance?.[0];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openDrawer();
          }}
        >
          <Feather name="menu" size={22} color={theme.text} />
        </Pressable>
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggle();
          }}
        >
          <Feather name={isDark ? "moon" : "sun"} size={20} color={theme.text} />
        </Pressable>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Pressable onPress={handlePhotoPress} style={styles.avatarWrapper}>
          {(profile as any)?.profilePhotoUrl ? (
            <Image
              source={{ uri: `${getApiUrl()}${(profile as any).profilePhotoUrl}` }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.link + "20" }]}>
              <ThemedText style={[styles.avatarText, { color: theme.link }]}>
                {initials}
              </ThemedText>
            </View>
          )}
          <View style={[styles.cameraIcon, { backgroundColor: theme.link }]}>
            <Feather name="camera" size={12} color="#FFFFFF" />
          </View>
        </Pressable>
        <ThemedText type="h3" style={{ marginTop: Spacing.md }}>
          {profile?.firstName} {profile?.lastName}
        </ThemedText>
        <ThemedText style={[styles.emailText, { color: theme.textSecondary }]}>
          {user?.email}
        </ThemedText>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable
          style={[styles.quickAction, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => navigation.navigate("HealthIntake")}
        >
          <Feather name="clipboard" size={20} color={theme.link} />
          <ThemedText style={[styles.quickActionText, { color: theme.text }]}>
            Health Profile
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.quickAction, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => navigation.navigate("Reports")}
        >
          <Feather name="folder" size={20} color={theme.link} />
          <ThemedText style={[styles.quickActionText, { color: theme.text }]}>
            Records
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.quickAction, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => navigation.navigate("Settings" as never)}
        >
          <Feather name="settings" size={20} color={theme.link} />
          <ThemedText style={[styles.quickActionText, { color: theme.text }]}>
            Settings
          </ThemedText>
        </Pressable>
      </View>

      {/* Personal Information */}
      <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Personal Information
        </ThemedText>
        <ProfileField label="Full Name" value={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`} theme={theme} />
        <ProfileField label="Email" value={user?.email ?? ""} theme={theme} />
        <ProfileField label="Date of Birth" value={formatDOB(profile?.dateOfBirth ?? null)} theme={theme} />
        <ProfileField label="Biological Sex" value={profile?.biologicalSex ?? "—"} theme={theme} />
        <ProfileField label="Blood Type" value={bloodType ? bloodType.unit : "—"} theme={theme} />
      </View>

      {/* Vitals */}
      {(weight || height) && (
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Vitals
          </ThemedText>
          {height && <ProfileField label="Height" value={`${height.value} ${height.unit}`} theme={theme} />}
          {weight && <ProfileField label="Weight" value={`${weight.value} ${weight.unit}`} theme={theme} />}
        </View>
      )}

      {/* Emergency Contact */}
      {ec && (
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Emergency Contact
          </ThemedText>
          <ProfileField label="Name" value={ec.name} theme={theme} />
          {ec.relationship && <ProfileField label="Relationship" value={ec.relationship} theme={theme} />}
          {ec.phone && <ProfileField label="Phone" value={ec.phone} theme={theme} />}
          {ec.email && <ProfileField label="Email" value={ec.email} theme={theme} />}
        </View>
      )}

      {/* Insurance */}
      {ins && (
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Insurance
          </ThemedText>
          <ProfileField label="Provider" value={ins.provider} theme={theme} />
          {ins.policyNumber && <ProfileField label="Policy #" value={ins.policyNumber} theme={theme} />}
          {ins.planType && <ProfileField label="Plan Type" value={ins.planType} theme={theme} />}
        </View>
      )}

      {/* Health Summary */}
      <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Health Overview
        </ThemedText>
        {healthLoading ? (
          <ActivityIndicator size="small" color={theme.link} />
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <ThemedText style={[styles.statNumber, { color: theme.link }]}>
                {healthData?.conditions?.length ?? 0}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Conditions
              </ThemedText>
            </View>
            <View style={styles.stat}>
              <ThemedText style={[styles.statNumber, { color: theme.link }]}>
                {healthData?.medications?.length ?? 0}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Medications
              </ThemedText>
            </View>
            <View style={styles.stat}>
              <ThemedText style={[styles.statNumber, { color: theme.link }]}>
                {healthData?.allergies?.length ?? 0}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Allergies
              </ThemedText>
            </View>
            <View style={styles.stat}>
              <ThemedText style={[styles.statNumber, { color: theme.link }]}>
                {healthData?.surgeries?.length ?? 0}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Surgeries
              </ThemedText>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarText: { fontSize: 28, fontWeight: "700" },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  emailText: { fontSize: 14, marginTop: Spacing.xs },
  quickActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  quickActionText: { fontSize: 12, fontWeight: "500" },
  section: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: { marginBottom: Spacing.md },
  fieldContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  fieldLabel: { fontSize: 14 },
  fieldValue: { fontSize: 14, fontWeight: "500" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: { alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 2 },
});
