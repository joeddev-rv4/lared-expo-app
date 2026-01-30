import React, { useState, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

const isWeb = Platform.OS === "web";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Property } from "@/data/properties";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.75;

type PropertyDetailRouteProp = RouteProp<RootStackParamList, "PropertyDetail">;

export default function PropertyDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PropertyDetailRouteProp>();
  const { theme } = useTheme();
  const { isGuest } = useAuth();
  const insets = useSafeAreaInsets();
  const property = route.params?.property as Property;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  const filteredImages =
    property?.imagenes
      ?.filter((img) => ["Imagen", "Video", "masterplan"].includes(img.tipo))
      ?.map((img) => img.url) || [];
  const images =
    filteredImages.length > 0 ? filteredImages : [property?.imageUrl || ""];

  if (!property) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <ThemedText>Propiedad no encontrada</ThemedText>
      </View>
    );
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isGuest) {
      Alert.alert(
        "Acción no disponible",
        "Debes crear una cuenta para guardar propiedades en favoritos.",
        [{ text: "Entendido" }],
        [{ text: "Entendido" }],
      );
      return;
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isGuest) {
      Alert.alert(
        "Acción no disponible",
        "Debes crear una cuenta para compartir propiedades.",
        [{ text: "Entendido" }],
        [{ text: "Entendido" }],
      );
      return;
    }
    setShowShareModal(true);
  };

  const getShareText = () => {
    const priceFormatted = `Q${property.price.toLocaleString()}`;
    return `${property.title}\n\n${property.location}\n${priceFormatted}\n${property.area} m²\n\n${property.description || ""}\n\nLa Red Inmobiliaria - Hecho por vendedores, para ser vendedores`;
  };

  const shareWithImages = async () => {
    setIsSharing(true);
    const selectedMediaItems = selectedMediaIndices.map(
      (i) => propertyMedia[i],
    );
    const shareText = getShareText();

    try {
      if (isWeb) {
        // Build the proxy URL - backend is on port 5000
        const domain = process.env.EXPO_PUBLIC_DOMAIN || "";
        let proxyBaseUrl = "";

        if (domain && !domain.includes("localhost")) {
          // EXPO_PUBLIC_DOMAIN should include :5000, but ensure it
          if (domain.includes(":5000")) {
            proxyBaseUrl = `https://${domain}`;
          } else {
            // Extract base domain without any port and add :5000
            const baseDomain = domain.replace(/:\d+$/, "");
            proxyBaseUrl = `https://${baseDomain}:5000`;
          }
        } else if (typeof window !== "undefined" && window.location) {
          // In browser, get the hostname and use port 5000
          const hostname = window.location.hostname;
          if (hostname === "localhost" || hostname === "127.0.0.1") {
            proxyBaseUrl = `http://${hostname}:5000`;
          } else {
            // External domain - add :5000 for backend
            proxyBaseUrl = `https://${hostname}:5000`;
          }
        }

        console.log("Web sharing - proxyBaseUrl:", proxyBaseUrl);
        console.log("EXPO_PUBLIC_DOMAIN:", domain);
        console.log("Selected media items:", selectedMediaItems.length);

        const files: File[] = [];

        // Helper function to get file extension from MIME type
        const getExtensionFromMime = (mimeType: string): string => {
          const mimeToExt: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/gif": "gif",
            "image/webp": "webp",
            "video/mp4": "mp4",
            "video/quicktime": "mov",
            "video/webm": "webm",
          };
          return mimeToExt[mimeType] || "jpg";
        };

        // Try to fetch images via proxy
        for (let i = 0; i < selectedMediaItems.length; i++) {
          const media = selectedMediaItems[i];
          const proxyUrl = `${proxyBaseUrl}/api/image-proxy?url=${encodeURIComponent(media.url)}`;
          console.log(`Fetching media ${i + 1}:`, proxyUrl);

          try {
            const response = await fetch(proxyUrl);
            console.log(`Media ${i + 1} response status:`, response.status);

            if (response.ok) {
              // Get the actual content type from response
              const contentType =
                response.headers.get("content-type") || "image/jpeg";

              // Verify this is actually an image or video, not HTML
              if (
                !contentType.startsWith("image/") &&
                !contentType.startsWith("video/")
              ) {
                console.error(
                  `Media ${i + 1} is not an image/video, got:`,
                  contentType,
                );
                continue;
              }

              const arrayBuffer = await response.arrayBuffer();

              // Verify we got a reasonable file size (at least 1KB for images)
              if (arrayBuffer.byteLength < 1000) {
                console.error(
                  `Media ${i + 1} is too small (${arrayBuffer.byteLength} bytes), likely an error`,
                );
                continue;
              }

              // Create blob with correct MIME type
              const blob = new Blob([arrayBuffer], { type: contentType });
              const extension = getExtensionFromMime(contentType);

              // Create file with correct MIME type from response
              const file = new File([blob], `propiedad_${i + 1}.${extension}`, {
                type: contentType,
              });
              files.push(file);
              console.log(
                `Media ${i + 1} fetched successfully, size: ${blob.size}, type: ${contentType}`,
              );
            } else {
              console.error(
                `Media ${i + 1} fetch failed:`,
                response.status,
                await response.text(),
              );
            }
          } catch (fetchErr) {
            console.error(`Error fetching media ${i + 1}:`, fetchErr);
          }
        }

        console.log(`Total files prepared: ${files.length}`);

        // Try native file sharing with files
        if (
          files.length > 0 &&
          typeof navigator !== "undefined" &&
          navigator.share &&
          navigator.canShare
        ) {
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
              setShowShareModal(false);
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
            });
            console.log("Text share completed");
            setShowShareModal(false);
            return;
          } catch (shareErr: any) {
            if (shareErr.name !== "AbortError") {
              console.log("Text share error:", shareErr);
            }
          }
        }

        // Last fallback - copy to clipboard
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          Alert.alert(
            "Copiado",
            "El contenido ha sido copiado al portapapeles.",
          );
        }
        setShowShareModal(false);
      } else {
        // Mobile native sharing
        const cacheDir = FileSystem.documentDirectory || "";
        const downloadedUris: string[] = [];

        for (let i = 0; i < selectedMediaItems.length; i++) {
          const media = selectedMediaItems[i];
          const extension = isVideoMedia(media.url, media.tipo) ? "mp4" : "jpg";
          const localUri = `${cacheDir}propiedad_${property.id}_${i}_${Date.now()}.${extension}`;

          try {
            const downloadResult = await FileSystem.downloadAsync(
              media.url,
              localUri,
            );
            if (downloadResult.status === 200) {
              downloadedUris.push(downloadResult.uri);
            }
          } catch (downloadError) {
            console.error("Download error for item", i, ":", downloadError);
          }
        }

        if (downloadedUris.length > 0) {
          const isSharingAvailable = await Sharing.isAvailableAsync();

          if (isSharingAvailable) {
            for (let i = 0; i < downloadedUris.length; i++) {
              const uri = downloadedUris[i];
              await Sharing.shareAsync(uri, {
                mimeType: uri.includes(".mp4") ? "video/mp4" : "image/jpeg",
                dialogTitle: `${property.title} - Imagen ${i + 1} de ${downloadedUris.length}`,
              });
            }
            setShowShareModal(false);
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
      Alert.alert("Error", "No se pudo compartir la propiedad.");
    } finally {
      setIsSharing(false);
      setShowShareModal(false);
    }
  };

  const downloadSingleImage = async (imageUrl: string, index: number) => {
    try {
      setDownloadingIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso requerido",
          "Necesitas dar permiso para guardar archivos en tu galería.",
        );
        Alert.alert(
          "Permiso requerido",
          "Necesitas dar permiso para guardar archivos en tu galería.",
        );
        return;
      }

      const extension =
        imageUrl.includes(".mp4") || imageUrl.includes("video") ? "mp4" : "jpg";
      const extension =
        imageUrl.includes(".mp4") || imageUrl.includes("video") ? "mp4" : "jpg";
      const filename = `${property.title.replace(/[^a-zA-Z0-9]/g, "_")}_${index + 1}.${extension}`;
      const fileUri = FileSystem.documentDirectory + filename;

      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

      if (downloadResult.status === 200) {
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Descargado", "Imagen guardada en tu galería.");
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Error downloading image:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "No se pudo descargar la imagen.");
    } finally {
      setDownloadingIndex(null);
    }
  };

  const downloadAllMedia = async () => {
    try {
      setDownloadingAll(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso requerido",
          "Necesitas dar permiso para guardar archivos en tu galería.",
        );
        Alert.alert(
          "Permiso requerido",
          "Necesitas dar permiso para guardar archivos en tu galería.",
        );
        setDownloadingAll(false);
        return;
      }

      const allMedia =
        property?.imagenes?.filter((img) =>
          ["Imagen", "Video", "masterplan"].includes(img.tipo),
        ) || [];
      const allMedia =
        property?.imagenes?.filter((img) =>
          ["Imagen", "Video", "masterplan"].includes(img.tipo),
        ) || [];

      if (allMedia.length === 0) {
        Alert.alert("Sin archivos", "No hay archivos para descargar.");
        setDownloadingAll(false);
        return;
      }

      let downloadedCount = 0;

      for (let i = 0; i < allMedia.length; i++) {
        const media = allMedia[i];
        try {
          const extension =
            media.tipo === "Video" || media.url.includes(".mp4")
              ? "mp4"
              : "jpg";
          const extension =
            media.tipo === "Video" || media.url.includes(".mp4")
              ? "mp4"
              : "jpg";
          const filename = `${property.title.replace(/[^a-zA-Z0-9]/g, "_")}_${i + 1}.${extension}`;
          const fileUri = FileSystem.documentDirectory + filename;

          const downloadResult = await FileSystem.downloadAsync(
            media.url,
            fileUri,
          );
          const downloadResult = await FileSystem.downloadAsync(
            media.url,
            fileUri,
          );

          if (downloadResult.status === 200) {
            await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
            downloadedCount++;
          }
        } catch (error) {
          console.error(`Error downloading file ${i + 1}:`, error);
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Descarga completa",
        `Se descargaron ${downloadedCount} de ${allMedia.length} archivos a tu galería.`,
      );
      Alert.alert(
        "Descarga completa",
        `Se descargaron ${downloadedCount} de ${allMedia.length} archivos a tu galería.`,
      );
    } catch (error) {
      console.error("Error downloading all media:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Hubo un problema al descargar los archivos.");
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const amenities =
    property.proyectoCaracteristicas &&
    property.proyectoCaracteristicas.length > 0
      ? property.proyectoCaracteristicas.map((c) => ({
          icon: "check",
          label: c,
        }))
      : [
          { icon: "wifi", label: "WiFi" },
          { icon: "wind", label: "Aire acondicionado" },
          { icon: "tv", label: "TV" },
          { icon: "coffee", label: "Cocina" },
          { icon: "truck", label: "Estacionamiento" },
          { icon: "droplet", label: "Piscina" },
        ];
  const amenities =
    property.proyectoCaracteristicas &&
    property.proyectoCaracteristicas.length > 0
      ? property.proyectoCaracteristicas.map((c) => ({
          icon: "check",
          label: c,
        }))
      : [
          { icon: "wifi", label: "WiFi" },
          { icon: "wind", label: "Aire acondicionado" },
          { icon: "tv", label: "TV" },
          { icon: "coffee", label: "Cocina" },
          { icon: "truck", label: "Estacionamiento" },
          { icon: "droplet", label: "Piscina" },
        ];

  const renderImageItem = ({ item }: { item: string }) => (
    <Image source={{ uri: item }} style={styles.carouselImage} />
  );

  const shortDescription =
    property.descripcionCorta || property.description || "";
  const fullDescription =
    property.descripcionLarga ||
    property.description ||
    "Esta hermosa propiedad ofrece un espacio cómodo y moderno en una ubicación privilegiada.";
  const shortDescription =
    property.descripcionCorta || property.description || "";
  const fullDescription =
    property.descripcionLarga ||
    property.description ||
    "Esta hermosa propiedad ofrece un espacio cómodo y moderno en una ubicación privilegiada.";

  return (
    <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <ScrollView
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <FlatList
            data={images}
            renderItem={renderImageItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            keyExtractor={(_, index) => index.toString()}
          />
          <View
            style={[styles.floatingHeader, { paddingTop: insets.top + 10 }]}
          >
          <View
            style={[styles.floatingHeader, { paddingTop: insets.top + 10 }]}
          >
            <Pressable onPress={handleBack} style={styles.floatingButton}>
              <Ionicons name="chevron-back" size={24} color="#222222" />
            </Pressable>
            <View style={styles.floatingHeaderRight}>
              <Pressable onPress={handleShare} style={styles.floatingButton}>
                <Ionicons name="share" size={20} color="#222222" />
              </Pressable>
              <Pressable onPress={handleFavorite} style={styles.floatingButton}>
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color={isFavorite ? Colors.light.primary : "#222222"}
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color={isFavorite ? Colors.light.primary : "#222222"}
                />
              </Pressable>
            </View>
          </View>
          <View style={styles.paginationContainer}>
            <Pressable
              style={styles.pagination}
              onPress={() => setShowGallery(true)}
            >
              <Ionicons
                name="grid-outline"
                size={12}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
            <Pressable
              style={styles.pagination}
              onPress={() => setShowGallery(true)}
            >
              <Ionicons
                name="grid-outline"
                size={12}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <ThemedText style={styles.paginationText}>
                {currentImageIndex + 1} / {images.length}
              </ThemedText>
            </Pressable>
          </View>
          <Pressable
            style={styles.kitPromoButton}
            onPress={downloadAllMedia}
            disabled={downloadingAll}
          >
            {downloadingAll ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="download-outline" size={16} color="#FFFFFF" />
            )}
            <ThemedText style={styles.kitPromoText}>
              {downloadingAll ? "Descargando..." : "Kit Promocional"}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.title}>{property.title}</ThemedText>


          {shortDescription ? (
            <ThemedText style={styles.shortDescription}>
              {shortDescription}
            </ThemedText>
            <ThemedText style={styles.shortDescription}>
              {shortDescription}
            </ThemedText>
          ) : null}


          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="share" size={14} color="#222222" />
              <ThemedText style={styles.statText}>
                10 veces compartida
              </ThemedText>
              <ThemedText style={styles.statText}>
                10 veces compartida
              </ThemedText>
            </View>
            <ThemedText style={styles.statDot}>·</ThemedText>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color="#222222" />
              <ThemedText style={styles.statText}>
                2 personas interesadas
              </ThemedText>
              <ThemedText style={styles.statText}>
                2 personas interesadas
              </ThemedText>
            </View>
            <ThemedText style={styles.statDot}>·</ThemedText>
            <View style={styles.statItem}>
              <Ionicons name="star-outline" size={14} color="#222222" />
              <ThemedText style={styles.statText}>4.5 estrellas</ThemedText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.highlightsSection}>
            {property.caracteristicas && property.caracteristicas.length > 0 ? (
              property.caracteristicas
                .slice(0, 4)
                .map((caracteristica, index) => (
                  <View key={index} style={styles.highlight}>
                    <View style={styles.highlightIcon}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={24}
                        color="#222222"
                      />
                    </View>
                    <View style={styles.highlightContent}>
                      <ThemedText style={styles.highlightTitle}>
                        {caracteristica}
                      </ThemedText>
                    </View>
                  </View>
                ))
              property.caracteristicas
                .slice(0, 4)
                .map((caracteristica, index) => (
                  <View key={index} style={styles.highlight}>
                    <View style={styles.highlightIcon}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={24}
                        color="#222222"
                      />
                    </View>
                    <View style={styles.highlightContent}>
                      <ThemedText style={styles.highlightTitle}>
                        {caracteristica}
                      </ThemedText>
                    </View>
                  </View>
                ))
            ) : (
              <>
                <View style={styles.highlight}>
                  <View style={styles.highlightIcon}>
                    <Ionicons name="home" size={24} color="#222222" />
                  </View>
                  <View style={styles.highlightContent}>
                    <ThemedText style={styles.highlightTitle}>
                      Propiedad completa
                    </ThemedText>
                    <ThemedText style={styles.highlightTitle}>
                      Propiedad completa
                    </ThemedText>
                    <ThemedText style={styles.highlightDescription}>
                      Tendrás la propiedad solo para ti
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.highlight}>
                  <View style={styles.highlightIcon}>
                    <Ionicons name="flash-outline" size={24} color="#222222" />
                  </View>
                  <View style={styles.highlightContent}>
                    <ThemedText style={styles.highlightTitle}>
                      Limpieza mejorada
                    </ThemedText>
                    <ThemedText style={styles.highlightTitle}>
                      Limpieza mejorada
                    </ThemedText>
                    <ThemedText style={styles.highlightDescription}>
                      Este anfitrión sigue el proceso de limpieza avanzada
                    </ThemedText>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.descriptionSection}>
            <ThemedText style={styles.sectionTitle}>
              Acerca de este espacio
            </ThemedText>
            <ThemedText
            <ThemedText style={styles.sectionTitle}>
              Acerca de este espacio
            </ThemedText>
            <ThemedText
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 4}
            >
              {fullDescription}
            </ThemedText>
            {fullDescription.length > 200 ? (
              <Pressable
                onPress={() => setShowFullDescription(!showFullDescription)}
              >
              <Pressable
                onPress={() => setShowFullDescription(!showFullDescription)}
              >
                <ThemedText style={styles.showMore}>
                  {showFullDescription ? "Mostrar menos" : "Mostrar más"}
                  <Ionicons
                    name={
                      showFullDescription ? "chevron-up" : "chevron-forward"
                    }
                    size={14}
                    color="#222222"
                  />
                  {showFullDescription ? "Mostrar menos" : "Mostrar más"}
                  <Ionicons
                    name={
                      showFullDescription ? "chevron-up" : "chevron-forward"
                    }
                    size={14}
                    color="#222222"
                  />
                </ThemedText>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.amenitiesSection}>
            <ThemedText style={styles.sectionTitle}>
              Lo que este lugar ofrece
            </ThemedText>
            <ThemedText style={styles.sectionTitle}>
              Lo que este lugar ofrece
            </ThemedText>
            <View style={styles.amenitiesGrid}>
              {amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons
                    name={amenity.icon as any}
                    size={24}
                    color="#222222"
                  />
                  <ThemedText style={styles.amenityLabel}>
                    {amenity.label}
                  </ThemedText>
                  <Ionicons
                    name={amenity.icon as any}
                    size={24}
                    color="#222222"
                  />
                  <ThemedText style={styles.amenityLabel}>
                    {amenity.label}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.priceInfoContainer}>
          <ThemedText style={styles.price}>Q750.00</ThemedText>
          <ThemedText style={styles.priceDetail}>
            por compartir en redes sociales
          </ThemedText>
          <ThemedText style={styles.priceDetail}>
            Precio: {formatPrice(property.price)}
          </ThemedText>
          <ThemedText style={styles.priceDetail}>
            Cuota desde: {formatPrice(Math.round(property.price / 180))}/mes
          </ThemedText>
        </View>
        <View style={styles.buttonsContainer}>
          <Pressable style={styles.reserveButton}>
            <ThemedText style={styles.reserveButtonText}>
              Comparte y gana
            </ThemedText>
            <ThemedText style={styles.reserveButtonText}>
              Comparte y gana
            </ThemedText>
          </Pressable>
          <Pressable style={styles.copyLinkButton} onPress={handleShare}>
            <Ionicons name="link-outline" size={16} color="#FFFFFF" />
            <ThemedText style={styles.copyLinkText}>Copiar Link</ThemedText>
          </Pressable>
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
              <ThemedText style={styles.shareModalTitle}>
                Compartir Propiedad
              </ThemedText>
              <Pressable
                onPress={() => setShowShareModal(false)}
                style={styles.shareModalClose}
              >
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <View style={styles.shareModalSubtitleRow}>
              <ThemedText style={styles.shareModalSubtitle}>
                Selecciona imágenes o videos
              </ThemedText>
              <Pressable
                onPress={selectAllMedia}
                style={styles.selectAllButton}
              >
                <ThemedText style={styles.selectAllText}>
                  Seleccionar todas
                </ThemedText>
              </Pressable>
            </View>

            <ThemedText style={styles.selectedCountText}>
              {selectedMediaIndices.length} de {propertyMedia.length}{" "}
              seleccionadas
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
                    selectedMediaIndices.includes(index) &&
                      styles.mediaThumbnailSelected,
                  ]}
                  onPress={() => toggleMediaSelection(index)}
                >
                  <Image
                    source={{ uri: media.url }}
                    style={styles.mediaThumbnailImage}
                  />
                  {isVideoMedia(media.url, media.tipo) && (
                    <View style={styles.videoIndicator}>
                      <Ionicons
                        name="play-circle"
                        size={32}
                        color="rgba(255,255,255,0.9)"
                      />
                    </View>
                  )}
                  {selectedMediaIndices.includes(index) ? (
                    <View style={styles.selectedIndicator}>
                      <Ionicons
                        name="checkmark-circle"
                        size={28}
                        color="#FF5A5F"
                      />
                    </View>
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              style={[
                styles.shareMainButton,
                isSharing && styles.shareMainButtonDisabled,
              ]}
              onPress={shareWithImages}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              )}
              <ThemedText style={styles.shareMainButtonText}>
                {isSharing
                  ? "Preparando..."
                  : `Compartir (${selectedMediaIndices.length})`}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showGallery}
        animationType="slide"
        onRequestClose={() => setShowGallery(false)}
      >
        <View style={[styles.galleryModal, { paddingTop: insets.top }]}>
          <View style={styles.galleryHeader}>
            <Pressable
              onPress={() => setShowGallery(false)}
              style={styles.galleryBackButton}
            >
            <Pressable
              onPress={() => setShowGallery(false)}
              style={styles.galleryBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#222222" />
            </Pressable>
            <ThemedText style={styles.galleryTitle}>
              {images.length} fotos
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView
          <ScrollView
            style={styles.galleryScrollView}
            contentContainerStyle={[
              styles.galleryContent,
              { paddingBottom: insets.bottom + 20 },
            ]}
            contentContainerStyle={[
              styles.galleryContent,
              { paddingBottom: insets.bottom + 20 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {images.map((imageUrl, index) => (
              <View key={index} style={styles.galleryImageContainer}>
                <View style={styles.galleryImageWrapper}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                  <Pressable
                    style={styles.imageDownloadButton}
                    onPress={() => downloadSingleImage(imageUrl, index)}
                    disabled={downloadingIndex === index}
                  >
                    {downloadingIndex === index ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons
                        name="download-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Ionicons
                        name="download-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                    )}
                  </Pressable>
                </View>
                <ThemedText style={styles.galleryImageNumber}>
                  {index + 1} / {images.length}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    position: "relative",
    height: IMAGE_HEIGHT,
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: "cover",
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  floatingHeaderRight: {
    flexDirection: "row",
    gap: 8,
  },
  floatingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pagination: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paginationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 8,
  },
  shortDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#484848",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: "#222222",
  },
  statDot: {
    fontSize: 14,
    color: "#717171",
    marginHorizontal: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: "#222222",
    marginLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#222222",
    marginHorizontal: 8,
  },
  superhost: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    color: "#222222",
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    backgroundColor: "#EBEBEB",
    marginVertical: 24,
  },
  hostSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hostInfo: {
    flex: 1,
    marginRight: 16,
  },
  hostTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 4,
  },
  hostDetails: {
    fontSize: 14,
    color: "#717171",
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
  },
  highlightsSection: {
    gap: 20,
  },
  highlight: {
    flexDirection: "row",
  },
  highlightIcon: {
    width: 32,
    marginRight: 16,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 4,
  },
  highlightDescription: {
    fontSize: 14,
    color: "#717171",
    lineHeight: 20,
  },
  descriptionSection: {},
  description: {
    fontSize: 16,
    color: "#222222",
    lineHeight: 24,
  },
  showMore: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    textDecorationLine: "underline",
    marginTop: 12,
  },
  amenitiesSection: {},
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 20,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  amenityItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  amenityLabel: {
    fontSize: 16,
    color: "#222222",
    marginLeft: 16,
  },
  showAllButton: {
    borderWidth: 1,
    borderColor: "#222222",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  showAllButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  locationSection: {},
  mapPlaceholder: {
    height: 200,
    backgroundColor: "#F7F7F7",
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: "#717171",
    marginTop: 12,
  },
  rulesSection: {},
  ruleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
    color: "#717171",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceInfoContainer: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222222",
  },
  priceLabel: {
    fontSize: 16,
    color: "#222222",
  },
  priceDetail: {
    fontSize: 12,
    color: "#717171",
  },
  reserveButton: {
    backgroundColor: "#bf0a0a",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  reserveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonsContainer: {
    gap: 8,
  },
  copyLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222222",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  copyLinkText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  galleryModal: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  galleryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  galleryBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222222",
  },
  galleryScrollView: {
    flex: 1,
  },
  galleryContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  galleryImageContainer: {
    width: "100%",
    alignItems: "center",
  },
  galleryImageWrapper: {
    width: "100%",
    position: "relative",
  },
  galleryImage: {
    width: "100%",
    aspectRatio: 16 / 10,
    borderRadius: BorderRadius.lg,
  },
  imageDownloadButton: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryImageNumber: {
    marginTop: Spacing.sm,
    fontSize: 14,
    color: "#717171",
  },
  kitPromoButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#bf0a0a",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  kitPromoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  shareModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  shareModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: "80%",
  },
  shareModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  shareModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222222",
  },
  shareModalClose: {
    padding: Spacing.xs,
  },
  shareModalSubtitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  shareModalSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  selectAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  selectedCountText: {
    fontSize: 12,
    color: "#888888",
    marginBottom: Spacing.md,
  },
  mediaScrollView: {
    maxHeight: 150,
  },
  mediaScrollContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  mediaThumbnail: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  mediaThumbnailSelected: {
    borderColor: Colors.light.primary,
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
  },
  shareMainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  shareMainButtonDisabled: {
    opacity: 0.7,
  },
  shareMainButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
