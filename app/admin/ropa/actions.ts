"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/app/lib/prisma";

const PRODUCT_SLUG = "carpe-diem-black-edition-drop-01";
const PRODUCT_SIZES = ["S", "M", "L", "XL"] as const;
const ALLOWED_STATUSES = new Set([
  "DRAFT",
  "COMING_SOON",
  "AVAILABLE",
  "SOLD_OUT",
  "HIDDEN",
]);

function parsePrice(value: FormDataEntryValue | null): number {
  const normalized = String(value ?? "")
    .trim()
    .replace(",", ".");

  const price = Number(normalized);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("El precio introducido no es válido.");
  }

  return Math.round(price * 100) / 100;
}

function parseStock(value: FormDataEntryValue | null): number {
  const stock = Number.parseInt(String(value ?? "0"), 10);

  if (!Number.isFinite(stock) || stock < 0) {
    return 0;
  }

  return stock;
}

function refreshClothingPages(): void {
  revalidatePath("/admin/ropa");
  revalidatePath("/ropa");
}

export async function createCarpeDiemProductAction(): Promise<void> {
  await prisma.product.upsert({
    where: {
      slug: PRODUCT_SLUG,
    },
    update: {},
    create: {
      slug: PRODUCT_SLUG,
      name: "CARPE DIEM — Black Edition",
      subtitle: "Drop 01",
      collection: "Drop 01",
      category: "CLOTHING",
      productType: "TSHIRT",
      description:
        "Camiseta negra VANMOTION con diseño CARPE DIEM situado en la zona inferior derecha de la espalda.",
      descriptionEn:
        "Black VANMOTION T-shirt with the CARPE DIEM design positioned on the lower-right area of the back.",
      material: "Algodón",
      color: "Negro",
      price: "34.90",
      currency: "EUR",
      status: "COMING_SOON",
      featured: true,
      active: true,
      sortOrder: 0,
      variants: {
        create: PRODUCT_SIZES.map((size, index) => ({
          size,
          sku: `VM-CD-D01-${size}`,
          stock: 0,
          active: true,
          sortOrder: index,
        })),
      },
      images: {
        create: [
          {
            url: "/ropa/carpe-diem-frontal.webp",
            alt: "Vista frontal de la camiseta CARPE DIEM Black Edition",
            view: "FRONT",
            sortOrder: 0,
          },
          {
            url: "/ropa/carpe-diem-trasera.webp",
            alt: "Vista trasera de la camiseta CARPE DIEM Black Edition",
            view: "BACK",
            sortOrder: 1,
          },
          {
            url: "/ropa/carpe-diem-diseno.webp",
            alt: "Detalle del diseño CARPE DIEM",
            view: "DETAIL",
            sortOrder: 2,
          },
        ],
      },
    },
  });

  refreshClothingPages();
}

export async function updateProductAction(
  formData: FormData,
): Promise<void> {
  const productId = String(formData.get("productId") ?? "").trim();

  if (!productId) {
    throw new Error("No se ha recibido el identificador del producto.");
  }

  const price = parsePrice(formData.get("price"));
  const requestedStatus = String(
    formData.get("status") ?? "COMING_SOON",
  ).trim();

  const status = ALLOWED_STATUSES.has(requestedStatus)
    ? requestedStatus
    : "COMING_SOON";

  const active = formData.get("active") === "on";
  const featured = formData.get("featured") === "on";

  await prisma.$transaction([
    prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        price: price.toFixed(2),
        status,
        active,
        featured,
      },
    }),

    ...PRODUCT_SIZES.map((size, index) =>
      prisma.productVariant.upsert({
        where: {
          productId_size: {
            productId,
            size,
          },
        },
        update: {
          stock: parseStock(formData.get(`stock_${size}`)),
          active: true,
          sortOrder: index,
        },
        create: {
          productId,
          size,
          sku: `VM-CD-D01-${size}`,
          stock: parseStock(formData.get(`stock_${size}`)),
          active: true,
          sortOrder: index,
        },
      }),
    ),
  ]);

  refreshClothingPages();
}
