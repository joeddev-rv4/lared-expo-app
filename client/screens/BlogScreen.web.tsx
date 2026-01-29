import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Property, mapAPIPropertyToProperty } from "@/data/properties";
import { Spacing, Colors, BorderRadius, Shadows } from "@/constants/theme";
import { fetchPropiedadById } from "@/lib/api";
import { getUserProfileFromFirebase } from "@/lib/portfolioService";
import ContactFormWeb from "@/components/ContactFormWeb";

type BlogParams = {
  userId: string;
  propertyId: string;
};

interface SellerInfo {
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
}

export default function BlogScreenWeb() {
  const route = useRoute<any>();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const params = route.params as BlogParams;

  const isMobile = width < 768;

  const [property, setProperty] = useState<Property | null>(null);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, [params.userId, params.propertyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [propertyData, sellerData] = await Promise.all([
        fetchPropiedadById(params.propertyId),
        getUserProfileFromFirebase(params.userId),
      ]);

      if (propertyData) {
        setProperty(mapAPIPropertyToProperty(propertyData));
      } else {
        setError("Propiedad no encontrada");
      }

      if (sellerData) {
        setSeller({
          name: sellerData.name || "Agente Inmobiliario",
          email: sellerData.email || "",
          phone: sellerData.phone || "",
          photoURL: sellerData.photoURL,
        });
      }
    } catch (err) {
      console.error("Error loading blog data:", err);
      setError("Error al cargar la información");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const galleryImages = property?.imagenes
    ?.filter((img) => ["Imagen", "Video"].includes(img.tipo))
    ?.map((img) => img.url) || [property?.imageUrl || ""];

  const masterplanImage = property?.imagenes?.find((img) => img.tipo === "masterplan")?.url;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={styles.loadingText}>Cargando propiedad...</ThemedText>
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color="#717171" />
        <ThemedText style={styles.errorText}>{error || "Propiedad no encontrada"}</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* 2. Hero Section (Full Image + Form) */}
        <View style={[styles.heroSection, isMobile && styles.heroSectionMobile]}>
          <Image
            source={{ uri: galleryImages[0] }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={[styles.heroContent, isMobile && styles.heroContentMobile]}>
              <View style={styles.heroFormContainer}>
                <ContactFormWeb
                  userId={params.userId}
                  propertyId={params.propertyId}
                  title="Solicitar información"
                />
              </View>
            </View>
          </View>
        </View>

        {/* 3. Info & Carousel Section */}
        <View style={[styles.infoSection, isMobile && styles.infoSectionMobile]}>
          {/* Left Side: Info */}
          <View style={styles.infoColumn}>
            <ThemedText style={styles.propertyTitle}>{property.title}</ThemedText>
            <ThemedText style={styles.propertyPrice}>{formatPrice(property.price)}</ThemedText>
            <ThemedText style={styles.propertyCuota}>Cuota desde: {formatPrice(Math.round(property.price / 180))}/mes</ThemedText>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={20} color="#717171" />
              <ThemedText style={styles.locationText}>{property.location}</ThemedText>
            </View>

            <View style={styles.divider} />

            <ThemedText style={styles.sectionTitle}>Descripción</ThemedText>
            <ThemedText style={styles.descriptionText}>
              {property.descripcionCorta || property.description}
            </ThemedText>
            {property.descripcionLarga && (
              <ThemedText style={[styles.descriptionText, { marginTop: Spacing.md }]}>
                {property.descripcionLarga}
              </ThemedText>
            )}

            <View style={styles.divider} />

            <ThemedText style={styles.sectionTitle}>Características</ThemedText>
            <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <Ionicons name="bed-outline" size={20} color="#555" />
                <ThemedText style={styles.featureText}>{property.bedrooms} Habitaciones</ThemedText>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="water-outline" size={20} color="#555" />
                <ThemedText style={styles.featureText}>{property.bathrooms} Baños</ThemedText>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="expand-outline" size={20} color="#555" />
                <ThemedText style={styles.featureText}>{property.area} m²</ThemedText>
              </View>
              {property.caracteristicas?.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={Colors.light.primary} />
                  <ThemedText style={styles.featureText}>{feature}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Right Side: Carousel/Gallery */}
          <View style={styles.carouselColumn}>
            <View style={styles.galleryGrid}>
              {galleryImages.slice(0, 4).map((img, index) => (
                <Pressable
                  key={index}
                  style={styles.galleryGridItem}
                  onPress={() => {
                    setCurrentImageIndex(index);
                    setShowGallery(true);
                  }}
                >
                  <Image source={{ uri: img }} style={styles.galleryGridImage} resizeMode="cover" />
                  {index === 3 && galleryImages.length > 4 && (
                    <View style={styles.moreImagesOverlay}>
                      <ThemedText style={styles.moreImagesText}>+{galleryImages.length - 4}</ThemedText>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.viewAllButton} onPress={() => setShowGallery(true)}>
              <Ionicons name="images-outline" size={18} color="#222" />
              <ThemedText style={styles.viewAllText}>Ver galería completa</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* 4. Location Section (Masterplan) */}
        {masterplanImage && (
          <View style={[styles.sectionContainer, isMobile && styles.sectionContainerMobile]}>
            <ThemedText style={styles.sectionHeaderTitle}>Ubicación del Proyecto</ThemedText>
            <View style={styles.masterplanContainer}>
              <Image source={{ uri: masterplanImage }} style={styles.masterplanImage} resizeMode="contain" />
            </View>
          </View>
        )}

        {/* 5. Amenities Section */}
        {property.proyectoCaracteristicas && property.proyectoCaracteristicas.length > 0 && (
          <View style={[styles.sectionContainer, { backgroundColor: '#F7F7F7' }, isMobile && styles.sectionContainerMobile]}>
            <ThemedText style={styles.sectionHeaderTitle}>Amenidades del Proyecto</ThemedText>
            <View style={styles.amenitiesGrid}>
              {property.proyectoCaracteristicas.map((amenity, index) => (
                <View key={index} style={styles.amenityCard}>
                  <Ionicons name="star" size={24} color="#FFB800" />
                  <ThemedText style={styles.amenityText}>{amenity}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 6. Contact Form Section */}
        <View style={[styles.sectionContainer, isMobile && styles.sectionContainerMobile]}>
          <View style={{ maxWidth: 600, width: '100%', alignSelf: 'center' }}>
            <ContactFormWeb
              userId={params.userId}
              propertyId={params.propertyId}
              title="¿Te interesa esta propiedad?"
            />
          </View>
        </View>

        {/* 7. Footer */}
        <View style={[styles.footer, isMobile && styles.footerMobile]}>
          <View style={styles.footerContent}>
            <View style={styles.footerColumn}>
              <Image
                source={require("../../assets/images/icon.png")}
                style={styles.footerLogo}
                resizeMode="contain"
              />
              <ThemedText style={styles.footerDescription}>
                La Red Inmobiliaria es tu plataforma de confianza para encontrar la propiedad de tus sueños.
              </ThemedText>
            </View>

            <View style={styles.footerColumn}>
              <ThemedText style={styles.footerTitle}>Enlaces Rápidos</ThemedText>
              <ThemedText style={styles.footerLink}>Inicio</ThemedText>
              <ThemedText style={styles.footerLink}>Propiedades</ThemedText>
              <ThemedText style={styles.footerLink}>Blog</ThemedText>
              <ThemedText style={styles.footerLink}>Contacto</ThemedText>
            </View>

            <View style={styles.footerColumn}>
              <ThemedText style={styles.footerTitle}>Contacto</ThemedText>
              <View style={styles.contactRow}>
                <Ionicons name="location-outline" size={18} color="#717171" />
                <ThemedText style={styles.contactText}>Ciudad de Guatemala, Guatemala</ThemedText>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={18} color="#717171" />
                <ThemedText style={styles.contactText}>info@laredinmobiliaria.com</ThemedText>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={18} color="#717171" />
                <ThemedText style={styles.contactText}>+502 1234 5678</ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.footerBottom}>
            <ThemedText style={styles.copyrightText}>
              © {new Date().getFullYear()} La Red Inmobiliaria. Todos los derechos reservados.
            </ThemedText>
          </View>
        </View>

      </ScrollView>

      {/* Gallery Modal */}
      <Modal visible={showGallery} animationType="fade" onRequestClose={() => setShowGallery(false)}>
        <View style={styles.galleryModal}>
          <Pressable onPress={() => setShowGallery(false)} style={styles.closeButton}>
            <Ionicons name="close" size={32} color="#fff" />
          </Pressable>
          <Image
            source={{ uri: galleryImages[currentImageIndex] }}
            style={styles.modalImage}
            resizeMode="contain"
          />
          <View style={styles.modalControls}>
            <Pressable
              onPress={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
              disabled={currentImageIndex === 0}
            >
              <Ionicons name="chevron-back" size={48} color={currentImageIndex > 0 ? "#fff" : "#555"} />
            </Pressable>
            <ThemedText style={{ color: '#fff' }}>{currentImageIndex + 1} / {galleryImages.length}</ThemedText>
            <Pressable
              onPress={() => setCurrentImageIndex(Math.min(galleryImages.length - 1, currentImageIndex + 1))}
              disabled={currentImageIndex === galleryImages.length - 1}
            >
              <Ionicons name="chevron-forward" size={48} color={currentImageIndex < galleryImages.length - 1 ? "#fff" : "#555"} />
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    color: "#717171",
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: 18,
    color: "#717171",
  },
  header: {
    height: 70,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
    justifyContent: "center",
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: Spacing.xl,
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerRight: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "#F7F7F7",
    borderRadius: BorderRadius.full,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  scrollView: {
    flex: 1,
    marginTop: 70, // Header height
  },
  heroSection: {
    height: 600, // Full screen-ish
    width: "100%",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
  },
  heroContent: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    justifyContent: "flex-start", // Left align
  },
  heroSectionMobile: {
    height: 550,
  },
  heroContentMobile: {
    justifyContent: "center",
  },
  heroFormContainer: {
    width: 400,
    maxWidth: "100%",
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  infoSection: {
    flexDirection: "row",
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl * 2,
  },
  infoSectionMobile: {
    flexDirection: "column",
    paddingVertical: Spacing.xl,
    gap: Spacing.lg,
  },
  infoColumn: {
    flex: 1,
  },
  carouselColumn: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#222",
    marginBottom: Spacing.xs,
  },
  propertyPrice: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  propertyCuota: {
    fontSize: 16,
    color: "#717171",
    marginBottom: Spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  locationText: {
    fontSize: 16,
    color: "#717171",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  divider: {
    height: 1,
    backgroundColor: "#EBEBEB",
    marginVertical: Spacing.lg,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    width: "48%",
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontSize: 15,
    color: "#444",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  galleryGridItem: {
    width: "48%",
    aspectRatio: 1.5,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    position: 'relative',
  },
  galleryGridImage: {
    width: "100%",
    height: "100%",
  },
  moreImagesOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreImagesText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: BorderRadius.full,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  sectionContainer: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  sectionHeaderTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  sectionContainerMobile: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  masterplanContainer: {
    width: "100%",
    height: 500,
    backgroundColor: "#F9F9F9",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  masterplanImage: {
    width: "100%",
    height: "100%",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  amenityCard: {
    width: 150,
    padding: Spacing.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  amenityText: {
    fontSize: 14,
    textAlign: "center",
    color: "#444",
  },
  footer: {
    backgroundColor: "#1A1A1A",
    paddingTop: Spacing.xl * 3,
    paddingBottom: Spacing.xl,
  },
  footerMobile: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  footerContent: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    flexWrap: 'wrap',
    gap: Spacing.xl,
  },
  footerColumn: {
    flex: 1,
    minWidth: 250,
  },
  footerLogo: {
    width: 150,
    height: 50,
    tintColor: "#FFFFFF",
    marginBottom: Spacing.md,
  },
  footerDescription: {
    color: "#CCCCCC",
    lineHeight: 24,
    fontSize: 14,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: Spacing.lg,
  },
  footerLink: {
    color: "#CCCCCC",
    marginBottom: Spacing.md,
    fontSize: 14,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  contactText: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  footerBottom: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    borderTopWidth: 1,
    borderTopColor: "#333",
    marginTop: Spacing.xl * 2,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  copyrightText: {
    color: "#666",
    fontSize: 14,
  },
  galleryModal: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  modalImage: {
    width: "100%",
    height: "80%",
  },
  modalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.lg,
  },
});
