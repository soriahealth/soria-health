import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";
import PaywallModal from "@/components/PaywallModal";
import { useSubscription } from "@/hooks/useSubscription";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "RefillConfirm">;

const ROLE_LABELS: Record<string, string> = {
  prescribing: "Prescribing Physician",
  pcp: "Primary Care Physician",
  specialist: "Specialist",
};

const ROLE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  prescribing: "edit-3",
  pcp: "heart",
  specialist: "star",
};

export default function RefillConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { refillRequestId } = route.params;
  const { isPremium } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  // Load the refill request
  const { data: refills = [], isLoading: loadingRefills } = useQuery<any[]>({
    queryKey: ["/api/refills"],
  });
  const refillRequest = refills.find((r: any) => r.id === refillRequestId);

  // Load medication details
  const { data: medications = [] } = useQuery<any[]>({
    queryKey: ["/api/health/medications"],
  });
  const medication = refillRequest
    ? medications.find((m: any) => m.id === refillRequest.medicationId)
    : null;

  // Load pharmacy details
  const { data: pharmacies = [] } = useQuery<any[]>({
    queryKey: ["/api/pharmacies"],
  });
  const pharmacy = refillRequest?.pharmacyId
    ? pharmacies.find((p: any) => p.id === refillRequest.pharmacyId)
    : null;

  // Load escalation chain
  const { data: escalationData, isLoading: loadingChain } = useQuery<any>({
    queryKey: [`/api/medications/${refillRequest?.medicationId}/escalation-chain`],
    enabled: !!refillRequest?.medicationId,
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      // Confirm the refill request
      await apiRequest("PUT", `/api/refills/${refillRequestId}/confirm`);

      // Initiate the call if pharmacy has a phone number
      if (pharmacy?.phone) {
        const callRes = await apiRequest("POST", "/api/calls/initiate", {
          refillRequestId,
          callType: "pharmacy_refill",
          recipientPhone: pharmacy.phone,
          recipientName: pharmacy.name,
          medicationName: medication?.name,
          dosage: medication?.dosage,
          pharmacyName: pharmacy.name,
        });
        return callRes.json();
      }
      return null;
    },
    onSuccess: (callLog) => {
      queryClient.invalidateQueries({ queryKey: ["/api/refills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      if (callLog?.id) {
        navigation.navigate("Call", { callId: callLog.id });
      } else {
        Alert.alert(
          "Refill Confirmed",
          "Your refill has been confirmed. Add a pharmacy phone number to enable automated calling.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    },
    onError: (err: Error) => {
      const msg = err.message || "Failed to confirm refill";
      if (msg.includes("403") || msg.includes("Subscription required")) {
        setShowPaywall(true);
      } else {
        Alert.alert("Error", msg);
      }
    },
  });

  const isLoading = loadingRefills || loadingChain;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText type="h4" style={styles.headerTitle}>
            Confirm Refill
          </ThemedText>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.link} />
        </View>
      </View>
    );
  }

  if (!refillRequest) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText type="h4" style={styles.headerTitle}>
            Confirm Refill
          </ThemedText>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <ThemedText style={{ color: theme.textSecondary }}>
            Refill request not found.
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundRoot, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="h4" style={styles.headerTitle}>
          Confirm Refill
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing["3xl"] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Medication Details */}
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, ...Shadows.card }]}>
          <View style={styles.sectionHeader}>
            <Feather name="clipboard" size={18} color={theme.link} />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Medication
            </ThemedText>
          </View>
          <ThemedText style={[styles.medName, { color: theme.text }]}>
            {medication?.name || "Unknown Medication"}
          </ThemedText>
          {medication?.dosage && (
            <ThemedText style={[styles.medDetail, { color: theme.textSecondary }]}>
              Dosage: {medication.dosage}
            </ThemedText>
          )}
          {medication?.frequency && (
            <ThemedText style={[styles.medDetail, { color: theme.textSecondary }]}>
              Frequency: {medication.frequency}
            </ThemedText>
          )}
        </View>

        {/* Pharmacy Details */}
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, ...Shadows.card }]}>
          <View style={styles.sectionHeader}>
            <Feather name="map-pin" size={18} color={theme.link} />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Pharmacy
            </ThemedText>
          </View>
          {pharmacy ? (
            <>
              <ThemedText style={[styles.pharmacyName, { color: theme.text }]}>
                {pharmacy.name}
              </ThemedText>
              {pharmacy.phone && (
                <View style={styles.contactRow}>
                  <Feather name="phone" size={14} color={theme.textSecondary} />
                  <ThemedText style={[styles.contactText, { color: theme.textSecondary }]}>
                    {pharmacy.phone}
                  </ThemedText>
                </View>
              )}
              {pharmacy.address && (
                <View style={styles.contactRow}>
                  <Feather name="map-pin" size={14} color={theme.textSecondary} />
                  <ThemedText style={[styles.contactText, { color: theme.textSecondary }]}>
                    {pharmacy.address}
                  </ThemedText>
                </View>
              )}
            </>
          ) : (
            <View style={styles.missingRow}>
              <Feather name="alert-circle" size={16} color={theme.warning} />
              <ThemedText style={[styles.missingText, { color: theme.warning }]}>
                No pharmacy assigned. Add one in Manage Pharmacies.
              </ThemedText>
            </View>
          )}
        </View>

        {/* Physician Escalation Chain */}
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, ...Shadows.card }]}>
          <View style={styles.sectionHeader}>
            <Feather name="users" size={18} color={theme.link} />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Physician Escalation Chain
            </ThemedText>
          </View>
          <ThemedText style={[styles.chainDescription, { color: theme.textSecondary }]}>
            The call system will contact physicians in this order:
          </ThemedText>

          {escalationData?.chain && escalationData.chain.length > 0 ? (
            <View style={styles.chainList}>
              {escalationData.chain.map((item: any, idx: number) => (
                <View key={idx} style={styles.chainItem}>
                  <View style={styles.chainStepIndicator}>
                    <View style={[styles.chainNumber, { backgroundColor: theme.link }]}>
                      <ThemedText style={styles.chainNumberText}>
                        {idx + 1}
                      </ThemedText>
                    </View>
                    {idx < escalationData.chain.length - 1 && (
                      <View style={[styles.chainLine, { backgroundColor: theme.border }]} />
                    )}
                  </View>
                  <View style={[styles.chainCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                    <View style={styles.chainCardHeader}>
                      <Feather
                        name={ROLE_ICONS[item.role] || "user"}
                        size={16}
                        color={theme.link}
                      />
                      <ThemedText style={[styles.chainRole, { color: theme.textSecondary }]}>
                        {ROLE_LABELS[item.role] || item.role}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.chainDocName, { color: theme.text }]}>
                      Dr. {item.physician.name}
                    </ThemedText>
                    {item.physician.phone && (
                      <ThemedText style={[styles.chainDocPhone, { color: theme.textSecondary }]}>
                        {item.physician.phone}
                      </ThemedText>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.missingRow}>
              <Feather name="alert-circle" size={16} color={theme.warning} />
              <ThemedText style={[styles.missingText, { color: theme.warning }]}>
                No physicians assigned to this medication.
              </ThemedText>
            </View>
          )}

          {/* Missing roles */}
          {escalationData?.missingRoles && escalationData.missingRoles.length > 0 && (
            <View style={[styles.missingSection, { backgroundColor: theme.warning + "10", borderColor: theme.warning + "30" }]}>
              <ThemedText style={[styles.missingLabel, { color: theme.warning }]}>
                Missing roles:
              </ThemedText>
              {escalationData.missingRoles.map((role: string) => (
                <View key={role} style={styles.missingRoleRow}>
                  <Feather name="alert-triangle" size={14} color={theme.warning} />
                  <ThemedText style={[styles.missingRoleText, { color: theme.warning }]}>
                    {ROLE_LABELS[role] || role}
                  </ThemedText>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => navigation.navigate("Physicians")}
                style={[styles.addPhysicianLink]}
                activeOpacity={0.7}
              >
                <ThemedText style={[styles.addPhysicianLinkText, { color: theme.link }]}>
                  Add physicians to fill these roles
                </ThemedText>
                <Feather name="arrow-right" size={14} color={theme.link} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Confirm button */}
        <Button
          onPress={() => {
            if (!isPremium) {
              setShowPaywall(true);
              return;
            }
            Alert.alert(
              "Confirm Refill Request",
              "This will initiate the refill process. The system will contact the pharmacy and physicians as needed.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Confirm & Call",
                  onPress: () => confirmMutation.mutate(),
                },
              ]
            );
          }}
          disabled={confirmMutation.isPending}
          style={{ marginTop: Spacing.lg }}
        >
          {confirmMutation.isPending ? "Confirming..." : "Confirm & Call"}
        </Button>

        <Button
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ marginTop: Spacing.md }}
        >
          Cancel
        </Button>
      </ScrollView>
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureName="AI Phone Calling"
        requiredTier="premium"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  section: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  medName: {
    fontSize: 18,
    fontWeight: "600",
  },
  medDetail: {
    fontSize: 14,
    marginTop: 4,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: 4,
  },
  contactText: {
    fontSize: 13,
  },
  chainDescription: {
    fontSize: 13,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  chainList: {
    gap: 0,
  },
  chainItem: {
    flexDirection: "row",
    minHeight: 70,
  },
  chainStepIndicator: {
    width: 32,
    alignItems: "center",
  },
  chainNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chainNumberText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  chainLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  chainCard: {
    flex: 1,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.md,
    marginLeft: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chainCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: 4,
  },
  chainRole: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  chainDocName: {
    fontSize: 15,
    fontWeight: "600",
  },
  chainDocPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  missingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  missingText: {
    fontSize: 13,
    flex: 1,
  },
  missingSection: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  missingLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  missingRoleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 4,
  },
  missingRoleText: {
    fontSize: 13,
  },
  addPhysicianLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  addPhysicianLinkText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
