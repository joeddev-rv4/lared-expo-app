import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Image, Dimensions, Share, Platform, Alert, Modal, ScrollView, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

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
  ttq.setAndDefer = function (t: any, e: string) {
    t[e] = function () {
      t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  for (let i = 0; i < ttq.methods.length; i++) {
    ttq.setAndDefer(ttq, ttq.methods[i]);
  }
  ttq.instance = function (t: string) {
    const e = ttq._i[t] || [];
    for (let n = 0; n < ttq.methods.length; n++) {
      ttq.setAndDefer(e, ttq.methods[n]);
    }
    return e;
  };
  ttq.load = function (e: string, n?: any) {
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
const isMobileWeb = isWeb && SCREEN_WIDTH < 768;
const isTikTokEnabled = process.env.EXPO_PUBLIC_TIKTOK_VALIDATOR === "true";

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

  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedMediaIndices, setSelectedMediaIndices] = useState<number[]>([0]);
  const [isSharing, setIsSharing] = useState(false);

  const propertyMedia = property.imagenes
    ?.filter((img) => ["Imagen", "Video"].includes(img.tipo))
    ?.map((img) => ({ url: img.url, tipo: img.tipo })) || [{ url: property.imageUrl, tipo: "Imagen" }];

  const isVideoMedia = (url: string, tipo?: string) => {
    return tipo === "Video" || url.includes(".mp4") || url.includes("video");
  };

  const toggleMediaSelection = (index: number) => {
    setSelectedMediaIndices(prev => {
      if (prev.includes(index)) {
        if (prev.length === 1) return prev;
        return prev.filter(i => i !== index);
      }
      return [...prev, index];
    });
  };

  const selectAllMedia = () => {
    setSelectedMediaIndices(propertyMedia.map((_, i) => i));
  };

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

  const handleSharePress = () => {
    shareScale.value = withSpring(1.3, { damping: 10 });
    setTimeout(() => {
      shareScale.value = withSpring(1, { damping: 10 });
    }, 100);
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowShareModal(true);
  };

  const getShareText = () => {
    const priceFormatted = `Q${property.price.toLocaleString()}`;
    return `${property.title}\n\n${property.location}\n${priceFormatted}\n${property.area} m²\n\n${property.description || ""}\n\nLa Red Inmobiliaria - Hecha por vendedores, para vendedores`;
  };

  const getShareUrl = () => {
    let baseUrl = "";
    if (isWeb && typeof window !== "undefined" && window.location) {
      baseUrl = window.location.origin;
    } else {
      const domain = process.env.EXPO_PUBLIC_DOMAIN || "";
      baseUrl = domain ? `https://${domain.replace(':3000', '')}` : "";
    }
    return userId ? `${baseUrl}/blog/${userId}/${property.id}` : baseUrl;
  };

  const shareWithImage = async () => {
    setIsSharing(true);
    const selectedMediaItems = selectedMediaIndices.map(i => propertyMedia[i]);
    const shareText = `${getShareText()}\n\n${getShareUrl()}`;

    try {
      if (isWeb) {
        // Build the proxy URL - use EXPO_PUBLIC_DOMAIN with https and keep :5000 port
        const domain = process.env.EXPO_PUBLIC_DOMAIN || "";
        let proxyBaseUrl = "";
        
        if (domain && !domain.includes("localhost")) {
          // Use the full domain with protocol (domain already includes :5000)
          proxyBaseUrl = `https://${domain}`;
        } else if (typeof window !== "undefined" && window.location) {
          // In local dev, use the current origin but adjust port to 5000
          const origin = window.location.origin;
          if (origin.includes("localhost")) {
            proxyBaseUrl = origin.replace(/:\d+$/, ":5000");
          } else {
            proxyBaseUrl = origin;
          }
        }

        console.log("Web sharing - proxyBaseUrl:", proxyBaseUrl);
        console.log("Selected media items:", selectedMediaItems.length);

        const files: File[] = [];
        
        // Try to fetch images via proxy
        for (let i = 0; i < selectedMediaItems.length; i++) {
          const media = selectedMediaItems[i];
          const proxyUrl = `${proxyBaseUrl}/api/image-proxy?url=${encodeURIComponent(media.url)}`;
          console.log(`Fetching image ${i + 1}:`, proxyUrl);
          
          try {
            const response = await fetch(proxyUrl);
            console.log(`Image ${i + 1} response status:`, response.status);
            
            if (response.ok) {
              const blob = await response.blob();
              const extension = isVideoMedia(media.url, media.tipo) ? "mp4" : "jpg";
              const mimeType = isVideoMedia(media.url, media.tipo) ? "video/mp4" : "image/jpeg";
              files.push(new File([blob], `propiedad_${i + 1}.${extension}`, { type: mimeType }));
              console.log(`Image ${i + 1} fetched successfully, size: ${blob.size}`);
            }
          } catch (fetchErr) {
            console.error(`Error fetching image ${i + 1}:`, fetchErr);
          }
        }

        console.log(`Total files prepared: ${files.length}`);

        // Try native file sharing with files
        if (files.length > 0 && typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
          try {
            const canShareFiles = navigator.canShare({ files });
            console.log("Browser can share files:", canShareFiles);
            
            if (canShareFiles) {
              await navigator.share({
                title: property.title,
                text: shareText,
                files,
              });
              console.log("Files shared successfully!");
              return;
            }
          } catch (shareErr) {
            console.log("File share error:", shareErr);
          }
        }

        // If we have files but native sharing didn't work, try text share with URL
        if (typeof navigator !== "undefined" && navigator.share) {
          try {
            await navigator.share({
              title: property.title,
              text: shareText,
              url: getShareUrl(),
            });
            console.log("Text share completed");
            return;
          } catch (shareErr: any) {
            if (shareErr.name !== 'AbortError') {
              console.log("Text share error:", shareErr);
            }
          }
        }

        // Last fallback - copy to clipboard
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          Alert.alert("Copiado", "El contenido ha sido copiado al portapapeles.");
        }
      } else {
        // Mobile native sharing
        const cacheDir = FileSystem.documentDirectory || "";
        const downloadedUris: string[] = [];

        console.log("Downloading images for mobile sharing...");

        for (let i = 0; i < selectedMediaItems.length; i++) {
          const media = selectedMediaItems[i];
          const extension = isVideoMedia(media.url, media.tipo) ? "mp4" : "jpg";
          const localUri = `${cacheDir}propiedad_${property.id}_${i}_${Date.now()}.${extension}`;

          try {
            const downloadResult = await FileSystem.downloadAsync(media.url, localUri);
            if (downloadResult.status === 200) {
              downloadedUris.push(downloadResult.uri);
              console.log(`Downloaded image ${i + 1} to:`, downloadResult.uri);
            }
          } catch (downloadError) {
            console.error("Download error for item", i, ":", downloadError);
          }
        }

        console.log(`Total images downloaded: ${downloadedUris.length}`);

        if (downloadedUris.length > 0) {
          const isSharingAvailable = await Sharing.isAvailableAsync();
          console.log("Sharing available:", isSharingAvailable);

          if (isSharingAvailable) {
            // Share images one by one (expo-sharing limitation)
            for (let i = 0; i < downloadedUris.length; i++) {
              const uri = downloadedUris[i];
              console.log(`Sharing image ${i + 1}:`, uri);
              await Sharing.shareAsync(uri, {
                mimeType: uri.includes(".mp4") ? "video/mp4" : "image/jpeg",
                dialogTitle: `${property.title} - Imagen ${i + 1} de ${downloadedUris.length}`,
              });
            }
            return;
          }
        }

        // Fallback to text sharing
        await Share.share({
          message: shareText,
          title: property.title,
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      if (isWeb) {
        try {
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(shareText);
            Alert.alert(
              "Contenido copiado",
              "El texto ha sido copiado al portapapeles. Puedes pegarlo donde desees compartirlo."
            );
          } else {
            const textArea = document.createElement("textarea");
            textArea.value = shareText;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            Alert.alert(
              "Contenido copiado",
              "El texto ha sido copiado al portapapeles. Puedes pegarlo donde desees compartirlo."
            );
          }
        } catch (clipboardError) {
          console.error("Clipboard error:", clipboardError);
          Alert.alert("Error", "No se pudo compartir la propiedad.");
        }
      } else {
        try {
          await Share.share({
            message: shareText,
            title: property.title,
          });
        } catch (fallbackError) {
          Alert.alert("Error", "No se pudo compartir la propiedad.");
        }
      }
    } finally {
      setIsSharing(false);
      setShowShareModal(false);
      onSharePress?.();
    }
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
      baseUrl = domain ? `https://${domain.replace(':3000', '')}` : "";
    }
    const blogUrl = `${baseUrl}/blog/${userId}/${property.id}`;

    try {
      if (isWeb && typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(blogUrl);
        Alert.alert("Enlace copiado", "El enlace ha sido copiado al portapapeles.");
      } else {
        await Clipboard.setStringAsync(blogUrl);
        Alert.alert("Enlace copiado", "El enlace ha sido copiado al portapapeles.");
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      if (isWeb && typeof window !== "undefined") {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = blogUrl;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          Alert.alert("Enlace copiado", "El enlace ha sido copiado al portapapeles.");
        } catch (fallbackError) {
          console.error("Fallback copy failed:", fallbackError);
          Alert.alert("Error", "No se pudo copiar el enlace. Por favor, copia manualmente: " + blogUrl);
        }
      } else {
        Alert.alert("Error", "No se pudo copiar el enlace.");
      }
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
      baseUrl = domain ? `https://${domain.replace(':3000', '')}` : "";
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
          style={[styles.image, isMobileWeb && styles.imageMobileWeb]}
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
          {isTikTokEnabled ? (
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
          ) : null}
        </View>
        <View style={styles.commissionBadge}>
          <ThemedText style={styles.commissionText}>
            Gana Q750.00
          </ThemedText>
        </View>
      </View>

      <View style={[styles.content, isMobileWeb && styles.contentMobileWeb]}>
        <ThemedText style={[styles.title, isMobileWeb && styles.titleMobileWeb]} numberOfLines={2}>
          {property.title}
        </ThemedText>

        <ThemedText style={[styles.bankQuota, { color: theme.textSecondary }]}>
          Cuota desde Q{bankQuota.toLocaleString()}/mes
        </ThemedText>

        <View style={[styles.actionsRow, isMobileWeb && styles.actionsRowMobileWeb]}>
          <Pressable onPress={handleSharePress} style={styles.shareButton}>
            <ThemedText style={[styles.shareButtonText, { color: "#bf0a0a" }]}>
              COMPARTE Y GANA
            </ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#bf0a0a" />
          </Pressable>

          {showCopyLink ? (
            <Animated.View style={copyAnimatedStyle}>
              <Pressable onPress={handleCopyLink} style={[styles.copyLinkButton, isMobileWeb && styles.copyLinkButtonMobileWeb]}>
                <Ionicons name="link-outline" size={16} color="#FFFFFF" />
                <ThemedText style={styles.copyLinkText}>Copiar Link</ThemedText>
              </Pressable>
            </Animated.View>
          ) : null}
        </View>
      </View>

      <Modal
        visible={showShareModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContent}>
            <View style={styles.shareModalHeader}>
              <ThemedText style={styles.shareModalTitle}>Compartir Propiedad</ThemedText>
              <Pressable onPress={() => setShowShareModal(false)} style={styles.shareModalClose}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <View style={styles.shareModalSubtitleRow}>
              <ThemedText style={styles.shareModalSubtitle}>Selecciona imágenes o videos</ThemedText>
              <Pressable onPress={selectAllMedia} style={styles.selectAllButton}>
                <ThemedText style={styles.selectAllText}>Seleccionar todas</ThemedText>
              </Pressable>
            </View>

            <ThemedText style={styles.selectedCountText}>
              {selectedMediaIndices.length} de {propertyMedia.length} seleccionadas
            </ThemedText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.mediaScrollView}
              contentContainerStyle={styles.mediaScrollContent}
            >
              {propertyMedia.map((media, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.mediaThumbnail,
                    selectedMediaIndices.includes(index) && styles.mediaThumbnailSelected
                  ]}
                  onPress={() => toggleMediaSelection(index)}
                >
                  <Image source={{ uri: media.url }} style={styles.mediaThumbnailImage} />
                  {isVideoMedia(media.url, media.tipo) && (
                    <View style={styles.videoIndicator}>
                      <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
                    </View>
                  )}
                  {selectedMediaIndices.includes(index) && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={28} color="#FF5A5F" />
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              style={[styles.shareMainButton, isSharing && styles.shareMainButtonDisabled]}
              onPress={shareWithImage}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              )}
              <ThemedText style={styles.shareMainButtonText}>
                {isSharing ? "Preparando..." : `Compartir (${selectedMediaIndices.length})`}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  imageMobileWeb: {
    height: 180,
    aspectRatio: 16 / 9,
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
    backgroundColor: "#FFFFFF",
  },
  contentMobileWeb: {
    padding: Spacing.sm,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  titleMobileWeb: {
    fontSize: 15,
  },
  bankQuota: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  actionsRow: {
    flexDirection: "column",
    gap: Spacing.sm,
  },
  actionsRowMobileWeb: {
    flexDirection: "column",
    gap: Spacing.xs,
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
    gap: 8,
  },
  copyLinkButtonMobileWeb: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  copyLinkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  shareModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  shareModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  shareModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  shareModalClose: {
    padding: 8,
  },
  shareModalSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  mediaScrollView: {
    maxHeight: 120,
  },
  mediaScrollContent: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  mediaThumbnail: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "transparent",
  },
  mediaThumbnailSelected: {
    borderColor: "#FF5A5F",
  },
  mediaThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  videoIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  selectedIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
  },
  socialButtonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  socialButton: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  socialButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  shareMainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF5A5F",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  shareMainButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  shareMainButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  shareModalSubtitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  selectAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  selectAllText: {
    color: "#FF5A5F",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedCountText: {
    fontSize: 12,
    color: "#666",
    marginBottom: Spacing.sm,
  },
});
