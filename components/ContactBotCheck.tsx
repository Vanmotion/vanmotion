"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; theme: "auto" }) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export default function ContactBotCheck({ siteKey }: { siteKey: string }) {
  const target = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey) return;
    let disposed = false;
    let widgetId: string | undefined;
    let script = document.querySelector<HTMLScriptElement>(
      'script[data-vanmotion-turnstile="1"]',
    );
    const render = () => {
      if (disposed || widgetId || !target.current || !window.turnstile) return;
      widgetId = window.turnstile.render(target.current, {
        sitekey: siteKey,
        theme: "auto",
      });
    };
    if (window.turnstile) {
      render();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.setAttribute("data-vanmotion-turnstile", "1");
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
    }
    return () => {
      disposed = true;
      script?.removeEventListener("load", render);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey]);

  return (
    <div className="my-3" aria-label="Verificación de seguridad">
      <div ref={target} />
      {!siteKey && (
        <p role="alert" className="text-sm text-red-600">
          El formulario no está disponible temporalmente.
        </p>
      )}
      {/* Un señuelo para bots de formularios, oculto para visitantes reales. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="contact-company-site">Sitio web de empresa</label>
        <input id="contact-company-site" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
      </div>
    </div>
  );
}
