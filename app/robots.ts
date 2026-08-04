import type { MetadataRoute } from "next";

const siteUrl = "https://www.vanmotion.es";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/login-admin",
      ],
    },

    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
