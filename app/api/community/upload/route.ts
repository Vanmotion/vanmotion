import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image too large" },
        { status: 400 },
      );
    }

    const extension =
      file.name.split(".").pop() || "webp";

    const filename =
      `${randomUUID()}.${extension}`;

    const buffer = Buffer.from(
      await file.arrayBuffer(),
    );

    const uploadPath = path.join(
      process.cwd(),
      "public/uploads/community",
      filename,
    );

    await writeFile(
      uploadPath,
      buffer,
    );

    return NextResponse.json({
      ok: true,
      url: `/uploads/community/${filename}`,
    });

  } catch (error) {
    console.error(
      "COMMUNITY_UPLOAD_ERROR:",
      error,
    );

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }
}
