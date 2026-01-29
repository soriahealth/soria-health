import React from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TabFilterProps {
  tabs: { key: string; label: string; count?: number }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function TabFilter({ tabs, activeTab, onTabChange }: TabFilterProps) {
  const { theme } = useTheme();

  const handlePress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(key);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            onPress={() => handlePress(tab.key)}
            style={[
              styles.tab,
              {
                borderBottomColor: isActive ? theme.text : "transparent",
              },
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                {
                  color: isActive ? theme.text : theme.textSecondary,
                  fontWeight: isActive ? "600" : "400",
                },
              ]}
            >
              {tab.label}
              {tab.count !== undefined ? ` (${tab.count})` : ""}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  tab: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 15,
  },
});
