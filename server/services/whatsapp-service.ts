import OpenAI from "openai";

interface LaRedApiKeyResponse {
  token: string;
}

interface SendMessageResponse {
  success: boolean;
  message?: string;
}

class WhatsAppService {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      console.log("🤖 OpenAI configurado");
    } else {
      console.log(
        "⚠️ OPENAI_API_KEY no configurado, usando mensajes estáticos",
      );
    }
  }
  private apiToken: string | null = null;
  private tokenExpiry: number = 0;

  private async generateApiKey(): Promise<string> {
    const email = process.env.LARED_API_EMAIL;
    const password = process.env.LARED_API_PASSWORD;

    console.log("🔑 Generando API key con email:", email);

    if (!email || !password) {
      throw new Error(
        "LARED_API_EMAIL and LARED_API_PASSWORD must be set in environment variables",
      );
    }

    console.log("📡 Llamando a generate-api-key...");
    const response = await fetch(
      "https://panel.laredgt.com/api/user/generate-api-key",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error generando API key:", response.status, errorText);
      throw new Error(`Failed to generate API key: ${response.statusText}`);
    }

    const data: LaRedApiKeyResponse = await response.json();
    console.log("✅ API key generado exitosamente");
    return data.token;
  }

  private async ensureValidToken(): Promise<string> {
    const now = Date.now();

    // Regenerar token si no existe o está próximo a expirar (1 hora antes)
    if (!this.apiToken || now >= this.tokenExpiry - 3600000) {
      console.log("🔄 Token no existe o está por expirar, generando nuevo...");
      this.apiToken = await this.generateApiKey();
      // Asumir que el token dura 24 horas
      this.tokenExpiry = now + 24 * 60 * 60 * 1000;
    } else {
      console.log("✅ Usando token existente");
    }

    return this.apiToken;
  }

  async sendMessage(
    phoneNumber: string,
    message: string,
  ): Promise<SendMessageResponse> {
    try {
      console.log("📱 Enviando mensaje a:", phoneNumber);
      const token = await this.ensureValidToken();

      console.log("📡 Llamando a send-message...");
      const response = await fetch(
        "https://panel.laredgt.com/notifications/send-message",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            number: phoneNumber,
            message,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error enviando mensaje:", response.status, errorText);

        // Si falla por token expirado, regenerar y reintentar
        if (response.status === 401) {
          console.log("🔄 Token expirado, regenerando...");
          this.apiToken = null;
          const newToken = await this.ensureValidToken();

          const retryResponse = await fetch(
            "https://panel.laredgt.com/notifications/send-message",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${newToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                number: phoneNumber,
                message,
              }),
            },
          );

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            console.error(
              "❌ Error en segundo intento:",
              retryResponse.status,
              retryErrorText,
            );
            throw new Error(
              `Failed to send message: ${retryResponse.statusText}`,
            );
          }

          console.log("✅ Mensaje enviado exitosamente (segundo intento)");
          return { success: true };
        }

        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      console.log("✅ Mensaje enviado exitosamente");
      return { success: true };
    } catch (error) {
      console.error("❌ Error sending WhatsApp message:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async generateVerificationMessage(code: string): Promise<string> {
    if (!this.openai) {
      // Mensaje por defecto si OpenAI no está configurado
      return `Tu código de verificación es: ${code}\n\nEste código expira en 5 minutos.\n\n¿No solicitaste este código? Ignora este mensaje.`;
    }

    try {
      console.log("🤖 Generando mensaje personalizado con OpenAI...");
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente que genera mensajes de verificación creativos y amigables para WhatsApp. Los mensajes deben ser cortos (máximo 3 líneas), profesionales pero cálidos, y siempre incluir el código de verificación de forma clara. Varía el estilo y las palabras en cada mensaje para que nunca sean iguales.",
          },
          {
            role: "user",
            content: `Genera un mensaje de verificación por WhatsApp que incluya este código: ${code}. El código expira en 5 minutos. Hazlo diferente y creativo.`,
          },
        ],
        temperature: 1.2,
        max_tokens: 150,
      });

      const generatedMessage = completion.choices[0]?.message?.content?.trim();
      if (generatedMessage) {
        console.log("✅ Mensaje generado por OpenAI");
        return generatedMessage;
      }

      // Fallback si OpenAI no genera nada
      return `Tu código de verificación es: ${code}\n\nEste código expira en 5 minutos.\n\n¿No solicitaste este código? Ignora este mensaje.`;
    } catch (error) {
      console.error("❌ Error generando mensaje con OpenAI:", error);
      // Fallback en caso de error
      return `Tu código de verificación es: ${code}\n\nEste código expira en 5 minutos.\n\n¿No solicitaste este código? Ignora este mensaje.`;
    }
  }

  async sendVerificationCode(
    phoneNumber: string,
    code: string,
  ): Promise<boolean> {
    console.log("📨 Preparando mensaje de verificación para:", phoneNumber);
    console.log("🔢 Código generado:", code);

    const message = await this.generateVerificationMessage(code);
    console.log("💬 Mensaje generado:", message);

    const result = await this.sendMessage(phoneNumber, message);
    return result.success;
  }
}

export const whatsappService = new WhatsAppService();
