import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const category =
      request.nextUrl.searchParams.get("category");

    const topics =
      await prisma.communityTopic.findMany({
        where: category
          ? { category: category as any }
          : undefined,

        include: {
          author: true,
          attachments: true,
        },

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
        error: "Could not load topics",
      },
      {
        status: 500,
      },
    );
  }
}
