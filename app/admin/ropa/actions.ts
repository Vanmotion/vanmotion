"use server";

import path from "node:path";

import { del, put } from "@vercel/blob";
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

const PRODUCT_IMAGE_VIEWS = {
  FRONT: {
    sortOrder: 0,
    alt:
      "Vista frontal de la camiseta CARPE DIEM Black Edition",
  },
  BACK: {
    sortOrder: 1,
    alt:
      "Vista trasera de la camiseta CARPE DIEM Black Edition",
  },
  DETAIL: {
    sortOrder: 2,
    alt:
      "Detalle del diseño CARPE DIEM",
  },
} as const;

const MAX_PRODUCT_IMAGE_SIZE =
  8 * 1024 * 1024;

const ALLOWED_IMAGE_FORMATS: Record<
  string,
  ReadonlySet<string>
> = {
  "image/jpeg": new Set([
    ".jpg",
    ".jpeg",
  ]),
  "image/png": new Set([
    ".png",
  ]),
  "image/webp": new Set([
    ".webp",
  ]),
  "image/avif": new Set([
    ".avif",
  ]),
};

type ProductSize =
  (typeof PRODUCT_SIZES)[number];

type ProductImageView =
  keyof typeof PRODUCT_IMAGE_VIEWS;

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

function requiredString(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `El campo “${field}” es obligatorio.`,
    );
  }

  return value.trim();
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

function parseProductImageView(
  formData: FormData,
): ProductImageView {
  const view = requiredString(
    formData,
    "view",
  );

  if (!(view in PRODUCT_IMAGE_VIEWS)) {
    throw new Error(
      "La vista de la imagen no es válida.",
    );
  }

  return view as ProductImageView;
}

function safeFileName(
  fileName: string,
): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateProductImage(
  file: File,
): string {
  const extension = path
    .extname(file.name)
    .toLowerCase();

  const allowedExtensions =
    ALLOWED_IMAGE_FORMATS[file.type];

  if (
    !allowedExtensions ||
    !allowedExtensions.has(extension)
  ) {
    throw new Error(
      "La imagen debe ser JPG, PNG, WebP o AVIF y su extensión debe coincidir con el archivo.",
    );
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
    throw new Error(
      "La imagen no puede superar los 8 MB.",
    );
  }

  return extension;
}

function isVercelBlobUrl(
  value: string | null,
): value is string {
  if (!value || value.startsWith("/")) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);

    return (
      parsedUrl.protocol === "https:" &&
      parsedUrl.hostname.endsWith(
        ".blob.vercel-storage.com",
      )
    );
  } catch {
    return false;
  }
}

async function removeStoredProductImage(
  imageUrl: string | null,
): Promise<void> {
  if (!isVercelBlobUrl(imageUrl)) {
    return;
  }

  try {
    await del(imageUrl);
  } catch (error) {
    console.error(
      "No se pudo eliminar la imagen de ropa de Vercel Blob:",
      error,
    );
  }
}

async function requireManagedProduct(
  productId: string,
): Promise<{
  id: string;
  slug: string;
}> {
  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        id: true,
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

  return product;
}

function refreshClothingPages(): void {
  revalidatePath("/");
  revalidatePath("/admin");
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
              PRODUCT_IMAGE_VIEWS.FRONT.alt,

            view: "FRONT",
            sortOrder:
              PRODUCT_IMAGE_VIEWS.FRONT
                .sortOrder,
          },
          {
            url:
              "/ropa/carpe-diem-trasera.webp",

            alt:
              PRODUCT_IMAGE_VIEWS.BACK.alt,

            view: "BACK",
            sortOrder:
              PRODUCT_IMAGE_VIEWS.BACK
                .sortOrder,
          },
          {
            url:
              "/ropa/carpe-diem-diseno.webp",

            alt:
              PRODUCT_IMAGE_VIEWS.DETAIL.alt,

            view: "DETAIL",
            sortOrder:
              PRODUCT_IMAGE_VIEWS.DETAIL
                .sortOrder,
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

  const productId = requiredString(
    formData,
    "productId",
  );

  await requireManagedProduct(productId);

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

export async function saveProductImageAction(
  formData: FormData,
): Promise<void> {
  await requireAdminSession();

  const productId = requiredString(
    formData,
    "productId",
  );

  const view =
    parseProductImageView(formData);

  const product =
    await requireManagedProduct(productId);

  const image = formData.get("image");

  if (
    !(image instanceof File) ||
    image.size === 0
  ) {
    throw new Error(
      "Selecciona una imagen para el producto.",
    );
  }

  const extension =
    validateProductImage(image);

  const viewConfiguration =
    PRODUCT_IMAGE_VIEWS[view];

  const originalBaseName =
    path.basename(
      image.name,
      extension,
    ) || view.toLowerCase();

  const pathname =
    `clothing/${product.id}/${view.toLowerCase()}/` +
    safeFileName(
      `${originalBaseName}${extension}`,
    );

  const currentImages =
    await prisma.productImage.findMany({
      where: {
        productId: product.id,
        view,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

  const blob = await put(
    pathname,
    image,
    {
      access: "public",
      addRandomSuffix: true,
    },
  );

  try {
    await prisma.$transaction(
      async (transaction) => {
        const currentImage =
          currentImages[0];

        if (currentImage) {
          await transaction.productImage.update({
            where: {
              id: currentImage.id,
            },

            data: {
              url: blob.url,
              alt:
                viewConfiguration.alt,
              view,
              sortOrder:
                viewConfiguration.sortOrder,
            },
          });
        } else {
          await transaction.productImage.create({
            data: {
              productId: product.id,
              url: blob.url,
              alt:
                viewConfiguration.alt,
              view,
              sortOrder:
                viewConfiguration.sortOrder,
            },
          });
        }

        const duplicatedImageIds =
          currentImages
            .slice(1)
            .map(
              (currentImage) =>
                currentImage.id,
            );

        if (
          duplicatedImageIds.length > 0
        ) {
          await transaction.productImage.deleteMany({
            where: {
              id: {
                in: duplicatedImageIds,
              },
            },
          });
        }
      },
    );
  } catch (error) {
    try {
      await del(blob.url);
    } catch (cleanupError) {
      console.error(
        "No se pudo limpiar la nueva imagen de ropa tras fallar la base de datos:",
        cleanupError,
      );
    }

    throw error;
  }

  await Promise.all(
    currentImages.map(
      (currentImage) =>
        removeStoredProductImage(
          currentImage.url,
        ),
    ),
  );

  refreshClothingPages();
}

export async function removeProductImageAction(
  formData: FormData,
): Promise<void> {
  await requireAdminSession();

  const productId = requiredString(
    formData,
    "productId",
  );

  const view =
    parseProductImageView(formData);

  const product =
    await requireManagedProduct(productId);

  const currentImages =
    await prisma.productImage.findMany({
      where: {
        productId: product.id,
        view,
      },
    });

  if (currentImages.length === 0) {
    refreshClothingPages();
    return;
  }

  await prisma.productImage.deleteMany({
    where: {
      id: {
        in: currentImages.map(
          (currentImage) =>
            currentImage.id,
        ),
      },
    },
  });

  await Promise.all(
    currentImages.map(
      (currentImage) =>
        removeStoredProductImage(
          currentImage.url,
        ),
    ),
  );

  refreshClothingPages();
}
