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

  useEffect(() => {
    const container = document.querySelector(`.${styles.experience}`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            element.classList.add(styles.chapterVisible);
          }
        });
      },
      {
        root: container,
        threshold: 0.12,
      }
    );

    document
      .querySelectorAll(`.${styles.chapter}`)
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    /* VANMOTION_MOTION_V2_HOOK */
    const scroller = document.querySelector<HTMLElement>(`.${styles.experience}`);
    if (!scroller || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scenes = Array.from(scroller.querySelectorAll<HTMLElement>(`.${styles.chapter}`));
    let revealFrame = 0;
    let wheelFrame = 0;
    let targetScroll = scroller.scrollTop;

    const clamp = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(max, value));

    const updateScenes = () => {
      revealFrame = 0;
      const rootTop = scroller.getBoundingClientRect().top;
      const viewHeight = scroller.clientHeight;
      for (const scene of scenes) {
        const rect = scene.getBoundingClientRect();
        const top = rect.top - rootTop;
        const bottom = rect.bottom - rootTop;
        const entrance = clamp((viewHeight - top) / (viewHeight * 0.5), 0, 1);
        const exit = clamp(bottom / (viewHeight * 0.5), 0, 1);
        const visibility = Math.min(entrance, exit);
        const progress = clamp((viewHeight - top) / (viewHeight + rect.height), 0, 1);
        const scale = 1.09 - 0.055 * (1 - Math.abs(2 * progress - 1));
        scene.style.setProperty("--vm-visibility", visibility.toFixed(3));
        scene.style.setProperty("--vm-shift", `${(1 - visibility) * 32}px`);
        scene.style.setProperty("--vm-image-scale", scale.toFixed(3));
        /* VANMOTION_DEPTH_V4 */
        const parallax = (0.5 - progress) * (window.innerWidth <= 700 ? 44 : 96);
        const distance = 1 - visibility;
        scene.style.setProperty("--vm-image-y", `${parallax.toFixed(1)}px`);
        scene.style.setProperty("--vm-text-z", `${(-60 * distance).toFixed(1)}px`);
        scene.style.setProperty("--vm-tilt", `${((progress < 0.5 ? 4 : -4) * distance).toFixed(1)}deg`);
        scene.style.setProperty("--vm-shade", (0.86 + 0.14 * Math.abs(2 * progress - 1)).toFixed(3));
      }
      const heroGrid = scroller.querySelector<HTMLElement>(`.${styles.heroGrid}`);
      const heroCopy = scroller.querySelector<HTMLElement>(`.${styles.heroCopy}`);
      const heroHeight = scroller.querySelector<HTMLElement>(`.${styles.hero}`)?.clientHeight || viewHeight;
      const heroProgress = clamp(scroller.scrollTop / heroHeight, 0, 1);
      heroGrid?.style.setProperty("--vm-hero-y", `${(-56 * heroProgress).toFixed(1)}px`);
      heroGrid?.style.setProperty("--vm-hero-scale", (1 - 0.075 * heroProgress).toFixed(3));
      heroCopy?.style.setProperty("--vm-hero-copy-y", `${(-92 * heroProgress).toFixed(1)}px`);
      heroCopy?.style.setProperty("--vm-hero-opacity", (1 - 0.32 * heroProgress).toFixed(3));
    };
    const onScroll = () => {
      if (!revealFrame) revealFrame = window.requestAnimationFrame(updateScenes);
    };
    const animateWheel = () => {
      const distance = targetScroll - scroller.scrollTop;
      if (Math.abs(distance) < 0.7) {
        scroller.scrollTop = targetScroll;
        wheelFrame = 0;
        return;
      }
      scroller.scrollTop += distance * 0.2;
      wheelFrame = window.requestAnimationFrame(animateWheel);
    };
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scroller.clientHeight : 1;
      if (!wheelFrame) targetScroll = scroller.scrollTop;
      targetScroll = clamp(
        targetScroll + event.deltaY * unit * 0.65,
        0,
        scroller.scrollHeight - scroller.clientHeight
      );
      if (!wheelFrame) wheelFrame = window.requestAnimationFrame(animateWheel);
    };

    updateScenes();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    if (window.matchMedia("(pointer: fine)").matches) {
      scroller.addEventListener("wheel", onWheel, { passive: false });
    }
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(revealFrame);
      window.cancelAnimationFrame(wheelFrame);
    };
  }, []);

  useEffect(() => {
    /* VANMOTION_LAST_O_SPIN_HOOK */
    const scroller = document.querySelector<HTMLElement>(`.${styles.experience}`);
    const ending = scroller?.querySelector<HTMLElement>(`.${styles.ending}`);
    const lastO = ending?.querySelector<HTMLElement>(`.${styles.endingSpin}`);
    if (!scroller || !ending || !lastO) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.75) {
          ending.classList.add(styles.endingActive);
        } else if (!entry.isIntersecting) {
          ending.classList.remove(styles.endingActive);
        }
      },
      { root: scroller, threshold: [0, 0.75] }
    );
    observer.observe(lastO);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    /* VANMOTION_PHRASE_V4_HOOK */
    const scroller = document.querySelector<HTMLElement>(`.${styles.experience}`);
    const ending = scroller?.querySelector<HTMLElement>(`.${styles.ending}`);
    const word = ending?.querySelector<HTMLElement>(`.${styles.endingMotion}`);
    if (!scroller || !ending || !word) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.15) {
          ending.classList.add(styles.endingPhraseActive);
        } else if (!entry.isIntersecting) {
          ending.classList.remove(styles.endingPhraseActive);
        }
      },
      { root: scroller, threshold: [0, 0.15] }
    );
    observer.observe(word);
    return () => observer.disconnect();
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
            >
              <div
                className={styles.heroCardMedia}
                style={{ backgroundImage: `url("${imageFor("vehicles")}")` }}
                aria-hidden="true"
              />
              <span>{language === "es" ? "01 · VEHÍCULOS" : "01 · VEHICLES"}</span>
            </Link>

            <Link
              href="/musica"
              className={`${styles.heroCard} ${styles.heroMusic}`}
            >
              <div
                className={styles.heroCardMedia}
                style={{ backgroundImage: `url("${imageFor("music")}")` }}
                aria-hidden="true"
              />
              <span>{language === "es" ? "02 · MÚSICA" : "02 · MUSIC"}</span>
            </Link>

            <Link
              href="/ropa"
              className={`${styles.heroCard} ${styles.heroStreet}`}
            >
              <div
                className={styles.heroCardMedia}
                style={{ backgroundImage: `url("${imageFor("streetwear")}")` }}
                aria-hidden="true"
              />
              <span>{language === "es" ? "03 · ROPA" : "03 · STREETWEAR"}</span>
            </Link>
          </div>
        </div>
      </section>

      {chapters.map((chapter) => (
        <section
          className={styles.chapter}
          key={chapter.number}
          data-chapter={chapter.number}
        >
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
          {language === "es" ? (
            <>
              <span className={styles.endingFirst}>Siempre</span>{" "}
              <span className={styles.endingSecond}>en</span>{" "}
              <span className={styles.endingMotion}>
                movimient<span className={styles.endingSpin}>o</span><span className={styles.endingDot}>.</span>
              </span>
            </>
          ) : (
            <>
              <span className={styles.endingFirst}>Always</span>{" "}
              <span className={styles.endingMotion}>
                moving<span className={styles.endingDot}>.</span>
              </span>
            </>
          )}
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
