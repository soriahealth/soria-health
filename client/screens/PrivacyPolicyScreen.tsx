import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();

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
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4">Privacy Policy</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.updated, { color: theme.textTertiary }]}>
          Last updated: March 12, 2026
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>1. Information We Collect</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          Soria Health collects personal information you provide, including your name, email address, date of birth, and health information such as medical conditions, medications, allergies, surgical history, and vital signs. We also collect information about your family members that you choose to add to the platform.
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>2. How We Use Your Information</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          Your information is used to provide personalized health management services, including health record storage, family health insights, AI-powered health analysis, medication refill assistance, and family member connection features.
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>3. Data Sharing</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          Your health data is only shared with family members you explicitly connect with, subject to the sharing preferences you configure. You can mark any record as private to exclude it from sharing. We do not sell your personal data to third parties.
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>4. Data Security</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure session management, and regular security audits.
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>5. Your Rights</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          You have the right to access, export, and delete your data at any time through the Settings screen. You can disconnect from family members, revoke sharing permissions, and delete your account entirely.
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>6. Contact Us</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          If you have questions about this privacy policy, please contact us at privacy@soriahealth.com.
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  updated: {
    fontSize: 13,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
  },
});
