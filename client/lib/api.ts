const API_BASE_URL = "https://plataforma.controldepropiedades.com/api";
const API_KEY = "LgfPuSsMS4fleTHh6vAYgsgD3fDZNGAOkcEWoMtH";

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
