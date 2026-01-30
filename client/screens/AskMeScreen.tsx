import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function AskMeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();

  const [inputText, setInputText] = useState("");

  const suggestedQuestions = [
    "What does my blood pressure reading mean?",
    "Are there any hereditary conditions I should watch for?",
    "When should I schedule my next checkup?",
    "Explain my family history of diabetes",
    "I just added a new medication, do any of my medications have known dangerous interactions?",
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.menuButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openDrawer();
            }}
          >
            <Feather name="sidebar" size={20} color={theme.text} />
          </Pressable>
          <Pressable
            style={[styles.menuButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Feather name="sun" size={20} color={theme.text} />
          </Pressable>
        </View>

        <ThemedText type="h2" style={styles.title}>
          Ask Me
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Get answers about your health data, medical history, and wellness insights.
        </ThemedText>
      </View>

      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={[styles.chatContent, styles.emptyChat]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyState}>
          <View style={[styles.aiIcon, { backgroundColor: "#EBF5FF" }]}>
            <Feather name="message-circle" size={32} color="#3B82F6" />
          </View>
          <ThemedText style={styles.emptyTitle}>Start a conversation</ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Ask questions about your health data, medications, test results, or family medical history.
          </ThemedText>

          <View style={[styles.comingSoonBadge, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
            <Feather name="clock" size={14} color="#D97706" />
            <ThemedText style={[styles.comingSoonText, { color: "#92400E" }]}>
              Coming Soon
            </ThemedText>
          </View>

          <ThemedText style={[styles.comingSoonDescription, { color: theme.textTertiary }]}>
            This feature is currently in development. Soon you'll be able to ask questions and get personalized insights based on your health records.
          </ThemedText>

          <View style={styles.suggestions}>
            <ThemedText style={[styles.suggestionsLabel, { color: theme.textSecondary }]}>
              Example questions:
            </ThemedText>
            {suggestedQuestions.map((question, index) => (
              <View
                key={index}
                style={[styles.suggestionItem, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              >
                <Feather name="message-square" size={14} color={theme.textTertiary} />
                <ThemedText style={[styles.suggestionText, { color: theme.textSecondary }]}>
                  {question}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundTertiary, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.textTertiary }]}
            placeholder="Ask about your health..."
            placeholderTextColor={theme.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={false}
          />
          <View
            style={[styles.sendButton, { backgroundColor: theme.backgroundTertiary }]}
          >
            <Feather name="send" size={18} color={theme.textTertiary} />
          </View>
        </View>
        <ThemedText style={[styles.disclaimer, { color: theme.textTertiary }]}>
          This feature is not yet available. Check back soon for updates.
        </ThemedText>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  emptyChat: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  aiIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  comingSoonBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  comingSoonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  comingSoonDescription: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: Spacing.xl,
  },
  suggestions: {
    width: "100%",
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  suggestionText: {
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
  },
  disclaimer: {
    fontSize: 11,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
});
