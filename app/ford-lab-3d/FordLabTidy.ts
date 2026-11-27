"use client";

import { useEffect } from "react";

/**
 * Ford Lab 012: limpieza exclusivamente visual del taller.
 * No modifica los estados React del configurador ni toca Three.js, audio o inventario.
 * Es reversible: borrar la importación, la llamada y este archivo.
 */
export function useFordLabTidy(): void {
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-vm-ford-tidy", "012");
    style.textContent = `
      [data-vm-ford-tidy-hide="true"] { display: none !important; }
      [data-vm-ford-tidy-tab] { font-size: 0 !important; }
      [data-vm-ford-tidy-tab] > * { display: none !important; }
      [data-vm-ford-tidy-tab]::after {
        content: attr(data-vm-ford-tidy-tab);
        display: block; font-size: 11px; font-weight: 750; letter-spacing: .09em;
        line-height: 1.4; color: inherit; text-align: left;
      }
      [data-vm-ford-tidy-label] { font-size: 0 !important; }
      [data-vm-ford-tidy-label]::after {
        content: attr(data-vm-ford-tidy-label);
        font-size: 11px; font-weight: 720; line-height: 1.45;
        letter-spacing: .09em; color: inherit;
      }
    `;
    document.head.appendChild(style);

    const norm = (text: string | null | undefined): string =>
      (text ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toUpperCase().replace(/\s+/g, " ").trim();
    const compact = (text: string | null | undefined): string =>
      norm(text).replace(/[\s./:·–—-]/g, "").replace(/^0?[1-3](?=[A-Z])/, "");
    const hidden = (el: HTMLElement) => {
      if (el.dataset.vmFordTidyHide !== "true") el.dataset.vmFordTidyHide = "true";
    };
    const relabel = (el: HTMLElement, title: string) => {
      if (el.dataset.vmFordTidyLabel !== title) el.dataset.vmFordTidyLabel = title;
    };

    function tidyTabs() {
      const buttons = Array.from(document.querySelectorAll<HTMLElement>("button,[role='tab']"));
      const ext = buttons.find(b => /^(?:EXTERIOR3D|EXTERIOR360|EXTERIOR|EXTERIORVIEW|EXTERIORVIEW3D)$/.test(compact(b.textContent)));
      const motor = buttons.find(b => /^(?:MOTOR|ENGINE)$/.test(compact(b.textContent)));
      const sound = buttons.find(b => /^(?:SONIDO|SOUND)$/.test(compact(b.textContent)));
      if (!ext || !motor || !sound) return;
      let group: HTMLElement | null = motor.parentElement;
      while (group && (!group.contains(ext) || !group.contains(sound))) group = group.parentElement;
      if (!group) return;
      // No manipular contenedores amplios: solo el grupo real de tres pestañas.
      const groupButtons = Array.from(group.querySelectorAll<HTMLElement>("button,[role='tab']"));
      if (groupButtons.length > 5) return;
      let motorCell: HTMLElement = motor;
      while (motorCell.parentElement && motorCell.parentElement !== group &&
             !motorCell.parentElement.contains(ext) && !motorCell.parentElement.contains(sound)) {
        motorCell = motorCell.parentElement;
      }
      hidden(motorCell);
      hidden(motor);
      motor.setAttribute("aria-hidden", "true");
      motor.setAttribute("tabindex", "-1");
      for (const [button, label] of [[ext, "EXTERIOR 3D"], [sound, "SONIDO"]] as const) {
        if (button.dataset.vmFordTidyTab !== label) button.dataset.vmFordTidyTab = label;
        button.setAttribute("aria-label", label);
        const cell = (() => {
          let n: HTMLElement = button;
          while (n.parentElement && n.parentElement !== group) n = n.parentElement;
          return n;
        })();
        cell.style.setProperty("flex", "1 1 0", "important");
        cell.style.setProperty("min-width", "0", "important");
      }
      if (getComputedStyle(group).display === "grid") {
        group.style.setProperty("grid-template-columns", "repeat(2,minmax(0,1fr))", "important");
      } else {
        group.style.setProperty("display", "flex", "important");
      }
      // Si alguna navegación dejó motor seleccionado, volver a EXTERIOR.
      if (motor.getAttribute("aria-selected") === "true") {
        ext.click();
      }
    }

    const briefNames: Record<string, string> = {
      PINTURA: "PINTURA", PAINT: "PAINT", LLANTAS: "LLANTAS", WHEELS: "WHEELS",
      ACCESORIOS: "ACCESORIOS", ACCESSORIES: "ACCESSORIES",
      NEUMATICOS: "NEUMÁTICOS", TIRES: "TIRES", TYRES: "TYRES",
      "VISTA 360": "VISTA 3D", "VISTA 360°": "VISTA 3D",
      "ESTUDIO DE SONIDO": "SONIDO", "SOUND STUDIO": "SOUND",
    };
    const unneeded = [
      /^(?:CONFIGURADOR\s*\/\s*0*7|CONFIGURATOR\s*\/\s*0*7)/,
      /^FOTOGRAFIAS DE VANMOTION$/,
      /^VANMOTION\s*\/\s*TALLER 3D$/,
      /^DISENO RESPONSIVE/, /^RESPONSIVE DESIGN/,
      /^MODELO 3D CARGADO/, /^3D MODEL LOADED/,
      /^PINTURA DE PREVISUALIZACION/, /^PAINT PREVIEW/,
      /^LLANTA REAL DE CATALOGO/, /^REAL CATALOG WHEEL/,
      /^DIBUJO DE TACOS INTEGRADO/, /^TREAD PATTERN/,
      /^GEOMETRIA DEL MODELO BASE$/, /^BASE MODEL GEOMETRY$/,
      /^BANDA ORIGINAL\s*[·-]/, /^TACOS 3D\s*[·-]/,
      /^ARRASTRA O DESLIZA PARA GIRAR/, /^DRAG OR SWIPE TO ROTATE/,
      /^CONTROL 360[°º]?$/, /^360[°º]? CONTROL$/,
    ];

    function tidyCopy() {
      // Únicamente nodos de texto terminales (sin hijos), nunca contenedores enteros.
      const leaves = Array.from(document.querySelectorAll<HTMLElement>("span,small,p,h2,h3,h4,h5,h6,strong,div"))
        .filter(el => el.children.length === 0 && Boolean(el.textContent?.trim()));
      for (const el of leaves) {
        const value = norm(el.textContent);
        if (unneeded.some(re => re.test(value))) { hidden(el); continue; }
        // 01 / PINTURA, 02 / LLANTAS, 03 / ACCESORIOS, etc.
        const section = value.match(/^0?[1-9]\s*[\/·–—.-]\s*(PINTURA|PAINT|LLANTAS|WHEELS|ACCESORIOS|ACCESSORIES|NEUMATICOS|TIRES|TYRES|VISTA 360[°º]?|ESTUDIO DE SONIDO|SOUND STUDIO)$/);
        if (section) { relabel(el, briefNames[section[1]] || section[1]); continue; }
        // Referencias numéricas secundarias bajo la denominación visible de las llantas.
        if (/^AR\d{6,}$/.test(value)) { hidden(el); continue; }
        // Mantener advertencia de compatibilidad, sin numeración de tornillería.
        if (/^5\s*[×X]\s*139[.,]7\s*[·-]/.test(value)) {
          relabel(el, value.includes("COMPATIBILIDAD") ? "COMPATIBILIDAD POR VERIFICAR" : "FITMENT TO BE VERIFIED");
          continue;
        }
        // Rótulo de vista 3D sin numeración.
        if (/^0?1\s*\/\s*VISTA 360[°º]?$/.test(value)) { relabel(el, "VISTA 3D"); continue; }
        if (/^0?1\s*\/\s*ESTUDIO DE SONIDO$/.test(value)) { relabel(el, "SONIDO"); continue; }
      }
      // Si el indicador y el texto de sección son elementos separados, ocultar solo la cifra.
      for (const el of leaves) {
        if (!/^0?[1-3]$/.test(norm(el.textContent)) || !el.parentElement) continue;
        const siblings = norm(el.parentElement.textContent);
        if (/PINTURA|LLANTAS|ACCESORIOS|NEUMATICOS|PAINT|WHEELS|ACCESSORIES|TIRES/.test(siblings) && siblings.length < 60) hidden(el);
      }
    }

    let frame = 0;
    function scan() { frame = 0; tidyTabs(); tidyCopy(); }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(scan); };
    const watcher = new MutationObserver(schedule);
    // Las mutaciones de atributos propias no se observan, evitando bucles.
    watcher.observe(document.body, { childList: true, subtree: true, characterData: true });
    scan();
    return () => {
      watcher.disconnect();
      if (frame) cancelAnimationFrame(frame);
      style.remove();
    };
  }, []);
}
