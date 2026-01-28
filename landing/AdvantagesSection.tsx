'use client';

interface AdvantageCardProps {
  emoji: string;
  title: string;
  description: string;
}

const AdvantageCard = ({
  emoji,
  title,
  description,
}: AdvantageCardProps): React.ReactElement => {
  return (
    <div className="bg-gradient-to-r from-brand-red to-[#d91010] rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <div className="text-5xl md:text-6xl mb-4 md:mb-6 text-center">
        {emoji}
      </div>
      <h3 className="text-xl md:text-2xl font-montserrat font-bold text-white mb-3 md:mb-4 text-center">
        {title}
      </h3>
      <p className="text-sm md:text-base font-lato text-white/90 text-center leading-relaxed">
        {description}
      </p>
    </div>
  );
};

const AdvantagesSection = (): React.ReactElement => {
  return (
    <section
      id="caracteristicas"
      className="relative py-12 md:py-24 overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 50%, #044BB8, #000000)',
      }}
    >
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-aux-cream/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-montserrat font-bold text-white mb-3 md:mb-4 px-4">
            Ventajas de La Red Inmobiliaria
          </h2>
          <p className="text-base md:text-xl font-lato text-white/80 max-w-3xl mx-auto px-4">
            Descubre por qué miles de brokers confían en nosotros para potenciar
            su negocio
          </p>
        </div>

        {/* Tarjetas de ventajas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <AdvantageCard
            emoji=""
            title="Crecimiento Acelerado"
            description="Aumenta tu cartera de clientes y propiedades en un 300% gracias a nuestra red de contactos verificados y herramientas de marketing digital integradas."
          />
          <AdvantageCard
            emoji=""
            title="Conexiones Estratégicas"
            description="Accede a una red exclusiva de brokers certificados, desarrolladores y compradores potenciales para cerrar más negocios en menos tiempo."
          />
          <AdvantageCard
            emoji=""
            title="Propiedades Premium"
            description="Acceso prioritario a listados exclusivos de alta gama y oportunidades de inversión antes que lleguen al mercado público."
          />
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
