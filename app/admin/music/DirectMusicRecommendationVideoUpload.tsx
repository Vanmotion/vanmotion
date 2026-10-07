"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import styles from "./music-admin.module.css";

const MAX_VIDEO_SIZE = 250 * 1024 * 1024;

type Props = {
  recommendationId: string;
  title: string;
  hasVideo: boolean;
};

type RegisterResponse = {
  error?: string;
};

function safeFileName(fileName: string): string {
  return (
    fileName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "video.mp4"
  );
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

export default function DirectMusicRecommendationVideoUpload({
  recommendationId,
  title,
  hasVideo,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function validateFile(file: File): string | null {
    if (file.size === 0) {
      return "El vídeo está vacío o no se puede leer.";
    }

    if (file.size > MAX_VIDEO_SIZE) {
      return `El vídeo ocupa ${formatMegabytes(file.size)}. El máximo es 250 MB.`;
    }

    if (!file.name.toLowerCase().endsWith(".mp4")) {
      return "Utiliza un vídeo MP4.";
    }

    if (
      file.type &&
      file.type !== "video/mp4"
    ) {
      return "El archivo seleccionado no es un vídeo MP4 válido.";
    }

    return null;
  }

  async function registerVideo({
    url,
    pathname,
    file,
  }: {
    url: string;
    pathname: string;
    file: File;
  }): Promise<void> {
    const response = await fetch(
      "/api/music-recommendation-video/upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "register",
          recommendationId,
          url,
          pathname,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      },
    );

    const result = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        result.error ??
          "El vídeo se subió, pero no pudo asociarse al recomendado.",
      );
    }
  }

  async function handleFile(file: File): Promise<void> {
    if (isUploading) return;

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setMessage(null);
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setMessage(`Subiendo ${file.name}...`);

    try {
      const pathname =
        `music/recommendations/${recommendationId}/` +
        `${Date.now()}-${safeFileName(file.name)}`;

      const blob = await upload(
        pathname,
        file,
        {
          access: "public",
          handleUploadUrl:
            "/api/music-recommendation-video/upload",
          clientPayload: JSON.stringify({
            recommendationId,
          }),
          contentType: "video/mp4",
          multipart: file.size > 100 * 1024 * 1024,
          onUploadProgress: ({
            percentage,
          }) => {
            setProgress(Math.round(percentage));
          },
        },
      );

      await registerVideo({
        url: blob.url,
        pathname: blob.pathname,
        file,
      });

      setProgress(100);
      setMessage(
        `Vídeo de “${title}” actualizado correctamente.`,
      );

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      router.refresh();

      window.setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir el vídeo.",
      );
      setMessage(null);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className={styles.directAudioUpload}>
      <div className={styles.directAudioHeading}>
        <div>
          <span>Vídeo recomendado</span>
          <strong>
            {hasVideo
              ? `Sustituir vídeo de ${title}`
              : `Subir vídeo de ${title}`}
          </strong>
        </div>

        <small>
          Subida directa a VANMOTION · MP4 · máximo 250 MB
        </small>
      </div>

      <div className={styles.directAudioControls}>
        <input
          ref={inputRef}
          type="file"
          accept=".mp4,video/mp4"
          disabled={isUploading}
          aria-label={`Seleccionar vídeo para ${title}`}
          onChange={(event) => {
            const file =
              event.target.files?.[0];

            if (file) {
              void handleFile(file);
            }
          }}
        />
      </div>

      {isUploading && (
        <div
          className={styles.audioProgress}
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
        <p className={styles.audioSuccess}>
          {message}
        </p>
      )}

      {error && (
        <p className={styles.audioError}>
          {error}
        </p>
      )}
    </section>
  );
}
