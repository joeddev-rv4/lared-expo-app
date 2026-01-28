import React, { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LandingNavbar = ({ onNavigate }: { onNavigate: (section: string) => void }) => {
  const navigation = useNavigation<NavigationProp>();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navbarInner}>
        <div style={styles.navbarContent}>
          <div style={styles.logoContainer} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/logo.svg" alt="La Red" style={styles.logo} />
          </div>
          <div style={styles.navLinks}>
            <button onClick={() => scrollToSection("caracteristicas")} style={styles.navLink}>Caracteristicas</button>
            <button onClick={() => scrollToSection("pasos-aliado")} style={styles.navLink}>Pasos para ser aliado</button>
            <button onClick={() => scrollToSection("propiedades")} style={styles.navLink}>Propiedades</button>
            <button onClick={() => scrollToSection("formulario")} style={styles.navLink}>Unete Ahora</button>
          </div>
          <div style={styles.navActions}>
            <button onClick={() => navigation.navigate("Login")} style={styles.loginButton}>Iniciar sesion</button>
            <button onClick={() => scrollToSection("formulario")} style={styles.promoButton}>Promocionar</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const desktopImages = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % desktopImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [desktopImages.length]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <section style={styles.heroSection}>
      <div style={styles.heroImageContainer}>
        {desktopImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={`Background ${index + 1}`}
            style={{
              ...styles.heroImage,
              opacity: index === currentSlide ? 1 : 0,
            }}
          />
        ))}
        <div style={styles.heroOverlay} />
      </div>
      <div style={styles.heroContent}>
        <div style={styles.heroText}>
          <h1 style={styles.heroTitle}>Bienvenido a La Red</h1>
          <p style={styles.heroSubtitle}>
            La plataforma lider en Guatemala para brokers inmobiliarios. Conecta, crece y cierra mas negocios.
          </p>
          <div style={styles.heroButtons}>
            <button onClick={() => scrollToSection("formulario")} style={styles.primaryButton}>
              Comenzar Ahora
            </button>
            <button onClick={() => scrollToSection("propiedades")} style={styles.secondaryButton}>
              Explorar Propiedades
            </button>
          </div>
        </div>
      </div>
      <div style={styles.carouselIndicators}>
        {desktopImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              ...styles.indicator,
              width: index === currentSlide ? 32 : 12,
              backgroundColor: index === currentSlide ? "#fff" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </section>
  );
};

