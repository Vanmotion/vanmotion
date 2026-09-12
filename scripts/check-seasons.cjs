require("./ts-require.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { existsSync } = require("node:fs");
const {
  getMadridPeriod,
  sceneImage,
  getWeatherOverride,
} = require("../app/lib/madrid-weather.ts");
const {
  getMadridSeason,
  getSeasonOverride,
  seasonalSceneImage,
} = require("../app/lib/madrid-seasons.ts");

const sections = ["vehicles", "music", "streetwear"];
const periods = ["manana", "dia", "atardecer", "noche"];
const atmospheres = ["clear", "cloudy", "autumn", "rain", "snow"];
const exists = path => existsSync(`public${path}`);

test("Las 60 imágenes originales permanecen disponibles", () => {
  let count = 0;
  for (const section of sections)
    for (const atmosphere of atmospheres)
      for (const period of periods) {
        assert.ok(exists(sceneImage(section, period, atmosphere)));
        count++;
      }
  assert.equal(count, 60);
});

test("Las cuatro estaciones y la zona horaria de Madrid", () => {
  const cases = [
    ["2026-01-15T12:00:00Z", "winter"],
    ["2026-04-15T12:00:00Z", "spring"],
    ["2026-07-15T12:00:00Z", "summer"],
    ["2026-10-15T12:00:00Z", "autumn"],
    ["2026-02-28T22:59:00Z", "winter"],
    ["2026-02-28T23:00:00Z", "spring"],
  ];
  for (const [date, expected] of cases)
    assert.equal(getMadridSeason(new Date(date)), expected);
});

test("Los parámetros manuales son independientes", () => {
  assert.equal(getSeasonOverride("?season=spring"), "spring");
  assert.equal(getSeasonOverride("?season=summer"), "summer");
  assert.equal(getSeasonOverride("?season=winter"), "winter");
  assert.equal(getSeasonOverride("?season=invalid"), null);
  assert.equal(getWeatherOverride("?weather=autumn"), "autumn");
  assert.equal(getMadridPeriod(new Date("2026-07-01T16:00:00Z")), "atardecer");
});

test("Verano usa las bases e invierno reutiliza nieve original", () => {
  for (const section of sections)
    for (const period of periods) {
      assert.equal(
        seasonalSceneImage({
          section, period, atmosphere: "clear", season: "summer",
          hasAsset: () => false,
        }),
        sceneImage(section, period, "clear")
      );
      assert.equal(
        seasonalSceneImage({
          section, period, atmosphere: "clear", season: "winter",
          hasAsset: () => false,
        }),
        sceneImage(section, period, "snow")
      );
    }
});

test("Primavera conserva siempre las imágenes originales", () => {
  for (const section of sections)
    for (const period of periods) {
      const original = sceneImage(section, period, "clear");
      assert.equal(
        seasonalSceneImage({
          section, period, atmosphere: "clear", season: "spring",
          hasAsset: exists,
        }),
        original
      );
      assert.ok(exists(original));
    }
});

test("El otoño existente se puede seleccionar automáticamente", () => {
  for (const section of sections)
    for (const period of periods)
      assert.equal(
        seasonalSceneImage({
          section, period, atmosphere: "clear",
          season: "autumn", hasAsset: exists,
        }),
        sceneImage(section, period, "autumn")
      );
});

test("La meteorología conserva prioridad sobre la estación", () => {
  for (const atmosphere of ["cloudy", "rain", "snow", "autumn"])
    assert.equal(
      seasonalSceneImage({
        section: "vehicles", period: "dia",
        atmosphere, season: "summer", hasAsset: exists,
      }),
      sceneImage("vehicles", "dia", atmosphere)
    );
});

test("El otoño conserva sus bases y solo sus variantes disponibles", () => {
  for (const section of sections)
    for (const period of periods) {
      assert.equal(
        seasonalSceneImage({
          section, period, atmosphere: "clear", season: "autumn",
          hasAsset: exists,
        }),
        `/experience/${section}/autumn/${period}.webp`
      );
    }
});

test("Una imagen aprobada solo se selecciona si está disponible", () => {
  const expected = "/experience/music/autumn/manana.webp";
  assert.equal(
    seasonalSceneImage({
      section: "music", period: "manana",
      atmosphere: "clear", season: "autumn",
      hasAsset: path => path === expected,
    }),
    expected
  );
});
