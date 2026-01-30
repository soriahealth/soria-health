import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#3B82F6",
    link: "#3B82F6",
    primary: "#3B82F6",
    primaryLight: "#60A5FA",
    primaryDark: "#2563EB",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    backgroundTertiary: "#F3F4F6",
    success: "#10B981",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    warningBorder: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    border: "#E5E7EB",
    cardShadow: "rgba(0, 0, 0, 0.04)",
    accent1: "#3B82F6",
    accent2: "#10B981",
    accent3: "#8B5CF6",
    accent4: "#F59E0B",
    accent5: "#EC4899",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#D1D5DB",
    textTertiary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#60A5FA",
    link: "#60A5FA",
    primary: "#34D399",
    primaryLight: "#6EE7B7",
    primaryDark: "#10B981",
    backgroundRoot: "#111827",
    backgroundDefault: "#1F2937",
    backgroundSecondary: "#374151",
    backgroundTertiary: "#4B5563",
    success: "#34D399",
    warning: "#FBBF24",
    warningLight: "#78350F",
    warningBorder: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",
    border: "#374151",
    cardShadow: "rgba(0, 0, 0, 0.4)",
    accent1: "#60A5FA",
    accent2: "#34D399",
    accent3: "#A78BFA",
    accent4: "#FBBF24",
    accent5: "#F472B6",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
