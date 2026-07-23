import Link from "next/link";

import { prisma } from "@/app/lib/prisma";

import {
  updateOrderFulfillmentStatusAction,
  updateWithdrawalRequestAction,
} from "./actions";

export const dynamic = "force-dynamic";

const paymentStatusLabels: Record<
  string,
  string
> = {
  paid: "Pagado",
  unpaid: "Pendiente",
  no_payment_required:
    "Pago no necesario",
};

const fulfillmentStatusLabels: Record<
  string,
  string
> = {
  PENDING: "Pendiente de preparar",
  PROCESSING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REVIEW_REQUIRED:
    "Revisión necesaria",
};

const fulfillmentStatusOptions = [
  {
    value: "PENDING",
    label: "Pendiente de preparar",
  },
  {
    value: "PROCESSING",
    label: "En preparación",
  },
  {
    value: "SHIPPED",
    label: "Enviado",
  },
  {
    value: "DELIVERED",
    label: "Entregado",
  },
  {
    value: "REVIEW_REQUIRED",
    label: "Revisión necesaria",
  },
  {
    value: "CANCELLED",
    label: "Cancelado",
  },
] as const;

const withdrawalStatusLabels: Record<
  string,
  string
> = {
  RECEIVED: "Recibido",
  UNDER_REVIEW: "En revisión",
  RETURN_RECEIVED:
    "Devolución recibida",
  REFUNDED: "Reembolsado",
  REJECTED: "Rechazado",
};

const withdrawalStatusOptions = [
  {
    value: "RECEIVED",
    label: "Recibido",
  },
  {
    value: "UNDER_REVIEW",
    label: "En revisión",
  },
  {
    value: "RETURN_RECEIVED",
    label: "Devolución recibida",
  },
  {
    value: "REFUNDED",
    label: "Reembolsado",
  },
  {
    value: "REJECTED",
    label: "Rechazado",
  },
] as const;

