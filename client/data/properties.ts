import { APIPropiedad } from "@/lib/api";

export interface PropertyImage {
  tipo: string;
  url: string;
  formato: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  description: string;
  descripcionCorta: string;
  descripcionLarga: string;
  caracteristicas: string[];
  proyectoCaracteristicas: string[];
  imageUrl: string;
  imagenes: PropertyImage[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  isFavorite: boolean;
  projectName: string;
  propertyType: string;
  estado: string;
}

export function mapAPIPropertyToProperty(apiProp: APIPropiedad): Property {
  const firstImage = apiProp.imagenes.find((img) => img.formato === "imagen");
  const amenities = apiProp.caracteristicas
    ? apiProp.caracteristicas.split(",").map((a) => a.trim())
    : [];
  const caracteristicas = apiProp.caracteristicas
    ? apiProp.caracteristicas.split(",").map((a) => a.trim())
    : [];
  const proyectoCaracteristicas = apiProp.proyecto?.caracteristicas
    ? apiProp.proyecto.caracteristicas.split(",").map((a) => a.trim())
    : [];

  const imagenes: PropertyImage[] =
    apiProp.imagenes?.map((img) => ({
      tipo: img.tipo,
      url: img.url,
      formato: img.formato,
    })) || [];

  return {
    id: apiProp.id.toString(),
    title: apiProp.titulo || `${apiProp.tipo} ${apiProp.propiedad}`,
    location:
      apiProp.proyecto?.direccion || apiProp.ubicacion || "Sin ubicación",
    price: apiProp.precio,
    priceUnit: "total",
    rating: 0,
    reviewCount: 0,
    description: apiProp.descripcion || apiProp.descripcion_corta || "",
    descripcionCorta: apiProp.descripcion_corta || "",
    descripcionLarga: apiProp.descripcion || "",
    caracteristicas,
    proyectoCaracteristicas,
    imageUrl:
      firstImage?.url || "https://via.placeholder.com/400x300?text=Sin+Imagen",
    imagenes,
    bedrooms: apiProp.habitaciones || 0,
    bathrooms: apiProp.baños || 0,
    area: apiProp.area || 0,
    amenities,
    isFavorite: false,
    projectName: apiProp.proyecto?.nombre_proyecto || "",
    propertyType: apiProp.tipo || "Propiedad",
    estado: apiProp.estado || "disponible",
  };
}

export const PLACEHOLDER_PROPERTIES: Property[] = [];

export const PROPERTY_TYPES = [
  "All",
  "Villa",
  "Apartment",
  "Cabin",
  "House",
  "Bungalow",
  "Townhouse",
  "Studio",
  "Estate",
];
