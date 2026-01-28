import React, { useEffect } from 'react';

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const TestimonialsSection = (): React.ReactElement => {
  const testimonials = [
    {
      id: 1,
      reelId: 'DQpboffFTx0',
      url: 'https://www.instagram.com/reel/DQpboffFTx0/',
      title: 'Testimonial 1',
      overlayText: 'La mejor plataforma para brokers',
    },
    {
      id: 2,
      reelId: 'DO_V5M-lT-u',
      url: 'https://www.instagram.com/reel/DO_V5M-lT-u/',
      title: 'Testimonial 2',
      overlayText: 'Conexiones que transforman negocios',
    },
    {
      id: 3,
      reelId: 'DRPXFi9ig_R',
      url: 'https://www.instagram.com/reel/DRPXFi9ig_R/',
      title: 'Testimonial 3',
      overlayText: 'Crecimiento garantizado',
    },
  ];

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <section className="py-16 md:py-24" style={{ background: 'linear-gradient(to bottom, #ffffff, #f9fafb)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-bold text-aux-dark-gray mb-6">
            Calificados por nuestros aliados
          </h2>

          {/* Play Store Rating */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              {/* Play Store Icon */}
              <div className="w-10 h-10 md:w-12 md:h-12 relative">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                  <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm.53-.53l2.27-2.27L21.05 13l-2.27 2.27-1.44-1.18zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z" fill="#34A853" />
                  <path d="M13.69 12l2.27-2.27 5.39 3.12c.5.29.84.76.84 1.35 0 .59-.34 1.06-.84 1.35l-5.39 3.12L13.69 12z" fill="#FBBC04" />
                  <path d="M3.84 3.15c-.5.24-.84.76-.84 1.35v17c0 .59.34 1.11.84 1.35L13.69 12 3.84 3.15z" fill="#4285F4" />
                  <path d="M13.69 12l6.76-3.88c.5-.29.84-.76.84-1.35 0-.59-.34-1.06-.84-1.35L6.05 2.66 13.69 12z" fill="#EA4335" />
                </svg>
              </div>

              {/* 5 Stars */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} className="w-6 h-6 md:w-7 md:h-7 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="relative group mx-auto">
              {/* Video Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl transition-shadow duration-300">
                {/* Overlay with text */}
                <div
                  className="absolute top-0 left-0 right-0 z-10 pointer-events-none p-4"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.3), transparent)' }}
                >
                  <p className="text-white font-lato font-semibold text-base md:text-lg leading-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {testimonial.overlayText}
                  </p>
                </div>

                {/* Instagram Embed */}
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={testimonial.url}
                  data-instgrm-version="14"
                  style={{
                    background: '#FFF',
                    border: '0',
                    borderRadius: '3px',
                    boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                    margin: '0',
                    maxWidth: '540px',
                    minWidth: '280px',
                    padding: '0',
                    width: 'calc(100% - 2px)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div className="text-center mt-8 text-sm text-gray-500 font-lato">
          <p>* Testimonios reales de nuestros brokers aliados</p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
