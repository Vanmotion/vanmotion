/* eslint-disable @next/next/no-img-element -- This preview uses the original VANMOTION gallery image and is loaded on demand. */
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useLanguage } from "@/app/components/language/LanguageProvider";
import { VANMOTION_FORD_IMAGES } from "@/app/ford-lab-3d/types";
import styles from "./FordLabFeature.module.css";

const FordLab = dynamic(() => import("@/app/ford-lab-3d/FordLab3D"), {
  ssr: false,
  loading: () => <p className={styles.loading}>Cargando taller 3D · Loading 3D workshop…</p>,
});

export default function FordLabFeature() {
  const {language}=useLanguage();
  const es=language!=="en";
  const [started,setStarted]=useState(false);
  return <section className={styles.feature} id="ford-custom-lab" aria-labelledby="ford-lab-heading">
    <div className={styles.intro}>
      <div>
        <span className={styles.eyebrow}>VANMOTION / FORD E-150 / 360°</span>
        <h2 id="ford-lab-heading">{es?"TU FORD. TU ESTILO.":"YOUR FORD. YOUR STYLE."}</h2>
        <p>{es?"Explora la Econoline en 360°, cambia llantas, neumáticos, pintura y accesorios. Descubre las opciones de motor y guarda tu preparación.":"Explore the Econoline in 360°, change wheels, tyres, paint and accessories. Discover engine options and save your build."}</p>
      </div>
      {started && <button className={styles.close} type="button" onClick={()=>setStarted(false)}>{es?"CERRAR TALLER":"CLOSE WORKSHOP"} <span aria-hidden="true">−</span></button>}
    </div>
    {started ? <FordLab embedded /> : <div className={styles.preview}>
      {/* Images come from the owner's VANMOTION vehicle gallery. */}
      <img src={VANMOTION_FORD_IMAGES[2]} alt={es?"Ford E-150 azul de VANMOTION":"Blue VANMOTION Ford E-150"} loading="lazy" />
      <div className={styles.veil} />
      <div className={styles.previewContent}>
        <span className={styles.previewIndex}>01 / 360° CUSTOM GARAGE</span>
        <strong>FORD E-150<span>.</span></strong>
        <p>{es?"La experiencia interactiva de VANMOTION":"VANMOTION's interactive custom garage"}</p>
        <button type="button" onClick={()=>setStarted(true)}>{es?"ABRIR TALLER 3D":"OPEN 3D WORKSHOP"} <span aria-hidden="true">↗</span></button>
        <small>{es?"Gira, personaliza y guarda · versión de demostración":"Rotate, customize and save · demonstration build"}</small>
      </div>
    </div>}
    <p className={styles.footnote}>{es?"Preparaciones visuales de demostración. Comprueba la compatibilidad y la homologación antes de montar componentes reales.":"Visual demonstration builds. Verify fitment and regulations before installing real components."}</p>
  </section>;
}
