"use server";

import { prisma } from "@/lib/prisma";

export async function createVehicle(data: {
  brandId: string;
  model: string;
  version?: string;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  drivetrain?: string;
  engine?: string;
  power?: number;
  color?: string;
  price: number;
  description?: string;
}) {
  return prisma.vehicle.create({
    data: {
      ...data,
      price: data.price,
    },
  });
}

export async function deleteVehicle(id: string) {
  return prisma.vehicle.delete({
    where: {
      id,
    },
  });
}