type ProductTextSource = {
  slug: string;
  name: string;
  subtitle: string | null;
  collection: string | null;
  color: string | null;
  material: string | null;
};

type ProductText = Omit<ProductTextSource, "slug">;

const ENGLISH_PRODUCT_TEXT: Record<string, ProductText> = {
  "carpe-diem-black-edition-drop-01": {
    name: "CARPE DIEM T-shirt · Men · Black",
    subtitle: "Black Edition · Drop 01",
    collection: "CARPE DIEM · Drop 01",
    color: "Black",
    material: "Premium combed cotton · 220–240 gsm",
  },
  "carpe-diem-hombre-azul-ford-e150-drop-01": {
    name: "CARPE DIEM T-shirt · Men · Ford E-150 Blue",
    subtitle: "Ford E-150 Edition · Drop 01",
    collection: "CARPE DIEM · Drop 01",
    color: "Ford E-150 blue",
    material: "Premium combed cotton · 220–240 gsm",
  },
  "carpe-diem-mujer-negra-drop-01": {
    name: "CARPE DIEM T-shirt · Women · Black",
    subtitle: "Black Edition · Drop 01",
    collection: "CARPE DIEM · Drop 01",
    color: "Black",
    material: "Premium combed cotton · 200–220 gsm",
  },
  "carpe-diem-mujer-azul-ford-e150-drop-01": {
    name: "CARPE DIEM T-shirt · Women · Ford E-150 Blue",
    subtitle: "Ford E-150 Edition · Drop 01",
    collection: "CARPE DIEM · Drop 01",
    color: "Ford E-150 blue",
    material: "Premium combed cotton · 200–220 gsm",
  },
  "bomber-hombre-negra-drop-01": {
    name: "VANMOTION Bomber · Men · Black",
    subtitle: "Launch Edition · Drop 01",
    collection: "VANMOTION Bomber · Drop 01",
    color: "Satin black",
    material: "Premium mid-season nylon · 135–145 gsm",
  },
  "bomber-hombre-azul-ford-e150-drop-01": {
    name: "VANMOTION Bomber · Men · Ford E-150 Blue",
    subtitle: "Launch Edition · Drop 01",
    collection: "VANMOTION Bomber · Drop 01",
    color: "Ford E-150 blue",
    material: "Premium mid-season nylon · 135–145 gsm",
  },
  "bomber-mujer-negra-drop-01": {
    name: "VANMOTION Bomber · Women · Black",
    subtitle: "Launch Edition · Drop 01",
    collection: "VANMOTION Bomber · Drop 01",
    color: "Satin black",
    material: "Premium mid-season nylon · 135–145 gsm",
  },
  "bomber-mujer-azul-ford-e150-drop-01": {
    name: "VANMOTION Bomber · Women · Ford E-150 Blue",
    subtitle: "Launch Edition · Drop 01",
    collection: "VANMOTION Bomber · Drop 01",
    color: "Ford E-150 blue",
    material: "Premium mid-season nylon · 135–145 gsm",
  },

  "cargo-utility-hombre-antracita-drop-01": {
    name: "Utility Cargo · Men · Washed Anthracite",
    subtitle: "Utility Edition · Drop 01",
    collection: "VANMOTION Utility · Drop 01",
    color: "Washed anthracite",
    material: "Premium washed cotton · heavyweight utility fabric",
  },
  "cargo-utility-mujer-antracita-drop-01": {
    name: "Utility Cargo · Women · Washed Anthracite",
    subtitle: "Utility Edition · Drop 01",
    collection: "VANMOTION Utility · Drop 01",
    color: "Washed anthracite",
    material: "Premium washed cotton · heavyweight utility fabric",
  },
  "crewneck-unisex-antracita-drop-01": {
    name: "Utility Crewneck · Unisex · Washed Anthracite",
    subtitle: "Utility Edition · Drop 01",
    collection: "VANMOTION Utility · Drop 01",
    color: "Washed anthracite",
    material: "Premium washed cotton · heavyweight fleece",
  },
};

export function getLocalizedProductText(
  product: ProductTextSource,
  language: "es" | "en",
): ProductText {
  if (language === "en") {
    const translation = ENGLISH_PRODUCT_TEXT[product.slug];

    if (translation) {
      return translation;
    }
  }

  return {
    name: product.name,
    subtitle: product.subtitle,
    collection: product.collection,
    color: product.color,
    material: product.material,
  };
}
