import React from "react";
import { View, StyleSheet, Platform } from "react-native";

import { WebNavbar } from "@/components/WebNavbar";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

const NAVBAR_HEIGHT = 80;

interface WebLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

export function WebLayout({ children, showNavbar = true }: WebLayoutProps) {
  const { theme } = useTheme();

  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {showNavbar && <WebNavbar />}
      <View style={[styles.content, showNavbar && styles.contentWithNavbar]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentWithNavbar: {
    paddingTop: NAVBAR_HEIGHT + Spacing.lg,
  },
});
