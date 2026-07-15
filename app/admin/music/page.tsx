import Link from "next/link";

import { prisma } from "@/app/lib/prisma";

import {
  initializeMusicLibrary,
  moveMusicTrack,
  saveMusicTrack,
} from "./actions";
import styles from "./music-admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminMusicPage() {
  const tracks = await prisma.musicTrack.findMany({
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  const activeTracks = tracks.filter(
    (track) => track.active,
  ).length;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            VANMOTION Studio
          </p>

          <h1>
            Música y
            <br />
            reproductor.
          </h1>

          <p>
            Gestiona los temas que forman parte del
            reproductor oficial de VANMOTION.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link
            href="/musica"
            target="_blank"
            className={styles.publicButton}
          >
            Ver reproductor público
            <span>↗</span>
          </Link>
        </div>
      </section>

      <section className={styles.stats}>
        <article>
          <strong>{tracks.length}</strong>
          <span>Temas registrados</span>
        </article>

        <article>
          <strong>{activeTracks}</strong>
          <span>Temas activos</span>
        </article>

        <article>
          <strong>
            {tracks.length - activeTracks}
          </strong>
          <span>Temas ocultos</span>
        </article>
      </section>

      {tracks.length === 0 ? (
        <section className={styles.emptyState}>
          <span>V</span>

          <h2>La biblioteca está vacía.</h2>

          <p>
            Importa automáticamente los cuatro temas
            que ya están guardados en
            <code> public/music</code>.
          </p>

          <form action={initializeMusicLibrary}>
            <button type="submit">
              Inicializar biblioteca
              <span>＋</span>
            </button>
          </form>
        </section>
      ) : (
        <section className={styles.trackSection}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>
                Biblioteca musical
              </p>

              <h2>Temas de VANMOTION</h2>
            </div>

            <form action={initializeMusicLibrary}>
              <button
                type="submit"
                className={styles.syncButton}
              >
                Sincronizar temas
              </button>
            </form>
          </div>

          <div className={styles.trackList}>
            {tracks.map((track, index) => (
              <article
                className={styles.trackCard}
                key={track.id}
              >
                <div className={styles.trackHeader}>
                  <div className={styles.trackNumber}>
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </div>

                  <div className={styles.trackTitle}>
                    <span>
                      {track.active
                        ? "Publicado"
                        : "Oculto"}
                    </span>

                    <h3>{track.title}</h3>

                    <p>{track.fileUrl}</p>
                  </div>

                  <div className={styles.orderButtons}>
                    <form action={moveMusicTrack}>
                      <input
                        type="hidden"
                        name="id"
                        value={track.id}
                      />

                      <input
                        type="hidden"
                        name="direction"
                        value="up"
                      />

                      <button
                        type="submit"
                        disabled={index === 0}
                        aria-label="Subir canción"
                      >
                        ↑
                      </button>
                    </form>

                    <form action={moveMusicTrack}>
                      <input
                        type="hidden"
                        name="id"
                        value={track.id}
                      />

                      <input
                        type="hidden"
                        name="direction"
                        value="down"
                      />

                      <button
                        type="submit"
                        disabled={
                          index === tracks.length - 1
                        }
                        aria-label="Bajar canción"
                      >
                        ↓
                      </button>
                    </form>
                  </div>
                </div>

                <div className={styles.audioPreview}>
                  <audio
                    controls
                    preload="none"
                    src={track.fileUrl}
                  />
                </div>

                <form
                  action={saveMusicTrack}
                  className={styles.editForm}
                >
                  <input
                    type="hidden"
                    name="id"
                    value={track.id}
                  />

                  <label>
                    <span>Título</span>

                    <input
                      type="text"
                      name="title"
                      defaultValue={track.title}
                      required
                    />
                  </label>

                  <label>
                    <span>Descripción</span>

                    <input
                      type="text"
                      name="subtitle"
                      defaultValue={
                        track.subtitle ?? ""
                      }
                      placeholder="VANMOTION · Single original"
                    />
                  </label>

                  <label>
                    <span>Formato</span>

                    <select
                      name="format"
                      defaultValue={track.format}
                    >
                      <option value="MP3">MP3</option>
                      <option value="WAV">WAV</option>
                      <option value="AAC">AAC</option>
                      <option value="M4A">M4A</option>
                    </select>
                  </label>

                  <label>
                    <span>Duración</span>

                    <input
                      type="text"
                      name="duration"
                      defaultValue={
                        track.duration ?? ""
                      }
                      placeholder="3:45"
                    />
                  </label>

                  <label
                    className={styles.fullField}
                  >
                    <span>Enlace oficial externo</span>

                    <input
                      type="url"
                      name="externalUrl"
                      defaultValue={
                        track.externalUrl ?? ""
                      }
                      placeholder="Spotify, HearNow..."
                    />
                  </label>

                  <label
                    className={styles.fullField}
                  >
                    <span>
                      Sustituir archivo de audio
                    </span>

                    <input
                      type="file"
                      name="audio"
                      accept=".mp3,.wav,.aac,.m4a,audio/*"
                    />

                    <small>
                      Déjalo vacío para conservar el
                      archivo actual.
                    </small>
                  </label>

                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={track.active}
                    />

                    <span>
                      Mostrar esta canción en la web
                    </span>
                  </label>

                  <button
                    type="submit"
                    className={styles.saveButton}
                  >
                    Guardar cambios
                    <span>→</span>
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}