import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function TermsOfServiceScreen() {
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
        <ThemedText type="h4">Terms of Service</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.updated, { color: theme.textTertiary }]}>
          Last updated: March 12, 2026
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>1. Acceptance of Terms</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          By accessing or using Soria Health, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>2. Description of Service</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          Soria Health is a personal health management platform that allows you to store, organize, and share health information with family members. The service includes health record management, AI-powered insights, document storage, and family connection features.
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>3. Medical Disclaimer</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          Soria Health is not a medical provider and does not provide medical advice, diagnosis, or treatment. The AI-powered insights and recommendations are for informational purposes only and should not replace professional medical consultation. Always seek the advice of qualified healthcare providers.
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>4. User Responsibilities</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate health information and to use the service in compliance with all applicable laws.
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>5. Account Termination</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          You may delete your account at any time from the Settings screen. Upon deletion, all your personal data and health records will be permanently removed from our systems.
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>6. Limitation of Liability</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          Soria Health shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount paid by you for the service in the preceding 12 months.
        </ThemedText>

        <ThemedText type="h4" style={styles.sectionTitle}>7. Contact</ThemedText>
        <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
          For questions about these terms, contact us at legal@soriahealth.com.
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
