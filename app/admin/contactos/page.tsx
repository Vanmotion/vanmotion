import Link from "next/link";

import {
  deleteContactRequest,
  updateContactStatus,
} from "@/actions/contactActions";
import { prisma } from "../../lib/prisma";
import styles from "./contactos.module.css";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONTACTED: "Contactado",
  CLOSED: "Cerrado",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function ContactosAdminPage() {
  const solicitudes =
    await prisma.contactRequest.findMany({
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

          <p className={styles.sectionName}>
            Administración
          </p>
        </div>

        <nav className={styles.navigation}>
          <Link href="/admin/vehicles">
            Vehículos
          </Link>

          <Link
            href="/admin/contactos"
            className={styles.active}
          >
            Contactos
          </Link>

          <Link href="/">Ver web</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            Solicitudes recibidas
          </p>

          <h1>
            Contactos
            <br />
            de clientes.
          </h1>

          <p className={styles.description}>
            Consultas generales y solicitudes enviadas
            desde las fichas públicas de los vehículos
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
              Cuando una persona complete el formulario
              general o el formulario de un vehículo,
              aparecerá automáticamente en este panel.
            </p>

            <Link href="/contacto">
              Ver contacto público →
            </Link>
          </div>
        ) : (
          <div className={styles.requests}>
            {solicitudes.map(
              (solicitud, index) => {
                const vehicle =
                  solicitud.vehicle;

                const vehicleName = vehicle
                  ? [
                      vehicle.brand.name,
                      vehicle.model,
                      vehicle.version,
                    ]
                      .filter(Boolean)
                      .join(" ")
                  : null;

                const subject =
                  solicitud.subject?.trim() ||
                  "Consulta general";

                const emailSubject = vehicleName
                  ? `VANMOTION · ${vehicleName}`
                  : `VANMOTION · ${subject}`;

                return (
                  <article
                    className={styles.card}
                    key={solicitud.id}
                  >
                    <div
                      className={styles.cardNumber}
                    >
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </div>

                    <div className={styles.cardMain}>
                      <div
                        className={
                          styles.cardHeading
                        }
                      >
                        <div>
                          <p className={styles.date}>
                            {formatDate(
                              solicitud.createdAt,
                            )}
                          </p>

                          <h2>{solicitud.name}</h2>
                        </div>

                        <span
                          className={styles.status}
                        >
                          {statusLabels[
                            solicitud.status
                          ] ?? solicitud.status}
                        </span>
                      </div>

                      <div className={styles.vehicle}>
                        <span>
                          {vehicle
                            ? "Vehículo consultado"
                            : "Tipo de consulta"}
                        </span>

                        {vehicle && vehicleName ? (
                          <Link
                            href={`/coleccion/${vehicle.id}`}
                          >
                            {vehicleName} ·{" "}
                            {vehicle.year} →
                          </Link>
                        ) : (
                          <p
                            className={
                              styles.generalSubject
                            }
                          >
                            {subject}
                          </p>
                        )}
                      </div>

                      <div
                        className={
                          styles.contactGrid
                        }
                      >
                        <div>
                          <span>
                            Correo electrónico
                          </span>

                          <a
                            href={`mailto:${solicitud.email}`}
                          >
                            {solicitud.email}
                          </a>
                        </div>

                        <div>
                          <span>Teléfono</span>

                          {solicitud.phone ? (
                            <a
                              href={`tel:${solicitud.phone}`}
                            >
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
                          href={`mailto:${
                            solicitud.email
                          }?subject=${encodeURIComponent(
                            emailSubject,
                          )}`}
                          className={
                            styles.primaryAction
                          }
                        >
                          Responder por correo
                        </a>

                        {solicitud.phone && (
                          <a
                            href={`tel:${solicitud.phone}`}
                            className={
                              styles.secondaryAction
                            }
                          >
                            Llamar
                          </a>
                        )}

                        {vehicle && (
                          <Link
                            href={`/coleccion/${vehicle.id}`}
                            className={
                              styles.secondaryAction
                            }
                          >
                            Ver vehículo
                          </Link>
                        )}
                      </div>

                      <div
                        className={
                          styles.management
                        }
                      >
                        <form
                          action={updateContactStatus}
                          className={
                            styles.statusForm
                          }
                        >
                          <input
                            type="hidden"
                            name="contactId"
                            value={solicitud.id}
                          />

                          <label
                            htmlFor={`status-${solicitud.id}`}
                          >
                            Estado
                          </label>

                          <select
                            id={`status-${solicitud.id}`}
                            name="status"
                            defaultValue={
                              solicitud.status
                            }
                          >
                            <option value="PENDING">
                              Pendiente
                            </option>

                            <option value="CONTACTED">
                              Contactado
                            </option>

                            <option value="CLOSED">
                              Cerrado
                            </option>
                          </select>

                          <button type="submit">
                            Guardar estado
                          </button>
                        </form>

                        <form
                          action={deleteContactRequest}
                        >
                          <input
                            type="hidden"
                            name="contactId"
                            value={solicitud.id}
                          />

                          <button
                            type="submit"
                            className={
                              styles.dangerAction
                            }
                          >
                            Eliminar solicitud
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </main>
  );
}