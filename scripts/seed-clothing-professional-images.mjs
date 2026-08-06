import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const manifest = {
  "carpe-diem-black-edition-drop-01": {
    "FRONT": "/ropa/productos/carpe-diem-black-edition-drop-01/front.webp",
    "BACK": "/ropa/productos/carpe-diem-black-edition-drop-01/back.webp",
    "DETAIL": "/ropa/productos/carpe-diem-black-edition-drop-01/detail.webp",
    "LIFESTYLE": "/ropa/productos/carpe-diem-black-edition-drop-01/lifestyle.webp"
  },
  "bomber-hombre-negra-drop-01": {
    "FRONT": "/ropa/productos/bomber-hombre-negra-drop-01/front.webp",
    "BACK": "/ropa/productos/bomber-hombre-negra-drop-01/back.webp",
    "DETAIL": "/ropa/productos/bomber-hombre-negra-drop-01/detail.webp",
    "LIFESTYLE": "/ropa/productos/bomber-hombre-negra-drop-01/lifestyle.webp"
  },
  "carpe-diem-hombre-azul-ford-e150-drop-01": {
    "FRONT": "/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/front.webp",
    "BACK": "/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/back.webp",
    "DETAIL": "/ropa/aprobadas/hombre/camiseta-azul-ford/etiqueta-v3.webp",
    "LIFESTYLE": "/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/lifestyle.webp"
  },
  "bomber-hombre-azul-ford-e150-drop-01": {
    "FRONT": "/ropa/productos/bomber-hombre-azul-ford-e150-drop-01/front.webp",
    "BACK": "/ropa/productos/bomber-hombre-azul-ford-e150-drop-01/back.webp",
    "DETAIL": "/ropa/productos/bomber-hombre-azul-ford-e150-drop-01/detail.webp",
    "LIFESTYLE": "/ropa/productos/bomber-hombre-azul-ford-e150-drop-01/lifestyle-v2.webp"
  },
  "bomber-mujer-negra-drop-01": {
    "FRONT": "/ropa/productos/bomber-mujer-negra-drop-01/front.webp",
    "BACK": "/ropa/productos/bomber-mujer-negra-drop-01/back.webp",
    "DETAIL": "/ropa/productos/bomber-mujer-negra-drop-01/detail.webp",
    "LIFESTYLE": "/ropa/productos/bomber-mujer-negra-drop-01/lifestyle.webp"
  },
  "carpe-diem-mujer-azul-ford-e150-drop-01": {
    "FRONT": "/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/front.webp",
    "BACK": "/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/back.webp",
    "DETAIL": "/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta-v3.webp",
    "LIFESTYLE": "/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/lifestyle.webp"
  },
  "carpe-diem-mujer-negra-drop-01": {
    "FRONT": "/ropa/productos/carpe-diem-mujer-negra-drop-01/front.webp",
    "BACK": "/ropa/productos/carpe-diem-mujer-negra-drop-01/back.webp",
    "DETAIL": "/ropa/productos/carpe-diem-mujer-negra-drop-01/detail.webp",
    "LIFESTYLE": "/ropa/aprobadas/mujer/camiseta-negra/lifestyle-v2.webp"
  },
  "bomber-mujer-azul-ford-e150-drop-01": {
    "FRONT": "/ropa/productos/bomber-mujer-azul-ford-e150-drop-01/front.webp",
    "BACK": "/ropa/productos/bomber-mujer-azul-ford-e150-drop-01/back.webp",
    "DETAIL": "/ropa/productos/bomber-mujer-azul-ford-e150-drop-01/detail.webp",
    "LIFESTYLE": "/ropa/productos/bomber-mujer-azul-ford-e150-drop-01/lifestyle.webp"
  }
};

const sortOrder = {
  FRONT: 0,
  BACK: 1,
  DETAIL: 2,
  LIFESTYLE: 3,
};

try {
  for (const [slug, images] of Object.entries(manifest)) {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!product) {
      console.warn(`Producto no encontrado: ${slug}`);
      continue;
    }

    for (const [view, url] of Object.entries(images)) {
      const existingImage = await prisma.productImage.findFirst({
        where: {
          productId: product.id,
          view,
        },
        select: {
          id: true,
        },
      });

      const imageData = {
        url,
        alt: `${product.name} · ${view.toLowerCase()}`,
        sortOrder: sortOrder[view],
      };

      if (existingImage) {
        await prisma.productImage.update({
          where: {
            id: existingImage.id,
          },
          data: imageData,
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            view,
            ...imageData,
          },
        });
      }
    }

    console.log(`Imágenes profesionales asignadas: ${product.name}`);
  }
} finally {
  await prisma.$disconnect();
}
