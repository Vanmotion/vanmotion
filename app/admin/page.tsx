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

export default async function AdminDashboardPage() {
  const [
    totalVehicles,
    availableVehicles,
    reservedVehicles,
    soldVehicles,
    totalBrands,
    totalContacts,
    recentVehicles,
    recentContacts,
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

    prisma.siteSettings.findUnique({
      where: {
        id: "main",
      },
    }),
  ]);

  const businessName =
    settings?.businessName ?? "VANMOTION";

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
            Controla vehículos, contactos, marcas,
            música y configuración desde un único
            espacio.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link
            href="/admin/vehicles/nuevo"
            className={styles.primaryButton}
          >
            Añadir vehículo <span>＋</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className={styles.secondaryButton}
          >
            Ver página pública <span>↗</span>
          </Link>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <article>
          <span className={styles.statNumber}>
            {totalVehicles}
          </span>

          <div>
            <strong>Vehículos</strong>
            <small>Total registrado</small>
          </div>
        </article>

        <article>
          <span className={styles.statNumber}>
            {availableVehicles}
          </span>

          <div>
            <strong>Disponibles</strong>
            <small>Publicados para venta</small>
          </div>
        </article>

        <article>
          <span className={styles.statNumber}>
            {reservedVehicles}
          </span>

          <div>
            <strong>Reservados</strong>
            <small>Operaciones en proceso</small>
          </div>
        </article>

        <article>
          <span className={styles.statNumber}>
            {soldVehicles}
          </span>

          <div>
            <strong>Vendidos</strong>
            <small>Vehículos completados</small>
          </div>
        </article>

        <article>
          <span className={styles.statNumber}>
            {totalContacts}
          </span>

          <div>
            <strong>Contactos</strong>
            <small>Solicitudes recibidas</small>
          </div>
        </article>

        <article>
          <span className={styles.statNumber}>
            {totalBrands}
          </span>

          <div>
            <strong>Marcas</strong>
            <small>Fabricantes registrados</small>
          </div>
        </article>
      </section>

      <section className={styles.quickActions}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>
              Accesos rápidos
            </p>

            <h2>Gestiona VANMOTION.</h2>
          </div>
        </div>

        <div className={styles.actionGrid}>
          <Link href="/admin/vehicles">
            <span>01</span>
            <strong>Vehículos</strong>
            <small>
              Añadir, editar, ordenar imágenes y
              cambiar el estado.
            </small>
            <b>Entrar →</b>
          </Link>

          <Link href="/admin/brands">
            <span>02</span>
            <strong>Marcas</strong>
            <small>
              Gestionar fabricantes y organizar el
              catálogo.
            </small>
            <b>Entrar →</b>
          </Link>

          <Link href="/admin/contactos">
            <span>03</span>
            <strong>Contactos</strong>
            <small>
              Consultar solicitudes de personas
              interesadas.
            </small>
            <b>Entrar →</b>
          </Link>

          <Link href="/admin/settings">
            <span>04</span>
            <strong>Configuración</strong>
            <small>
              Teléfono, dirección, WhatsApp, horario y
              redes.
            </small>
            <b>Entrar →</b>
          </Link>

          <Link href="/admin/music">
            <span>05</span>
            <strong>Música</strong>
            <small>
              Añadir y gestionar temas, portadas y
              reproducción.
            </small>
            <b>Entrar →</b>
          </Link>

          <Link href="/admin/ropa">
            <span>06</span>
            <strong>Ropa</strong>
            <small>
              Gestionar productos, precios, tallas, stock
              y visibilidad.
            </small>
            <b>Entrar →</b>
          </Link>
        </div>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>
                Inventario
              </p>

              <h2>Últimos vehículos</h2>
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
                Añade el primero para comenzar la
                colección pública.
              </p>

              <Link href="/admin/vehicles/nuevo">
                Añadir vehículo
              </Link>
            </div>
          ) : (
            <div className={styles.vehicleList}>
              {recentVehicles.map((vehicle) => {
                const image = vehicle.images[0];

                return (
                  <article key={vehicle.id}>
                    <div className={styles.vehicleImage}>
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
                        <span>Sin imagen</span>
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
                        {formatPrice(vehicle.price)}
                      </small>
                    </div>

                    <div className={styles.vehicleStatus}>
                      <span
                        data-status={vehicle.status}
                      >
                        {statusLabel(vehicle.status)}
                      </span>

                      <Link
                        href={`/admin/vehicles/${vehicle.id}/edit`}
                      >
                        Editar
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>
                Interesados
              </p>

              <h2>Últimos contactos</h2>
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
                Los contactos recibidos desde las
                fichas aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className={styles.contactList}>
              {recentContacts.map((contact) => (
                <article key={contact.id}>
                  <div className={styles.contactAvatar}>
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
                    <strong>{contact.name}</strong>

                    <span>{contact.email}</span>

                    <small>
                      {contact.vehicle
                        ? `${contact.vehicle.brand.name} ${contact.vehicle.model}`
                        : "Consulta general"}
                    </small>
                  </div>

                  <div className={styles.contactDate}>
                    <span>
                      {formatDate(contact.createdAt)}
                    </span>

                    <Link href="/admin/contactos">
                      Abrir
                    </Link>
                  </div>
                </article>
              ))}
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
          <div>
            <span />
            <strong>Página pública</strong>
            <small>Activa</small>
          </div>

          <div>
            <span />
            <strong>Base de datos</strong>
            <small>Conectada</small>
          </div>

          <div>
            <span />
            <strong>Reproductor musical</strong>
            <small>Activo</small>
          </div>

          <div>
            <span />
            <strong>Panel administrativo</strong>
            <small>Operativo</small>
          </div>
        </div>
      </section>
    </div>
  );
}
