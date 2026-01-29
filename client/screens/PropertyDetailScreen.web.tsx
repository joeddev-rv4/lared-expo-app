import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  TextInput,
  Modal,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { auth } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";

import { ThemedText } from "@/components/ThemedText";
import { WebNavbar } from "@/components/WebNavbar";
import { useTheme } from "@/hooks/useTheme";
import { Property } from "@/data/properties";
import { Spacing, Colors, BorderRadius, Shadows } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Generic route params type that works with both RootStack and FavoritesStack
type PropertyDetailParams = {
  property: Property;
  sourceTab?: string;
};

export default function PropertyDetailScreenWeb() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const { user, isGuest } = useAuth();
  const params = route.params as PropertyDetailParams;
  const property = params?.property;
  const sourceTab = params?.sourceTab;
  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isFavorite, setIsFavorite] = useState(sourceTab === "FavoritesTab");
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!property || sourceTab === "FavoritesTab") return;
      try {
        const stored = await AsyncStorage.getItem("favorites");
        if (stored) {
          const favoriteIds: string[] = JSON.parse(stored);
          setIsFavorite(favoriteIds.includes(property.id));
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };
    checkFavoriteStatus();
  }, [property, sourceTab]);

  const getCurrentUserId = () => user?.id || auth.currentUser?.uid || "";

  const handleCopyLink = async () => {
    if (isGuest) {
      Alert.alert(
        "Acción no disponible",
        "Debes crear una cuenta para compartir enlaces de propiedades.",
        [{ text: "Entendido" }]
      );
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      Alert.alert("Error", "No se pudo obtener el ID del usuario.");
      return;
    }

    const getBaseUrl = () => {
      if (typeof window !== "undefined" && window.location?.origin) {
        return window.location.origin;
      }
      const domain = process.env.EXPO_PUBLIC_DOMAIN || process.env.REPLIT_DEV_DOMAIN;
      return domain ? `https://${domain.replace(':5000', '')}` : "";
    };
    const baseUrl = getBaseUrl();
    const blogUrl = `${baseUrl}/blog/${userId}/${property.id}`;

    try {
      await Clipboard.setStringAsync(blogUrl);
      Alert.alert("Enlace copiado", "El enlace ha sido copiado al portapapeles.");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("Error", "No se pudo copiar el enlace.");
    }
  };

  const downloadImageViaProxy = async (imageUrl: string, filename: string): Promise<boolean> => {
    try {
      // Use CORS proxy to fetch the image
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Error downloading via proxy:", error);
      return false;
    }
  };

  const downloadSingleImage = async (imageUrl: string, index: number) => {
    try {
      setDownloadingIndex(index);

      const extension = imageUrl.includes(".mp4") || imageUrl.includes("video") ? "mp4" : "jpg";
      const filename = `${property.title.replace(/[^a-zA-Z0-9]/g, "_")}_${index + 1}.${extension}`;

      const success = await downloadImageViaProxy(imageUrl, filename);

      if (!success) {
        // Fallback: open in new tab
        window.open(imageUrl, "_blank");
        Alert.alert(
          "Descarga alternativa",
          "La imagen se abrió en una nueva pestaña. Haz clic derecho y selecciona 'Guardar imagen como...'"
        );
      }
    } catch (error) {
      console.error("Error downloading image:", error);
      Alert.alert("Error", "No se pudo descargar la imagen.");
    } finally {
      setDownloadingIndex(null);
    }
  };

  const downloadAllMedia = async () => {
    try {
      setDownloadingAll(true);
      const allMedia = property?.imagenes?.filter(img =>
        ["Imagen", "Video", "masterplan"].includes(img.tipo)
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
          const extension = media.tipo === "Video" || media.url.includes(".mp4") ? "mp4" : "jpg";
          const filename = `${property.title.replace(/[^a-zA-Z0-9]/g, "_")}_${i + 1}.${extension}`;

          const success = await downloadImageViaProxy(media.url, filename);
          if (success) {
            downloadedCount++;
          }

          // Delay between downloads
          await new Promise(resolve => setTimeout(resolve, 600));
        } catch (error) {
          console.error(`Error downloading file ${i + 1}:`, error);
        }
      }

      Alert.alert(
        "Descarga completa",
        `Se descargaron ${downloadedCount} de ${allMedia.length} archivos.`
      );
    } catch (error) {
      console.error("Error downloading all media:", error);
      Alert.alert("Error", "Hubo un problema al descargar los archivos.");
    } finally {
      setDownloadingAll(false);
    }
  };

  const filteredImages = property?.imagenes
    ?.filter(img => ["Imagen", "Video", "masterplan"].includes(img.tipo))
    ?.map(img => img.url) || [];
  const galleryImages = filteredImages.length > 0 ? filteredImages : [property?.imageUrl || ""];

  if (!property) {
    return (
      <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
        <ThemedText>Propiedad no encontrada</ThemedText>
      </View>
    );
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const amenityIcons: { [key: string]: string } = {
    "WiFi": "wifi",
    "Cocina": "coffee",
    "Estacionamiento": "truck",
    "Aire acondicionado": "wind",
    "Piscina": "droplet",
    "Gimnasio": "activity",
    "Lavadora": "box",
    "TV": "tv",
    "Balcón": "sun",
    "Jardín": "home",
  };

  return (
    <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <WebNavbar activeTabOverride={sourceTab} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, isMobile && styles.headerMobile]}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#222222" />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerActionButton}>
              <Ionicons name="share-outline" size={18} color="#222222" />
              <ThemedText style={styles.headerActionText}>Compartir</ThemedText>
            </Pressable>
            <Pressable style={styles.headerActionButton}>
              <Ionicons name="heart-outline" size={18} color="#222222" />
              <ThemedText style={styles.headerActionText}>Guardar</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={[styles.imageGalleryContainer, isMobile && styles.imageGalleryContainerMobile]}>
          <ThemedText style={[styles.propertyTitleOverlay, isMobile && styles.propertyTitleOverlayMobile]}>{property.title}</ThemedText>
          <View style={[styles.imageGallery, isMobile && styles.imageGalleryMobile]}>
            <Image source={{ uri: galleryImages[0] || property.imageUrl }} style={[styles.mainImage, isMobile && styles.mainImageMobile]} />
            {!isMobile ? (
              <View style={styles.imageGrid}>
                <Image source={{ uri: galleryImages[1] || galleryImages[0] || property.imageUrl }} style={styles.gridImage} />
                <Image source={{ uri: galleryImages[2] || galleryImages[0] || property.imageUrl }} style={styles.gridImage} />
                <Image source={{ uri: galleryImages[3] || galleryImages[0] || property.imageUrl }} style={[styles.gridImage, styles.gridImageTopRight]} />
                <Image source={{ uri: galleryImages[4] || galleryImages[0] || property.imageUrl }} style={[styles.gridImage, styles.gridImageBottomRight]} />
              </View>
            ) : null}
            {!isMobile ? (
              <>
                <Pressable style={styles.showAllPhotosButton} onPress={() => setShowGallery(true)}>
                  <Ionicons name="grid-outline" size={14} color="#222222" />
                  <ThemedText style={styles.showAllPhotosText}>Mostrar todas las fotos ({galleryImages.length})</ThemedText>
                </Pressable>
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
              </>
            ) : null}
          </View>
          {isMobile ? (
            <View style={styles.mobileButtonsRow}>
              <Pressable style={styles.showAllPhotosButtonMobile} onPress={() => setShowGallery(true)}>
                <Ionicons name="grid-outline" size={14} color="#222222" />
                <ThemedText style={styles.showAllPhotosText}>Ver fotos ({galleryImages.length})</ThemedText>
              </Pressable>
              <Pressable
                style={styles.kitPromoButtonMobile}
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
          ) : null}
          <ThemedText style={[styles.descriptionBelowImages, isMobile && styles.descriptionBelowImagesMobile]}>{property.descripcionCorta || property.description}</ThemedText>
        </View>

        <View style={[styles.contentContainer, isMobile && styles.contentContainerMobile]}>
          <View style={[styles.mainContent, isMobile && styles.mainContentMobile]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="share-social-outline" size={16} color="#222222" />
                <ThemedText style={styles.statText}>10 veces compartida</ThemedText>
              </View>
              <ThemedText style={styles.statDot}>·</ThemedText>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={16} color="#222222" />
                <ThemedText style={styles.statText}>2 personas interesadas</ThemedText>
              </View>
              <ThemedText style={styles.statDot}>·</ThemedText>
              <View style={styles.statItem}>
                <Ionicons name="star-outline" size={16} color="#222222" />
                <ThemedText style={styles.statText}>4.5 estrellas</ThemedText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.highlightsSection}>
              {property.caracteristicas && property.caracteristicas.length > 0 ? (
                property.caracteristicas.slice(0, 4).map((caracteristica, index) => (
                  <View key={index} style={styles.highlightItem}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#222222" />
                    <View style={styles.highlightText}>
                      <ThemedText style={styles.highlightTitle}>{caracteristica}</ThemedText>
                    </View>
                  </View>
                ))
              ) : (
                <>
                  <View style={styles.highlightItem}>
                    <Ionicons name="home-outline" size={24} color="#222222" />
                    <View style={styles.highlightText}>
                      <ThemedText style={styles.highlightTitle}>Propiedad completa</ThemedText>
                      <ThemedText style={styles.highlightSubtitle}>Tendrás la propiedad solo para ti</ThemedText>
                    </View>
                  </View>
                  <View style={styles.highlightItem}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#222222" />
                    <View style={styles.highlightText}>
                      <ThemedText style={styles.highlightTitle}>Limpieza mejorada</ThemedText>
                      <ThemedText style={styles.highlightSubtitle}>Este anfitrión sigue el proceso de limpieza</ThemedText>
                    </View>
                  </View>
                </>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.descriptionSection}>
              <ThemedText style={styles.sectionTitle}>Acerca de este espacio</ThemedText>
              <ThemedText
                style={styles.descriptionText}
                numberOfLines={showFullDescription ? undefined : 4}
              >
                {property.descripcionLarga || property.description}
              </ThemedText>
              {(property.descripcionLarga || property.description).length > 200 ? (
                <Pressable style={styles.showMoreButton} onPress={() => setShowFullDescription(!showFullDescription)}>
                  <ThemedText style={styles.showMoreText}>
                    {showFullDescription ? "Mostrar menos" : "Mostrar más"}
                  </ThemedText>
                  <Ionicons name={showFullDescription ? "chevron-up" : "chevron-forward"} size={16} color="#222222" />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.divider} />

            <View style={styles.featuresSection}>
              <ThemedText style={styles.sectionTitle}>Lo que este lugar ofrece</ThemedText>
              <View style={styles.amenitiesGrid}>
                {property.proyectoCaracteristicas && property.proyectoCaracteristicas.length > 0 ? (
                  property.proyectoCaracteristicas.map((caracteristica, index) => (
                    <View key={index} style={styles.amenityItem}>
                      <Ionicons name="checkmark" size={24} color="#222222" />
                      <ThemedText style={styles.amenityText}>{caracteristica}</ThemedText>
                    </View>
                  ))
                ) : (
                  <>
                    <View style={styles.featureItem}>
                      <Ionicons name="layers-outline" size={24} color="#222222" />
                      <ThemedText style={styles.featureText}>{property.bedrooms} habitaciones</ThemedText>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="water-outline" size={24} color="#222222" />
                      <ThemedText style={styles.featureText}>{property.bathrooms} baños</ThemedText>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="expand-outline" size={24} color="#222222" />
                      <ThemedText style={styles.featureText}>{property.area} m²</ThemedText>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          <View style={[styles.bookingCard, isMobile && styles.bookingCardMobile]}>
            <View style={styles.bookingCardInner}>
              <View style={styles.priceRow}>
                <ThemedText style={styles.priceAmount}>Q750.00</ThemedText>
                <ThemedText style={styles.commissionSubtext}>por compartir en redes sociales</ThemedText>
              </View>

              <View style={styles.commissionInfo}>
                <ThemedText style={styles.commissionLabel}>Precio:</ThemedText>
                <ThemedText style={styles.commissionValue}>{formatPrice(property.price)}</ThemedText>
              </View>

              <View style={styles.commissionInfo}>
                <ThemedText style={styles.commissionLabel}>Cuota desde:</ThemedText>
                <ThemedText style={styles.commissionValue}>{formatPrice(Math.round(property.price / 180))}/mes</ThemedText>
              </View>

              <Pressable style={styles.reserveButton}>
                <ThemedText style={styles.reserveButtonText}>Comparte y gana</ThemedText>
              </Pressable>

              <Pressable style={styles.copyLinkButton} onPress={handleCopyLink}>
                <Ionicons name="link-outline" size={16} color="#FFFFFF" />
                <ThemedText style={styles.copyLinkText}>Copiar Link</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showGallery}
        animationType="fade"
        onRequestClose={() => setShowGallery(false)}
      >
        <View style={styles.galleryModal}>
          <View style={styles.galleryHeader}>
            <Pressable onPress={() => setShowGallery(false)} style={styles.galleryBackButton}>
              <Ionicons name="arrow-back" size={24} color="#222222" />
            </Pressable>
            <ThemedText style={styles.galleryTitle}>
              {galleryImages.length} fotos
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView
            style={styles.galleryScrollView}
            contentContainerStyle={styles.galleryContent}
            showsVerticalScrollIndicator={false}
          >
            {galleryImages.map((imageUrl, index) => (
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
                      <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                    )}
                  </Pressable>
                </View>
                <ThemedText style={styles.galleryImageNumber}>
                  {index + 1} / {galleryImages.length}
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
    paddingTop: 70 + Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 90,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  headerActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  headerActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    textDecorationLine: "underline",
  },
  imageGallery: {
    flexDirection: "row",
    paddingHorizontal: 90,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
    position: "relative",
  },
  mainImage: {
    flex: 1,
    height: 400,
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
    backgroundColor: "#F0F0F0",
  },
  imageGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  gridImage: {
    width: "48.5%",
    height: 196,
    backgroundColor: "#F0F0F0",
  },
  gridImageTopRight: {
    borderTopRightRadius: BorderRadius.lg,
  },
  gridImageBottomRight: {
    borderBottomRightRadius: BorderRadius.lg,
  },
  showAllPhotosButton: {
    position: "absolute",
    bottom: Spacing.lg,
    right: 90 + Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "#222222",
  },
  showAllPhotosText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  contentContainer: {
    flexDirection: "row",
    paddingHorizontal: 90,
    paddingTop: Spacing.xl,
    gap: Spacing.xl * 2,
  },
  mainContent: {
    flex: 1,
    maxWidth: 650,
  },
  propertyTitle: {
    fontSize: 26,
    fontWeight: "600",
    color: "#222222",
    marginBottom: Spacing.sm,
  },
  imageGalleryContainer: {
    paddingHorizontal: 90,
    marginTop: Spacing.xl,
  },
  propertyTitleOverlay: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222222",
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  descriptionBelowImages: {
    fontSize: 16,
    lineHeight: 24,
    color: "#484848",
    marginTop: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statText: {
    fontSize: 14,
    color: "#484848",
  },
  statDot: {
    fontSize: 14,
    color: "#717171",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  reviewCount: {
    fontSize: 14,
    color: "#222222",
    textDecorationLine: "underline",
  },
  locationDot: {
    fontSize: 14,
    color: "#222222",
    marginHorizontal: Spacing.xs,
  },
  superhost: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  location: {
    fontSize: 14,
    color: "#222222",
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    backgroundColor: "#EBEBEB",
    marginVertical: Spacing.lg,
  },
  hostSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  hostInfo: {
    flex: 1,
  },
  hostTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: Spacing.xs,
  },
  hostSubtitle: {
    fontSize: 14,
    color: "#717171",
  },
  highlightsSection: {
    gap: Spacing.lg,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  highlightText: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: Spacing.xs,
  },
  highlightSubtitle: {
    fontSize: 14,
    color: "#717171",
  },
  descriptionSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#222222",
    marginBottom: Spacing.md,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#222222",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  showMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    textDecorationLine: "underline",
  },
  featuresSection: {
    gap: Spacing.md,
  },
  featuresGrid: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: 16,
    color: "#222222",
  },
  amenitiesSection: {
    gap: Spacing.md,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    width: "50%",
    paddingVertical: Spacing.md,
  },
  amenityText: {
    fontSize: 16,
    color: "#222222",
  },
  showAllAmenitiesButton: {
    borderWidth: 1,
    borderColor: "#222222",
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignSelf: "flex-start",
    marginTop: Spacing.md,
  },
  showAllAmenitiesText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  bookingCard: {
    width: 370,
    position: "sticky" as any,
    top: Spacing.xl,
    alignSelf: "flex-start",
  },
  bookingCardInner: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    backgroundColor: "#FFFFFF",
    ...Shadows.card,
  },
  priceRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    marginBottom: Spacing.sm,
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: "600",
    color: "#222222",
  },
  commissionSubtext: {
    fontSize: 13,
    color: "#717171",
    marginTop: 2,
  },
  priceUnit: {
    fontSize: 16,
    color: "#222222",
  },
  ratingRowSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.lg,
  },
  ratingTextSmall: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  reviewCountSmall: {
    fontSize: 14,
    color: "#717171",
  },
  bookingForm: {
    borderWidth: 1,
    borderColor: "#B0B0B0",
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  dateInputRow: {
    flexDirection: "row",
  },
  dateInput: {
    flex: 1,
    padding: Spacing.sm,
  },
  dateInputLeft: {
    borderRightWidth: 1,
    borderRightColor: "#B0B0B0",
    borderBottomWidth: 1,
    borderBottomColor: "#B0B0B0",
  },
  dateInputRight: {
    borderBottomWidth: 1,
    borderBottomColor: "#B0B0B0",
  },
  guestsInput: {
    padding: Spacing.sm,
  },
  dateInputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 4,
  },
  dateInputField: {
    fontSize: 14,
    color: "#222222",
  },
  commissionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  commissionLabel: {
    fontSize: 14,
    color: "#717171",
  },
  commissionValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  reserveButton: {
    backgroundColor: "#bf0a0a",
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  reserveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  copyLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222222",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    gap: 8,
  },
  copyLinkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  noChargeText: {
    fontSize: 14,
    color: "#222222",
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  priceBreakdown: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  priceBreakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceBreakdownLabel: {
    fontSize: 16,
    color: "#222222",
    textDecorationLine: "underline",
  },
  priceBreakdownValue: {
    fontSize: 16,
    color: "#222222",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
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
    padding: Spacing.lg,
    gap: Spacing.lg,
    alignItems: "center",
  },
  galleryImageContainer: {
    width: "100%",
    maxWidth: 900,
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
    bottom: Spacing.lg,
    left: 90 + Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "#bf0a0a",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  kitPromoButtonMobile: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "#bf0a0a",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  kitPromoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  imageGalleryContainerMobile: {
    paddingHorizontal: Spacing.md,
  },
  propertyTitleOverlayMobile: {
    fontSize: 22,
  },
  imageGalleryMobile: {
    flexDirection: "column",
  },
  mainImageMobile: {
    width: "100%",
    height: 250,
    borderRadius: BorderRadius.lg,
  },
  showAllPhotosButtonMobile: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  mobileButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  descriptionBelowImagesMobile: {
    marginTop: Spacing.sm,
  },
  contentContainerMobile: {
    flexDirection: "column",
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },
  mainContentMobile: {
    maxWidth: "100%",
  },
  bookingCardMobile: {
    position: "relative" as any,
    width: "100%",
    marginTop: Spacing.lg,
  },
  headerMobile: {
    paddingHorizontal: Spacing.md,
  },
  scrollContentMobile: {
    paddingBottom: Spacing.xl,
    paddingTop: 60 + Spacing.md,
  },
});
