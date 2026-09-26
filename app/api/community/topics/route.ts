import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE_NAME = "vanmotion_community_session";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get(
      SESSION_COOKIE_NAME,
    )?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }

    const session = await prisma.communitySession.findUnique({
      where: {
        tokenHash: token,
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const topic = await prisma.communityTopic.create({
      data: {
        category: body.category,
        title: body.title,
        body: body.message,
        authorId: session.userId,
      },
    });

    return NextResponse.json({
      ok: true,
      topic,
    });
  } catch (error) {
    console.error(
      "COMMUNITY_CREATE_TOPIC_ERROR:",
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
