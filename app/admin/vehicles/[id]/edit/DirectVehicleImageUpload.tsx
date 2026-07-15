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

export default function DirectVehicleImageUpload({
  vehicleId,
  existingImageCount,
}: DirectVehicleImageUploadProps) {
  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([]);

  const [isUploading, setIsUploading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const availableSlots = Math.max(
    0,
    MAX_IMAGES - existingImageCount,
  );

  function clearSelection() {
    setSelectedFiles([]);
    setProgress(0);

    if (inputRef.current) {
      inputRef.current.value = "";
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

    if (files.length === 0) {
      setSelectedFiles([]);
      return;
    }

    if (availableSlots === 0) {
      setError(
        "Este vehículo ya tiene el máximo de 8 fotografías.",
      );
      clearSelection();
      return;
    }

    if (files.length > availableSlots) {
      setError(
        `Puedes añadir ${availableSlots} ${
          availableSlots === 1
            ? "fotografía"
            : "fotografías"
        } más.`,
      );
      clearSelection();
      return;
    }

    const invalidType = files.find(
      (file) =>
        !ALLOWED_IMAGE_TYPES.has(
          file.type,
        ),
    );

    if (invalidType) {
      setError(
        `“${invalidType.name}” no está en formato JPG, PNG, WebP o AVIF.`,
      );
      clearSelection();
      return;
    }

    const oversizedFile = files.find(
      (file) =>
        file.size > MAX_IMAGE_SIZE,
    );

    if (oversizedFile) {
      setError(
        `“${oversizedFile.name}” ocupa ${formatMegabytes(
          oversizedFile.size,
        )}. Cada imagen puede ocupar como máximo 8 MB.`,
      );
      clearSelection();
      return;
    }

    setSelectedFiles(files);
  }

  async function uploadSelectedFiles() {
    if (
      selectedFiles.length === 0 ||
      isUploading
    ) {
      return;
    }

    setIsUploading(true);
    setError(null);
    setMessage(
      "Preparando la subida directa...",
    );
    setProgress(0);

    try {
      for (
        let index = 0;
        index < selectedFiles.length;
        index += 1
      ) {
        const file =
          selectedFiles[index];

        const pathname =
          `vehicles/${vehicleId}/` +
          `${Date.now()}-${index + 1}-` +
          safeFileName(file.name);

        setMessage(
          `Subiendo ${index + 1} de ${
            selectedFiles.length
          }: ${file.name}`,
        );

        await upload(
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
                index /
                selectedFiles.length;

              const current =
                percentage /
                100 /
                selectedFiles.length;

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
      }

      setProgress(100);
      setMessage(
        `${
          selectedFiles.length
        } ${
          selectedFiles.length === 1
            ? "fotografía subida"
            : "fotografías subidas"
        }. Actualizando la galería...`,
      );

      clearSelection();

      window.setTimeout(() => {
        router.refresh();
      }, 1800);

      window.setTimeout(() => {
        router.refresh();
      }, 4500);
    } catch (uploadError) {
      const uploadMessage =
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudieron subir las fotografías.";

      setError(uploadMessage);
      setMessage(null);
    } finally {
      setIsUploading(false);
    }
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
          ＋
        </span>

        <strong className="mt-4 text-sm">
          {availableSlots > 0
            ? "Seleccionar fotografías"
            : "Máximo de fotografías alcanzado"}
        </strong>

        <small className="mt-2 max-w-lg text-xs leading-6 text-white/35">
          Puedes seleccionar hasta{" "}
          {availableSlots}{" "}
          {availableSlots === 1
            ? "imagen más"
            : "imágenes más"}
          . JPG, PNG, WebP o AVIF, con
          un máximo de 8 MB por archivo.
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

      {selectedFiles.length > 0 && (
        <div className="mt-5 border border-white/10 bg-black/30 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">
                {selectedFiles.length}{" "}
                {selectedFiles.length === 1
                  ? "fotografía seleccionada"
                  : "fotografías seleccionadas"}
              </p>

              <p className="mt-1 text-xs text-white/35">
                Peso total:{" "}
                {formatMegabytes(
                  selectedFiles.reduce(
                    (total, file) =>
                      total +
                      file.size,
                    0,
                  ),
                )}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={isUploading}
                onClick={clearSelection}
                className="min-h-11 border border-white/15 px-5 text-xs font-semibold uppercase tracking-[0.12em] transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancelar selección
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={
                  uploadSelectedFiles
                }
                className="min-h-11 bg-white px-5 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-white/85 disabled:cursor-wait disabled:opacity-60"
              >
                {isUploading
                  ? "Subiendo..."
                  : "Subir fotografías"}
              </button>
            </div>
          </div>

          <ul className="mt-4 grid gap-2 text-xs text-white/45 sm:grid-cols-2">
            {selectedFiles.map(
              (file) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="truncate border border-white/10 px-3 py-2"
                >
                  {file.name} ·{" "}
                  {formatMegabytes(
                    file.size,
                  )}
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      {(isUploading ||
        progress > 0) && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-white/45">
            <span>
              Progreso de subida
            </span>

            <span>{progress}%</span>
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