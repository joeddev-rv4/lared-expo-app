import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { fetchPropiedades, APIPropiedad } from "@/lib/api";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";

interface SelectedProperty {
  id: number;
  title: string;
  location: string;
  price: number;
  imageUrl: string;
  projectName: string;
}

const STEPS = [
  { id: 1, title: "Seleccionar Propiedad", icon: "home" },
  { id: 2, title: "Datos del Cliente", icon: "user" },
  { id: 3, title: "Confirmación", icon: "check-circle" },
];

export default function CaptureClientScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<APIPropiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<SelectedProperty | null>(null);

  // Client data
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientComment, setClientComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await fetchPropiedades();
      setProperties(data);
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = useMemo(() => {
    if (!searchQuery) return properties;
    const query = searchQuery.toLowerCase();
    return properties.filter(
      (prop) =>
        prop.titulo?.toLowerCase().includes(query) ||
        prop.proyecto?.nombre_proyecto?.toLowerCase().includes(query) ||
        prop.ubicacion?.toLowerCase().includes(query) ||
        prop.propiedad?.toLowerCase().includes(query)
    );
  }, [properties, searchQuery]);

  const handleSelectProperty = (prop: APIPropiedad) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const firstImage = prop.imagenes.find((img) => img.formato === "imagen");
    setSelectedProperty({
      id: prop.id,
      title: prop.titulo || `${prop.tipo} ${prop.propiedad}`,
      location: prop.proyecto?.direccion || prop.ubicacion || "Sin ubicación",
      price: prop.precio,
      imageUrl: firstImage?.url || "https://via.placeholder.com/400x300",
      projectName: prop.proyecto?.nombre_proyecto || "",
    });
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    if (currentStep === 2) {
      if (!clientName.trim() || !clientPhone.trim()) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Campos requeridos", "Por favor ingresa el nombre y teléfono del cliente.");
        return;
      }
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "¡Solicitud Enviada!",
      `Se ha registrado el interés de ${clientName} en ${selectedProperty?.title}`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
    setIsSubmitting(false);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor:
                    currentStep >= step.id ? Colors.light.primary : theme.backgroundDefault,
                  borderColor:
                    currentStep >= step.id ? Colors.light.primary : theme.border,
                },
              ]}
            >
              {currentStep > step.id ? (
                <Ionicons name="check" size={16} color="#FFFFFF" />
              ) : (
                <Ionicons
                  name={step.icon as any}
                  size={16}
                  color={currentStep >= step.id ? "#FFFFFF" : theme.textSecondary}
                />
              )}
            </View>
            <ThemedText
              style={[
                styles.stepLabel,
                {
                  color: currentStep >= step.id ? Colors.light.primary : theme.textSecondary,
                },
              ]}
              numberOfLines={1}
            >
              {step.title}
            </ThemedText>
          </View>
          {index < STEPS.length - 1 && (
            <View
              style={[
                styles.stepLine,
                {
                  backgroundColor:
                    currentStep > step.id ? Colors.light.primary : theme.border,
                },
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderPropertyItem = ({ item }: { item: APIPropiedad }) => {
    const firstImage = item.imagenes.find((img) => img.formato === "imagen");
    return (
      <Pressable
        onPress={() => handleSelectProperty(item)}
        style={({ pressed }) => [
          styles.propertyItem,
          { backgroundColor: theme.backgroundRoot, opacity: pressed ? 0.8 : 1 },
          isDark ? null : Shadows.card,
        ]}
      >
        <Image
          source={{ uri: firstImage?.url || "https://via.placeholder.com/100x100" }}
          style={styles.propertyItemImage}
        />
        <View style={styles.propertyItemInfo}>
          <ThemedText style={styles.propertyItemTitle} numberOfLines={2}>
            {item.titulo || `${item.tipo} ${item.propiedad}`}
          </ThemedText>
          <ThemedText
            style={[styles.propertyItemProject, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {item.proyecto?.nombre_proyecto || "Sin proyecto"}
          </ThemedText>
          <ThemedText style={[styles.propertyItemPrice, { color: Colors.light.primary }]}>
            Q{item.precio.toLocaleString()}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      </Pressable>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>¿En qué propiedad está interesado?</ThemedText>
      <ThemedText style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
        Busca y selecciona la propiedad de interés
      </ThemedText>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar propiedad o proyecto..."
          placeholderTextColor={theme.textSecondary}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close" size={20} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPropertyItem}
        style={styles.propertyList}
        contentContainerStyle={styles.propertyListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="archive" size={48} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              {loading ? "Cargando propiedades..." : "No se encontraron propiedades"}
            </ThemedText>
          </View>
        }
      />
    </View>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.stepTitle}>Datos del Cliente</ThemedText>
      <ThemedText style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
        Ingresa la información de contacto
      </ThemedText>

      {selectedProperty && (
        <View
          style={[
            styles.selectedPropertyCard,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <Image source={{ uri: selectedProperty.imageUrl }} style={styles.selectedPropertyImage} />
          <View style={styles.selectedPropertyInfo}>
            <ThemedText style={styles.selectedPropertyTitle} numberOfLines={2}>
              {selectedProperty.title}
            </ThemedText>
            <ThemedText style={[styles.selectedPropertyPrice, { color: Colors.light.primary }]}>
              Q{selectedProperty.price.toLocaleString()}
            </ThemedText>
          </View>
          <Pressable onPress={handlePrevStep} style={styles.changeButton}>
            <ThemedText style={[styles.changeButtonText, { color: Colors.light.primary }]}>
              Cambiar
            </ThemedText>
          </Pressable>
        </View>
      )}

      <View style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          Nombre del Cliente *
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
          ]}
          value={clientName}
          onChangeText={setClientName}
          placeholder="Ej: Juan Pérez"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          Teléfono *
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
          ]}
          value={clientPhone}
          onChangeText={setClientPhone}
          placeholder="Ej: 5555-1234"
          placeholderTextColor={theme.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          Comentarios (opcional)
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
          ]}
          value={clientComment}
          onChangeText={setClientComment}
          placeholder="Notas adicionales sobre el cliente..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <Button onPress={handleNextStep} style={styles.nextButton}>
        Continuar
      </Button>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.stepTitle}>Confirmar Solicitud</ThemedText>
      <ThemedText style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
        Revisa la información antes de enviar
      </ThemedText>

      <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.summarySection}>
          <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Propiedad de Interés
          </ThemedText>
          {selectedProperty && (
            <View style={styles.summaryPropertyRow}>
              <Image source={{ uri: selectedProperty.imageUrl }} style={styles.summaryPropertyImage} />
              <View style={styles.summaryPropertyInfo}>
                <ThemedText style={styles.summaryPropertyTitle} numberOfLines={2}>
                  {selectedProperty.title}
                </ThemedText>
                <ThemedText style={[styles.summaryPropertyPrice, { color: Colors.light.primary }]}>
                  Q{selectedProperty.price.toLocaleString()}
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.summarySection}>
          <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Datos del Cliente
          </ThemedText>
          <View style={styles.summaryRow}>
            <Ionicons name="person-outline" size={18} color={theme.textSecondary} />
            <ThemedText style={styles.summaryValue}>{clientName}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="call" size={18} color={theme.textSecondary} />
            <ThemedText style={styles.summaryValue}>{clientPhone}</ThemedText>
          </View>
          {clientComment.trim().length > 0 && (
            <View style={styles.summaryRow}>
              <Ionicons name="chatbox-outline" size={18} color={theme.textSecondary} />
              <ThemedText style={[styles.summaryValue, { flex: 1 }]}>{clientComment}</ThemedText>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.summarySection}>
          <View style={styles.commissionRow}>
            <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Comisión potencial
            </ThemedText>
            <ThemedText style={styles.commissionValue}>Q750.00</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.buttonsRow}>
        <Pressable
          onPress={handlePrevStep}
          style={[styles.backButton, { borderColor: theme.border }]}
        >
          <ThemedText style={[styles.backButtonText, { color: theme.text }]}>Atrás</ThemedText>
        </Pressable>
        <Button onPress={handleSubmit} disabled={isSubmitting} style={styles.submitButton}>
          {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
        </Button>
      </View>
    </ScrollView>
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Capturar Cliente</ThemedText>
          <View style={styles.closeButton} />
        </View>

        {renderStepIndicator()}

        <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.lg }]}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  stepItem: {
    alignItems: "center",
    width: 80,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  stepLabel: {
    fontSize: 10,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  propertyList: {
    flex: 1,
  },
  propertyListContent: {
    paddingBottom: Spacing.xl,
  },
  propertyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  propertyItemImage: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.sm,
  },
  propertyItemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  propertyItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  propertyItemProject: {
    fontSize: 12,
    marginBottom: 2,
  },
  propertyItemPrice: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.md,
  },
  selectedPropertyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  selectedPropertyImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
  },
  selectedPropertyInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  selectedPropertyTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectedPropertyPrice: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  changeButton: {
    padding: Spacing.sm,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  input: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  nextButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  summarySection: {
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  summaryPropertyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryPropertyImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.xs,
  },
  summaryPropertyInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  summaryPropertyTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryPropertyPrice: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  summaryValue: {
    fontSize: 15,
  },
  commissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commissionValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16A34A",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  backButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
  },
});
