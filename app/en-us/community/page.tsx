import type { Metadata } from "next";
import CommunityPage from "@/app/community/page";

export const metadata: Metadata = {
  title: "Community · VANMOTION",
  description: "An international community for music, streetwear and automotive culture.",
  alternates: {
    canonical: "https://www.vanmotion.es/en-us/community",
    languages: {
      "es-ES": "https://www.vanmotion.es/community",
      "en-US": "https://www.vanmotion.es/en-us/community",
      "x-default": "https://www.vanmotion.es/community",
    },
  },
};

export default CommunityPage;
