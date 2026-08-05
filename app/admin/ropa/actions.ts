"use server";

import path from "node:path";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE_NAME = "vanmotion_admin_session";

const PRODUCT_IMAGE_VIEWS = {
  LIFESTYLE: { sortOrder: 0 },
  FRONT: { sortOrder: 1 },
  BACK: { sortOrder: 2 },
  DETAIL: { sortOrder: 3 },
} as const;

const MAX_PRODUCT_IMAGE_SIZE = 8 * 1024 * 1024;

const ALLOWED_IMAGE_FORMATS: Record<string, ReadonlySet<string>> = {
  "image/jpeg": new Set([".jpg", ".jpeg"]),
  "image/png": new Set([".png"]),
  "image/webp": new Set([".webp"]),
  "image/avif": new Set([".avif"]),
};

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

type ProductImageView = keyof typeof PRODUCT_IMAGE_VIEWS;
type ClothingGender = "HOMBRE" | "MUJER";
type ClothingColor = "NEGRO" | "AZUL_FORD_E150";
type ClothingType = "TSHIRT" | "BOMBER";

type ClothingProductConfiguration = {
  slug: string;
  skuPrefix: string;
  name: string;
  subtitle: string;
  collection: string;
  productType: ClothingType;
  gender: ClothingGender;
  colorCode: ClothingColor;
  color: string;
  material: string;
  description: string;
  descriptionEn: string;
  sizes: readonly string[];
  initialPrice: string;
  sortOrder: number;
};

const MEN_SIZES = ["S", "M", "L"] as const;
const WOMEN_SIZES = ["XS", "S", "M"] as const;

