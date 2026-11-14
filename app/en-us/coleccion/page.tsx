import type { Metadata } from "next";

import CollectionPage, {
  generateMetadata as generateCollectionMetadata,
} from "@/app/coleccion/page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateCollectionMetadata();
}

export default function EnglishCollectionPage() {
  return <CollectionPage />;
}
