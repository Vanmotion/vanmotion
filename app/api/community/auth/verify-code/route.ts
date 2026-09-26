import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE_NAME =
  "vanmotion_community_session";

const SESSION_DAYS = 30;

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeUsername(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 40);
}

function hashValue(value: string): string {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

function hashCode(
  email: string,
  code: string,
): string {
  return hashValue(`${email}:${code}`);
}

function safeHashEqual(
  left: string,
  right: string,
): boolean {
  const leftBuffer = Buffer.from(
    left,
    "utf8",
  );

  const rightBuffer = Buffer.from(
    right,
    "utf8",
  );

  if (
    leftBuffer.length !==
    rightBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    leftBuffer,
    rightBuffer,
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = normalizeEmail(
      typeof body.email === "string"
        ? body.email
        : "",
    );

    const code =
      typeof body.code === "string"
        ? body.code.trim()
        : "";

    const username = normalizeUsername(
      typeof body.username === "string"
        ? body.username
        : "",
    );

    if (
      !email ||
      !email.includes("@") ||
      !/^\d{6}$/.test(code)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid email or access code.",
        },
        {
          status: 400,
        },
      );
    }

    const loginCode =
      await prisma.communityLoginCode.findFirst({
        where: {
          email,
          usedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!loginCode) {
      return NextResponse.json(
        {
          error:
            "The access code is invalid or has expired.",
        },
        {
          status: 401,
        },
      );
    }

    const submittedHash =
      hashCode(email, code);

    if (
      !safeHashEqual(
        loginCode.codeHash,
        submittedHash,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The access code is invalid or has expired.",
        },
        {
          status: 401,
        },
      );
    }

    let user =
      await prisma.communityUser.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      if (
        username.length < 2 ||
        username.length > 40
      ) {
        return NextResponse.json(
          {
            error:
              "Choose a name between 2 and 40 characters.",
          },
          {
            status: 400,
          },
        );
      }

      const usernameExists =
        await prisma.communityUser.findUnique({
          where: {
            username,
          },
          select: {
            id: true,
          },
        });

      if (usernameExists) {
        return NextResponse.json(
          {
            error:
              "That name is already being used.",
          },
          {
            status: 409,
          },
        );
      }

      user =
        await prisma.communityUser.create({
          data: {
            email,
            username,
            displayName: username,
          },
        });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error:
            "This community account is not active.",
        },
        {
          status: 403,
        },
      );
    }

    const sessionToken =
      randomBytes(32).toString("hex");

    const tokenHash =
      hashValue(sessionToken);

    const expiresAt =
      new Date(
        Date.now() +
          SESSION_DAYS *
            24 *
            60 *
            60 *
            1000,
      );

    await prisma.$transaction([
      prisma.communityLoginCode.update({
        where: {
          id: loginCode.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),

      prisma.communitySession.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
    ]);

    const response =
      NextResponse.json({
        ok: true,
        user: {
          id: user.id,
          username: user.username,
          displayName:
            user.displayName,
        },
      });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error(
      "COMMUNITY_VERIFY_CODE_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}
