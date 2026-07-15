import Link from "next/link";

import { prisma } from "@/app/lib/prisma";

import {
  removeTrackCover,
  saveTrackCover,
} from "./actions";
import styles from "./covers.module.css";

export const dynamic = "force-dynamic";

export default async function MusicCoversPage() {
  const tracks =
    await prisma.musicTrack.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

  const tracksWithCover = tracks.filter(
    (track) => Boolean(track.coverUrl),
  ).length;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            VANMOTION Studio
          </p>

          <h1>
            Portadas
            <br />
            oficiales.
          </h1>

          <p className={styles.description}>
            Sube y sustituye las portadas utilizadas
            por la biblioteca musical de VANMOTION.
          </p>
        </div>

        <Link
          href="/admin/music"
          className={styles.backButton}
        >
          Volver a música
          <span>←</span>
        </Link>
      </section>

      <section className={styles.stats}>
        <article>
          <strong>{tracks.length}</strong>
          <span>Temas registrados</span>
        </article>

        <article>
          <strong>{tracksWithCover}</strong>
          <span>Portadas añadidas</span>
        </article>

        <article>
          <strong>
            {tracks.length - tracksWithCover}
          </strong>
          <span>Portadas pendientes</span>
        </article>
      </section>

      {tracks.length === 0 ? (
        <section className={styles.empty}>
          <h2>No hay canciones registradas.</h2>

          <p>
            Inicializa primero la biblioteca desde el
            módulo principal de música.
          </p>

          <Link href="/admin/music">
            Ir a Música
          </Link>
        </section>
      ) : (
        <section className={styles.library}>
          <div className={styles.heading}>
            <div>
              <p className={styles.darkEyebrow}>
                Biblioteca visual
              </p>

              <h2>Singles de VANMOTION</h2>
            </div>

            <span>
              JPG · PNG · WEBP · AVIF
            </span>
          </div>

          <div className={styles.grid}>
            {tracks.map((track, index) => (
              <article
                key={track.id}
                className={styles.card}
              >
                <div className={styles.cover}>
                  {track.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={track.coverUrl}
                      alt={`Portada de ${track.title}`}
                    />
                  ) : (
                    <div
                      className={
                        styles.coverPlaceholder
                      }
                    >
                      <strong>V</strong>
                      <span>VANMOTION MUSIC</span>
                    </div>
                  )}

                  <span className={styles.number}>
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>
                </div>

                <div className={styles.information}>
                  <span>
                    {track.coverUrl
                      ? "Portada activa"
                      : "Sin portada"}
                  </span>

                  <h3>{track.title}</h3>

                  <p>
                    {track.subtitle ??
                      "VANMOTION · Música original"}
                  </p>
                </div>

                <form
                  action={saveTrackCover}
                  className={styles.uploadForm}
                >
                  <input
                    type="hidden"
                    name="trackId"
                    value={track.id}
                  />

                  <label>
                    <span>
                      Seleccionar nueva portada
                    </span>

                    <input
                      type="file"
                      name="cover"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      required
                    />
                  </label>

                  <button type="submit">
                    {track.coverUrl
                      ? "Sustituir portada"
                      : "Subir portada"}

                    <span>→</span>
                  </button>
                </form>

                {track.coverUrl && (
                  <form
                    action={removeTrackCover}
                    className={styles.removeForm}
                  >
                    <input
                      type="hidden"
                      name="trackId"
                      value={track.id}
                    />

                    <button type="submit">
                      Eliminar portada
                    </button>
                  </form>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}