import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import PaywallModal from "@/components/PaywallModal";
import { useSubscription } from "@/hooks/useSubscription";

interface HeredityPattern {
  pattern: string;
  description: string;
  affectedMembers: string[];
}

interface ScreeningRecommendation {
  member: string;
  screening: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

interface IndividualInsight {
  memberName: string;
  insight: string;
  recommendation: string;
}

interface InsightsResponse {
  familySummary: string;
  heredityPatterns: HeredityPattern[];
  screeningRecommendations: ScreeningRecommendation[];
  individualInsights: IndividualInsight[];
  _mock?: boolean;
}

const LOADING_MESSAGES = [
  "Analyzing your family health data...",
  "Identifying hereditary patterns...",
  "Generating screening recommendations...",
];

export default function FamilyInsightsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const { isPremium } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  const {
    mutate: generateInsights,
    data: insights,
    isPending,
    error,
  } = useMutation<InsightsResponse>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/health/insights");
      return res.json();
    },
  });

  const handleGenerate = () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoadingMsg(LOADING_MESSAGES[0]);

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[idx]);
    }, 3000);

    generateInsights(undefined, {
      onSettled: () => clearInterval(interval),
    });
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return theme.error;
      case "medium":
        return theme.warning;
      case "low":
        return theme.success;
      default:
        return theme.textSecondary;
    }
  };

  const priorityBg = (priority: string) => {
    switch (priority) {
      case "high":
        return `${theme.error}18`;
      case "medium":
        return `${theme.warning}18`;
      case "low":
        return `${theme.success}18`;
      default:
        return theme.backgroundSecondary;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.md,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          style={[
            styles.backButton,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Feather name="arrow-left" size={20} color={theme.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <ThemedText type="h3" style={styles.headerTitle}>
            Family Health Insights
          </ThemedText>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Loading state */}
      {isPending && (
        <View style={styles.loadingContainer}>
          <View
            style={[
              styles.loadingCard,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <ActivityIndicator size="large" color={theme.link} />
            <ThemedText style={[styles.loadingText, { color: theme.text }]}>
              {loadingMsg}
            </ThemedText>
            <ThemedText
              style={[styles.loadingSubtext, { color: theme.textSecondary }]}
            >
              This may take a moment
            </ThemedText>
          </View>
        </View>
      )}

      {/* Error state */}
      {error && !isPending && (
        <View
          style={[
            styles.errorCard,
            { backgroundColor: `${theme.error}10`, borderColor: `${theme.error}40` },
          ]}
        >
          <Feather name="alert-circle" size={24} color={theme.error} />
          <ThemedText style={[styles.errorText, { color: theme.error }]}>
            Failed to generate insights. Please try again.
          </ThemedText>
          <Pressable
            style={[styles.retryButton, { backgroundColor: theme.error }]}
            onPress={handleGenerate}
          >
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </Pressable>
        </View>
      )}

      {/* Empty state - before generation */}
      {!insights && !isPending && !error && (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconContainer,
              { backgroundColor: `${theme.link}15` },
            ]}
          >
            <Feather name="zap" size={48} color={theme.link} />
          </View>
          <ThemedText type="h3" style={[styles.emptyTitle, { color: theme.text }]}>
            AI-Powered Health Analysis
          </ThemedText>
          <ThemedText
            style={[styles.emptyDescription, { color: theme.textSecondary }]}
          >
            Soria analyzes your family's health data to identify hereditary
            patterns, shared conditions, and personalized screening
            recommendations. The more health data you and your family members
            add, the more accurate the insights will be.
          </ThemedText>

          <View
            style={[
              styles.featureList,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <View style={styles.featureItem}>
              <Feather name="git-branch" size={18} color={theme.link} />
              <ThemedText style={[styles.featureText, { color: theme.text }]}>
                Hereditary pattern detection
              </ThemedText>
            </View>
            <View style={[styles.featureDivider, { backgroundColor: theme.border }]} />
            <View style={styles.featureItem}>
              <Feather name="shield" size={18} color={theme.link} />
              <ThemedText style={[styles.featureText, { color: theme.text }]}>
                Personalized screening recommendations
              </ThemedText>
            </View>
            <View style={[styles.featureDivider, { backgroundColor: theme.border }]} />
            <View style={styles.featureItem}>
              <Feather name="users" size={18} color={theme.link} />
              <ThemedText style={[styles.featureText, { color: theme.text }]}>
                Cross-family condition analysis
              </ThemedText>
            </View>
            <View style={[styles.featureDivider, { backgroundColor: theme.border }]} />
            <View style={styles.featureItem}>
              <Feather name="lock" size={18} color={theme.link} />
              <ThemedText style={[styles.featureText, { color: theme.text }]}>
                Privacy-safe — private records excluded
              </ThemedText>
            </View>
          </View>

          <Pressable
            style={[styles.generateButton, { backgroundColor: theme.link }]}
            onPress={handleGenerate}
          >
            <Feather name="zap" size={20} color="#FFFFFF" />
            <ThemedText style={styles.generateButtonText}>
              Generate Insights
            </ThemedText>
          </Pressable>
        </View>
      )}

      {/* Results */}
      {insights && !isPending && (
        <View style={styles.resultsContainer}>
          {insights._mock && (
            <View
              style={[
                styles.mockBanner,
                { backgroundColor: theme.warningLight, borderColor: theme.warningBorder },
              ]}
            >
              <Feather name="info" size={16} color={theme.warning} />
              <ThemedText style={[styles.mockText, { color: theme.warning }]}>
                Demo mode — connect an OpenAI key for real analysis
              </ThemedText>
            </View>
          )}

          {/* Family Summary */}
          <View style={styles.sectionHeader}>
            <Feather name="heart" size={18} color={theme.link} />
            <ThemedText type="h3" style={styles.sectionTitle}>
              Family Health Summary
            </ThemedText>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <ThemedText style={[styles.summaryText, { color: theme.text }]}>
              {insights.familySummary}
            </ThemedText>
          </View>

          {/* Hereditary Patterns */}
          {insights.heredityPatterns && insights.heredityPatterns.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Feather name="git-branch" size={18} color={theme.warning} />
                <ThemedText type="h3" style={styles.sectionTitle}>
                  Hereditary Patterns
                </ThemedText>
              </View>
              {insights.heredityPatterns.map((hp, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.patternCard,
                    { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.patternHeader}>
                    <View
                      style={[styles.patternDot, { backgroundColor: theme.warning }]}
                    />
                    <ThemedText style={[styles.patternTitle, { color: theme.text }]}>
                      {hp.pattern}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[styles.patternDescription, { color: theme.textSecondary }]}
                  >
                    {hp.description}
                  </ThemedText>
                  {hp.affectedMembers && hp.affectedMembers.length > 0 && (
                    <View style={styles.affectedRow}>
                      <Feather
                        name="users"
                        size={14}
                        color={theme.textTertiary}
                      />
                      <ThemedText
                        style={[styles.affectedText, { color: theme.textTertiary }]}
                      >
                        {hp.affectedMembers.join(", ")}
                      </ThemedText>
                    </View>
                  )}
                </View>
              ))}
            </>
          )}

          {/* Screening Recommendations */}
          {insights.screeningRecommendations &&
            insights.screeningRecommendations.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Feather name="shield" size={18} color={theme.success} />
                  <ThemedText type="h3" style={styles.sectionTitle}>
                    Screening Recommendations
                  </ThemedText>
                </View>
                {insights.screeningRecommendations.map((sr, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.screeningCard,
                      {
                        backgroundColor: theme.backgroundDefault,
                        borderColor: theme.border,
                        borderLeftColor: priorityColor(sr.priority),
                        borderLeftWidth: 4,
                      },
                    ]}
                  >
                    <View style={styles.screeningHeader}>
                      <ThemedText
                        style={[styles.screeningTitle, { color: theme.text }]}
                      >
                        {sr.screening}
                      </ThemedText>
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: priorityBg(sr.priority) },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.priorityText,
                            { color: priorityColor(sr.priority) },
                          ]}
                        >
                          {sr.priority}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText
                      style={[styles.screeningMember, { color: theme.link }]}
                    >
                      For: {sr.member}
                    </ThemedText>
                    <ThemedText
                      style={[styles.screeningReason, { color: theme.textSecondary }]}
                    >
                      {sr.reason}
                    </ThemedText>
                  </View>
                ))}
              </>
            )}

          {/* Individual Insights */}
          {insights.individualInsights &&
            insights.individualInsights.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Feather name="user" size={18} color={theme.link} />
                  <ThemedText type="h3" style={styles.sectionTitle}>
                    Individual Insights
                  </ThemedText>
                </View>
                {insights.individualInsights.map((ii, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.insightCard,
                      { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                    ]}
                  >
                    <View style={styles.insightHeader}>
                      <View
                        style={[
                          styles.insightAvatar,
                          { backgroundColor: `${theme.link}20` },
                        ]}
                      >
                        <Feather name="user" size={16} color={theme.link} />
                      </View>
                      <ThemedText
                        style={[styles.insightName, { color: theme.text }]}
                      >
                        {ii.memberName}
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[styles.insightText, { color: theme.textSecondary }]}
                    >
                      {ii.insight}
                    </ThemedText>
                    <View
                      style={[
                        styles.recommendationBox,
                        { backgroundColor: `${theme.success}10` },
                      ]}
                    >
                      <Feather
                        name="check-circle"
                        size={14}
                        color={theme.success}
                        style={{ marginTop: 2 }}
                      />
                      <ThemedText
                        style={[styles.recommendationText, { color: theme.text }]}
                      >
                        {ii.recommendation}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </>
            )}

          {/* Re-generate button */}
          <Pressable
            style={[styles.regenerateButton, { borderColor: theme.link }]}
            onPress={handleGenerate}
          >
            <Feather name="refresh-cw" size={18} color={theme.link} />
            <ThemedText style={[styles.regenerateText, { color: theme.link }]}>
              Regenerate Insights
            </ThemedText>
          </Pressable>
        </View>
      )}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureName="Family Health Insights"
        requiredTier="premium"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
  },
  headerSpacer: {
    width: 40,
  },

  // Loading
  loadingContainer: {
    marginTop: Spacing["2xl"],
    alignItems: "center",
  },
  loadingCard: {
    width: "100%",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 14,
    textAlign: "center",
  },

  // Error
  errorCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  featureList: {
    width: "100%",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  featureDivider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    width: "100%",
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Results
  resultsContainer: {
    gap: Spacing.sm,
  },
  mockBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  mockText: {
    fontSize: 13,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
  },

  // Summary
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Patterns
  patternCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  patternHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  patternDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  patternTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  patternDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  affectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  affectedText: {
    fontSize: 13,
  },

  // Screening
  screeningCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  screeningHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  screeningTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  screeningMember: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  screeningReason: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Individual Insights
  insightCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  insightAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  insightName: {
    fontSize: 15,
    fontWeight: "600",
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  recommendationBox: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },

  // Regenerate
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  regenerateText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
