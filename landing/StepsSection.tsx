'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface StepCardProps {
  number: number;
  title: string;
  isVisible: boolean;
  showDownloadButtons?: boolean;
  showRegisterButton?: boolean;
  imageSrc: string;
  imageScale?: number;
}

const StepCard = ({
  number,
  title,
  isVisible,
  showDownloadButtons = false,
  showRegisterButton = false,
  imageSrc,
  imageScale = 1,
}: StepCardProps): React.ReactElement => {
  return (
    <div
      className={`flex items-center justify-center gap-4 md:gap-6 lg:gap-8 transition-all duration-700 w-full max-w-4xl mx-auto px-4 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ transitionDelay: `${number * 150}ms` }}
    >
      {/* Imagen flotante */}
      <div
        className="relative flex-shrink-0 cursor-pointer group"
        style={{
          width: '45%',
          height: 'clamp(300px, 50vh, 500px)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transform: `scale(${imageScale})`,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="group-hover:scale-110"
        >
          <Image
            src={imageSrc}
            alt={`Paso ${number}`}
            fill
            className="object-contain drop-shadow-2xl transition-all duration-400"
          />
        </div>
      </div>

      {/* Card con número y título */}
      <div className="p-4 md:p-6 lg:p-8 flex-1 max-w-sm lg:max-w-2xl">
        {/* Contenedor superior con número y título */}
        <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
          {/* Número con gradiente azul */}
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, #044BB8, #000000)',
            }}
          >
            <span className="text-white font-montserrat font-bold text-lg md:text-xl">
              {number}
            </span>
          </div>

          {/* Título */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg lg:text-xl font-montserrat font-bold text-aux-dark-gray text-left">
              {title}
            </h3>
          </div>
        </div>

        {/* Botones de descarga si es el primer paso - alineados con el número */}
        {showDownloadButtons && (
          <div className="flex flex-row gap-1.5 md:gap-2 items-center">
            <a
              href="https://apps.apple.com/gt/app/la-red-inmobiliaria/id6748619383"
              target="_blank"
              rel="noopener noreferrer"
              className="relative hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
              style={{ width: '260px', height: '148px' }}
            >
              <Image
                src="/images/appstore_logo_v1.png"
                alt="Download on App Store"
                fill
                className="object-contain"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.lared.inmobiliaria&pcampaignid=web_share"
              target="_blank"
              rel="noopener noreferrer"
              className="relative hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
              style={{ width: '260px', height: '148px' }}
            >
              <Image
                src="/images/googleplay_v1.png"
                alt="Get it on Google Play"
                fill
                className="object-contain"
              />
            </a>
          </div>
        )}

        {/* Botón Registrarse si es el segundo paso */}
        {showRegisterButton && (
          <div className="flex justify-start mt-4">
            <Link
              href="/register"
              className="px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-brand-red to-[#d91010] rounded-full font-montserrat font-bold text-white text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const StepsSection = (): React.ReactElement => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      title: 'Descarga la App',
      showDownloadButtons: true,
      imageSrc: '/images/download_v3.png',
      imageScale: 1.5,
    },
    {
      title: 'Crea tu Cuenta',
      showRegisterButton: true,
      imageSrc: '/images/form_v2.png',
    },
    { title: 'Agrega Propiedades', imageSrc: '/images/portfolio_v2.png' },
    { title: 'Publica en Redes Sociales', imageSrc: '/images/rrss_v2.png' },
    { title: 'Gana Comisiones', imageSrc: '/images/hombre_feliz_v2.png' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    const currentSection = sectionRef.current;

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = (): void => {
      const scrollLeft = container.scrollLeft;
      const stepWidth = container.scrollWidth / steps.length;
      const newStep = Math.round(scrollLeft / stepWidth);
      if (newStep !== currentStep) {
        setCurrentStep(newStep);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentStep, steps.length]);

  const scrollToStep = (stepIndex: number): void => {
    if (scrollContainerRef.current) {
      const stepWidth = scrollContainerRef.current.scrollWidth / steps.length;
      scrollContainerRef.current.scrollTo({
        left: stepWidth * stepIndex,
        behavior: 'smooth',
      });
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = (): void => {
    if (currentStep < steps.length - 1) {
      scrollToStep(currentStep + 1);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 0) {
      scrollToStep(currentStep - 1);
    }
  };

  return (
    <section
      id="pasos-aliado"
      ref={sectionRef}
      className="relative py-8 md:py-12 lg:py-16 overflow-hidden min-h-screen flex flex-col w-full items-center justify-center"
    >
      {/* Imagen de fondo */}
      <div
        className="absolute z-0 opacity-30"
        style={{
          backgroundImage: 'url(/images/horizontal-lines.png)',
          backgroundSize: '135% 200%',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          top: 100,
          left: 0,
          right: 0,
          width: '100%',
          height: '100%',
        }}
      />

      <div className="relative z-10 w-full mx-auto flex-1 flex flex-col justify-center">
        {/* Título */}
        <div className="text-center mb-6 md:mb-8 lg:mb-10 px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-montserrat font-bold text-aux-dark-gray">
            Pasos para ser un <span className="text-brand-red">Aliado</span>
          </h2>
        </div>

        {/* Contenedor de scroll horizontal */}
        <div className="relative flex-1 flex flex-col justify-center max-w-full">
          {/* Pasos con scroll horizontal */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-scroll overflow-y-hidden snap-x snap-mandatory w-full"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="flex pb-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center flex-shrink-0 snap-center w-full"
                  style={{
                    minWidth: '100%',
                  }}
                >
                  <StepCard
                    number={index + 1}
                    title={step.title}
                    isVisible={isVisible}
                    showDownloadButtons={step.showDownloadButtons}
                    showRegisterButton={step.showRegisterButton}
                    imageSrc={step.imageSrc}
                    imageScale={step.imageScale}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores de scroll */}
          <div className="flex justify-center items-center gap-2 md:gap-3 mt-4 md:mt-6 lg:mt-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToStep(index)}
                className={`w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-brand-red scale-125'
                    : 'bg-aux-gray-blue/30 hover:bg-aux-gray-blue/50'
                }`}
                aria-label={`Ir al paso ${index + 1}`}
              />
            ))}
          </div>

          {/* Botón Anterior - izquierda de la pantalla */}
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`absolute top-1/2 -translate-y-1/2 left-4 md:left-8 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 border-2 ${
              currentStep === 0
                ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-50'
                : 'bg-white border-brand-red hover:shadow-xl hover:scale-110'
            }`}
            aria-label="Paso anterior"
          >
            <ChevronLeft
              className={`w-6 h-6 md:w-7 md:h-7 ${
                currentStep === 0 ? 'text-gray-400' : 'text-brand-red'
              }`}
              strokeWidth={3}
            />
          </button>

          {/* Botón Siguiente - derecha de la pantalla */}
          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className={`absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 border-2 ${
              currentStep === steps.length - 1
                ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-50'
                : 'bg-white border-brand-red hover:shadow-xl hover:scale-110'
            }`}
            aria-label="Siguiente paso"
          >
            <ChevronRight
              className={`w-6 h-6 md:w-7 md:h-7 ${
                currentStep === steps.length - 1
                  ? 'text-gray-400'
                  : 'text-brand-red'
              }`}
              strokeWidth={3}
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
