"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE_NAME =
  "vanmotion_admin_session";

const PRODUCT_SLUG =
  "carpe-diem-black-edition-drop-01";

const PRODUCT_SIZES = [
  "S",
  "M",
  "L",
  "XL",
] as const;

type ProductSize =
  (typeof PRODUCT_SIZES)[number];

const ALLOWED_STATUSES = new Set([
  "DRAFT",
  "COMING_SOON",
  "AVAILABLE",
  "SOLD_OUT",
  "HIDDEN",
]);

const MANUAL_STATUSES = new Set([
  "DRAFT",
  "COMING_SOON",
  "HIDDEN",
]);

async function requireAdminSession(): Promise<void> {
  const expectedToken =
    process.env.ADMIN_SESSION_TOKEN?.trim();

  const cookieStore =
    await cookies();

  const currentToken =
    cookieStore.get(
      SESSION_COOKIE_NAME,
    )?.value;

  if (
    !expectedToken ||
    !currentToken ||
    currentToken !== expectedToken
  ) {
    redirect("/login-admin");
  }
}

function parsePrice(
  value: FormDataEntryValue | null,
): number {
  const normalized = String(value ?? "")
    .trim()
    .replace(",", ".");

  const price = Number(normalized);

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    throw new Error(
      "El precio introducido no es válido.",
    );
  }

  return Math.round(price * 100) / 100;
}

function parseStock(
  value: FormDataEntryValue | null,
): number {
  const normalized = String(
    value ?? "0",
  ).trim();

  const stock = Number(
    normalized || "0",
  );

  if (
    !Number.isSafeInteger(stock) ||
    stock < 0
  ) {
    throw new Error(
      "El stock introducido debe ser un número entero igual o superior a cero.",
    );
  }

  return stock;
}

function refreshClothingPages(): void {
  revalidatePath("/admin/ropa");
  revalidatePath("/ropa");
}

function getAutomaticStatus(
  requestedStatus: string,
  totalStock: number,
): string {
  /*
   * Borrador, Próximamente y Oculto son estados
   * manuales y deben respetarse aunque exista stock.
   */
  if (
    MANUAL_STATUSES.has(
      requestedStatus,
    )
  ) {
    return requestedStatus;
  }

  /*
   * Disponible y Agotado se sincronizan
   * automáticamente con el stock real.
   */
  return totalStock > 0
    ? "AVAILABLE"
    : "SOLD_OUT";
}

export async function createCarpeDiemProductAction(): Promise<void> {
  await requireAdminSession();

  await prisma.product.upsert({
    where: {
      slug: PRODUCT_SLUG,
    },

    update: {},

    create: {
      slug: PRODUCT_SLUG,

      name:
        "CARPE DIEM — Black Edition",

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
        create: PRODUCT_SIZES.map(
          (size, index) => ({
            size,
            sku: `VM-CD-D01-${size}`,
            stock: 0,
            active: true,
            sortOrder: index,
          }),
        ),
      },

      images: {
        create: [
          {
            url:
              "/ropa/carpe-diem-frontal.webp",

            alt:
              "Vista frontal de la camiseta CARPE DIEM Black Edition",

            view: "FRONT",
            sortOrder: 0,
          },
          {
            url:
              "/ropa/carpe-diem-trasera.webp",

            alt:
              "Vista trasera de la camiseta CARPE DIEM Black Edition",

            view: "BACK",
            sortOrder: 1,
          },
          {
            url:
              "/ropa/carpe-diem-diseno.webp",

            alt:
              "Detalle del diseño CARPE DIEM",

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
  await requireAdminSession();

  const productId = String(
    formData.get("productId") ?? "",
  ).trim();

  if (!productId) {
    throw new Error(
      "No se ha recibido el identificador del producto.",
    );
  }

  /*
   * Esta acción pertenece exclusivamente al Drop 01.
   * No debe poder utilizarse para modificar otro producto.
   */
  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        slug: true,
      },
    });

  if (
    !product ||
    product.slug !== PRODUCT_SLUG
  ) {
    throw new Error(
      "El producto indicado no puede gestionarse desde esta sección.",
    );
  }

  const price = parsePrice(
    formData.get("price"),
  );

  const requestedStatus = String(
    formData.get("status") ??
      "COMING_SOON",
  ).trim();

  const validatedStatus =
    ALLOWED_STATUSES.has(
      requestedStatus,
    )
      ? requestedStatus
      : "COMING_SOON";

  const stocks = {} as Record<
    ProductSize,
    number
  >;

  for (const size of PRODUCT_SIZES) {
    stocks[size] = parseStock(
      formData.get(`stock_${size}`),
    );
  }

  const totalStock =
    PRODUCT_SIZES.reduce(
      (total, size) =>
        total + stocks[size],
      0,
    );

  const status = getAutomaticStatus(
    validatedStatus,
    totalStock,
  );

  const active =
    formData.get("active") === "on";

  const featured =
    formData.get("featured") === "on";

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

    ...PRODUCT_SIZES.map(
      (size, index) =>
        prisma.productVariant.upsert({
          where: {
            productId_size: {
              productId,
              size,
            },
          },

          update: {
            stock: stocks[size],
            active: true,
            sortOrder: index,
          },

          create: {
            productId,
            size,
            sku: `VM-CD-D01-${size}`,
            stock: stocks[size],
            active: true,
            sortOrder: index,
          },
        }),
    ),
  ]);

  refreshClothingPages();
}
