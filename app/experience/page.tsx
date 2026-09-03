"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./experience.module.css";

const chapters = [
  {
    number: "01",
    kicker: "THE MACHINE",
    title: "Vehicles",
    text: "Machines with history. Selected for what they make us feel.",
    image: "/brand/vanmotion-ford-hero.webp",
    href: "/coleccion",
    link: "Explore collection",
  },
  {
    number: "02",
    kicker: "THE SOUND",
    title: "Music",
    text: "Sound, atmosphere and the road. Part of the same culture.",
    image: "/musica/horario/vanmotion-musica-manana.webp",
    href: "/musica",
    link: "Enter sound",
  },
  {
    number: "03",
    kicker: "THE STREET",
    title: "Streetwear",
    text: "Simple pieces, real people and the streets around us.",
    image: "/ropa/aprobadas/hombre/camiseta-negra/lifestyle.webp",
    href: "/ropa",
    link: "View clothing",
  },
];

export default function ExperiencePage() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const update = () => {
      setTime(
        new Intl.DateTimeFormat("es-ES", {
          timeZone: "Europe/Madrid",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    };

    update();
    const interval = window.setInterval(update, 30000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className={styles.experience}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          VANMOTION
        </Link>

        <div className={styles.place}>MADRID · {time}</div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.heroEyebrow}>
              VANMOTION · AUTOMOTIVE CULTURE
            </div>

            <h1>
              Vehicles.
              <br />
              Music.
              <br />
              Street.
            </h1>

            <p>
              A Madrid-born universe where automotive culture,
              sound and clothing live under one identity.
            </p>

            <div className={styles.heroMeta}>
              <span>REAL IMAGES</span>
              <span>MADRID</span>
              <span>2026</span>
            </div>

            <div className={styles.heroScroll}>SCROLL TO EXPLORE ↓</div>
          </div>

          <div className={styles.heroGrid}>
            <Link
              href="/coleccion"
              className={`${styles.heroCard} ${styles.heroVehicle}`}
              style={{ backgroundImage: 'url("/brand/vanmotion-ford-hero.webp")' }}
            >
              <span>01 · VEHICLES</span>
            </Link>

            <Link
              href="/musica"
              className={`${styles.heroCard} ${styles.heroMusic}`}
              style={{ backgroundImage: 'url("/musica/horario/vanmotion-musica-manana.webp")' }}
            >
              <span>02 · MUSIC</span>
            </Link>

            <Link
              href="/ropa"
              className={`${styles.heroCard} ${styles.heroStreet}`}
              style={{ backgroundImage: 'url("/ropa/aprobadas/hombre/camiseta-negra/lifestyle.webp")' }}
            >
              <span>03 · STREETWEAR</span>
            </Link>
          </div>
        </div>
      </section>

      {chapters.map((chapter) => (
        <section className={styles.chapter} key={chapter.number}>
          <div
            className={styles.chapterImage}
            style={{ backgroundImage: `url("${chapter.image}")` }}
          />

          <div className={styles.chapterShade} />

          <div className={styles.chapterNumber}>{chapter.number}</div>

          <div className={styles.chapterContent}>
            <span className={styles.kicker}>{chapter.kicker}</span>

            <h2>{chapter.title}</h2>

            <div className={styles.chapterFooter}>
              <p>{chapter.text}</p>

              <Link href={chapter.href} className={styles.link}>
                {chapter.link} ↗
              </Link>
            </div>
          </div>
        </section>
      ))}

      <section className={styles.ending}>
        <div className={styles.endingSmall}>
          VANMOTION · AUTOMOTIVE CULTURE
        </div>

        <h2>
          Madrid.
          <br />
          Always moving.
        </h2>

        <div className={styles.endingBottom}>
          <span>EST. 2026</span>
          <span>© VANMOTION</span>
        </div>
      </section>
    </main>
  );
}
