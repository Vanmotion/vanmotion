import path from "node:path";

import { del } from "@vercel/blob";
import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { revalidatePath } from "next/cache";
import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE_NAME =
  "vanmotion_admin_session";

const MAX_IMAGE_SIZE =
  8 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const ALLOWED_EXTENSIONS =
  new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
  ]);

const ALLOWED_VIEWS =
  new Set([
    "LIFESTYLE",
    "FRONT",
    "BACK",
    "DETAIL",
  ]);

const MANAGED_PRODUCT_SLUGS =
  new Set([
    "carpe-diem-black-edition-drop-01",
    "carpe-diem-hombre-azul-ford-e150-drop-01",
    "carpe-diem-mujer-negra-drop-01",
    "carpe-diem-mujer-azul-ford-e150-drop-01",
    "bomber-hombre-negra-drop-01",
    "bomber-hombre-azul-ford-e150-drop-01",
    "bomber-mujer-negra-drop-01",
    "bomber-mujer-azul-ford-e150-drop-01",
  ]);

type ProductImageView =
  | "LIFESTYLE"
  | "FRONT"
  | "BACK"
  | "DETAIL";

type ClientPayload = {
  productId: string;
  view: ProductImageView;
};

type RegisterActionBody = {
  action: "register";
  productId: string;
  view: ProductImageView;
  url: string;
  pathname: string;
  fileName: string;
  contentType: string;
  size: number;
};

function requireAdminSession(
  request: NextRequest,
): void {
  const expectedToken =
    process.env
      .ADMIN_SESSION_TOKEN
      ?.trim();

  const currentToken =
    request.cookies
      .get(SESSION_COOKIE_NAME)
      ?.value.trim();

  if (
    !expectedToken ||
    currentToken !==
      expectedToken
  ) {
    throw new Error(
      "No tienes autorización para gestionar imágenes.",
    );
  }
}

function requiredText(
  value: unknown,
  message: string,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(message);
  }

  return value.trim();
}

function parseView(
  value: unknown,
): ProductImageView {
  const view = requiredText(
    value,
    "La vista de la imagen no es válida.",
  );

  if (
    !ALLOWED_VIEWS.has(view)
  ) {
    throw new Error(
      "La vista de la imagen no es válida.",
    );
  }

  return view as ProductImageView;
}

function parseClientPayload(
  value: string | null | undefined,
): ClientPayload {
  if (!value) {
    throw new Error(
      "No se ha recibido el producto.",
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(
      "Los datos de la subida no son válidos.",
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("productId" in parsed) ||
    !("view" in parsed)
  ) {
    throw new Error(
      "El producto indicado no es válido.",
    );
  }

  return {
    productId: requiredText(
      parsed.productId,
      "El producto indicado no es válido.",
    ),
    view: parseView(
      parsed.view,
    ),
  };
}

function parseRegisterAction(
  value: unknown,
): RegisterActionBody | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("action" in value) ||
    value.action !== "register"
  ) {
    return null;
  }

  const body =
    value as Record<
      string,
      unknown
    >;

  const size =
    Number(body.size);

  if (
    !Number.isFinite(size) ||
    size <= 0 ||
    size > MAX_IMAGE_SIZE
  ) {
    throw new Error(
      "El tamaño de la imagen no es válido.",
    );
  }

  return {
    action: "register",
    productId: requiredText(
      body.productId,
      "El producto indicado no es válido.",
    ),
    view: parseView(body.view),
    url: requiredText(
      body.url,
      "La dirección de la imagen no es válida.",
    ),
    pathname: requiredText(
      body.pathname,
      "La ubicación de la imagen no es válida.",
    ),
    fileName: requiredText(
      body.fileName,
      "El nombre de la imagen no es válido.",
    ),
    contentType:
      typeof body.contentType ===
      "string"
        ? body.contentType
        : "",
    size,
  };
}

function isVercelBlobUrl(
  value: string | null,
): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(
        ".blob.vercel-storage.com",
      )
    );
  } catch {
    return false;
  }
}

function getImageAlt(
  productName: string,
  view: ProductImageView,
): string {
  const labels:
    Record<
      ProductImageView,
      string
    > = {
      LIFESTYLE:
        "modelo llevando la prenda",
      FRONT:
        "vista frontal",
      BACK:
        "vista trasera",
      DETAIL:
        "detalle de diseño y materiales",
    };

  return `${productName} · ${labels[view]}`;
}

function refreshClothingPages(
  slug: string,
): void {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/ropa");
  revalidatePath("/ropa");
  revalidatePath(`/ropa/${slug}`);
}

async function requireManagedProduct(
  productId: string,
): Promise<{
  id: string;
  slug: string;
  name: string;
}> {
  const product =
    await prisma.product
      .findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          slug: true,
          name: true,
          category: true,
        },
      });

  if (
    !product ||
    product.category !==
      "CLOTHING" ||
    !MANAGED_PRODUCT_SLUGS.has(
      product.slug,
    )
  ) {
    throw new Error(
      "El producto indicado no puede gestionarse desde esta sección.",
    );
  }

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
  };
}

