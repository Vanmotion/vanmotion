import {
  CommunityCategory,
} from "@prisma/client";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  communityAuthorSelect,
  getCommunitySessionUser,
} from "@/app/lib/community-auth";
import { prisma } from "@/app/lib/prisma";

const MAX_TITLE_LENGTH = 120;
const MAX_BODY_LENGTH = 5000;
const MAX_ATTACHMENTS = 5;

function parseCategory(
  value: unknown,
): CommunityCategory | null {
  if (typeof value !== "string") {
    return null;
  }

  return Object.values(
    CommunityCategory,
  ).includes(
    value as CommunityCategory,
  )
    ? (value as CommunityCategory)
    : null;
}

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

function isCommunityBlobUrl(
  value: string,
): boolean {
  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" ||
      !url.hostname.endsWith(
        ".blob.vercel-storage.com",
      )
    ) {
      return false;
    }

    const pathname =
      decodeURIComponent(url.pathname);

    return pathname.startsWith(
      "/community/",
    );
  } catch {
    return false;
  }
}

const topicSelect = {
  id: true,
  category: true,
  title: true,
  body: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: communityAuthorSelect,
  },
  attachments: {
    select: {
      id: true,
      url: true,
      type: true,
    },
  },
} as const;

export async function GET(
  request: NextRequest,
) {
  try {
    const rawCategory =
      request.nextUrl.searchParams.get(
        "category",
      );

    const category =
      rawCategory === null
        ? null
        : parseCategory(rawCategory);

    if (
      rawCategory !== null &&
      !category
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid community category",
        },
        {
          status: 400,
        },
      );
    }

    const topics =
      await prisma.communityTopic.findMany({
        where: {
          ...(category
            ? { category }
            : {}),
          status: {
            not: "HIDDEN",
          },
        },
        select: topicSelect,
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      });

    return NextResponse.json({
      topics,
    });
  } catch (error) {
    console.error(
      "COMMUNITY_GET_TOPICS_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Could not load topics",
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

    const body = asRecord(rawBody);

    if (!body) {
      return NextResponse.json(
        {
          error: "Invalid request",
        },
        {
          status: 400,
        },
      );
    }

    const category =
      parseCategory(body.category);

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!category) {
      return NextResponse.json(
        {
          error:
            "Invalid community category",
        },
        {
          status: 400,
        },
      );
    }

    if (
      title.length < 3 ||
      title.length >
        MAX_TITLE_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "Title must contain between 3 and 120 characters",
        },
        {
          status: 400,
        },
      );
    }

    if (
      message.length < 3 ||
      message.length >
        MAX_BODY_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "Message must contain between 3 and 5000 characters",
        },
        {
          status: 400,
        },
      );
    }

    const rawAttachments =
      body.attachments ?? [];

    if (
      !Array.isArray(
        rawAttachments,
      ) ||
      rawAttachments.length >
        MAX_ATTACHMENTS
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid attachments",
        },
        {
          status: 400,
        },
      );
    }

    const attachments: string[] =
      [];

    for (
      const attachment
      of rawAttachments
    ) {
      if (
        typeof attachment !==
          "string" ||
        !isCommunityBlobUrl(
          attachment,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid attachment",
          },
          {
            status: 400,
          },
        );
      }

      attachments.push(
        attachment,
      );
    }

    const topic =
      await prisma.communityTopic.create({
        data: {
          category,
          title,
          body: message,
          status: "OPEN",
          authorId: user.id,

          attachments:
            attachments.length > 0
              ? {
                  create:
                    attachments.map(
                      (url) => ({
                        url,
                        type:
                          "IMAGE",
                      }),
                    ),
                }
              : undefined,
        },
        select: topicSelect,
      });

    return NextResponse.json({
      topic,
    });
  } catch (error) {
    console.error(
      "COMMUNITY_POST_TOPIC_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Could not create topic",
      },
      {
        status: 500,
      },
    );
  }
}
