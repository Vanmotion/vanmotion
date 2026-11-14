import type { Metadata } from "next";
import Image from "next/image";

import CommunityForum from "./CommunityForum";
import styles from "./community.module.css";

const siteUrl = "https://www.vanmotion.es";

export const metadata: Metadata = {
  title: "Community · VANMOTION",
  description:
    "An international community for music, streetwear and automotive culture.",
  alternates: {
    canonical: `${siteUrl}/community`,
  },
};

export default function CommunityPage() {
  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <div className={styles.identity}>
          <p>VANMOTION / COMMUNITY</p>

          <h1>COMMUNITY</h1>

          <span>
            Music. Streetwear. Machines.
            <br />
            Open worldwide.
          </span>
        </div>

        <div className={styles.collage}>
          <div className={`${styles.photo} ${styles.p1}`}>
            <Image
              src="/vehiculos/horario/vanmotion-vehiculos-atardecer.png"
              alt="VANMOTION vehicle at sunset"
              fill
              priority
              className={styles.image}
            />
          </div>

          <div className={`${styles.photo} ${styles.p2}`}>
            <Image
              src="/ropa/editorial/ropa-new-york-azul.png"
              alt="VANMOTION streetwear editorial"
              fill
              className={styles.image}
            />
          </div>

          <div className={`${styles.photo} ${styles.p3}`}>
            <Image
              src="/experience/music/atardecer.webp"
              alt="VANMOTION music"
              fill
              className={styles.image}
            />
          </div>

          <div className={`${styles.photo} ${styles.p4}`}>
            <Image
              src="/ropa/editorial/vanmotion-portada-pareja.png"
              alt="VANMOTION fashion editorial"
              fill
              className={styles.image}
            />
          </div>

          <div className={`${styles.photo} ${styles.p5}`}>
            <Image
              src="/experience/streetwear/atardecer.webp"
              alt="VANMOTION streetwear"
              fill
              className={styles.image}
            />
          </div>
        </div>
      </header>

      <CommunityForum />

      <footer className={styles.footer}>
        <span>VANMOTION COMMUNITY</span>
        <span>WORLDWIDE / ENGLISH ONLY</span>
      </footer>
    </main>
  );
}
