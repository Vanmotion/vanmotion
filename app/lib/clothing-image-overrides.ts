const CLOTHING_IMAGE_OVERRIDES: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "carpe-diem-black-edition-drop-01": {
    FRONT: "/ropa/aprobadas/hombre/camiseta-negra/frontal-v12.webp",
  },
  "carpe-diem-hombre-azul-ford-e150-drop-01": {
    LIFESTYLE: "/ropa/aprobadas/hombre/camiseta-azul-ford/lifestyle-v2.webp",
    FRONT: "/ropa/aprobadas/hombre/camiseta-azul-ford/frontal-v3.webp",
    BACK: "/ropa/aprobadas/hombre/camiseta-azul-ford/trasera-v11.webp",
    DETAIL: "/ropa/aprobadas/hombre/camiseta-azul-ford/etiqueta-v4.webp",
  },
  "carpe-diem-mujer-negra-drop-01": {
    LIFESTYLE: "/ropa/aprobadas/mujer/camiseta-negra/lifestyle-v3.webp",
    FRONT: "/ropa/aprobadas/mujer/camiseta-negra/frontal-v12.webp",
  },
  "carpe-diem-mujer-azul-ford-e150-drop-01": {
    FRONT: "/ropa/aprobadas/mujer/camiseta-azul-ford/frontal-v3.webp",
    DETAIL: "/ropa/aprobadas/mujer/camiseta-azul-ford/etiqueta-v4.webp",
  },
  "bomber-hombre-azul-ford-e150-drop-01": {
    LIFESTYLE: "/ropa/productos/bomber-hombre-azul-ford-e150-drop-01/lifestyle-v2.webp",
  },

  "bomber-mujer-negra-drop-01": {
    LIFESTYLE: "/ropa/productos/bomber-mujer-negra-drop-01/lifestyle-v2.webp",
  },
  "bomber-mujer-azul-ford-e150-drop-01": {
    LIFESTYLE: "/ropa/productos/bomber-mujer-azul-ford-e150-drop-01/lifestyle-v2.webp",
  },

};

export function resolveClothingImageUrl(
  productSlug: string,
  view: string | null,
  storedUrl: string,
): string {
  if (!view || /^https?:\/\//i.test(storedUrl)) {
    return storedUrl;
  }

  return CLOTHING_IMAGE_OVERRIDES[productSlug]?.[view] ?? storedUrl;
}
