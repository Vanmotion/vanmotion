"use server";

import { prisma } from "@/lib/prisma";

export async function createBrand(formData: FormData) {
  const name = formData.get("name") as string;

  if (!name) return;

  await prisma.brand.create({
    data: {
      name,
      slug: name
        .toLowerCase()
        .replace(/\s+/g, "-"),
    },
  });
}