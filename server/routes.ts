import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { verificationService } from "./services/verification-service";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, count, sql } from "drizzle-orm";
import { leads, lead_phase, lead_history, user_favorites } from "../shared/schema";
import pkg from "pg";
const { Pool } = pkg;

// Configurar conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

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

  // Obtener propiedades favoritas del usuario con conteo de clientes
  app.get("/api/user/favorites-with-clients", async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          success: false,
          message: "userId es requerido"
        });
      }

      console.log("🔍 Obteniendo propiedades favoritas para usuario:", userId);

      // Obtener propiedades favoritas del usuario
      const favorites = await db
        .select()
        .from(user_favorites)
        .where(eq(user_favorites.user_id, userId));

      if (favorites.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }

      const propertyIds = favorites.map(fav => fav.property_id);

      // Para cada propiedad favorita, contar los leads asociados
      const clientCounts = await db
        .select({
          property_id: leads.property_id,
          client_count: count(leads.id)
        })
        .from(leads)
        .where(sql`${leads.property_id} = ANY(${propertyIds})`)
        .groupBy(leads.property_id);

      // Crear mapa de conteos por propiedad
      const clientCountMap = new Map(
        clientCounts.map(item => [item.property_id, item.client_count])
      );

      // Combinar datos de favoritos con conteos
      const result = favorites.map(fav => ({
        property_id: fav.property_id,
        added_at: fav.created_at,
        client_count: clientCountMap.get(fav.property_id) || 0
      }));

      console.log("✅ Propiedades favoritas encontradas:", result.length);

      return res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error("❌ Error obteniendo propiedades favoritas:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  });

  // Obtener clientes interesados en una propiedad específica
  app.get("/api/property/:propertyId/clients", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { userId } = req.query;

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          message: "propertyId es requerido"
        });
      }

      console.log("👥 Obteniendo clientes para propiedad:", propertyId);

      // Obtener leads para esta propiedad
      const propertyLeads = await db
        .select()
        .from(leads)
        .where(eq(leads.property_id, propertyId));

      if (propertyLeads.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }

      // Para cada lead, obtener la fase más reciente y su historial
      const clientsWithHistory = await Promise.all(
        propertyLeads.map(async (lead) => {
          // Obtener la fase más reciente
          const recentPhase = await db
            .select()
            .from(lead_phase)
            .where(eq(lead_phase.lead_id, lead.id))
            .orderBy(sql`${lead_phase.created_at} DESC`)
            .limit(1);

          let latestMessage = lead.comment || "Cliente interesado";

          if (recentPhase.length > 0) {
            // Obtener el historial más reciente de esta fase
            const history = await db
              .select()
              .from(lead_history)
              .where(eq(lead_history.lead_phase_id, recentPhase[0].id))
              .orderBy(sql`${lead_history.created_at} DESC`)
              .limit(1);

            if (history.length > 0 && history[0].history_data?.message) {
              latestMessage = history[0].history_data.message;
            }
          }

          return {
            id: lead.id,
            name: lead.client_name,
            phone: lead.client_phone,
            comment: latestMessage,
            date: lead.created_at?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            email: null, // No tenemos email en la tabla leads
            additionalInfo: lead.comment
          };
        })
      );

      console.log("✅ Clientes encontrados:", clientsWithHistory.length);

      return res.json({
        success: true,
        data: clientsWithHistory
      });

    } catch (error) {
      console.error("❌ Error obteniendo clientes:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
