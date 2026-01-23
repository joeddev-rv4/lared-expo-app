import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Property, mapAPIPropertyToProperty } from "@/data/properties";
import { Spacing, Colors, BorderRadius, Shadows } from "@/constants/theme";
import { fetchPropiedadById } from "@/lib/api";
import { getUserProfileFromFirebase } from "@/lib/portfolioService";

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
  const isTablet = width >= 768 && width < 1024;

  const [property, setProperty] = useState<Property | null>(null);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const handleSubmitContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.phone) {
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitSuccess(true);
      setContactForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("Error submitting contact:", err);
    } finally {
      setSubmitting(false);
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
    ?.filter((img) => ["Imagen", "Video", "masterplan"].includes(img.tipo))
    ?.map((img) => img.url) || [property?.imageUrl || ""];

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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/la_red_blanco_negro3.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerRight}>
            <Pressable style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={20} color="#222222" />
              <ThemedText style={styles.shareButtonText}>Compartir</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isMobile && styles.scrollContentMobile,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroSection, isMobile && styles.heroSectionMobile]}>
          <View style={[styles.imageGallery, isMobile && styles.imageGalleryMobile]}>
            <Pressable
              style={[styles.mainImageContainer, isMobile && styles.mainImageContainerMobile]}
              onPress={() => {
                setCurrentImageIndex(0);
                setShowGallery(true);
              }}
            >
              <Image
                source={{ uri: galleryImages[0] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <View style={styles.propertyBadge}>
                  <ThemedText style={styles.badgeText}>Destacado</ThemedText>
                </View>
              </View>
            </Pressable>
            {!isMobile && galleryImages.length > 1 ? (
              <View style={styles.thumbnailGrid}>
                {galleryImages.slice(1, 5).map((img, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.thumbnailContainer,
                      index === 1 && styles.thumbnailTopRight,
                      index === 3 && styles.thumbnailBottomRight,
                    ]}
                    onPress={() => {
                      setCurrentImageIndex(index + 1);
                      setShowGallery(true);
                    }}
                  >
                    <Image source={{ uri: img }} style={styles.thumbnail} resizeMode="cover" />
                    {index === 3 && galleryImages.length > 5 ? (
                      <View style={styles.moreImagesOverlay}>
                        <ThemedText style={styles.moreImagesText}>
                          +{galleryImages.length - 5}
                        </ThemedText>
                      </View>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
          <Pressable
            style={[styles.viewAllButton, isMobile && styles.viewAllButtonMobile]}
            onPress={() => setShowGallery(true)}
          >
            <Ionicons name="images-outline" size={18} color="#222222" />
            <ThemedText style={styles.viewAllText}>
              Ver todas ({galleryImages.length})
            </ThemedText>
          </Pressable>
        </View>

        <View style={[styles.contentSection, isMobile && styles.contentSectionMobile]}>
          <View style={[styles.mainContent, isMobile && styles.mainContentMobile]}>
            <View style={styles.titleSection}>
              <ThemedText style={styles.propertyTitle}>{property.title}</ThemedText>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={18} color="#717171" />
                <ThemedText style={styles.locationText}>{property.location}</ThemedText>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="bed-outline" size={22} color="#222222" />
                <ThemedText style={styles.statValue}>{property.bedrooms}</ThemedText>
                <ThemedText style={styles.statLabel}>Habitaciones</ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="water-outline" size={22} color="#222222" />
                <ThemedText style={styles.statValue}>{property.bathrooms}</ThemedText>
                <ThemedText style={styles.statLabel}>Baños</ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="expand-outline" size={22} color="#222222" />
                <ThemedText style={styles.statValue}>{property.area}</ThemedText>
                <ThemedText style={styles.statLabel}>m²</ThemedText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.descriptionSection}>
              <ThemedText style={styles.sectionTitle}>Descripción</ThemedText>
              <ThemedText style={styles.descriptionText}>
                {property.descripcionCorta || property.description}
              </ThemedText>
              {property.descripcionLarga ? (
                <ThemedText style={[styles.descriptionText, { marginTop: Spacing.md }]}>
                  {property.descripcionLarga}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.divider} />

            {property.caracteristicas && property.caracteristicas.length > 0 ? (
              <>
                <View style={styles.featuresSection}>
                  <ThemedText style={styles.sectionTitle}>Características</ThemedText>
                  <View style={styles.featuresGrid}>
                    {property.caracteristicas.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.light.primary} />
                        <ThemedText style={styles.featureText}>{feature}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            ) : null}

            {property.proyectoCaracteristicas && property.proyectoCaracteristicas.length > 0 ? (
              <>
                <View style={styles.featuresSection}>
                  <ThemedText style={styles.sectionTitle}>Amenidades del Proyecto</ThemedText>
                  <View style={styles.featuresGrid}>
                    {property.proyectoCaracteristicas.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons name="star" size={20} color="#FFB800" />
                        <ThemedText style={styles.featureText}>{feature}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            ) : null}
          </View>

          <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
            <View style={styles.priceCard}>
              <View style={styles.priceHeader}>
                <ThemedText style={styles.priceLabel}>Precio</ThemedText>
                <ThemedText style={styles.priceValue}>{formatPrice(property.price)}</ThemedText>
              </View>

              {seller ? (
                <View style={styles.sellerSection}>
                  <View style={styles.sellerHeader}>
                    <View style={styles.sellerAvatar}>
                      {seller.photoURL ? (
                        <Image source={{ uri: seller.photoURL }} style={styles.sellerPhoto} />
                      ) : (
                        <Ionicons name="person" size={28} color="#717171" />
                      )}
                    </View>
                    <View style={styles.sellerInfo}>
                      <ThemedText style={styles.sellerName}>{seller.name}</ThemedText>
                      <ThemedText style={styles.sellerRole}>Agente Inmobiliario</ThemedText>
                    </View>
                  </View>
                  <View style={styles.sellerContact}>
                    {seller.phone ? (
                      <View style={styles.contactItem}>
                        <Ionicons name="call-outline" size={16} color="#717171" />
                        <ThemedText style={styles.contactText}>{seller.phone}</ThemedText>
                      </View>
                    ) : null}
                    {seller.email ? (
                      <View style={styles.contactItem}>
                        <Ionicons name="mail-outline" size={16} color="#717171" />
                        <ThemedText style={styles.contactText}>{seller.email}</ThemedText>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}

              <View style={styles.contactFormSection}>
                <ThemedText style={styles.formTitle}>Solicitar información</ThemedText>

                {submitSuccess ? (
                  <View style={styles.successMessage}>
                    <Ionicons name="checkmark-circle" size={48} color={Colors.light.primary} />
                    <ThemedText style={styles.successText}>
                      ¡Gracias! Tu solicitud ha sido enviada.
                    </ThemedText>
                    <ThemedText style={styles.successSubtext}>
                      El agente se pondrá en contacto contigo pronto.
                    </ThemedText>
                  </View>
                ) : (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Tu nombre completo"
                      placeholderTextColor="#999"
                      value={contactForm.name}
                      onChangeText={(text) => setContactForm({ ...contactForm, name: text })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Tu correo electrónico"
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      value={contactForm.email}
                      onChangeText={(text) => setContactForm({ ...contactForm, email: text })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Tu teléfono"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                      value={contactForm.phone}
                      onChangeText={(text) => setContactForm({ ...contactForm, phone: text })}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Mensaje (opcional)"
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={4}
                      value={contactForm.message}
                      onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
                    />
                    <Pressable
                      style={[
                        styles.submitButton,
                        (!contactForm.name || !contactForm.email || !contactForm.phone) &&
                          styles.submitButtonDisabled,
                      ]}
                      onPress={handleSubmitContact}
                      disabled={!contactForm.name || !contactForm.email || !contactForm.phone || submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <ThemedText style={styles.submitButtonText}>Enviar solicitud</ThemedText>
                      )}
                    </Pressable>
                  </>
                )}
              </View>
            </View>

            <View style={styles.trustBadges}>
              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark-outline" size={24} color={Colors.light.primary} />
                <ThemedText style={styles.trustText}>Propiedad verificada</ThemedText>
              </View>
              <View style={styles.trustBadge}>
                <Ionicons name="lock-closed-outline" size={24} color={Colors.light.primary} />
                <ThemedText style={styles.trustText}>Datos seguros</ThemedText>
              </View>
              <View style={styles.trustBadge}>
                <Ionicons name="headset-outline" size={24} color={Colors.light.primary} />
                <ThemedText style={styles.trustText}>Soporte 24/7</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Image
            source={require("../../assets/images/la_red_blanco_negro3.png")}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <ThemedText style={styles.footerText}>
            La Red Inmobiliaria - Tu red de confianza
          </ThemedText>
          <ThemedText style={styles.footerCopyright}>
            © {new Date().getFullYear()} Todos los derechos reservados
          </ThemedText>
        </View>
      </ScrollView>

      <Modal visible={showGallery} animationType="fade" onRequestClose={() => setShowGallery(false)}>
        <View style={styles.galleryModal}>
          <View style={styles.galleryHeader}>
            <Pressable onPress={() => setShowGallery(false)} style={styles.galleryCloseButton}>
              <Ionicons name="close" size={28} color="#222222" />
            </Pressable>
            <ThemedText style={styles.galleryCounter}>
              {currentImageIndex + 1} / {galleryImages.length}
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: currentImageIndex * width, y: 0 }}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(newIndex);
            }}
          >
            {galleryImages.map((img, index) => (
              <View key={index} style={[styles.galleryImageWrapper, { width }]}>
                <Image source={{ uri: img }} style={styles.galleryImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
          <View style={styles.galleryNavigation}>
            <Pressable
              style={[styles.navButton, currentImageIndex === 0 && styles.navButtonDisabled]}
              onPress={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
              disabled={currentImageIndex === 0}
            >
              <Ionicons name="chevron-back" size={32} color={currentImageIndex === 0 ? "#CCC" : "#222"} />
            </Pressable>
            <Pressable
              style={[
                styles.navButton,
                currentImageIndex === galleryImages.length - 1 && styles.navButtonDisabled,
              ]}
              onPress={() => setCurrentImageIndex(Math.min(galleryImages.length - 1, currentImageIndex + 1))}
              disabled={currentImageIndex === galleryImages.length - 1}
            >
              <Ionicons
                name="chevron-forward"
                size={32}
                color={currentImageIndex === galleryImages.length - 1 ? "#CCC" : "#222"}
              />
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: 16,
    color: "#717171",
  },
  errorText: {
    marginTop: Spacing.lg,
    fontSize: 18,
    color: "#717171",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
    paddingVertical: Spacing.md,
    paddingHorizontal: 90,
    position: "fixed" as any,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 1400,
    marginHorizontal: "auto",
    width: "100%",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F7F7F7",
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 70,
  },
  scrollContentMobile: {
    paddingTop: 60,
  },
  heroSection: {
    paddingHorizontal: 90,
    paddingTop: Spacing.xl,
    position: "relative",
  },
  heroSectionMobile: {
    paddingHorizontal: Spacing.lg,
  },
  imageGallery: {
    flexDirection: "row",
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  imageGalleryMobile: {
    flexDirection: "column",
  },
  mainImageContainer: {
    flex: 2,
    height: 450,
    position: "relative",
  },
  mainImageContainerMobile: {
    height: 280,
    flex: 1,
  },
  mainImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  imageOverlay: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
  },
  propertyBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  thumbnailGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  thumbnailContainer: {
    width: "48%",
    height: "48%",
    position: "relative",
  },
  thumbnailTopRight: {
    borderTopRightRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  thumbnailBottomRight: {
    borderBottomRightRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  moreImagesOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreImagesText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  viewAllButton: {
    position: "absolute",
    bottom: Spacing.lg,
    right: 90 + Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadows.card,
  },
  viewAllButtonMobile: {
    right: Spacing.lg + Spacing.lg,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  contentSection: {
    flexDirection: "row",
    paddingHorizontal: 90,
    paddingTop: Spacing.xl * 2,
    gap: Spacing.xl * 2,
  },
  contentSectionMobile: {
    flexDirection: "column",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  mainContent: {
    flex: 1,
    maxWidth: 700,
  },
  mainContentMobile: {
    maxWidth: "100%",
  },
  titleSection: {
    marginBottom: Spacing.lg,
  },
  propertyTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#222222",
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: 16,
    color: "#717171",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#F7F7F7",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222222",
  },
  statLabel: {
    fontSize: 14,
    color: "#717171",
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: "#DDDDDD",
  },
  divider: {
    height: 1,
    backgroundColor: "#EBEBEB",
    marginVertical: Spacing.xl,
  },
  descriptionSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222222",
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#484848",
  },
  featuresSection: {
    gap: Spacing.md,
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
    paddingVertical: Spacing.sm,
  },
  featureText: {
    fontSize: 15,
    color: "#222222",
    flex: 1,
  },
  sidebar: {
    width: 380,
  },
  sidebarMobile: {
    width: "100%",
  },
  priceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    padding: Spacing.xl,
    ...Shadows.card,
  },
  priceHeader: {
    marginBottom: Spacing.lg,
  },
  priceLabel: {
    fontSize: 14,
    color: "#717171",
    marginBottom: Spacing.xs,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#222222",
  },
  sellerSection: {
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sellerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  sellerPhoto: {
    width: "100%",
    height: "100%",
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222222",
  },
  sellerRole: {
    fontSize: 14,
    color: "#717171",
  },
  sellerContact: {
    gap: Spacing.sm,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  contactText: {
    fontSize: 14,
    color: "#484848",
  },
  contactFormSection: {
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
    paddingTop: Spacing.lg,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222222",
    marginBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    marginBottom: Spacing.md,
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#DDDDDD",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  successMessage: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222222",
    marginTop: Spacing.md,
    textAlign: "center",
  },
  successSubtext: {
    fontSize: 14,
    color: "#717171",
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  trustBadges: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  trustText: {
    fontSize: 14,
    color: "#484848",
  },
  footer: {
    backgroundColor: "#F7F7F7",
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
    marginTop: Spacing.xl * 3,
  },
  footerLogo: {
    width: 100,
    height: 40,
    marginBottom: Spacing.md,
  },
  footerText: {
    fontSize: 16,
    color: "#484848",
    marginBottom: Spacing.sm,
  },
  footerCopyright: {
    fontSize: 14,
    color: "#717171",
  },
  galleryModal: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  galleryCloseButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryCounter: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  galleryImageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  galleryImage: {
    width: "100%",
    height: "80%",
  },
  galleryNavigation: {
    position: "absolute",
    bottom: "50%",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.card,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
});
