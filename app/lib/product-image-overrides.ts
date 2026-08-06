type ProductImageOverride = {
  slug: string;
  view: string;
  replacementUrl: string;
  legacyUrls: readonly string[];
};

const PRODUCT_IMAGE_OVERRIDES: readonly ProductImageOverride[] = [
  {
    slug: "carpe-diem-hombre-azul-ford-e150-drop-01",
    view: "DETAIL",
    replacementUrl:
      "/ropa/aprobadas/hombre/camiseta-azul-ford/etiqueta-v3.webp",
    legacyUrls: [
      "/ropa/aprobadas/hombre/camiseta-azul-ford/etiqueta.webp",
      "/ropa/aprobadas/hombre/camiseta-azul-ford/etiqueta-v2.webp",
      "/ropa/productos/carpe-diem-hombre-azul-ford-e150-drop-01/detail.webp",
    ],
  },
  {
    slug: "carpe-diem-mujer-azul-ford-e150-drop-01",
    view: "DETAIL",
    replacementUrl:
      "/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta-v3.webp",
    legacyUrls: [
      "/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta.webp",
      "/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta-v2.png",
      "/ropa/productos/carpe-diem-mujer-azul-ford-e150-drop-01/detail.webp",
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
