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

const EXTERNAL_API = process.env.EXPO_PUBLIC_API_URL || "https://panel.laredgt.com/api";

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy para la API de leads (soluciona CORS)
  app.get("/lead/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      console.log("🔍 Proxy: Obteniendo leads para usuario:", userId);

      try {
        // Intentar hacer la petición al servidor de la API de leads
        const response = await fetch(`${EXTERNAL_API}/lead/user/${userId}`);

        if (!response.ok) {
          console.error("❌ Error en API de leads:", response.status);
          throw new Error(`API devolvió error ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ Proxy: ${data.length} leads obtenidos desde API externa`);

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type");

        return res.json(data);

      } catch (apiError) {
        console.log("⚠️  API de leads no disponible, usando datos de prueba");

        // Datos de prueba para desarrollo
        const testLeads = [
          {
            id: 1,
            property_id: "67876d9e0c67f33bf72c5e14",
            user_id: userId,
            client_name: "María González",
            client_phone: "+1234567890",
            client_email: "maria@example.com",
            lead_source: "whatsapp",
            phase_id: 1,
            created_at: "2024-01-27T10:00:00Z",
            updated_at: "2024-01-27T10:30:00Z",
            notes: "Cliente interesada en apartamento de 2 habitaciones"
          },
          {
            id: 2,
            property_id: "67876d9e0c67f33bf72c5e14",
            user_id: userId,
            client_name: "Carlos Rodríguez",
            client_phone: "+1234567891",
            client_email: "carlos@example.com",
            lead_source: "website",
            phase_id: 2,
            created_at: "2024-01-26T15:00:00Z",
            updated_at: "2024-01-27T09:00:00Z",
            notes: "Solicita más información sobre financiamiento"
          },
          {
            id: 3,
            property_id: "67876d9e0c67f33bf72c5e15",
            user_id: userId,
            client_name: "Ana López",
            client_phone: "+1234567892",
            client_email: "ana@example.com",
            lead_source: "referral",
            phase_id: 3,
            created_at: "2024-01-25T12:00:00Z",
            updated_at: "2024-01-27T08:00:00Z",
            notes: "Lista para agendar visita"
          },
          {
            id: 4,
            property_id: "67876d9e0c67f33bf72c5e16",
            user_id: userId,
            client_name: "Roberto Martínez",
            client_phone: "+1234567893",
            client_email: "roberto@example.com",
            lead_source: "whatsapp",
            phase_id: 1,
            created_at: "2024-01-27T16:00:00Z",
            updated_at: "2024-01-27T16:15:00Z",
            notes: "Consulta inicial sobre propiedades comerciales"
          }
        ];

        console.log(`✅ Proxy: ${testLeads.length} leads de prueba devueltos`);

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        return res.json(testLeads);
      }

    } catch (error) {
      console.error("❌ Error en proxy de leads:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor proxy"
      });
    }
  });

  // Proxy para la API de notificaciones (soluciona CORS)
  app.get("/api/notifications/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      console.log("🔔 Proxy: Obteniendo notificaciones para usuario:", userId);

      try {
        // Intentar hacer la petición al servidor de la API de notificaciones
        const response = await fetch(`${EXTERNAL_API}/notifications/${userId}`);

        if (!response.ok) {
          console.error("❌ Error en API de notificaciones:", response.status);
          throw new Error(`API devolvió error ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ Proxy: ${data.length} notificaciones obtenidas desde API externa`);

        // Devolver los datos con headers CORS
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        return res.json(data);

      } catch (apiError) {
        console.log("⚠️  API de notificaciones no disponible, usando datos de prueba");
        console.error("❌ Error en API de notificaciones:", apiError);

        // Datos de prueba para desarrollo - notificaciones con status false (no leídas)
        const testNotifications = [
          {
            "_id": "69791a1b809c7dd861f6e56e",
            "user_id": userId,
            "titulo": "Nueva propiedad disponible",
            "mensaje": "Se ha agregado una nueva propiedad en tu zona de interés",
            "fecha": "2026-01-27T14:00:00.000Z",
            "status": false
          },
          {
            "_id": "69791a3d809c7dd861f6e570",
            "user_id": userId,
            "titulo": "Cliente interesado",
            "mensaje": "María González mostró interés en tu propiedad",
            "fecha": "2026-01-27T13:30:00.000Z",
            "status": false
          },
          {
            "_id": "69791a4f809c7dd861f6e572",
            "user_id": userId,
            "titulo": "Actualización del sistema",
            "mensaje": "Se ha actualizado la plataforma con nuevas funcionalidades",
            "fecha": "2026-01-26T09:00:00.000Z",
            "status": true
          }
        ];

        console.log(`✅ Proxy: ${testNotifications.length} notificaciones de prueba devueltas`);

        // Devolver los datos de prueba con headers CORS
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        return res.json(testNotifications);
      }

    } catch (error) {
      console.error("❌ Error en proxy de notificaciones:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor proxy"
      });
    }
  });

  // Actualizar status de notificación (marcar como leída)
  app.put("/api/notifications/:notificationId/read", async (req, res) => {
    try {
      const { notificationId } = req.params;

      console.log("📖 Proxy: Marcando notificación como leída:", notificationId);

      try {
        // Intentar hacer la petición al servidor de la API de notificaciones
        const response = await fetch(`${EXTERNAL_API}/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error("❌ Error al actualizar notificación:", response.status);
          throw new Error(`API devolvió error ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ Proxy: Notificación ${notificationId} marcada como leída`);

        // Devolver los datos con headers CORS
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        return res.json(data);

      } catch (apiError) {
        console.log("⚠️  API de notificaciones no disponible para actualización");
        console.error("❌ Error al actualizar notificación:", apiError);

        // Simular respuesta exitosa cuando la API no esté disponible
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        return res.json({
          success: true,
          message: "Notificación marcada como leída (simulado)"
        });
      }

    } catch (error) {
      console.error("❌ Error en proxy de actualización de notificación:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor proxy"
      });
    }
  });

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
