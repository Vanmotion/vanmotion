"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import {
  useRef,
  useState,
} from "react";

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE =
  8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

type DirectVehicleImageUploadProps = {
  vehicleId: string;
  existingImageCount: number;
};

type RegisterImageResponse = {
  error?: string;
};

function safeFileName(
  fileName: string,
): string {
  const normalized = fileName
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "vehiculo.jpg";
}

function formatMegabytes(
  bytes: number,
): string {
  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

async function readJsonResponse(
  response: Response,
): Promise<RegisterImageResponse> {
  try {
    return (await response.json()) as
      RegisterImageResponse;
  } catch {
    return {};
  }
}

export default function DirectVehicleImageUpload({
  vehicleId,
  existingImageCount,
}: DirectVehicleImageUploadProps) {
  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [currentFile, setCurrentFile] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const availableSlots = Math.max(
    0,
    MAX_IMAGES - existingImageCount,
  );

  function clearInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function validateFiles(
    files: File[],
  ): string | null {
    if (files.length === 0) {
      return "No se ha seleccionado ninguna fotografía.";
    }

    if (availableSlots === 0) {
      return "Este vehículo ya tiene el máximo de 8 fotografías.";
    }

    if (files.length > availableSlots) {
      return `Puedes añadir ${availableSlots} ${
        availableSlots === 1
          ? "fotografía"
          : "fotografías"
      } más.`;
    }

    const invalidType = files.find(
      (file) =>
        !ALLOWED_IMAGE_TYPES.has(
          file.type,
        ),
    );

    if (invalidType) {
      return `“${invalidType.name}” no está en formato JPG, PNG, WebP o AVIF.`;
    }

    const oversizedFile = files.find(
      (file) =>
        file.size > MAX_IMAGE_SIZE,
    );

    if (oversizedFile) {
      return `“${oversizedFile.name}” ocupa ${formatMegabytes(
        oversizedFile.size,
      )}. Cada imagen puede ocupar como máximo 8 MB.`;
    }

    return null;
  }

  async function registerUploadedImage({
    url,
    pathname,
  }: {
    url: string;
    pathname: string;
  }) {
    const response = await fetch(
      "/api/vehicle-images/upload",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          action: "register",
          vehicleId,
          url,
          pathname,
        }),
      },
    );

    const result =
      await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(
        result.error ??
          "La fotografía se subió, pero no pudo añadirse a la galería.",
      );
    }
  }

  async function uploadFiles(
    files: File[],
  ) {
    if (isUploading) {
      return;
    }

    const validationError =
      validateFiles(files);

    if (validationError) {
      setError(validationError);
      setMessage(null);
      clearInput();
      return;
    }

    setIsUploading(true);
    setError(null);
    setMessage(
      "Subiendo fotografías automáticamente...",
    );
    setProgress(0);

    try {
      for (
        let index = 0;
        index < files.length;
        index += 1
      ) {
        const file = files[index];

        setCurrentFile(file.name);

        const pathname =
          `vehicles/${vehicleId}/` +
          `${Date.now()}-${index + 1}-` +
          safeFileName(file.name);

        const blob = await upload(
          pathname,
          file,
          {
            access: "public",
            handleUploadUrl:
              "/api/vehicle-images/upload",
            clientPayload:
              JSON.stringify({
                vehicleId,
              }),
            contentType: file.type,
            multipart:
              file.size >
              5 * 1024 * 1024,
            onUploadProgress: ({
              percentage,
            }) => {
              const completed =
                index / files.length;

              const current =
                percentage /
                100 /
                files.length;

              setProgress(
                Math.round(
                  (completed +
                    current) *
                    100,
                ),
              );
            },
          },
        );

        await registerUploadedImage({
          url: blob.url,
          pathname: blob.pathname,
        });
      }

      setProgress(100);
      setCurrentFile(null);
      setMessage(
        `${files.length} ${
          files.length === 1
            ? "fotografía guardada"
            : "fotografías guardadas"
        }. Actualizando la galería...`,
      );

      clearInput();
      router.refresh();

      window.setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudieron subir las fotografías.",
      );

      setMessage(null);
      setCurrentFile(null);
      clearInput();
    } finally {
      setIsUploading(false);
    }
  }

  function handleSelection(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setMessage(null);
    setError(null);
    setProgress(0);

    const files = Array.from(
      event.target.files ?? [],
    );

    void uploadFiles(files);
  }

  return (
    <div>
      <label
        htmlFor="direct-vehicle-images"
        className={`flex min-h-44 flex-col items-center justify-center border border-dashed px-6 text-center transition ${
          availableSlots > 0 &&
          !isUploading
            ? "cursor-pointer border-white/20 bg-black/25 hover:border-white/40 hover:bg-white/[0.03]"
            : "cursor-not-allowed border-white/10 bg-black/15 opacity-55"
        }`}
      >
        <span className="text-3xl">
          {isUploading ? "…" : "＋"}
        </span>

        <strong className="mt-4 text-sm">
          {isUploading
            ? "Subiendo fotografías"
            : availableSlots > 0
              ? "Seleccionar y subir fotografías"
              : "Máximo de fotografías alcanzado"}
        </strong>

        <small className="mt-2 max-w-lg text-xs leading-6 text-white/35">
          {isUploading
            ? "No cierres esta página hasta que aparezcan las miniaturas."
            : `Selecciona hasta ${availableSlots} ${
                availableSlots === 1
                  ? "imagen"
                  : "imágenes"
              }. La subida comienza automáticamente. JPG, PNG, WebP o AVIF; máximo 8 MB por archivo.`}
        </small>

        <input
          ref={inputRef}
          id="direct-vehicle-images"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={
            availableSlots === 0 ||
            isUploading
          }
          onChange={handleSelection}
          className="sr-only"
        />
      </label>

      {isUploading && (
        <div className="mt-5 border border-white/10 bg-black/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-4 text-xs text-white/45">
            <span className="truncate">
              {currentFile
                ? `Subiendo: ${currentFile}`
                : "Preparando fotografías..."}
            </span>

            <strong className="text-white">
              {progress}%
            </strong>
          </div>

          <div className="h-2 overflow-hidden bg-white/10">
            <div
              className="h-full bg-white transition-[width] duration-200"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {message && (
        <p className="mt-4 border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}