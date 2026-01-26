const API_BASE_URL = "https://plataforma.controldepropiedades.com/api";
const API_KEY = "LgfPuSsMS4fleTHh6vAYgsgD3fDZNGAOkcEWoMtH";

import { Property } from "@/data/properties";

export interface APIProyecto {
  id: number;
  nombre_proyecto: string;
  direccion: string;
  aprobacion12cuotas: string | null;
  tipo: string;
  ubicacion: string;
  estado: string;
  caracteristicas: string;
  created_at: string;
  updated_at: string;
}

export interface APIPropiedad {
  id: number;
  propiedad: string;
  area: number;
  tipo: string;
  clase_tipo: string;
  ubicacion: string;
  modelo: string;
  estado: string;
  fin_de_obra: string | null;
  bloqueo: string | null;
  fase: string;
  precio: number;
  proyectos_id: number;
  habitaciones: number | null;
  baños: number | null;
  parqueos: number | null;
  m2construccion: number | null;
  largo: number | null;
  ancho: number | null;
  año: number | null;
  titulo: string;
  descripcion: string;
  detalles: string;
  descripcion_corta: string;
  caracteristicas: string;
  comision_referencia: string;
  comision_directa: string;
  latitud: number | null;
  longitud: number | null;
  created_at: string | null;
  updated_at: string | null;
  proyecto: APIProyecto;
  imagenes: Array<{
    tipo: string;
    url: string;
    formato: string;
  }>;
}

export interface APIPropiedadesResponse {
  success: boolean;
  data: APIPropiedad[];
}

export async function fetchPropiedades(): Promise<APIPropiedad[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/propiedades/redinmo`, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: APIPropiedadesResponse = await response.json();

    if (!data.success) {
      throw new Error("API returned unsuccessful response");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching propiedades:", error);
    throw error;
  }
}

export interface APIProyectosResponse {
  success: boolean;
  data: APIProyectoDetalle[];
}

export interface APIProyectoDetalle {
  id: number;
  nombre_proyecto: string;
  direccion: string;
  aprobacion12cuotas: string | null;
  tipo: string;
  ubicacion: string;
  estado: string;
  caracteristicas: string;
  created_at: string;
  updated_at: string;
  imagenes?: Array<{
    tipo: string;
    url: string;
    formato: string;
  }>;
}

export async function fetchProyectos(): Promise<APIProyectoDetalle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/redinmo`, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: APIProyectosResponse = await response.json();

    if (!data.success) {
      throw new Error("API returned unsuccessful response");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching proyectos:", error);
    throw error;
  }
}

export interface ExtractedProject {
  id: number;
  name: string;
  address: string;
  location: string;
  type: string;
  status: string;
  features: string[];
  propertyCount: number;
  imageUrl: string;
}

export async function fetchPropiedadById(propertyId: string): Promise<APIPropiedad | null> {
  try {
    const properties = await fetchPropiedades();
    const property = properties.find((p) => p.id.toString() === propertyId);
    return property || null;
  } catch (error) {
    console.error("Error fetching propiedad by id:", error);
    return null;
  }
}

export function extractProjectsFromProperties(properties: APIPropiedad[]): ExtractedProject[] {
  const projectMap = new Map<number, ExtractedProject>();

  properties.forEach((prop) => {
    if (prop.proyecto) {
      const projectId = prop.proyecto.id;

      if (!projectMap.has(projectId)) {
        const firstImage = prop.imagenes.find((img) => img.formato === "imagen");
        const features = prop.proyecto.caracteristicas
          ? prop.proyecto.caracteristicas.split(",").map((f) => f.trim())
          : [];

        projectMap.set(projectId, {
          id: projectId,
          name: prop.proyecto.nombre_proyecto,
          address: prop.proyecto.direccion,
          location: prop.proyecto.ubicacion,
          type: prop.proyecto.tipo,
          status: prop.proyecto.estado,
          features,
          propertyCount: 1,
          imageUrl: firstImage?.url || "https://via.placeholder.com/400x300?text=Proyecto",
        });
      } else {
        const existingProject = projectMap.get(projectId)!;
        existingProject.propertyCount++;

        if (existingProject.imageUrl.includes("placeholder")) {
          const firstImage = prop.imagenes.find((img) => img.formato === "imagen");
          if (firstImage?.url) {
            existingProject.imageUrl = firstImage.url;
          }
        }
      }
    }
  });

  return Array.from(projectMap.values());
}

