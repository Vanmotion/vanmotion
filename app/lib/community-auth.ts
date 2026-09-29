import { createHash } from "node:crypto";

import type { NextRequest } from "next/server";

import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE_NAME =
  "vanmotion_community_session";

function hashValue(value: string): string {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

export const communityAuthorSelect = {
  id: true,
  username: true,
  displayName: true,
  role: true,
} as const;

export async function getCommunitySessionUser(
  request: NextRequest,
) {
  const sessionToken =
    request.cookies.get(
      SESSION_COOKIE_NAME,
    )?.value;

  if (!sessionToken) {
    return null;
  }

  const session =
    await prisma.communitySession.findUnique({
      where: {
        tokenHash:
          hashValue(sessionToken),
      },
      select: {
        expiresAt: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true,
            status: true,
          },
        },
      },
    });

  if (
    !session ||
    session.expiresAt <= new Date() ||
    session.user.status !== "ACTIVE"
  ) {
    return null;
  }

  return session.user;
}
