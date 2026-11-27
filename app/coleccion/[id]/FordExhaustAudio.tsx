"use client";

/**
 * VANMOTION FORD LAB 011 · reproduccion V8 de demostracion en la pestana SONIDO.
 * No toca el visor WebGL ni los datos de motor/vehiculo.
 *
 * Adaptador no destructivo: crea portales React en los dos paneles del modo
 * sonido del taller, y oculta la interfaz A/B de subida de archivos anterior.
 * Las interfaces originales permanecen montadas y recuperables al revertir.
 */
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./FordExhaustAudio.module.css";

type Language = "es" | "en";
type Track = "classic" | "sport";
type Targets = { left: HTMLElement | null; right: HTMLElement | null };

const ASSETS: Record<Track, string> = {
  classic: "/ford-lab/audio/oem-v8.mp3",
  sport: "/ford-lab/audio/sport-v8-011.mp3",
};

const CLEAN_TABS_CSS = `
/* Solo etiquetas marcadas dentro del taller Ford; no afecta al resto de VANMOTION. */
[data-vm-hide-motor="true"], [data-vm-quiet-label="true"] { display: none !important; }
[data-vm-clean-tabs="true"] { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
[data-vm-short-label] { font-size: 0 !important; }
[data-vm-short-label]::after { content: attr(data-vm-short-label); font-size: 10px; font-weight: 750; line-height: 1.5; letter-spacing: .12em; }
`;

function cleanWorkshopNavigation() {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('button,[role="tab"]'));
  const label = (el: Element) => normalizedText(el);
  const motor = candidates.find(el => /^(?:0?2\s+)?(?:MOTOR|ENGINE)$/.test(label(el)));
  if (motor && motor.parentElement) {
    const group = motor.parentElement;
    const matches = Array.from(group.querySelectorAll<HTMLElement>('button,[role="tab"]'));
    const hasExterior = matches.some(el => /EXTERIOR 3D|EXTERIOR|EXTERIOR 360/.test(label(el)));
    const hasSound = matches.some(el => /SONIDO|SOUND/.test(label(el)));
    if (hasExterior && hasSound && matches.length === 3) {
      if (!motor.dataset.vmHideMotor) {
        motor.dataset.vmHideMotor = "true";
        motor.setAttribute("aria-hidden", "true");
        motor.setAttribute("tabindex", "-1");
      }
      if (group.dataset.vmCleanTabs !== "true") group.dataset.vmCleanTabs = "true";
      for (const button of matches) {
        if (button === motor) continue;
        for (const leaf of button.querySelectorAll<HTMLElement>('span,small')) {
          if (/^0?[1-3]$/.test(label(leaf)) && !leaf.dataset.vmQuietLabel) leaf.dataset.vmQuietLabel="true";
        }
      }
    }
  }
  // Ocultamos solo rótulos ornamentales, no avisos de seguridad ni compatibilidad.
  const decorative = /^(?:CONFIGURADOR\s*\/\s*0*7|(?:0?[1-3]\s*\/\s*)?(?:VISTA 360.?|ESTUDIO DE SONIDO)|FOTOGRAF[ÍI]AS DE VANMOTION|VANMOTION\s*\/\s*TALLER 3D|DISE[ÑN]O RESPONSIVE\s*[·–-]\s*REVISI[ÓO]N FINAL)$/;
  for (const node of document.querySelectorAll<HTMLElement>('span,p,small,div')) {
    if (node.children.length) continue;
    const text = label(node);
    if (decorative.test(text) && !node.dataset.vmQuietLabel) node.dataset.vmQuietLabel="true";
    const numbered = text.match(/^0?[1-9]\s*[/·–-]\s*(PINTURA|PAINT|LLANTAS|WHEELS|NEUM[ÁA]TICOS|TIRES|TYRES|ACCESORIOS|ACCESSORIES|ADMISI[ÓO]N|INTAKE|ESCAPE|EXHAUST|AMORTIGUACI[ÓO]N|SUSPENSION|CHASIS|CHASSIS)$/);
    if (numbered && !node.dataset.vmShortLabel) node.dataset.vmShortLabel = numbered[1];
  }
}

