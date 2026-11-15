import type { Metadata } from "next";
import Image from "next/image";

import CommunityForum from "./CommunityForum";
import CommunityLanguageCopy from "./CommunityLanguageCopy";
import styles from "./community.module.css";
import CommunityBrand from "./CommunityBrand";
import { getCurrentLanguage } from "@/app/lib/language";

const siteUrl = "https://www.vanmotion.es";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage();
  const english = language === "en";
  const url = english ? `${siteUrl}/en-us/community` : `${siteUrl}/community`;
  return {
    title: english ? "Community · VANMOTION" : "Comunidad · VANMOTION",
    description: english
      ? "An international community for music, streetwear and automotive culture."
      : "Una comunidad internacional de música, moda urbana y cultura automovilística.",
    alternates: {
      canonical: url,
      languages: {
        "es-ES": `${siteUrl}/community`,
        "en-US": `${siteUrl}/en-us/community`,
        "x-default": `${siteUrl}/community`,
      },
    },
  };
}

export default async function CommunityPage() {
  const language = await getCurrentLanguage();
  const es = language === "es";
  return (
    <main className={styles.page}>
      <CommunityBrand />
      <header className={styles.top}>
        <div className={styles.identity}>
          <p>VANMOTION / COMMUNITY</p>

          <h1><CommunityLanguageCopy kind="title" /></h1>

          <span>
            <CommunityLanguageCopy kind="subtitle" />
          </span>
        </div>

        <div className={styles.collage}>
          <div className={`${styles.photo} ${styles.p1}`}>
            <Image
              src="/vehiculos/horario/vanmotion-vehiculos-atardecer.png"
              alt={es ? "Vehículo VANMOTION al atardecer" : "VANMOTION vehicle at sunset"}
              fill
              priority
              className={styles.image}
            />
          </div>

          <div className={`${styles.photo} ${styles.p2}`}>
            <Image
              src="/ropa/editorial/ropa-new-york-azul.png"
              alt={es ? "Editorial de ropa urbana VANMOTION" : "VANMOTION streetwear editorial"}
              fill
              className={styles.image}
            />
          </div>

          <div className={`${styles.photo} ${styles.p3}`}>
            <Image
              src="/experience/music/atardecer.webp"
              alt={es ? "Música VANMOTION" : "VANMOTION music"}
              fill
              className={styles.image}
            />
          </div>

          <div className={`${styles.photo} ${styles.p4}`}>
            <Image
              src="/ropa/editorial/vanmotion-portada-pareja.png"
              alt={es ? "Editorial de moda VANMOTION" : "VANMOTION fashion editorial"}
              fill
              className={styles.image}
            />
          </div>

          <div className={`${styles.photo} ${styles.p5}`}>
            <Image
              src="/experience/streetwear/atardecer.webp"
              alt={es ? "Ropa urbana VANMOTION" : "VANMOTION streetwear"}
              fill
              className={styles.image}
            />
          </div>
        </div>
      </header>

      <CommunityForum language={language} />

      <footer className={styles.footer}>
        <span>VANMOTION COMMUNITY</span>
        <span><CommunityLanguageCopy kind="footer" /></span>
      </footer>
    </main>
  );
}
