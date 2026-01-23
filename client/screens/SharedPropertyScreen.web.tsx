import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { Property, mapAPIPropertyToProperty } from "@/data/properties";
import { fetchPropiedades } from "@/lib/api";
import { getUserData } from "@/lib/auth";
import { FirestoreUser } from "@/lib/user.interface";
import { Spacing, Colors, BorderRadius, Shadows } from "@/constants/theme";

type SharedPropertyParams = {
  propertyId: string;
  odooId: string;
  odooContactId: string;
};

export default function SharedPropertyScreenWeb() {
  const route = useRoute<any>();
  const params = route.params as SharedPropertyParams;
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const [property, setProperty] = useState<Property | null>(null);
  const [broker, setBroker] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.propertyId, params.odooId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [apiProperties, userData] = await Promise.all([
        fetchPropiedades(),
        params.odooId ? getUserData(params.odooId) : null,
      ]);

      const mappedProperties = apiProperties.map(mapAPIPropertyToProperty);
      const foundProperty = mappedProperties.find(
        (p) => p.id === params.propertyId
      );

      setProperty(foundProperty || null);
      setBroker(userData);
    } catch (error) {
      console.error("Error loading shared property:", error);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={styles.loadingText}>Cargando propiedad...</ThemedText>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="home-outline" size={64} color="#CCCCCC" />
        <ThemedText style={styles.errorTitle}>Propiedad no encontrada</ThemedText>
        <ThemedText style={styles.errorText}>
          La propiedad que buscas no existe o ha sido removida.
        </ThemedText>
      </View>
    );
  }

  const filteredImages =
    property?.imagenes
      ?.filter((img) => ["Imagen", "Video", "masterplan"].includes(img.tipo))
      ?.map((img) => img.url) || [];
  const galleryImages =
    filteredImages.length > 0 ? filteredImages : [property?.imageUrl || ""];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBar}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.contentWrapper, isMobile && styles.contentWrapperMobile]}>
          {broker && (
            <View style={[styles.brokerCard, isMobile && styles.brokerCardMobile]}>
              <View style={styles.brokerAvatarContainer}>
                <View style={styles.brokerAvatar}>
                  {broker.photoURL ? (
                    <Image
                      source={{ uri: broker.photoURL }}
                      style={styles.brokerAvatarImage}
                    />
                  ) : (
                    <Ionicons name="person" size={32} color="#717171" />
                  )}
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.brokerInfo}>
                <ThemedText style={styles.brokerName}>
                  {broker.displayName || broker.nombre || "Asesor Inmobiliario"}
                </ThemedText>
                <ThemedText style={styles.brokerLabel}>Asesor verificado</ThemedText>
              </View>
              <View style={[styles.brokerContact, isMobile && styles.brokerContactMobile]}>
                {broker.email && (
                  <View style={styles.contactItem}>
                    <ThemedText style={styles.contactLabel}>Email</ThemedText>
                    <ThemedText style={styles.contactValue}>{broker.email}</ThemedText>
                  </View>
                )}
                {broker.telefono && (
                  <View style={styles.contactItem}>
                    <ThemedText style={styles.contactLabel}>Teléfono</ThemedText>
                    <ThemedText style={styles.contactValue}>{broker.telefono}</ThemedText>
                  </View>
                )}
              </View>
            </View>
          )}

          <ThemedText style={styles.sectionHeading}>Propiedad Compartida</ThemedText>

          <View style={[styles.propertyCard, isMobile && styles.propertyCardMobile]}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: galleryImages[currentImageIndex] }}
                style={styles.propertyImage}
              />
              {galleryImages.length > 1 && (
                <>
                  <Pressable
                    style={[styles.imageNavButton, styles.imageNavButtonLeft]}
                    onPress={handlePrevImage}
                  >
                    <Ionicons name="chevron-back" size={20} color="#222222" />
                  </Pressable>
                  <Pressable
                    style={[styles.imageNavButton, styles.imageNavButtonRight]}
                    onPress={handleNextImage}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#222222" />
                  </Pressable>
                  <View style={styles.imageIndicators}>
                    {galleryImages.slice(0, 5).map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.indicator,
                          index === currentImageIndex && styles.indicatorActive,
                        ]}
                      />
                    ))}
                  </View>
                </>
              )}
            </View>

            <View style={styles.propertyDetails}>
              <View style={styles.propertyHeader}>
                <ThemedText style={styles.propertyTitle}>{property.title}</ThemedText>
                <ThemedText style={styles.propertyArea}>{property.area} m²</ThemedText>
              </View>
              <ThemedText style={styles.propertyLocation}>
                {property.location}
              </ThemedText>
              <ThemedText style={styles.propertyPrice}>
                {formatPrice(property.price)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <ThemedText style={styles.sectionTitle}>Descripción</ThemedText>
            <ThemedText
              style={styles.descriptionText}
              numberOfLines={showFullDescription ? undefined : 6}
            >
              {property.descripcionLarga || property.descripcionCorta || property.description}
            </ThemedText>
            {(property.descripcionLarga || property.description || "").length > 300 && (
              <Pressable
                style={styles.showMoreButton}
                onPress={() => setShowFullDescription(!showFullDescription)}
              >
                <ThemedText style={styles.showMoreText}>
                  {showFullDescription ? "Mostrar menos" : "Mostrar más"}
                </ThemedText>
                <Ionicons
                  name={showFullDescription ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#bf0a0a"
                />
              </Pressable>
            )}
          </View>

          {property.caracteristicas && property.caracteristicas.length > 0 && (
            <View style={styles.featuresSection}>
              <ThemedText style={styles.sectionTitle}>Características</ThemedText>
              <View style={styles.featuresGrid}>
                {property.caracteristicas.map((caracteristica, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#bf0a0a" />
                    <ThemedText style={styles.featureText}>{caracteristica}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {property.proyectoCaracteristicas && property.proyectoCaracteristicas.length > 0 && (
            <View style={styles.featuresSection}>
              <ThemedText style={styles.sectionTitle}>Amenidades del Proyecto</ThemedText>
              <View style={styles.featuresGrid}>
                {property.proyectoCaracteristicas.map((caracteristica, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="star" size={20} color="#bf0a0a" />
                    <ThemedText style={styles.featureText}>{caracteristica}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.ctaSection}>
            <ThemedText style={styles.ctaTitle}>¿Te interesa esta propiedad?</ThemedText>
            <ThemedText style={styles.ctaText}>
              Contacta al asesor para más información o para agendar una visita.
            </ThemedText>
            {broker?.telefono && (
              <Pressable
                style={styles.ctaButton}
                onPress={() => {
                  const phone = broker.telefono?.replace(/[^0-9]/g, "");
                  window.open(`https://wa.me/${phone}?text=Hola, me interesa la propiedad: ${property.title}`, "_blank");
                }}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                <ThemedText style={styles.ctaButtonText}>Contactar por WhatsApp</ThemedText>
              </Pressable>
            )}
          </View>

          <View style={styles.footer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.footerLogo}
              resizeMode="contain"
            />
            <ThemedText style={styles.footerText}>
              La Red Inmobiliaria - Tu red de confianza
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: Spacing.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: "#717171",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222222",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 16,
    color: "#717171",
    textAlign: "center",
  },
  headerBar: {
    width: "100%",
    maxWidth: 1072,
    height: 80,
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: 104,
    borderWidth: 1,
    borderColor: "#E9E9E9",
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.card,
  },
  logo: {
    width: 120,
    height: 48,
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 1120,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl * 2,
  },
  contentWrapperMobile: {
    paddingHorizontal: Spacing.md,
  },
  brokerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E9E9E9",
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  brokerCardMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  brokerAvatarContainer: {
    position: "relative",
  },
  brokerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  brokerAvatarImage: {
    width: 64,
    height: 64,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -4,
    left: "50%",
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#bf0a0a",
    justifyContent: "center",
    alignItems: "center",
  },
  brokerInfo: {
    flex: 1,
  },
  brokerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
  },
  brokerLabel: {
    fontSize: 14,
    color: "#717171",
    marginTop: 2,
  },
  brokerContact: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  brokerContactMobile: {
    flexDirection: "column",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  contactItem: {
    gap: 2,
  },
  contactLabel: {
    fontSize: 14,
    color: "#717171",
  },
  contactValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222222",
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0A0A0A",
    marginBottom: Spacing.lg,
  },
  propertyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  propertyCardMobile: {},
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 400,
  },
  propertyImage: {
    width: "100%",
    height: "100%",
  },
  imageNavButton: {
    position: "absolute",
    top: "50%",
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageNavButtonLeft: {
    left: Spacing.md,
  },
  imageNavButtonRight: {
    right: Spacing.md,
  },
  imageIndicators: {
    position: "absolute",
    bottom: Spacing.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  indicatorActive: {
    backgroundColor: "#FFFFFF",
  },
  propertyDetails: {
    padding: Spacing.lg,
  },
  propertyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    flex: 1,
    marginRight: Spacing.md,
  },
  propertyArea: {
    fontSize: 14,
    color: "#222222",
  },
  propertyLocation: {
    fontSize: 14,
    color: "#717171",
    marginBottom: Spacing.sm,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  descriptionSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  sectionTitle: {
    fontSize: 20,
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
    marginTop: Spacing.md,
  },
  showMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#bf0a0a",
  },
  featuresSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    width: "48%",
    minWidth: 200,
  },
  featureText: {
    fontSize: 16,
    color: "#222222",
  },
  ctaSection: {
    backgroundColor: "#bf0a0a",
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  ctaText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "#25D366",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "#E9E9E9",
  },
  footerLogo: {
    width: 100,
    height: 40,
    marginBottom: Spacing.sm,
  },
  footerText: {
    fontSize: 14,
    color: "#717171",
  },
});
