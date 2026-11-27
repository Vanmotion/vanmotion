import type { Metadata } from "next";
import FordLab from "./FordLab";

export const metadata: Metadata = {
  title: "FORD LAB 004.4 · VANMOTION | Private workshop",
  description: "Configurador local privado de Ford E-150 con fotografías propias de VANMOTION.",
  robots: { index: false, follow: false },
};

export default function FordLabPage() {
  return <FordLab />;
}
