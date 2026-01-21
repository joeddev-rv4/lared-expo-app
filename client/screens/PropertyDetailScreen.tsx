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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Property } from "@/data/properties";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.75;

type PropertyDetailRouteProp = RouteProp<RootStackParamList, "PropertyDetail">;

export default function PropertyDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PropertyDetailRouteProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const property = route.params?.property as Property;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const filteredImages = property?.imagenes
    ?.filter(img => ["Imagen", "Video", "masterplan"].includes(img.tipo))
    ?.map(img => img.url) || [];
  const images = filteredImages.length > 0 ? filteredImages : [property?.imageUrl || ""];

  if (!property) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Propiedad no encontrada</ThemedText>
      </View>
    );
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const amenities = property.proyectoCaracteristicas && property.proyectoCaracteristicas.length > 0
    ? property.proyectoCaracteristicas.map(c => ({ icon: "check", label: c }))
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

  const shortDescription = property.descripcionCorta || property.description || "";
  const fullDescription = property.descripcionLarga || property.description || "Esta hermosa propiedad ofrece un espacio cómodo y moderno en una ubicación privilegiada.";

  return (
    <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
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
          <View style={[styles.floatingHeader, { paddingTop: insets.top + 10 }]}>
            <Pressable onPress={handleBack} style={styles.floatingButton}>
              <Feather name="chevron-left" size={24} color="#222222" />
            </Pressable>
            <View style={styles.floatingHeaderRight}>
              <Pressable onPress={handleShare} style={styles.floatingButton}>
                <Feather name="share" size={20} color="#222222" />
              </Pressable>
              <Pressable onPress={handleFavorite} style={styles.floatingButton}>
                <Feather 
                  name="heart" 
                  size={20} 
                  color={isFavorite ? Colors.light.primary : "#222222"} 
                />
              </Pressable>
            </View>
          </View>
          <View style={styles.paginationContainer}>
            <Pressable style={styles.pagination} onPress={() => setShowGallery(true)}>
              <Feather name="grid" size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
              <ThemedText style={styles.paginationText}>
                {currentImageIndex + 1} / {images.length}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.title}>{property.title}</ThemedText>
          
          {shortDescription ? (
            <ThemedText style={styles.shortDescription}>{shortDescription}</ThemedText>
          ) : null}
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="share-2" size={14} color="#222222" />
              <ThemedText style={styles.statText}>10 veces compartida</ThemedText>
            </View>
            <ThemedText style={styles.statDot}>·</ThemedText>
            <View style={styles.statItem}>
              <Feather name="users" size={14} color="#222222" />
              <ThemedText style={styles.statText}>2 personas interesadas</ThemedText>
            </View>
            <ThemedText style={styles.statDot}>·</ThemedText>
            <View style={styles.statItem}>
              <Feather name="star" size={14} color="#222222" />
              <ThemedText style={styles.statText}>4.5 estrellas</ThemedText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.highlightsSection}>
            {property.caracteristicas && property.caracteristicas.length > 0 ? (
              property.caracteristicas.slice(0, 4).map((caracteristica, index) => (
                <View key={index} style={styles.highlight}>
                  <View style={styles.highlightIcon}>
                    <Feather name="check-circle" size={24} color="#222222" />
                  </View>
                  <View style={styles.highlightContent}>
                    <ThemedText style={styles.highlightTitle}>{caracteristica}</ThemedText>
                  </View>
                </View>
              ))
            ) : (
              <>
                <View style={styles.highlight}>
                  <View style={styles.highlightIcon}>
                    <Feather name="home" size={24} color="#222222" />
                  </View>
                  <View style={styles.highlightContent}>
                    <ThemedText style={styles.highlightTitle}>Propiedad completa</ThemedText>
                    <ThemedText style={styles.highlightDescription}>
                      Tendrás la propiedad solo para ti
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.highlight}>
                  <View style={styles.highlightIcon}>
                    <Feather name="zap" size={24} color="#222222" />
                  </View>
                  <View style={styles.highlightContent}>
                    <ThemedText style={styles.highlightTitle}>Limpieza mejorada</ThemedText>
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
            <ThemedText style={styles.sectionTitle}>Acerca de este espacio</ThemedText>
            <ThemedText 
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 4}
            >
              {fullDescription}
            </ThemedText>
            {fullDescription.length > 200 ? (
              <Pressable onPress={() => setShowFullDescription(!showFullDescription)}>
                <ThemedText style={styles.showMore}>
                  {showFullDescription ? "Mostrar menos" : "Mostrar más"} 
                  <Feather name={showFullDescription ? "chevron-up" : "chevron-right"} size={14} color="#222222" />
                </ThemedText>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.amenitiesSection}>
            <ThemedText style={styles.sectionTitle}>Lo que este lugar ofrece</ThemedText>
            <View style={styles.amenitiesGrid}>
              {amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Feather name={amenity.icon as any} size={24} color="#222222" />
                  <ThemedText style={styles.amenityLabel}>{amenity.label}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.priceInfoContainer}>
          <ThemedText style={styles.price}>{formatPrice(property.price)}</ThemedText>
          <ThemedText style={styles.priceDetail}>Hasta 12 cuotas</ThemedText>
          <ThemedText style={styles.priceDetail}>Comisión: {formatPrice(Math.round(property.price * 0.02))}</ThemedText>
        </View>
        <Pressable style={styles.reserveButton}>
          <ThemedText style={styles.reserveButtonText}>Comparte y gana</ThemedText>
        </Pressable>
      </View>

      <Modal
        visible={showGallery}
        animationType="slide"
        onRequestClose={() => setShowGallery(false)}
      >
        <View style={[styles.galleryModal, { paddingTop: insets.top }]}>
          <View style={styles.galleryHeader}>
            <Pressable onPress={() => setShowGallery(false)} style={styles.galleryBackButton}>
              <Feather name="arrow-left" size={24} color="#222222" />
            </Pressable>
            <ThemedText style={styles.galleryTitle}>
              {images.length} fotos
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView 
            style={styles.galleryScrollView}
            contentContainerStyle={[styles.galleryContent, { paddingBottom: insets.bottom + 20 }]}
            showsVerticalScrollIndicator={false}
          >
            {images.map((imageUrl, index) => (
              <View key={index} style={styles.galleryImageContainer}>
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
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
});
