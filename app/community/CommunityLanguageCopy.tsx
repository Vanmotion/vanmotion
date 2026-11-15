"use client";

import { useEffect } from "react";
import { useLanguage } from "@/app/components/language/LanguageProvider";

type Kind = "title" | "subtitle" | "footer";

/** El texto editorial cambia sin desmontar el foro ni alterar su collage. */
export default function CommunityLanguageCopy({ kind }: { kind: Kind }) {
  const { language } = useLanguage();

  useEffect(() => {
    document.title = language === "es"
      ? "Comunidad · VANMOTION"
      : "Community · VANMOTION";
  }, [language]);

  if (kind === "title") return <>{language === "es" ? "COMUNIDAD" : "COMMUNITY"}</>;
  if (kind === "subtitle") return (
    <>
      {language === "es" ? "Música. Moda urbana. Motor." : "Music. Streetwear. Machines."}
      <br />
      {language === "es" ? "Abierta al mundo." : "Open worldwide."}
    </>
  );
  return <>{language === "es" ? "INTERNACIONAL / ESPAÑOL E INGLÉS" : "WORLDWIDE / SPANISH & ENGLISH"}</>;
}
