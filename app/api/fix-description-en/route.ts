import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SESSION_COOKIE_NAME = "vanmotion_admin_session";

export async function GET(request: NextRequest) {
  const expectedToken = process.env.ADMIN_SESSION_TOKEN;
  const currentToken = request.cookies.get(
    SESSION_COOKIE_NAME,
  )?.value;

  if (
    !expectedToken ||
    currentToken !== expectedToken
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "No autorizado.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    await prisma.$executeRaw`
      ALTER TABLE "Vehicle"
      ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT
    `;

    const columns = await prisma.$queryRaw<
      Array<{ column_name: string }>
    >`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Vehicle'
        AND column_name = 'descriptionEn'
    `;

    return NextResponse.json({
      ok: columns.some(
        (column) =>
          column.column_name === "descriptionEn",
      ),
      column: columns[0]?.column_name ?? null,
    });
  } catch (error) {
    console.error(
      "VANMOTION_DATABASE_REPAIR_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo reparar la base de datos.",
      },
      {
        status: 500,
      },
    );
  }
}