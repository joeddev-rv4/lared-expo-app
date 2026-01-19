import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import {
  getUserProfile,
  clearUserProfile,
  UserProfile,
  getUserListings,
  UserListing,
} from "@/lib/storage";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
}

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<UserListing[]>([]);
  const [selectedTab, setSelectedTab] = useState("posts");

  const tabs = [
    { key: "posts", icon: "grid", label: "Posts" },
    { key: "reels", icon: "video", label: "Reels" },
    { key: "tagged", icon: "user", label: "Tagged" },
  ];

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    const userProfile = await getUserProfile();
    const userListings = await getUserListings();
    setProfile(userProfile);
    setListings(userListings);
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await clearUserProfile();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      data={listings}
      keyExtractor={(item) => item.id}
      numColumns={3}
      ListHeaderComponent={
        <>
          <View
            style={[styles.content, { paddingTop: headerHeight + Spacing.xl }]}
          >
            <View style={styles.profileHeader}>
              {profile?.avatarUrl ? (
                <Image
                  source={{
                    uri: profile.avatarUrl,
                  }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <ThemedText style={styles.avatarText}>
                    {profile?.name?.charAt(0).toUpperCase() || "G"}
                  </ThemedText>
                </View>
              )}
              <View style={styles.profileInfo}>
                <ThemedText style={styles.name}>
                  {profile?.name || "Guest User"}
                </ThemedText>
                {profile?.bio && (
                  <ThemedText
                    style={[styles.bio, { color: theme.textSecondary }]}
                  >
                    {profile.bio}
                  </ThemedText>
                )}
                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <ThemedText style={styles.statNumber}>
                      {listings.length}
                    </ThemedText>
                    <ThemedText
                      style={[styles.statLabel, { color: theme.textSecondary }]}
                    >
                      Propiedades
                    </ThemedText>
                  </View>
                  <View style={styles.stat}>
                    <ThemedText style={styles.statNumber}>0</ThemedText>
                    <ThemedText
                      style={[styles.statLabel, { color: theme.textSecondary }]}
                    >
                      Vistas
                    </ThemedText>
                  </View>
                  <View style={styles.stat}>
                    <ThemedText style={styles.statNumber}>0</ThemedText>
                    <ThemedText
                      style={[styles.statLabel, { color: theme.textSecondary }]}
                    >
                      Leads
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <Pressable style={styles.editButton}>
                <ThemedText style={styles.editButtonText}>
                  Editar Perfil
                </ThemedText>
              </Pressable>
              <Pressable
                style={styles.shareButton}
                onPress={() =>
                  Share.share({ message: "¡Mira mi perfil en LaRed!" })
                }
              >
                <ThemedText style={styles.shareButtonText}>
                  Compartir Perfil
                </ThemedText>
              </Pressable>
            </View>
            <View style={styles.highlightsContainer}>
              <View style={styles.highlight}>
                <View style={[styles.highlightCircle, { borderColor: Colors.light.error }]}>
                  <Feather name="star" size={24} color={Colors.light.error} />
                </View>
              </View>
              <View style={styles.highlight}>
                <View style={[styles.highlightCircle, { borderColor: Colors.light.error }]}>
                  <Feather name="star" size={24} color={Colors.light.error} />
                </View>
              </View>
              <View style={styles.highlight}>
                <View style={[styles.highlightCircle, { borderColor: Colors.light.error }]}>
                  <Feather name="star" size={24} color={Colors.light.error} />
                </View>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.tabsContainer,
              {
                backgroundColor: theme.backgroundRoot,
                borderTopColor: theme.border,
                borderBottomColor: theme.border,
              },
            ]}
          >
            {tabs.map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setSelectedTab(tab.key)}
                style={styles.tab}
              >
                <Feather
                  name={tab.icon as keyof typeof Feather.glyphMap}
                  size={24}
                  color={
                    selectedTab === tab.key ? theme.text : theme.textSecondary
                  }
                />
              </Pressable>
            ))}
          </View>
        </>
      }
      stickyHeaderIndices={[0]}
      renderItem={({ item }) => (
        <Image
          source={{
            uri: item.imageUrl || "https://via.placeholder.com/300",
          }}
          style={styles.postImage}
        />
      )}
      contentContainerStyle={[
        styles.postsContainer,
        { paddingBottom: tabBarHeight + Spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    position: "relative",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: Spacing.lg,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.error,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
  },
  bio: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 14,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  shareButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  highlightsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  highlight: {
    alignItems: "center",
  },
  highlightCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  tab: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  postsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  postImage: {
    width: Dimensions.get("window").width / 3 - Spacing.sm,
    height: Dimensions.get("window").width / 3 - Spacing.sm,
    margin: Spacing.xs / 2,
  },
  menuSection: {
    marginBottom: Spacing["2xl"],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  menuValue: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    fontSize: 13,
    textAlign: "center",
  },
});
