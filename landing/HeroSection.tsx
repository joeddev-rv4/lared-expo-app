'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

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

  // Auto-play del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % desktopImages.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [desktopImages.length]);

  return (
    <section className="relative h-screen overflow-hidden pt-16 md:pt-20">
      {/* Imagen de fondo solo en esta sección */}
      <div className="absolute inset-0 z-0">
        {/* Imagen para móvil */}
        <Image
          src="/images/get-started-bg-mobile.png"
          alt="Background"
          fill
          className="object-cover md:hidden"
          priority
        />
        {/* Carrusel para desktop */}
        <div className="hidden md:block relative w-full h-full">
          {desktopImages.map((image, index) => (
            <Image
              key={image}
              src={image}
              alt={`Background ${index + 1}`}
              fill
              className={`object-cover transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              priority={index === 0}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex flex-col justify-end md:justify-center h-full py-4 md:py-8">
          {/* Contenido de bienvenida */}
          <div className="max-w-2xl space-y-4 md:space-y-6 mb-12 sm:mb-16 md:mb-0 md:mt-[35vh] lg:mt-[40vh]">
            {/* Mensaje de bienvenida - Solo móvil */}
            <div className="md:hidden mb-6">
              <h1 className="text-3xl font-montserrat font-bold text-white mb-3">
                Bienvenido a La Red
              </h1>
              <p className="text-base font-lato text-white/90">
                La plataforma líder en Guatemala para brokers inmobiliarios.
                Conecta, crece y cierra más negocios.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => scrollToSection('formulario')}
                className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 bg-brand-red text-white font-lato font-semibold text-base sm:text-base md:text-lg rounded-lg hover:bg-brand-red/90 transition-all duration-200 border-none shadow-lg hover:shadow-xl cursor-pointer"
              >
                Comenzar Ahora
              </button>
              <button
                onClick={() => scrollToSection('propiedades')}
                className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 bg-white text-aux-dark-gray font-lato font-semibold text-base sm:text-base md:text-lg rounded-lg hover:bg-white/90 transition-all duration-200 border-none shadow-lg hover:shadow-xl cursor-pointer"
              >
                Explorar Propiedades
              </button>
            </div>
          </div>
        </div>

        {/* Indicadores del carrusel - Solo desktop */}
        <div className="hidden md:flex absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 gap-3">
          {desktopImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
