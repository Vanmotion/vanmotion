import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

const LOCAL_DATABASE_URL =
  "postgresql://jose@localhost:5432/vanmotion";

/**
 * Este seed solo puede ejecutarse contra la base
 * PostgreSQL local llamada "vanmotion".
 *
 * Si alguien intenta usar una conexión remota o de
 * producción, el proceso se detendrá automáticamente.
 */
function validateLocalDatabaseUrl(
  value: string,
): string {
  let databaseUrl: URL;

  try {
    databaseUrl = new URL(value);
  } catch {
    throw new Error(
      "La dirección de la base de datos local no es válida.",
    );
  }

  const allowedProtocols = new Set([
    "postgresql:",
    "postgres:",
  ]);

  const allowedHosts = new Set([
    "localhost",
    "127.0.0.1",
    "::1",
    "[::1]",
  ]);

  const databaseName =
    decodeURIComponent(
      databaseUrl.pathname,
    )
      .replace(/^\/+/, "")
      .split("/")[0];

  if (
    !allowedProtocols.has(
      databaseUrl.protocol,
    )
  ) {
    throw new Error(
      "El seed solo admite una base de datos PostgreSQL.",
    );
  }

  if (
    !allowedHosts.has(
      databaseUrl.hostname,
    )
  ) {
    throw new Error(
      "Seguridad VANMOTION: el seed solo puede ejecutarse en localhost.",
    );
  }

  if (databaseName !== "vanmotion") {
    throw new Error(
      'Seguridad VANMOTION: la base local debe llamarse "vanmotion".',
    );
  }

  return value;
}

const databaseUrl =
  validateLocalDatabaseUrl(
    process.env.DATABASE_URL?.trim() ||
      LOCAL_DATABASE_URL,
  );

const prisma =
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log: ["error"],
  });

const musicTracks = [
  {
    slug: "cero-dramas",
    title: "Cero Dramas",
    subtitle: "VANMOTION",
    fileUrl:
      "/music/cero-dramas.mp3",
    coverUrl:
      "/music/covers/cero-dramas.webp",
    sortOrder: 0,
  },
  {
    slug: "solo-en-mi-mente",
    title: "Solo en mi mente",
    subtitle: "VANMOTION",
    fileUrl:
      "/music/solo-en-mi-mente.mp3",
    coverUrl:
      "/uploads/music-covers/solo-en-mi-mente-1784377787037.png",
    sortOrder: 1,
  },
  {
    slug: "suenos-prestados",
    title: "Sueños Prestados",
    subtitle: "VANMOTION",
    fileUrl:
      "/music/suenos-prestados.mp3",
    coverUrl:
      "/uploads/music-covers/suenos-prestados-1784376509559.png",
    sortOrder: 2,
  },
  {
    slug: "the-cool-ashtray",
    title: "The Cool Ashtray",
    subtitle: "VANMOTION",
    fileUrl:
      "/music/the-cool-ashtray.mp3",
    coverUrl:
      "/uploads/music-covers/the-cool-ashtray-1784373940751.png",
    sortOrder: 3,
  },
  {
    slug: "vanmotion",
    title: "VANMOTION",
    subtitle: "Tema oficial",
    fileUrl:
      "/music/vanmotion.mp3",
    coverUrl:
      "/uploads/music-covers/vanmotion-1784378515490.png",
    sortOrder: 4,
  },
  {
    slug: "volvere-por-ti",
    title: "Volveré por ti",
    subtitle: "Producido por VANMOTION",
    fileUrl:
      "/music/volvere-por-ti.mp3",
    coverUrl:
      "/music/covers/volvere-por-ti.webp",
    sortOrder: 5,
  },
] as const;

async function seedSettings() {
  await prisma.siteSettings.upsert({
    where: {
      id: "main",
    },

    update: {
      businessName: "VANMOTION",
      email:
        "contacto@vanmotion.es",
      city:
        "Desde Madrid",
      address:
        "Madrid · España",
      openingHours:
        "Proyecto en desarrollo · Apertura oficial el 1 de septiembre de 2026",
    },

    create: {
      id: "main",
      businessName: "VANMOTION",
      email:
        "contacto@vanmotion.es",
      city:
        "Desde Madrid",
      address:
        "Madrid · España",
      openingHours:
        "Proyecto en desarrollo · Apertura oficial el 1 de septiembre de 2026",
    },
  });
}

async function seedBrands() {
  await prisma.brand.upsert({
    where: {
      slug: "ford",
    },

    update: {
      name: "Ford",
    },

    create: {
      name: "Ford",
      slug: "ford",
    },
  });
}

async function seedMusic() {
  for (const track of musicTracks) {
    await prisma.musicTrack.upsert({
      where: {
        slug: track.slug,
      },

      update: {
        title: track.title,
        subtitle: track.subtitle,
        fileUrl: track.fileUrl,
        coverUrl: track.coverUrl,
        format: "MP3",
        active: true,
        sortOrder:
          track.sortOrder,
      },

      create: {
        slug: track.slug,
        title: track.title,
        subtitle: track.subtitle,
        fileUrl: track.fileUrl,
        coverUrl: track.coverUrl,
        format: "MP3",
        active: true,
        sortOrder:
          track.sortOrder,
      },
    });
  }
}

