import { prisma } from "@/lib/prisma";

export async function getVehicles() {
  return prisma.vehicle.findMany({
    include: {
      brand: true,
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getVehicle(id: string) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: {
      brand: true,
      images: true,
    },
  });
}