const CLOTHING_PRODUCTS = [
  {
    slug: "carpe-diem-black-edition-drop-01",
    skuPrefix: "VM-CD-H-BLK-D01",
    name: "Camiseta CARPE DIEM · Hombre · Negra",
    subtitle: "Black Edition · Drop 01",
    collection: "CARPE DIEM · Drop 01",
    productType: "TSHIRT",
    gender: "HOMBRE",
    colorCode: "NEGRO",
    color: "Negro",
    material: "Algodón peinado premium · 220–240 gsm",
    description:
      "Camiseta para hombre de corte relajado streetwear. Frontal completamente limpio. Diseño CARPE DIEM colocado muy cerca del bajo, en la zona inferior derecha de la espalda, para que pueda verse parcialmente al llevar una bomber. Sin logotipo ni nombre VANMOTION impresos en el exterior; la marca aparece únicamente en la etiqueta.",
    descriptionEn:
      "Men's relaxed streetwear T-shirt with a completely clean front. CARPE DIEM artwork placed very close to the hem on the lower-right back so it can remain partially visible under a bomber. No VANMOTION logo or name printed on the exterior; the brand appears only on the label.",
    sizes: MEN_SIZES,
    initialPrice: "34.90",
    sortOrder: 0,
  },
  {
    slug: "carpe-diem-hombre-azul-ford-e150-drop-01",
    skuPrefix: "VM-CD-H-BLU-D01",
    name: "Camiseta CARPE DIEM · Hombre · Azul Ford E-150",
    subtitle: "Ford E-150 Edition · Drop 01",
    collection: "CARPE DIEM · Drop 01",
    productType: "TSHIRT",
    gender: "HOMBRE",
    colorCode: "AZUL_FORD_E150",
    color: "Azul Ford E-150",
    material: "Algodón peinado premium · 220–240 gsm",
    description:
      "Camiseta para hombre en azul Ford E-150, de corte relajado streetwear. Frontal completamente limpio. Diseño CARPE DIEM colocado muy cerca del bajo, en la zona inferior derecha de la espalda, para que pueda verse parcialmente al llevar una bomber. Sin logotipo ni nombre VANMOTION impresos en el exterior; la marca aparece únicamente en la etiqueta.",
    descriptionEn:
      "Men's Ford E-150 blue relaxed streetwear T-shirt with a completely clean front. CARPE DIEM artwork placed very close to the hem on the lower-right back so it can remain partially visible under a bomber. No VANMOTION logo or name printed on the exterior; the brand appears only on the label.",
    sizes: MEN_SIZES,
    initialPrice: "34.90",
    sortOrder: 1,
  },
  {
    slug: "carpe-diem-mujer-negra-drop-01",
    skuPrefix: "VM-CD-W-BLK-D01",
    name: "Camiseta CARPE DIEM · Mujer · Negra",
    subtitle: "Black Edition · Drop 01",
    collection: "CARPE DIEM · Drop 01",
    productType: "TSHIRT",
    gender: "MUJER",
    colorCode: "NEGRO",
    color: "Negro",
    material: "Algodón peinado premium · 200–220 gsm",
    description:
      "Camiseta para mujer de corte recto, cómodo y relajado, no muy entallado. Frontal completamente limpio. Diseño CARPE DIEM colocado muy cerca del bajo, en la zona inferior derecha de la espalda, para que pueda verse parcialmente al llevar una bomber. Sin logotipo ni nombre VANMOTION impresos en el exterior; la marca aparece únicamente en la etiqueta.",
    descriptionEn:
      "Women's straight, comfortable and relaxed T-shirt, not overly fitted, with a completely clean front. CARPE DIEM artwork placed very close to the hem on the lower-right back so it can remain partially visible under a bomber. No VANMOTION logo or name printed on the exterior; the brand appears only on the label.",
    sizes: WOMEN_SIZES,
    initialPrice: "34.90",
    sortOrder: 2,
  },
  {
    slug: "carpe-diem-mujer-azul-ford-e150-drop-01",
    skuPrefix: "VM-CD-W-BLU-D01",
    name: "Camiseta CARPE DIEM · Mujer · Azul Ford E-150",
    subtitle: "Ford E-150 Edition · Drop 01",
    collection: "CARPE DIEM · Drop 01",
    productType: "TSHIRT",
    gender: "MUJER",
    colorCode: "AZUL_FORD_E150",
    color: "Azul Ford E-150",
    material: "Algodón peinado premium · 200–220 gsm",
    description:
      "Camiseta para mujer en azul Ford E-150, de corte recto, cómodo y relajado. Frontal completamente limpio. Diseño CARPE DIEM colocado muy cerca del bajo, en la zona inferior derecha de la espalda, para que pueda verse parcialmente al llevar una bomber. Sin logotipo ni nombre VANMOTION impresos en el exterior; la marca aparece únicamente en la etiqueta.",
    descriptionEn:
      "Women's Ford E-150 blue straight and relaxed T-shirt with a completely clean front. CARPE DIEM artwork placed very close to the hem on the lower-right back so it can remain partially visible under a bomber. No VANMOTION logo or name printed on the exterior; the brand appears only on the label.",
    sizes: WOMEN_SIZES,
    initialPrice: "34.90",
    sortOrder: 3,
  },
  {
    slug: "bomber-hombre-negra-drop-01",
    skuPrefix: "VM-BM-H-BLK-D01",
    name: "Bomber VANMOTION · Hombre · Negra",
    subtitle: "Inauguración · Drop 01",
    collection: "Bomber VANMOTION · Drop 01",
    productType: "BOMBER",
    gender: "HOMBRE",
    colorCode: "NEGRO",
    color: "Negro satinado",
    material: "Nylon premium de entretiempo · 135–145 gsm",
    description:
      "Bomber para hombre en negro satinado. Cuello bajo, cremallera negra tono sobre tono y sin bolsillo en manga. Exterior completamente limpio, sin logotipo ni nombre VANMOTION impresos; la marca aparece únicamente en la etiqueta interior.",
    descriptionEn:
      "Men's black satin bomber with a low collar, tone-on-tone black zipper and no sleeve pocket. Completely clean exterior with no VANMOTION logo or name printed; the brand appears only on the inside label.",
    sizes: MEN_SIZES,
    initialPrice: "0.00",
    sortOrder: 4,
  },
  {
    slug: "bomber-hombre-azul-ford-e150-drop-01",
    skuPrefix: "VM-BM-H-BLU-D01",
    name: "Bomber VANMOTION · Hombre · Azul Ford E-150",
    subtitle: "Inauguración · Drop 01",
    collection: "Bomber VANMOTION · Drop 01",
    productType: "BOMBER",
    gender: "HOMBRE",
    colorCode: "AZUL_FORD_E150",
    color: "Azul Ford E-150",
    material: "Nylon premium de entretiempo · 135–145 gsm",
    description:
      "Bomber para hombre en azul Ford E-150. Cuello bajo, cremallera azul tono sobre tono y sin bolsillo en manga. Exterior completamente limpio, sin logotipo ni nombre VANMOTION impresos; la marca aparece únicamente en la etiqueta interior.",
    descriptionEn:
      "Men's Ford E-150 blue bomber with a low collar, tone-on-tone blue zipper and no sleeve pocket. Completely clean exterior with no VANMOTION logo or name printed; the brand appears only on the inside label.",
    sizes: MEN_SIZES,
    initialPrice: "0.00",
    sortOrder: 5,
  },
  {
    slug: "bomber-mujer-negra-drop-01",
    skuPrefix: "VM-BM-W-BLK-D01",
    name: "Bomber VANMOTION · Mujer · Negra",
    subtitle: "Inauguración · Drop 01",
    collection: "Bomber VANMOTION · Drop 01",
    productType: "BOMBER",
    gender: "MUJER",
    colorCode: "NEGRO",
    color: "Negro satinado",
    material: "Nylon premium de entretiempo · 135–145 gsm",
    description:
      "Bomber para mujer en negro satinado, de corte urbano cómodo. Cuello bajo, cremallera negra tono sobre tono y sin bolsillo en manga. Exterior completamente limpio, sin logotipo ni nombre VANMOTION impresos; la marca aparece únicamente en la etiqueta interior.",
    descriptionEn:
      "Women's black satin bomber with a comfortable urban fit, low collar, tone-on-tone black zipper and no sleeve pocket. Completely clean exterior with no VANMOTION logo or name printed; the brand appears only on the inside label.",
    sizes: WOMEN_SIZES,
    initialPrice: "0.00",
    sortOrder: 6,
  },
  {
    slug: "bomber-mujer-azul-ford-e150-drop-01",
    skuPrefix: "VM-BM-W-BLU-D01",
    name: "Bomber VANMOTION · Mujer · Azul Ford E-150",
    subtitle: "Inauguración · Drop 01",
    collection: "Bomber VANMOTION · Drop 01",
    productType: "BOMBER",
    gender: "MUJER",
    colorCode: "AZUL_FORD_E150",
    color: "Azul Ford E-150",
    material: "Nylon premium de entretiempo · 135–145 gsm",
    description:
      "Bomber para mujer en azul Ford E-150, de corte urbano cómodo. Cuello bajo, cremallera azul tono sobre tono y sin bolsillo en manga. Exterior completamente limpio, sin logotipo ni nombre VANMOTION impresos; la marca aparece únicamente en la etiqueta interior.",
    descriptionEn:
      "Women's Ford E-150 blue bomber with a comfortable urban fit, low collar, tone-on-tone blue zipper and no sleeve pocket. Completely clean exterior with no VANMOTION logo or name printed; the brand appears only on the inside label.",
    sizes: WOMEN_SIZES,
    initialPrice: "0.00",
    sortOrder: 7,
  },
] as const satisfies readonly ClothingProductConfiguration[];

