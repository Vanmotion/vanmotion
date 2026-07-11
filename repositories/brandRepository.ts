import { prisma } from "@/lib/prisma";

export async function getBrands() {
  return prisma.brand.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getBrand(id: string) {
  return prisma.brand.findUnique({
    where: {
      id,
    },
  });
}