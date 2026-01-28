'use client';

import Image from 'next/image';
import Link from 'next/link';

const LandingNavbar = (): React.ReactElement => {
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

  return (
    <nav className="fixed top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] md:w-[85%] max-w-[1400px]">
      <div className="bg-white rounded-full shadow-lg border border-gray-200/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 md:px-8 h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.svg"
              alt="La Red"
              width={80}
              height={32}
              className="cursor-pointer md:w-[100px] md:h-[40px]"
            />
          </Link>

          {/* Navigation Links - Center */}
          <div className="hidden lg:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection('caracteristicas')}
              className="font-lato text-base font-bold text-aux-dark-gray hover:text-black transition-colors duration-200 bg-transparent border-0 p-0 cursor-pointer"
            >
              Características
            </button>
            <button
              onClick={() => scrollToSection('pasos-aliado')}
              className="font-lato text-base font-bold text-aux-dark-gray hover:text-black transition-colors duration-200 bg-transparent border-0 p-0 cursor-pointer"
            >
              Pasos para ser aliado
            </button>
            <button
              onClick={() => scrollToSection('propiedades')}
              className="font-lato text-base font-bold text-aux-dark-gray hover:text-black transition-colors duration-200 bg-transparent border-0 p-0 cursor-pointer"
            >
              Propiedades
            </button>
            <button
              onClick={() => scrollToSection('formulario')}
              className="font-lato text-base font-bold text-aux-dark-gray hover:text-black transition-colors duration-200 bg-transparent border-0 p-0 cursor-pointer"
            >
              Únete Ahora
            </button>
          </div>

          {/* Action Buttons - Right */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link href="/login">
              <button className="px-4 py-2 font-lato text-xs font-bold text-black hover:bg-gray-50 rounded-full transition-all duration-200 flex items-center justify-center focus:outline-none border-none">
                Iniciar sesión
              </button>
            </Link>
            <button
              onClick={() => scrollToSection('formulario')}
              className="px-4 py-2 bg-gradient-to-r from-brand-red to-[#d91010] text-white font-lato text-xs font-bold rounded-full hover:shadow-lg transition-all duration-200 flex items-center justify-center border-none cursor-pointer"
            >
              Promocionar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-all">
            <svg
              className="h-5 w-5 text-aux-dark-gray"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
