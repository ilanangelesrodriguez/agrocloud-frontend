import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.publicUrl) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/solicitud-recibida"] },
    sitemap: `${siteConfig.publicUrl}/sitemap.xml`,
  };
}
