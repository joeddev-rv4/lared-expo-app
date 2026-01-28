import React from 'react';

interface AllyData {
  id: number;
  name: string;
  company: string;
  propertiesPublished: number;
  salesCompleted: number;
  clientsContacted: number;
  specialty: string;
}

const Building2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const UserCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TopAlliesSection = (): React.ReactElement => {
  const topAllies: AllyData[] = [
    {
      id: 1,
      name: 'Maria Gonzalez',
      company: 'Premium Realty GT',
      propertiesPublished: 127,
      salesCompleted: 45,
      clientsContacted: 312,
      specialty: 'Propiedades de lujo',
    },
    {
      id: 2,
      name: 'Carlos Mendez',
      company: 'Urban Solutions',
      propertiesPublished: 203,
      salesCompleted: 89,
      clientsContacted: 567,
      specialty: 'Desarrollos comerciales',
    },
    {
      id: 3,
      name: 'Ana Rodriguez',
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
      name: 'Patricia Lopez',
      company: 'Elite Estates',
      propertiesPublished: 184,
      salesCompleted: 73,
      clientsContacted: 498,
      specialty: 'Residencias exclusivas',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden" style={{ paddingLeft: '2.5rem' }}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-aux-dark-gray mb-4">
            Top Aliados
          </h2>
          <p className="text-base md:text-lg font-lato text-aux-gray-blue max-w-2xl mx-auto">
            Conoce a los aliados mas destacados de nuestra plataforma
          </p>
        </div>

        {/* Horizontal scroll container */}
        <div className="relative">
          <div
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingLeft: '2.5rem',
            }}
          >
            {topAllies.map((ally) => (
              <div
                key={ally.id}
                className="flex-none snap-start"
                style={{ width: '85%', maxWidth: '320px' }}
              >
                {/* Card */}
                <div
                  className="rounded-2xl p-4 shadow-lg transition-all duration-300 h-full"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, #044BB8, #000000)',
                    border: '1px solid rgba(4, 75, 184, 0.3)',
                  }}
                >
                  {/* Header with photo and name */}
                  <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: 'radial-gradient(circle at 50% 50%, #BF0A0A, #8B0000)',
                          boxShadow: '0 0 0 2px rgba(191, 10, 10, 0.5)',
                        }}
                      >
                        <UserCircleIcon className="w-8 h-8 text-white" />
                      </div>
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          bottom: '-2px',
                          right: '-2px',
                          width: '20px',
                          height: '20px',
                          background: '#BF0A0A',
                          borderRadius: '9999px',
                          border: '2px solid white',
                        }}
                      >
                        <span className="text-white font-bold" style={{ fontSize: '10px' }}>
                          {ally.id}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-montserrat font-bold text-white truncate">
                        {ally.name}
                      </h3>
                      <p className="text-xs font-lato truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {ally.company}
                      </p>
                      <p className="font-lato mt-0.5" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
                        {ally.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Properties Published */}
                    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg text-center">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ background: 'rgba(4, 75, 184, 0.1)' }}>
                        <Building2Icon className="w-4 h-4 text-brand-blue" />
                      </div>
                      <p className="text-xl font-montserrat font-bold text-aux-dark-gray leading-none mb-0.5">
                        {ally.propertiesPublished}
                      </p>
                      <p className="font-lato text-aux-gray-blue leading-tight" style={{ fontSize: '9px' }}>
                        Propiedades
                      </p>
                    </div>

                    {/* Sales Completed */}
                    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg text-center">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ background: 'rgba(191, 10, 10, 0.1)' }}>
                        <TrendingUpIcon className="w-4 h-4 text-brand-red" />
                      </div>
                      <p className="text-xl font-montserrat font-bold text-aux-dark-gray leading-none mb-0.5">
                        {ally.salesCompleted}
                      </p>
                      <p className="font-lato text-aux-gray-blue leading-tight" style={{ fontSize: '9px' }}>
                        Ventas
                      </p>
                    </div>

                    {/* Clients Contacted */}
                    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg text-center">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ background: 'rgba(30, 58, 95, 0.1)' }}>
                        <UsersIcon className="w-4 h-4 text-aux-blue" />
                      </div>
                      <p className="text-xl font-montserrat font-bold text-aux-dark-gray leading-none mb-0.5">
                        {ally.clientsContacted}
                      </p>
                      <p className="font-lato text-aux-gray-blue leading-tight" style={{ fontSize: '9px' }}>
                        Clientes
                      </p>
                    </div>
                  </div>

                  {/* Verification badge */}
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <div className="flex items-center justify-center gap-1 text-white">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Mobile scroll indicator */}
        <div className="text-center mt-6 md:hidden">
          <p className="text-sm font-lato text-aux-gray-blue">
            Desliza para ver mas aliados
          </p>
        </div>
      </div>
    </section>
  );
};

export default TopAlliesSection;