const PRODUCT_CONFIGURATION_BY_SLUG = new Map<
  string,
  ClothingProductConfiguration
>(
  CLOTHING_PRODUCTS.map((product) => [product.slug, product]),
);

async function requireAdminSession(): Promise<void> {
  const expectedToken = process.env.ADMIN_SESSION_TOKEN?.trim();
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!expectedToken || !currentToken || currentToken !== expectedToken) {
    redirect("/login-admin");
  }
}

function requiredString(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`El campo “${field}” es obligatorio.`);
  }

  return value.trim();
}

function parsePrice(value: FormDataEntryValue | null): number {
  const normalized = String(value ?? "").trim().replace(",", ".");
  const price = Number(normalized);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("El precio introducido no es válido.");
  }

  return Math.round(price * 100) / 100;
}

function parseStock(value: FormDataEntryValue | null): number {
  const normalized = String(value ?? "0").trim();
  const stock = Number(normalized || "0");

  if (!Number.isSafeInteger(stock) || stock < 0) {
    throw new Error(
      "El stock introducido debe ser un número entero igual o superior a cero.",
    );
  }

  return stock;
}

function parseProductImageView(formData: FormData): ProductImageView {
  const view = requiredString(formData, "view");

  if (!(view in PRODUCT_IMAGE_VIEWS)) {
    throw new Error("La vista de la imagen no es válida.");
  }

  return view as ProductImageView;
}

function safeFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateProductImage(file: File): string {
  const extension = path.extname(file.name).toLowerCase();
  const allowedExtensions = ALLOWED_IMAGE_FORMATS[file.type];

  if (!allowedExtensions || !allowedExtensions.has(extension)) {
    throw new Error(
      "La imagen debe ser JPG, PNG, WebP o AVIF y su extensión debe coincidir con el archivo.",
    );
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
    throw new Error("La imagen no puede superar los 8 MB.");
  }

  return extension;
}

function isVercelBlobUrl(value: string | null): value is string {
  if (!value || value.startsWith("/")) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);

    return (
      parsedUrl.protocol === "https:" &&
      parsedUrl.hostname.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

async function removeStoredProductImage(imageUrl: string | null): Promise<void> {
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

async function requireManagedProduct(productId: string): Promise<{
  id: string;
  slug: string;
  configuration: ClothingProductConfiguration;
}> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, category: true },
  });

  const configuration = product
    ? PRODUCT_CONFIGURATION_BY_SLUG.get(product.slug)
    : undefined;

  if (!product || product.category !== "CLOTHING" || !configuration) {
    throw new Error(
      "El producto indicado no puede gestionarse desde esta sección.",
    );
  }

  return {
    id: product.id,
    slug: product.slug,
    configuration,
  };
}

function refreshClothingPages(): void {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/ropa");
  revalidatePath("/ropa");
}

function getAutomaticStatus(requestedStatus: string, totalStock: number): string {
  if (MANUAL_STATUSES.has(requestedStatus)) {
    return requestedStatus;
  }

  return totalStock > 0 ? "AVAILABLE" : "SOLD_OUT";
}

function getImageAlt(
  configuration: ClothingProductConfiguration,
  view: ProductImageView,
): string {
  const viewLabels: Record<ProductImageView, string> = {
    FRONT: "vista frontal",
    BACK: "vista trasera",
    DETAIL: "detalle de diseño y materiales",
    LIFESTYLE: "imagen lifestyle",
  };

  return `${configuration.name} · ${viewLabels[view]}`;
}

const LEGACY_PRODUCT_IMAGE_URLS = [
  "/ropa/carpe-diem-frontal.webp",
  "/ropa/carpe-diem-trasera.webp",
  "/ropa/carpe-diem-diseno.webp",
  "/ropa/carpe-diem-black-edition.webp",
] as const;

type ApprovedProductImage = {
  view: ProductImageView;
  url: string;
};

const APPROVED_PRODUCT_IMAGES_BY_SLUG: Readonly<
  Record<string, readonly ApprovedProductImage[]>
> = {
  "carpe-diem-mujer-negra-drop-01": [
    {
      view: "LIFESTYLE",
      url: "/ropa/aprobadas/mujer/camiseta-negra/lifestyle.webp",
    },
    {
      view: "FRONT",
      url: "/ropa/aprobadas/mujer/camiseta-negra/frontal.webp",
    },
    {
      view: "BACK",
      url: "/ropa/aprobadas/mujer/camiseta-negra/trasera.webp",
    },
    {
      view: "DETAIL",
      url: "/ropa/aprobadas/mujer/camiseta-negra/etiqueta.webp",
    },
  ],
  "carpe-diem-mujer-azul-ford-e150-drop-01": [
    {
      view: "LIFESTYLE",
      url: "/ropa/aprobadas/mujer/camiseta-azul-ford/lifestyle.webp",
    },
    {
      view: "FRONT",
      url: "/ropa/aprobadas/mujer/camiseta-azul-ford/frontal.webp",
    },
    {
      view: "BACK",
      url: "/ropa/aprobadas/mujer/camiseta-azul-ford/trasera.webp",
    },
    {
      view: "DETAIL",
      url: "/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta.webp",
    },
  ],
};

