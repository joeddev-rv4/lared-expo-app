import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
};

const ScrollContext =
  createContext<React.RefObject<HTMLDivElement | null> | null>(null);

const scrollToSection = (
  id: string,
  scrollRef?: React.RefObject<HTMLDivElement | null> | null,
) => {
  const element = document.getElementById(id);
  const scrollContainer = scrollRef?.current;
  if (element && scrollContainer) {
    const offset = 100;
    const elementPosition = element.offsetTop;
    const offsetPosition = elementPosition - offset;
    scrollContainer.scrollTo({ top: offsetPosition, behavior: "smooth" });
  }
};

const baseUrl = getApiUrl();
const heroImage1 = `${baseUrl}assets/images-lared/get-started-bg.png`;
const heroImage2 = `${baseUrl}assets/images-lared/get-started-bg-2.png`;
const heroImage3 = `${baseUrl}assets/images-lared/get-started-bg-3.png`;
const heroImageMobile1 = `${baseUrl}assets/images-lared/get-started-bg-mobile-1.png`;
const heroImageMobile2 = `${baseUrl}assets/images-lared/get-started-bg-mobile-2.png`;
const heroImageMobile3 = `${baseUrl}assets/images-lared/get-started-bg-mobile-3.png`;
const logoSvg = `${baseUrl}assets/images-lared/logo.svg`;
const horizontalLinesImg = `${baseUrl}assets/images-lared/horizontal-lines.png`;
const phoneImg = `${baseUrl}assets/images-lared/phone.png`;
const portfolioImg = `${baseUrl}assets/images-lared/portfolio_v2.png`;
const rrssImg = `${baseUrl}assets/images-lared/rrss_v2.png`;
const hombreFelizImg = `${baseUrl}assets/images-lared/hombre_feliz_v2.png`;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LandingNavbar = ({
  onNavigate,
}: {
  onNavigate: (section: string) => void;
}) => {
  const navigation = useNavigation<NavigationProp>();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useContext(ScrollContext);

  const handleScrollTo = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id, scrollRef);
  };

  const handleLogin = () => {
    setMenuOpen(false);
    navigation.navigate("Login");
  };

  if (isMobile) {
    return (
      <>
        <div style={styles.floatingNavContainer}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={styles.floatingMenuButton}
          >
            <div
              style={{
                ...styles.hamburgerLine,
                transform: menuOpen
                  ? "rotate(45deg) translate(5px, 5px)"
                  : "none",
              }}
            />
            <div
              style={{ ...styles.hamburgerLine, opacity: menuOpen ? 0 : 1 }}
            />
            <div
              style={{
                ...styles.hamburgerLine,
                transform: menuOpen
                  ? "rotate(-45deg) translate(5px, -5px)"
                  : "none",
              }}
            />
          </button>
        </div>
        {menuOpen && (
          <div
            style={styles.mobileMenuOverlay}
            onClick={() => setMenuOpen(false)}
          >
            <div
              style={styles.mobileMenuFloating}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.mobileMenuHeader}>
                <img src={logoSvg} alt="La Red" style={{ height: 32 }} />
                <button
                  onClick={() => setMenuOpen(false)}
                  style={styles.mobileMenuCloseButton}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#222"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => handleScrollTo("caracteristicas")}
                style={styles.mobileMenuItem}
              >
                Caracteristicas
              </button>
              <button
                onClick={() => handleScrollTo("pasos-aliado")}
                style={styles.mobileMenuItem}
              >
                Pasos para ser aliado
              </button>
              <button
                onClick={() => handleScrollTo("propiedades")}
                style={styles.mobileMenuItem}
              >
                Propiedades
              </button>
              <button
                onClick={() => handleScrollTo("formulario")}
                style={styles.mobileMenuItem}
              >
                Unete Ahora
              </button>
              <div style={styles.mobileMenuDivider} />
              <button onClick={handleLogin} style={styles.mobileMenuItem}>
                Iniciar sesion
              </button>
              <button
                onClick={() => handleScrollTo("formulario")}
                style={styles.mobileMenuPromoButton}
              >
                Promocionar
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.navbarInner}>
        <div style={styles.navbarContent}>
          <div
            style={styles.logoContainer}
            onClick={() =>
              scrollRef?.current?.scrollTo({ top: 0, behavior: "smooth" })
            }
          >
            <img src={logoSvg} alt="La Red" style={styles.logo} />
          </div>
          <div style={styles.navLinks}>
            <button
              onClick={() => handleScrollTo("caracteristicas")}
              style={styles.navLink}
            >
              Caracteristicas
            </button>
            <button
              onClick={() => handleScrollTo("pasos-aliado")}
              style={styles.navLink}
            >
              Pasos para ser aliado
            </button>
            <button
              onClick={() => handleScrollTo("propiedades")}
              style={styles.navLink}
            >
              Propiedades
            </button>
            <button
              onClick={() => handleScrollTo("formulario")}
              style={styles.navLink}
            >
              Unete Ahora
            </button>
          </div>
          <div style={styles.navActions}>
            <button
              onClick={() => navigation.navigate("Login")}
              style={styles.loginButton}
            >
              Iniciar sesion
            </button>
            <button
              onClick={() => handleScrollTo("formulario")}
              style={styles.promoButton}
            >
              Promocionar
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  const isMobile = useIsMobile();
  const [currentSlide, setCurrentSlide] = useState(0);
  const desktopImages = [heroImage1, heroImage2, heroImage3];
  const mobileImages = [heroImageMobile1, heroImageMobile2, heroImageMobile3];
  const images = isMobile ? mobileImages : desktopImages;
  const scrollRef = useContext(ScrollContext);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleScrollTo = (id: string) => {
    scrollToSection(id, scrollRef);
  };

  return (
    <section
      style={
        isMobile
          ? {
              ...styles.heroSection,
              height: "60vh",
              minHeight: 350,
              maxHeight: 500,
              paddingTop: 60,
            }
          : styles.heroSection
      }
    >
      <div style={styles.heroImageContainer}>
        {images.map((image, index) => (
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
      </div>
      <div
        style={
          isMobile
            ? { ...styles.heroContent, bottom: 70, left: 16, right: 16 }
            : styles.heroContent
        }
      >
        <div
          style={
            isMobile
              ? {
                  ...styles.heroButtonsContainer,
                  flexDirection: "column",
                  gap: 12,
                }
              : styles.heroButtonsContainer
          }
        >
          <button
            onClick={() => handleScrollTo("formulario")}
            style={
              isMobile
                ? {
                    ...styles.primaryButton,
                    padding: "12px 24px",
                    fontSize: 14,
                    width: "100%",
                  }
                : styles.primaryButton
            }
          >
            Comenzar Ahora
          </button>
          <button
            onClick={() => handleScrollTo("propiedades")}
            style={
              isMobile
                ? {
                    ...styles.secondaryButton,
                    padding: "12px 24px",
                    fontSize: 14,
                    width: "100%",
                  }
                : styles.secondaryButton
            }
          >
            Explorar Propiedades
          </button>
        </div>
      </div>
      <div
        style={
          isMobile
            ? { ...styles.carouselIndicators, bottom: 16 }
            : styles.carouselIndicators
        }
      >
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              ...styles.indicator,
              width: index === currentSlide ? 24 : 8,
              height: isMobile ? 8 : 12,
              backgroundColor:
                index === currentSlide ? "#fff" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </section>
  );
};

const MetricsBar = () => {
  const isMobile = useIsMobile();
  const [metrics, setMetrics] = useState([
    { value: "0", label: "Propiedades Listadas" },
    { value: "0", label: "Aliados certificados" },
    { value: "0", label: "Transacciones Exitosas" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";
        const response = await fetch(`${apiUrl}/powerbi/getDashboardStats`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          const newMetrics = data.data.map(
            (stat: { title: string; data: number }) => ({
              value: stat.data.toLocaleString(),
              label: stat.title,
            }),
          );
          setMetrics(newMetrics);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <section
      style={
        isMobile
          ? { ...styles.metricsSection, padding: "48px 0" }
          : styles.metricsSection
      }
    >
      <div
        style={
          isMobile
            ? { ...styles.metricsContainer, padding: "0 16px" }
            : styles.metricsContainer
        }
      >
        <h2
          style={
            isMobile
              ? { ...styles.metricsTitle, fontSize: 28 }
              : styles.metricsTitle
          }
        >
          Numeros que Hablan por Nosotros
        </h2>
        <p
          style={
            isMobile
              ? { ...styles.metricsSubtitle, fontSize: 14, marginBottom: 32 }
              : styles.metricsSubtitle
          }
        >
          Miles de aliados confian en La Red para hacer crecer su negocio
        </p>
        <div
          style={
            isMobile
              ? { ...styles.metricsGrid, gridTemplateColumns: "1fr", gap: 24 }
              : styles.metricsGrid
          }
        >
          {metrics.map((metric, index) => (
            <div
              key={index}
              style={
                isMobile
                  ? { ...styles.metricCard, padding: 16 }
                  : styles.metricCard
              }
            >
              <div
                style={
                  isMobile
                    ? { ...styles.metricValue, fontSize: 40 }
                    : styles.metricValue
                }
              >
                {metric.value}
              </div>
              <div
                style={
                  isMobile
                    ? { ...styles.metricLabel, fontSize: 16 }
                    : styles.metricLabel
                }
              >
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AdvantagesSection = () => {
  const isMobile = useIsMobile();
  const [advantages, setAdvantages] = useState([
    {
      title: "Crecimiento Acelerado",
      description:
        "Aumenta tu cartera de clientes y propiedades en un 300% gracias a nuestra red de contactos verificados y herramientas de marketing digital integradas.",
    },
    {
      title: "Conexiones Estrategicas",
      description:
        "Accede a una red exclusiva de aliados certificados, desarrolladores y compradores potenciales para cerrar mas negocios en menos tiempo.",
    },
    {
      title: "Propiedades Premium",
      description:
        "Acceso prioritario a listados exclusivos de alta gama y oportunidades de inversion antes que lleguen al mercado publico.",
    },
  ]);

  useEffect(() => {
    const fetchSecciones = async () => {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";
        const fullUrl = `${apiUrl}/powerbi/getSecciones`;
        console.log("URL que se está llamando:", fullUrl);

        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420", // prueba con número/string largo
            "User-Agent": "ExpoApp/Dev", // ← agrega esto (ver punto 2)
            "Content-Type": "application/json",
          },
        });

        console.log("Status code:", response.status);
        console.log("OK?", response.ok);

        const textResponse = await response.text(); // ¡primero texto plano!
        console.log(
          "Respuesta cruda (primeros 400 chars):",
          textResponse.substring(0, 400),
        );

        if (!response.ok) {
          throw new Error(
            `Error HTTP ${response.status}: ${textResponse.substring(0, 200)}`,
          );
        }

        const data = JSON.parse(textResponse);
        console.log("Datos parseados:", data);

        if (data.secciones && Array.isArray(data.secciones)) {
          const newAdvantages = data.secciones.map(
            (seccion: { titulo: string; descripcion: string }) => ({
              title: seccion.titulo,
              description: seccion.descripcion,
            }),
          );
          setAdvantages(newAdvantages);
        }
      } catch (error: any) {
        console.error("Fetch error details:");
        console.error("Message:", error.message);
        console.error("Code (si existe):", error.code);
        console.error("Full:", error);
      }
    };
    fetchSecciones();
  }, []);

  return (
    <section
      id="caracteristicas"
      style={
        isMobile
          ? { ...styles.advantagesSection, padding: "48px 0" }
          : styles.advantagesSection
      }
    >
      <div style={styles.advantagesDecorator1} />
      <div style={styles.advantagesDecorator2} />
      <div
        style={
          isMobile
            ? { ...styles.advantagesContainer, padding: "0 16px" }
            : styles.advantagesContainer
        }
      >
        <h2
          style={
            isMobile
              ? { ...styles.advantagesTitle, fontSize: 24 }
              : styles.advantagesTitle
          }
        >
          Ventajas de La Red Inmobiliaria
        </h2>
        <p
          style={
            isMobile
              ? { ...styles.advantagesSubtitle, fontSize: 14, marginBottom: 32 }
              : styles.advantagesSubtitle
          }
        >
          Descubre por que miles de aliados confian en nosotros para potenciar
          su negocio
        </p>
        <div
          style={
            isMobile
              ? {
                  ...styles.advantagesGrid,
                  gridTemplateColumns: "1fr",
                  gap: 16,
                }
              : styles.advantagesGrid
          }
        >
          {advantages.map((adv, index) => (
            <div
              key={index}
              style={
                isMobile
                  ? { ...styles.advantageCard, padding: 20 }
                  : styles.advantageCard
              }
            >
              <h3
                style={
                  isMobile
                    ? { ...styles.advantageCardTitle, fontSize: 18 }
                    : styles.advantageCardTitle
                }
              >
                {adv.title}
              </h3>
              <p
                style={
                  isMobile
                    ? { ...styles.advantageCardDesc, fontSize: 14 }
                    : styles.advantageCardDesc
                }
              >
                {adv.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StepsSection = () => {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { title: "Descarga la App", showDownloadButtons: true, image: null },
    { title: "Crea tu Cuenta", image: phoneImg },
    { title: "Agrega Propiedades", image: portfolioImg },
    { title: "Publica en Redes Sociales", image: rrssImg },
    { title: "Gana Comisiones", image: hombreFelizImg },
  ];

  const sectionStyle: React.CSSProperties = {
    ...styles.stepsSection,
    background: "radial-gradient(circle at 50% 50%, #044BB8, #000)",
    position: "relative",
    ...(isMobile ? { padding: "48px 0", minHeight: "auto" } : {}),
  };

  return (
    <section id="pasos-aliado" style={sectionStyle}>
      <div style={styles.stepsBackgroundOverlay}>
        <img
          src={horizontalLinesImg}
          alt=""
          style={styles.stepsBackgroundImage}
        />
      </div>
      <div
        style={{
          ...styles.stepsContainer,
          padding: isMobile ? "0 16px" : "0 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h2
          style={{
            ...styles.stepsTitle,
            fontSize: isMobile ? 24 : 48,
            marginBottom: isMobile ? 32 : 48,
            color: "#fff",
          }}
        >
          Pasos para ser un <span style={{ color: "#bf0a0a" }}>Aliado</span>
        </h2>
        <div style={styles.stepsCarousel}>
          {steps.map((step, index) => (
            <div
              key={index}
              style={{
                ...styles.stepCard,
                display: index === currentStep ? "flex" : "none",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? 24 : 48,
              }}
            >
              {step.image ? (
                <div
                  style={{
                    ...styles.stepImageContainer,
                    order: isMobile ? 1 : 0,
                  }}
                >
                  <img
                    src={step.image}
                    alt={step.title}
                    style={styles.stepImage}
                  />
                </div>
              ) : null}
              <div
                style={{
                  ...styles.stepContentContainer,
                  order: isMobile ? 0 : 1,
                  textAlign: isMobile
                    ? "center"
                    : step.image
                      ? "left"
                      : "center",
                  maxWidth: step.image ? 400 : 600,
                }}
              >
                <div
                  style={{
                    ...styles.stepNumber,
                    margin:
                      isMobile || !step.image ? "0 auto 16px" : "0 0 16px",
                  }}
                >
                  {index + 1}
                </div>
                <h3
                  style={{
                    ...styles.stepCardTitle,
                    color: "#fff",
                    marginBottom: step.showDownloadButtons ? 24 : 0,
                  }}
                >
                  {step.title}
                </h3>
                {step.showDownloadButtons && (
                  <div
                    style={{
                      ...styles.downloadButtons,
                      justifyContent: isMobile ? "center" : "flex-start",
                    }}
                  >
                    <a
                      href="https://apps.apple.com/gt/app/la-red-inmobiliaria/id6748619383"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                        alt="App Store"
                        style={styles.storeButton}
                      />
                    </a>
                    <a
                      href="https://play.google.com/store/apps/details?id=com.lared.inmobiliaria"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Google Play"
                        style={styles.storeButton}
                      />
                    </a>
                  </div>
                )}
              </div>
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
                backgroundColor:
                  index === currentStep ? "#bf0a0a" : "rgba(255,255,255,0.4)",
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
            onClick={() =>
              setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
            }
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

interface TopAlly {
  id: string;
  name: string;
  company: string;
  properties: number;
  sales: number;
  clients: number;
  photoUrl?: string;
}

const TopAlliesSection = () => {
  const isMobile = useIsMobile();
  const [allies, setAllies] = useState<TopAlly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopAllies = async () => {
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}/properties/getTopUsersWithProperties`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const mappedAllies: TopAlly[] = (data || []).slice(0, 6).map((user: any, index: number) => {
            const validProperties = (user.properties || []).filter((p: any) => p !== null);
            const firstPropertyImage = validProperties.length > 0 && validProperties[0].imagenes?.length > 0
              ? validProperties[0].imagenes.find((img: any) => img.tipo === 'Imagen')?.url
              : null;
            
            return {
              id: user.userId || user.id || `ally-${index}`,
              name: user.userName || user.name || 'Aliado',
              company: user.company || user.empresa || 'La Red Inmobiliaria',
              properties: user.totalProperties || validProperties.length || 0,
              sales: user.sales || user.ventas || 0,
              clients: user.clients || user.clientes || 0,
              photoUrl: user.photoUrl || user.photo || firstPropertyImage || null,
            };
          });
          setAllies(mappedAllies);
        }
      } catch (error) {
        console.error('Error fetching top allies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopAllies();
  }, []);

  if (loading) {
    return (
      <section style={isMobile ? { ...styles.alliesSection, padding: "48px 0" } : styles.alliesSection}>
        <div style={isMobile ? { ...styles.alliesContainer, padding: "0 16px" } : styles.alliesContainer}>
          <h2 style={isMobile ? { ...styles.alliesTitle, fontSize: 24 } : styles.alliesTitle}>Top Aliados</h2>
          <p style={{ textAlign: 'center', color: '#666' }}>Cargando...</p>
        </div>
      </section>
    );
  }

  if (allies.length === 0) {
    return null;
  }

  return (
    <section
      style={
        isMobile
          ? { ...styles.alliesSection, padding: "48px 0" }
          : styles.alliesSection
      }
    >
      <div
        style={
          isMobile
            ? { ...styles.alliesContainer, padding: "0 16px" }
            : styles.alliesContainer
        }
      >
        <h2
          style={
            isMobile
              ? { ...styles.alliesTitle, fontSize: 24 }
              : styles.alliesTitle
          }
        >
          Top Aliados
        </h2>
        <p
          style={
            isMobile
              ? { ...styles.alliesSubtitle, fontSize: 14, marginBottom: 32 }
              : styles.alliesSubtitle
          }
        >
          Conoce a los aliados mas destacados de nuestra plataforma
        </p>
        <div
          style={
            isMobile
              ? { ...styles.alliesGrid, gridTemplateColumns: "1fr", gap: 16 }
              : styles.alliesGrid
          }
        >
          {allies.map((ally) => (
            <div key={ally.id} style={styles.allyCard}>
              <div style={styles.allyHeader}>
                {ally.photoUrl ? (
                  <img 
                    src={ally.photoUrl} 
                    alt={ally.name}
                    style={{
                      ...styles.allyAvatar,
                      objectFit: 'cover' as const,
                    }}
                  />
                ) : (
                  <div style={styles.allyAvatar}>
                    <span style={styles.allyAvatarText}>{ally.name[0]}</span>
                  </div>
                )}
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
  const isMobile = useIsMobile();
  const properties = [
    {
      id: 1,
      title: "Casa Moderna en Zona 14",
      location: "Guatemala City",
      price: "$450,000",
      beds: 4,
      baths: 3,
      area: 350,
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    },
    {
      id: 2,
      title: "Apartamento de Lujo",
      location: "Zona 10",
      price: "$280,000",
      beds: 3,
      baths: 2,
      area: 180,
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    },
    {
      id: 3,
      title: "Villa con Vista al Lago",
      location: "Atitlan",
      price: "$650,000",
      beds: 5,
      baths: 4,
      area: 500,
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
    },
  ];

  return (
    <section
      id="propiedades"
      style={
        isMobile
          ? { ...styles.propertiesSection, padding: "48px 0" }
          : styles.propertiesSection
      }
    >
      <div
        style={
          isMobile
            ? { ...styles.propertiesContainer, padding: "0 16px" }
            : styles.propertiesContainer
        }
      >
        <h2
          style={
            isMobile
              ? { ...styles.propertiesTitle, fontSize: 24 }
              : styles.propertiesTitle
          }
        >
          Propiedades Destacadas
        </h2>
        <p
          style={
            isMobile
              ? { ...styles.propertiesSubtitle, fontSize: 14, marginBottom: 32 }
              : styles.propertiesSubtitle
          }
        >
          Descubre las mejores oportunidades inmobiliarias en Guatemala
        </p>
        <div
          style={
            isMobile
              ? {
                  ...styles.propertiesGrid,
                  gridTemplateColumns: "1fr",
                  gap: 16,
                }
              : styles.propertiesGrid
          }
        >
          {properties.map((property) => (
            <div key={property.id} style={styles.propertyCard}>
              <img
                src={property.image}
                alt={property.title}
                style={styles.propertyImage}
              />
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
  const isMobile = useIsMobile();
  const testimonials = [
    {
      id: 1,
      name: "Juan Perez",
      text: "La mejor plataforma para aliados. He triplicado mis ventas en 6 meses.",
      rating: 5,
    },
    {
      id: 2,
      name: "Laura Martinez",
      text: "Conexiones que transforman negocios. Recomendado 100%.",
      rating: 5,
    },
    {
      id: 3,
      name: "Roberto Sanchez",
      text: "Crecimiento garantizado con herramientas profesionales.",
      rating: 5,
    },
  ];

  return (
    <section
      style={
        isMobile
          ? { ...styles.testimonialsSection, padding: "48px 0" }
          : styles.testimonialsSection
      }
    >
      <div
        style={
          isMobile
            ? { ...styles.testimonialsContainer, padding: "0 16px" }
            : styles.testimonialsContainer
        }
      >
        <h2
          style={
            isMobile
              ? { ...styles.testimonialsTitle, fontSize: 24 }
              : styles.testimonialsTitle
          }
        >
          Calificados por nuestros aliados
        </h2>
        <div style={styles.playStoreRating}>
          <span style={styles.starsContainer}>{"*".repeat(5)}</span>
        </div>
        <div
          style={
            isMobile
              ? {
                  ...styles.testimonialsGrid,
                  gridTemplateColumns: "1fr",
                  gap: 16,
                }
              : styles.testimonialsGrid
          }
        >
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
  const isMobile = useIsMobile();
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
      alert(
        "Gracias por tu interes! Nos pondremos en contacto contigo pronto.",
      );
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
      });
    }, 1500);
  };

  return (
    <section
      id="formulario"
      style={
        isMobile
          ? { ...styles.contactSection, padding: "48px 0" }
          : styles.contactSection
      }
    >
      <div
        style={
          isMobile
            ? { ...styles.contactContainer, padding: "0 16px" }
            : styles.contactContainer
        }
      >
        <h2
          style={
            isMobile
              ? { ...styles.contactTitle, fontSize: 24 }
              : styles.contactTitle
          }
        >
          Unete a La Red Inmobiliaria
        </h2>
        <div
          style={
            isMobile
              ? { ...styles.contactForm, padding: 24 }
              : styles.contactForm
          }
        >
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Nombre completo</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                style={styles.formInput}
                placeholder="Confirma tu contrasena"
                required
              />
            </div>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  setFormData({ ...formData, acceptTerms: e.target.checked })
                }
                required
              />
              <span style={styles.checkboxLabel}>
                Acepto los Terminos y Condiciones y Politica de Privacidad
              </span>
            </div>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Completa tus datos"}
            </button>
            <p style={styles.loginLink}>
              Ya tienes una cuenta?{" "}
              <span
                onClick={() => navigation.navigate("Login")}
                style={styles.loginLinkText}
              >
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
  const isMobile = useIsMobile();
  return (
    <footer
      style={
        isMobile ? { ...styles.footer, padding: "48px 0 24px" } : styles.footer
      }
    >
      <div
        style={
          isMobile
            ? { ...styles.footerContainer, padding: "0 16px" }
            : styles.footerContainer
        }
      >
        <div
          style={
            isMobile
              ? {
                  ...styles.footerGrid,
                  gridTemplateColumns: "1fr",
                  gap: 32,
                  textAlign: "center",
                }
              : styles.footerGrid
          }
        >
          <div style={styles.footerColumn}>
            <img src={logoSvg} alt="La Red" style={styles.footerLogo} />
            <p
              style={
                isMobile
                  ? { ...styles.footerDescription, fontSize: 14 }
                  : styles.footerDescription
              }
            >
              La plataforma lider en Guatemala para aliados inmobiliarios.
            </p>
          </div>
          <div style={styles.footerColumn}>
            <h3
              style={
                isMobile
                  ? { ...styles.footerTitle, fontSize: 16 }
                  : styles.footerTitle
              }
            >
              Enlaces Rapidos
            </h3>
            <ul style={styles.footerLinks}>
              <li>
                <a href="#" style={styles.footerLink}>
                  Inicio
                </a>
              </li>
              <li>
                <a href="#propiedades" style={styles.footerLink}>
                  Propiedades
                </a>
              </li>
              <li>
                <a href="#formulario" style={styles.footerLink}>
                  Unete Ahora
                </a>
              </li>
            </ul>
          </div>
          <div style={styles.footerColumn}>
            <h3
              style={
                isMobile
                  ? { ...styles.footerTitle, fontSize: 16 }
                  : styles.footerTitle
              }
            >
              Contactanos
            </h3>
            <p style={styles.footerContact}>info@lared.gt</p>
            <p style={styles.footerContact}>+502 5413-9214</p>
            <p style={styles.footerContact}>Ciudad de Guatemala</p>
          </div>
          <div style={styles.footerColumn}>
            <h3
              style={
                isMobile
                  ? { ...styles.footerTitle, fontSize: 16 }
                  : styles.footerTitle
              }
            >
              Siguenos
            </h3>
            <div
              style={
                isMobile
                  ? { ...styles.socialLinks, justifyContent: "center" }
                  : styles.socialLinks
              }
            >
              <a
                href="https://www.facebook.com/laredinmogt"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialLink}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/laredinmogt/"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialLink}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p
            style={
              isMobile
                ? { ...styles.copyright, fontSize: 12 }
                : styles.copyright
            }
          >
            © 2025 La Red Inmobiliaria. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

const WhatsAppButton = () => {
  const handleClick = () => {
    const phoneNumber = "50254139214";
    const message = encodeURIComponent(
      "Hola, me gustaria obtener mas informacion sobre La Red.",
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <button onClick={handleClick} style={styles.whatsappButton}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </button>
  );
};

export default function LandingScreen() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollContext.Provider value={scrollRef}>
      <div ref={scrollRef} style={styles.scrollWrapper}>
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
      </div>
    </ScrollContext.Provider>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  scrollWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: "auto",
    overflowX: "hidden",
  },
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
  navbarMobile: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  navbarInner: {
    backgroundColor: "#fff",
    borderRadius: 50,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    border: "1px solid rgba(0,0,0,0.05)",
  },
  navbarInnerMobile: {
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  navbarContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    height: 70,
  },
  navbarContentMobile: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    height: 60,
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
  hamburgerButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  hamburgerLine: {
    width: 24,
    height: 3,
    backgroundColor: "#333",
    borderRadius: 2,
    transition: "all 0.3s ease",
  },
  floatingNavContainer: {
    position: "fixed",
    top: 16,
    left: 16,
    right: 16,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 1000,
    pointerEvents: "none",
  },
  floatingUserButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "auto",
  },
  floatingMenuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    pointerEvents: "auto",
  },
  mobileMenuOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1001,
    display: "flex",
    justifyContent: "flex-end",
  },
  mobileMenuFloating: {
    width: "80%",
    maxWidth: 320,
    height: "100%",
    backgroundColor: "#fff",
    boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
    padding: "16px 0",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  mobileMenuHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 24px 24px 24px",
    borderBottom: "1px solid #eee",
    marginBottom: 8,
  },
  mobileMenuCloseButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 8,
  },
  mobileMenu: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    padding: "16px 0",
    display: "flex",
    flexDirection: "column",
  },
  mobileMenuItem: {
    background: "none",
    border: "none",
    padding: "14px 24px",
    fontSize: 16,
    fontWeight: 600,
    color: "#333",
    textAlign: "left",
    cursor: "pointer",
  },
  mobileMenuDivider: {
    height: 1,
    backgroundColor: "#eee",
    margin: "8px 24px",
  },
  mobileMenuPromoButton: {
    margin: "8px 24px",
    padding: "14px 24px",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(to right, #bf0a0a, #d91010)",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    textAlign: "center",
  },
  heroSection: {
    position: "relative",
    height: "85vh",
    minHeight: 500,
    maxHeight: 800,
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
  heroContent: {
    position: "absolute",
    bottom: 100,
    left: 48,
    zIndex: 10,
  },
  heroButtonsContainer: {
    display: "flex",
    gap: 16,
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
    overflow: "hidden",
  },
  stepsBackgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    opacity: 0.3,
  },
  stepsBackgroundImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
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
  stepImageContainer: {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepImage: {
    maxWidth: 280,
    maxHeight: 320,
    width: "100%",
    height: "auto",
    objectFit: "contain",
  },
  stepContentContainer: {
    flex: "0 1 auto",
    display: "flex",
    flexDirection: "column",
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
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.6,
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
