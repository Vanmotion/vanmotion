"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/app/lib/admin-session";
import { prisma } from "@/app/lib/prisma";

function getId(data: FormData, field: string): string {
  const value = data.get(field);
  if (typeof value !== "string" || !/^[a-z0-9]{15,50}$/.test(value)) {
    throw new Error("Identificador no válido.");
  }
  return value;
}

function refreshCommunity(): void {
  revalidatePath("/admin/community");
  revalidatePath("/community");
  revalidatePath("/en-us/community");
}

/** Elimina exclusivamente el tema elegido. Prisma elimina sus respuestas y metadatos de imágenes. */
export async function deleteCommunityTopic(data: FormData): Promise<void> {
  await requireAdminSession();
  const id = getId(data, "topicId");
  await prisma.communityTopic.delete({ where: { id } });
  refreshCommunity();
}

/** Elimina exclusivamente una respuesta, sin alterar el tema. */
export async function deleteCommunityReply(data: FormData): Promise<void> {
  await requireAdminSession();
  const id = getId(data, "replyId");
  await prisma.communityReply.delete({ where: { id } });
  refreshCommunity();
}

/** Suspende la cuenta y revoca las sesiones actuales inmediatamente. */
export async function blockCommunityUser(data: FormData): Promise<void> {
  await requireAdminSession();
  const id = getId(data, "userId");
  await prisma.$transaction(async (tx) => {
    const user = await tx.communityUser.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });
    if (!user) throw new Error("Usuario no encontrado.");
    if (user.role !== "MEMBER") {
      throw new Error("No se pueden bloquear cuentas del equipo de moderación.");
    }
    await tx.communityUser.update({
      where: { id },
      data: { status: "SUSPENDED" },
    });
    await tx.communitySession.deleteMany({ where: { userId: id } });
    await tx.communityLoginCode.deleteMany({ where: { email: user.email } });
  });
  refreshCommunity();
}

export async function unblockCommunityUser(data: FormData): Promise<void> {
  await requireAdminSession();
  const id = getId(data, "userId");
  await prisma.communityUser.update({
    where: { id },
    data: { status: "ACTIVE" },
  });
  refreshCommunity();
}
