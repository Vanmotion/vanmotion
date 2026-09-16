import type { Metadata } from "next";
import ExperiencePage from "./experience/ExperiencePageContent";



export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <ExperiencePage />;
}
