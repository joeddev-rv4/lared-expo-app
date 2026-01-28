import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Image, Dimensions, Share, Platform, Alert } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Property } from "@/data/properties";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";

declare global {
  interface Window {
    ttq?: any;
    TiktokAnalyticsObject?: string;
  }
}

const TikTokIcon = ({ size = 24, color = "#000000" }: { size?: number; color?: string }) => (
  <Ionicons name="logo-tiktok" size={size} color={color} />
);

const initTikTokPixel = () => {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  
  const pixelId = process.env.EXPO_PUBLIC_TIKTOK_PIXEL_ID;
  if (!pixelId || window.ttq) return;

  const w = window as any;
  const d = document;
  const t = "ttq";
  
  w.TiktokAnalyticsObject = t;
  const ttq = w[t] = w[t] || [];
  ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
  ttq.setAndDefer = function(t: any, e: string) {
    t[e] = function() {
      t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  for (let i = 0; i < ttq.methods.length; i++) {
    ttq.setAndDefer(ttq, ttq.methods[i]);
  }
  ttq.instance = function(t: string) {
    const e = ttq._i[t] || [];
    for (let n = 0; n < ttq.methods.length; n++) {
      ttq.setAndDefer(e, ttq.methods[n]);
    }
    return e;
  };
  ttq.load = function(e: string, n?: any) {
    const r = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = ttq._i || {};
    ttq._i[e] = [];
    ttq._i[e]._u = r;
    ttq._t = ttq._t || {};
    ttq._t[e] = +new Date();
    ttq._o = ttq._o || {};
    ttq._o[e] = n || {};
    const script = d.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = r + "?sdkid=" + e + "&lib=" + t;
    const firstScript = d.getElementsByTagName("script")[0];
    firstScript.parentNode?.insertBefore(script, firstScript);
  };
  
  ttq.load(pixelId);
  ttq.page();
};

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
  onSharePress?: () => void;
  showCopyLink?: boolean;
  userId?: string;
  isGuest?: boolean;
  onGuestAction?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const IMAGE_HEIGHT = 200;
const isWeb = Platform.OS === "web";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PropertyCard({
  property,
  isFavorite,
  onPress,
  onFavoritePress,
  onSharePress,
  showCopyLink = false,
  userId,
  isGuest = false,
  onGuestAction,
}: PropertyCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);
  const shareScale = useSharedValue(1);
  const copyScale = useSharedValue(1);
  const tiktokScale = useSharedValue(1);

  useEffect(() => {
    if (isWeb) {
      initTikTokPixel();
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const shareAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareScale.value }],
  }));

  const copyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: copyScale.value }],
  }));

  const tiktokAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tiktokScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handleFavoritePress = () => {
    heartScale.value = withSpring(1.3, { damping: 10 });
    setTimeout(() => {
      heartScale.value = withSpring(1, { damping: 10 });
    }, 100);
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (isGuest) {
      if (onGuestAction) {
        onGuestAction();
      } else {
        Alert.alert(
          "Acción no disponible",
          "Debes crear una cuenta para guardar propiedades en favoritos.",
          [{ text: "Entendido" }]
        );
      }
      return;
    }
    
    onFavoritePress();
  };

  const handleSharePress = async () => {
    shareScale.value = withSpring(1.3, { damping: 10 });
    setTimeout(() => {
      shareScale.value = withSpring(1, { damping: 10 });
    }, 100);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const priceFormatted = `Q${property.price.toLocaleString()}`;
      const message = `${property.title}\n\n${property.location}\n${priceFormatted}\n${property.area} m²\n\n${property.description}\n\nLa Red Inmobiliaria - Hecha por vendedores, para vendedores`;

      await Share.share({
        message,
        title: property.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }

    onSharePress?.();
  };

  const handleCopyLink = async () => {
    copyScale.value = withSpring(1.1, { damping: 10 });
    setTimeout(() => {
      copyScale.value = withSpring(1, { damping: 10 });
    }, 100);
    
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isGuest) {
      if (onGuestAction) {
        onGuestAction();
      } else {
        Alert.alert(
          "Acción no disponible",
          "Debes crear una cuenta para compartir enlaces de propiedades.",
          [{ text: "Entendido" }]
        );
      }
      return;
    }

    if (!userId) {
      Alert.alert("Error", "No se pudo obtener el ID del usuario.");
      return;
    }

    let baseUrl = "";
    if (isWeb && typeof window !== "undefined" && window.location) {
      baseUrl = window.location.origin;
    } else {
      const domain = process.env.EXPO_PUBLIC_DOMAIN || "";
      baseUrl = domain ? `https://${domain.replace(':5000', '')}` : "";
    }
    const blogUrl = `${baseUrl}/blog/${userId}/${property.id}`;

    try {
      await Clipboard.setStringAsync(blogUrl);
      Alert.alert("Enlace copiado", "El enlace ha sido copiado al portapapeles.");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("Error", "No se pudo copiar el enlace.");
    }
  };

  const handleTikTokShare = async () => {
    tiktokScale.value = withSpring(1.3, { damping: 10 });
    setTimeout(() => {
      tiktokScale.value = withSpring(1, { damping: 10 });
    }, 100);
    
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isGuest) {
      if (onGuestAction) {
        onGuestAction();
      } else {
        Alert.alert(
          "Accion no disponible",
          "Debes crear una cuenta para compartir propiedades en TikTok.",
          [{ text: "Entendido" }]
        );
      }
      return;
    }

    const pixelId = process.env.EXPO_PUBLIC_TIKTOK_PIXEL_ID;
    if (isWeb && typeof window !== "undefined" && window.ttq && pixelId) {
      window.ttq.track("Share", {
        content_type: "property",
        content_id: property.id,
        content_name: property.title,
        value: property.price,
        currency: "GTQ",
      });
    }

    let baseUrl = "";
    if (isWeb && typeof window !== "undefined" && window.location) {
      baseUrl = window.location.origin;
    } else {
      const domain = process.env.EXPO_PUBLIC_DOMAIN || "";
      baseUrl = domain ? `https://${domain.replace(':5000', '')}` : "";
    }
    
    const propertyUrl = userId 
      ? `${baseUrl}/blog/${userId}/${property.id}`
      : `${baseUrl}/property/${property.id}`;
    
    const priceFormatted = `Q${property.price.toLocaleString()}`;
    const shareText = `${property.title} - ${priceFormatted} - ${property.location}\n\nLa Red Inmobiliaria\n${propertyUrl}`;
    
    try {
      await Clipboard.setStringAsync(shareText);
      
      if (isWeb && typeof window !== "undefined") {
        Alert.alert(
          "Texto copiado",
          "El texto de la propiedad fue copiado. Ahora puedes pegarlo en TikTok.",
          [
            {
              text: "Abrir TikTok",
              onPress: () => window.open("https://www.tiktok.com", "_blank"),
            },
            { text: "Cerrar" },
          ]
        );
      } else {
        const tiktokAppUrl = "snssdk1233://";
        const canOpen = await Linking.canOpenURL(tiktokAppUrl);
        
        if (canOpen) {
          Alert.alert(
            "Texto copiado",
            "El texto fue copiado al portapapeles. Pega el contenido en tu video de TikTok.",
            [
              {
                text: "Abrir TikTok",
                onPress: () => Linking.openURL(tiktokAppUrl),
              },
              { text: "Cerrar" },
            ]
          );
        } else {
          Alert.alert(
            "Texto copiado",
            "El texto fue copiado al portapapeles. Abre TikTok y pega el contenido en tu video.",
            [{ text: "Entendido" }]
          );
        }
      }
    } catch (error) {
      console.error("Error sharing to TikTok:", error);
      Alert.alert("Error", "No se pudo preparar el contenido para compartir.");
    }
  };

  const bankQuota = Math.round(property.price / 180);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
        },
        isDark ? null : Shadows.card,
        animatedStyle,
      ]}
      testID={`property-card-${property.id}`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.actionButtons}>
          <Animated.View style={heartAnimatedStyle}>
            <Pressable
              onPress={handleFavoritePress}
              hitSlop={12}
              style={styles.iconCircle}
              testID={`favorite-button-${property.id}`}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color={isFavorite ? Colors.light.primary : "#333333"}
              />
            </Pressable>
          </Animated.View>
          <Animated.View style={shareAnimatedStyle}>
            <Pressable
              onPress={handleSharePress}
              hitSlop={12}
              style={styles.iconCircle}
              testID={`share-button-${property.id}`}
            >
              <Ionicons
                name="share"
                size={18}
                color="#333333"
              />
            </Pressable>
          </Animated.View>
          <Animated.View style={tiktokAnimatedStyle}>
            <Pressable
              onPress={handleTikTokShare}
              hitSlop={12}
              style={[styles.iconCircle, styles.tiktokCircle]}
              testID={`tiktok-button-${property.id}`}
            >
              <View style={styles.tiktokIcon}>
                <TikTokIcon size={18} color="#FFFFFF" />
              </View>
            </Pressable>
          </Animated.View>
        </View>
        <View style={styles.commissionBadge}>
          <ThemedText style={styles.commissionText}>
            Gana Q750.00
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.title} numberOfLines={2}>
          {property.title}
        </ThemedText>

        <ThemedText style={[styles.bankQuota, { color: theme.textSecondary }]}>
          Cuota desde Q{bankQuota.toLocaleString()}/mes
        </ThemedText>

        <Pressable onPress={handleSharePress} style={styles.shareButton}>
          <ThemedText style={[styles.shareButtonText, { color: "#bf0a0a" }]}>
            COMPARTE Y GANA
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color="#bf0a0a" />
        </Pressable>

        {showCopyLink ? (
          <Animated.View style={copyAnimatedStyle}>
            <Pressable onPress={handleCopyLink} style={styles.copyLinkButton}>
              <Ionicons name="link-outline" size={16} color="#FFFFFF" />
              <ThemedText style={styles.copyLinkText}>Copiar Link</ThemedText>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: isWeb ? "100%" : CARD_WIDTH,
    height: IMAGE_HEIGHT,
    aspectRatio: isWeb ? 16 / 10 : undefined,
  },
  actionButtons: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  tiktokCircle: {
    backgroundColor: "#000000",
  },
  tiktokIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  commissionBadge: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: "#bf0a0a",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  commissionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  bankQuota: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  copyLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#bf0a0a",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: Spacing.sm,
    gap: 8,
  },
  copyLinkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
