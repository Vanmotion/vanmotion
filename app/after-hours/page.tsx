import type { Metadata } from "next";
import AfterHoursExperience from "./AfterHoursExperience";

export const metadata: Metadata = {
  title: "AFTER HOURS · VANMOTION",
  description:
    "VANMOTION After Hours: una experiencia nocturna de cultura automovilística, música y streetwear.",
  robots: { index: false, follow: false },
};

export default function AfterHoursPage() {
  return <AfterHoursExperience />;
}
