import React, { useEffect } from 'react';

import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import MetricsBar from '@/components/landing/MetricsBar';
import AdvantagesSection from '@/components/landing/AdvantagesSection';
import StepsSection from '@/components/landing/StepsSection';
import TopAlliesSection from '@/components/landing/TopAlliesSection';
import FeaturedPropertiesSection from '@/components/landing/FeaturedPropertiesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import ContactFormSection from '@/components/landing/ContactFormSection';
import Footer from '@/components/landing/Footer';
import WhatsAppButton from '@/components/landing/WhatsAppButton';

const LandingScreen = (): React.ReactElement => {
  useEffect(() => {
    // Inject CSS styles
    const styleId = 'landing-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Lato:wght@300;400;700&display=swap');

        :root {
          --brand-red: #BF0A0A;
          --brand-blue: #044BB8;
          --aux-blue: #1E3A5F;
          --aux-dark-gray: #2D3436;
          --aux-gray-blue: #6B7B8C;
          --aux-light: #B0BEC5;
        }

        .landing-page {
          font-family: 'Lato', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .landing-page * {
          box-sizing: border-box;
        }

        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-lato { font-family: 'Lato', sans-serif; }

        .text-brand-red { color: var(--brand-red); }
        .text-brand-blue { color: var(--brand-blue); }
        .text-aux-blue { color: var(--aux-blue); }
        .text-aux-dark-gray { color: var(--aux-dark-gray); }
        .text-aux-gray-blue { color: var(--aux-gray-blue); }
        .text-aux-light { color: var(--aux-light); }
        .text-white { color: #ffffff; }
        .text-black { color: #000000; }
        .text-yellow-400 { color: #facc15; }

        .bg-white { background-color: #ffffff; }
        .bg-brand-red { background-color: var(--brand-red); }
        .bg-brand-blue { background-color: var(--brand-blue); }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-gray-200 { background-color: #e5e7eb; }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin { animation: spin 1s linear infinite; }

        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .snap-x { scroll-snap-type: x mandatory; }
        .snap-mandatory { scroll-snap-type: x mandatory; }
        .snap-start { scroll-snap-align: start; }
        .snap-center { scroll-snap-align: center; }

        @media (min-width: 768px) {
          .md\\:hidden { display: none !important; }
          .md\\:block { display: block !important; }
          .md\\:flex { display: flex !important; }
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }

        @media (min-width: 1024px) {
          .lg\\:hidden { display: none !important; }
          .lg\\:flex { display: flex !important; }
          .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <div className="landing-page" style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <LandingNavbar />
      <HeroSection />
      <MetricsBar />
      <AdvantagesSection />
      <StepsSection />
      <TopAlliesSection />
      <FeaturedPropertiesSection />
      <TestimonialsSection />
      <ContactFormSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default LandingScreen;
