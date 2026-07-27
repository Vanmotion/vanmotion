import Link from "next/link";

import { prisma } from "@/app/lib/prisma";

import styles from "./admin-dashboard.module.css";

export const dynamic = "force-dynamic";

function formatPrice(value: unknown): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Consultar";
  }

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatOrderAmount(
  amountInCents: number,
  currency = "eur",
): string {
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountInCents / 100);
  } catch {
    return `${(amountInCents / 100).toFixed(
      2,
    )} ${currency.toUpperCase()}`;
  }
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    AVAILABLE: "Disponible",
    RESERVED: "Reservado",
    SOLD: "Vendido",
    EMBLEM: "Emblema",
  };

  return labels[status] ?? status;
}

function orderStatusLabel(
  status: string,
): string {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    PROCESSING: "En preparación",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REVIEW_REQUIRED: "Revisar",
  };

  return labels[status] ?? status;
}

export default async function AdminDashboardPage() {
  const publicSiteEnabled =
    process.env.PUBLIC_SITE_ENABLED === "true";

  const [
    totalVehicles,
    availableVehicles,
    reservedVehicles,
    soldVehicles,
    totalBrands,
    totalContacts,

    totalOrders,
    pendingOrders,
    shippedOrders,
    reviewOrders,
    paidRevenue,

    totalWithdrawals,
    openWithdrawals,

    recentVehicles,
    recentContacts,
    recentOrders,

    settings,
  ] = await Promise.all([
    prisma.vehicle.count(),

    prisma.vehicle.count({
      where: {
        status: "AVAILABLE",
      },
    }),

    prisma.vehicle.count({
      where: {
        status: "RESERVED",
      },
    }),

    prisma.vehicle.count({
      where: {
        status: "SOLD",
      },
    }),

    prisma.brand.count(),

    prisma.contactRequest.count(),

    prisma.order.count(),

    prisma.order.count({
      where: {
        fulfillmentStatus: {
          in: [
            "PENDING",
            "PROCESSING",
          ],
        },
      },
    }),

    prisma.order.count({
      where: {
        fulfillmentStatus: "SHIPPED",
      },
    }),

    prisma.order.count({
      where: {
        fulfillmentStatus:
          "REVIEW_REQUIRED",
      },
    }),

    prisma.order.aggregate({
      where: {
        paymentStatus: "paid",
      },

      _sum: {
        amountTotal: true,
      },
    }),

    prisma.withdrawalRequest.count(),

    prisma.withdrawalRequest.count({
      where: {
        status: {
          notIn: [
            "REFUNDED",
            "REJECTED",
          ],
        },
      },
    }),

    prisma.vehicle.findMany({
      take: 5,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        brand: true,

        images: {
          take: 1,

          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    }),

    prisma.contactRequest.findMany({
      take: 5,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        vehicle: {
          include: {
            brand: true,
          },
        },
      },
    }),

    prisma.order.findMany({
      take: 5,

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.siteSettings.findUnique({
      where: {
        id: "main",
      },
    }),
  ]);

  const businessName =
    settings?.businessName ??
    "VANMOTION";

  const confirmedRevenue =
    paidRevenue._sum.amountTotal ?? 0;

  const needsAttention =
    reviewOrders > 0 ||
    openWithdrawals > 0;

  const stats = [
    {
      value: totalVehicles,
      title: "Vehículos",
      description: "Total registrado",
    },
    {
      value: availableVehicles,
      title: "Disponibles",
      description: "Publicados para venta",
    },
    {
      value: reservedVehicles,
      title: "Reservados",
      description: "Operaciones en proceso",
    },
    {
      value: soldVehicles,
      title: "Vendidos",
      description: "Vehículos completados",
    },
    {
      value: totalContacts,
      title: "Contactos",
      description: "Solicitudes recibidas",
    },
    {
      value: totalBrands,
      title: "Marcas",
      description: "Fabricantes registrados",
    },
    {
      value: totalOrders,
      title: "Pedidos",
      description: "Compras registradas",
    },
    {
      value: pendingOrders,
      title: "Pendientes",
      description: "Por preparar o procesar",
    },
    {
      value: shippedOrders,
      title: "Enviados",
      description: "Pedidos en transporte",
    },
    {
      value: reviewOrders,
      title: "Para revisar",
      description: "Pedidos con incidencia",
    },
    {
      value: openWithdrawals,
      title: "Desistimientos",
      description: "Solicitudes abiertas",
    },
    {
      value: formatOrderAmount(
        confirmedRevenue,
      ),
      title: "Facturación",
      description: "Pagos confirmados",
      compact: true,
    },
  ];

  const quickActions = [
    {
      number: "01",
      href: "/admin/vehicles",
      title: "Vehículos",
      description:
        "Añadir, editar, ordenar imágenes y cambiar el estado.",
    },
    {
      number: "02",
      href: "/admin/brands",
      title: "Marcas",
      description:
        "Gestionar fabricantes y organizar el catálogo.",
    },
    {
      number: "03",
      href: "/admin/contactos",
      title: "Contactos",
      description:
        "Consultar solicitudes de personas interesadas.",
    },
    {
      number: "04",
      href: "/admin/pedidos",
      title: "Pedidos",
      description:
        "Consultar compras, envíos, seguimientos y desistimientos.",
    },
    {
      number: "05",
      href: "/admin/music",
      title: "Música",
      description:
        "Añadir y gestionar temas, portadas y reproducción.",
    },
    {
      number: "06",
      href: "/admin/ropa",
      title: "Ropa",
      description:
        "Gestionar productos, precios, tallas, stock y visibilidad.",
    },
    {
      number: "07",
      href: "/admin/settings",
      title: "Configuración",
      description:
        "Teléfono, dirección, WhatsApp, horario y redes.",
    },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            Panel de administración
          </p>

          <h1>
            Buenos días,
            <br />
            {businessName}.
          </h1>

          <p className={styles.heroText}>
            Controla vehículos, pedidos,
            contactos, marcas, ropa,
            música y configuración desde
            un único espacio.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link
            href="/admin/vehicles/nuevo"
            className={styles.primaryButton}
          >
            Añadir vehículo
            <span>＋</span>
          </Link>

          <Link
            href="/admin/pedidos"
            className={
              styles.secondaryButton
            }
          >
            Ver pedidos
            <span>→</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className={
              styles.secondaryButton
            }
          >
            Ver página pública
            <span>↗</span>
          </Link>
        </div>
      </section>

      <section className={styles.statsGrid}>
        {stats.map((stat) => (
          <article key={stat.title}>
            <span
              className={styles.statNumber}
              data-compact={
                stat.compact
                  ? "true"
                  : "false"
              }
            >
              {stat.value}
            </span>

            <div>
              <strong>
                {stat.title}
              </strong>

              <small>
                {stat.description}
              </small>
            </div>
          </article>
        ))}
      </section>

      {needsAttention && (
        <section
          className={styles.statusSection}
          data-tone="warning"
        >
          <div>
            <p className={styles.eyebrow}>
              Atención necesaria
            </p>

            <h2>
              Hay gestiones
              <br />
              pendientes.
            </h2>
          </div>

          <div className={styles.statusList}>
            <div
              data-state={
                reviewOrders > 0
                  ? "warning"
                  : "success"
              }
            >
              <span />

              <strong>
                Pedidos para revisar
              </strong>

              <small>
                {reviewOrders > 0
                  ? `${reviewOrders} ${
                      reviewOrders === 1
                        ? "pedido"
                        : "pedidos"
                    }`
                  : "Sin incidencias"}
              </small>
            </div>

            <div
              data-state={
                openWithdrawals > 0
                  ? "warning"
                  : "success"
              }
            >
              <span />

              <strong>
                Desistimientos abiertos
              </strong>

              <small>
                {openWithdrawals > 0
                  ? `${openWithdrawals} ${
                      openWithdrawals === 1
                        ? "solicitud"
                        : "solicitudes"
                    }`
                  : "Sin pendientes"}
              </small>
            </div>

            <div data-state="neutral">
              <span />

              <strong>
                Desistimientos totales
              </strong>

              <small>
                {totalWithdrawals} recibidos
              </small>
            </div>

            <div data-state="neutral">
              <span />

              <strong>
                Acción recomendada
              </strong>

              <small>
                Abrir panel de pedidos
              </small>
            </div>
          </div>
        </section>
      )}

      <section className={styles.quickActions}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>
              Accesos rápidos
            </p>

            <h2>
              Gestiona VANMOTION.
            </h2>
          </div>
        </div>

        <div className={styles.actionGrid}>
          {quickActions.map((action) => (
            <Link
              href={action.href}
              key={action.number}
            >
              <span>{action.number}</span>

              <strong>
                {action.title}
              </strong>

              <small>
                {action.description}
              </small>

              <b>Entrar →</b>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>
                Inventario
              </p>

              <h2>
                Últimos vehículos
              </h2>
            </div>

            <Link href="/admin/vehicles">
              Ver todos →
            </Link>
          </div>

          {recentVehicles.length === 0 ? (
            <div className={styles.emptyState}>
              <strong>
                Todavía no hay vehículos.
              </strong>

              <p>
                Añade el primero para
                comenzar la colección
                pública.
              </p>

              <Link href="/admin/vehicles/nuevo">
                Añadir vehículo
              </Link>
            </div>
          ) : (
            <div className={styles.vehicleList}>
              {recentVehicles.map(
                (vehicle) => {
                  const image =
                    vehicle.images[0];

                  return (
                    <article key={vehicle.id}>
                      <div
                        className={
                          styles.vehicleImage
                        }
                      >
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image.url}
                            alt={
                              image.alt ??
                              `${vehicle.brand.name} ${vehicle.model}`
                            }
                          />
                        ) : (
                          <span>
                            Sin imagen
                          </span>
                        )}
                      </div>

                      <div
                        className={
                          styles.vehicleInformation
                        }
                      >
                        <span>
                          {vehicle.year} ·{" "}
                          {vehicle.mileage.toLocaleString(
                            "es-ES",
                          )}{" "}
                          km
                        </span>

                        <strong>
                          {vehicle.brand.name}{" "}
                          {vehicle.model}
                        </strong>

                        <small>
                          {formatPrice(
                            vehicle.price,
                          )}
                        </small>
                      </div>

                      <div
                        className={
                          styles.vehicleStatus
                        }
                      >
                        <span
                          data-status={
                            vehicle.status
                          }
                        >
                          {statusLabel(
                            vehicle.status,
                          )}
                        </span>

                        <Link
                          href={`/admin/vehicles/${vehicle.id}/edit`}
                        >
                          Editar
                        </Link>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>
                Tienda
              </p>

              <h2>
                Últimos pedidos
              </h2>
            </div>

            <Link href="/admin/pedidos">
              Ver todos →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <strong>
                Todavía no hay pedidos.
              </strong>

              <p>
                Las compras confirmadas
                mediante Stripe aparecerán
                aquí.
              </p>

              <Link href="/admin/ropa">
                Gestionar ropa
              </Link>
            </div>
          ) : (
            <div className={styles.contactList}>
              {recentOrders.map((order) => (
                <article key={order.id}>
                  <div
                    className={
                      styles.contactAvatar
                    }
                  >
                    #
                  </div>

                  <div
                    className={
                      styles.contactInformation
                    }
                  >
                    <strong>
                      {order.customerName ??
                        order.shippingName ??
                        "Cliente"}
                    </strong>

                    <span>
                      {order.productName}
                    </span>

                    <small>
                      Talla {order.size} ·{" "}
                      {order.quantity}{" "}
                      {order.quantity === 1
                        ? "unidad"
                        : "unidades"}{" "}
                      ·{" "}
                      {formatOrderAmount(
                        order.amountTotal,
                        order.currency,
                      )}
                    </small>
                  </div>

                  <div
                    className={
                      styles.contactDate
                    }
                  >
                    <span>
                      {formatDate(
                        order.createdAt,
                      )}
                    </span>

                    <small>
                      {orderStatusLabel(
                        order.fulfillmentStatus,
                      )}
                    </small>

                    <Link href="/admin/pedidos">
                      Abrir
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>
                Interesados
              </p>

              <h2>
                Últimos contactos
              </h2>
            </div>

            <Link href="/admin/contactos">
              Ver todos →
            </Link>
          </div>

          {recentContacts.length === 0 ? (
            <div className={styles.emptyState}>
              <strong>
                No hay solicitudes nuevas.
              </strong>

              <p>
                Los contactos recibidos
                desde las fichas aparecerán
                aquí.
              </p>
            </div>
          ) : (
            <div className={styles.contactList}>
              {recentContacts.map(
                (contact) => (
                  <article key={contact.id}>
                    <div
                      className={
                        styles.contactAvatar
                      }
                    >
                      {contact.name
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div
                      className={
                        styles.contactInformation
                      }
                    >
                      <strong>
                        {contact.name}
                      </strong>

                      <span>
                        {contact.email}
                      </span>

                      <small>
                        {contact.vehicle
                          ? `${contact.vehicle.brand.name} ${contact.vehicle.model}`
                          : "Consulta general"}
                      </small>
                    </div>

                    <div
                      className={
                        styles.contactDate
                      }
                    >
                      <span>
                        {formatDate(
                          contact.createdAt,
                        )}
                      </span>

                      <Link href="/admin/contactos">
                        Abrir
                      </Link>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </div>
      </section>

      <section className={styles.statusSection}>
        <div>
          <p className={styles.eyebrow}>
            Estado del proyecto
          </p>

          <h2>
            VANMOTION sigue
            <br />
            avanzando.
          </h2>
        </div>

        <div className={styles.statusList}>
          <div
            data-state={
              publicSiteEnabled
                ? "success"
                : "warning"
            }
          >
            <span />

            <strong>
              Página pública
            </strong>

            <small>
              {publicSiteEnabled
                ? "Abierta"
                : "Cerrada · Próximamente"}
            </small>
          </div>

          <div data-state="success">
            <span />

            <strong>
              Base de datos
            </strong>

            <small>
              Conectada
            </small>
          </div>

          <div data-state="success">
            <span />

            <strong>
              Pagos y pedidos
            </strong>

            <small>
              Stripe operativo
            </small>
          </div>

          <div data-state="success">
            <span />

            <strong>
              Correos automáticos
            </strong>

            <small>
              Resend activo
            </small>
          </div>

          <div
            data-state={
              reviewOrders > 0
                ? "warning"
                : "success"
            }
          >
            <span />

            <strong>
              Pedidos para revisar
            </strong>

            <small>
              {reviewOrders > 0
                ? `${reviewOrders} pendientes`
                : "Sin incidencias"}
            </small>
          </div>

          <div
            data-state={
              openWithdrawals > 0
                ? "warning"
                : "success"
            }
          >
            <span />

            <strong>
              Desistimientos
            </strong>

            <small>
              {openWithdrawals > 0
                ? `${openWithdrawals} abiertos`
                : "Sin pendientes"}
            </small>
          </div>
        </div>
      </section>
    </div>
  );
}