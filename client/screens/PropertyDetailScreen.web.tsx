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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { WebNavbar } from "@/components/WebNavbar";
import { useTheme } from "@/hooks/useTheme";
import { Property } from "@/data/properties";
import { Spacing, Colors, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type PropertyDetailRouteProp = RouteProp<RootStackParamList, "PropertyDetail">;

export default function PropertyDetailScreenWeb() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PropertyDetailRouteProp>();
  const { theme } = useTheme();
  const property = route.params?.property as Property;
  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

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
      <WebNavbar />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color="#222222" />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerActionButton}>
              <Feather name="share" size={18} color="#222222" />
              <ThemedText style={styles.headerActionText}>Compartir</ThemedText>
            </Pressable>
            <Pressable style={styles.headerActionButton}>
              <Feather name="heart" size={18} color="#222222" />
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
            <Pressable style={[styles.showAllPhotosButton, isMobile && styles.showAllPhotosButtonMobile]} onPress={() => setShowGallery(true)}>
              <Feather name="grid" size={14} color="#222222" />
              <ThemedText style={styles.showAllPhotosText}>Mostrar todas las fotos ({galleryImages.length})</ThemedText>
            </Pressable>
          </View>
          <ThemedText style={styles.descriptionBelowImages}>{property.descripcionCorta || property.description}</ThemedText>
        </View>

        <View style={[styles.contentContainer, isMobile && styles.contentContainerMobile]}>
          <View style={[styles.mainContent, isMobile && styles.mainContentMobile]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Feather name="share-2" size={16} color="#222222" />
                <ThemedText style={styles.statText}>10 veces compartida</ThemedText>
              </View>
              <ThemedText style={styles.statDot}>·</ThemedText>
              <View style={styles.statItem}>
                <Feather name="users" size={16} color="#222222" />
                <ThemedText style={styles.statText}>2 personas interesadas</ThemedText>
              </View>
              <ThemedText style={styles.statDot}>·</ThemedText>
              <View style={styles.statItem}>
                <Feather name="star" size={16} color="#222222" />
                <ThemedText style={styles.statText}>4.5 estrellas</ThemedText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.highlightsSection}>
              {property.caracteristicas && property.caracteristicas.length > 0 ? (
                property.caracteristicas.slice(0, 4).map((caracteristica, index) => (
                  <View key={index} style={styles.highlightItem}>
                    <Feather name="check-circle" size={24} color="#222222" />
                    <View style={styles.highlightText}>
                      <ThemedText style={styles.highlightTitle}>{caracteristica}</ThemedText>
                    </View>
                  </View>
                ))
              ) : (
                <>
                  <View style={styles.highlightItem}>
                    <Feather name="home" size={24} color="#222222" />
                    <View style={styles.highlightText}>
                      <ThemedText style={styles.highlightTitle}>Propiedad completa</ThemedText>
                      <ThemedText style={styles.highlightSubtitle}>Tendrás la propiedad solo para ti</ThemedText>
                    </View>
                  </View>
                  <View style={styles.highlightItem}>
                    <Feather name="check-circle" size={24} color="#222222" />
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
                  <Feather name={showFullDescription ? "chevron-up" : "chevron-right"} size={16} color="#222222" />
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
                      <Feather name="check" size={24} color="#222222" />
                      <ThemedText style={styles.amenityText}>{caracteristica}</ThemedText>
                    </View>
                  ))
                ) : (
                  <>
                    <View style={styles.featureItem}>
                      <Feather name="layout" size={24} color="#222222" />
                      <ThemedText style={styles.featureText}>{property.bedrooms} habitaciones</ThemedText>
                    </View>
                    <View style={styles.featureItem}>
                      <Feather name="droplet" size={24} color="#222222" />
                      <ThemedText style={styles.featureText}>{property.bathrooms} baños</ThemedText>
                    </View>
                    <View style={styles.featureItem}>
                      <Feather name="maximize" size={24} color="#222222" />
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
                <ThemedText style={styles.priceAmount}>{formatPrice(property.price)}</ThemedText>
              </View>

              <View style={styles.commissionInfo}>
                <ThemedText style={styles.commissionLabel}>Cuotas disponibles:</ThemedText>
                <ThemedText style={styles.commissionValue}>Hasta 12 cuotas</ThemedText>
              </View>

              <View style={styles.commissionInfo}>
                <ThemedText style={styles.commissionLabel}>Comisión por referido:</ThemedText>
                <ThemedText style={styles.commissionValue}>{formatPrice(Math.round(property.price * 0.02))}</ThemedText>
              </View>

              <Pressable style={styles.reserveButton}>
                <ThemedText style={styles.reserveButtonText}>Comparte y gana</ThemedText>
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
              <Feather name="arrow-left" size={24} color="#222222" />
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
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
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
    paddingBottom: Spacing.xl * 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl * 2,
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
    paddingHorizontal: Spacing.xl * 2,
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
    right: Spacing.xl * 2 + Spacing.lg,
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
    paddingHorizontal: Spacing.xl * 2,
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
    paddingHorizontal: Spacing.xl * 2,
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
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: "600",
    color: "#222222",
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
  galleryImage: {
    width: "100%",
    aspectRatio: 16 / 10,
    borderRadius: BorderRadius.lg,
  },
  galleryImageNumber: {
    marginTop: Spacing.sm,
    fontSize: 14,
    color: "#717171",
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
    position: "relative",
    bottom: 0,
    right: 0,
    marginTop: Spacing.md,
    alignSelf: "center",
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
    position: "relative",
    top: 0,
    width: "100%",
  },
});