async function registerImage({
  productId,
  view,
  url,
  pathname,
}: {
  productId: string;
  view: ProductImageView;
  url: string;
  pathname: string;
}): Promise<void> {
  const expectedPrefix =
    `clothing/${productId}/${view.toLowerCase()}/`;

  if (
    !pathname.startsWith(
      expectedPrefix,
    ) ||
    pathname.includes("..") ||
    !isVercelBlobUrl(url)
  ) {
    throw new Error(
      "La ubicación de la imagen no es válida.",
    );
  }

  const extension =
    path
      .extname(pathname)
      .toLowerCase();

  if (
    !ALLOWED_EXTENSIONS.has(
      extension,
    )
  ) {
    throw new Error(
      "El formato de la imagen no es válido.",
    );
  }

  const product =
    await requireManagedProduct(
      productId,
    );

  const currentImages =
    await prisma.productImage
      .findMany({
        where: {
          productId:
            product.id,
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

  try {
    await prisma.$transaction(
      async (transaction) => {
        const currentImage =
          currentImages[0];

        const imageData = {
          url,
          alt: getImageAlt(
            product.name,
            view,
          ),
          view,
          sortOrder:
            view === "LIFESTYLE"
              ? 0
              : view === "FRONT"
                ? 1
                : view === "BACK"
                  ? 2
                  : 3,
        };

        if (currentImage) {
          await transaction
            .productImage
            .update({
              where: {
                id:
                  currentImage.id,
              },
              data: imageData,
            });
        } else {
          await transaction
            .productImage
            .create({
              data: {
                productId:
                  product.id,
                ...imageData,
              },
            });
        }

        const duplicateIds =
          currentImages
            .slice(1)
            .map(
              (image) =>
                image.id,
            );

        if (
          duplicateIds.length > 0
        ) {
          await transaction
            .productImage
            .deleteMany({
              where: {
                id: {
                  in:
                    duplicateIds,
                },
              },
            });
        }
      },
    );
  } catch (error) {
    try {
      await del(url);
    } catch (
      cleanupError
    ) {
      console.error(
        "VANMOTION_PRODUCT_IMAGE_CLEANUP_ERROR:",
        cleanupError,
      );
    }

    throw error;
  }

  await Promise.all(
    currentImages
      .filter(
        (image) =>
          image.url !== url &&
          isVercelBlobUrl(
            image.url,
          ),
      )
      .map(async (image) => {
        try {
          await del(
            image.url,
          );
        } catch (
          deleteError
        ) {
          console.error(
            "VANMOTION_OLD_PRODUCT_IMAGE_DELETE_ERROR:",
            deleteError,
          );
        }
      }),
  );

  refreshClothingPages(
    product.slug,
  );
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const body: unknown =
      await request.json();

    const registerAction =
      parseRegisterAction(body);

    if (registerAction) {
      requireAdminSession(
        request,
      );

      await registerImage({
        productId:
          registerAction.productId,
        view:
          registerAction.view,
        url:
          registerAction.url,
        pathname:
          registerAction.pathname,
      });

      return NextResponse.json({
        success: true,
      });
    }

    const response =
      await handleUpload({
        body:
          body as HandleUploadBody,
        request,

        onBeforeGenerateToken:
          async (
            pathname,
            clientPayload,
          ) => {
            requireAdminSession(
              request,
            );

            const payload =
              parseClientPayload(
                clientPayload,
              );

            await requireManagedProduct(
              payload.productId,
            );

            const expectedPrefix =
              `clothing/${payload.productId}/${payload.view.toLowerCase()}/`;

            if (
              !pathname.startsWith(
                expectedPrefix,
              ) ||
              pathname.includes(
                "..",
              ) ||
              !ALLOWED_EXTENSIONS.has(
                path
                  .extname(pathname)
                  .toLowerCase(),
              )
            ) {
              throw new Error(
                "La ubicación de la imagen no es válida.",
              );
            }

            return {
              allowedContentTypes:
                ALLOWED_CONTENT_TYPES,
              maximumSizeInBytes:
                MAX_IMAGE_SIZE,
              addRandomSuffix: true,
              tokenPayload:
                JSON.stringify(
                  payload,
                ),
            };
          },

        onUploadCompleted:
          async ({
            blob,
            tokenPayload,
          }) => {
            const payload =
              parseClientPayload(
                tokenPayload,
              );

            try {
              await registerImage({
                productId:
                  payload.productId,
                view:
                  payload.view,
                url: blob.url,
                pathname:
                  blob.pathname,
              });
            } catch (
              completionError
            ) {
              console.error(
                "VANMOTION_PRODUCT_IMAGE_COMPLETION_ERROR:",
                completionError,
              );
            }
          },
      });

    return NextResponse.json(
      response,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo completar la subida.";

    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }
}
