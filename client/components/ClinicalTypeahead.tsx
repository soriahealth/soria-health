import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ClinicalTypeaheadProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelect?: (text: string) => void;
  apiEndpoint: string;
  placeholder?: string;
}

export function ClinicalTypeahead({ label, value, onChangeText, onSelect, apiEndpoint, placeholder }: ClinicalTypeaheadProps) {
  const { theme } = useTheme();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiEndpoint}?terms=${encodeURIComponent(value)}&maxList=7`);
        const data = await res.json();
        // NLM Clinical Tables v3 format: [count, codes, null, displayStringsArrays]
        // data[3] contains arrays of display strings, e.g. [["Diabetes mellitus"], ...]
        // Fall back to data[1] if data[3] is not available
        let results: string[] = [];
        if (Array.isArray(data) && data.length > 3 && Array.isArray(data[3])) {
          results = data[3].map((item: any) => (Array.isArray(item) ? item[0] : item)).filter(Boolean);
        } else if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
          results = data[1].filter((item: any) => typeof item === "string");
        }
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, apiEndpoint]);

  const handleSelect = (item: string) => {
    onChangeText(item);
    onSelect?.(item);
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.label, { color: theme.text }]}>{label}</ThemedText>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (!text) setShowDropdown(false);
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
        />
        {loading && <ActivityIndicator size="small" color={theme.link} style={styles.loadingIndicator} />}
      </View>
      {showDropdown && suggestions.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {suggestions.map((item, index) => (
            <Pressable
              key={`${item}-${index}`}
              style={[styles.suggestionItem, index < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
              onPress={() => handleSelect(item)}
            >
              <ThemedText style={[styles.suggestionText, { color: theme.text }]} numberOfLines={1}>
                {item}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg, zIndex: 1 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: Spacing.xs },
  inputWrapper: { position: "relative" },
  input: { fontSize: 16, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.xs, borderWidth: 1 },
  loadingIndicator: { position: "absolute", right: Spacing.md, top: "50%", marginTop: -8 },
  dropdown: { borderWidth: 1, borderTopWidth: 0, borderBottomLeftRadius: BorderRadius.xs, borderBottomRightRadius: BorderRadius.xs, maxHeight: 250, overflow: "hidden" },
  suggestionItem: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  suggestionText: { fontSize: 15 },
});
