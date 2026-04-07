import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

export default function ConsentScreen() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [storeHealthData, setStoreHealthData] = useState(false);
  const [familySharing, setFamilySharing] = useState(false);
  const [loading, setLoading] = useState(false);

  const canAgree = storeHealthData && familySharing;

  const handleAgree = async () => {
    if (!storeHealthData || !familySharing || loading) return;
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/consent");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    } catch (err) {
      console.error("Consent error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.shieldIcon, { backgroundColor: theme.link + "15" }]}>
          <Feather name="shield" size={32} color={theme.link} />
        </View>
        <ThemedText type="h2" style={styles.title}>
          Consent & Privacy
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Please review and agree to continue
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        <View style={[styles.section, { borderColor: theme.border }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Data Use Policy
          </ThemedText>
          <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
            Soria Health collects and stores your personal health information to
            provide you with a comprehensive family health management platform.
            Your data is used to:{"\n\n"}
            {"\u2022"} Display your health records, conditions, medications, and
            medical history{"\n"}
            {"\u2022"} Power AI-assisted health insights and recommendations{"\n"}
            {"\u2022"} Enable sharing of health information with family members
            you choose to connect with{"\n"}
            {"\u2022"} Generate health alerts and preventive care reminders{"\n\n"}
            Your data is never sold to third parties. You can export or delete
            your data at any time from Settings.
          </ThemedText>
        </View>

        <View style={[styles.section, { borderColor: theme.border }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            HIPAA Notice
          </ThemedText>
          <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
            Soria Health is designed to help you organize and manage your
            personal and family health information. While we implement strong
            security measures to protect your data, Soria Health is a personal
            health management tool and is not a covered entity under HIPAA.
            {"\n\n"}
            We recommend not storing information in Soria that you would not
            want accessible if our systems were compromised. For highly
            sensitive medical records, consult with your healthcare provider
            about secure storage options.{"\n\n"}
            By using Soria Health, you acknowledge that you are voluntarily
            entering your health information and that you are responsible for
            the accuracy of the data you provide.
          </ThemedText>
        </View>

        <View style={[styles.section, { borderColor: theme.border }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Your Rights
          </ThemedText>
          <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
            {"\u2022"} You can mark any record as private at any time — private
            records are hidden from all family connections{"\n"}
            {"\u2022"} You can disconnect from any family member at any time,
            immediately revoking their access{"\n"}
            {"\u2022"} You can export all your data in JSON format{"\n"}
            {"\u2022"} You can delete your account and all associated data at
            any time{"\n"}
            {"\u2022"} The Household Manager cannot see records you mark as
            private
          </ThemedText>
        </View>

      </ScrollView>

      <View style={styles.checkboxArea}>
        <TouchableOpacity
          style={styles.checkboxRow}
          activeOpacity={0.7}
          onPress={() => setStoreHealthData(!storeHealthData)}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: storeHealthData ? theme.link : theme.border,
                backgroundColor: storeHealthData ? theme.link : "transparent",
              },
            ]}
          >
            {storeHealthData && (
              <Feather name="check" size={14} color="#FFFFFF" />
            )}
          </View>
          <ThemedText style={styles.checkboxLabel}>
            I consent to Soria Health storing my health data
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          activeOpacity={0.7}
          onPress={() => setFamilySharing(!familySharing)}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: familySharing ? theme.link : theme.border,
                backgroundColor: familySharing ? theme.link : "transparent",
              },
            ]}
          >
            {familySharing && (
              <Feather name="check" size={14} color="#FFFFFF" />
            )}
          </View>
          <ThemedText style={styles.checkboxLabel}>
            I consent to sharing health data with family members I connect with
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonArea}>
        <Button onPress={handleAgree} disabled={!canAgree || loading}>
          {loading ? "Processing..." : "Agree & Continue"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  shieldIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  section: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
  },
  checkboxArea: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonArea: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.lg,
  },
});