const HIDDEN_LEGACY_UI = `
[data-vm-audio-zone="left"] > :not([data-vm-audio-player="true"]),
[data-vm-audio-zone="right"] > :not([data-vm-audio-player="true"]) {
  display: none !important;
}
`;

function normalizedText(element: Element): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim().toUpperCase();
}

function findHeading(words: RegExp): HTMLElement | null {
  const headings = document.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6");
  for (const heading of headings) {
    if (words.test(normalizedText(heading))) return heading;
  }
  return null;
}

function findLeftSlot(): HTMLElement | null {
  const anchor = findHeading(/ESCUCHA LAS DIFERENCIAS|HEAR THE DIFFERENCE|LISTEN TO THE DIFFERENCE/);
  if (!anchor) return null;
  let parent: HTMLElement | null = anchor.parentElement;
  // Elegimos el contenedor mas pequeno que incluya LAS DOS cargas anteriores.
  for (let depth = 0; depth < 9 && parent; depth++, parent = parent.parentElement) {
    const text = normalizedText(parent);
    if (text.includes("PERSONALIZA.") || text.includes("PERSONALIZE.")) break;
    const uploads = Array.from(parent.querySelectorAll("button,label"))
      .filter((item) => /ELEGIR AUDIO PROPIO|CHOOSE (YOUR )?OWN AUDIO|SELECT (YOUR )?OWN AUDIO/i.test(normalizedText(item))).length;
    if (uploads >= 2 || parent.querySelectorAll('input[type="file"]').length >= 2) {
      return parent;
    }
  }
  return null;
}

function findRightSlot(): HTMLElement | null {
  const heading = findHeading(/^AUDIO PROPIO\.?$|^OWN AUDIO\.?$|^YOUR AUDIO\.?$/);
  if (!heading) return null;
  let parent: HTMLElement | null = heading.parentElement;
  let fallback: HTMLElement | null = parent;
  // Evitamos encapsular el boton GUARDAR PREPARACION o la cabecera de pestañas.
  for (let depth = 0; depth < 8 && parent; depth++, parent = parent.parentElement) {
    const text = normalizedText(parent);
    if (/PERSONALIZA\.|PERSONALIZE\.|GUARDAR PREPARACI[ÓO]N|SAVE CONFIGURATION/.test(text)) break;
    if (/PREPARACI[ÓO]N ACTUAL|CURRENT (SETUP|CONFIGURATION)/.test(text)) return parent;
    fallback = parent;
  }
  return fallback;
}

