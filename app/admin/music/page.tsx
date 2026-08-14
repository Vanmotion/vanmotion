import Link from "next/link";

import { prisma } from "@/app/lib/prisma";

import DirectMusicAudioUpload from "./DirectMusicAudioUpload";
import DirectMusicCoverUpload from "./DirectMusicCoverUpload";
import DirectMusicRecommendationCoverUpload from "./DirectMusicRecommendationCoverUpload";
import DirectMusicRecommendationDocumentUpload from "./DirectMusicRecommendationDocumentUpload";

import {
  initializeMusicLibrary,
  saveMusicRecommendation,
  saveMusicTrack,
} from "./actions";
import { removeTrackCover } from "./covers/actions";
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

  const recommendations =
    await prisma.musicRecommendation.findMany({
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
            Música y
            <br />
            reproductor.
          </h1>

          <p>
            Gestiona los temas, el audio y las portadas
            del reproductor oficial de VANMOTION desde
            un único espacio.
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

        <article>
          <strong>{tracksWithCover}</strong>
          <span>Portadas añadidas</span>
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

            <span className={styles.recommendationCount}>
              01–06 · POSICIONES FIJAS
            </span>
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

                  <div className={styles.coverThumbnail}>
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
                        aria-label="Tema sin portada"
                      >
                        <strong>V</strong>
                        <span>Sin portada</span>
                      </div>
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

                </div>

                <div className={styles.coverManager}>
                  <div className={styles.coverStatus}>
                    <span>Portada</span>

                    <strong>
                      {track.coverUrl
                        ? "Portada activa"
                        : "Pendiente de añadir"}
                    </strong>
                  </div>

                  <DirectMusicCoverUpload
                    trackId={track.id}
                    title={track.title}
                    hasCover={Boolean(track.coverUrl)}
                  />

                  {track.coverUrl && (
                    <form
                      action={removeTrackCover}
                      className={
                        styles.removeCoverForm
                      }
                    >
                      <input
                        type="hidden"
                        name="trackId"
                        value={track.id}
                      />

                      <button type="submit">
                        Eliminar
                      </button>
                    </form>
                  )}
                </div>

                <div className={styles.audioPreview}>
                  <audio
                    controls
                    preload="none"
                    src={track.fileUrl}
                  />
                </div>

                <DirectMusicAudioUpload
                  trackId={track.id}
                  trackSlug={track.slug}
                  title={track.title}
                />

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

      <section className={styles.trackSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>
              Selección editorial
            </p>

            <h2>Temas recomendados</h2>
          </div>

          <span className={styles.recommendationCount}>
            {recommendations.filter((item) => item.active).length}
            {" "}activos
          </span>
        </div>

        <p className={styles.recommendationIntro}>
          R01 y R02 son posiciones editoriales fijas. Sustituye el
          contenido de cada ficha para rotar las recomendaciones sin
          cambiar su numeración.
        </p>

        <div className={styles.trackList}>
          {recommendations.map((item, index) => (
            <article
              className={styles.trackCard}
              key={item.id}
            >
              <div className={styles.trackHeader}>
                <div className={styles.trackNumber}>
                  R{String(index + 1).padStart(2, "0")}
                </div>

                <div className={styles.coverThumbnail}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      item.coverUrl ??
                      `https://i.ytimg.com/vi/${item.youtubeVideoId}/hqdefault.jpg`
                    }
                    alt=""
                  />
                </div>

                <div className={styles.trackTitle}>
                  <span>
                    {item.active
                      ? "Recomendado activo"
                      : "Recomendado oculto"}
                  </span>

                  <h3>{item.title}</h3>
                  <p>{item.artist}</p>
                </div>

              </div>

              <form
                action={saveMusicRecommendation}
                className={styles.editForm}
              >
                <input
                  type="hidden"
                  name="id"
                  value={item.id}
                />

                <label>
                  <span>Título</span>
                  <input
                    type="text"
                    name="title"
                    defaultValue={item.title}
                    required
                  />
                </label>

                <label>
                  <span>Artista</span>
                  <input
                    type="text"
                    name="artist"
                    defaultValue={item.artist}
                    required
                  />
                </label>

                <label className={styles.fullField}>
                  <span>Enlace de YouTube</span>
                  <input
                    type="url"
                    name="youtube"
                    defaultValue={`https://www.youtube.com/watch?v=${item.youtubeVideoId}`}
                    required
                  />
                </label>

                <label>
                  <span>Encabezado editorial</span>
                  <input
                    type="text"
                    name="editorialHeading"
                    defaultValue={
                      item.editorialHeading ?? ""
                    }
                    placeholder="1983 · ARCHIVO"
                  />
                </label>

                <label>
                  <span>Estilo visual</span>
                  <select
                    name="editorialStyle"
                    defaultValue={
                      item.editorialStyle ?? "paper"
                    }
                  >
                    <option value="paper">
                      Papel de archivo
                    </option>
                    <option value="memo">
                      Memo / transcripción
                    </option>
                    <option value="document">
                      Documento auténtico
                    </option>
                  </select>
                </label>

                <label className={styles.fullField}>
                  <span>Texto editorial · Español</span>
                  <textarea
                    name="editorialTextEs"
                    rows={4}
                    defaultValue={
                      item.editorialTextEs ?? ""
                    }
                  />
                </label>

                <label className={styles.fullField}>
                  <span>Texto editorial · English</span>
                  <textarea
                    name="editorialTextEn"
                    rows={4}
                    defaultValue={
                      item.editorialTextEn ?? ""
                    }
                  />
                </label>

                <label className={styles.fullField}>
                  <span>Crédito / procedencia</span>
                  <input
                    type="text"
                    name="editorialCredit"
                    defaultValue={
                      item.editorialCredit ?? ""
                    }
                  />
                </label>

                <label className={styles.fullField}>
                  <span>URL de la fuente documental</span>
                  <input
                    type="url"
                    name="documentSourceUrl"
                    defaultValue={
                      item.documentSourceUrl ?? ""
                    }
                    placeholder="https://..."
                  />
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="documentAuthentic"
                    defaultChecked={
                      item.documentAuthentic
                    }
                  />
                  <span>
                    Documento auténtico y procedencia verificada
                  </span>
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={item.active}
                  />

                  <span>
                    Mostrar este tema recomendado
                  </span>
                </label>

                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  Guardar recomendado
                  <span>→</span>
                </button>
              </form>

              <div className={styles.coverStatus}>
                <span>Portada oficial</span>
                <strong>
                  {item.coverUrl
                    ? "Portada activa"
                    : "Pendiente de añadir"}
                </strong>
              </div>

              <DirectMusicRecommendationCoverUpload
                recommendationId={item.id}
                title={item.title}
                hasCover={Boolean(item.coverUrl)}
              />

              <div className={styles.coverStatus}>
                <span>Documento original</span>
                <strong>
                  {item.documentImageUrl
                    ? "Documento añadido"
                    : "Sin documento"}
                </strong>
              </div>

              <DirectMusicRecommendationDocumentUpload
                recommendationId={item.id}
                title={item.title}
                hasDocument={Boolean(
                  item.documentImageUrl,
                )}
              />

            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
