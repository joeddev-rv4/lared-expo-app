import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface PhoneVerificationScreenProps {
  phoneNumber: string;
  onVerified: () => void;
  onCancel?: () => void;
}

export function PhoneVerificationScreen({
  phoneNumber,
  onVerified,
  onCancel,
}: PhoneVerificationScreenProps) {
  const {
    code,
    setCode,
    isLoading,
    error,
    success,
    timeRemaining,
    canResend,
    sendCode,
    verify,
    resend,
    formatTime,
  } = usePhoneVerification(phoneNumber);

  // Enviar código automáticamente al montar
  useEffect(() => {
    sendCode();
  }, [sendCode]);

  // Verificar automáticamente cuando el código tenga 6 dígitos
  useEffect(() => {
    if (code.length === 6 && !isLoading) {
      verify();
    }
  }, [code, verify, isLoading]);

  // Navegar cuando se verifique exitosamente
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        onVerified();
      }, 1000);
    }
  }, [success, onVerified]);

  const handleVerify = async () => {
    const verified = await verify();
    if (verified) {
      onVerified();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Verificación de Teléfono</ThemedText>
        <Spacer height={8} />

        <ThemedText style={styles.subtitle}>
          Hemos enviado un código de 6 dígitos al número:
        </ThemedText>
        <Spacer height={8} />

        <ThemedText style={styles.phoneNumber}>{phoneNumber}</ThemedText>
        <Spacer height={24} />

        <ThemedText style={styles.label}>Código de verificación</ThemedText>
        <Spacer height={8} />

        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor="#999"
          autoFocus
          editable={!isLoading && !success}
        />

        <Spacer height={16} />

        {error && (
          <>
            <ThemedText style={styles.error}>{error}</ThemedText>
            <Spacer height={16} />
          </>
        )}

        {success && (
          <>
            <ThemedText style={styles.successText}>
              ✓ Número verificado exitosamente
            </ThemedText>
            <Spacer height={16} />
          </>
        )}

        {timeRemaining > 0 && (
          <>
            <ThemedText style={styles.timer}>
              Tiempo restante: {formatTime()}
            </ThemedText>
            <Spacer height={16} />
          </>
        )}

        <Button
          onPress={handleVerify}
          disabled={isLoading || code.length !== 6 || success}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? "Verificando..." : "Verificar Código"}
          </ThemedText>
        </Button>

        <Spacer height={12} />

        <Button
          onPress={resend}
          disabled={!canResend || isLoading}
          style={styles.secondaryButton}
        >
          <ThemedText style={styles.secondaryButtonText}>
            {canResend ? "Reenviar Código" : `Reenviar en ${formatTime()}`}
          </ThemedText>
        </Button>

        {onCancel && (
          <>
            <Spacer height={12} />
            <Button
              onPress={onCancel}
              disabled={isLoading}
              style={styles.secondaryButton}
            >
              <ThemedText style={styles.secondaryButtonText}>
                Cancelar
              </ThemedText>
            </Button>
          </>
        )}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF5A5F" />
          </View>
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  content: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  phoneNumber: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 8,
    fontWeight: "600",
  },
  error: {
    color: "#e74c3c",
    textAlign: "center",
    fontSize: 14,
  },
  successText: {
    color: "#27ae60",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  timer: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.7,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#f0f0f0",
  },
  secondaryButtonText: {
    color: "#484848",
    fontSize: 16,
    fontWeight: "600",
  },
});
