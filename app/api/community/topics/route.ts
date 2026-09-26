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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      category,
      title,
      message,
      attachments = [],
    } = body;

    const topic =
      await prisma.communityTopic.create({
        data: {
          category,
          title,
          body: message,
          status: "OPEN",

          author: {
            connectOrCreate: {
              where: {
                email: "community@vanmotion.es",
              },
              create: {
                email: "community@vanmotion.es",
                username: "VANMOTION",
                displayName: "VANMOTION",
              },
            },
          },

          attachments: {
            create: attachments.map(
              (url: string) => ({
                url,
                type: "IMAGE",
              }),
            ),
          },
        },

        include: {
          attachments: true,
        },
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
        error: "Could not create topic",
      },
      {
        status: 500,
      },
    );
  }
}
