require("./ts-require.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { existsSync } = require("node:fs");
const { autumnExperienceImage } = require("../app/lib/autumn-experience.ts");
const { sceneImage } = require("../app/lib/madrid-weather.ts");

const sections = ["vehicles", "music", "streetwear"];
const periods = ["manana", "dia", "atardecer", "noche"];
const atmospheres = ["clear", "cloudy", "rain", "snow", "autumn"];

test("Otoño despejado utiliza sus 12 fotografías originales", () => {
  for (const section of sections)
    for (const period of periods) {
      const expected = sceneImage(section, period, "autumn");
      assert.equal(
        autumnExperienceImage(section, period, "clear", "autumn", true),
        expected
      );
      assert.ok(existsSync(`public${expected}`), expected);
    }
});

test("Las nueve variantes meteorológicas de día tienen rutas reales", () => {
  for (const section of sections)
    for (const atmosphere of ["cloudy", "rain", "snow"]) {
      const expected =
        `/experience/${section}/autumn/${atmosphere}/dia.webp`;
      assert.equal(
        autumnExperienceImage(section, "dia", atmosphere, "autumn", true),
        expected
      );
      assert.ok(existsSync(`public${expected}`), expected);
    }
});

test("Los climas de los otros períodos conservan su respaldo original", () => {
  for (const section of sections)
    for (const period of ["manana", "atardecer", "noche"])
      for (const atmosphere of ["cloudy", "rain", "snow", "autumn"]) {
        const expected = sceneImage(section, period, atmosphere);
        assert.equal(
          autumnExperienceImage(section, period, atmosphere, "autumn", true),
          expected
        );
        assert.ok(existsSync(`public${expected}`), expected);
      }
});

test("El parámetro meteorológico autumn conserva su ruta anterior", () => {
  for (const section of sections)
    for (const period of periods)
      assert.equal(
        autumnExperienceImage(section, period, "autumn", "autumn", true),
        sceneImage(section, period, "autumn")
      );
});

test("El interruptor desactivado conserva el sistema anterior", () => {
  for (const section of sections)
    for (const period of periods)
      for (const atmosphere of atmospheres) {
        assert.equal(
          autumnExperienceImage(section, period, atmosphere, "autumn", false),
          sceneImage(section, period, atmosphere)
        );
      }
});

test("Primavera y verano no se activan; invierno reutiliza nieve", () => {
  for (const season of ["spring", "summer"])
    for (const section of sections)
      for (const period of periods)
        assert.equal(
          autumnExperienceImage(section, period, "clear", season, true),
          sceneImage(section, period, "clear")
        );

  for (const section of sections)
    for (const period of periods)
      assert.equal(
        autumnExperienceImage(section, period, "clear", "winter", true),
        sceneImage(section, period, "snow")
      );
});

test("Invierno conserva la prioridad meteorológica", () => {
  for (const section of sections)
    for (const period of periods)
      for (const atmosphere of ["cloudy", "rain", "snow"])
        assert.equal(
          autumnExperienceImage(section, period, atmosphere, "winter", true),
          sceneImage(section, period, atmosphere)
        );

  assert.equal(
    autumnExperienceImage("vehicles", "dia", "clear", "winter", false),
    sceneImage("vehicles", "dia", "clear")
  );
});
