import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useDrawer } from "@/context/DrawerContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { getApiUrl, queryClient } from "@/lib/query-client";

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const navigation = useNavigation<any>();
  const [uploading, setUploading] = useState(false);

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const uploadFile = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || "photo.jpg",
      } as any);

      const response = await fetch(`${getApiUrl()}api/documents/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Upload failed");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadFile(result.assets[0]);
    }
  };

  const handleChooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Photo library access is needed to choose photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadFile(result.assets[0]);
    }
  };

  const handleChooseFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", {
          uri: asset.uri,
          type: asset.mimeType || "application/pdf",
          name: asset.name || "document.pdf",
        } as any);

        const response = await fetch(`${getApiUrl()}api/documents/upload`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Upload failed");
        }

        queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      } catch (error: any) {
        Alert.alert("Upload Failed", error.message || "Something went wrong.");
      } finally {
        setUploading(false);
      }
    }
  };

  const showActionSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library", "Choose File"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleTakePhoto();
          if (buttonIndex === 2) handleChooseFromLibrary();
          if (buttonIndex === 3) handleChooseFile();
        },
      );
    } else {
      Alert.alert("Upload Document", "Choose an option", [
        { text: "Take Photo", onPress: handleTakePhoto },
        { text: "Choose from Library", onPress: handleChooseFromLibrary },
        { text: "Choose File", onPress: handleChooseFile },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const isImageType = (fileType: string | null) => {
    return fileType?.startsWith("image/");
  };

  const getFileUrl = (doc: Document) => {
    return `${getApiUrl()}api/documents/${doc.id}/file`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {uploading && (
        <View style={styles.uploadingOverlay}>
          <View style={[styles.uploadingCard, { backgroundColor: theme.backgroundDefault }]}>
            <ActivityIndicator size="large" color={theme.link} />
            <ThemedText style={[styles.uploadingText, { color: theme.text }]}>
              Uploading & analyzing...
            </ThemedText>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing["5xl"],
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            style={[
              styles.menuButton,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openDrawer();
            }}
          >
            <Feather name="sidebar" size={20} color={theme.text} />
          </Pressable>
        </View>

        <ThemedText type="h2" style={styles.title}>
          Documents
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Upload and manage your health documents.
        </ThemedText>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.link} />
          </View>
        ) : documents.length > 0 ? (
          documents.map((doc) => (
            <Pressable
              key={doc.id}
              style={[
                styles.documentCard,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                Shadows.card,
              ]}
              onPress={() => navigation.navigate("DocumentDetail", { documentId: doc.id })}
            >
              <View style={styles.cardContent}>
                {isImageType(doc.fileType) ? (
                  <Image
                    source={{ uri: getFileUrl(doc) }}
                    style={[styles.thumbnail, { backgroundColor: theme.backgroundTertiary }]}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.thumbnail,
                      styles.fileIconContainer,
                      { backgroundColor: theme.backgroundTertiary },
                    ]}
                  >
                    <Feather name="file" size={24} color={theme.textSecondary} />
                  </View>
                )}
                <View style={styles.cardText}>
                  <ThemedText style={styles.cardLabel} numberOfLines={1}>
                    {doc.label || "Uploaded Document"}
                  </ThemedText>
                  {doc.description ? (
                    <ThemedText
                      style={[styles.cardDescription, { color: theme.textSecondary }]}
                      numberOfLines={2}
                    >
                      {doc.description}
                    </ThemedText>
                  ) : null}
                  <ThemedText style={[styles.cardDate, { color: theme.textTertiary }]}>
                    {formatDate(doc.createdAt)}
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={18} color={theme.textTertiary} />
              </View>
            </Pressable>
          ))
        ) : (
          <View style={[styles.emptyState, { borderColor: theme.border }]}>
            <Feather name="file-text" size={40} color={theme.textTertiary} />
            <ThemedText style={[styles.emptyTitle, { color: theme.textSecondary }]}>
              No documents yet
            </ThemedText>
            <ThemedText style={[styles.emptyMessage, { color: theme.textTertiary }]}>
              Upload your health documents to keep them organized.
            </ThemedText>
            <Button onPress={showActionSheet} style={styles.emptyCta}>
              Upload Document
            </Button>
          </View>
        )}
      </ScrollView>

      <Pressable
        style={[styles.fab, { backgroundColor: theme.link }, Shadows.fab]}
        onPress={showActionSheet}
      >
        <Feather name="camera" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
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
    marginBottom: Spacing.xl,
  },
  loadingContainer: {
    paddingVertical: Spacing["4xl"],
    alignItems: "center",
  },
  documentCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xs,
  },
  fileIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  emptyMessage: {
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyCta: {
    marginTop: Spacing.lg,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadingCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.md,
  },
  uploadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
