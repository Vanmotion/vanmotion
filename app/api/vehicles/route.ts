import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getVehicles } from "@/repositories/vehicleRepository";

const ADMIN_SESSION_COOKIE_NAME =
  "vanmotion_admin_session";

async function hasAdminSession(): Promise<boolean> {
  const expectedToken =
    process.env.ADMIN_SESSION_TOKEN?.trim();

  if (!expectedToken) {
    return false;
  }

  const cookieStore = await cookies();

  const currentToken = cookieStore
    .get(ADMIN_SESSION_COOKIE_NAME)
    ?.value.trim();

  return Boolean(
    currentToken &&
      currentToken === expectedToken,
  );
}

export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json(
      {
        error: "No autorizado",
      },
      {
        status: 401,
      },
    );
  }

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
