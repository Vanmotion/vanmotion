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

        <div
          className={styles.heroActions}
        >
          <Link
            href="/admin/vehicles/nuevo"
            className={
              styles.primaryButton
            }
          >
            Añadir vehículo{" "}
            <span>＋</span>
          </Link>

          <Link
            href="/admin/pedidos"
            className={
              styles.secondaryButton
            }
          >
            Ver pedidos{" "}
            <span>→</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className={
              styles.secondaryButton
            }
          >
            Ver página pública{" "}
            <span>↗</span>
          </Link>
        </div>
      </section>

      <section
        className={styles.statsGrid}
      >
        <article>
          <span
            className={
              styles.statNumber
            }
          >
            {totalVehicles}
          </span>

          <div>
            <strong>Vehículos</strong>
            <small>
              Total registrado
            </small>
          </div>
        </article>

        <article>
          <span
            className={
              styles.statNumber
            }
          >
            {availableVehicles}
          </span>

          <div>
            <strong>
              Disponibles
            </strong>

            <small>
              Publicados para venta
            </small>
          </div>
        </article>

        <article>
          <span
            className={
              styles.statNumber
            }
          >
            {reservedVehicles}
          </span>

          <div>
            <strong>
              Reservados
            </strong>

            <small>
              Operaciones en proceso
            </small>
          </div>
        </article>

        <article>
          <span
            className={
              styles.statNumber
            }
          >
            {soldVehicles}
          </span>

          <div>
            <strong>Vendidos</strong>

            <small>
              Vehículos completados
            </small>
          </div>
        </article>

        <article>
          <span
            className={
              styles.statNumber
            }
          >
            {totalContacts}
          </span>

          <div>
            <strong>Contactos</strong>

            <small>
              Solicitudes recibidas
            </small>
          </div>
        </article>

        <article>
          <span
            className={
              styles.statNumber
            }
          >
            {totalBrands}
          </span>

          <div>
            <strong>Marcas</strong>

            <small>
              Fabricantes registrados
            </small>
          </div>
        </article>

        <article>
          <span
            className={
              styles.statNumber
            }
          >
            {totalOrders}
          </span>

          <div>
            <strong>Pedidos</strong>

            <small>
              Compras registradas
            </small>
          </div>
        </article>

        <article>
          <span
            className={
              styles.statNumber
            }
          >
            {pendingOrders}
          </span>

          <div>
            <strong>Pendientes</strong>

            <small>
              Por preparar o procesar
            </small>
          </div>
        </article>

        <article>
          <span
            className={
              styles.statNumber
            }
          >
            {shippedOrders}
          </span>

          <div>
            <strong>Enviados</strong>

            <small>
              Pedidos en transporte
            </small>
          </div>
        </article>

        <article>
          <span
            className={
              styles.statNumber
            }
          >
            {formatOrderAmount(
              confirmedRevenue,
            )}
          </span>

          <div>
            <strong>
              Facturación
            </strong>

            <small>
              Pagos confirmados
            </small>
          </div>
        </article>
      </section>

      {reviewOrders > 0 && (
        <section
          className={styles.statusSection}
        >
          <div>
            <p
              className={
                styles.eyebrow
              }
            >
              Atención necesaria
            </p>

            <h2>
              Hay pedidos
              <br />
              para revisar.
            </h2>
          </div>

          <div
            className={
              styles.statusList
            }
          >
            <div>
              <span />

              <strong>
                Revisión de pedidos
              </strong>

              <small>
                {reviewOrders}{" "}
                {reviewOrders === 1
                  ? "pedido pendiente"
                  : "pedidos pendientes"}
              </small>
            </div>

            <div>
              <span />

              <strong>
                Acción recomendada
              </strong>

              <small>
                Comprobar stock y pago
              </small>
            </div>

            <div>
              <span />

              <strong>
                Acceso directo
              </strong>

              <small>
                Panel de pedidos
              </small>
            </div>

            <div>
              <span />

              <strong>
                Estado
              </strong>

              <small>
                Requiere atención
              </small>
            </div>
          </div>
        </section>
      )}

      <section
        className={
          styles.quickActions
        }
      >
        <div
          className={
            styles.sectionHeading
          }
        >
          <div>
            <p
              className={
                styles.eyebrow
              }
            >
              Accesos rápidos
            </p>

            <h2>
              Gestiona VANMOTION.
            </h2>
          </div>
        </div>

        <div
          className={
            styles.actionGrid
          }
        >
          <Link href="/admin/vehicles">
            <span>01</span>

            <strong>
              Vehículos
            </strong>

            <small>
              Añadir, editar, ordenar
              imágenes y cambiar el
              estado.
            </small>

            <b>Entrar →</b>
          </Link>

          <Link href="/admin/brands">
            <span>02</span>

            <strong>Marcas</strong>

            <small>
              Gestionar fabricantes y
              organizar el catálogo.
            </small>

            <b>Entrar →</b>
          </Link>

          <Link href="/admin/contactos">
            <span>03</span>

            <strong>
              Contactos
            </strong>

            <small>
              Consultar solicitudes de
              personas interesadas.
            </small>

            <b>Entrar →</b>
          </Link>

          <Link href="/admin/pedidos">
            <span>04</span>

            <strong>Pedidos</strong>

            <small>
              Consultar compras, preparar
              envíos y añadir números de
              seguimiento.
            </small>

            <b>Entrar →</b>
          </Link>

          <Link href="/admin/music">
            <span>05</span>

            <strong>Música</strong>

            <small>
              Añadir y gestionar temas,
              portadas y reproducción.
            </small>

            <b>Entrar →</b>
          </Link>

          <Link href="/admin/ropa">
            <span>06</span>

            <strong>Ropa</strong>

            <small>
              Gestionar productos,
              precios, tallas, stock y
              visibilidad.
            </small>

            <b>Entrar →</b>
          </Link>

          <Link href="/admin/settings">
            <span>07</span>

            <strong>
              Configuración
            </strong>

            <small>
              Teléfono, dirección,
              WhatsApp, horario y redes.
            </small>

            <b>Entrar →</b>
          </Link>
        </div>
      </section>

      <section
        className={
          styles.contentGrid
        }
      >
        <div className={styles.panel}>
          <div
            className={
              styles.panelHeader
            }
          >
            <div>
              <p
                className={
                  styles.eyebrow
                }
              >
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

          {recentVehicles.length ===
          0 ? (
            <div
              className={
                styles.emptyState
              }
            >
              <strong>
                Todavía no hay
                vehículos.
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
            <div
              className={
                styles.vehicleList
              }
            >
              {recentVehicles.map(
                (vehicle) => {
                  const image =
                    vehicle.images[0];

                  return (
                    <article
                      key={vehicle.id}
                    >
                      <div
                        className={
                          styles.vehicleImage
                        }
                      >
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              image.url
                            }
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
                          {
                            vehicle.brand
                              .name
                          }{" "}
                          {
                            vehicle.model
                          }
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
          <div
            className={
              styles.panelHeader
            }
          >
            <div>
              <p
                className={
                  styles.eyebrow
                }
              >
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
            <div
              className={
                styles.emptyState
              }
            >
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
            <div
              className={
                styles.contactList
              }
            >
              {recentOrders.map(
                (order) => (
                  <article
                    key={order.id}
                  >
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
                ),
              )}
            </div>
          )}
        </div>

        <div className={styles.panel}>
          <div
            className={
              styles.panelHeader
            }
          >
            <div>
              <p
                className={
                  styles.eyebrow
                }
              >
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

          {recentContacts.length ===
          0 ? (
            <div
              className={
                styles.emptyState
              }
            >
              <strong>
                No hay solicitudes
                nuevas.
              </strong>

              <p>
                Los contactos recibidos
                desde las fichas
                aparecerán aquí.
              </p>
            </div>
          ) : (
            <div
              className={
                styles.contactList
              }
            >
              {recentContacts.map(
                (contact) => (
                  <article
                    key={contact.id}
                  >
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

      <section
        className={
          styles.statusSection
        }
      >
        <div>
          <p
            className={
              styles.eyebrow
            }
          >
            Estado del proyecto
          </p>

          <h2>
            VANMOTION sigue
            <br />
            avanzando.
          </h2>
        </div>

        <div
          className={
            styles.statusList
          }
        >
          <div>
            <span />

            <strong>
              Página pública
            </strong>

            <small>Activa</small>
          </div>

          <div>
            <span />

            <strong>
              Base de datos
            </strong>

            <small>
              Conectada
            </small>
          </div>

          <div>
            <span />

            <strong>
              Pagos y pedidos
            </strong>

            <small>
              Stripe operativo
            </small>
          </div>

          <div>
            <span />

            <strong>
              Correos automáticos
            </strong>

            <small>
              Resend activo
            </small>
          </div>

          <div>
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
        </div>
      </section>
    </div>
  );
}