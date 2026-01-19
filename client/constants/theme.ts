import { Platform } from "react-native";

export const Colors = {
  light: {
    primary: "#FF5A5F",
    secondary: "#00A699",
    text: "#484848",
    textSecondary: "#767676",
    buttonText: "#FFFFFF",
    tabIconDefault: "#767676",
    tabIconSelected: "#FF5A5F",
    link: "#FF5A5F",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F7F7F7",
    backgroundSecondary: "#EBEBEB",
    backgroundTertiary: "#E0E0E0",
    border: "#EBEBEB",
    success: "#00A699",
    warning: "#FFB400",
    error: "#C13515",
    cardShadow: "rgba(0, 0, 0, 0.10)",
  },
  dark: {
    primary: "#FF5A5F",
    secondary: "#00A699",
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FF5A5F",
    link: "#FF5A5F",
    backgroundRoot: "#1A1A1A",
    backgroundDefault: "#2A2A2A",
    backgroundSecondary: "#3A3A3A",
    backgroundTertiary: "#4A4A4A",
    border: "#3A3A3A",
    success: "#00A699",
    warning: "#FFB400",
    error: "#C13515",
    cardShadow: "rgba(0, 0, 0, 0.30)",
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
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
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
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 18,
    lineHeight: 24,
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
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