async function installApprovedProductImages(
  productId: string,
  configuration: ClothingProductConfiguration,
): Promise<void> {
  const approvedImages = APPROVED_PRODUCT_IMAGES_BY_SLUG[configuration.slug];

  if (!approvedImages) {
    return;
  }

  const approvedViews = approvedImages.map((image) => image.view);
  const currentImages = await prisma.productImage.findMany({
    where: {
      productId,
      view: { in: approvedViews },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const imagesByView = new Map<
    ProductImageView,
    typeof currentImages
  >();

  for (const image of currentImages) {
    const view = image.view as ProductImageView;
    const imagesForView = imagesByView.get(view) ?? [];
    imagesForView.push(image);
    imagesByView.set(view, imagesForView);
  }

  await prisma.$transaction(
    approvedImages.flatMap((approvedImage) => {
      const imagesForView = imagesByView.get(approvedImage.view) ?? [];
      const currentImage = imagesForView[0];
      const duplicatedImageIds = imagesForView
        .slice(1)
        .map((image) => image.id);
      const imageData = {
        url: approvedImage.url,
        alt: getImageAlt(configuration, approvedImage.view),
        view: approvedImage.view,
        sortOrder: PRODUCT_IMAGE_VIEWS[approvedImage.view].sortOrder,
      };

      return [
        currentImage
          ? prisma.productImage.update({
              where: { id: currentImage.id },
              data: imageData,
            })
          : prisma.productImage.create({
              data: {
                productId,
                ...imageData,
              },
            }),
        ...(duplicatedImageIds.length > 0
          ? [
              prisma.productImage.deleteMany({
                where: { id: { in: duplicatedImageIds } },
              }),
            ]
          : []),
      ];
    }),
  );

  await Promise.all(
    currentImages.map((image) => removeStoredProductImage(image.url)),
  );
}

export async function createVanmotionClothingCollectionAction(): Promise<void> {
  await requireAdminSession();

  for (const configuration of CLOTHING_PRODUCTS) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug: configuration.slug },
      select: {
        id: true,
        images: {
          where: {
            url: { in: [...LEGACY_PRODUCT_IMAGE_URLS] },
          },
          select: { id: true, url: true },
        },
      },
    });

    const product = await prisma.product.upsert({
      where: { slug: configuration.slug },
      update: {
        name: configuration.name,
        subtitle: configuration.subtitle,
        collection: configuration.collection,
        category: "CLOTHING",
        productType: configuration.productType,
        description: configuration.description,
        descriptionEn: configuration.descriptionEn,
        material: configuration.material,
        color: configuration.color,
        sortOrder: configuration.sortOrder,
      },
      create: {
        slug: configuration.slug,
        name: configuration.name,
        subtitle: configuration.subtitle,
        collection: configuration.collection,
        category: "CLOTHING",
        productType: configuration.productType,
        description: configuration.description,
        descriptionEn: configuration.descriptionEn,
        material: configuration.material,
        color: configuration.color,
        price: configuration.initialPrice,
        currency: "EUR",
        status: "DRAFT",
        featured: false,
        active: false,
        sortOrder: configuration.sortOrder,
      },
      select: { id: true },
    });

    await prisma.$transaction([
      prisma.productVariant.updateMany({
        where: {
          productId: product.id,
          size: { notIn: [...configuration.sizes] },
        },
        data: {
          stock: 0,
          active: false,
        },
      }),
      ...configuration.sizes.map((size, index) =>
        prisma.productVariant.upsert({
          where: {
            productId_size: {
              productId: product.id,
              size,
            },
          },
          update: {
            active: true,
            sortOrder: index,
          },
          create: {
            productId: product.id,
            size,
            sku: `${configuration.skuPrefix}-${size}`,
            stock: 0,
            active: true,
            sortOrder: index,
          },
        }),
      ),
      ...(existingProduct?.images.length
        ? [
            prisma.product.update({
              where: { id: product.id },
              data: {
                status: "DRAFT",
                active: false,
                featured: false,
              },
            }),
            prisma.productVariant.updateMany({
              where: { productId: product.id },
              data: { stock: 0 },
            }),
            prisma.productImage.deleteMany({
              where: {
                productId: product.id,
                url: { in: [...LEGACY_PRODUCT_IMAGE_URLS] },
              },
            }),
          ]
        : []),
    ]);

    await installApprovedProductImages(product.id, configuration);
  }

  refreshClothingPages();
}

