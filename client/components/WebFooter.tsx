import React, { useState } from "react";
import { useWindowDimensions, Image } from "react-native";

// Helper para resolver URI de assets (compatible con HTML img tags)
const resolveAsset = (asset: any): string => {
  const resolved = Image.resolveAssetSource(asset);
  return resolved?.uri || "";
};

const logoSvg = resolveAsset(require("../../assets/images-lared/logo.svg"));

const useIsMobile = () => {
  const { width } = useWindowDimensions();
  return width < 768;
};

const privacyContent = {
  en: {
    title: "Privacy Policy",
    sections: [
      {
        title: "1. Introduction",
        content: "At La Red Inmobiliaria, we respect and protect the privacy of our users. This policy describes how we collect, use, and protect personal and non-personal information from individuals who interact with our services, in accordance with international best practices and aligned with current Guatemalan legislation, including Decree 57-2008 \"Law on Access to Public Information\", which guides our commitment to transparency and responsible data management."
      },
      {
        title: "2. Information We Collect",
        content: "Personal Information: name, email address, phone number, address, and other details voluntarily provided by the user when registering, subscribing to newsletters, submitting forms, or interacting with our services.\n\nNon-Personal Information: technical data such as IP address, browser type, operating system, visited pages, and usage statistics automatically collected to improve our services."
      },
      {
        title: "3. How We Use Information",
        content: "• Provide and customize our services.\n• Improve user experience.\n• Communicate updates, promotions, or relevant information.\n• Comply with legal or regulatory requirements when necessary.\n• Ensure the security and integrity of our platforms."
      },
      {
        title: "4. Legal Basis for Processing",
        content: "The processing of personal data is carried out based on:\n• The voluntary consent of the user.\n• The need to fulfill contractual obligations.\n• Legitimate interests in improving services and preventing fraud.\n• Guidelines inspired by Decree 57-2008 of Guatemala."
      },
      {
        title: "5. Information Protection",
        content: "We implement technical, administrative, and physical security measures to protect information from loss, theft, unauthorized access, disclosure, copying, use, or modification."
      },
      {
        title: "6. Sharing Information",
        content: "We do not sell or rent personal information to third parties. We may share it only:\n• With service providers that help us operate our systems.\n• When required by law or competent authority.\n• To protect our rights, privacy, safety, or property."
      },
      {
        title: "7. User Rights",
        content: "Users may, at any time:\n• Access their personal data.\n• Correct inaccurate information.\n• Request the deletion of their data.\n• Object to processing for specific purposes.\n\nTo exercise these rights, please contact us at: hola@laredgt.com"
      },
      {
        title: "8. Data Retention",
        content: "Personal information will be kept only as long as necessary to fulfill the purposes for which it was collected or to comply with legal obligations."
      },
      {
        title: "9. Policy for Minors",
        content: "Our services are not directed at individuals under 18 years of age. If we become aware that a minor has provided personal data, we will proceed to delete it."
      },
      {
        title: "10. Changes to This Policy",
        content: "We may update this policy at any time. Changes will be posted on this page with a new update date."
      },
      {
        title: "11. Contact",
        content: "For any questions about this policy, you can write to us at: hola@laredgt.com"
      }
    ]
  },
  es: {
    title: "Politica de Privacidad",
    sections: [
      {
        title: "1. Introduccion",
        content: "En La Red Inmobiliaria, respetamos y protegemos la privacidad de nuestros usuarios. Esta politica describe como recopilamos, utilizamos y protegemos la informacion personal y no personal de quienes interactuan con nuestros servicios, en cumplimiento de las mejores practicas internacionales y de forma alineada con la legislacion vigente en Guatemala, incluyendo el Decreto 57-2008 \"Ley de Acceso a la Informacion Publica\"."
      },
      {
        title: "2. Informacion que recopilamos",
        content: "Informacion personal: nombre, direccion de correo electronico, numero de telefono, direccion, y otros datos que el usuario proporciona voluntariamente al registrarse, suscribirse a boletines, enviar formularios o interactuar con nuestros servicios.\n\nInformacion no personal: datos tecnicos como direccion IP, tipo de navegador, sistema operativo, paginas visitadas, y estadisticas de uso recopiladas de forma automatica para mejorar nuestros servicios."
      },
      {
        title: "3. Uso de la informacion",
        content: "• Proporcionar y personalizar nuestros servicios.\n• Mejorar la experiencia del usuario.\n• Comunicarnos sobre actualizaciones, promociones o informacion relevante.\n• Cumplir con requisitos legales o regulatorios cuando sea necesario.\n• Garantizar la seguridad e integridad de nuestras plataformas."
      },
      {
        title: "4. Base legal para el tratamiento",
        content: "El tratamiento de datos personales se realiza con base en:\n• El consentimiento voluntario del usuario.\n• La necesidad de cumplir con obligaciones contractuales.\n• Intereses legitimos de mejora de servicios y prevencion de fraudes.\n• Lineamientos inspirados en el Decreto 57-2008 de Guatemala."
      },
      {
        title: "5. Proteccion de la informacion",
        content: "Implementamos medidas de seguridad tecnicas, administrativas y fisicas para proteger la informacion contra perdida, robo, acceso no autorizado, divulgacion, copia, uso o modificacion."
      },
      {
        title: "6. Comparticion de la informacion",
        content: "No vendemos ni alquilamos informacion personal a terceros. Podremos compartirla unicamente:\n• Con proveedores de servicios que nos ayudan a operar nuestros sistemas.\n• Cuando sea requerido por ley o autoridad competente.\n• Para proteger nuestros derechos, privacidad, seguridad o propiedad."
      },
      {
        title: "7. Derechos del usuario",
        content: "El usuario puede, en cualquier momento:\n• Acceder a sus datos personales.\n• Rectificar informacion inexacta.\n• Solicitar la eliminacion de sus datos.\n• Oponerse al tratamiento para fines especificos.\n\nPara ejercer estos derechos, puede contactarnos en: hola@laredgt.com"
      },
      {
        title: "8. Conservacion de datos",
        content: "La informacion personal se conservara unicamente durante el tiempo necesario para cumplir con los fines para los que fue recopilada o para cumplir obligaciones legales."
      },
      {
        title: "9. Politica para menores de edad",
        content: "Nuestros servicios no estan dirigidos a menores de 18 anos. Si tenemos conocimiento de que un menor ha proporcionado datos personales, procederemos a eliminarlos."
      },
      {
        title: "10. Cambios en esta politica",
        content: "Podemos actualizar esta politica en cualquier momento. Las modificaciones se publicaran en esta pagina con una nueva fecha de actualizacion."
      },
      {
        title: "11. Contacto",
        content: "Para cualquier pregunta sobre esta politica, puede escribirnos a: hola@laredgt.com"
      }
    ]
  }
};