// Interfaces para las nuevas APIs
export interface FavoritePropertyWithClients {
  property_id: string;
  added_at: Date;
  client_count: number;
  property?: Property | null; // Opcional: datos completos de la propiedad
}

export interface PropertyClient {
  id: string;
  name: string;
  phone: string;
  comment: string;
  date: string;
  email?: string;
  additionalInfo?: string;
  status?: string;
}

// Obtener propiedades favoritas del usuario con conteo de clientes
export async function getUserFavoritePropertiesWithClients(userId: string): Promise<FavoritePropertyWithClients[]> {
  try {
    // Primero obtener todas las propiedades favoritas del usuario desde AsyncStorage
    // Como no tenemos AsyncStorage configurado aquí, devolveremos datos mock por ahora
    // En el futuro esto debería venir de AsyncStorage o Firebase
    const favoritePropertyIds = ['4234', '4235', '4236']; // Mock data - reemplazar con datos reales

    // Obtener todos los leads desde la API externa
    const leadsResponse = await fetch('https://panel.laredgt.com/api/lead');
    if (!leadsResponse.ok) {
      throw new Error('Error obteniendo leads de la API externa');
    }

    const allLeads = await leadsResponse.json();

    // Filtrar leads que pertenecen al usuario actual
    const userLeads = allLeads.filter((lead: any) => lead.user_id === userId);

    // Contar leads por propiedad
    const leadsByProperty: { [key: string]: any[] } = {};
    userLeads.forEach((lead: any) => {
      const propId = lead.property_id.toString();
      if (!leadsByProperty[propId]) {
        leadsByProperty[propId] = [];
      }
      leadsByProperty[propId].push(lead);
    });

    // Crear el resultado final
    const favoritesWithClients: FavoritePropertyWithClients[] = [];

    for (const propertyId of favoritePropertyIds) {
      const clients = leadsByProperty[propertyId] || [];
      const propertyData = await getPropertyById(propertyId);

      favoritesWithClients.push({
        property_id: propertyId,
        added_at: new Date(), // Mock - en el futuro vendrá de AsyncStorage
        client_count: clients.length,
        property: propertyData
      });
    }

    return favoritesWithClients;
  } catch (error) {
    console.error('Error fetching user favorite properties:', error);
    throw error;
  }
}

// Obtener clientes interesados en una propiedad específica
export async function getPropertyClients(propertyId: string, userId: string): Promise<PropertyClient[]> {
  try {
    // Obtener todos los leads desde la API externa
    const leadsResponse = await fetch('https://panel.laredgt.com/api/lead');
    if (!leadsResponse.ok) {
      throw new Error('Error obteniendo leads de la API externa');
    }

    const allLeads = await leadsResponse.json();

    // Filtrar leads que pertenecen al usuario y a la propiedad específica
    const propertyLeads = allLeads.filter((lead: any) =>
      lead.user_id === userId && lead.property_id.toString() === propertyId
    );

    // Convertir los leads al formato PropertyClient
    const clients: PropertyClient[] = propertyLeads.map((lead: any) => ({
      id: lead.id,
      name: lead.client_name,
      phone: lead.client_phone,
      comment: lead.comment || '',
      date: new Date(lead.created_at).toLocaleDateString('es-ES'),
      email: '', // No tenemos email en la API externa
      additionalInfo: '',
      status: lead.status.toString()
    }));

    return clients;
  } catch (error) {
    console.error('Error fetching property clients:', error);
    throw error;
  }
}

// Función auxiliar para obtener datos de una propiedad por ID
async function getPropertyById(propertyId: string): Promise<Property | null> {
  try {
    const properties = await fetchPropiedades();
    const property = properties.find(p => p.id.toString() === propertyId);

    if (property) {
      return property;
    }

    // Si no está en las propiedades generales, buscar en proyectos
    const projects = await fetchProyectos();
    for (const project of projects) {
      // Aquí podrías buscar en las propiedades del proyecto si fuera necesario
    }

    return null;
  } catch (error) {
    console.error('Error getting property by ID:', error);
    return null;
  }
}