export default function FordExhaustAudio({ language = "es" }: { language?: Language }) {
  const en = language === "en";
  const [targets, setTargets] = useState<Targets>({ left: null, right: null });
  const [active, setActive] = useState<Track | null>(null);
  const [volume, setVolume] = useState(70);
  const [message, setMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previouslyAttached = useRef(false);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    setActive(null);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = volume / 100;
    audioRef.current = audio;
    const onEnd = () => setActive(null);
    const onError = () => {
      setActive(null);
      setMessage(en ? "This reference could not be played." : "No se ha podido reproducir esta muestra.");
    };
    const onVisibility = () => { if (document.hidden) { audio.pause(); audio.currentTime = 0; setActive(null); } };
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onError);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      audio.pause();
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisibility);
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
    // Ambos textos son notas de usuario; el player se crea una sola vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    let scheduled = false;
    const scan = () => {
      scheduled = false;
      cleanWorkshopNavigation();
      const nextLeft = findLeftSlot();
      const nextRight = findRightSlot();
      if (nextLeft) nextLeft.dataset.vmAudioZone = "left";
      if (nextRight) nextRight.dataset.vmAudioZone = "right";
      setTargets((prev) => {
        if (prev.left === nextLeft && prev.right === nextRight) return prev;
        if (prev.left && prev.left !== nextLeft) delete prev.left.dataset.vmAudioZone;
        if (prev.right && prev.right !== nextRight) delete prev.right.dataset.vmAudioZone;
        return { left: nextLeft, right: nextRight };
      });
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(scan);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    scan();
    return () => {
      observer.disconnect();
      if (targets.left) delete targets.left.dataset.vmAudioZone;
      if (targets.right) delete targets.right.dataset.vmAudioZone;
    };
    // El cleanup de atributos tambien se realiza al desenlazar cada portal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (previouslyAttached.current && !targets.left) stop();
    previouslyAttached.current = Boolean(targets.left);
  }, [targets.left, stop]);

  async function toggle(track: Track) {
    const audio = audioRef.current;
    if (!audio) return;
    setMessage(null);
    if (active === track) { stop(); return; }
    audio.pause();
    audio.currentTime = 0;
    audio.src = ASSETS[track];
    try {
      await audio.play();
      setActive(track);
    } catch {
      setActive(null);
      setMessage(en ? "Playback unavailable. Please try again." : "Audio no disponible. Vuelve a intentarlo.");
    }
  }

  const trackConfig: { key: Track; title: string; subtitle: string }[] = [
    { key: "classic", title: "V8 CLASSIC", subtitle: en ? "Idle and revving" : "Ralentí y aceleración" },
    { key: "sport", title: "SPORT", subtitle: en ? "Driving-engine sound" : "Motor de coche en marcha" },
  ];

  return (
    <>
      <style>{CLEAN_TABS_CSS}</style>
      {targets.left && createPortal(
        <div data-vm-audio-player="true" className={styles.stage} aria-label={en ? "V8 demo sound studio" : "Estudio de sonido V8 de demostración"}>
          <style>{HIDDEN_LEGACY_UI}</style>
          <div className={styles.topline}><span>VANMOTION</span><span className={styles.live}>SOUND STUDIO</span></div>
          <h2 className={styles.title}>{en ? "CHOOSE THE SOUND." : "ELIGE EL SONIDO."}</h2>
          <p className={styles.description}>{en ? "Tap to play. Tap again to stop." : "Pulsa para escuchar. Vuelve a pulsar para parar."}</p>
          <div className={styles.cards}>
            {trackConfig.map((track) => (
              <button className={`${styles.soundCard} ${active === track.key ? styles.playing : ""}`}
                key={track.key} type="button" aria-pressed={active === track.key} onClick={() => void toggle(track.key)}>
                <span className={styles.playCircle} aria-hidden="true">{active === track.key ? "■" : "▶"}</span>
                <span className={styles.trackCopy}><strong>{track.title}</strong><small>{track.subtitle}</small></span>
                <span className={styles.status}>{active === track.key ? (en ? "STOP" : "PARAR") : "PLAY"}</span>
              </button>
            ))}
          </div>
          <div className={styles.volumeBar}>
            <label htmlFor="vm-ford-lab-volume">{en ? "VOLUME" : "VOLUMEN"}</label>
            <input id="vm-ford-lab-volume" type="range" min={0} max={100} step={5}
              value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
            <span>{volume}%</span>
          </div>
          {message && <p className={styles.error} role="alert">{message}</p>}
          <p className={styles.disclaimer}>{en ? "Demo sounds only. This Ford E-150 has a 4.2 V6." : "Sonidos de demostración. Este Ford E-150 lleva un V6 4.2."}</p>
        </div>, targets.left)}
      {targets.right && createPortal(
        <section data-vm-audio-player="true" className={styles.side} aria-label={en ? "Sound reference information" : "Información sobre las muestras"}>
          <span className={styles.sideEyebrow}>VANMOTION</span>
          <h3>{en ? "THE SOUND." : "EL SONIDO."}</h3>
          <p>{en ? "Classic or sport. Choose your sound." : "Clásico o deportivo. Tú eliges."}</p>

        </section>, targets.right)}
    </>
  );
}
