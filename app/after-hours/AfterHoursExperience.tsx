"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useMusicPlayer } from "@/app/components/music/MusicPlayerContext";
import styles from "./after-hours.module.css";

const CHAPTER_DURATION = 11000;

const scenes = [
  {
    id: "prologue",
    number: "00",
    eyebrow: "UN VIAJE POR EL UNIVERSO VANMOTION",
    top: "LA NOCHE",
    bottom: "NO SE DETIENE.",
    text: "Un motor. Una frecuencia. Una forma de vivir.",
    image: "/brand/vanmotion-ford-hero.webp",
    action: "/coleccion",
    actionLabel: "DESCUBRIR VEHÍCULOS",
  },
  {
    id: "machine",
    number: "01",
    eyebrow: "THE MACHINE / LA MÁQUINA",
    top: "EL MOTOR",
    bottom: "NOS MUEVE.",
    text: "No elegimos máquinas por sus cifras. Las elegimos por lo que nos hacen sentir.",
    image: "/experience/vehicles/noche.webp",
    action: "/coleccion",
    actionLabel: "EXPLORAR COLECCIÓN",
  },
  {
    id: "sound",
    number: "02",
    eyebrow: "THE SOUND / EL SONIDO",
    top: "SUBE EL",
    bottom: "VOLUMEN.",
    text: "Cada noche tiene un ritmo. Cada trayecto, una banda sonora.",
    image: "/experience/music/noche.webp",
    action: "/musica",
    actionLabel: "EXPLORAR MÚSICA",
  },
  {
    id: "street",
    number: "03",
    eyebrow: "THE STREET / LA CALLE",
    top: "LA CALLE",
    bottom: "ES NUESTRA.",
    text: "La cultura no se observa desde fuera. Se vive, se crea y se lleva puesta.",
    image: "/experience/streetwear/noche.webp",
    action: "/ropa",
    actionLabel: "EXPLORAR STREETWEAR",
  },
  {
    id: "finale",
    number: "04",
    eyebrow: "MADRID / SIEMPRE EN MOVIMIENTO",
    top: "ESTO ES",
    bottom: "VANMOTION.",
    text: "Vehículos. Música. Streetwear. Una sola cultura.",
    image: "/brand/horario-home/vanmotion-home-noche.webp",
    action: "/community",
    actionLabel: "ENTRAR EN COMMUNITY",
  },
] as const;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function AfterHoursExperience() {
  const [chapter, setChapter] = useState(0);
  const [auto, setAuto] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [clock, setClock] = useState("--:--");
  const shellRef = useRef<HTMLElement | null>(null);
  const { tracks, isPlaying, togglePlayback } = useMusicPlayer();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const tick = () => {
      const formatted = new Intl.DateTimeFormat("es-ES", {
        timeZone: "Europe/Madrid",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());
      setClock(formatted);
    };
    tick();
    const timer = window.setInterval(tick, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!auto || reducedMotion || chapter === 0 || chapter >= 4) return;
    const timer = window.setTimeout(() => {
      setChapter((current) => Math.min(current + 1, 4));
    }, CHAPTER_DURATION);
    return () => window.clearTimeout(timer);
  }, [chapter, auto, reducedMotion]);

  const next = useCallback(() => setChapter((current) => Math.min(4, current + 1)), []);
  const previous = useCallback(() => setChapter((current) => Math.max(0, current - 1)), []);
  const restart = useCallback(() => {
    setChapter(0);
    setAuto(true);
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight" && chapter > 0) next();
      if (event.key === "ArrowLeft" && chapter > 0) previous();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [chapter, next, previous]);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    shellRef.current?.style.setProperty("--shift-x", `${(-x * 9).toFixed(2)}px`);
    shellRef.current?.style.setProperty("--shift-y", `${(-y * 7).toFixed(2)}px`);
  };

  const scene = scenes[chapter];
  const start = () => {
    setAuto(true);
    setChapter(1);
  };

  return (
    <main
      ref={shellRef}
      className={styles.afterHours}
      data-chapter={scene.id}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        shellRef.current?.style.setProperty("--shift-x", "0px");
        shellRef.current?.style.setProperty("--shift-y", "0px");
      }}
    >
      <div className={styles.scenePhoto} key={`photo-${scene.id}`} aria-hidden="true">
        <Image
          src={scene.image}
          alt=""
          fill
          priority={chapter === 0}
          sizes="100vw"
          quality={80}
          className={styles.photo}
        />
      </div>
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.scanlines} aria-hidden="true" />
      <div className={styles.lightRail} aria-hidden="true" />
      <div className={styles.edgeFrame} aria-hidden="true" />

      <header className={styles.header}>
        <Link href="/" aria-label="Ir a la portada de VANMOTION" className={styles.brand}>
          <Image src="/brand/vanmotion-mark.webp" alt="" width={49} height={26} className={styles.brandMark} />
          <span>VANMOTION</span>
        </Link>
        <div className={styles.meta}>
          <span className={styles.liveDot} />
          <span>MADRID · {clock}</span>
          <span className={styles.metaDivider}>/</span>
          <span>AFTER HOURS — 001</span>
        </div>
        <Link href="/" className={styles.exitLink}>SALIR <span aria-hidden="true">↗</span></Link>
      </header>

      <div key={`copy-${scene.id}`} className={styles.copyWrap}>
        <div className={styles.kicker}><span className={styles.kickerLine} />{scene.eyebrow}</div>
        {chapter === 0 ? (
          <>
            <p className={styles.chapterMeta}>VANMOTION PRESENTA / EDICIÓN NOCTURNA</p>
            <h1 className={styles.title}>
              <span>AFTER</span>
              <span className={styles.titleLight}>HOURS<span className={styles.dot}>.</span></span>
            </h1>
            <p className={styles.description}>{scene.text}</p>
            <button type="button" onClick={start} className={styles.startButton}>
              <span className={styles.startIcon}>▶</span>
              ENCENDER LA EXPERIENCIA
              <span className={styles.buttonArrow}>↗</span>
            </button>
          </>
        ) : chapter === 4 ? (
          <>
            <p className={styles.chapterMeta}>04 / THE FINALE</p>
            <h1 className={styles.title}>
              <span>{scene.top}</span>
              <span className={styles.titleLight}>{scene.bottom}<span className={styles.dot}> </span></span>
            </h1>
            <p className={styles.description}>{scene.text}</p>
            <div className={styles.finalLinks}>
              <Link href="/coleccion">VEHÍCULOS <span>↗</span></Link>
              <Link href="/musica">MÚSICA <span>↗</span></Link>
              <Link href="/ropa">STREETWEAR <span>↗</span></Link>
              <Link href="/community">COMMUNITY <span>↗</span></Link>
            </div>
          </>
        ) : (
          <>
            <p className={styles.chapterMeta}>{scene.number} / 03 — VANMOTION AFTER HOURS</p>
            <h1 className={styles.title}>
              <span>{scene.top}</span>
              <span className={styles.titleLight}>{scene.bottom}</span>
            </h1>
            <p className={styles.description}>{scene.text}</p>
            <Link href={scene.action} className={styles.inlineLink}>
              {scene.actionLabel} <span aria-hidden="true">↗</span>
            </Link>
          </>
        )}
      </div>

      <aside className={styles.rightCounter} aria-hidden="true">
        <span>VANMOTION — NIGHT EDITION</span>
        <strong>{pad(chapter)}<span>/</span>04</strong>
      </aside>

      <footer className={styles.footer}>
        <div className={styles.footerLabel}>
          <span className={styles.orangeDash} />
          <span>BUILT IN MADRID · SINCE 2026</span>
        </div>
        {chapter === 0 ? (
          <p className={styles.introHint}>UNA EXPERIENCIA INTERACTIVA · SIN AUTOPLAY DE AUDIO</p>
        ) : (
          <div className={styles.timeline} aria-label={`Capítulo ${chapter} de 4`}>
            {[1, 2, 3, 4].map((number) => (
              <button
                key={number}
                type="button"
                title={`Ir al capítulo ${number}`}
                aria-label={`Ir al capítulo ${number}`}
                aria-current={chapter === number ? "step" : undefined}
                className={`${styles.timelineStep} ${chapter >= number ? styles.stepReached : ""}`}
                onClick={() => setChapter(number)}
              >
                {chapter === number && auto && !reducedMotion && chapter < 4 ? (
                  <span key={`fill-${chapter}-${auto}`} className={styles.stepProgress} />
                ) : null}
              </button>
            ))}
          </div>
        )}
        <div className={styles.controls}>
          {tracks.length > 0 && (
            <button
              type="button"
              onClick={() => void togglePlayback()}
              className={styles.controlButton}
              aria-pressed={isPlaying}
              title="Activar o pausar música del reproductor VANMOTION"
            >
              {isPlaying ? "◖))" : "♪"} {isPlaying ? "PAUSAR MÚSICA" : "ACTIVAR MÚSICA"}
            </button>
          )}
          {chapter > 0 && chapter < 4 && (
            <button
              type="button"
              className={styles.controlButton}
              aria-pressed={auto && !reducedMotion}
              onClick={() => setAuto((value) => !value)}
              disabled={reducedMotion}
              title={reducedMotion ? "Reproducción automática desactivada por accesibilidad" : "Pausar o reanudar avance automático"}
            >
              {auto && !reducedMotion ? "Ⅱ PAUSA" : "▶ AUTO"}
            </button>
          )}
          {chapter > 1 && chapter < 4 && (
            <button type="button" className={styles.controlButton} onClick={previous}>← ANTERIOR</button>
          )}
          {chapter > 0 && chapter < 4 && (
            <button type="button" className={`${styles.controlButton} ${styles.nextButton}`} onClick={next}>SIGUIENTE →</button>
          )}
          {chapter === 4 && (
            <button type="button" className={styles.controlButton} onClick={restart}>↺ REPETIR</button>
          )}
        </div>
      </footer>
    </main>
  );
}
