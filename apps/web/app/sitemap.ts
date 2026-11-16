import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteConfig.publicUrl) return [];
  const pages = [
    "",
    "/funcionalidades",
    "/como-funciona",
    "/planes",
    "/solicitar-acceso",
    "/nosotros",
    "/contacto",
    "/privacidad",
    "/terminos",
  ];

  return pages.map((path) => ({
    url: `${siteConfig.publicUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
