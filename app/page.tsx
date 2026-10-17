import type { Metadata } from "next";
import ExperiencePage from "./experience/ExperiencePageContent";



export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/",
      "en-US": "/en-us",
      "x-default": "/",
    },
  },
};

export default function Home() {
  return <ExperiencePage />;
}