const MetricsBar = () => {
  const metrics = [
    { icon: "🏠", value: "1247", label: "Propiedades Listadas" },
    { icon: "👥", value: "523", label: "Brokers Certificados" },
    { icon: "✅", value: "892", label: "Transacciones Exitosas" },
  ];

  return (
    <section style={styles.metricsSection}>
      <div style={styles.metricsContainer}>
        <h2 style={styles.metricsTitle}>Numeros que Hablan por Nosotros</h2>
        <p style={styles.metricsSubtitle}>Miles de brokers confian en La Red para hacer crecer su negocio</p>
        <div style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <div key={index} style={styles.metricCard}>
              <div style={styles.metricIcon}>{metric.icon}</div>
              <div style={styles.metricValue}>{metric.value}</div>
              <div style={styles.metricLabel}>{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AdvantagesSection = () => {
  const advantages = [
    { emoji: "📈", title: "Crecimiento Acelerado", description: "Aumenta tu cartera de clientes y propiedades en un 300% gracias a nuestra red de contactos verificados y herramientas de marketing digital integradas." },
    { emoji: "🤝", title: "Conexiones Estrategicas", description: "Accede a una red exclusiva de brokers certificados, desarrolladores y compradores potenciales para cerrar mas negocios en menos tiempo." },
    { emoji: "🏢", title: "Propiedades Premium", description: "Acceso prioritario a listados exclusivos de alta gama y oportunidades de inversion antes que lleguen al mercado publico." },
  ];

  return (
    <section id="caracteristicas" style={styles.advantagesSection}>
      <div style={styles.advantagesDecorator1} />
      <div style={styles.advantagesDecorator2} />
      <div style={styles.advantagesContainer}>
        <h2 style={styles.advantagesTitle}>Ventajas de La Red Inmobiliaria</h2>
        <p style={styles.advantagesSubtitle}>Descubre por que miles de brokers confian en nosotros para potenciar su negocio</p>
        <div style={styles.advantagesGrid}>
          {advantages.map((adv, index) => (
            <div key={index} style={styles.advantageCard}>
              <div style={styles.advantageEmoji}>{adv.emoji}</div>
              <h3 style={styles.advantageCardTitle}>{adv.title}</h3>
              <p style={styles.advantageCardDesc}>{adv.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StepsSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { title: "Descarga la App", showDownloadButtons: true },
    { title: "Crea tu Cuenta", showRegisterButton: true },
    { title: "Agrega Propiedades" },
    { title: "Publica en Redes Sociales" },
    { title: "Gana Comisiones" },
  ];

  return (
    <section id="pasos-aliado" style={styles.stepsSection}>
      <div style={styles.stepsContainer}>
        <h2 style={styles.stepsTitle}>
          Pasos para ser un <span style={{ color: "#bf0a0a" }}>Aliado</span>
        </h2>
        <div style={styles.stepsCarousel}>
          {steps.map((step, index) => (
            <div
              key={index}
              style={{
                ...styles.stepCard,
                display: index === currentStep ? "flex" : "none",
              }}
            >
              <div style={styles.stepNumber}>{index + 1}</div>
              <h3 style={styles.stepCardTitle}>{step.title}</h3>
              {step.showDownloadButtons && (
                <div style={styles.downloadButtons}>
                  <a href="https://apps.apple.com/gt/app/la-red-inmobiliaria/id6748619383" target="_blank" rel="noopener noreferrer">
                    <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" style={styles.storeButton} />
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=com.lared.inmobiliaria" target="_blank" rel="noopener noreferrer">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={styles.storeButton} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={styles.stepsIndicators}>
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              style={{
                ...styles.stepIndicator,
                backgroundColor: index === currentStep ? "#bf0a0a" : "rgba(0,0,0,0.2)",
                transform: index === currentStep ? "scale(1.25)" : "scale(1)",
              }}
            />
          ))}
        </div>
        <div style={styles.stepsNavigation}>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            style={{
              ...styles.stepNavButton,
              opacity: currentStep === 0 ? 0.5 : 1,
            }}
          >
            ←
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            style={{
              ...styles.stepNavButton,
              opacity: currentStep === steps.length - 1 ? 0.5 : 1,
            }}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
};

const TopAlliesSection = () => {
  const allies = [
    { id: 1, name: "Maria Gonzalez", company: "Premium Realty GT", properties: 127, sales: 45, clients: 312, specialty: "Propiedades de lujo" },
    { id: 2, name: "Carlos Mendez", company: "Urban Solutions", properties: 203, sales: 89, clients: 567, specialty: "Desarrollos comerciales" },
    { id: 3, name: "Ana Rodriguez", company: "Costa Properties", properties: 156, sales: 67, clients: 423, specialty: "Propiedades costeras" },
  ];

  return (
    <section style={styles.alliesSection}>
      <div style={styles.alliesContainer}>
        <h2 style={styles.alliesTitle}>Top Aliados</h2>
        <p style={styles.alliesSubtitle}>Conoce a los aliados mas destacados de nuestra plataforma</p>
        <div style={styles.alliesGrid}>
          {allies.map((ally) => (
            <div key={ally.id} style={styles.allyCard}>
              <div style={styles.allyHeader}>
                <div style={styles.allyAvatar}>
                  <span style={styles.allyAvatarText}>{ally.name[0]}</span>
                </div>
                <div style={styles.allyInfo}>
                  <h3 style={styles.allyName}>{ally.name}</h3>
                  <p style={styles.allyCompany}>{ally.company}</p>
                </div>
              </div>
              <div style={styles.allyStats}>
                <div style={styles.allyStat}>
                  <div style={styles.allyStatValue}>{ally.properties}</div>
                  <div style={styles.allyStatLabel}>Propiedades</div>
                </div>
                <div style={styles.allyStat}>
                  <div style={styles.allyStatValue}>{ally.sales}</div>
                  <div style={styles.allyStatLabel}>Ventas</div>
                </div>
                <div style={styles.allyStat}>
                  <div style={styles.allyStatValue}>{ally.clients}</div>
                  <div style={styles.allyStatLabel}>Clientes</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturedPropertiesSection = () => {
  const properties = [
    { id: 1, title: "Casa Moderna en Zona 14", location: "Guatemala City", price: "$450,000", beds: 4, baths: 3, area: 350, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400" },
    { id: 2, title: "Apartamento de Lujo", location: "Zona 10", price: "$280,000", beds: 3, baths: 2, area: 180, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400" },
    { id: 3, title: "Villa con Vista al Lago", location: "Atitlan", price: "$650,000", beds: 5, baths: 4, area: 500, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400" },
  ];

  return (
    <section id="propiedades" style={styles.propertiesSection}>
      <div style={styles.propertiesContainer}>
        <h2 style={styles.propertiesTitle}>Propiedades Destacadas</h2>
        <p style={styles.propertiesSubtitle}>Descubre las mejores oportunidades inmobiliarias en Guatemala</p>
        <div style={styles.propertiesGrid}>
          {properties.map((property) => (
            <div key={property.id} style={styles.propertyCard}>
              <img src={property.image} alt={property.title} style={styles.propertyImage} />
              <div style={styles.propertyContent}>
                <h3 style={styles.propertyTitle}>{property.title}</h3>
                <p style={styles.propertyLocation}>{property.location}</p>
                <p style={styles.propertyPrice}>{property.price}</p>
                <div style={styles.propertyFeatures}>
                  <span>{property.beds} hab</span>
                  <span>{property.baths} banos</span>
                  <span>{property.area}m2</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    { id: 1, name: "Juan Perez", text: "La mejor plataforma para brokers. He triplicado mis ventas en 6 meses.", rating: 5 },
    { id: 2, name: "Laura Martinez", text: "Conexiones que transforman negocios. Recomendado 100%.", rating: 5 },
    { id: 3, name: "Roberto Sanchez", text: "Crecimiento garantizado con herramientas profesionales.", rating: 5 },
  ];

  return (
    <section style={styles.testimonialsSection}>
      <div style={styles.testimonialsContainer}>
        <h2 style={styles.testimonialsTitle}>Calificados por nuestros aliados</h2>
        <div style={styles.playStoreRating}>
          <span style={styles.starsContainer}>{"⭐".repeat(5)}</span>
        </div>
        <div style={styles.testimonialsGrid}>
          {testimonials.map((t) => (
            <div key={t.id} style={styles.testimonialCard}>
              <p style={styles.testimonialText}>"{t.text}"</p>
              <p style={styles.testimonialName}>- {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactFormSection = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Gracias por tu interes! Nos pondremos en contacto contigo pronto.");
      setFormData({ fullName: "", email: "", phoneNumber: "", password: "", confirmPassword: "", acceptTerms: false });
    }, 1500);
  };

  return (
    <section id="formulario" style={styles.contactSection}>
      <div style={styles.contactContainer}>
        <h2 style={styles.contactTitle}>Unete a La Red Inmobiliaria</h2>
        <div style={styles.contactForm}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Nombre completo</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                style={styles.formInput}
                placeholder="Ingresa tu nombre completo"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Correo electronico</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={styles.formInput}
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Numero de telefono</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                style={styles.formInput}
                placeholder="+502 1234-5678"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Contrasena</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={styles.formInput}
                placeholder="Minimo 8 caracteres"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Confirmar contrasena</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                style={styles.formInput}
                placeholder="Confirma tu contrasena"
                required
              />
            </div>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                required
              />
              <span style={styles.checkboxLabel}>
                Acepto los Terminos y Condiciones y Politica de Privacidad
              </span>
            </div>
            <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Completa tus datos"}
            </button>
            <p style={styles.loginLink}>
              Ya tienes una cuenta?{" "}
              <span onClick={() => navigation.navigate("Login")} style={styles.loginLinkText}>
                Iniciar sesion
              </span>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContainer}>
        <div style={styles.footerGrid}>
          <div style={styles.footerColumn}>
            <img src="/logo.svg" alt="La Red" style={styles.footerLogo} />
            <p style={styles.footerDescription}>
              La plataforma lider en Guatemala para brokers inmobiliarios.
            </p>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>Enlaces Rapidos</h3>
            <ul style={styles.footerLinks}>
              <li><a href="#" style={styles.footerLink}>Inicio</a></li>
              <li><a href="#propiedades" style={styles.footerLink}>Propiedades</a></li>
              <li><a href="#formulario" style={styles.footerLink}>Unete Ahora</a></li>
            </ul>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>Contactanos</h3>
            <p style={styles.footerContact}>info@lared.gt</p>
            <p style={styles.footerContact}>+502 5413-9214</p>
            <p style={styles.footerContact}>Ciudad de Guatemala</p>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>Siguenos</h3>
            <div style={styles.socialLinks}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>FB</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>IG</a>
              <a href="https://wa.me/50254139214" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>WA</a>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.copyright}>© 2025 La Red Inmobiliaria. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

const WhatsAppButton = () => {
  const handleClick = () => {
    const phoneNumber = "50254139214";
    const message = encodeURIComponent("Hola, me gustaria obtener mas informacion sobre La Red.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <button onClick={handleClick} style={styles.whatsappButton}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </button>
  );
};

export default function LandingScreen() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.documentElement.style.height = 'auto';
      const root = document.getElementById('root');
      if (root) {
        root.style.height = 'auto';
        root.style.overflow = 'visible';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.documentElement.style.height = '';
        const root = document.getElementById('root');
        if (root) {
          root.style.height = '';
          root.style.overflow = '';
        }
      }
    };
  }, []);

  return (
    <div style={styles.container}>
      <LandingNavbar onNavigate={() => {}} />
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
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#fff",
    fontFamily: "'Nunito', sans-serif",
  },
  navbar: {
    position: "fixed",
    top: 24,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 50,
    width: "85%",
    maxWidth: 1400,
  },
  navbarInner: {
    backgroundColor: "#fff",
    borderRadius: 50,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    border: "1px solid rgba(0,0,0,0.05)",
  },
  navbarContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    height: 70,
  },
  logoContainer: {
    cursor: "pointer",
  },
  logo: {
    height: 40,
  },
  navLinks: {
    display: "flex",
    gap: 24,
  },
  navLink: {
    background: "none",
    border: "none",
    fontSize: 14,
    fontWeight: 700,
    color: "#333",
    cursor: "pointer",
    padding: 0,
  },
  navActions: {
    display: "flex",
    gap: 12,
  },
  loginButton: {
    padding: "8px 16px",
    fontSize: 12,
    fontWeight: 700,
    color: "#000",
    background: "none",
    border: "none",
    borderRadius: 50,
    cursor: "pointer",
  },
  promoButton: {
    padding: "8px 16px",
    fontSize: 12,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(to right, #bf0a0a, #d91010)",
    border: "none",
    borderRadius: 50,
    cursor: "pointer",
  },
  heroSection: {
    position: "relative",
    height: "100vh",
    overflow: "hidden",
    paddingTop: 80,
  },
  heroImageContainer: {
    position: "absolute",
    inset: 0,
  },
  heroImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 1s ease",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))",
  },
  heroContent: {
    position: "relative",
    zIndex: 10,
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  heroText: {
    maxWidth: 600,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 32,
    lineHeight: 1.6,
  },
  heroButtons: {
    display: "flex",
    gap: 16,
  },
  primaryButton: {
    padding: "16px 32px",
    fontSize: 18,
    fontWeight: 600,
    color: "#fff",
    backgroundColor: "#bf0a0a",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  secondaryButton: {
    padding: "16px 32px",
    fontSize: 18,
    fontWeight: 600,
    color: "#333",
    backgroundColor: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  carouselIndicators: {
    position: "absolute",
    bottom: 32,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 12,
    zIndex: 20,
  },
  indicator: {
    height: 12,
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  metricsSection: {
    backgroundColor: "#fff",
    padding: "96px 0",
  },
  metricsContainer: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px",
    textAlign: "center",
  },
  metricsTitle: {
    fontSize: 48,
    fontWeight: 700,
    color: "#044BB8",
    marginBottom: 16,
  },
  metricsSubtitle: {
    fontSize: 20,
    color: "#666",
    marginBottom: 64,
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 48,
  },
  metricCard: {
    padding: 32,
    textAlign: "center",
  },
  metricIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  metricValue: {
    fontSize: 64,
    fontWeight: 700,
    color: "#bf0a0a",
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 20,
    fontWeight: 700,
    color: "#044BB8",
  },
  advantagesSection: {
    position: "relative",
    padding: "96px 0",
    background: "radial-gradient(circle at 50% 50%, #044BB8, #000)",
    overflow: "hidden",
  },
  advantagesDecorator1: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 384,
    height: 384,
    backgroundColor: "rgba(191,10,10,0.1)",
    borderRadius: "50%",
    filter: "blur(60px)",
  },
  advantagesDecorator2: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 384,
    height: 384,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "50%",
    filter: "blur(60px)",
  },
  advantagesContainer: {
    position: "relative",
    zIndex: 10,
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px",
  },
  advantagesTitle: {
    fontSize: 48,
    fontWeight: 700,
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  advantagesSubtitle: {
    fontSize: 20,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 64,
    maxWidth: 800,
    margin: "0 auto 64px",
  },
  advantagesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 32,
  },
  advantageCard: {
    background: "linear-gradient(to right, #bf0a0a, #d91010)",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  advantageEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  advantageCardTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 16,
  },
  advantageCardDesc: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 1.6,
  },
  stepsSection: {
    position: "relative",
    padding: "64px 0",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  stepsContainer: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px",
    textAlign: "center",
  },
  stepsTitle: {
    fontSize: 48,
    fontWeight: 700,
    color: "#333",
    marginBottom: 48,
  },
  stepsCarousel: {
    marginBottom: 32,
  },
  stepCard: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    minHeight: 300,
  },
  stepNumber: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "radial-gradient(circle at 50% 50%, #044BB8, #000)",
    color: "#fff",
    fontSize: 24,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepCardTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#333",
    marginBottom: 24,
  },
  downloadButtons: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
  },
  storeButton: {
    height: 48,
  },
  stepsIndicators: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  stepsNavigation: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
  },
  stepNavButton: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    backgroundColor: "#fff",
    border: "2px solid #bf0a0a",
    color: "#bf0a0a",
    fontSize: 24,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  alliesSection: {
    padding: "96px 0",
    backgroundColor: "#fff",
  },
  alliesContainer: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px",
  },
  alliesTitle: {
    fontSize: 48,
    fontWeight: 700,
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  alliesSubtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 48,
  },
  alliesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
  },
  allyCard: {
    background: "radial-gradient(circle at 50% 50%, #044BB8, #000)",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  allyHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "1px solid rgba(255,255,255,0.2)",
  },
  allyAvatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "radial-gradient(circle at 50% 50%, #bf0a0a, #8B0000)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  allyAvatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: 700,
  },
  allyInfo: {
    flex: 1,
  },
  allyName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 4,
  },
  allyCompany: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  allyStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  allyStat: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    textAlign: "center",
  },
  allyStatValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#333",
  },
  allyStatLabel: {
    fontSize: 10,
    color: "#666",
  },
  propertiesSection: {
    padding: "96px 0",
    background: "linear-gradient(to bottom, #f9fafb, #fff)",
  },
  propertiesContainer: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px",
  },
  propertiesTitle: {
    fontSize: 48,
    fontWeight: 700,
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  propertiesSubtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 48,
  },
  propertiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
  },
  propertyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  propertyImage: {
    width: "100%",
    height: 200,
    objectFit: "cover",
  },
  propertyContent: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#333",
    marginBottom: 8,
  },
  propertyLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: 700,
    color: "#bf0a0a",
    marginBottom: 16,
  },
  propertyFeatures: {
    display: "flex",
    gap: 16,
    fontSize: 12,
    color: "#666",
  },
  testimonialsSection: {
    padding: "96px 0",
    background: "linear-gradient(to bottom, #fff, #f9fafb)",
  },
  testimonialsContainer: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px",
    textAlign: "center",
  },
  testimonialsTitle: {
    fontSize: 48,
    fontWeight: 700,
    color: "#333",
    marginBottom: 24,
  },
  playStoreRating: {
    marginBottom: 48,
  },
  starsContainer: {
    fontSize: 28,
  },
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
  },
  testimonialCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    textAlign: "left",
  },
  testimonialText: {
    fontSize: 16,
    color: "#333",
    fontStyle: "italic",
    marginBottom: 16,
    lineHeight: 1.6,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#bf0a0a",
  },
  contactSection: {
    position: "relative",
    padding: "80px 0",
    background: "radial-gradient(circle at 50% 50%, #044BB8, #000)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
  },
  contactContainer: {
    maxWidth: 600,
    margin: "0 auto",
    padding: "0 24px",
    width: "100%",
  },
  contactTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
  },
  contactForm: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#333",
    marginBottom: 8,
  },
  formInput: {
    width: "100%",
    padding: "12px 16px",
    fontSize: 14,
    border: "1px solid #ddd",
    borderRadius: 8,
    outline: "none",
    boxSizing: "border-box",
  },
  checkboxGroup: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#333",
    lineHeight: 1.5,
  },
  submitButton: {
    width: "100%",
    padding: "14px 0",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(to right, #bf0a0a, rgba(191,10,10,0.9))",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  loginLink: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    marginTop: 16,
  },
  loginLinkText: {
    color: "#bf0a0a",
    fontWeight: 600,
    cursor: "pointer",
  },
  footer: {
    background: "linear-gradient(to bottom right, #333, #000, #333)",
    color: "#fff",
    padding: "48px 0 24px",
  },
  footerContainer: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 32,
    marginBottom: 32,
  },
  footerColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  footerLogo: {
    height: 40,
    filter: "brightness(0) invert(1)",
  },
  footerDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.6,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 8,
  },
  footerLinks: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  footerLink: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textDecoration: "none",
  },
  footerContact: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  socialLinks: {
    display: "flex",
    gap: 12,
  },
  socialLink: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#fff",
    textDecoration: "none",
  },
  footerBottom: {
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: 24,
    textAlign: "center",
  },
  copyright: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  whatsappButton: {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: "50%",
    backgroundColor: "#25D366",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    zIndex: 50,
    transition: "transform 0.2s ease",
  },
};
