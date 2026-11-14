import type { Metadata } from "next";

import PublicVehiclePage, {
  generateMetadata as generateVehicleMetadata,
  type PublicVehiclePageProps,
} from "@/app/coleccion/[id]/page";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: Pick<PublicVehiclePageProps, "params">,
): Promise<Metadata> {
  return generateVehicleMetadata(props);
}

export default function EnglishPublicVehiclePage(
  props: PublicVehiclePageProps,
) {
  return <PublicVehiclePage {...props} />;
}
