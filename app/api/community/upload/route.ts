import {
  randomUUID,
} from "node:crypto";

import { put } from "@vercel/blob";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getCommunitySessionUser,
} from "@/app/lib/community-auth";

export const runtime = "nodejs";

const MAX_SIZE =
  5 * 1024 * 1024;

const CONTENT_TYPES =
  new Map<string, string>([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ]);

export async function POST(
  request: NextRequest,
) {
  try {
    const user =
      await getCommunitySessionUser(
        request,
      );

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Not authenticated",
        },
        {
          status: 401,
        },
      );
    }

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "No image provided",
        },
        {
          status: 400,
        },
      );
    }

    const extension =
      CONTENT_TYPES.get(
        file.type,
      );

    if (!extension) {
      return NextResponse.json(
        {
          error:
            "Invalid image format",
        },
        {
          status: 400,
        },
      );
    }

    if (
      file.size <= 0 ||
      file.size > MAX_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "Image too large",
        },
        {
          status: 400,
        },
      );
    }

    const pathname =
      `community/${user.id}/${randomUUID()}.${extension}`;

    const blob =
      await put(
        pathname,
        file,
        {
          access: "public",
        },
      );

    return NextResponse.json({
      ok: true,
      url: blob.url,
    });
  } catch (error) {
    console.error(
      "COMMUNITY_UPLOAD_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Upload failed",
      },
      {
        status: 500,
      },
    );
  }
}
