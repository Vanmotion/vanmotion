"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme: "dark";
      size: "normal";
      appearance: "always";
      callback: (token: string) => void;
      "error-callback": (code: string) => boolean;
      "expired-callback": () => void;
      "timeout-callback": () => void;
    },
  ) => string | undefined;
  remove: (widgetId: string) => void;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type VerificationStatus = "loading" | "verified" | "error";

export default function ContactBotCheck({ siteKey }: { siteKey: string }) {
  const target = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [details, setDetails] = useState("");

  useEffect(() => {
    let mounted = true;
    let rendered = false;
    let widgetId: string | undefined;
    let script = document.querySelector<HTMLScriptElement>(
      'script[data-vanmotion-turnstile="1"]',
    );

    const fail = (reason: string) => {
      if (!mounted) return;
      setStatus("error");
      setDetails(reason);
    };

    if (!siteKey) {
      fail("No hay clave pública configurada en Vercel / Public site key missing in Vercel.");
      return () => { mounted = false; };
    }

    const render = () => {
      if (!mounted || rendered || !target.current || !window.turnstile) return;
      rendered = true;
      try {
        widgetId = window.turnstile.render(target.current, {
          sitekey: siteKey,
          theme: "dark",
          size: "normal",
          appearance: "always",
          callback: (token: string) => {
            if (!mounted || !token) return;
            setStatus("verified");
            setDetails("");
          },
          "error-callback": (code: string) => {
            fail(`Cloudflare: ${String(code || "error")}. Revisa el navegador y el dominio autorizado / Check browser and authorized hostname.`);
            return true;
          },
          "expired-callback": () => {
            if (!mounted) return;
            setStatus("loading");
            setDetails("La verificación caducó. Se está renovando / Verification expired. Refreshing.");
            try { window.turnstile?.reset(widgetId); } catch { /* El servidor sigue validando. */ }
          },
          "timeout-callback": () => {
            fail("La verificación ha agotado el tiempo. Recarga la página / Verification timed out. Reload the page.");
          },
        });
        if (!widgetId) {
          fail("Cloudflare no pudo dibujar la verificación / Cloudflare could not render the check.");
        }
      } catch {
        fail("Error al iniciar la verificación. Recarga la página / Could not initialize verification. Reload the page.");
      }
    };

    const scriptError = () => fail(
      "Firefox o la red bloquean challenges.cloudflare.com. Revisa el escudo de protección y recarga / Check Firefox tracking protection and reload.",
    );
    const watchdog = window.setTimeout(() => {
      if (!rendered) scriptError();
    }, 15000);

    if (window.turnstile) {
      render();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.setAttribute("data-vanmotion-turnstile", "1");
      }
      script.addEventListener("load", render);
      script.addEventListener("error", scriptError);
      if (!script.isConnected) document.head.appendChild(script);
    }

    return () => {
      mounted = false;
      window.clearTimeout(watchdog);
      script?.removeEventListener("load", render);
      script?.removeEventListener("error", scriptError);
      if (widgetId) {
        try { window.turnstile?.remove(widgetId); } catch { /* cleanup */ }
      }
    };
  }, [siteKey]);

  return (
    <div
      aria-label="Cloudflare Turnstile · Verificación de seguridad"
      style={{ margin: "18px 0", minHeight: 38 }}
    >
      <div ref={target} />
      <p
        aria-live="polite"
        role={status === "error" || !siteKey ? "alert" : "status"}
        style={{
          margin: "8px 0",
          fontSize: 12,
          lineHeight: 1.6,
          color: status === "verified" ? "#b7d7bd" : status === "error" || !siteKey ? "#f0ad90" : "#aaa",
        }}
      >
        {!siteKey || status === "error"
          ? `No se pudo completar la verificación / Security check unavailable. ${details}`
          : status === "verified"
            ? "✓ Seguridad verificada / Security check complete"
            : `Comprobando seguridad / Checking security… ${details}`}
      </p>
      {/* Honeypot: oculto a los usuarios, sin cambiar su validación en servidor. */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}
      >
        <label htmlFor="contact-company-site">Sitio web de empresa</label>
        <input id="contact-company-site" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
      </div>
    </div>
  );
}
