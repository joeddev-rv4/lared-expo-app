'use client';

import { useEffect, useState } from 'react';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { locationService } from '@/services/location.service';
import type { Location } from '@/types/location.interface';
import Image from 'next/image';

const FeaturedPropertiesSection = (): React.ReactElement => {
  const [properties, setProperties] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async (): Promise<void> => {
      try {
        const allLocations = await locationService.getAllLocations();

        // Seleccionar 5 propiedades aleatorias
        const shuffled = [...allLocations].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);

        setProperties(selected);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchProperties();
  }, []);

  if (loading) {
    return (
      <section
        id="propiedades"
        className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-blue border-r-transparent"></div>
            <p className="mt-4 text-aux-gray-blue font-lato">
              Cargando propiedades...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="propiedades"
      className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden pl-10"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-aux-dark-gray mb-4">
            Propiedades Destacadas
          </h2>
          <p className="text-base md:text-lg font-lato text-aux-gray-blue max-w-2xl mx-auto">
            Descubre las mejores oportunidades inmobiliarias en Guatemala
          </p>
        </div>

        {/* Container de scroll horizontal */}
        <div className="relative">
          {/* Scroll container */}
          <div
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {properties.map((property) => {
              const mainImage = property.locationImages.find(
                (img) => !img.isVideo
              );
              const imageUrl = mainImage?.url ?? '/placeholder-property.jpg';

              return (
                <div
                  key={property.id}
                  className="flex-none w-[85%] sm:w-[45%] lg:w-[calc(33.333%-1rem)] snap-start"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 h-full">
                    {/* Imagen */}
                    <div className="relative h-56 md:h-64 w-full overflow-hidden bg-gray-200">
                      <Image
                        src={imageUrl}
                        alt={property.title}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
                      />
                    </div>

                    {/* Contenido */}
                    <div className="p-4">
                      {/* Título */}
                      <h3 className="text-base font-montserrat font-bold text-aux-dark-gray mb-2 line-clamp-2 min-h-[3rem]">
                        {property.title}
                      </h3>

                      {/* Ubicación */}
                      <div className="flex items-start gap-1.5 mb-3">
                        <MapPin className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-lato text-aux-gray-blue line-clamp-2">
                          {property.location}
                        </p>
                      </div>

                      {/* Descripción corta */}
                      <p className="text-xs font-lato text-aux-gray-blue mb-4 line-clamp-3 min-h-[3.5rem]">
                        {property.shortDescription}
                      </p>

                      {/* Características */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        {/* Habitaciones */}
                        {property.rooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4 text-aux-blue" />
                            <span className="text-xs font-lato text-aux-dark-gray font-semibold">
                              {property.rooms}
                            </span>
                          </div>
                        )}

                        {/* Baños */}
                        {property.bathrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4 text-aux-blue" />
                            <span className="text-xs font-lato text-aux-dark-gray font-semibold">
                              {property.bathrooms}
                            </span>
                          </div>
                        )}

                        {/* Área */}
                        {property.area > 0 && (
                          <div className="flex items-center gap-1">
                            <Maximize className="w-4 h-4 text-aux-blue" />
                            <span className="text-xs font-lato text-aux-dark-gray font-semibold">
                              {property.area}m²
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Botón ver más */}
                      <button
                        className="w-full mt-4 py-2 text-white font-lato font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity duration-200"
                        style={{
                          background:
                            'radial-gradient(circle at 50% 50%, #044BB8, #000000)',
                        }}
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Indicador de scroll para móvil */}
          <div className="text-center mt-6 md:hidden">
            <p className="text-sm font-lato text-aux-gray-blue">
              Desliza para ver más propiedades
            </p>
          </div>
        </div>

        {/* Mensaje si no hay propiedades */}
        {properties.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-aux-gray-blue font-lato text-lg">
              No se encontraron propiedades disponibles en este momento.
            </p>
          </div>
        )}
      </div>

      {/* CSS personalizado para ocultar scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturedPropertiesSection;
