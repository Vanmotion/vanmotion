"use server";

import { revalidatePath } from "next/cache";

import { ingestNews, repairActiveNewsSummaries, setNewsActive } from "@/app/lib/news";
import { requireAdminSession } from "@/app/lib/admin-session";

export async function toggleNewsAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";
  if (!id) return;
  await setNewsActive(id, isActive);
  revalidatePath("/admin/news");
  revalidatePath("/noticias");
  revalidatePath("/en-us/noticias");
}

export async function refreshNewsAction() {
  await requireAdminSession();
  await ingestNews();
  await repairActiveNewsSummaries();
  revalidatePath("/admin/news");
  revalidatePath("/noticias");
  revalidatePath("/en-us/noticias");
}