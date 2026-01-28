import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
  Image,
  Modal,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 16 * 2;
const IMAGE_HEIGHT = 200;
const isWeb = Platform.OS === "web";

import { useAuth } from "@/contexts/AuthContext";
import { getPropertyClients, PropertyClient } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Property } from "@/data/properties";

type ClientStatus =
  | 'Interacción'
  | 'Visita'
  | 'Cotización'
  | 'Reserva'
  | 'Documentos'
  | 'Pre investigación'
  | 'Traslado de documentos'
  | 'Validación'
  | 'Traslado a cartera y cobro'
  | 'Venta finalizada'
  | 'Pago a aliado';

export default function ClientListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<NativeStackScreenProps<ProfileStackParamList, 'ClientList'>['route']>();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  
  const isMobileWeb = isWeb && windowWidth < 768;

  const { property }: { property: Property } = route.params;
  const [clients, setClients] = useState<PropertyClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, [property, user?.id]);

  const loadClients = async () => {
    try {
      setLoading(true);

      if (!user?.id || !property) {
        console.log('Missing user ID or property data');
        setClients([]);
        return;
      }

      console.log('Loading clients for property:', property.id);
      const propertyClients = await getPropertyClients(property.id.toString(), user.id);
      setClients(propertyClients);

    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const [selectedClient, setSelectedClient] = useState<PropertyClient | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleStatusPress = (client: PropertyClient) => {
    setSelectedClient(client);
    setIsModalVisible(true);
    // Animar entrada del modal
    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 7,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseModal = () => {
    // Animar salida del modal
    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 7,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsModalVisible(false);
      setSelectedClient(null);
    });
  };

  const getStatusText = (status?: string): string => {
    const statusTexts: Record<string, string> = {
      '1': 'Interacción',
      '2': 'Visita',
      '3': 'Cotización',
      '4': 'Reserva',
      '5': 'Documentos',
      '6': 'Pre investigación',
      '7': 'Traslado de documentos',
      '8': 'Validación',
      '9': 'Traslado a cartera y cobro',
      '10': 'Venta finalizada',
      '11': 'Pago a aliado',
    };
    return status ? statusTexts[status] || 'Sin estado' : 'Sin estado';
  };

  const getStatusColor = (status?: string): string => {
    const statusColors: Record<string, string> = {
      '1': '#6B7280', // Interacción
      '2': '#3B82F6', // Visita
      '3': '#F59E0B', // Cotización
      '4': '#10B981', // Reserva
      '5': '#8B5CF6', // Documentos
      '6': '#EF4444', // Pre investigación
      '7': '#F97316', // Traslado de documentos
      '8': '#06B6D4', // Validación
      '9': '#84CC16', // Traslado a cartera y cobro
      '10': '#22C55E', // Venta finalizada
      '11': '#16A34A', // Pago a aliado
    };
    return status ? statusColors[status] || '#6B7280' : '#6B7280';
  };

  const getCardWidth = () => {
    if (!isWeb) return CARD_WIDTH;
    if (isMobileWeb) return '100%';
    return '30%';
  };

  const renderClientCard = (client: PropertyClient) => {
    return (
      <Pressable
        key={client.id}
        style={[
          styles.clientCard,
          {
            backgroundColor: theme.backgroundRoot,
            width: getCardWidth(),
          },
          !isWeb && !isDark ? Shadows.card : null,
        ]}
      >
        <View style={styles.clientImageContainer}>
          <View style={styles.clientAvatar}>
            <Ionicons name="person-outline" size={60} color="#6B7280" />
          </View>
        </View>

        <View style={styles.clientContent}>
          <ThemedText style={styles.clientName} numberOfLines={2}>
            {client.name}
          </ThemedText>

          <ThemedText style={[styles.clientDate, { color: theme.textSecondary }]}>
            Interesado el {client.date}
          </ThemedText>

          <Pressable
            style={[styles.clientStatusButton, { backgroundColor: getStatusColor(client.status) }]}
            onPress={() => handleStatusPress(client)}
          >
            <ThemedText style={styles.clientStatusText}>
              {getStatusText(client.status)}
            </ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          paddingTop: insets.top + Spacing.md,
          paddingHorizontal: isMobileWeb ? Spacing.md : (isWeb ? 90 : Spacing.lg),
        }
      ]}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </View>
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Clientes Interesados</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {property.title}
          </ThemedText>
        </View>
      </View>

      {/* Client Detail Modal */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.backgroundRoot,
                transform: [{ scale: modalScale }],
                opacity: modalOpacity,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Información de la Venta</ThemedText>
              <Pressable onPress={handleCloseModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.clientDetailSection}>
                <ThemedText style={styles.detailLabel}>Nombre:</ThemedText>
                <ThemedText style={[styles.detailValue, { color: theme.text }]}>
                  {selectedClient?.name}
                </ThemedText>
              </View>

              <View style={styles.clientDetailSection}>
                <ThemedText style={styles.detailLabel}>Estado:</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedClient?.status) }]}>
                  <ThemedText style={styles.statusBadgeText}>
                    {getStatusText(selectedClient?.status)}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.clientDetailSection}>
                <ThemedText style={styles.detailLabel}>Fecha de interés:</ThemedText>
                <ThemedText style={[styles.detailValue, { color: theme.text }]}>
                  {selectedClient?.date}
                </ThemedText>
              </View>

              <View style={styles.statesMapContainer}>
                <ThemedText style={[styles.statesMapTitle, { color: theme.text }]}>Mapa de Estados</ThemedText>
                <View style={styles.statesMap}>
                  {[
                    { id: '1', name: 'Interacción' },
                    { id: '2', name: 'Visita' },
                    { id: '3', name: 'Cotización' },
                    { id: '4', name: 'Reserva' },
                    { id: '5', name: 'Documentos' },
                    { id: '6', name: 'Pre investigación' },
                    { id: '7', name: 'Traslado de documentos' },
                    { id: '8', name: 'Validación' },
                    { id: '9', name: 'Traslado a cartera y cobro' },
                    { id: '10', name: 'Venta finalizada' },
                    { id: '11', name: 'Pago a aliado' }
                  ].map((status, index, array) => {
                    const statusOrder = [
                      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'
                    ];
                    const currentStatusIndex = statusOrder.indexOf(selectedClient?.status || '');
                    const isCompleted = index <= currentStatusIndex;
                    const dotColor = isCompleted ? '#EF4444' : '#6B7280';
                    const textColor = isCompleted ? '#EF4444' : theme.text;

                    return (
                      <View key={status.id} style={styles.stateItem}>
                        <View style={styles.stateConnector}>
                          <View style={[styles.stateDot, { backgroundColor: dotColor }]} />
                          {index < array.length - 1 && <View style={[styles.stateLine, { backgroundColor: dotColor }]} />}
                        </View>
                        <ThemedText style={[styles.stateText, { color: textColor }]}>
                          {status.name}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Clients List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl }
        ]}
      >
        <View style={[
          styles.clientsGrid,
          { paddingHorizontal: isMobileWeb ? Spacing.md : (isWeb ? 90 : Spacing.lg) }
        ]}>
          {clients?.map((client) => renderClientCard(client)) || (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={theme.textSecondary} />
              <ThemedText style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                No hay clientes interesados
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: Spacing.md,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#bf0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
  },
  clientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  clientCard: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  clientImageContainer: {
    position: "relative",
  },
  clientAvatar: {
    width: isWeb ? "100%" : CARD_WIDTH,
    height: IMAGE_HEIGHT,
    aspectRatio: isWeb ? 16 / 10 : undefined,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  clientContent: {
    padding: Spacing.md,
  },
  clientName: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  clientDate: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  clientContactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clientContactButtonText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  clientStatusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  clientStatusText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'] * 2,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    maxWidth: '90%',
    maxHeight: '80%',
    width: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  clientDetailSection: {
    marginBottom: Spacing.lg,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    lineHeight: 24,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statesMapContainer: {
    marginTop: Spacing.lg,
  },
  statesMapTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  statesMap: {
    paddingLeft: Spacing.md,
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    minHeight: 40,
  },
  stateConnector: {
    alignItems: 'center',
    marginRight: Spacing.md,
    width: 20,
  },
  stateDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  stateLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  stateText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});