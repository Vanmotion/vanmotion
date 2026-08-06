type ProductImageOverride = {
  slug: string;
  view: string;
  replacementUrl: string;
  legacyUrls: readonly string[];
};

const PRODUCT_IMAGE_OVERRIDES: readonly ProductImageOverride[] = [
  {
    slug: "carpe-diem-black-edition-drop-01",
    view: "FRONT",
    replacementUrl: "/ropa/aprobadas/hombre/camiseta-negra/frontal-v2.webp",
    legacyUrls: [
      "/ropa/aprobadas/hombre/camiseta-negra/frontal.webp",
      "/ropa/aprobadas/hombre/camiseta-negra/frontal-v2.webp",
      "/ropa/aprobadas/hombre/camiseta-negra/frontal-v3.webp",
      "/ropa/productos/carpe-diem-black-edition-drop-01/front.webp",
      "/ropa/productos/carpe-diem-black-edition-drop-01/front.png",
      "/ropa/carpe-diem-frontal.webp",
    ],
  },
  {
    slug: "carpe-diem-hombre-azul-ford-e150-drop-01",
    view: "LIFESTYLE",
    replacementUrl: "/ropa/aprobadas/hombre/camiseta-azul-ford/lifestyle-v10.webp",
    legacyUrls: [
      "/ropa/aprobadas/hombre/camiseta-azul-ford/lifestyle.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/lifestyle-v2.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/lifestyle-v3.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/lifestyle-v9.webp",
      "/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/lifestyle.webp",
      "/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/lifestyle.png",
    ],
  },
  {
    slug: "carpe-diem-hombre-azul-ford-e150-drop-01",
    view: "FRONT",
    replacementUrl: "/ropa/aprobadas/hombre/camiseta-azul-ford/frontal-v10.webp",
    legacyUrls: [
      "/ropa/aprobadas/hombre/camiseta-azul-ford/frontal.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/frontal-v2.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/frontal-v3.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/frontal-v9.webp",
      "/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/front.webp",
      "/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/front.png",
    ],
  },
  {
    slug: "carpe-diem-hombre-azul-ford-e150-drop-01",
    view: "BACK",
    replacementUrl: "/ropa/aprobadas/hombre/camiseta-azul-ford/trasera-v2.webp",
    legacyUrls: [
      "/ropa/aprobadas/hombre/camiseta-azul-ford/trasera-v10.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/trasera.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/trasera-v2.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/trasera-v3.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/trasera-v9.webp",
      "/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/back.webp",
      "/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/back.png",
    ],
  },
  {
    slug: "carpe-diem-hombre-azul-ford-e150-drop-01",
    view: "DETAIL",
    replacementUrl: "/ropa/aprobadas/hombre/camiseta-azul-ford/etiqueta-v10.webp",
    legacyUrls: [
      "/ropa/aprobadas/hombre/camiseta-azul-ford/etiqueta.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/etiqueta-v2.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/etiqueta-v2.png",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/etiqueta-v3.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/etiqueta-v9.webp",
      "/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/detail.webp",
      "/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/detail.png",
    ],
  },
  {
    slug: "carpe-diem-mujer-azul-ford-e150-drop-01",
    view: "LIFESTYLE",
    replacementUrl: "/ropa/aprobadas/mujer/camiseta-azul-ford/lifestyle-v10.webp",
    legacyUrls: [
      "/ropa/aprobadas/mujer/camiseta-azul-ford/lifestyle.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/lifestyle-v2.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/lifestyle-v3.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/lifestyle-v9.webp",
      "/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/lifestyle.webp",
      "/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/lifestyle.png",
    ],
  },
  {
    slug: "carpe-diem-mujer-azul-ford-e150-drop-01",
    view: "FRONT",
    replacementUrl: "/ropa/aprobadas/mujer/camiseta-azul-ford/frontal-v10.webp",
    legacyUrls: [
      "/ropa/aprobadas/mujer/camiseta-azul-ford/frontal.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/frontal-v2.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/frontal-v3.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/frontal-v9.webp",
      "/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/front.webp",
      "/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/front.png",
    ],
  },
  {
    slug: "carpe-diem-mujer-azul-ford-e150-drop-01",
    view: "BACK",
    replacementUrl: "/ropa/aprobadas/mujer/camiseta-azul-ford/trasera-v10.webp",
    legacyUrls: [
      "/ropa/aprobadas/mujer/camiseta-azul-ford/trasera.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/trasera-v2.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/trasera-v3.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/trasera-v9.webp",
      "/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/back.webp",
      "/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/back.png",
    ],
  },
  {
    slug: "carpe-diem-mujer-azul-ford-e150-drop-01",
    view: "DETAIL",
    replacementUrl: "/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta-v10.webp",
    legacyUrls: [
      "/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta-v2.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta-v2.png",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta-v3.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta-v9.webp",
      "/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/detail.webp",
      "/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/detail.png",
    ],
  },
  {
    slug: "carpe-diem-mujer-negra-drop-01",
    view: "LIFESTYLE",
    replacementUrl:
      "/ropa/aprobadas/mujer/camiseta-negra/lifestyle-v2.webp",
    legacyUrls: [
      "/ropa/aprobadas/mujer/camiseta-negra/lifestyle.webp",
      "/ropa/productos/carpe-diem-mujer-negra-drop-01/lifestyle.webp",
    ],
  },
  {
    slug: "bomber-hombre-azul-ford-e150-drop-01",
    view: "LIFESTYLE",
    replacementUrl:
      "/ropa/productos/bomber-hombre-azul-ford-e150-drop-01/lifestyle-v2.webp",
    legacyUrls: [
      "/ropa/productos/bomber-hombre-azul-ford-e150-drop-01/lifestyle.webp",
      "/ropa/productos/bomber-hombre-azul-ford-e150-drop-01/lifestyle.png",
    ],
  },
] as const;

export function resolveProductImageUrl(
  productSlug: string,
  view: string | null,
  imageUrl: string,
): string {
  const override = PRODUCT_IMAGE_OVERRIDES.find(
    (candidate) =>
      candidate.slug === productSlug &&
      candidate.view === view &&
      candidate.legacyUrls.includes(imageUrl),
  );

  return override?.replacementUrl ?? imageUrl;
}
