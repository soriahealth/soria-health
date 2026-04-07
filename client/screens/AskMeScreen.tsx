import React, { useState, useRef, useCallback } from "react";
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

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AskMeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const abortRef = useRef<AbortController | null>(null);

  const suggestedQuestions = [
    "What medications am I currently taking?",
    "Summarize my health conditions",
    "What should I know about my allergies?",
    "Tell me about my uploaded documents",
  ];

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
      };

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      const updatedMessages = [...messages, userMessage];
      setMessages([...updatedMessages, assistantMessage]);
      setInputText("");
      setIsStreaming(true);
      scrollToBottom();

      const chatMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const response = await fetch(`${getApiUrl()}api/askme/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: chatMessages }),
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || `Request failed with status ${response.status}`,
          );
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (reader) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            // Keep the last (potentially incomplete) line in the buffer
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data: ")) continue;
              const data = trimmed.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.content) {
                  fullContent += parsed.content;
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === "assistant") {
                      updated[updated.length - 1] = {
                        ...last,
                        content: fullContent,
                      };
                    }
                    return updated;
                  });
                  scrollToBottom();
                }
              } catch (e) {
                // Skip unparseable lines (partial JSON, etc.)
                if (e instanceof Error && e.message !== "Something went wrong") {
                  // ignore parse errors
                }
              }
            }
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Ask Me fetch error:", err);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content:
                "Sorry, I wasn't able to respond right now. Please try again.",
            };
          }
          return updated;
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming, scrollToBottom],
  );

  const handleSuggestionPress = (question: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(question);
  };

  const handleSend = () => {
    if (!inputText.trim() || isStreaming) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(inputText);
  };

  const hasMessages = messages.length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.headerRow}>
          <Pressable
            style={[
              styles.menuButton,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openDrawer();
            }}
          >
            <Feather name="sidebar" size={20} color={theme.text} />
          </Pressable>
          <ThemedText type="h4">Ask Me</ThemedText>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Chat area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={[
          styles.chatContent,
          !hasMessages && styles.emptyChat,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          if (hasMessages) scrollToBottom();
        }}
      >
        {!hasMessages ? (
          <View style={styles.emptyState}>
            <View style={[styles.aiIcon, { backgroundColor: "#EBF5FF" }]}>
              <Feather name="cpu" size={32} color="#3B82F6" />
            </View>
            <ThemedText style={styles.emptyTitle}>
              Hi! I'm Soria, your health assistant.
            </ThemedText>
            <ThemedText
              style={[styles.emptySubtitle, { color: theme.textSecondary }]}
            >
              Ask me anything about your health data, medications, conditions, or uploaded documents.
            </ThemedText>

            <View style={styles.suggestions}>
              <ThemedText
                style={[styles.suggestionsLabel, { color: theme.textSecondary }]}
              >
                Try asking:
              </ThemedText>
              {suggestedQuestions.map((question, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.suggestionItem,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => handleSuggestionPress(question)}
                >
                  <Feather
                    name="message-square"
                    size={14}
                    color={theme.textTertiary}
                  />
                  <ThemedText
                    style={[styles.suggestionText, { color: theme.textSecondary }]}
                  >
                    {question}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.role === "user"
                  ? styles.userBubble
                  : [
                      styles.assistantBubble,
                      { backgroundColor: theme.backgroundSecondary },
                    ],
              ]}
            >
              <View style={styles.messageHeader}>
                <View
                  style={[
                    styles.roleIcon,
                    {
                      backgroundColor:
                        msg.role === "user" ? "#3B82F6" : "#10B981",
                    },
                  ]}
                >
                  <Feather
                    name={msg.role === "user" ? "user" : "cpu"}
                    size={12}
                    color="#FFFFFF"
                  />
                </View>
                <ThemedText
                  style={[styles.roleName, { color: theme.textSecondary }]}
                >
                  {msg.role === "user" ? "You" : "Soria"}
                </ThemedText>
              </View>
              {msg.content ? (
                <ThemedText style={styles.messageText}>
                  {msg.content}
                </ThemedText>
              ) : (
                isStreaming &&
                msg.role === "assistant" && (
                  <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color={theme.textTertiary} />
                    <ThemedText
                      style={[
                        styles.typingText,
                        { color: theme.textTertiary },
                      ]}
                    >
                      Thinking...
                    </ThemedText>
                  </View>
                )
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Input bar */}
      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom: insets.bottom + Spacing.md,
            backgroundColor: theme.backgroundRoot,
            borderTopColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.backgroundTertiary,
              borderColor: theme.border,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ask about your health..."
            placeholderTextColor={theme.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isStreaming}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <Pressable
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  inputText.trim() && !isStreaming
                    ? "#3B82F6"
                    : theme.backgroundTertiary,
              },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isStreaming}
          >
            <Feather
              name="send"
              size={18}
              color={
                inputText.trim() && !isStreaming ? "#FFFFFF" : theme.textTertiary
              }
            />
          </Pressable>
        </View>
        <ThemedText style={[styles.disclaimer, { color: theme.textTertiary }]}>
          Soria is an AI assistant, not a doctor. Always consult your healthcare provider for medical decisions.
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
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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
    textAlign: "center",
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
  messageBubble: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  userBubble: {
    backgroundColor: "transparent",
  },
  assistantBubble: {
    borderRadius: BorderRadius.md,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  roleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  roleName: {
    fontSize: 13,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  typingText: {
    fontSize: 14,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
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
