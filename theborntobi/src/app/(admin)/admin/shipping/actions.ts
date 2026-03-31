"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getShippingOrders(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { status, search, page = 1, limit = 50 } = params;

  const statuses = status
    ? [status]
    : ["PREPARING", "SHIPPED"];

  const where: Record<string, unknown> = {
    status: { in: statuses },
  };

  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { shipment: { trackingNumber: { contains: search } } },
    ];
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        shipment: true,
        items: {
          take: 1,
          select: { productName: true, variantName: true, quantity: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  return {
    items: orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function registerShipment(
  orderId: string,
  trackingNumber: string,
  carrier: string = "로젠택배"
) {
  await db.shipment.create({
    data: {
      orderId,
      carrier,
      trackingNumber,
      status: "PICKED_UP",
      shippedAt: new Date(),
    },
  });

  await db.order.update({
    where: { id: orderId },
    data: { status: "SHIPPED" },
  });

  revalidatePath("/admin/shipping");
}

export async function updateShipmentStatus(
  shipmentId: string,
  status: string
) {
  const updateData: Record<string, unknown> = { status };
  if (status === "DELIVERED") {
    updateData.deliveredAt = new Date();
  }

  const shipment = await db.shipment.update({
    where: { id: shipmentId },
    data: updateData,
  });

  if (status === "DELIVERED") {
    await db.order.update({
      where: { id: shipment.orderId },
      data: { status: "DELIVERED" },
    });
  }

  revalidatePath("/admin/shipping");
}

export async function getShippingStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [pending, inTransit, deliveredToday] = await Promise.all([
    db.order.count({ where: { status: "PREPARING" } }),
    db.order.count({ where: { status: "SHIPPED" } }),
    db.shipment.count({
      where: {
        status: "DELIVERED",
        deliveredAt: { gte: today, lt: tomorrow },
      },
    }),
  ]);

  return { pending, inTransit, deliveredToday };
}
