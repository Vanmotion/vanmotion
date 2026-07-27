"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import {
  DragEvent,
  useRef,
  useState,
} from "react";

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

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

function safeFileName(fileName: string): string {
  const normalized = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "vehiculo.jpg";
}

function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function readJsonResponse(
  response: Response,
): Promise<RegisterImageResponse> {
  try {
    return (await response.json()) as RegisterImageResponse;
  } catch {
    return {};
  }
}

export default function DirectVehicleImageUpload({
  vehicleId,
  existingImageCount,
}: DirectVehicleImageUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableSlots = Math.max(
    0,
    MAX_IMAGES - existingImageCount,
  );

  function clearInput(): void {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function resetMessages(): void {
    setMessage(null);
    setError(null);
    setProgress(0);
    setCurrentFile(null);
  }

  function validateFiles(files: File[]): string | null {
    if (files.length === 0) {
      return "No se ha seleccionado ninguna fotografía.";
    }

    if (availableSlots === 0) {
      return "Este vehículo ya tiene el máximo de 8 fotografías.";
    }

    if (files.length > availableSlots) {
      return `Has seleccionado ${files.length} fotografías, pero solo puedes añadir ${availableSlots} ${
        availableSlots === 1 ? "más" : "más"
      }.`;
    }

    const emptyFile = files.find((file) => file.size === 0);

    if (emptyFile) {
      return `“${emptyFile.name}” está vacío o no se puede leer.`;
    }

    const invalidType = files.find(
      (file) => !ALLOWED_IMAGE_TYPES.has(file.type),
    );

    if (invalidType) {
      return `“${invalidType.name}” no está en formato JPG, PNG, WebP o AVIF.`;
    }

    const oversizedFile = files.find(
      (file) => file.size > MAX_IMAGE_SIZE,
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
  }): Promise<void> {
    const response = await fetch(
      "/api/vehicle-images/upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "register",
          vehicleId,
          url,
          pathname,
        }),
      },
    );

    const result = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(
        result.error ??
          "La fotografía se subió, pero no pudo añadirse a la galería.",
      );
    }
  }

  async function uploadFiles(files: File[]): Promise<void> {
    if (isUploading) {
      return;
    }

    const validationError = validateFiles(files);

    if (validationError) {
      setError(validationError);
      setMessage(null);
      setSelectedFileNames([]);
      clearInput();
      return;
    }

    setIsUploading(true);
    setError(null);
    setMessage(
      `Preparando ${files.length} ${
        files.length === 1 ? "fotografía" : "fotografías"
      }...`,
    );
    setProgress(0);
    setSelectedFileNames(files.map((file) => file.name));

    let successfulUploads = 0;

    try {
      for (
        let index = 0;
        index < files.length;
        index += 1
      ) {
        const file = files[index];

        setCurrentFile(
          `${index + 1} de ${files.length}: ${file.name}`,
        );

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
            clientPayload: JSON.stringify({
              vehicleId,
            }),
            contentType: file.type,
            multipart:
              file.size > 5 * 1024 * 1024,
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
                  (completed + current) * 100,
                ),
              );
            },
          },
        );

        await registerUploadedImage({
          url: blob.url,
          pathname: blob.pathname,
        });

        successfulUploads += 1;

        setProgress(
          Math.round(
            (successfulUploads / files.length) *
              100,
          ),
        );
      }

      setProgress(100);
      setCurrentFile(null);
      setMessage(
        `${successfulUploads} ${
          successfulUploads === 1
            ? "fotografía guardada"
            : "fotografías guardadas"
        }. Actualizando la galería...`,
      );

      clearInput();
      router.refresh();

      window.setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (uploadError) {
      const detail =
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudieron subir las fotografías.";

      setError(
        successfulUploads > 0
          ? `${successfulUploads} ${
              successfulUploads === 1
                ? "fotografía quedó guardada"
                : "fotografías quedaron guardadas"
            }, pero la subida se detuvo: ${detail}`
          : detail,
      );

      setMessage(null);
      setCurrentFile(null);
      clearInput();

      if (successfulUploads > 0) {
        router.refresh();

        window.setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } finally {
      setIsUploading(false);
      setIsDragging(false);
      dragDepthRef.current = 0;
    }
  }

  function processSelection(files: File[]): void {
    resetMessages();
    void uploadFiles(files);
  }

  function handleSelection(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const files = Array.from(
      event.target.files ?? [],
    );

    processSelection(files);
  }

  function handleDragEnter(
    event: DragEvent<HTMLDivElement>,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    if (
      isUploading ||
      availableSlots === 0
    ) {
      return;
    }

    dragDepthRef.current += 1;
    setIsDragging(true);
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    if (
      !isUploading &&
      availableSlots > 0
    ) {
      event.dataTransfer.dropEffect =
        "copy";
    }
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    dragDepthRef.current = Math.max(
      0,
      dragDepthRef.current - 1,
    );

    if (dragDepthRef.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    dragDepthRef.current = 0;
    setIsDragging(false);

    if (
      isUploading ||
      availableSlots === 0
    ) {
      return;
    }

    const files = Array.from(
      event.dataTransfer.files,
    );

    processSelection(files);
  }

  function openFilePicker(): void {
    if (
      isUploading ||
      availableSlots === 0
    ) {
      return;
    }

    inputRef.current?.click();
  }

  const isDisabled =
    availableSlots === 0 || isUploading;

  return (
    <div>
      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex min-h-52 flex-col items-center justify-center border border-dashed px-6 text-center transition ${
          isDisabled
            ? "cursor-not-allowed border-white/10 bg-black/15 opacity-55"
            : isDragging
              ? "cursor-copy border-white bg-white/[0.08]"
              : "cursor-pointer border-white/20 bg-black/25 hover:border-white/45 hover:bg-white/[0.03]"
        }`}
      >
        <span className="text-3xl">
          {isUploading
            ? "…"
            : isDragging
              ? "↓"
              : "＋"}
        </span>

        <strong className="mt-4 text-sm">
          {isUploading
            ? "Subiendo fotografías"
            : availableSlots === 0
              ? "Máximo de fotografías alcanzado"
              : isDragging
                ? "Suelta aquí las fotografías"
                : "Seleccionar varias fotografías"}
        </strong>

        <small className="mt-2 max-w-xl text-xs leading-6 text-white/40">
          {isUploading
            ? "No cierres esta página hasta que aparezcan las miniaturas."
            : availableSlots === 0
              ? "Este vehículo ya tiene 8 fotografías."
              : `Puedes arrastrar aquí hasta ${availableSlots} ${
                  availableSlots === 1
                    ? "imagen"
                    : "imágenes"
                } juntas. En el selector de macOS, mantén pulsada ⌘ para elegir fotos separadas o Mayúsculas para seleccionar un grupo.`}
        </small>

        {!isUploading &&
          availableSlots > 0 && (
            <span className="mt-5 border border-white/20 bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black">
              Abrir selector
            </span>
          )}

        <input
          ref={inputRef}
          id="direct-vehicle-images"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={isDisabled}
          onChange={handleSelection}
          className="sr-only"
        />
      </div>

      {selectedFileNames.length > 0 &&
        !error && (
          <div className="mt-4 border border-white/10 bg-black/25 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Archivos seleccionados
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedFileNames.map(
                (fileName, index) => (
                  <span
                    key={`${fileName}-${index}`}
                    className="max-w-full truncate border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/55"
                  >
                    {index + 1}. {fileName}
                  </span>
                ),
              )}
            </div>
          </div>
        )}

      {isUploading && (
        <div className="mt-5 border border-white/10 bg-black/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-4 text-xs text-white/45">
            <span className="truncate">
              {currentFile ??
                "Preparando fotografías..."}
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
