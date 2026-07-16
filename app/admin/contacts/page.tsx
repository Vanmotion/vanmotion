import Link from "next/link";

import { updateContactStatus } from "@/actions/contactActions";
import { prisma } from "@/app/lib/prisma";
import DeleteContactButton from "./DeleteContactButton";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONTACTED: "Contactado",
  CLOSED: "Cerrado",
};

const statusClasses: Record<string, string> = {
  PENDING:
    "border-amber-500/20 bg-amber-500/10 text-amber-400",
  CONTACTED:
    "border-blue-500/20 bg-blue-500/10 text-blue-400",
  CLOSED:
    "border-green-500/20 bg-green-500/10 text-green-400",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function ContactsPage() {
  const contacts =
    await prisma.contactRequest.findMany({
      include: {
        vehicle: {
          include: {
            brand: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const totalContacts = contacts.length;

  const pendingContacts = contacts.filter(
    (contact) => contact.status === "PENDING",
  ).length;

  const contactedContacts = contacts.filter(
    (contact) =>
      contact.status === "CONTACTED",
  ).length;

  const closedContacts = contacts.filter(
    (contact) => contact.status === "CLOSED",
  ).length;

  const statistics = [
    {
      label: "Solicitudes totales",
      value: totalContacts,
    },
    {
      label: "Pendientes",
      value: pendingContacts,
    },
    {
      label: "Contactadas",
      value: contactedContacts,
    },
    {
      label: "Cerradas",
      value: closedContacts,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            Clientes
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-white">
            Contactos
          </h1>

          <p className="mt-3 max-w-2xl text-white/50">
            Gestiona las consultas generales y las
            solicitudes de información recibidas desde
            las fichas públicas de los vehículos
            VANMOTION.
          </p>
        </div>

        <Link
          href="/contacto"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          Ver contacto público
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-sm text-white/40">
              {item.label}
            </p>

            <p className="mt-3 text-3xl font-semibold text-white">
              {item.value}
            </p>
          </article>
        ))}
      </div>

      <article className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-7 py-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              Bandeja de entrada
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Solicitudes recibidas
            </h2>
          </div>

          <p className="text-sm text-white/40">
            {totalContacts}{" "}
            {totalContacts === 1
              ? "solicitud"
              : "solicitudes"}
          </p>
        </div>

        {contacts.length === 0 ? (
          <div className="px-7 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-white/40">
              ✉
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              No hay solicitudes
            </h3>

            <p className="mt-2 text-sm text-white/40">
              Las consultas generales y las solicitudes
              enviadas desde la web pública aparecerán
              aquí.
            </p>

            <Link
              href="/contacto"
              className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold !text-black transition hover:bg-white/80"
            >
              Ver contacto público
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {contacts.map((contact) => {
              const vehicle = contact.vehicle;

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
                contact.subject?.trim() ||
                "Consulta general";

              return (
                <section
                  key={contact.id}
                  className="px-7 py-7"
                >
                  <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                            statusClasses[
                              contact.status
                            ] ??
                            "border-white/10 bg-white/5 text-white/50"
                          }`}
                        >
                          {statusLabels[
                            contact.status
                          ] ?? contact.status}
                        </span>

                        <span className="text-xs text-white/30">
                          {formatDate(
                            contact.createdAt,
                          )}
                        </span>

                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/45">
                          {vehicle
                            ? "Consulta de vehículo"
                            : "Consulta general"}
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl font-semibold text-white">
                        {contact.name}
                      </h3>

                      <p className="mt-2 text-sm text-white/40">
                        {vehicle
                          ? "Interesado en:"
                          : "Tipo de consulta:"}
                      </p>

                      {vehicle && vehicleName ? (
                        <Link
                          href={`/admin/vehicles/${vehicle.id}`}
                          className="mt-1 inline-block font-medium text-white transition hover:text-white/60"
                        >
                          {vehicleName} →
                        </Link>
                      ) : (
                        <p className="mt-1 font-medium text-white">
                          {subject}
                        </p>
                      )}
                    </div>

                    {vehicle && (
                      <Link
                        href={`/admin/vehicles/${vehicle.id}`}
                        className="inline-flex w-fit items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
                      >
                        Ver vehículo
                      </Link>
                    )}
                  </div>

                  <div className="mt-7 grid gap-4 md:grid-cols-2">
                    <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                        Correo electrónico
                      </p>

                      <a
                        href={`mailto:${contact.email}`}
                        className="mt-3 block break-all font-medium text-white transition hover:text-white/60"
                      >
                        {contact.email}
                      </a>
                    </article>

                    <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                        Teléfono
                      </p>

                      {contact.phone ? (
                        <a
                          href={`tel:${contact.phone}`}
                          className="mt-3 block font-medium text-white transition hover:text-white/60"
                        >
                          {contact.phone}
                        </a>
                      ) : (
                        <p className="mt-3 text-white/40">
                          No indicado
                        </p>
                      )}
                    </article>
                  </div>

                  <article className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                      Mensaje
                    </p>

                    <p className="mt-4 whitespace-pre-line leading-7 text-white/60">
                      {contact.message ||
                        "El cliente no ha añadido ningún mensaje."}
                    </p>
                  </article>

                  <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 lg:flex-row lg:items-end lg:justify-between">
                    <form
                      action={updateContactStatus}
                      className="flex flex-col gap-4 sm:flex-row sm:items-end"
                    >
                      <input
                        type="hidden"
                        name="contactId"
                        value={contact.id}
                      />

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-white/50">
                          Estado de la solicitud
                        </span>

                        <select
                          id={`status-${contact.id}`}
                          name="status"
                          defaultValue={contact.status}
                          className="w-full min-w-52 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/30"
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
                      </label>

                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold !text-black transition hover:bg-white/80"
                      >
                        Guardar estado
                      </button>
                    </form>

                    <DeleteContactButton
                      contactId={contact.id}
                      contactName={contact.name}
                    />
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}