import type { MetadataRoute } from "next";

import { prisma } from "@/app/lib/prisma";

const siteUrl = "https://www.vanmotion.es";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const staticPages: MetadataRoute.Sitemap = [
  {
    url: siteUrl,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${siteUrl}/coleccion`,
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/ropa`,
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/musica`,
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${siteUrl}/reconocimientos`,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${siteUrl}/contacto`,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${siteUrl}/condiciones-compra`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${siteUrl}/desistimiento`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${siteUrl}/privacidad`,
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    url: `${siteUrl}/aviso-legal`,
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    url: `${siteUrl}/cookies`,
    changeFrequency: "yearly",
    priority: 0.2,
  },
];

async function getVehiclePages(): Promise<MetadataRoute.Sitemap> {
  try {
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return vehicles.map((vehicle) => ({
      url: `${siteUrl}/coleccion/${encodeURIComponent(vehicle.id)}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("VANMOTION_SITEMAP_VEHICLES_ERROR", error);
    return [];
  }
}

async function getProductPages(): Promise<MetadataRoute.Sitemap> {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        status: {
          notIn: ["DRAFT", "HIDDEN"],
        },
        category: "CLOTHING",
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return products.map((product) => ({
      url: `${siteUrl}/ropa/${encodeURIComponent(product.slug)}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("VANMOTION_SITEMAP_PRODUCTS_ERROR", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vehiclePages, productPages] = await Promise.all([
    getVehiclePages(),
    getProductPages(),
  ]);

  return [...staticPages, ...vehiclePages, ...productPages];
}
