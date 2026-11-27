import type { Metadata } from "next";
import Link from "next/link";
import FordLabFeature from "@/app/coleccion/[id]/FordLabFeature";
import { VANMOTION_FORD_IMAGES } from "@/app/ford-lab-3d/types";
import styles from "./preview.module.css";

export const metadata: Metadata = {
  title: "Ford E-150 · Preview de ficha y taller 3D · VANMOTION",
  description: "Vista previa privada y sin base de datos de la integración de FORD LAB en la ficha de Ford E-150.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function FordDetailPreview() {
  return <main className={styles.page}>
    <nav className={styles.topbar} aria-label="Vista previa local">
      <Link href="/" className={styles.brand}>VANMOTION<span>.</span></Link>
      <span>FORD E-150 / FICHA · PREVIEW LOCAL</span>
    </nav>
    <header className={styles.title}>
      <p>VANMOTION / VEHÍCULO EMBLEMA</p>
      <h1>FORD E-150</h1>
      <span>2000 · 4.2 V6 · TRACCIÓN TRASERA</span>
    </header>
    <div className={styles.intro}>
      <div className={styles.photo}>
        <img src={VANMOTION_FORD_IMAGES[2]} alt="Ford E-150 azul de VANMOTION" />
        <span>FOTOGRAFÍA VANMOTION</span>
      </div>
      <aside className={styles.data}>
        <p>01 / DATOS DEL VEHÍCULO</p>
        <h2>VEHÍCULO EMBLEMA</h2>
        <strong>NO DISPONIBLE PARA LA VENTA</strong>
        <div className={styles.grid}>
          <div><small>AÑO</small><b>2000</b></div>
          <div><small>MOTOR</small><b>4.2 V6</b></div>
          <div><small>TRACCIÓN</small><b>TRASERA</b></div>
          <div><small>CARROCERÍA</small><b>E-150</b></div>
        </div>
        <a href="#ford-custom-lab" className={styles.button}>EXPLORA LA FORD EN 360° ↗</a>
        <small className={styles.disclaimer}>Vista previa visual sin conexión a la base de datos. Los datos definitivos se mantienen en la ficha original.</small>
      </aside>
    </div>
    <FordLabFeature />
    <footer className={styles.footer}><span>VANMOTION · MADRID</span><span>PREVIEW LOCAL / NO PUBLICADO</span></footer>
  </main>;
}
