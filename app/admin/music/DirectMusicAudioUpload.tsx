"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import styles from "./music-admin.module.css";

const MAX_AUDIO_SIZE = 70 * 1024 * 1024;

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "audio/mp4",
  "audio/x-m4a",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".aac",
  ".m4a",
]);

type DirectMusicAudioUploadProps = {
  trackId: string;
  trackSlug: string;
  title: string;
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

  return normalized || "audio.mp3";
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

export default function DirectMusicAudioUpload({
  trackId,
  trackSlug,
  title,
}: DirectMusicAudioUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function validateFile(file: File): string | null {
    if (file.size === 0) {
      return "El archivo está vacío o no se puede leer.";
    }

    if (file.size > MAX_AUDIO_SIZE) {
      return `El archivo ocupa ${formatMegabytes(file.size)}. El máximo es 70 MB.`;
    }

    const extension = extensionOf(file.name);

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return "Utiliza un archivo MP3, WAV, AAC o M4A.";
    }

    if (file.type && !ALLOWED_AUDIO_TYPES.has(file.type)) {
      return "El tipo real del archivo no coincide con un audio permitido.";
    }

    return null;
  }

  async function registerAudio({
    url,
    pathname,
    file,
  }: {
    url: string;
    pathname: string;
    file: File;
  }): Promise<void> {
    const response = await fetch(
      "/api/music-audio/upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "register",
          trackId,
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
          "El audio se subió, pero no pudo asociarse a la canción.",
      );
    }
  }

  async function handleFile(file: File): Promise<void> {
    if (isUploading) {
      return;
    }

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
        `music-audio/${trackId}/` +
        `${Date.now()}-${safeFileName(file.name)}`;

      const blob = await upload(
        pathname,
        file,
        {
          access: "public",
          handleUploadUrl:
            "/api/music-audio/upload",
          clientPayload: JSON.stringify({
            trackId,
          }),
          contentType:
            file.type || undefined,
          multipart:
            file.size > 5 * 1024 * 1024,
          onUploadProgress: ({
            percentage,
          }) => {
            setProgress(
              Math.round(percentage),
            );
          },
        },
      );

      await registerAudio({
        url: blob.url,
        pathname: blob.pathname,
        file,
      });

      setProgress(100);
      setMessage(
        `Audio de “${title}” actualizado correctamente.`,
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
          : "No se pudo subir el audio.",
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
          <span>Archivo de audio</span>
          <strong>Sustituir audio de {title}</strong>
        </div>

        <small>
          Subida directa y persistente · MP3, WAV, AAC o M4A · máximo 70 MB
        </small>
      </div>

      <div className={styles.directAudioControls}>
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav,.aac,.m4a,audio/mpeg,audio/wav,audio/aac,audio/mp4"
          disabled={isUploading}
          aria-label={`Seleccionar audio para ${title}`}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
          }}
        />

        <span className={styles.audioTrackSlug}>
          {trackSlug}
        </span>
      </div>

      {isUploading && (
        <div
          className={styles.audioProgress}
          aria-live="polite"
        >
          <div>
            <span style={{ width: `${progress}%` }} />
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
