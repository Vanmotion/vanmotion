"use client";

import type { Language } from "@/app/language";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./experience.module.css";

type Period = "manana" | "dia" | "atardecer" | "noche";
type Atmosphere = "clear" | "autumn" | "rain" | "snow";

const vehicleImages: Record<Period, string> = {
  manana: "/experience/vehicles/manana.webp",
  dia: "/experience/vehicles/dia.webp",
  atardecer: "/experience/vehicles/atardecer.webp",
  noche: "/experience/vehicles/noche.webp",
};

const musicImages: Record<Period, string> = {
  manana: "/experience/music/manana.webp",
  dia: "/experience/music/dia.webp",
  atardecer: "/experience/music/atardecer.webp",
  noche: "/experience/music/noche.webp",
};

const streetImages: Record<Period, string> = {
  manana: "/experience/streetwear/manana.webp",
  dia: "/experience/streetwear/dia.webp",
  atardecer: "/experience/streetwear/atardecer.webp",
  noche: "/experience/streetwear/noche.webp",
};

function sceneImage(
  section: "vehicles" | "music" | "streetwear",
  period: Period,
  atmosphere: Atmosphere
) {
  const base =
    section === "vehicles"
      ? vehicleImages[period]
      : section === "music"
        ? musicImages[period]
        : streetImages[period];

  if (atmosphere === "clear") return base;

  return `/experience/${section}/${atmosphere}/${period}.webp`;
}

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

function getAtmosphereOverride(): Atmosphere | null {
  if (typeof window === "undefined") return null;

  const value = new URLSearchParams(window.location.search).get("weather");

  if (
    value === "autumn" ||
    value === "rain" ||
    value === "snow" ||
    value === "clear"
  ) {
    return value;
  }

  return null;
}

function getMadridMonth() {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      month: "2-digit",
    }).format(new Date())
  );
}

async function getMadridAtmosphere(): Promise<Atmosphere> {
  const override = getAtmosphereOverride();
  if (override) return override;

  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=40.4168&longitude=-3.7038&current=weather_code,precipitation,rain,snowfall&timezone=Europe%2FMadrid",
      { cache: "no-store" }
    );

    if (!response.ok) throw new Error("Weather request failed");

    const data = await response.json();
    const current = data.current ?? {};

    const code = Number(current.weather_code ?? 0);
    const rain = Number(current.rain ?? 0);
    const snowfall = Number(current.snowfall ?? 0);
    const precipitation = Number(current.precipitation ?? 0);

    const snowCodes = new Set([71, 73, 75, 77, 85, 86]);
    const rainCodes = new Set([
      51, 53, 55, 56, 57,
      61, 63, 65, 66, 67,
      80, 81, 82,
      95, 96, 99,
    ]);

    if (snowfall > 0 || snowCodes.has(code)) return "snow";

    if (
      rain > 0 ||
      precipitation > 0 ||
      rainCodes.has(code)
    ) {
      return "rain";
    }

    const month = getMadridMonth();

    if (month >= 9 && month <= 11) {
      return "autumn";
    }

    return "clear";
  } catch {
    const month = getMadridMonth();

    if (month >= 9 && month <= 11) {
      return "autumn";
    }

    return "clear";
  }
}

type SocialLink = {
  label: string;
  handle: string;
  href: string;
};

