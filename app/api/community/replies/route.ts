import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE_NAME =
  "vanmotion_community_session";

function hashValue(value: string): string {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}



export async function GET(
  request: NextRequest,
) {
  try {
    const topicId =
      request.nextUrl.searchParams.get(
        "topicId",
      );

    if (!topicId) {
      return NextResponse.json(
        {
          error: "Missing topicId",
        },
        {
          status: 400,
        },
      );
    }

    const replies =
      await prisma.communityReply.findMany({
        where: {
          topicId,
        },
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    return NextResponse.json({
      replies,
    });

  } catch (error) {
    console.error(
      "COMMUNITY_GET_REPLIES_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error: "Could not load replies",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const sessionToken =
      request.cookies.get(
        SESSION_COOKIE_NAME,
      )?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        {
          status: 401,
        },
      );
    }

    const session =
      await prisma.communitySession.findUnique({
        where: {
          tokenHash:
            hashValue(sessionToken),
        },
        include: {
          user: true,
        },
      });

    if (
      !session ||
      session.expiresAt < new Date()
    ) {
      return NextResponse.json(
        {
          error: "Session expired",
        },
        {
          status: 401,
        },
      );
    }

    const reply = await prisma.communityReply.create({
      data: {
        body: body.body,
        topicId: body.topicId,
        authorId: session.user.id,
      },
      include: {
        author: true,
      },
    });

    return NextResponse.json({
      reply,
    });

  } catch (error) {
    console.error(
      "COMMUNITY_POST_REPLY_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error: "Could not create reply",
      },
      {
        status: 500,
      },
    );
  }
}
