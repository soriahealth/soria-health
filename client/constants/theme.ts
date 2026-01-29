import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#2D3748",
    textSecondary: "#64748B",
    textTertiary: "#94A3B8",
    buttonText: "#FFFFFF",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#4DA896",
    link: "#4A6FA5",
    primary: "#6BCFB8",
    primaryLight: "#A8E6D7",
    primaryDark: "#4DA896",
    backgroundRoot: "#F8FAFB",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F0F4F7",
    backgroundTertiary: "#E8ECF0",
    success: "#6BCFB8",
    warning: "#F6AD55",
    error: "#FC8181",
    info: "#7AB8F5",
    border: "#E2E8F0",
    cardShadow: "rgba(0, 0, 0, 0.06)",
    accent1: "#A8C5F5",
    accent2: "#F5C4A8",
    accent3: "#E8A8F5",
    accent4: "#F5E8A8",
    accent5: "#A8F5C5",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#A0AEC0",
    textTertiary: "#718096",
    buttonText: "#FFFFFF",
    tabIconDefault: "#718096",
    tabIconSelected: "#6BCFB8",
    link: "#7AB8F5",
    primary: "#6BCFB8",
    primaryLight: "#4DA896",
    primaryDark: "#3D8A7A",
    backgroundRoot: "#1A1D21",
    backgroundDefault: "#242830",
    backgroundSecondary: "#2D323A",
    backgroundTertiary: "#363C46",
    success: "#6BCFB8",
    warning: "#F6AD55",
    error: "#FC8181",
    info: "#7AB8F5",
    border: "#3D4450",
    cardShadow: "rgba(0, 0, 0, 0.3)",
    accent1: "#A8C5F5",
    accent2: "#F5C4A8",
    accent3: "#E8A8F5",
    accent4: "#F5E8A8",
    accent5: "#A8F5C5",
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
