import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { NextResponse } from "next/server";

import { sendOrderEmails } from "@/app/lib/order-email";
import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/app/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripeObjectId(
  value: unknown,
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "id" in value
  ) {
    const id = (
      value as {
        id?: unknown;
      }
    ).id;

    return typeof id === "string"
      ? id
      : null;
  }

  return null;
}

async function registerPaidOrder(
  sessionFromEvent: Stripe.Checkout.Session,
) {
  /*
   * Recuperamos la sesión actualizada directamente
   * desde Stripe antes de registrar el pedido.
   */
  const session =
    await stripe.checkout.sessions.retrieve(
      sessionFromEvent.id,
    );

  /*
   * Algunos métodos de pago necesitan más tiempo.
   * En ese caso Stripe enviará posteriormente
   * checkout.session.async_payment_succeeded.
   */
  if (session.payment_status === "unpaid") {
    return {
      processed: false,
      reason: "payment_pending",
    };
  }

  const metadata =
    session.metadata ?? {};

  const productId =
    metadata.productId?.trim();

  const productSlug =
    metadata.productSlug?.trim();

  const productName =
    metadata.productName?.trim();

  const variantId =
    metadata.variantId?.trim();

  const size =
    metadata.size?.trim();

  const quantity =
    Number(metadata.quantity);

  if (
    !productId ||
    !productSlug ||
    !productName ||
    !variantId ||
    !size ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    throw new Error(
      `La sesión ${session.id} no contiene metadatos válidos.`,
    );
  }

  const amountTotal =
    session.amount_total;

  const currency =
    session.currency;

  if (
    amountTotal === null ||
    !currency
  ) {
    throw new Error(
      `La sesión ${session.id} no contiene un importe válido.`,
    );
  }

  const shipping =
    session.collected_information
      ?.shipping_details;

  const shippingAddress =
    shipping?.address;

  const customerDetails =
    session.customer_details;

  const result =
    await prisma.$transaction(
      async (transaction) => {
        /*
         * Stripe puede reenviar el mismo evento.
         * Esta comprobación impide registrar o
         * descontar dos veces el mismo pedido.
         */
        const existingOrder =
          await transaction.order.findUnique({
            where: {
              stripeCheckoutSessionId:
                session.id,
            },

            select: {
              id: true,
            },
          });

        if (existingOrder) {
          return {
            duplicate: true,
            stockUpdated: false,
            orderId:
              existingOrder.id,
          };
        }

        /*
         * Descontamos únicamente si la variante
         * existe, está activa y tiene stock.
         */
        const stockResult =
          await transaction.productVariant
            .updateMany({
              where: {
                id: variantId,
                productId,
                size,
                active: true,

                stock: {
                  gte: quantity,
                },
              },

              data: {
                stock: {
                  decrement: quantity,
                },
              },
            });

        const stockUpdated =
          stockResult.count === 1;

        /*
         * Aunque exista un problema de stock
         * después del pago, registramos el pedido
         * para no perderlo.
         */
        const order =
          await transaction.order.create({
            data: {
              stripeCheckoutSessionId:
                session.id,

              stripePaymentIntentId:
                getStripeObjectId(
                  session.payment_intent,
                ),

              stripeCustomerId:
                getStripeObjectId(
                  session.customer,
                ),

              paymentStatus:
                session.payment_status,

              fulfillmentStatus:
                stockUpdated
                  ? "PENDING"
                  : "REVIEW_REQUIRED",

              amountTotal,

              currency:
                currency.toLowerCase(),

              customerEmail:
                customerDetails?.email ??
                null,

              customerName:
                customerDetails?.name ??
                shipping?.name ??
                null,

              customerPhone:
                customerDetails?.phone ??
                null,

              shippingName:
                shipping?.name ??
                null,

              shippingLine1:
                shippingAddress?.line1 ??
                null,

              shippingLine2:
                shippingAddress?.line2 ??
                null,

              shippingPostalCode:
                shippingAddress
                  ?.postal_code ??
                null,

              shippingCity:
                shippingAddress?.city ??
                null,

              shippingState:
                shippingAddress?.state ??
                null,

              shippingCountry:
                shippingAddress?.country ??
                null,

              productId,
              productSlug,
              productName,

              variantId,

              sku:
                metadata.sku?.trim() ||
                null,

              size,
              quantity,
            },
          });

        return {
          duplicate: false,
          stockUpdated,
          orderId: order.id,
        };
      },
    );

  console.log(
    "VANMOTION_STRIPE_ORDER_REGISTERED:",
    {
      checkoutSessionId:
        session.id,

      orderId:
        result.orderId,

      duplicate:
        result.duplicate,

      stockUpdated:
        result.stockUpdated,
    },
  );

  /*
   * El correo se envía únicamente cuando el pedido
   * acaba de crearse. De esta forma, si Stripe repite
   * el webhook, el cliente no recibe duplicados.
   */
  if (!result.duplicate) {
    try {
      await sendOrderEmails({
        orderId:
          result.orderId,

        checkoutSessionId:
          session.id,

        productName,
        size,
        quantity,

        amountTotal,
        currency,

        customerEmail:
          customerDetails?.email ??
          null,

        customerName:
          customerDetails?.name ??
          shipping?.name ??
          null,

        shippingName:
          shipping?.name ??
          null,

        shippingLine1:
          shippingAddress?.line1 ??
          null,

        shippingLine2:
          shippingAddress?.line2 ??
          null,

        shippingPostalCode:
          shippingAddress?.postal_code ??
          null,

        shippingCity:
          shippingAddress?.city ??
          null,

        shippingState:
          shippingAddress?.state ??
          null,

        shippingCountry:
          shippingAddress?.country ??
          null,

        stockUpdated:
          result.stockUpdated,
      });
    } catch (emailError) {
      /*
       * Un problema de correo no debe provocar que
       * Stripe repita el pago, el registro del pedido
       * o el descuento de stock.
       */
      console.error(
        "VANMOTION_ORDER_EMAIL_ERROR:",
        emailError instanceof Error
          ? emailError.message
          : emailError,
      );
    }
  }

  return {
    processed: true,
    ...result,
  };
}

export async function POST(
  request: Request,
) {
  const webhookSecret =
    process.env
      .STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "Falta STRIPE_WEBHOOK_SECRET.",
    );

    return NextResponse.json(
      {
        error:
          "El webhook de Stripe no está configurado.",
      },
      {
        status: 500,
      },
    );
  }

  const signature =
    request.headers.get(
      "stripe-signature",
    );

  if (!signature) {
    return NextResponse.json(
      {
        error:
          "Falta la firma de Stripe.",
      },
      {
        status: 400,
      },
    );
  }

  const rawBody =
    await request.text();

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
  } catch (error) {
    console.error(
      "VANMOTION_STRIPE_SIGNATURE_ERROR:",
      error instanceof Error
        ? error.message
        : error,
    );

    return NextResponse.json(
      {
        error:
          "La firma del webhook no es válida.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        await registerPaidOrder(
          session,
        );

        break;
      }

      default:
        break;
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    /*
     * La restricción única de la base de datos
     * protege frente a dos entregas simultáneas
     * del mismo evento.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({
        received: true,
        duplicate: true,
      });
    }

    console.error(
      "VANMOTION_STRIPE_WEBHOOK_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "No se ha podido procesar el evento de Stripe.",
      },
      {
        status: 500,
      },
    );
  }
}