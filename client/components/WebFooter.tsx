import React from "react";
import { useWindowDimensions } from "react-native";

const logoSvg = require("../../assets/images-lared/logo.svg");

const useIsMobile = () => {
  const { width } = useWindowDimensions();
  return width < 768;
};

export function WebFooter() {
  const isMobile = useIsMobile();
  
  return (
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
            <h3 style={isMobile ? {...styles.footerTitle, fontSize: 16} : styles.footerTitle}>Contactanos</h3>
            <p style={styles.footerContact}>info@lared.gt</p>
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
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    padding: "64px 0 32px",
  },
  footerContainer: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
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
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8,
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
  },
  footerContact: {
    color: "#9ca3af",
    margin: "4px 0",
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
  },
};
