import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import {
  healthMetrics,
  familyMembers,
  deceasedFamilyMembers,
  familyConditions,
  preventiveCareTimeline,
} from "@/data/mockData";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function buildHealthContext(): string {
  const metrics = healthMetrics
    .map((m) => `${m.type.replace("_", " ")}: ${m.value}${m.unit ? " " + m.unit : ""}`)
    .join(", ");

  const conditions = familyConditions
    .map((c) => `${c.name} (diagnosed ${c.diagnosedYear}, ${c.status})`)
    .join("; ");

  const family = [...familyMembers, ...deceasedFamilyMembers]
    .map((f) => {
      const conds = f.conditions.map((c) => c.name).join(", ");
      return `${f.relationship}: ${conds || "No conditions"}`;
    })
    .join("; ");

  const preventive = preventiveCareTimeline.map((p) => `${p.name}: ${p.status}`).join("; ");

  return `
Patient Health Summary:
- Current Metrics: ${metrics}
- Medical Conditions: ${conditions || "None"}
- Family Medical History: ${family}
- Preventive Care Status: ${preventive}
`.trim();
}

export default function AskMeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const healthContext = buildHealthContext();
      const apiUrl = new URL("/api/health-chat", getApiUrl());

      const response = await fetch(apiUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          healthContext,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What does my blood pressure reading mean?",
    "Are there any hereditary conditions I should watch for?",
    "When should I schedule my next checkup?",
    "Explain my family history of diabetes",
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
          Get answers about your health data, medical history, and wellness insights powered by AI.
        </ThemedText>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={[
          styles.chatContent,
          messages.length === 0 && styles.emptyChat,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.aiIcon, { backgroundColor: "#EBF5FF" }]}>
              <Feather name="message-circle" size={32} color="#3B82F6" />
            </View>
            <ThemedText style={styles.emptyTitle}>Start a conversation</ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Ask questions about your health data, medications, test results, or family medical history.
            </ThemedText>

            <View style={styles.suggestions}>
              <ThemedText style={[styles.suggestionsLabel, { color: theme.textSecondary }]}>
                Try asking:
              </ThemedText>
              {suggestedQuestions.map((question, index) => (
                <Pressable
                  key={index}
                  style={[styles.suggestionButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setInputText(question);
                  }}
                >
                  <Feather name="message-square" size={14} color={theme.textSecondary} />
                  <ThemedText style={[styles.suggestionText, { color: theme.text }]}>
                    {question}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.role === "user" ? styles.userMessageContainer : styles.assistantMessageContainer,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.role === "user"
                    ? [styles.userBubble, { backgroundColor: "#3B82F6" }]
                    : [styles.assistantBubble, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }],
                ]}
              >
                <ThemedText
                  style={[
                    styles.messageText,
                    message.role === "user" ? styles.userText : { color: theme.text },
                  ]}
                >
                  {message.content}
                </ThemedText>
              </View>
            </View>
          ))
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={[styles.loadingBubble, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
                Analyzing your health data...
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ask about your health..."
            placeholderTextColor={theme.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <Pressable
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? "#3B82F6" : theme.backgroundTertiary },
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Feather name="send" size={18} color={inputText.trim() ? "#FFFFFF" : theme.textTertiary} />
          </Pressable>
        </View>
        <ThemedText style={[styles.disclaimer, { color: theme.textTertiary }]}>
          AI responses are for informational purposes only. Always consult a healthcare professional.
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
  suggestionButton: {
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
  messageContainer: {
    marginBottom: Spacing.md,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  assistantMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
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
