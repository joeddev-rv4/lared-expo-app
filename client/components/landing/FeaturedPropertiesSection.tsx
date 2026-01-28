import React, { useEffect, useState } from 'react';

interface Property {
  id: number;
  title: string;
  location: string;
  shortDescription: string;
  rooms: number;
  bathrooms: number;
  area: number;
  imageUrl: string;
}

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BedIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const BathIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MaximizeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

const FeaturedPropertiesSection = (): React.ReactElement => {
  const [loading, setLoading] = useState(true);

  const properties: Property[] = [
    {
      id: 1,
      title: 'Casa Moderna en Zona 10',
      location: 'Zona 10, Ciudad de Guatemala',
      shortDescription: 'Hermosa casa moderna con acabados de lujo, amplio jardin y excelente ubicacion.',
      rooms: 4,
      bathrooms: 3,
      area: 350,
      imageUrl: '/images/background.png',
    },
    {
      id: 2,
      title: 'Apartamento de Lujo Cayala',
      location: 'Cayala, Zona 16',
      shortDescription: 'Apartamento exclusivo con vista panoramica, amenidades de primer nivel.',
      rooms: 3,
      bathrooms: 2,
      area: 180,
      imageUrl: '/images/background.png',
    },
    {
      id: 3,
      title: 'Casa en Carretera a El Salvador',
      location: 'Km 16.5 Carretera a El Salvador',
      shortDescription: 'Amplia residencia en condominio privado con seguridad 24/7.',
      rooms: 5,
      bathrooms: 4,
      area: 420,
      imageUrl: '/images/background.png',
    },
    {
      id: 4,
      title: 'Penthouse Vista Hermosa',
      location: 'Vista Hermosa, Zona 15',
      shortDescription: 'Penthouse de lujo con terraza privada y acabados premium.',
      rooms: 3,
      bathrooms: 3,
      area: 280,
      imageUrl: '/images/background.png',
    },
    {
      id: 5,
      title: 'Casa Familiar en San Cristobal',
      location: 'San Cristobal, Mixco',
      shortDescription: 'Casa ideal para familias con amplio espacio y areas verdes.',
      rooms: 4,
      bathrooms: 3,
      area: 300,
      imageUrl: '/images/background.png',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section id="propiedades" className="py-16 md:py-24" style={{ background: 'linear-gradient(to bottom, #f9fafb, #ffffff)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div
              className="inline-block h-8 w-8 rounded-full"
              style={{
                border: '4px solid #044BB8',
                borderRightColor: 'transparent',
                animation: 'spin 1s linear infinite',
              }}
            />
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
      className="py-16 md:py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #f9fafb, #ffffff)', paddingLeft: '2.5rem' }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-aux-dark-gray mb-4">
            Propiedades Destacadas
          </h2>
          <p className="text-base md:text-lg font-lato text-aux-gray-blue max-w-2xl mx-auto">
            Descubre las mejores oportunidades inmobiliarias en Guatemala
          </p>
        </div>

        {/* Horizontal scroll container */}
        <div className="relative">
          <div
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex-none snap-start"
                style={{ width: '85%', maxWidth: '320px' }}
              >
                <div
                  className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 h-full"
                  style={{ border: '1px solid #f3f4f6' }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden bg-gray-200" style={{ height: '14rem' }}>
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s',
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="text-base font-montserrat font-bold text-aux-dark-gray mb-2 line-clamp-2" style={{ minHeight: '3rem' }}>
                      {property.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-start gap-1 mb-3">
                      <MapPinIcon className="w-4 h-4 text-brand-blue flex-shrink-0" style={{ marginTop: '2px' }} />
                      <p className="text-xs font-lato text-aux-gray-blue line-clamp-2">
                        {property.location}
                      </p>
                    </div>

                    {/* Short description */}
                    <p className="text-xs font-lato text-aux-gray-blue mb-4 line-clamp-3" style={{ minHeight: '3.5rem' }}>
                      {property.shortDescription}
                    </p>

                    {/* Features */}
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                      {property.rooms > 0 && (
                        <div className="flex items-center gap-1">
                          <BedIcon className="w-4 h-4 text-aux-blue" />
                          <span className="text-xs font-lato text-aux-dark-gray font-semibold">
                            {property.rooms}
                          </span>
                        </div>
                      )}

                      {property.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <BathIcon className="w-4 h-4 text-aux-blue" />
                          <span className="text-xs font-lato text-aux-dark-gray font-semibold">
                            {property.bathrooms}
                          </span>
                        </div>
                      )}

                      {property.area > 0 && (
                        <div className="flex items-center gap-1">
                          <MaximizeIcon className="w-4 h-4 text-aux-blue" />
                          <span className="text-xs font-lato text-aux-dark-gray font-semibold">
                            {property.area}m2
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View more button */}
                    <button
                      className="w-full mt-4 py-2 text-white font-lato font-semibold text-sm rounded-lg transition-opacity duration-200"
                      style={{
                        background: 'radial-gradient(circle at 50% 50%, #044BB8, #000000)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile scroll indicator */}
          <div className="text-center mt-6 md:hidden">
            <p className="text-sm font-lato text-aux-gray-blue">
              Desliza para ver mas propiedades
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPropertiesSection;
