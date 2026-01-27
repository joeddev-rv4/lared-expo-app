import React from "react";
import {
    View,
    StyleSheet,
    Pressable,
    Image,
    ScrollView,
    Dimensions,
    Platform,
} from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { Property } from "@/data/properties";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface FavoritesPopupProps {
    isVisible: boolean;
    favorites: Property[];
    onClose: () => void;
    onGoToFavorites: () => void;
    onPropertyPress: (property: Property) => void;
}

export function FavoritesPopup({
    isVisible,
    favorites,
    onClose,
    onGoToFavorites,
    onPropertyPress,
}: FavoritesPopupProps) {
    const isWeb = Platform.OS === "web";

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            backdropOpacity={0.4}
            animationIn="slideInRight"
            animationOut="slideOutRight"
            style={styles.modal}
            deviceWidth={Dimensions.get("window").width}
            deviceHeight={Dimensions.get("window").height}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Tus Favoritos</ThemedText>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#333" />
                    </Pressable>
                </View>

                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {favorites.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <ThemedText style={styles.emptyText}>
                                Aún no tienes propiedades en tu portafolio.
                            </ThemedText>
                        </View>
                    ) : (
                        favorites.map((property) => (
                            <Pressable
                                key={property.id}
                                style={({ pressed }) => [
                                    styles.propertyItem,
                                    pressed && { opacity: 0.7 },
                                ]}
                                onPress={() => onPropertyPress(property)}
                            >
                                <Image
                                    source={{ uri: property.imageUrl }}
                                    style={styles.propertyImage}
                                />
                                <View style={styles.propertyInfo}>
                                    <ThemedText style={styles.propertyTitle} numberOfLines={1}>
                                        {property.title}
                                    </ThemedText>
                                    <ThemedText style={styles.propertyPrice}>
                                        Q{property.price.toLocaleString()}
                                    </ThemedText>
                                    <View style={styles.propertyLocationRow}>
                                        <Ionicons name="location-outline" size={12} color="#666" />
                                        <ThemedText style={styles.propertyLocation} numberOfLines={1}>
                                            {property.location}
                                        </ThemedText>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#DDD" />
                            </Pressable>
                        ))
                    )}
                </ScrollView>

                <View style={styles.footer}>
                    <Pressable style={styles.mainButton} onPress={onGoToFavorites}>
                        <ThemedText style={styles.mainButtonText}>IR A FAVORITOS</ThemedText>
                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
    container: {
        backgroundColor: "#FFFFFF",
        width: Platform.OS === "web" ? 400 : "100%",
        height: "100%",
        shadowColor: "#000",
        shadowOffset: { width: -4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#222",
    },
    closeButton: {
        padding: Spacing.xs,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    propertyItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9F9F9",
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        gap: Spacing.md,
    },
    propertyImage: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.sm,
    },
    propertyInfo: {
        flex: 1,
    },
    propertyTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#222",
        marginBottom: 2,
    },
    propertyPrice: {
        fontSize: 13,
        color: "#bf0a0a",
        fontWeight: "700",
        marginBottom: 2,
    },
    propertyLocationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    propertyLocation: {
        fontSize: 11,
        color: "#666",
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
    },
    footer: {
        padding: Spacing.xl,
        paddingBottom: Spacing["3xl"],
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    mainButton: {
        backgroundColor: "#bf0a0a",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: BorderRadius.full,
        gap: Spacing.sm,
    },
    mainButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 1,
    },
});
