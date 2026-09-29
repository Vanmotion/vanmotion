import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  communityAuthorSelect,
  getCommunitySessionUser,
} from "@/app/lib/community-auth";
import { prisma } from "@/app/lib/prisma";

const MAX_REPLY_LENGTH = 5000;

const replySelect = {
  id: true,
  body: true,
  topicId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: communityAuthorSelect,
  },
} as const;

function asRecord(
  value: unknown,
): Record<string, unknown> | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as Record<string, unknown>;
}

export async function GET(
  request: NextRequest,
) {
  try {
    const topicId =
      request.nextUrl.searchParams
        .get("topicId")
        ?.trim();

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

    const topic =
      await prisma.communityTopic
        .findUnique({
          where: {
            id: topicId,
          },
          select: {
            id: true,
            status: true,
          },
        });

    if (
      !topic ||
      topic.status === "HIDDEN"
    ) {
      return NextResponse.json(
        {
          error: "Topic not found",
        },
        {
          status: 404,
        },
      );
    }

    const replies =
      await prisma.communityReply
        .findMany({
          where: {
            topicId,
          },
          select: replySelect,
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
        error:
          "Could not load replies",
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
    const user =
      await getCommunitySessionUser(
        request,
      );

    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        {
          status: 401,
        },
      );
    }

    const rawBody: unknown =
      await request.json();

    const data =
      asRecord(rawBody);

    if (!data) {
      return NextResponse.json(
        {
          error: "Invalid request",
        },
        {
          status: 400,
        },
      );
    }

    const topicId =
      typeof data.topicId ===
        "string"
        ? data.topicId.trim()
        : "";

    const body =
      typeof data.body ===
        "string"
        ? data.body.trim()
        : "";

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

    if (
      !body ||
      body.length >
        MAX_REPLY_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "Reply must contain between 1 and 5000 characters",
        },
        {
          status: 400,
        },
      );
    }

    const topic =
      await prisma.communityTopic
        .findUnique({
          where: {
            id: topicId,
          },
          select: {
            id: true,
            status: true,
          },
        });

    if (
      !topic ||
      topic.status === "HIDDEN"
    ) {
      return NextResponse.json(
        {
          error: "Topic not found",
        },
        {
          status: 404,
        },
      );
    }

    if (
      topic.status === "LOCKED"
    ) {
      return NextResponse.json(
        {
          error:
            "This topic is locked",
        },
        {
          status: 409,
        },
      );
    }

    const reply =
      await prisma.communityReply
        .create({
          data: {
            body,
            topicId,
            authorId: user.id,
          },
          select: replySelect,
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
        error:
          "Could not create reply",
      },
      {
        status: 500,
      },
    );
  }
}
