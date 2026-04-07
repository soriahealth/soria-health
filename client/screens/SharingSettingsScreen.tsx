import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getQueryFn, apiRequest, queryClient } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Route = RouteProp<RootStackParamList, "SharingSettings">;

type SharingCategory = {
  key: string;
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
};

const CATEGORIES: SharingCategory[] = [
  { key: "shareConditions", label: "Conditions", description: "Diagnoses like hypertension, diabetes", icon: "heart" },
  { key: "shareMedications", label: "Medications", description: "Current prescriptions and dosages", icon: "package" },
  { key: "shareAllergies", label: "Allergies", description: "Drug, food, and environmental allergies", icon: "alert-triangle" },
  { key: "shareSurgeries", label: "Surgeries", description: "Surgical history and procedures", icon: "scissors" },
  { key: "shareMetrics", label: "Health Metrics", description: "Vitals like blood pressure, weight", icon: "activity" },
  { key: "shareSocialHistory", label: "Social History", description: "Smoking, alcohol, exercise, occupation", icon: "coffee" },
  { key: "shareDocuments", label: "Documents", description: "Uploaded medical documents and images", icon: "file-text" },
];

export default function SharingSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { connectedProfileId, connectedName } = route.params;

  const { data: currentPrefs, isLoading } = useQuery<Record<string, boolean>>({
    queryKey: [`/api/sharing/${connectedProfileId}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentPrefs) {
      setPrefs(currentPrefs);
    }
  }, [currentPrefs]);

  const togglePref = (key: string) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setHasChanges(true);
      return updated;
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/sharing/${connectedProfileId}`, prefs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sharing/${connectedProfileId}`] });
      setHasChanges(false);
      Alert.alert("Saved", "Your sharing preferences have been updated.");
      navigation.goBack();
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to save preferences");
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.link} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={[styles.topBarTitle, { color: theme.textSecondary }]}>
          Sharing Settings
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.nameCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.link + "20" }]}>
            <Feather name="user" size={20} color={theme.link} />
          </View>
          <View>
            <ThemedText style={[styles.nameText, { color: theme.text }]}>
              {connectedName}
            </ThemedText>
            <ThemedText style={[styles.nameSubtext, { color: theme.textSecondary }]}>
              Choose what health data they can see
            </ThemedText>
          </View>
        </View>

        <ThemedText style={[styles.note, { color: theme.textTertiary }]}>
          Records individually marked as "Private" will always remain hidden.
        </ThemedText>

        {CATEGORIES.map((cat) => {
          const isOn = prefs[cat.key] ?? true;
          return (
            <Pressable
              key={cat.key}
              style={[
                styles.categoryRow,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: isOn ? theme.link + "40" : theme.border,
                },
              ]}
              onPress={() => togglePref(cat.key)}
            >
              <View style={[styles.catIcon, { backgroundColor: (isOn ? theme.link : theme.textTertiary) + "15" }]}>
                <Feather name={cat.icon} size={18} color={isOn ? theme.link : theme.textTertiary} />
              </View>
              <View style={styles.catInfo}>
                <ThemedText style={[styles.catLabel, { color: theme.text }]}>
                  {cat.label}
                </ThemedText>
                <ThemedText style={[styles.catDescription, { color: theme.textSecondary }]}>
                  {cat.description}
                </ThemedText>
              </View>
              <Switch
                value={isOn}
                onValueChange={() => togglePref(cat.key)}
                trackColor={{ true: theme.link, false: theme.border }}
              />
            </Pressable>
          );
        })}
      </ScrollView>

      {hasChanges && (
        <View style={styles.bottomBar}>
          <Button
            onPress={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  topBarTitle: { fontSize: 14, fontWeight: "500" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  nameCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  nameText: { fontSize: 17, fontWeight: "600" },
  nameSubtext: { fontSize: 13, marginTop: 2 },
  note: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  catInfo: { flex: 1 },
  catLabel: { fontSize: 15, fontWeight: "600" },
  catDescription: { fontSize: 12, marginTop: 2 },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
  },
});
