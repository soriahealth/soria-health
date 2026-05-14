import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { FormField } from "@/components/FormField";
import Button from "@/components/Button";
import { KeyboardSafeView } from "@/components/KeyboardSafeView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const RELATIONSHIPS = ["Child", "Parent", "Grandparent", "Spouse", "Sibling", "Other"];

export default function SendConnectionScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();

  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/connections/request", {
        email: email.trim().toLowerCase(),
        relationship,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections/outgoing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connections/incoming"] });
      Alert.alert("Request Sent", "Your connection request has been sent successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message || "Failed to send connection request");
    },
  });

  const handleSend = () => {
    if (!email.trim()) {
      Alert.alert("Required", "Please enter the recipient's email address.");
      return;
    }
    if (!relationship) {
      Alert.alert("Required", "Please select a relationship.");
      return;
    }
    sendMutation.mutate();
  };

  return (
    <KeyboardSafeView>
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
          Send Connection Request
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h3" style={styles.heading}>
          Invite Someone to Connect
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Send a connection request to another Soria user by email. Once they accept, you will be able to view each other's non-private health records.
        </ThemedText>

        <FormField
          label="Email Address"
          placeholder="Enter their email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>
            Relationship *
          </ThemedText>
          <View style={styles.chipRow}>
            {RELATIONSHIPS.map((rel) => {
              const selected = relationship === rel;
              return (
                <Pressable
                  key={rel}
                  onPress={() => setRelationship(rel)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.link : theme.backgroundDefault,
                      borderColor: selected ? theme.link : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.chipText,
                      { color: selected ? "#FFFFFF" : theme.text },
                    ]}
                  >
                    {rel}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.link + "10", borderColor: theme.link + "30" }]}>
          <Feather name="info" size={16} color={theme.link} />
          <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
            The recipient will receive your request and can choose to accept or decline. Requests expire after 14 days.
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          onPress={handleSend}
          disabled={sendMutation.isPending}
        >
          {sendMutation.isPending ? "Sending..." : "Send Request"}
        </Button>
      </View>
    </View>
    </KeyboardSafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing.xl,
  },
  heading: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: Spacing["2xl"],
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
  },
});
