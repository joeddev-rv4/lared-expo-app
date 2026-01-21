import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  TextInput,
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

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");

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

        <View style={styles.imageGalleryContainer}>
          <ThemedText style={styles.propertyTitleOverlay}>{property.title}</ThemedText>
          <View style={styles.imageGallery}>
            <Image source={{ uri: property.imageUrl }} style={styles.mainImage} />
            <View style={styles.imageGrid}>
              <Image source={{ uri: property.imageUrl }} style={styles.gridImage} />
              <Image source={{ uri: property.imageUrl }} style={styles.gridImage} />
              <Image source={{ uri: property.imageUrl }} style={[styles.gridImage, styles.gridImageTopRight]} />
              <Image source={{ uri: property.imageUrl }} style={[styles.gridImage, styles.gridImageBottomRight]} />
            </View>
            <Pressable style={styles.showAllPhotosButton}>
              <Feather name="grid" size={14} color="#222222" />
              <ThemedText style={styles.showAllPhotosText}>Mostrar todas las fotos</ThemedText>
            </Pressable>
          </View>
          <ThemedText style={styles.descriptionBelowImages}>{property.description}</ThemedText>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.mainContent}>
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
              <View style={styles.highlightItem}>
                <Feather name="map-pin" size={24} color="#222222" />
                <View style={styles.highlightText}>
                  <ThemedText style={styles.highlightTitle}>Excelente ubicación</ThemedText>
                  <ThemedText style={styles.highlightSubtitle}>100% de los huéspedes dieron 5 estrellas</ThemedText>
                </View>
              </View>
              <View style={styles.highlightItem}>
                <Feather name="calendar" size={24} color="#222222" />
                <View style={styles.highlightText}>
                  <ThemedText style={styles.highlightTitle}>Cancelación gratuita por 48 horas</ThemedText>
                  <ThemedText style={styles.highlightSubtitle}>Obtén un reembolso completo si cambias de opinión</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.descriptionSection}>
              <ThemedText style={styles.sectionTitle}>Acerca de este espacio</ThemedText>
              <ThemedText style={styles.descriptionText}>{property.description}</ThemedText>
              <Pressable style={styles.showMoreButton}>
                <ThemedText style={styles.showMoreText}>Mostrar más</ThemedText>
                <Feather name="chevron-right" size={16} color="#222222" />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.featuresSection}>
              <ThemedText style={styles.sectionTitle}>Lo que este lugar ofrece</ThemedText>
              <View style={styles.featuresGrid}>
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
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.amenitiesSection}>
              <ThemedText style={styles.sectionTitle}>Servicios</ThemedText>
              <View style={styles.amenitiesGrid}>
                {property.amenities.slice(0, 10).map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Feather 
                      name={(amenityIcons[amenity] || "check") as any} 
                      size={24} 
                      color="#222222" 
                    />
                    <ThemedText style={styles.amenityText}>{amenity}</ThemedText>
                  </View>
                ))}
              </View>
              {property.amenities.length > 10 ? (
                <Pressable style={styles.showAllAmenitiesButton}>
                  <ThemedText style={styles.showAllAmenitiesText}>
                    Mostrar los {property.amenities.length} servicios
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.bookingCard}>
            <View style={styles.bookingCardInner}>
              <View style={styles.priceRow}>
                <ThemedText style={styles.priceAmount}>{formatPrice(property.price)}</ThemedText>
                <ThemedText style={styles.priceUnit}>{property.priceUnit}</ThemedText>
              </View>
              
              <View style={styles.ratingRowSmall}>
                <Feather name="star" size={12} color="#222222" />
                <ThemedText style={styles.ratingTextSmall}>{property.rating.toFixed(2)}</ThemedText>
                <ThemedText style={styles.reviewCountSmall}>({property.reviewCount} evaluaciones)</ThemedText>
              </View>

              <View style={styles.bookingForm}>
                <View style={styles.dateInputRow}>
                  <View style={[styles.dateInput, styles.dateInputLeft]}>
                    <ThemedText style={styles.dateInputLabel}>LLEGADA</ThemedText>
                    <TextInput
                      style={styles.dateInputField}
                      placeholder="Agregar fecha"
                      placeholderTextColor="#717171"
                      value={checkIn}
                      onChangeText={setCheckIn}
                    />
                  </View>
                  <View style={[styles.dateInput, styles.dateInputRight]}>
                    <ThemedText style={styles.dateInputLabel}>SALIDA</ThemedText>
                    <TextInput
                      style={styles.dateInputField}
                      placeholder="Agregar fecha"
                      placeholderTextColor="#717171"
                      value={checkOut}
                      onChangeText={setCheckOut}
                    />
                  </View>
                </View>
                <View style={styles.guestsInput}>
                  <ThemedText style={styles.dateInputLabel}>HUÉSPEDES</ThemedText>
                  <TextInput
                    style={styles.dateInputField}
                    placeholder="1 huésped"
                    placeholderTextColor="#717171"
                    value={guests}
                    onChangeText={setGuests}
                  />
                </View>
              </View>

              <Pressable style={styles.reserveButton}>
                <ThemedText style={styles.reserveButtonText}>Reservar</ThemedText>
              </Pressable>

              <ThemedText style={styles.noChargeText}>No se hará ningún cargo por el momento</ThemedText>

              <View style={styles.priceBreakdown}>
                <View style={styles.priceBreakdownRow}>
                  <ThemedText style={styles.priceBreakdownLabel}>{formatPrice(property.price)} x 5 noches</ThemedText>
                  <ThemedText style={styles.priceBreakdownValue}>{formatPrice(property.price * 5)}</ThemedText>
                </View>
                <View style={styles.priceBreakdownRow}>
                  <ThemedText style={styles.priceBreakdownLabel}>Tarifa de limpieza</ThemedText>
                  <ThemedText style={styles.priceBreakdownValue}>{formatPrice(500)}</ThemedText>
                </View>
                <View style={styles.priceBreakdownRow}>
                  <ThemedText style={styles.priceBreakdownLabel}>Tarifa de servicio</ThemedText>
                  <ThemedText style={styles.priceBreakdownValue}>{formatPrice(Math.round(property.price * 0.14))}</ThemedText>
                </View>
              </View>

              <View style={styles.totalRow}>
                <ThemedText style={styles.totalLabel}>Total</ThemedText>
                <ThemedText style={styles.totalValue}>
                  {formatPrice(property.price * 5 + 500 + Math.round(property.price * 0.14))}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
  },
  propertyTitleOverlay: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222222",
    marginBottom: Spacing.md,
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
  reserveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.md,
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
});
