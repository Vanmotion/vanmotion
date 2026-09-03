"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./experience.module.css";

type Period = "manana" | "dia" | "atardecer" | "noche";
type Atmosphere = "clear" | "autumn" | "rain" | "snow";

const vehicleImages: Record<Period, string> = {
  manana: "/brand/horario-home/vanmotion-home-manana.webp",
  dia: "/brand/horario-home/vanmotion-home-dia.webp",
  atardecer: "/brand/horario-home/vanmotion-home-atardecer.webp",
  noche: "/brand/horario-home/vanmotion-home-noche.webp",
};

const musicImages: Record<Period, string> = {
  manana: "/musica/horario/vanmotion-musica-manana.webp",
  dia: "/musica/horario/vanmotion-musica-dia.webp",
  atardecer: "/musica/horario/vanmotion-musica-atardecer.webp",
  noche: "/musica/horario/vanmotion-musica-noche.webp",
};

const streetImages: Record<Period, string> = {
  manana: "/ropa/horario/vanmotion-ropa-manana.webp",
  dia: "/ropa/horario/vanmotion-ropa-dia.webp",
  atardecer: "/ropa/horario/vanmotion-ropa-atardecer.webp",
  noche: "/ropa/horario/vanmotion-ropa-noche.webp",
};

function getMadridHour() {
  const value = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    hour12: false,
  }).format(new Date());

  return Number(value);
}

function getPeriod(hour: number): Period {
  if (hour >= 6 && hour < 12) return "manana";
  if (hour >= 12 && hour < 18) return "dia";
  if (hour >= 18 && hour < 21) return "atardecer";
  return "noche";
}

function getAtmosphereFromUrl(): Atmosphere {
  if (typeof window === "undefined") return "clear";

  const value = new URLSearchParams(window.location.search).get("weather");

  if (
    value === "autumn" ||
    value === "rain" ||
    value === "snow"
  ) {
    return value;
  }

  return "clear";
}

export default function ExperiencePage() {
  const [time, setTime] = useState("--:--");
  const [period, setPeriod] = useState<Period>("dia");
  const [atmosphere, setAtmosphere] =
    useState<Atmosphere>("clear");

  useEffect(() => {
    const update = () => {
      const now = new Date();

      setTime(
        new Intl.DateTimeFormat("es-ES", {
          timeZone: "Europe/Madrid",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(now)
      );

      setPeriod(getPeriod(getMadridHour()));
    };

    setAtmosphere(getAtmosphereFromUrl());
    update();

    const interval = window.setInterval(update, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const chapters = [
    {
      number: "01",
      kicker: "THE MACHINE",
      title: "Vehicles",
      text: "Machines with history. Selected for what they make us feel.",
      image: vehicleImages[period],
      href: "/coleccion",
      link: "Explore collection",
    },
    {
      number: "02",
      kicker: "THE SOUND",
      title: "Music",
      text: "Sound, atmosphere and the road. Part of the same culture.",
      image: musicImages[period],
      href: "/musica",
      link: "Enter sound",
    },
    {
      number: "03",
      kicker: "THE STREET",
      title: "Streetwear",
      text: "Simple pieces, real people and the streets around us.",
      image: streetImages[period],
      href: "/ropa",
      link: "View clothing",
    },
  ];

  return (
    <main
      className={styles.experience}
      data-period={period}
      data-atmosphere={atmosphere}
    >
      <div className={styles.atmosphereOverlay} aria-hidden="true" />
      <div className={styles.precipitation} aria-hidden="true" />

      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          VANMOTION
        </Link>

        <div className={styles.place}>
          MADRID · {time}
        </div>
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
              Automotive culture, sound and streetwear.
              <br />
              Born in Madrid under one identity.
            </p>

            <div className={styles.heroMeta}>
              <span>MADRID</span>
              <span>INDEPENDENT</span>
              <span>2026</span>
            </div>

            <div className={styles.heroScroll}>
              SCROLL TO EXPLORE ↓
            </div>
          </div>

          <div className={styles.heroGrid}>
            <Link
              href="/coleccion"
              className={`${styles.heroCard} ${styles.heroVehicle}`}
              style={{
                backgroundImage: `url("${vehicleImages[period]}")`,
              }}
            >
              <span>01 · VEHICLES</span>
            </Link>

            <Link
              href="/musica"
              className={`${styles.heroCard} ${styles.heroMusic}`}
              style={{
                backgroundImage: `url("${musicImages[period]}")`,
              }}
            >
              <span>02 · MUSIC</span>
            </Link>

            <Link
              href="/ropa"
              className={`${styles.heroCard} ${styles.heroStreet}`}
              style={{
                backgroundImage: `url("${streetImages[period]}")`,
              }}
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
            style={{
              backgroundImage: `url("${chapter.image}")`,
            }}
          />

          <div className={styles.chapterShade} />

          <div className={styles.chapterNumber}>
            {chapter.number}
          </div>

          <div className={styles.chapterContent}>
            <span className={styles.kicker}>
              {chapter.kicker}
            </span>

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
