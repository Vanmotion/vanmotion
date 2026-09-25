"use client";

import type { Language } from "@/app/language";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./experience.module.css";
import {
  getMadridSeason,
  getSeasonOverride,
  seasonalSceneImage,
  type Season,
} from "@/app/lib/madrid-seasons";

import {
  fetchMadridWeather,
  getMadridPeriod,
  getWeatherOverride,
  fallbackWeather,
  type ClimateSection,
  type WeatherState,
  type Period,
} from "@/app/lib/madrid-weather";


export default function ExperienceClient({
  language,
  initialPeriod,
  initialWeather,
}: {
  language: Language;
  initialPeriod: Period;
  initialWeather: WeatherState;
}) {
  const [time, setTime] = useState("--:--");
  const [period, setPeriod] =
    useState<Period>(initialPeriod);
  const [weather, setWeather] = useState<WeatherState>(initialWeather);
  const atmosphere = weather.atmosphere;
  const [season, setSeason] = useState<Season>(getMadridSeason());

  const enableSeasons = true;

  const imageFor = (section: ClimateSection) =>
    seasonalSceneImage({
      section,
      period,
      atmosphere,
      season,
      enabled: enableSeasons,
    });

  useEffect(() => {
    let active = true;
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

      setPeriod(getMadridPeriod(now));
      setSeason(
        getSeasonOverride(window.location.search) ?? getMadridSeason(now)
      );
    };

    const updateEnvironment = async () => {
      update();
      const override = getWeatherOverride(window.location.search);
      if (override) {
        setWeather({ ...fallbackWeather(), atmosphere: override, source: "override" });
        return;
      }
      const weather = await fetchMadridWeather({ cache: "no-store" });
      if (active) setWeather(weather);
    };

    updateEnvironment();

    const clockInterval = window.setInterval(update, 30000);
    const weatherInterval = window.setInterval(updateEnvironment, 300000);

    return () => {
      active = false;
      window.clearInterval(clockInterval);
      window.clearInterval(weatherInterval);
    };
  }, []);

  const chapters = [
    {
      number: "01",
      kicker: language === "es" ? "LA MÁQUINA" : "THE MACHINE",
      title: language === "es" ? "Vehículos" : "Vehicles",
      text: language === "es" ? "Máquinas con historia. Elegidas por lo que nos hacen sentir." : "Machines with history. Selected for what they make us feel.",
      image: imageFor("vehicles"),
      href: "/coleccion",
      link: language === "es" ? "Explorar colección" : "Explore collection",
    },
    {
      number: "02",
      kicker: language === "es" ? "EL SONIDO" : "THE SOUND",
      title: language === "es" ? "Música" : "Music",
      text: language === "es" ? "Sonido, atmósfera y carretera. Parte de una misma cultura." : "Sound, atmosphere and the road. Part of the same culture.",
      image: imageFor("music"),
      href: "/musica",
      link: language === "es" ? "Entrar en el sonido" : "Enter sound",
    },
    {
      number: "03",
      kicker: language === "es" ? "LA CALLE" : "THE STREET",
      title: language === "es" ? "Ropa urbana" : "Streetwear",
      text: language === "es" ? "Ropa sencilla, hecha para la calle." : "Simple clothing, made for the street.",
      image: imageFor("streetwear"),
      href: "/ropa",
      link: language === "es" ? "Ver ropa" : "View clothing",
    },
  ];

  return (
    <main
      className={styles.experience}
      data-period={period}
      data-season={season}
      data-atmosphere={atmosphere}
      data-weather-source={weather.source}
      data-weather-code={weather.weatherCode ?? ""}
      data-cloud-cover={weather.cloudCover ?? ""}
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
                backgroundImage: `url("${imageFor("vehicles")}")`,
              }}
            >
              <span>{language === "es" ? "01 · VEHÍCULOS" : "01 · VEHICLES"}</span>
            </Link>

            <Link
              href="/musica"
              className={`${styles.heroCard} ${styles.heroMusic}`}
              style={{
                backgroundImage: `url("${imageFor("music")}")`,
              }}
            >
              <span>{language === "es" ? "02 · MÚSICA" : "02 · MUSIC"}</span>
            </Link>

            <Link
              href="/ropa"
              className={`${styles.heroCard} ${styles.heroStreet}`}
              style={{
                backgroundImage: `url("${imageFor("streetwear")}")`,
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
