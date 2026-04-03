"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCustomerAuth } from "@/lib/customer-auth";

export async function getMyOrders(page = 1, limit = 20) {
  const { id } = await requireCustomerAuth();
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    db.order.findMany({
      where: { customerId: id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        items: { take: 3 },
        payment: true,
        shipment: true,
      },
    }),
    db.order.count({ where: { customerId: id } }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getMyOrderDetail(orderId: string) {
  const { id } = await requireCustomerAuth();
  return db.order.findFirst({
    where: { id: orderId, customerId: id },
    include: {
      items: true,
      payment: true,
      shipment: true,
    },
  });
}

export async function getMyAddresses() {
  const { id } = await requireCustomerAuth();
  return db.address.findMany({
    where: { customerId: id },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  });
}

export async function createAddress(formData: FormData) {
  const { id } = await requireCustomerAuth();
  const recipient = String(formData.get("recipient") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const zipCode = String(formData.get("zipCode") || "").trim();
  const address1 = String(formData.get("address1") || "").trim();
  const address2 = String(formData.get("address2") || "").trim();
  const label = String(formData.get("label") || "").trim();
  const isDefault = String(formData.get("isDefault") || "") === "on";

  if (!recipient || !phone || !zipCode || !address1) {
    return { error: "받는 분, 연락처, 우편번호, 주소는 필수입니다." };
  }

  if (isDefault) {
    await db.address.updateMany({ where: { customerId: id }, data: { isDefault: false } });
  }

  await db.address.create({
    data: {
      customerId: id,
      recipient,
      phone,
      zipCode,
      address1,
      address2: address2 || null,
      label: label || null,
      isDefault,
    },
  });

  revalidatePath("/mypage");
  revalidatePath("/mypage/addresses");

  return { success: true };
}

export async function updateAddress(id: string, formData: FormData) {
  const { id: customerId } = await requireCustomerAuth();
  const recipient = String(formData.get("recipient") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const zipCode = String(formData.get("zipCode") || "").trim();
  const address1 = String(formData.get("address1") || "").trim();
  const address2 = String(formData.get("address2") || "").trim();
  const label = String(formData.get("label") || "").trim();
  const isDefault = String(formData.get("isDefault") || "") === "on";

  const existing = await db.address.findFirst({ where: { id, customerId } });
  if (!existing) {
    return { error: "배송지를 찾을 수 없습니다." };
  }

  if (!recipient || !phone || !zipCode || !address1) {
    return { error: "받는 분, 연락처, 우편번호, 주소는 필수입니다." };
  }

  if (isDefault) {
    await db.address.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });
  }

  await db.address.update({
    where: { id },
    data: {
      recipient,
      phone,
      zipCode,
      address1,
      address2: address2 || null,
      label: label || null,
      isDefault,
    },
  });

  revalidatePath("/mypage");
  revalidatePath("/mypage/addresses");

  return { success: true };
}

export async function deleteAddress(id: string) {
  const { id: customerId } = await requireCustomerAuth();

  const existing = await db.address.findFirst({ where: { id, customerId } });
  if (!existing) {
    return { error: "배송지를 찾을 수 없습니다." };
  }

  await db.address.delete({ where: { id } });

  if (existing.isDefault) {
    const nextAddress = await db.address.findFirst({
      where: { customerId },
      orderBy: { id: "desc" },
    });

    if (nextAddress) {
      await db.address.update({
        where: { id: nextAddress.id },
        data: { isDefault: true },
      });
    }
  }

  revalidatePath("/mypage");
  revalidatePath("/mypage/addresses");

  return { success: true };
}

export async function setDefaultAddress(id: string) {
  const { id: customerId } = await requireCustomerAuth();

  const existing = await db.address.findFirst({ where: { id, customerId } });
  if (!existing) {
    return { error: "배송지를 찾을 수 없습니다." };
  }

  await db.$transaction([
    db.address.updateMany({
      where: { customerId },
      data: { isDefault: false },
    }),
    db.address.update({
      where: { id },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/mypage");
  revalidatePath("/mypage/addresses");

  return { success: true };
}

export async function updateMyProfile(formData: FormData) {
  const { id } = await requireCustomerAuth();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name) return { error: "이름은 필수입니다." };

  await db.customer.update({
    where: { id },
    data: { name, phone: phone || null },
  });

  revalidatePath("/mypage");
  revalidatePath("/mypage/profile");

  return { success: true };
}

export async function changePassword(formData: FormData) {
  const { id } = await requireCustomerAuth();
  const oldPassword = String(formData.get("oldPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");

  if (!oldPassword || !newPassword) {
    return { error: "현재 비밀번호와 새 비밀번호를 입력해 주세요." };
  }

  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer?.passwordHash) {
    return { error: "비밀번호 변경이 불가능한 계정입니다." };
  }

  const valid = await bcrypt.compare(oldPassword, customer.passwordHash);
  if (!valid) {
    return { error: "현재 비밀번호가 올바르지 않습니다." };
  }

  if (newPassword.length < 8) {
    return { error: "새 비밀번호는 8자 이상이어야 합니다." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.customer.update({ where: { id }, data: { passwordHash } });

  revalidatePath("/mypage/profile");

  return { success: true };
}

export async function getMyCoupons() {
  const { id } = await requireCustomerAuth();
  return db.couponUsage.findMany({
    where: { customerId: id },
    include: { coupon: true },
    orderBy: { usedAt: "desc" },
  });
}

export async function getMyProfile() {
  const { id } = await requireCustomerAuth();
  return db.customer.findUnique({
    where: { id },
    include: { grade: true },
  });
}
