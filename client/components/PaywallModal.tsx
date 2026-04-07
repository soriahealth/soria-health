import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  featureName: string;
  requiredTier: "premium" | "unlimited";
}

export default function PaywallModal({
  visible,
  onClose,
  featureName,
  requiredTier,
}: PaywallModalProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const tierLabel = requiredTier === "unlimited" ? "Unlimited" : "Premium";
  const tierColor = requiredTier === "unlimited" ? "#F59E0B" : "#8B5CF6";
  const tierPrice = requiredTier === "unlimited" ? "$19.99/mo" : "$9.99/mo";

  const handleUpgrade = () => {
    onClose();
    navigation.navigate("Subscription");
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={12}
          >
            <Feather name="x" size={22} color={theme.textSecondary} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: tierColor + "20" }]}>
            <Feather name="lock" size={32} color={tierColor} />
          </View>

          {/* Title */}
          <ThemedText type="h3" style={[styles.title, { color: theme.text }]}>
            {tierLabel} Feature
          </ThemedText>

          {/* Description */}
          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            <ThemedText style={{ fontWeight: "600", color: theme.text }}>
              {featureName}
            </ThemedText>{" "}
            requires the {tierLabel} plan ({tierPrice}) to use.
          </ThemedText>

          {/* Upgrade button */}
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: tierColor }]}
            onPress={handleUpgrade}
          >
            <Feather name="arrow-up-circle" size={20} color="#FFFFFF" />
            <ThemedText style={styles.upgradeButtonText}>
              View Plans
            </ThemedText>
          </TouchableOpacity>

          {/* Dismiss */}
          <TouchableOpacity onPress={onClose} style={styles.dismissButton}>
            <ThemedText style={[styles.dismissText, { color: theme.textSecondary }]}>
              Maybe Later
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing["3xl"],
    alignItems: "center",
    borderWidth: 1,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    padding: Spacing.xs,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing["2xl"],
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
    borderRadius: BorderRadius.sm,
    width: "100%",
    minHeight: 48,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dismissButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dismissText: {
    fontSize: 14,
  },
});
