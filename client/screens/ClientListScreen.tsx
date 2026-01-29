import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
  Modal,
  Animated,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const isWeb = Platform.OS === "web";

import { useAuth } from "@/contexts/AuthContext";
import { getPropertyClients, PropertyClient } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Property } from "@/data/properties";

export default function ClientListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<NativeStackScreenProps<ProfileStackParamList, 'ClientList'>['route']>();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const getColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    if (windowWidth >= 1400) return 4;
    return 3;
  };

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
        setClients([]);
        return;
      }

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
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  const handleStatusPress = (client: PropertyClient) => {
    setSelectedClient(client);
    setIsModalVisible(true);
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
      '1': 'Interaccion',
      '2': 'Visita',
      '3': 'Cotizacion',
      '4': 'Reserva',
      '5': 'Documentos',
      '6': 'Pre investigacion',
      '7': 'Traslado docs',
      '8': 'Validacion',
      '9': 'Cartera y cobro',
      '10': 'Venta finalizada',
      '11': 'Pago a aliado',
    };
    return status ? statusTexts[status] || 'Sin estado' : 'Sin estado';
  };

  const getStatusColor = (status?: string): string => {
    const statusColors: Record<string, string> = {
      '1': '#64748B',
      '2': '#3B82F6',
      '3': '#F59E0B',
      '4': '#10B981',
      '5': '#8B5CF6',
      '6': '#EF4444',
      '7': '#F97316',
      '8': '#06B6D4',
      '9': '#84CC16',
      '10': '#22C55E',
      '11': '#16A34A',
    };
    return status ? statusColors[status] || '#64748B' : '#64748B';
  };

  const getStatusIcon = (status?: string): string => {
    const statusIcons: Record<string, string> = {
      '1': 'chatbubble-outline',
      '2': 'eye-outline',
      '3': 'calculator-outline',
      '4': 'bookmark-outline',
      '5': 'document-text-outline',
      '6': 'search-outline',
      '7': 'arrow-forward-outline',
      '8': 'checkmark-circle-outline',
      '9': 'wallet-outline',
      '10': 'trophy-outline',
      '11': 'cash-outline',
    };
    return status ? statusIcons[status] || 'help-outline' : 'help-outline';
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const columns = getColumns();
  const gap = isMobile ? 12 : 16;
  const horizontalPadding = isMobile ? 16 : isTablet ? 24 : 48;

  const renderClientCard = (client: PropertyClient, index: number) => {
    const cardWidth = isMobile 
      ? '100%' 
      : `calc(${100 / columns}% - ${(gap * (columns - 1)) / columns}px)`;

    return (
      <View
        key={client.id}
        style={[
          styles.cardWrapper,
          { 
            width: isWeb ? cardWidth as any : '100%',
            marginBottom: gap,
          }
        ]}
      >
        <Pressable
          style={[
            styles.clientCard,
            {
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderColor: isDark ? '#374151' : '#E5E7EB',
            },
          ]}
          onPress={() => handleStatusPress(client)}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: getAvatarColor(client.name) }]}>
              <ThemedText style={styles.avatarText}>{getInitials(client.name)}</ThemedText>
            </View>
            <View style={styles.clientInfo}>
              <ThemedText style={styles.clientName} numberOfLines={1}>
                {client.name}
              </ThemedText>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <ThemedText style={[styles.clientDate, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {client.date}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <View style={[styles.statusChip, { backgroundColor: `${getStatusColor(client.status)}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(client.status) }]} />
              <ThemedText style={[styles.statusText, { color: getStatusColor(client.status) }]}>
                {getStatusText(client.status)}
              </ThemedText>
            </View>
            <Pressable
              style={[styles.viewButton, { backgroundColor: '#bf0a0a' }]}
              onPress={() => handleStatusPress(client)}
            >
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </Pressable>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
        <Ionicons name="people-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
      </View>
      <ThemedText style={styles.emptyTitle}>Sin clientes aun</ThemedText>
      <ThemedText style={[styles.emptyDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        Cuando alguien muestre interes en esta propiedad, aparecera aqui.
      </ThemedText>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#bf0a0a" />
      <ThemedText style={[styles.loadingText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        Cargando clientes...
      </ThemedText>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      <View style={[
        styles.header, 
        { 
          paddingTop: insets.top + 12,
          paddingHorizontal: horizontalPadding,
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderBottomColor: isDark ? '#374151' : '#E5E7EB',
        }
      ]}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
        </Pressable>
        
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>Mis Clientes</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>
            {property.title}
          </ThemedText>
        </View>

        <View style={[styles.clientCountBadge, { backgroundColor: '#bf0a0a' }]}>
          <ThemedText style={styles.clientCountText}>{clients.length}</ThemedText>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseModal} />
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                transform: [{ scale: modalScale }],
                opacity: modalOpacity,
                maxWidth: isMobile ? windowWidth - 32 : 480,
              },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? '#374151' : '#E5E7EB' }]}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalAvatar, { backgroundColor: getAvatarColor(selectedClient?.name || '') }]}>
                  <ThemedText style={styles.modalAvatarText}>
                    {selectedClient?.name ? getInitials(selectedClient.name) : ''}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText style={styles.modalClientName}>{selectedClient?.name}</ThemedText>
                  <ThemedText style={[styles.modalClientDate, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Interesado el {selectedClient?.date}
                  </ThemedText>
                </View>
              </View>
              <Pressable onPress={handleCloseModal} style={[styles.closeButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                <Ionicons name="close" size={20} color={isDark ? '#FFFFFF' : '#111827'} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.currentStatusSection}>
                <ThemedText style={[styles.sectionLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Estado actual</ThemedText>
                <View style={[styles.currentStatusCard, { backgroundColor: `${getStatusColor(selectedClient?.status)}15` }]}>
                  <Ionicons 
                    name={getStatusIcon(selectedClient?.status) as any} 
                    size={24} 
                    color={getStatusColor(selectedClient?.status)} 
                  />
                  <ThemedText style={[styles.currentStatusText, { color: getStatusColor(selectedClient?.status) }]}>
                    {getStatusText(selectedClient?.status)}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.timelineSection}>
                <ThemedText style={[styles.sectionLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Progreso de venta</ThemedText>
                <View style={styles.timeline}>
                  {[
                    { id: '1', name: 'Interaccion' },
                    { id: '2', name: 'Visita' },
                    { id: '3', name: 'Cotizacion' },
                    { id: '4', name: 'Reserva' },
                    { id: '5', name: 'Documentos' },
                    { id: '6', name: 'Pre investigacion' },
                    { id: '7', name: 'Traslado de documentos' },
                    { id: '8', name: 'Validacion' },
                    { id: '9', name: 'Cartera y cobro' },
                    { id: '10', name: 'Venta finalizada' },
                    { id: '11', name: 'Pago a aliado' }
                  ].map((status, index, array) => {
                    const currentStatusIndex = parseInt(selectedClient?.status || '0') - 1;
                    const isCompleted = index < currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const isPending = index > currentStatusIndex;

                    return (
                      <View key={status.id} style={styles.timelineItem}>
                        <View style={styles.timelineLeft}>
                          <View style={[
                            styles.timelineDot,
                            isCompleted && styles.timelineDotCompleted,
                            isCurrent && styles.timelineDotCurrent,
                            isPending && styles.timelineDotPending,
                            { borderColor: isDark ? '#374151' : '#E5E7EB' }
                          ]}>
                            {isCompleted ? (
                              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                            ) : null}
                          </View>
                          {index < array.length - 1 ? (
                            <View style={[
                              styles.timelineLine,
                              { backgroundColor: isCompleted ? '#10B981' : (isDark ? '#374151' : '#E5E7EB') }
                            ]} />
                          ) : null}
                        </View>
                        <ThemedText style={[
                          styles.timelineText,
                          isCompleted && styles.timelineTextCompleted,
                          isCurrent && styles.timelineTextCurrent,
                          isPending && { color: isDark ? '#6B7280' : '#9CA3AF' },
                        ]}>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingHorizontal: horizontalPadding,
            paddingBottom: insets.bottom + 24,
          }
        ]}
      >
        {loading ? renderLoadingState() : (
          clients.length > 0 ? (
            <View style={[
              styles.grid,
              { gap: gap }
            ]}>
              {clients.map((client, index) => renderClientCard(client, index))}
            </View>
          ) : renderEmptyState()
        )}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  clientCountBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  clientCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingTop: 20,
    flexGrow: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardWrapper: {
  },
  clientCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    ...(isWeb ? {
      transition: 'all 0.2s ease',
    } : {}),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clientDate: {
    fontSize: 13,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  viewButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 20,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalClientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalClientDate: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  currentStatusSection: {
    marginBottom: 24,
  },
  currentStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  currentStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timelineSection: {
    marginBottom: 20,
  },
  timeline: {
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  timelineDotCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  timelineDotCurrent: {
    backgroundColor: '#bf0a0a',
    borderColor: '#bf0a0a',
  },
  timelineDotPending: {
    backgroundColor: 'transparent',
  },
  timelineLine: {
    width: 2,
    height: 24,
    marginVertical: 4,
  },
  timelineText: {
    fontSize: 14,
    lineHeight: 24,
    paddingBottom: 12,
  },
  timelineTextCompleted: {
    color: '#10B981',
    fontWeight: '500',
  },
  timelineTextCurrent: {
    color: '#bf0a0a',
    fontWeight: '600',
  },
});
