import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = {
  'carpe-diem-black-edition-drop-01': [
    { view: 'FRONT', url: '/ropa/productos/carpe-diem-black-edition-drop-01/front.webp', sortOrder: 0 },
    { view: 'BACK', url: '/ropa/productos/carpe-diem-black-edition-drop-01/back.webp', sortOrder: 1 },
    { view: 'DETAIL', url: '/ropa/productos/carpe-diem-black-edition-drop-01/detail.webp', sortOrder: 2 },
    { view: 'LIFESTYLE', url: '/ropa/productos/carpe-diem-black-edition-drop-01/lifestyle.webp', sortOrder: 3 },
  ],
  'carpe-diem-hombre-azul-ford-e150-drop-01': [
    { view: 'FRONT', url: '/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/front.webp', sortOrder: 0 },
    { view: 'BACK', url: '/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/back.webp', sortOrder: 1 },
    { view: 'DETAIL', url: '/ropa/aprobadas/hombre/camiseta-azul-ford/etiqueta-v3.webp', sortOrder: 2 },
    { view: 'LIFESTYLE', url: '/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/lifestyle.webp', sortOrder: 3 },
  ],
  'carpe-diem-mujer-negra-drop-01': [
    { view: 'FRONT', url: '/ropa/productos/carpe-diem-mujer-negra-drop-01/front.webp', sortOrder: 0 },
    { view: 'BACK', url: '/ropa/productos/carpe-diem-mujer-negra-drop-01/back.webp', sortOrder: 1 },
    { view: 'DETAIL', url: '/ropa/productos/carpe-diem-mujer-negra-drop-01/detail.webp', sortOrder: 2 },
    { view: 'LIFESTYLE', url: '/ropa/aprobadas/mujer/camiseta-negra/lifestyle-v2.webp', sortOrder: 3 },
  ],
  'carpe-diem-mujer-azul-ford-e150-drop-01': [
    { view: 'FRONT', url: '/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/front.webp', sortOrder: 0 },
    { view: 'BACK', url: '/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/back.webp', sortOrder: 1 },
    { view: 'DETAIL', url: '/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta-v3.webp', sortOrder: 2 },
    { view: 'LIFESTYLE', url: '/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/lifestyle.webp', sortOrder: 3 },
  ],
  'bomber-hombre-negra-drop-01': [
    { view: 'FRONT', url: '/ropa/productos/bomber-hombre-negra-drop-01/front.webp', sortOrder: 0 },
    { view: 'BACK', url: '/ropa/productos/bomber-hombre-negra-drop-01/back.webp', sortOrder: 1 },
    { view: 'DETAIL', url: '/ropa/productos/bomber-hombre-negra-drop-01/detail.webp', sortOrder: 2 },
    { view: 'LIFESTYLE', url: '/ropa/productos/bomber-hombre-negra-drop-01/lifestyle.webp', sortOrder: 3 },
  ],
  'bomber-hombre-azul-ford-e150-drop-01': [
    { view: 'FRONT', url: '/ropa/productos/bomber-hombre-azul-ford-e150-drop-01/front.webp', sortOrder: 0 },
    { view: 'BACK', url: '/ropa/productos/bomber-hombre-azul-ford-e150-drop-01/back.webp', sortOrder: 1 },
    { view: 'DETAIL', url: '/ropa/productos/bomber-hombre-azul-ford-e150-drop-01/detail.webp', sortOrder: 2 },
    { view: 'LIFESTYLE', url: '/ropa/productos/bomber-hombre-azul-ford-e150-drop-01/lifestyle-v2.webp', sortOrder: 3 },
  ],
  'bomber-mujer-negra-drop-01': [
    { view: 'FRONT', url: '/ropa/productos/bomber-mujer-negra-drop-01/front.webp', sortOrder: 0 },
    { view: 'BACK', url: '/ropa/productos/bomber-mujer-negra-drop-01/back.webp', sortOrder: 1 },
    { view: 'DETAIL', url: '/ropa/productos/bomber-mujer-negra-drop-01/detail.webp', sortOrder: 2 },
    { view: 'LIFESTYLE', url: '/ropa/productos/bomber-mujer-negra-drop-01/lifestyle.webp', sortOrder: 3 },
  ],
  'bomber-mujer-azul-ford-e150-drop-01': [
    { view: 'FRONT', url: '/ropa/productos/bomber-mujer-azul-ford-e150-drop-01/front.webp', sortOrder: 0 },
    { view: 'BACK', url: '/ropa/productos/bomber-mujer-azul-ford-e150-drop-01/back.webp', sortOrder: 1 },
    { view: 'DETAIL', url: '/ropa/productos/bomber-mujer-azul-ford-e150-drop-01/detail.webp', sortOrder: 2 },
    { view: 'LIFESTYLE', url: '/ropa/productos/bomber-mujer-azul-ford-e150-drop-01/lifestyle.webp', sortOrder: 3 },
  ],
};

try {
  for (const [slug, images] of Object.entries(products)) {
    const product = await prisma.product.findUnique({ where: { slug }, select: { id: true, name: true } });
    if (!product) { console.warn(`Producto no encontrado: ${slug}`); continue; }
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({ data: images.map((image) => ({ ...image, productId: product.id, alt: `${product.name} · ${image.view.toLowerCase()}` })) });
    console.log(`Imágenes asignadas: ${product.name}`);
  }
} finally {
  await prisma.$disconnect();
}