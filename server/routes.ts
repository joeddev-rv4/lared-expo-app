import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { verificationService } from "./services/verification-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Verificación de teléfono
  app.post("/api/auth/send-verification", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      console.log("📱 Solicitud de verificación para:", phoneNumber);

      if (!phoneNumber) {
        console.log("❌ Número de teléfono no proporcionado");
        return res.status(400).json({ 
          success: false, 
          message: "El número de teléfono es requerido" 
        });
      }

      console.log("🚀 Enviando código de verificación...");
      const result = await verificationService.sendVerificationCode(phoneNumber);
      console.log("✅ Resultado:", result);
      
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("❌ Error sending verification code:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor" 
      });
    }
  });

  app.post("/api/auth/verify-code", async (req, res) => {
    try {
      const { phoneNumber, code } = req.body;

      if (!phoneNumber || !code) {
        return res.status(400).json({ 
          success: false, 
          message: "El número de teléfono y el código son requeridos" 
        });
      }

      const result = verificationService.verifyCode(phoneNumber, code);
      
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Error verifying code:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
