import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/marketing/site";

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.publicUrl) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/solicitud-recibida",
        "/portal",
        "/login",
        "/activate",
        "/forgot-password",
        "/reset-password",
        "/confirm-email",
        "/dashboard",
        "/admin",
        "/settings",
        "/producers",
        "/lots",
        "/samplings",
        "/inspections",
        "/design-system",
      ],
    },
    sitemap: `${siteConfig.publicUrl}/sitemap.xml`,
  };
}
