import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Image,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest, getApiUrl, queryClient } from "@/lib/query-client";

interface Document {
  id: number;
  label: string | null;
  description: string | null;
  aiAnalysis: string | null;
  fileType: string | null;
  originalName: string | null;
  storagePath: string;
  createdAt: string;
}

type RouteParams = { documentId: number };

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function DocumentDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { documentId } = route.params;

  const [editingLabel, setEditingLabel] = useState(false);
  const [labelText, setLabelText] = useState("");
  const [analysisExpanded, setAnalysisExpanded] = useState(false);

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const document = documents.find((d) => d.id === documentId);

  const updateLabelMutation = useMutation({
    mutationFn: async (newLabel: string) => {
      await apiRequest("PUT", `/api/documents/${documentId}`, { label: newLabel });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setEditingLabel(false);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update label.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to delete document.");
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate() },
      ],
    );
  };

  const handleStartEditLabel = () => {
    if (document) {
      setLabelText(document.label || "");
      setEditingLabel(true);
    }
  };

  const getFileUrl = (id: number) => `${getApiUrl()}api/documents/${id}/file`;

  const handleSaveLabel = () => {
    const trimmed = labelText.trim();
    if (trimmed && trimmed !== document?.label) {
      updateLabelMutation.mutate(trimmed);
    } else {
      setEditingLabel(false);
    }
  };

  const isImage = document?.fileType?.startsWith("image/");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4">Document Details</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {document ? (
        <>
          {isImage && (
            <Image
              source={{ uri: getFileUrl(document.id) }}
              style={[styles.imagePreview, { backgroundColor: theme.backgroundTertiary }]}
              resizeMode="contain"
            />
          )}

          {!isImage && (
            <View
              style={[
                styles.filePreview,
                { backgroundColor: theme.backgroundTertiary, borderColor: theme.border },
              ]}
            >
              <Feather name="file" size={48} color={theme.textSecondary} />
              <ThemedText style={[styles.fileTypeText, { color: theme.textSecondary }]}>
                {document.fileType || "Document"}
              </ThemedText>
            </View>
          )}

          <View
            style={[
              styles.metadataCard,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <View style={styles.labelRow}>
              {editingLabel ? (
                <View style={styles.editLabelContainer}>
                  <TextInput
                    style={[
                      styles.labelInput,
                      {
                        color: theme.text,
                        borderColor: theme.link,
                        backgroundColor: theme.backgroundRoot,
                      },
                    ]}
                    value={labelText}
                    onChangeText={setLabelText}
                    autoFocus
                    onSubmitEditing={handleSaveLabel}
                    returnKeyType="done"
                  />
                  <Pressable onPress={handleSaveLabel} hitSlop={8} style={styles.saveLabelButton}>
                    <Feather name="check" size={20} color={theme.link} />
                  </Pressable>
                  <Pressable
                    onPress={() => setEditingLabel(false)}
                    hitSlop={8}
                    style={styles.saveLabelButton}
                  >
                    <Feather name="x" size={20} color={theme.textSecondary} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.labelDisplay}>
                  <ThemedText style={styles.labelText} numberOfLines={2}>
                    {document.label || "Uploaded Document"}
                  </ThemedText>
                  <Pressable onPress={handleStartEditLabel} hitSlop={8}>
                    <Feather name="edit-2" size={16} color={theme.link} />
                  </Pressable>
                </View>
              )}
            </View>

            {document.description ? (
              <View style={styles.field}>
                <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  Description
                </ThemedText>
                <ThemedText style={styles.fieldValue}>{document.description}</ThemedText>
              </View>
            ) : null}

            <View style={styles.field}>
              <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Uploaded
              </ThemedText>
              <ThemedText style={styles.fieldValue}>
                {formatDate(document.createdAt)}
              </ThemedText>
            </View>
          </View>

          {document.aiAnalysis ? (
            <View
              style={[
                styles.analysisCard,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <Pressable
                style={styles.analysisHeader}
                onPress={() => setAnalysisExpanded(!analysisExpanded)}
              >
                <View style={styles.analysisHeaderLeft}>
                  <Feather name="cpu" size={18} color={theme.link} />
                  <ThemedText style={styles.analysisTitle}>AI Analysis</ThemedText>
                </View>
                <Feather
                  name={analysisExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
              {analysisExpanded && (
                <ThemedText style={[styles.analysisText, { color: theme.textSecondary }]}>
                  {document.aiAnalysis}
                </ThemedText>
              )}
            </View>
          ) : null}

          <Button
            variant="outline"
            onPress={handleDelete}
            style={styles.deleteButton}
          >
            Delete Document
          </Button>
        </>
      ) : (
        <ThemedText style={[styles.notFound, { color: theme.textSecondary }]}>
          Document not found.
        </ThemedText>
      )}
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
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  imagePreview: {
    width: "100%",
    height: 300,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  filePreview: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  fileTypeText: {
    fontSize: 14,
  },
  metadataCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  labelRow: {
    marginBottom: Spacing.lg,
  },
  labelDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  labelText: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  editLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  labelInput: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  saveLabelButton: {
    padding: Spacing.xs,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  fieldValue: {
    fontSize: 16,
  },
  analysisCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  analysisHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.md,
  },
  deleteButton: {
    marginBottom: Spacing.md,
  },
  notFound: {
    fontSize: 15,
    textAlign: "center",
    marginTop: Spacing["3xl"],
  },
});
