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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const IMAGE_HEIGHT = 200;
const isWeb = Platform.OS === "web";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Property } from "@/data/properties";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface Client {
  id: string;
  name: string;
  date: string;
  comment: string;
  phone?: string;
  email?: string;
  additionalInfo?: string;
  status?: ClientStatus;
}

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

  const { property }: { property: Property & { interestedClients: Client[] } } = route.params;

  // Datos ficticios para demostración
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'María González',
      date: '15/01/2026',
      comment: 'Estoy muy interesada en esta propiedad. ¿Podemos agendar una visita?',
      phone: '+56912345678',
      email: 'maria.gonzalez@email.com',
      status: 'Interacción'
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      date: '14/01/2026',
      comment: 'La ubicación es perfecta para mi familia. Me gustaría conocer más detalles.',
      phone: '+56987654321',
      email: 'carlos.rodriguez@email.com',
      status: 'Visita'
    },
    {
      id: '3',
      name: 'Ana López',
      date: '13/01/2026',
      comment: '¿Cuál es el precio final con todos los gastos incluidos?',
      phone: '+56911223344',
      email: 'ana.lopez@email.com',
      status: 'Cotización'
    },
    {
      id: '4',
      name: 'Pedro Martínez',
      date: '12/01/2026',
      comment: 'Me gusta mucho la propiedad. ¿Podemos hacer una reserva?',
      phone: '+56944332211',
      email: 'pedro.martinez@email.com',
      status: 'Reserva'
    },
    {
      id: '5',
      name: 'Laura Sánchez',
      date: '11/01/2026',
      comment: 'Necesito revisar los documentos de la propiedad.',
      phone: '+56955667788',
      email: 'laura.sanchez@email.com',
      status: 'Documentos'
    },
    {
      id: '6',
      name: 'Diego Torres',
      date: '10/01/2026',
      comment: 'Estoy en proceso de investigación antes de tomar una decisión.',
      phone: '+56999887766',
      email: 'diego.torres@email.com',
      status: 'Pre investigación'
    },
    {
      id: '7',
      name: 'Valentina Ruiz',
      date: '09/01/2026',
      comment: 'Los documentos están siendo trasladados para revisión.',
      phone: '+56933445566',
      email: 'valentina.ruiz@email.com',
      status: 'Traslado de documentos'
    },
    {
      id: '8',
      name: 'Felipe Morales',
      date: '08/01/2026',
      comment: 'Validando toda la información antes del cierre.',
      phone: '+56977889900',
      email: 'felipe.morales@email.com',
      status: 'Validación'
    },
    {
      id: '9',
      name: 'Camila Silva',
      date: '07/01/2026',
      comment: 'Trasladando a cartera para proceso de cobro.',
      phone: '+56911224433',
      email: 'camila.silva@email.com',
      status: 'Traslado a cartera y cobro'
    },
    {
      id: '10',
      name: 'Javier Castro',
      date: '06/01/2026',
      comment: '¡La venta se ha completado exitosamente!',
      phone: '+56944556677',
      email: 'javier.castro@email.com',
      status: 'Venta finalizada'
    },
    {
      id: '11',
      name: 'Isabella Vargas',
      date: '05/01/2026',
      comment: 'Pago realizado al aliado correspondiente.',
      phone: '+56977883344',
      email: 'isabella.vargas@email.com',
      status: 'Pago a aliado'
    }
  ];

  // Usar datos ficticios para demostración (forzar uso de datos de ejemplo)
  const clients = mockClients;
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleStatusPress = (client: Client) => {
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

  const getStatusColor = (status?: ClientStatus): string => {
    const statusColors: Record<ClientStatus, string> = {
      'Interacción': '#6B7280',
      'Visita': '#3B82F6',
      'Cotización': '#F59E0B',
      'Reserva': '#10B981',
      'Documentos': '#8B5CF6',
      'Pre investigación': '#EF4444',
      'Traslado de documentos': '#F97316',
      'Validación': '#06B6D4',
      'Traslado a cartera y cobro': '#84CC16',
      'Venta finalizada': '#22C55E',
      'Pago a aliado': '#16A34A',
    };
    return status ? statusColors[status] : '#6B7280';
  };

  const renderClientCard = (client: Client) => {
    return (
      <Pressable
        key={client.id}
        style={[
          styles.clientCard,
          {
            backgroundColor: theme.backgroundRoot,
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
              {client.status || 'Sin estado'}
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
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </View>
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Clientes Interesados</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
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
                    {selectedClient?.status || 'Sin estado'}
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
                    'Interacción',
                    'Visita',
                    'Cotización',
                    'Reserva',
                    'Documentos',
                    'Pre investigación',
                    'Traslado de documentos',
                    'Validación',
                    'Traslado a cartera y cobro',
                    'Venta finalizada',
                    'Pago a aliado'
                  ].map((status, index, array) => {
                    const statusOrder = [
                      'Interacción',
                      'Visita',
                      'Cotización',
                      'Reserva',
                      'Documentos',
                      'Pre investigación',
                      'Traslado de documentos',
                      'Validación',
                      'Traslado a cartera y cobro',
                      'Venta finalizada',
                      'Pago a aliado'
                    ];
                    const currentStatusIndex = statusOrder.indexOf(selectedClient?.status || '');
                    const isCompleted = index <= currentStatusIndex;
                    const dotColor = isCompleted ? '#EF4444' : '#6B7280';
                    const textColor = isCompleted ? '#EF4444' : theme.text;

                    return (
                      <View key={status} style={styles.stateItem}>
                        <View style={styles.stateConnector}>
                          <View style={[styles.stateDot, { backgroundColor: dotColor }]} />
                          {index < array.length - 1 && <View style={[styles.stateLine, { backgroundColor: dotColor }]} />}
                        </View>
                        <ThemedText style={[styles.stateText, { color: textColor }]}>
                          {status}
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
        <View style={styles.clientsGrid}>
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
    paddingHorizontal: isWeb ? 90 : Spacing.lg,
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
    paddingHorizontal: isWeb ? 90 : Spacing.lg,
  },
  clientCard: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    width: isWeb ? '30%' : CARD_WIDTH,
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