async function seedClothing() {
  const product =
    await prisma.product.upsert({
      where: {
        slug:
          "carpe-diem-black-edition",
      },

      update: {
        name:
          "CARPE DIEM — Black Edition",
        subtitle:
          "Drop 01",
        collection:
          "CARPE DIEM · Black Edition · Drop 01",
        category:
          "CLOTHING",
        productType:
          "TSHIRT",
        description:
          "Camiseta negra VANMOTION con diseño CARPE DIEM situado en la zona inferior derecha de la espalda.",
        descriptionEn:
          "Black VANMOTION T-shirt featuring the CARPE DIEM design on the lower-right area of the back.",
        material:
          "Algodón",
        color:
          "Negro",
        price:
          new Prisma.Decimal(
            "34.90",
          ),
        currency:
          "EUR",
        status:
          "AVAILABLE",
        featured:
          true,
        active:
          true,
        sortOrder:
          0,
      },

      create: {
        slug:
          "carpe-diem-black-edition",
        name:
          "CARPE DIEM — Black Edition",
        subtitle:
          "Drop 01",
        collection:
          "CARPE DIEM · Black Edition · Drop 01",
        category:
          "CLOTHING",
        productType:
          "TSHIRT",
        description:
          "Camiseta negra VANMOTION con diseño CARPE DIEM situado en la zona inferior derecha de la espalda.",
        descriptionEn:
          "Black VANMOTION T-shirt featuring the CARPE DIEM design on the lower-right area of the back.",
        material:
          "Algodón",
        color:
          "Negro",
        price:
          new Prisma.Decimal(
            "34.90",
          ),
        currency:
          "EUR",
        status:
          "AVAILABLE",
        featured:
          true,
        active:
          true,
        sortOrder:
          0,
      },
    });

  /*
   * La base es exclusivamente local.
   * Recreamos tallas e imágenes para que repetir
   * el seed siempre produzca el mismo resultado.
   */
  await prisma.productVariant.deleteMany({
    where: {
      productId:
        product.id,
    },
  });

  await prisma.productImage.deleteMany({
    where: {
      productId:
        product.id,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId:
          product.id,
        size: "S",
        sku:
          "VM-CD-D01-S",
        stock: 5,
        active: true,
        sortOrder: 0,
      },
      {
        productId:
          product.id,
        size: "M",
        sku:
          "VM-CD-D01-M",
        stock: 5,
        active: true,
        sortOrder: 1,
      },
      {
        productId:
          product.id,
        size: "L",
        sku:
          "VM-CD-D01-L",
        stock: 5,
        active: true,
        sortOrder: 2,
      },
      {
        productId:
          product.id,
        size: "XL",
        sku:
          "VM-CD-D01-XL",
        stock: 5,
        active: true,
        sortOrder: 3,
      },
    ],
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId:
          product.id,
        url:
          "/ropa/carpe-diem-frontal.webp",
        alt:
          "Camiseta CARPE DIEM Black Edition, vista frontal",
        view:
          "FRONT",
        sortOrder:
          0,
      },
      {
        productId:
          product.id,
        url:
          "/ropa/carpe-diem-trasera.webp",
        alt:
          "Camiseta CARPE DIEM Black Edition, vista trasera",
        view:
          "BACK",
        sortOrder:
          1,
      },
      {
        productId:
          product.id,
        url:
          "/ropa/carpe-diem-diseno.webp",
        alt:
          "Detalle del diseño CARPE DIEM",
        view:
          "DETAIL",
        sortOrder:
          2,
      },
      {
        productId:
          product.id,
        url:
          "/ropa/carpe-diem-black-edition.webp",
        alt:
          "CARPE DIEM Black Edition · Drop 01",
        view:
          "LIFESTYLE",
        sortOrder:
          3,
      },
    ],
  });
}

async function main() {
  console.log(
    "VANMOTION_LOCAL_SEED_START",
  );

  await seedSettings();
  await seedBrands();
  await seedMusic();
  await seedClothing();

  const [
    musicCount,
    productCount,
    variantCount,
  ] =
    await Promise.all([
      prisma.musicTrack.count(),
      prisma.product.count(),
      prisma.productVariant.count(),
    ]);

  console.log(
    "VANMOTION_LOCAL_SEED_COMPLETE:",
    {
      database:
        "localhost/vanmotion",
      musicTracks:
        musicCount,
      products:
        productCount,
      variants:
        variantCount,
    },
  );
}

main()
  .catch((error: unknown) => {
    console.error(
      "VANMOTION_LOCAL_SEED_ERROR:",
      error instanceof Error
        ? error.message
        : error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });