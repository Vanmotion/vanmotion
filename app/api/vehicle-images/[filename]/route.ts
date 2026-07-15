import { readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

type VehicleImageRouteProps = {
  params: Promise<{
    filename: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: VehicleImageRouteProps,
): Promise<Response> {
  const { filename } = await params;
  const safeFilename = basename(filename);

  if (
    safeFilename !== filename ||
    !/^[a-zA-Z0-9._-]+$/.test(safeFilename)
  ) {
    return new Response("Archivo no válido.", {
      status: 400,
    });
  }

  const extension =
    extname(safeFilename).toLowerCase();

  const contentType =
    contentTypes[extension];

  if (!contentType) {
    return new Response(
      "Formato de imagen no permitido.",
      {
        status: 415,
      },
    );
  }

  const filePath = join(
    process.cwd(),
    "public",
    "uploads",
    "vehicles",
    safeFilename,
  );

  try {
    const file = await readFile(filePath);

    return new Response(
      new Uint8Array(file),
      {
        headers: {
          "Content-Type": contentType,
          "Content-Length":
            String(file.byteLength),
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    const code =
      error instanceof Error &&
      "code" in error
        ? String(error.code)
        : "";

    if (code === "ENOENT") {
      return new Response(
        "Imagen no encontrada.",
        {
          status: 404,
        },
      );
    }

    console.error(
      "Error al cargar la imagen del vehículo:",
      error,
    );

    return new Response(
      "No se ha podido cargar la imagen.",
      {
        status: 500,
      },
    );
  }
}