import { createHash, randomInt } from "crypto";

import { NextResponse } from "next/server";
import { Resend } from "resend";

import { prisma } from "@/app/lib/prisma";

const CODE_TTL_MINUTES = 10;

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function hashCode(email: string, code: string): string {
  return createHash("sha256")
    .update(`${email}:${code}`)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = normalizeEmail(
      typeof body.email === "string"
        ? body.email
        : "",
    );

    if (
      !email ||
      !email.includes("@") ||
      email.length > 254
    ) {
      return NextResponse.json(
        {
          error: "Enter a valid email address.",
        },
        {
          status: 400,
        },
      );
    }

    const apiKey =
      process.env.RESEND_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Email service is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    const code = String(
      randomInt(100000, 1000000),
    );

    const codeHash = hashCode(
      email,
      code,
    );

    const expiresAt = new Date(
      Date.now() +
        CODE_TTL_MINUTES *
          60 *
          1000,
    );

    await prisma.communityLoginCode.create({
      data: {
        email,
        codeHash,
        expiresAt,
      },
    });

    const resend = new Resend(apiKey);

    const fromEmail =
      process.env.CONTACT_FROM_EMAIL?.trim() ||
      "VANMOTION <contacto@vanmotion.es>";

    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `${code} · VANMOTION Community`,
      html: `
        <div
          style="
            background:#080808;
            color:#f3f0ea;
            padding:40px 24px;
            font-family:Arial,sans-serif;
          "
        >
          <div
            style="
              max-width:560px;
              margin:0 auto;
              border:1px solid #2b2b2b;
              padding:34px;
            "
          >
            <p
              style="
                margin:0 0 28px;
                color:#8b8b8b;
                font-size:10px;
                letter-spacing:3px;
              "
            >
              VANMOTION / COMMUNITY
            </p>

            <h1
              style="
                margin:0 0 18px;
                font-size:28px;
                font-weight:500;
              "
            >
              Your access code
            </h1>

            <div
              style="
                margin:28px 0;
                font-size:42px;
                letter-spacing:10px;
                font-weight:600;
                color:#c9a86a;
              "
            >
              ${code}
            </div>

            <p
              style="
                margin:0;
                color:#888888;
                font-size:13px;
                line-height:1.7;
              "
            >
              This code expires in ${CODE_TTL_MINUTES} minutes.
              If you did not request it, you can ignore this email.
            </p>
          </div>
        </div>
      `,
      text: [
        "VANMOTION / COMMUNITY",
        "",
        `Your access code is: ${code}`,
        "",
        `This code expires in ${CODE_TTL_MINUTES} minutes.`,
      ].join("\n"),
    });

    if (result.error) {
      console.error(
        "COMMUNITY_LOGIN_EMAIL_ERROR:",
        result.error,
      );

      return NextResponse.json(
        {
          error:
            "We could not send the access code.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "COMMUNITY_REQUEST_CODE_ERROR:",
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
