import { redirect } from "next/navigation";

type VehicleAdminPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VehicleAdminPage({
  params,
}: VehicleAdminPageProps) {
  const { id } = await params;

  redirect(`/admin/vehicles/${id}/edit`);
}