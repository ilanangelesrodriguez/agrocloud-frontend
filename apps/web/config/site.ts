export const siteConfig = {
  name: "AgroCloud AI",
  shortName: "AgroCloud",
  description:
    "Gestión de calidad agrícola: lotes, recepción, muestreo, inspecciones, evidencias y dictámenes con apoyo de IA.",
  nav: [
    { label: "Inicio", href: "/" },
    { label: "Funcionalidades", href: "/funcionalidades" },
    { label: "Cómo funciona", href: "/como-funciona" },
    { label: "Planes", href: "/planes" },
    { label: "Contacto", href: "/contacto" },
  ],
  // Configurar antes de desplegar. No utilizar localhost como enlace de producción.
  portalLoginUrl: process.env.NEXT_PUBLIC_PORTAL_LOGIN_URL || null,
  publicUrl: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || null,
} as const;

export const portalLoginUrl = siteConfig.portalLoginUrl;
