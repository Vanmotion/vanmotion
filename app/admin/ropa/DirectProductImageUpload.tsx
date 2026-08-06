"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useRef,
  useState,
} from "react";

import styles from "./ropa.module.css";

const MAX_IMAGE_SIZE =
  8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);

const ALLOWED_EXTENSIONS =
  new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
  ]);

type ProductImageView =
  | "LIFESTYLE"
  | "FRONT"
  | "BACK"
  | "DETAIL";

type DirectProductImageUploadProps = {
  productId: string;
  productName: string;
  view: ProductImageView;
  hasImage: boolean;
};

type RegisterResponse = {
  error?: string;
};

function extensionOf(
  fileName: string,
): string {
  const dotIndex =
    fileName.lastIndexOf(".");

  return dotIndex >= 0
    ? fileName
        .slice(dotIndex)
        .toLowerCase()
    : "";
}

function safeFileName(
  fileName: string,
): string {
  const normalized =
    fileName
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase()
      .replace(
        /[^a-z0-9._-]+/g,
        "-",
      )
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  return normalized || "imagen.webp";
}

function formatMegabytes(
  bytes: number,
): string {
  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
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

export default function DirectProductImageUpload({
  productId,
  productName,
  view,
  hasImage,
}: DirectProductImageUploadProps) {
  const router = useRouter();
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [file, setFile] =
    useState<File | null>(null);
  const [isUploading, setIsUploading] =
    useState(false);
  const [progress, setProgress] =
    useState(0);
  const [message, setMessage] =
    useState<string | null>(null);
  const [error, setError] =
    useState<string | null>(null);

  function validateFile(
    selectedFile: File,
  ): string | null {
    if (
      selectedFile.size === 0
    ) {
      return "La imagen está vacía o no se puede leer.";
    }

    if (
      selectedFile.size >
      MAX_IMAGE_SIZE
    ) {
      return `La imagen ocupa ${formatMegabytes(selectedFile.size)}. El máximo es 8 MB.`;
    }

    const extension =
      extensionOf(
        selectedFile.name,
      );

    if (
      !ALLOWED_EXTENSIONS.has(
        extension,
      )
    ) {
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

  async function registerImage({
    url,
    pathname,
    selectedFile,
  }: {
    url: string;
    pathname: string;
    selectedFile: File;
  }): Promise<void> {
    const response = await fetch(
      "/api/product-image/upload",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          action: "register",
          productId,
          view,
          url,
          pathname,
          fileName:
            selectedFile.name,
          contentType:
            selectedFile.type,
          size:
            selectedFile.size,
        }),
      },
    );

    const result =
      await readResponse(response);

    if (!response.ok) {
      throw new Error(
        result.error ??
          "La imagen se subió, pero no pudo asociarse al producto.",
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
        "Selecciona una imagen.",
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
        `clothing/${productId}/` +
        `${view.toLowerCase()}/` +
        `${Date.now()}-${safeFileName(file.name)}`;

      const blob = await upload(
        pathname,
        file,
        {
          access: "public",
          handleUploadUrl:
            "/api/product-image/upload",
          clientPayload:
            JSON.stringify({
              productId,
              view,
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

      await registerImage({
        url: blob.url,
        pathname:
          blob.pathname,
        selectedFile: file,
      });

      setProgress(100);
      setMessage(
        `Imagen de “${productName}” actualizada correctamente.`,
      );
      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      router.refresh();

      window.setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (
      uploadError
    ) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir la imagen.",
      );
      setMessage(null);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      className={
        styles.directProductImageUpload
      }
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <div
        className={
          styles.directProductImageControls
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
          disabled={isUploading}
          aria-label={`Seleccionar imagen para ${productName}`}
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
          className={
            styles.directProductImageButton
          }
          disabled={
            isUploading || !file
          }
        >
          {isUploading
            ? "Subiendo..."
            : hasImage
              ? "Cambiar imagen"
              : "Subir imagen"}
        </button>
      </div>

      {isUploading && (
        <div
          className={
            styles.productImageProgress
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
            styles.productImageUploadSuccess
          }
        >
          {message}
        </p>
      )}

      {error && (
        <p
          className={
            styles.productImageUploadError
          }
        >
          {error}
        </p>
      )}
    </form>
  );
}