export default function ExperienceClient({
  language,
  socials,
}: {
  language: Language;
  socials: SocialLink[];
}) {
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

    const updateEnvironment = async () => {
      update();
      setAtmosphere(await getMadridAtmosphere());
    };

    updateEnvironment();

    const interval = window.setInterval(updateEnvironment, 300000);

    return () => window.clearInterval(interval);
  }, []);

  const chapters = [
    {
      number: "01",
      kicker: language === "es" ? "LA MÁQUINA" : "THE MACHINE",
      title: language === "es" ? "Vehículos" : "Vehicles",
      text: language === "es" ? "Máquinas con historia. Elegidas por lo que nos hacen sentir." : "Machines with history. Selected for what they make us feel.",
      image: sceneImage("vehicles", period, atmosphere),
      href: "/coleccion",
      link: language === "es" ? "Explorar colección" : "Explore collection",
    },
    {
      number: "02",
      kicker: language === "es" ? "EL SONIDO" : "THE SOUND",
      title: language === "es" ? "Música" : "Music",
      text: language === "es" ? "Sonido, atmósfera y carretera. Parte de una misma cultura." : "Sound, atmosphere and the road. Part of the same culture.",
      image: sceneImage("music", period, atmosphere),
      href: "/musica",
      link: language === "es" ? "Entrar en el sonido" : "Enter sound",
    },
    {
      number: "03",
      kicker: language === "es" ? "LA CALLE" : "THE STREET",
      title: language === "es" ? "Ropa urbana" : "Streetwear",
      text: language === "es" ? "Prendas sencillas, personas reales y las calles que nos rodean." : "Simple pieces, real people and the streets around us.",
      image: sceneImage("streetwear", period, atmosphere),
      href: "/ropa",
      link: language === "es" ? "Ver ropa" : "View clothing",
    },
  ];

  return (
    <main
      className={styles.experience}
      data-period={period}
      data-atmosphere={atmosphere}
    >

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
              {language === "es"
                ? "VANMOTION · CULTURA AUTOMOVILÍSTICA"
                : "VANMOTION · AUTOMOTIVE CULTURE"}
            </div>

            <h1>
              {language === "es" ? "Vehículos." : "Vehicles."}
              <br />
              {language === "es" ? "Música." : "Music."}
              <br />
              {language === "es" ? "Ropa." : "Street."}
            </h1>

            <p>
              {language === "es"
                ? "Cultura del automóvil, sonido y ropa urbana."
                : "Automotive culture, sound and streetwear."}
              <br />
              {language === "es"
                ? "Nacido en Madrid bajo una misma identidad."
                : "Born in Madrid under one identity."}
            </p>

            <div className={styles.heroMeta}>
              <span>MADRID</span>
              <span>{language === "es" ? "INDEPENDIENTE" : "INDEPENDENT"}</span>
              <span>2026</span>
            </div>

            <div className={styles.heroScroll}>
              {language === "es"
                ? "BAJA PARA EXPLORAR ↓"
                : "SCROLL TO EXPLORE ↓"}
            </div>
          </div>

          <div className={styles.heroGrid}>
            <Link
              href="/coleccion"
              className={`${styles.heroCard} ${styles.heroVehicle}`}
              style={{
                backgroundImage: `url("${sceneImage("vehicles", period, atmosphere)}")`,
              }}
            >
              <span>{language === "es" ? "01 · VEHÍCULOS" : "01 · VEHICLES"}</span>
            </Link>

            <Link
              href="/musica"
              className={`${styles.heroCard} ${styles.heroMusic}`}
              style={{
                backgroundImage: `url("${sceneImage("music", period, atmosphere)}")`,
              }}
            >
              <span>{language === "es" ? "02 · MÚSICA" : "02 · MUSIC"}</span>
            </Link>

            <Link
              href="/ropa"
              className={`${styles.heroCard} ${styles.heroStreet}`}
              style={{
                backgroundImage: `url("${sceneImage("streetwear", period, atmosphere)}")`,
              }}
            >
              <span>{language === "es" ? "03 · ROPA" : "03 · STREETWEAR"}</span>
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
          {language === "es" ? "Siempre en movimiento." : "Always moving."}
        </h2>

        <div className={styles.endingLinks}>
          <div
            className={styles.endingSocials}
            aria-label={
              language === "es"
                ? "Redes sociales de VANMOTION"
                : "VANMOTION social media"
            }
          >
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
              >
                <span>{social.label}</span>
                <small>{social.handle}</small>
              </a>
            ))}
          </div>

          <nav
            className={styles.endingNav}
            aria-label={
              language === "es"
                ? "Enlaces de VANMOTION"
                : "VANMOTION links"
            }
          >
            <Link href="/contacto">
              {language === "es" ? "Contacto" : "Contact"} ↗
            </Link>

            <Link href="/reconocimientos">
              {language === "es"
                ? "Reconocimientos"
                : "Recognition"} ↗
            </Link>

            <Link href="/aviso-legal">
              Legal ↗
            </Link>
          </nav>
        </div>

        <div className={styles.endingBottom}>
          <span>EST. 2026 · MADRID</span>
          <span>© VANMOTION</span>
        </div>
      </section>
    </main>
  );
}