function formatAmount(
  amount: number,
  currency: string,
): string {
  try {
    return new Intl.NumberFormat(
      "es-ES",
      {
        style: "currency",
        currency:
          currency.toUpperCase(),
      },
    ).format(amount / 100);
  } catch {
    return `${(
      amount / 100
    ).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "es-ES",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Madrid",
    },
  ).format(date);
}

function getPaymentStatusClass(
  status: string,
): string {
  if (status === "paid") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

function getFulfillmentStatusClass(
  status: string,
): string {
  if (status === "DELIVERED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "SHIPPED") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  if (status === "PROCESSING") {
    return "border-violet-500/30 bg-violet-500/10 text-violet-300";
  }

  if (
    status === "REVIEW_REQUIRED" ||
    status === "CANCELLED"
  ) {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

function getWithdrawalStatusClass(
  status: string,
): string {
  if (status === "REFUNDED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "RETURN_RECEIVED") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  if (status === "UNDER_REVIEW") {
    return "border-violet-500/30 bg-violet-500/10 text-violet-300";
  }

  if (status === "REJECTED") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

function getShippingAddress(
  order: {
    shippingName: string | null;
    shippingLine1: string | null;
    shippingLine2: string | null;
    shippingPostalCode:
      string | null;
    shippingCity: string | null;
    shippingState: string | null;
    shippingCountry: string | null;
  },
): string[] {
  return [
    order.shippingName,
    order.shippingLine1,
    order.shippingLine2,

    [
      order.shippingPostalCode,
      order.shippingCity,
    ]
      .filter(Boolean)
      .join(" "),

    order.shippingState,
    order.shippingCountry,
  ].filter(
    (value): value is string =>
      Boolean(value?.trim()),
  );
}

export default async function OrdersPage() {
  const orders =
    await prisma.order.findMany({
      include: {
        withdrawalRequest:
          true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const totalOrders =
    orders.length;

  const paidOrders =
    orders.filter(
      (order) =>
        order.paymentStatus ===
        "paid",
    ).length;

  const pendingOrders =
    orders.filter((order) =>
      [
        "PENDING",
        "PROCESSING",
      ].includes(
        order.fulfillmentStatus,
      ),
    ).length;

  const reviewOrders =
    orders.filter(
      (order) =>
        order.fulfillmentStatus ===
        "REVIEW_REQUIRED",
    ).length;

  const withdrawalOrders =
    orders.filter(
      (order) =>
        Boolean(
          order.withdrawalRequest,
        ),
    ).length;

  const statistics = [
    {
      label: "Pedidos totales",
      value: totalOrders,
    },
    {
      label: "Pagados",
      value: paidOrders,
    },
    {
      label: "Pendientes",
      value: pendingOrders,
    },
    {
      label: "Para revisar",
      value: reviewOrders,
    },
    {
      label: "Desistimientos",
      value: withdrawalOrders,
    },
  ];

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/40">
            Tienda VANMOTION
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Pedidos
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
            Consulta las compras
            confirmadas, los datos del
            cliente, la dirección de
            envío y el estado de
            preparación.
          </p>
        </div>

        <Link
          href="/admin/ropa"
          className="inline-flex min-h-11 items-center justify-center border border-white/15 px-5 text-xs font-semibold uppercase tracking-[0.16em] transition hover:border-white/40 hover:bg-white hover:text-black"
        >
          Gestionar stock
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statistics.map((item) => (
          <article
            key={item.label}
            className="border border-white/10 bg-white/[0.025] p-5"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">
              {item.label}
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {item.value}
            </p>
          </article>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="border border-dashed border-white/15 px-8 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35">
            Sin pedidos
          </p>

          <h2 className="mt-4 text-2xl font-semibold">
            Todavía no hay compras
            registradas
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/45">
            Los pedidos confirmados
            mediante Stripe aparecerán
            automáticamente en esta
            sección.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const address =
              getShippingAddress(
                order,
              );

            const paymentLabel =
              paymentStatusLabels[
                order.paymentStatus
              ] ??
              order.paymentStatus;

            const fulfillmentLabel =
              fulfillmentStatusLabels[
                order.fulfillmentStatus
              ] ??
              order.fulfillmentStatus;

            const withdrawalLabel =
              order.withdrawalRequest
                ? withdrawalStatusLabels[
                    order
                      .withdrawalRequest
                      .status
                  ] ??
                  order
                    .withdrawalRequest
                    .status
                : null;

            const formKey = [
              order.id,
              order.fulfillmentStatus,
              order.shippingCarrier ??
                "",
              order.trackingNumber ??
                "",
              order.trackingUrl ??
                "",
            ].join("-");

            const withdrawalFormKey =
              order.withdrawalRequest
                ? [
                    order
                      .withdrawalRequest
                      .id,
                    order
                      .withdrawalRequest
                      .status,
                    order
                      .withdrawalRequest
                      .adminNotes ??
                      "",
                  ].join("-")
                : "";

            return (
              <article
                key={order.id}
                className="overflow-hidden border border-white/10 bg-white/[0.02]"
              >
                <div className="flex flex-col gap-5 border-b border-white/10 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                      Pedido
                    </p>

                    <h2 className="mt-2 text-lg font-semibold">
                      #
                      {order.id
                        .slice(-10)
                        .toUpperCase()}
                    </h2>

                    <time
                      dateTime={
                        order.createdAt.toISOString()
                      }
                      className="mt-1 block text-xs text-white/40"
                    >
                      {formatDate(
                        order.createdAt,
                      )}
                    </time>

                    {order.shippedAt && (
                      <p className="mt-2 text-xs text-blue-300/70">
                        Marcado como enviado:{" "}
                        {formatDate(
                          order.shippedAt,
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${getPaymentStatusClass(
                        order.paymentStatus,
                      )}`}
                    >
                      {paymentLabel}
                    </span>

                    <span
                      className={`border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${getFulfillmentStatusClass(
                        order.fulfillmentStatus,
                      )}`}
                    >
                      {fulfillmentLabel}
                    </span>

                    {order.withdrawalRequest &&
                      withdrawalLabel && (
                        <span
                          className={`border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${getWithdrawalStatusClass(
                            order
                              .withdrawalRequest
                              .status,
                          )}`}
                        >
                          Desistimiento:{" "}
                          {withdrawalLabel}
                        </span>
                      )}
                  </div>
                </div>

                {order.withdrawalRequest && (
                  <section className="border-b border-rose-500/20 bg-rose-500/[0.055] px-6 py-6">
                    <div className="flex flex-col gap-4 border-b border-rose-500/20 pb-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-rose-200/60">
                          Solicitud de desistimiento
                        </p>

                        <h3 className="mt-2 text-xl font-semibold text-rose-100">
                          #
                          {order.withdrawalRequest.id
                            .slice(-10)
                            .toUpperCase()}
                        </h3>

                        <p className="mt-2 text-xs leading-5 text-rose-100/55">
                          Recibida:{" "}
                          {formatDate(
                            order.withdrawalRequest
                              .requestedAt,
                          )}
                        </p>

                        <p className="mt-1 break-all text-xs leading-5 text-rose-100/55">
                          {
                            order.withdrawalRequest
                              .customerName
                          }{" "}
                          ·{" "}
                          {
                            order.withdrawalRequest
                              .customerEmail
                          }
                        </p>
                      </div>

                      <span
                        className={`w-fit border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${getWithdrawalStatusClass(
                          order.withdrawalRequest
                            .status,
                        )}`}
                      >
                        {withdrawalLabel ??
                          order.withdrawalRequest
                            .status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-2">
                      <div className="border border-rose-500/20 bg-black/25 p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-100/45">
                          Declaración del cliente
                        </p>

                        <p className="mt-4 text-sm leading-7 text-white/70">
                          {
                            order.withdrawalRequest
                              .statement
                          }
                        </p>

                        {order.withdrawalRequest
                          .customerMessage && (
                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                              Mensaje adicional
                            </p>

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/60">
                              {
                                order
                                  .withdrawalRequest
                                  .customerMessage
                              }
                            </p>
                          </div>
                        )}

                        <div className="mt-5 grid gap-2 border-t border-white/10 pt-4 text-xs leading-5 text-white/45 sm:grid-cols-2">
                          <p>
                            Confirmación:{" "}
                            <strong className="text-white/70">
                              {order.withdrawalRequest
                                .confirmationSentAt
                                ? formatDate(
                                    order
                                      .withdrawalRequest
                                      .confirmationSentAt,
                                  )
                                : "No confirmada"}
                            </strong>
                          </p>

                          <p>
                            Devolución recibida:{" "}
                            <strong className="text-white/70">
                              {order.withdrawalRequest
                                .returnReceivedAt
                                ? formatDate(
                                    order
                                      .withdrawalRequest
                                      .returnReceivedAt,
                                  )
                                : "Pendiente"}
                            </strong>
                          </p>

                          <p>
                            Reembolso:{" "}
                            <strong className="text-white/70">
                              {order.withdrawalRequest
                                .refundedAt
                                ? formatDate(
                                    order
                                      .withdrawalRequest
                                      .refundedAt,
                                  )
                                : "Pendiente"}
                            </strong>
                          </p>

                          <p>
                            Resolución:{" "}
                            <strong className="text-white/70">
                              {order.withdrawalRequest
                                .resolvedAt
                                ? formatDate(
                                    order
                                      .withdrawalRequest
                                      .resolvedAt,
                                  )
                                : "Pendiente"}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <form
                        key={withdrawalFormKey}
                        action={
                          updateWithdrawalRequestAction
                        }
                        className="border border-rose-500/20 bg-black/25 p-5"
                      >
                        <input
                          type="hidden"
                          name="withdrawalId"
                          value={
                            order.withdrawalRequest
                              .id
                          }
                        />

                        <label className="flex flex-col gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-100/50">
                            Estado del desistimiento
                          </span>

                          <select
                            name="withdrawalStatus"
                            defaultValue={
                              order.withdrawalRequest
                                .status
                            }
                            className="min-h-11 border border-rose-500/25 bg-black px-3 text-xs font-semibold uppercase tracking-[0.1em] text-white outline-none transition focus:border-rose-200/60"
                          >
                            {withdrawalStatusOptions.map(
                              (option) => (
                                <option
                                  key={
                                    option.value
                                  }
                                  value={
                                    option.value
                                  }
                                >
                                  {
                                    option.label
                                  }
                                </option>
                              ),
                            )}
                          </select>
                        </label>

                        <label className="mt-4 flex flex-col gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-100/50">
                            Notas internas
                          </span>

                          <textarea
                            name="adminNotes"
                            rows={7}
                            maxLength={4000}
                            defaultValue={
                              order.withdrawalRequest
                                .adminNotes ??
                              ""
                            }
                            placeholder="Comprobaciones, instrucciones de devolución, incidencias o información del reembolso..."
                            className="border border-rose-500/25 bg-black p-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-rose-200/60"
                          />
                        </label>

                        <p className="mt-4 text-xs leading-5 text-white/40">
                          Las notas son internas. Al
                          marcar Recibido o En revisión,
                          el pedido quedará señalado para
                          revisión administrativa.
                        </p>

                        <button
                          type="submit"
                          className="mt-5 min-h-11 w-full border border-rose-100 bg-rose-100 px-6 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-transparent hover:text-rose-100"
                        >
                          Guardar desistimiento
                        </button>
                      </form>
                    </div>
                  </section>
                )}

                <form
                  key={formKey}
                  action={
                    updateOrderFulfillmentStatusAction
                  }
                  className="border-b border-white/10 bg-white/[0.015] px-6 py-5"
                >
                  <input
                    type="hidden"
                    name="orderId"
                    value={order.id}
                  />

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                        Transportista
                      </span>

                      <input
                        type="text"
                        name="shippingCarrier"
                        defaultValue={
                          order.shippingCarrier ??
                          ""
                        }
                        placeholder="Correos, MRW, SEUR..."
                        className="min-h-11 border border-white/15 bg-black px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/50"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                        Número de seguimiento
                      </span>

                      <input
                        type="text"
                        name="trackingNumber"
                        defaultValue={
                          order.trackingNumber ??
                          ""
                        }
                        placeholder="Ej. PQ123456789ES"
                        className="min-h-11 border border-white/15 bg-black px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/50"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                        Enlace de seguimiento
                      </span>

                      <input
                        type="url"
                        name="trackingUrl"
                        defaultValue={
                          order.trackingUrl ??
                          ""
                        }
                        placeholder="https://..."
                        className="min-h-11 border border-white/15 bg-black px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/50"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                        Estado del pedido
                      </span>

                      <select
                        name="fulfillmentStatus"
                        defaultValue={
                          order.fulfillmentStatus
                        }
                        className="min-h-11 border border-white/15 bg-black px-3 text-xs font-semibold uppercase tracking-[0.1em] text-white outline-none transition focus:border-white/50"
                      >
                        {fulfillmentStatusOptions.map(
                          (option) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  </div>

                  <div className="mt-4 flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-2xl text-xs leading-5 text-white/40">
                      Introduce los datos del
                      transporte antes de cambiar el
                      pedido a Enviado. El cliente
                      recibirá automáticamente esta
                      información por correo.
                    </p>

                    <button
                      type="submit"
                      className="min-h-11 shrink-0 border border-white bg-white px-6 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-transparent hover:text-white"
                    >
                      Guardar y actualizar
                    </button>
                  </div>
                </form>

                <div className="grid divide-y divide-white/10 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                      Cliente
                    </p>

                    <p className="mt-4 font-semibold">
                      {order.customerName ??
                        order.shippingName ??
                        "No indicado"}
                    </p>

                    <p className="mt-2 break-all text-sm text-white/55">
                      {order.customerEmail ??
                        "Correo no indicado"}
                    </p>

                    {order.customerPhone && (
                      <p className="mt-2 text-sm text-white/55">
                        {
                          order.customerPhone
                        }
                      </p>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                      Producto
                    </p>

                    <p className="mt-4 font-semibold">
                      {order.productName}
                    </p>

                    <div className="mt-3 space-y-1 text-sm text-white/55">
                      <p>
                        Talla:{" "}
                        <strong className="text-white">
                          {order.size}
                        </strong>
                      </p>

                      <p>
                        Cantidad:{" "}
                        <strong className="text-white">
                          {order.quantity}
                        </strong>
                      </p>

                      {order.sku && (
                        <p>
                          SKU:{" "}
                          <span className="text-white/70">
                            {order.sku}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                      Pago
                    </p>

                    <p className="mt-4 text-2xl font-semibold">
                      {formatAmount(
                        order.amountTotal,
                        order.currency,
                      )}
                    </p>

                    <p className="mt-3 break-all text-xs leading-5 text-white/35">
                      Sesión Stripe:
                      <br />

                      {
                        order.stripeCheckoutSessionId
                      }
                    </p>
                  </div>

                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                      Dirección de envío
                    </p>

                    {address.length > 0 ? (
                      <address className="mt-4 space-y-1 text-sm not-italic leading-6 text-white/65">
                        {address.map(
                          (
                            line,
                            index,
                          ) => (
                            <p
                              key={`${line}-${index}`}
                            >
                              {line}
                            </p>
                          ),
                        )}
                      </address>
                    ) : (
                      <p className="mt-4 text-sm text-white/40">
                        No indicada
                      </p>
                    )}

                    {(
                      order.shippingCarrier ||
                      order.trackingNumber ||
                      order.trackingUrl
                    ) && (
                      <div className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-white/45">
                        {order.shippingCarrier && (
                          <p>
                            Transportista:{" "}
                            <strong className="text-white/75">
                              {
                                order.shippingCarrier
                              }
                            </strong>
                          </p>
                        )}

                        {order.trackingNumber && (
                          <p className="mt-1">
                            Seguimiento:{" "}
                            <strong className="text-white/75">
                              {
                                order.trackingNumber
                              }
                            </strong>
                          </p>
                        )}

                        {order.trackingUrl && (
                          <a
                            href={
                              order.trackingUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex border-b border-white/40 pb-1 font-semibold uppercase tracking-[0.1em] text-white transition hover:border-white"
                          >
                            Abrir seguimiento ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}