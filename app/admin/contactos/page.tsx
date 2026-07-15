import Link from "next/link";

import { prisma } from "../../lib/prisma";
import styles from "./contactos.module.css";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function ContactosAdminPage() {
  const solicitudes = await prisma.contactRequest.findMany({
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
  });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/" className={styles.logo}>
            VANMOTION
          </Link>

          <p className={styles.sectionName}>Administración</p>
        </div>

        <nav className={styles.navigation}>
          <Link href="/admin/vehicles">Vehículos</Link>
          <Link href="/admin/contactos" className={styles.active}>
            Contactos
          </Link>
          <Link href="/">Ver web</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Solicitudes recibidas</p>

          <h1>
            Contactos
            <br />
            de clientes.
          </h1>

          <p className={styles.description}>
            Solicitudes enviadas desde las fichas públicas de los vehículos
            VANMOTION.
          </p>
        </div>

        <div className={styles.counter}>
          <strong>{solicitudes.length}</strong>
          <span>
            {solicitudes.length === 1
              ? "Solicitud registrada"
              : "Solicitudes registradas"}
          </span>
        </div>
      </section>

      <section className={styles.content}>
        {solicitudes.length === 0 ? (
          <div className={styles.emptyState}>
            <span>00</span>

            <h2>Todavía no hay solicitudes</h2>

            <p>
              Cuando una persona complete el formulario de un vehículo,
              aparecerá automáticamente en este panel.
            </p>

            <Link href="/coleccion">Ver colección pública →</Link>
          </div>
        ) : (
          <div className={styles.requests}>
            {solicitudes.map((solicitud, index) => {
              const vehicleName = `${solicitud.vehicle.brand.name} ${solicitud.vehicle.model}`;

              return (
                <article className={styles.card} key={solicitud.id}>
                  <div className={styles.cardNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className={styles.cardMain}>
                    <div className={styles.cardHeading}>
                      <div>
                        <p className={styles.date}>
                          {formatDate(solicitud.createdAt)}
                        </p>

                        <h2>{solicitud.name}</h2>
                      </div>

                      <span className={styles.status}>Nueva solicitud</span>
                    </div>

                    <div className={styles.vehicle}>
                      <span>Vehículo consultado</span>

                      <Link href={`/coleccion/${solicitud.vehicle.id}`}>
                        {vehicleName} · {solicitud.vehicle.year} →
                      </Link>
                    </div>

                    <div className={styles.contactGrid}>
                      <div>
                        <span>Correo electrónico</span>

                        <a href={`mailto:${solicitud.email}`}>
                          {solicitud.email}
                        </a>
                      </div>

                      <div>
                        <span>Teléfono</span>

                        {solicitud.phone ? (
                          <a href={`tel:${solicitud.phone}`}>
                            {solicitud.phone}
                          </a>
                        ) : (
                          <p>No indicado</p>
                        )}
                      </div>
                    </div>

                    <div className={styles.message}>
                      <span>Mensaje</span>

                      <p>
                        {solicitud.message?.trim() ||
                          "El cliente no añadió ningún mensaje."}
                      </p>
                    </div>

                    <div className={styles.actions}>
                      <a
                        href={`mailto:${solicitud.email}?subject=${encodeURIComponent(
                          `VANMOTION · ${vehicleName}`,
                        )}`}
                        className={styles.primaryAction}
                      >
                        Responder por correo
                      </a>

                      {solicitud.phone && (
                        <a
                          href={`tel:${solicitud.phone}`}
                          className={styles.secondaryAction}
                        >
                          Llamar
                        </a>
                      )}

                      <Link
                        href={`/coleccion/${solicitud.vehicle.id}`}
                        className={styles.secondaryAction}
                      >
                        Ver vehículo
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}