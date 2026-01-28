import React from 'react';

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

  const handleLogin = (): void => {
    window.location.href = '/login';
  };

  return (
    <nav className="fixed top-4 md:top-6 left-1/2 z-50" style={{ transform: 'translateX(-50%)', width: '95%', maxWidth: '1400px' }}>
      <div className="bg-white rounded-full shadow-lg" style={{ border: '1px solid rgba(229, 231, 235, 0.5)', backdropFilter: 'blur(4px)' }}>
        <div className="flex items-center justify-between px-4 md:px-8" style={{ height: '3.5rem' }}>
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <img
              src="/logo.png"
              alt="La Red"
              style={{ width: '80px', height: '32px', cursor: 'pointer' }}
              className="md:w-[100px] md:h-[40px]"
            />
          </a>

          {/* Navigation Links - Center */}
          <div className="hidden lg:flex items-center" style={{ gap: '1.5rem' }}>
            <button
              onClick={() => scrollToSection('caracteristicas')}
              className="font-lato text-base font-bold text-aux-dark-gray hover:text-black transition-colors duration-200"
              style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
            >
              Caracteristicas
            </button>
            <button
              onClick={() => scrollToSection('pasos-aliado')}
              className="font-lato text-base font-bold text-aux-dark-gray hover:text-black transition-colors duration-200"
              style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
            >
              Pasos para ser aliado
            </button>
            <button
              onClick={() => scrollToSection('propiedades')}
              className="font-lato text-base font-bold text-aux-dark-gray hover:text-black transition-colors duration-200"
              style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
            >
              Propiedades
            </button>
            <button
              onClick={() => scrollToSection('formulario')}
              className="font-lato text-base font-bold text-aux-dark-gray hover:text-black transition-colors duration-200"
              style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
            >
              Unete Ahora
            </button>
          </div>

          {/* Action Buttons - Right */}
          <div className="hidden lg:flex items-center" style={{ gap: '0.75rem' }}>
            <button
              onClick={handleLogin}
              className="px-4 py-2 font-lato text-xs font-bold text-black hover:bg-gray-50 rounded-full transition-all duration-200 flex items-center justify-center focus:outline-none"
              style={{ border: 'none' }}
            >
              Iniciar sesion
            </button>
            <button
              onClick={() => scrollToSection('formulario')}
              className="px-4 py-2 text-white font-lato text-xs font-bold rounded-full hover:shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
              style={{ background: 'linear-gradient(to right, #BF0A0A, #d91010)', border: 'none' }}
            >
              Promocionar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-all" style={{ background: 'transparent', border: 'none' }}>
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
