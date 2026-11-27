import type { Metadata } from "next";
import FordLab3D from "./FordLab3D";

export const metadata: Metadata = {
  title: "FORD LAB 007 · Responsive 3D Workshop · VANMOTION",
  description: "Taller 3D interactivo de la Ford E-150. Personalización visual de carrocería, ruedas, pintura y motor, en español e inglés.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Page() {
  return <FordLab3D />;
}
