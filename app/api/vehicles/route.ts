import { NextResponse } from "next/server";
import { getVehicles } from "@/repositories/vehicleRepository";

export async function GET() {
  try {
    const vehicles = await getVehicles();

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("PRISMA ERROR:", error);

    return NextResponse.json(
      {
        error: "Error al obtener los vehículos",
      },
      { status: 500 },
    );
  }
}