/*
 * Conservamos el nombre anterior para que el panel actual siga funcionando
 * durante la reconstrucción. Más adelante el botón pasará a mostrar
 * “Crear colección VANMOTION”.
 */
export async function createCarpeDiemProductAction(): Promise<void> {
  await createVanmotionClothingCollectionAction();
}

export async function updateProductAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const productId = requiredString(formData, "productId");
  const managedProduct = await requireManagedProduct(productId);
  const { configuration } = managedProduct;

  const price = parsePrice(formData.get("price"));
  const requestedStatus = String(
    formData.get("status") ?? "COMING_SOON",
  ).trim();
  const validatedStatus = ALLOWED_STATUSES.has(requestedStatus)
    ? requestedStatus
    : "COMING_SOON";

  const stocks = new Map<string, number>();

  for (const size of configuration.sizes) {
    stocks.set(size, parseStock(formData.get(`stock_${size}`)));
  }

  const totalStock = configuration.sizes.reduce(
    (total, size) => total + (stocks.get(size) ?? 0),
    0,
  );

  const status = getAutomaticStatus(validatedStatus, totalStock);
  const requestedActive = formData.get("active") === "on";
  const active = status === "COMING_SOON" ? true : requestedActive;
  const featured = formData.get("featured") === "on";

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        price: price.toFixed(2),
        status,
        active,
        featured,
      },
    }),
    prisma.productVariant.updateMany({
      where: {
        productId,
        size: { notIn: [...configuration.sizes] },
      },
      data: {
        stock: 0,
        active: false,
      },
    }),
    ...configuration.sizes.map((size, index) =>
      prisma.productVariant.upsert({
        where: {
          productId_size: {
            productId,
            size,
          },
        },
        update: {
          stock: stocks.get(size) ?? 0,
          active: true,
          sortOrder: index,
        },
        create: {
          productId,
          size,
          sku: `${configuration.skuPrefix}-${size}`,
          stock: stocks.get(size) ?? 0,
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

  const productId = requiredString(formData, "productId");
  const view = parseProductImageView(formData);
  const product = await requireManagedProduct(productId);
  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    throw new Error("Selecciona una imagen para el producto.");
  }

  const extension = validateProductImage(image);
  const originalBaseName =
    path.basename(image.name, extension) || view.toLowerCase();
  const pathname =
    `clothing/${product.id}/${view.toLowerCase()}/` +
    safeFileName(`${originalBaseName}${extension}`);

  const currentImages = await prisma.productImage.findMany({
    where: { productId: product.id, view },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const blob = await put(pathname, image, {
    access: "public",
    addRandomSuffix: true,
  });

  try {
    await prisma.$transaction(async (transaction) => {
      const currentImage = currentImages[0];
      const imageData = {
        url: blob.url,
        alt: getImageAlt(product.configuration, view),
        view,
        sortOrder: PRODUCT_IMAGE_VIEWS[view].sortOrder,
      };

      if (currentImage) {
        await transaction.productImage.update({
          where: { id: currentImage.id },
          data: imageData,
        });
      } else {
        await transaction.productImage.create({
          data: {
            productId: product.id,
            ...imageData,
          },
        });
      }

      const duplicatedImageIds = currentImages
        .slice(1)
        .map((currentImage) => currentImage.id);

      if (duplicatedImageIds.length > 0) {
        await transaction.productImage.deleteMany({
          where: { id: { in: duplicatedImageIds } },
        });
      }
    });
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
    currentImages.map((currentImage) =>
      removeStoredProductImage(currentImage.url),
    ),
  );

  refreshClothingPages();
}

export async function removeProductImageAction(
  formData: FormData,
): Promise<void> {
  await requireAdminSession();

  const productId = requiredString(formData, "productId");
  const view = parseProductImageView(formData);
  const product = await requireManagedProduct(productId);

  const currentImages = await prisma.productImage.findMany({
    where: { productId: product.id, view },
  });

  if (currentImages.length === 0) {
    refreshClothingPages();
    return;
  }

  await prisma.productImage.deleteMany({
    where: {
      id: {
        in: currentImages.map((currentImage) => currentImage.id),
      },
    },
  });

  await Promise.all(
    currentImages.map((currentImage) =>
      removeStoredProductImage(currentImage.url),
    ),
  );

  refreshClothingPages();
}
