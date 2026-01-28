'use client';

import { Building2, TrendingUp, Users, UserCircle } from 'lucide-react';

interface AllyData {
  id: number;
  name: string;
  company: string;
  propertiesPublished: number;
  salesCompleted: number;
  clientsContacted: number;
  specialty: string;
}

const TopAlliesSection = (): React.ReactElement => {
  const topAllies: AllyData[] = [
    {
      id: 1,
      name: 'María González',
      company: 'Premium Realty GT',
      propertiesPublished: 127,
      salesCompleted: 45,
      clientsContacted: 312,
      specialty: 'Propiedades de lujo',
    },
    {
      id: 2,
      name: 'Carlos Méndez',
      company: 'Urban Solutions',
      propertiesPublished: 203,
      salesCompleted: 89,
      clientsContacted: 567,
      specialty: 'Desarrollos comerciales',
    },
    {
      id: 3,
      name: 'Ana Rodríguez',
      company: 'Costa Properties',
      propertiesPublished: 156,
      salesCompleted: 67,
      clientsContacted: 423,
      specialty: 'Propiedades costeras',
    },
    {
      id: 4,
      name: 'Roberto Castillo',
      company: 'Investment Group GT',
      propertiesPublished: 98,
      salesCompleted: 52,
      clientsContacted: 289,
      specialty: 'Inversiones inmobiliarias',
    },
    {
      id: 5,
      name: 'Patricia López',
      company: 'Elite Estates',
      propertiesPublished: 184,
      salesCompleted: 73,
      clientsContacted: 498,
      specialty: 'Residencias exclusivas',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden pl-10">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-aux-dark-gray mb-4">
            Top Aliados
          </h2>
          <p className="text-base md:text-lg font-lato text-aux-gray-blue max-w-2xl mx-auto">
            Conoce a los aliados más destacados de nuestra plataforma
          </p>
        </div>

        {/* Container de scroll horizontal */}
        <div className="relative">
          {/* Scroll container */}
          <div
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide pl-10"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {topAllies.map((ally) => (
              <div
                key={ally.id}
                className="flex-none w-[85%] sm:w-[45%] lg:w-[calc(33.333%-1rem)] snap-start"
              >
                {/* Card */}
                <div
                  className="rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-brand-blue/30 h-full"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 50%, #044BB8, #000000)',
                  }}
                >
                  {/* Header con foto y nombre */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/20">
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-brand-red/50"
                        style={{
                          background:
                            'radial-gradient(circle at 50% 50%, #BF0A0A, #8B0000)',
                        }}
                      >
                        <UserCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-brand-red rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">
                          {ally.id}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-montserrat font-bold text-white truncate">
                        {ally.name}
                      </h3>
                      <p className="text-xs font-lato text-white/80 truncate">
                        {ally.company}
                      </p>
                      <p className="text-[10px] font-lato text-white/60 mt-0.5">
                        {ally.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Métricas en Grid Horizontal */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Propiedades Publicadas */}
                    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg text-center">
                      <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-1.5">
                        <Building2 className="w-4 h-4 text-brand-blue" />
                      </div>
                      <p className="text-xl font-montserrat font-bold text-aux-dark-gray leading-none mb-0.5">
                        {ally.propertiesPublished}
                      </p>
                      <p className="text-[9px] font-lato text-aux-gray-blue leading-tight">
                        Propiedades
                      </p>
                    </div>

                    {/* Ventas Realizadas */}
                    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg text-center">
                      <div className="w-8 h-8 bg-brand-red/10 rounded-lg flex items-center justify-center mb-1.5">
                        <TrendingUp className="w-4 h-4 text-brand-red" />
                      </div>
                      <p className="text-xl font-montserrat font-bold text-aux-dark-gray leading-none mb-0.5">
                        {ally.salesCompleted}
                      </p>
                      <p className="text-[9px] font-lato text-aux-gray-blue leading-tight">
                        Ventas
                      </p>
                    </div>

                    {/* Clientes Contactados */}
                    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg text-center">
                      <div className="w-8 h-8 bg-aux-blue/10 rounded-lg flex items-center justify-center mb-1.5">
                        <Users className="w-4 h-4 text-aux-blue" />
                      </div>
                      <p className="text-xl font-montserrat font-bold text-aux-dark-gray leading-none mb-0.5">
                        {ally.clientsContacted}
                      </p>
                      <p className="text-[9px] font-lato text-aux-gray-blue leading-tight">
                        Clientes
                      </p>
                    </div>
                  </div>

                  {/* Badge de verificación */}
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="flex items-center justify-center gap-1.5 text-white">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-lato font-semibold">
                        Aliado Verificado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicador de scroll para móvil */}
        <div className="text-center mt-6 md:hidden">
          <p className="text-sm font-lato text-aux-gray-blue">
            Desliza para ver más aliados
          </p>
        </div>
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

export default TopAlliesSection;
