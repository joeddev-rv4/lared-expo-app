import React, { useEffect } from "react";
import { StyleSheet, View, Animated, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface ToastProps {
    visible: boolean;
    message: string;
    onDismiss: () => void;
    duration?: number;
}

export function Toast({ visible, message, onDismiss, duration = 3000 }: ToastProps) {
    const opacity = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(20)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: Platform.OS !== "web",
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: Platform.OS !== "web",
                }),
            ]).start();

            const timer = setTimeout(() => {
                handleDismiss();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: Platform.OS !== "web",
            }),
            Animated.timing(translateY, {
                toValue: 20,
                duration: 300,
                useNativeDriver: Platform.OS !== "web",
            }),
        ]).start(() => {
            onDismiss();
        });
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={styles.content}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <ThemedText style={styles.text}>{message}</ThemedText>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 50,
        alignSelf: "center",
        zIndex: 9999,
        ...Shadows.card,
    },
    content: {
        backgroundColor: "#222222",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.full,
        gap: Spacing.sm,
    },
    text: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
});
