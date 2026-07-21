import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/app/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_SIZES = new Set([
  "S",
  "M",
  "L",
  "XL",
]);

const MAX_QUANTITY = 5;

type CheckoutBody = {
  productSlug?: unknown;
  size?: unknown;
  quantity?: unknown;
};

export async function POST(
  request: NextRequest,
) {
  try {
    const priceId =
      process.env.STRIPE_CARPE_DIEM_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Falta STRIPE_CARPE_DIEM_PRICE_ID en las variables de entorno.",
        },
        { status: 500 },
      );
    }

    let body: CheckoutBody;

    try {
      body =
        (await request.json()) as CheckoutBody;
    } catch {
      return NextResponse.json(
        {
          error:
            "La solicitud enviada no es válida.",
        },
        { status: 400 },
      );
    }

    const productSlug = String(
      body.productSlug ?? "",
    ).trim();

    const size = String(
      body.size ?? "",
    )
      .trim()
      .toUpperCase();

    const quantity = Number(body.quantity);

    if (
      !productSlug ||
      productSlug.length > 150
    ) {
      return NextResponse.json(
        {
          error:
            "No se ha identificado el producto.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_SIZES.has(size)) {
      return NextResponse.json(
        {
          error:
            "Selecciona una talla válida.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    ) {
      return NextResponse.json(
        {
          error:
            `La cantidad debe estar comprendida entre 1 y ${MAX_QUANTITY}.`,
        },
        { status: 400 },
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          slug: productSlug,
        },

        select: {
          id: true,
          slug: true,
          name: true,
          status: true,
          active: true,
          category: true,
          productType: true,
        },
      });

    if (!product || !product.active) {
      return NextResponse.json(
        {
          error:
            "El producto no está disponible.",
        },
        { status: 404 },
      );
    }

    if (
      product.category !== "CLOTHING" ||
      product.productType !== "TSHIRT"
    ) {
      return NextResponse.json(
        {
          error:
            "Este producto no admite este proceso de pago.",
        },
        { status: 400 },
      );
    }

    if (product.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          error:
            "El producto todavía no está disponible para pago.",
        },
        { status: 409 },
      );
    }

    const variant =
      await prisma.productVariant.findUnique({
        where: {
          productId_size: {
            productId: product.id,
            size,
          },
        },

        select: {
          id: true,
          size: true,
          sku: true,
          stock: true,
          active: true,
        },
      });

    if (!variant || !variant.active) {
      return NextResponse.json(
        {
          error:
            "La talla seleccionada no está disponible.",
        },
        { status: 400 },
      );
    }

    if (variant.stock < quantity) {
      return NextResponse.json(
        {
          error:
            variant.stock > 0
              ? `Solo quedan ${variant.stock} unidades de la talla ${size}.`
              : `La talla ${size} está agotada.`,
        },
        { status: 409 },
      );
    }

    const origin =
      request.nextUrl.origin.replace(
        /\/$/,
        "",
      );

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        line_items: [
          {
            price: priceId,
            quantity,
          },
        ],

        metadata: {
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          variantId: variant.id,
          sku: variant.sku,
          size: variant.size,
          quantity: String(quantity),
        },

        client_reference_id:
          `${product.id}:${variant.id}`,

        phone_number_collection: {
          enabled: true,
        },

        shipping_address_collection: {
          allowed_countries: ["ES"],
        },

        success_url:
          `${origin}/ropa?payment=success` +
          `&session_id={CHECKOUT_SESSION_ID}` +
          `#producto`,

        cancel_url:
          `${origin}/ropa?payment=cancelled` +
          `#producto`,
      });

    if (!session.url) {
      return NextResponse.json(
        {
          error:
            "Stripe no ha generado la dirección de pago.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "VANMOTION_STRIPE_CHECKOUT_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "No se ha podido iniciar el proceso de pago.",
      },
      { status: 500 },
    );
  }
}