const termsContent = {
  en: {
    title: "Terms of Use",
    sections: [
      {
        title: "Welcome",
        content: "Welcome to La Red Inmobiliaria (\"the App\"), owned and operated by La Red Inmobiliaria Guatemala. By using the App, you agree to these Terms of Use. If you do not agree, please do not use the App."
      },
      {
        title: "1. Use of the App",
        content: "• The App provides a platform where users can promote real estate properties and generate leads for potential buyers.\n• Users may be eligible for fees for successful lead generation. These fees are handled separately, outside the App.\n• No payments or financial transactions are conducted within the App."
      },
      {
        title: "2. Eligibility",
        content: "You must be at least 18 years old to use the App."
      },
      {
        title: "3. User Responsibilities",
        content: "You agree to:\n• Provide accurate and truthful property information.\n• Not use the App for illegal or unauthorized purposes.\n• Not attempt to harm the App's functionality or other users' experience."
      },
      {
        title: "4. Intellectual Property",
        content: "All content in the App (branding, design, logos, text) is owned by La Red Inmobiliaria or its licensors and is protected under applicable copyright and trademark laws. You may not reproduce, distribute, or create derivative works from the content without express permission."
      },
      {
        title: "5. Limitation of Liability",
        content: "The App is provided \"as is\" without warranties of any kind. We do not guarantee the accuracy, completeness, or availability of the platform at all times. We are not liable for any damages arising from your use of the App or dealings outside the App, including payment of fees."
      },
      {
        title: "6. Termination",
        content: "We reserve the right to terminate or suspend your access to the App if you violate these Terms of Use."
      },
      {
        title: "7. Account and Security",
        content: "Users are responsible for maintaining the confidentiality of their login credentials. You agree not to share your account or password with others. Any activity performed through your account will be considered your responsibility. La Red Inmobiliaria will not be liable for unauthorized access resulting from the user's negligence."
      },
      {
        title: "8. Governing Law",
        content: "These Terms are governed by and construed in accordance with the laws of Guatemala. Any disputes arising under or related to these Terms shall be subject to the exclusive jurisdiction of the courts of Guatemala."
      },
      {
        title: "9. Third-Party Services",
        content: "The App may include integrations or links to third-party services (e.g., WhatsApp, Facebook, Instagram, Google Maps). We are not responsible for the content, availability, or privacy practices of those external services. Your use of third-party platforms is subject to their own terms and conditions."
      },
      {
        title: "10. Service Modifications",
        content: "We may modify, suspend, or discontinue any feature of the App at any time, with or without notice. We are not liable for any loss or inconvenience caused by service interruptions, updates, or maintenance activities."
      },
      {
        title: "11. Anti-Money Laundering",
        content: "The user acknowledges that the promotion of real estate in Guatemala is subject to the regulations of the Intendencia de Verificacion Especial (IVE) of the Superintendencia de Bancos de Guatemala. This includes compliance with Law Against Money Laundering and Other Assets (Decree 67-2001) and related regulations."
      },
      {
        title: "12. Use of Images and Videos",
        content: "The images, videos, and promotional materials available in the App are owned by La Red Inmobiliaria and are protected by applicable copyright and trademark laws. Authorized users are granted a limited, non-exclusive right to share such content on their personal or professional social media accounts solely for the purpose of promoting the properties and services offered through the App."
      },
      {
        title: "13. TikTok API Integration",
        content: "The App integrates with the TikTok API to allow users to share or upload videos directly from La Red Inmobiliaria to their TikTok accounts. By using this feature, you agree to comply with TikTok's Terms of Service and Community Guidelines."
      },
      {
        title: "14. Commissions and Fiscal Compliance",
        content: "La Red Inmobiliaria will process commission payments in a timely manner, provided that the related property has completed all applicable legal stages and validations. As an Ally, you are responsible for registering within the corresponding taxpayer registry (SAT) and issuing valid tax invoices."
      },
      {
        title: "15. Privacy Policy Reference",
        content: "Your use of the App is also subject to our Privacy Policy, which explains how we collect, use, and protect your personal information."
      },
      {
        title: "16. Changes to Terms",
        content: "We may update these Terms of Use at any time. Continued use of the App after changes are made constitutes acceptance of the new Terms."
      },
      {
        title: "17. Contact Us",
        content: "If you have any questions about these Terms of Use, you can contact us at: hola@laredgt.com"
      }
    ]
  },
  es: {
    title: "Terminos de Uso",
    sections: [
      {
        title: "Bienvenida",
        content: "Bienvenido a La Red Inmobiliaria (\"la App\"), propiedad y operada por La Red Inmobiliaria Guatemala. Al utilizar la App, aceptas estos Terminos de Uso. Si no estas de acuerdo, por favor no utilices la App."
      },
      {
        title: "1. Uso de la App",
        content: "• La App proporciona una plataforma donde los usuarios pueden promocionar propiedades inmobiliarias y generar prospectos de posibles compradores.\n• Los usuarios pueden ser elegibles para recibir comisiones por generacion exitosa de prospectos. Estas comisiones se gestionan por separado, fuera de la App.\n• No se realizan pagos ni transacciones financieras dentro de la App."
      },
      {
        title: "2. Elegibilidad",
        content: "Debes tener al menos 18 anos de edad para utilizar la App."
      },
      {
        title: "3. Responsabilidades del Usuario",
        content: "Te comprometes a:\n• Proporcionar informacion precisa y veraz sobre las propiedades.\n• No utilizar la App para fines ilegales o no autorizados.\n• No intentar danar la funcionalidad de la App ni la experiencia de otros usuarios."
      },
      {
        title: "4. Propiedad Intelectual",
        content: "Todo el contenido de la App (marca, diseno, logotipos, texto) es propiedad de La Red Inmobiliaria o de sus licenciantes, y esta protegido por las leyes aplicables de derechos de autor y marcas registradas. No puedes reproducir, distribuir ni crear obras derivadas del contenido sin permiso expreso."
      },
      {
        title: "5. Limitacion de Responsabilidad",
        content: "La App se proporciona \"tal cual\" sin garantias de ningun tipo. No garantizamos la precision, integridad o disponibilidad de la plataforma en todo momento. No somos responsables por ningun dano que surja del uso de la App o de transacciones realizadas fuera de ella, incluyendo el pago de comisiones."
      },
      {
        title: "6. Terminacion",
        content: "Nos reservamos el derecho de terminar o suspender tu acceso a la App si violas estos Terminos de Uso."
      },
      {
        title: "7. Cuenta y Seguridad",
        content: "Los usuarios son responsables de mantener la confidencialidad de sus credenciales de acceso. Te comprometes a no compartir tu cuenta ni tu contrasena con otras personas. Toda actividad realizada desde tu cuenta sera considerada bajo tu responsabilidad. La Red Inmobiliaria no sera responsable por accesos no autorizados derivados de negligencia del usuario."
      },
      {
        title: "8. Legislacion Aplicable",
        content: "Estos Terminos se rigen e interpretan de acuerdo con las leyes de Guatemala. Cualquier disputa relacionada con estos Terminos estara sujeta a la jurisdiccion exclusiva de los tribunales de Guatemala."
      },
      {
        title: "9. Servicios de Terceros",
        content: "La App puede incluir integraciones o enlaces a servicios de terceros (p. ej., WhatsApp, Facebook, Instagram, Google Maps). No somos responsables del contenido, disponibilidad o politicas de privacidad de dichos servicios externos. El uso de plataformas de terceros esta sujeto a sus propios terminos y condiciones."
      },
      {
        title: "10. Modificaciones del Servicio",
        content: "Podemos modificar, suspender o descontinuar cualquier funcionalidad de la App en cualquier momento, con o sin previo aviso. No somos responsables por perdidas o inconvenientes derivados de interrupciones del servicio, actualizaciones o tareas de mantenimiento."
      },
      {
        title: "11. Prevencion de Lavado de Dinero",
        content: "El usuario reconoce que la promocion de inmuebles en Guatemala esta sujeta a las regulaciones de la Intendencia de Verificacion Especial (IVE) de la Superintendencia de Bancos de Guatemala. Esto incluye el cumplimiento de la Ley Contra el Lavado de Dinero u Otros Activos (Decreto 67-2001) y regulaciones relacionadas."
      },
      {
        title: "12. Uso de Imagenes y Videos",
        content: "Las imagenes, videos y materiales promocionales disponibles en la App son propiedad de La Red Inmobiliaria y estan protegidos por las leyes aplicables de derechos de autor y marcas registradas. Los usuarios autorizados cuentan con un derecho limitado y no exclusivo de compartir dicho contenido en sus redes sociales personales o profesionales unicamente con el proposito de promover los inmuebles y servicios ofrecidos a traves de la App."
      },
      {
        title: "13. Integracion con TikTok",
        content: "La App integra la API de TikTok para permitir a los usuarios compartir o subir videos directamente desde La Red Inmobiliaria hacia sus cuentas personales de TikTok. Al utilizar esta funcion, aceptas cumplir con los Terminos de Servicio y Normas de la Comunidad de TikTok."
      },
      {
        title: "14. Comisiones y Cumplimiento Fiscal",
        content: "La Red Inmobiliaria procesara los pagos de comisiones de manera oportuna, siempre que la propiedad relacionada haya completado todas las etapas legales y validaciones aplicables. Como Aliado, eres responsable de registrarte en el registro de contribuyentes (SAT) y emitir facturas fiscales validas."
      },
      {
        title: "15. Referencia a Politica de Privacidad",
        content: "El uso de la App tambien esta sujeto a nuestra Politica de Privacidad, que explica como recopilamos, utilizamos y protegemos tu informacion personal."
      },
      {
        title: "16. Cambios en los Terminos",
        content: "Podemos actualizar estos Terminos de Uso en cualquier momento. El uso continuo de la App despues de dichos cambios constituye la aceptacion de los nuevos Terminos."
      },
      {
        title: "17. Contactanos",
        content: "Si tienes alguna pregunta sobre estos Terminos de Uso, puedes contactarnos en: hola@laredgt.com"
      }
    ]
  }
};

type PopupType = 'privacy' | 'terms' | null;

const LegalPopup = ({ 
  type, 
  onClose, 
  language, 
  onLanguageChange 
}: { 
  type: PopupType; 
  onClose: () => void; 
  language: 'es' | 'en';
  onLanguageChange: (lang: 'es' | 'en') => void;
}) => {
  if (!type) return null;
  
  const content = type === 'privacy' ? privacyContent[language] : termsContent[language];
  
  return (
    <div style={popupStyles.overlay} onClick={onClose}>
      <div style={popupStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={popupStyles.header}>
          <h2 style={popupStyles.title}>{content.title}</h2>
          <div style={popupStyles.headerRight}>
            <div style={popupStyles.languageSwitch}>
              <button 
                style={{
                  ...popupStyles.langButton,
                  ...(language === 'es' ? popupStyles.langButtonActive : {})
                }}
                onClick={() => onLanguageChange('es')}
              >
                ES
              </button>
              <button 
                style={{
                  ...popupStyles.langButton,
                  ...(language === 'en' ? popupStyles.langButtonActive : {})
                }}
                onClick={() => onLanguageChange('en')}
              >
                EN
              </button>
            </div>
            <button style={popupStyles.closeButton} onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div style={popupStyles.content}>
          {content.sections.map((section, index) => (
            <div key={index} style={popupStyles.section}>
              <h3 style={popupStyles.sectionTitle}>{section.title}</h3>
              <p style={popupStyles.sectionContent}>{section.content}</p>
            </div>
          ))}
          <div style={popupStyles.footer}>
            <p style={popupStyles.copyright}>© 2025 La Red Inmobiliaria, Inc.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const popupStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxWidth: 700,
    width: '100%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #eee',
    flexShrink: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a1a2e',
    margin: 0,
    fontFamily: "'Nunito', sans-serif",
  },
  languageSwitch: {
    display: 'flex',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  langButton: {
    padding: '6px 12px',
    border: 'none',
    background: 'transparent',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: '#666',
    transition: 'all 0.2s',
    fontFamily: "'Nunito', sans-serif",
  },
  langButtonActive: {
    backgroundColor: '#044BB8',
    color: '#fff',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  content: {
    padding: 24,
    overflowY: 'auto',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: 8,
    fontFamily: "'Nunito', sans-serif",
  },
  sectionContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 1.7,
    whiteSpace: 'pre-line',
    fontFamily: "'Nunito', sans-serif",
    margin: 0,
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTop: '1px solid #eee',
    textAlign: 'center',
  },
  copyright: {
    fontSize: 13,
    color: '#999',
    fontFamily: "'Nunito', sans-serif",
  },
};

export function WebFooter() {
  const isMobile = useIsMobile();
  const [popupType, setPopupType] = useState<PopupType>(null);
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  
  return (
    <>
      <footer style={isMobile ? {...styles.footer, padding: "48px 0 24px"} : styles.footer}>
        <div style={isMobile ? {...styles.footerContainer, padding: "0 16px"} : styles.footerContainer}>
          <div style={isMobile ? {...styles.footerGrid, gridTemplateColumns: "1fr", gap: 32, textAlign: "center"} as React.CSSProperties : styles.footerGrid}>
            <div style={styles.footerColumn}>
              <img src={logoSvg} alt="La Red" style={styles.footerLogo} />
              <p style={isMobile ? {...styles.footerDescription, fontSize: 14} : styles.footerDescription}>
                La plataforma lider en Guatemala para aliados inmobiliarios.
              </p>
            </div>
            <div style={styles.footerColumn}>
              <h3 style={isMobile ? {...styles.footerTitle, fontSize: 16} : styles.footerTitle}>Enlaces Rapidos</h3>
              <ul style={styles.footerLinks}>
                <li><a href="#" style={styles.footerLink}>Inicio</a></li>
                <li><a href="#propiedades" style={styles.footerLink}>Propiedades</a></li>
                <li><a href="#" style={styles.footerLink}>Nosotros</a></li>
              </ul>
            </div>
            <div style={styles.footerColumn}>
              <h3 style={isMobile ? {...styles.footerTitle, fontSize: 16} : styles.footerTitle}>Legal</h3>
              <ul style={styles.footerLinks}>
                <li>
                  <a 
                    href="#" 
                    style={styles.footerLink}
                    onClick={(e) => { e.preventDefault(); setPopupType('privacy'); }}
                  >
                    Privacidad y condiciones
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    style={styles.footerLink}
                    onClick={(e) => { e.preventDefault(); setPopupType('terms'); }}
                  >
                    Terminos
                  </a>
                </li>
              </ul>
            </div>
            <div style={styles.footerColumn}>
              <h3 style={isMobile ? {...styles.footerTitle, fontSize: 16} : styles.footerTitle}>Contactanos</h3>
              <p style={styles.footerContact}>hola@laredgt.com</p>
              <p style={styles.footerContact}>+502 5413-9214</p>
              <p style={styles.footerContact}>Ciudad de Guatemala</p>
            </div>
            <div style={styles.footerColumn}>
              <h3 style={isMobile ? {...styles.footerTitle, fontSize: 16} : styles.footerTitle}>Siguenos</h3>
              <div style={isMobile ? {...styles.socialLinks, justifyContent: "center"} as React.CSSProperties : styles.socialLinks}>
                <a href="https://www.facebook.com/laredinmogt" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/laredinmogt/" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div style={styles.footerBottom}>
            <p style={isMobile ? {...styles.copyright, fontSize: 12} : styles.copyright}>© 2025 La Red Inmobiliaria. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
      
      <LegalPopup 
        type={popupType} 
        onClose={() => setPopupType(null)} 
        language={language}
        onLanguageChange={setLanguage}
      />
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    background: "linear-gradient(to bottom right, #333, #000, #333)",
    color: "#fff",
    padding: "64px 0 32px",
    width: "100vw",
    marginLeft: "calc(-50vw + 50%)",
    fontFamily: "'Nunito', sans-serif",
  },
  footerContainer: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
    gap: 48,
    marginBottom: 48,
  },
  footerColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  footerLogo: {
    height: 40,
    width: "auto",
    objectFit: "contain",
  },
  footerDescription: {
    color: "#9ca3af",
    lineHeight: 1.6,
    fontFamily: "'Nunito', sans-serif",
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8,
    fontFamily: "'Nunito', sans-serif",
  },
  footerLinks: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  footerLink: {
    color: "#9ca3af",
    textDecoration: "none",
    transition: "color 0.2s",
    fontFamily: "'Nunito', sans-serif",
    cursor: "pointer",
  },
  footerContact: {
    color: "#9ca3af",
    margin: "4px 0",
    fontFamily: "'Nunito', sans-serif",
  },
  socialLinks: {
    display: "flex",
    gap: 16,
  },
  socialLink: {
    color: "#9ca3af",
    transition: "color 0.2s",
  },
  footerBottom: {
    borderTop: "1px solid #374151",
    paddingTop: 24,
    textAlign: "center",
  },
  copyright: {
    color: "#6b7280",
    fontSize: 14,
    fontFamily: "'Nunito', sans-serif",
  },
};
