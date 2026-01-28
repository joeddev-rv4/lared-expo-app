import React, { useState, useEffect } from 'react';

const HeroSection = (): React.ReactElement => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const desktopImages = [
    '/images/get-started-bg.png',
    '/images/get-started-bg-2.png',
    '/images/get-started-bg-3.png',
  ];

  const scrollToSection = (id: string): void => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % desktopImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [desktopImages.length]);

  return (
    <section className="relative h-screen overflow-hidden" style={{ paddingTop: '4rem' }}>
      {/* Background images */}
      <div className="absolute inset-0 z-0">
        {/* Mobile image */}
        <img
          src="/images/get-started-bg-mobile.png"
          alt="Background"
          className="md:hidden"
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Desktop carousel */}
        <div className="hidden md:block relative w-full h-full">
          {desktopImages.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`Background ${index + 1}`}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'opacity 1s',
                opacity: index === currentSlide ? 1 : 0,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex flex-col justify-end md:justify-center h-full py-4 md:py-8">
          {/* Welcome content */}
          <div className="max-w-2xl mb-12 sm:mb-16 md:mb-0" style={{ marginTop: 'auto' }}>
            {/* Mobile welcome message */}
            <div className="md:hidden mb-6">
              <h1 className="text-3xl font-montserrat font-bold text-white mb-3">
                Bienvenido a La Red
              </h1>
              <p className="text-base font-lato" style={{ color: 'rgba(255,255,255,0.9)' }}>
                La plataforma lider en Guatemala para brokers inmobiliarios.
                Conecta, crece y cierra mas negocios.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => scrollToSection('formulario')}
                className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-4 bg-brand-red text-white font-lato font-semibold text-base sm:text-base md:text-lg rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                style={{ border: 'none' }}
              >
                Comenzar Ahora
              </button>
              <button
                onClick={() => scrollToSection('propiedades')}
                className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-4 bg-white text-aux-dark-gray font-lato font-semibold text-base sm:text-base md:text-lg rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                style={{ border: 'none' }}
              >
                Explorar Propiedades
              </button>
            </div>
          </div>
        </div>

        {/* Carousel indicators - Desktop only */}
        <div className="hidden md:flex absolute bottom-8 left-1/2 z-20 gap-3" style={{ transform: 'translateX(-50%)' }}>
          {desktopImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: index === currentSlide ? '2rem' : '0.75rem',
                height: '0.75rem',
                borderRadius: '9999px',
                transition: 'all 0.3s',
                background: index === currentSlide ? '#ffffff' : 'rgba(255,255,255,0.5)',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
