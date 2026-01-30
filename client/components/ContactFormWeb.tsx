import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/config";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface ContactFormProps {
  userId: string;
  propertyId: string;
  propertyName?: string;
  title?: string;
  style?: any;
}

export default function ContactFormWeb({
  userId,
  propertyId,
  propertyName,
  title,
  style,
}: ContactFormProps) {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.phone) {
      Alert.alert("Error", "Por favor completa los campos requeridos");
      return;
    }

    setSubmitting(true);
    try {
      const requestData = {
        brokerId: userId || "",
        clientName: contactForm.name,
        clientPhone: `+502 ${contactForm.phone}`,
        comment: contactForm.message || "",
        createdAt: new Date(),
        documentationProcess: [],
        paymentProgress: [],
        propertyId: Number(propertyId),
        status: "pending",
      };

      await addDoc(collection(db, "requests"), requestData);

      // Send notification to the property owner
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        if (apiUrl && userId) {
          const propertyInfo = propertyName ? ` sobre ${propertyName}` : "";
          await fetch(`${apiUrl}/notifications/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({
              user_id: userId,
              titulo: "Nuevo Cliente",
              mensaje: `${contactForm.name} solicito informacion${propertyInfo}.`,
            }),
          });
        }
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
      }

      setSubmitSuccess(true);
      setContactForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("Error submitting contact:", err);
      Alert.alert("Error", "Hubo un problema al enviar tu solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.contactFormSection, style]}>
      <ThemedText style={styles.formTitle}>
        {title || "Solicitar información"}
      </ThemedText>

      {submitSuccess ? (
        <View style={styles.successMessage}>
          <Ionicons
            name="checkmark-circle"
            size={48}
            color={Colors.light.primary}
          />
          <ThemedText style={styles.successText}>
            ¡Gracias! Tu solicitud ha sido enviada.
          </ThemedText>
          <ThemedText style={styles.successSubtext}>
            Un vendedor se pondrá en contacto contigo pronto.
          </ThemedText>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre completo"
            placeholderTextColor="#999"
            value={contactForm.name}
            onChangeText={(text) =>
              setContactForm({ ...contactForm, name: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Tu correo electrónico"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={contactForm.email}
            onChangeText={(text) =>
              setContactForm({ ...contactForm, email: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Tu teléfono"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={contactForm.phone}
            onChangeText={(text) =>
              setContactForm({ ...contactForm, phone: text })
            }
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mensaje"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={contactForm.message}
            onChangeText={(text) =>
              setContactForm({ ...contactForm, message: text })
            }
          />
          <Pressable
            style={[
              styles.submitButton,
              (!contactForm.name || !contactForm.email || !contactForm.phone) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitContact}
            disabled={
              !contactForm.name ||
              !contactForm.email ||
              !contactForm.phone ||
              submitting
            }
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.submitButtonText}>
                Enviar solicitud
              </ThemedText>
            )}
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contactFormSection: {
    backgroundColor: "#F9F9F9",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    // Add box shadow for subtle elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222222",
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    marginBottom: Spacing.md,
    fontSize: 16,
    color: "#222222",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  successMessage: {
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  successSubtext: {
    fontSize: 14,
    color: "#717171",
    textAlign: "center",
  },
});
