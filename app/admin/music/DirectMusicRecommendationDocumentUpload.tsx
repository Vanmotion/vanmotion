"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useRef,
  useState,
} from "react";

import styles from "./music-admin.module.css";

const MAX_DOCUMENT_SIZE = 8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

type DirectMusicRecommendationDocumentUploadProps = {
  recommendationId: string;
  title: string;
  hasDocument: boolean;
};

type RegisterResponse = {
  error?: string;
};

function extensionOf(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0
    ? fileName.slice(dotIndex).toLowerCase()
    : "";
}

function safeFileName(fileName: string): string {
  const normalized = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "documento.webp";
}

function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function readResponse(
  response: Response,
): Promise<RegisterResponse> {
  try {
    return (await response.json()) as RegisterResponse;
  } catch {
    return {};
  }
}

export default function DirectMusicRecommendationDocumentUpload({
  recommendationId,
  title,
  hasDocument,
}: DirectMusicRecommendationDocumentUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] =
    useState<string | null>(null);
  const [error, setError] =
    useState<string | null>(null);

  function validateFile(
    selectedFile: File,
  ): string | null {
    if (selectedFile.size === 0) {
      return "La imagen está vacía o no se puede leer.";
    }

    if (selectedFile.size > MAX_DOCUMENT_SIZE) {
      return `La imagen ocupa ${formatMegabytes(selectedFile.size)}. El máximo es 8 MB.`;
    }

    const extension = extensionOf(
      selectedFile.name,
    );

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return "Utiliza una imagen JPG, PNG, WebP o AVIF.";
    }

    if (
      selectedFile.type &&
      !ALLOWED_IMAGE_TYPES.has(
        selectedFile.type,
      )
    ) {
      return "El tipo real del archivo no coincide con una imagen permitida.";
    }

    return null;
  }

  async function registerDocument({
    url,
    pathname,
    selectedFile,
  }: {
    url: string;
    pathname: string;
    selectedFile: File;
  }): Promise<void> {
    const response = await fetch(
      "/api/music-recommendation-document/upload",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          action: "register",
          recommendationId,
          url,
          pathname,
          fileName:
            selectedFile.name,
          contentType:
            selectedFile.type,
          size: selectedFile.size,
        }),
      },
    );

    const result =
      await readResponse(response);

    if (!response.ok) {
      throw new Error(
        result.error ??
          "El documento se subió, pero no pudo asociarse al tema.",
      );
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isUploading) {
      return;
    }

    if (!file) {
      setError(
        "Selecciona una imagen para el documento.",
      );
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError);
      setMessage(null);
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setMessage(
      `Subiendo ${file.name}...`,
    );

    try {
      const pathname =
        `music-recommendation-documents/${recommendationId}/` +
        `${Date.now()}-${safeFileName(file.name)}`;

      const blob = await upload(
        pathname,
        file,
        {
          access: "public",
          handleUploadUrl:
            "/api/music-recommendation-document/upload",
          clientPayload:
            JSON.stringify({
              recommendationId,
            }),
          contentType:
            file.type || undefined,
          onUploadProgress: ({
            percentage,
          }) => {
            setProgress(
              Math.round(percentage),
            );
          },
        },
      );

      await registerDocument({
        url: blob.url,
        pathname: blob.pathname,
        selectedFile: file,
      });

      setProgress(100);
      setMessage(
        `Documento de “${title}” actualizado correctamente.`,
      );
      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      router.refresh();

      window.setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir el documento.",
      );
      setMessage(null);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      className={
        styles.directCoverUpload
      }
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
        disabled={isUploading}
        aria-label={`Seleccionar documento para ${title}`}
        onChange={(event) => {
          const selectedFile =
            event.target.files?.[0] ??
            null;

          setFile(selectedFile);
          setError(null);
          setMessage(null);
        }}
      />

      <button
        type="submit"
        disabled={
          isUploading || !file
        }
      >
        {isUploading
          ? "Subiendo..."
          : hasDocument
            ? "Sustituir documento"
            : "Subir documento"}
      </button>

      {isUploading && (
        <div
          className={
            styles.coverProgress
          }
          aria-live="polite"
        >
          <div>
            <span
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <strong>{progress}%</strong>
        </div>
      )}

      {message && (
        <p
          className={
            styles.coverUploadSuccess
          }
        >
          {message}
        </p>
      )}

      {error && (
        <p
          className={
            styles.coverUploadError
          }
        >
          {error}
        </p>
      )}
    </form>
  );
}
