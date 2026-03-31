"use server";

import { db } from "@/lib/db";

export async function getSiteConfig() {
  const config = await db.siteConfig.findFirst();
  return config;
}

type CartItemInput = {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
};

type ShippingAddress = {
  recipient: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  note?: string;
};

type CreateOrderInput = {
  items: CartItemInput[];
  shippingAddress: ShippingAddress;
  depositorName: string;
  note?: string;
  couponCode?: string;
};

function generateOrderNumber(): string {
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `ORD-${dateStr}-${rand}`;
}

async function ensureUniqueOrderNumber(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const num = generateOrderNumber();
    const existing = await db.order.findUnique({ where: { orderNumber: num } });
    if (!existing) return num;
  }
  // Fallback with timestamp for uniqueness
  return `ORD-${Date.now()}`;
}

export async function createOrder(data: CreateOrderInput): Promise<
  | { orderId: string; orderNumber: string }
  | { error: string }
> {
  const { items, shippingAddress, depositorName, note, couponCode } = data;

  if (!items || items.length === 0) {
    return { error: "주문할 상품이 없습니다." };
  }

  // Validate all variants exist and have sufficient stock
  const variantIds = items.map((i) => i.variantId);
  const variants = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) {
      return { error: `상품 옵션을 찾을 수 없습니다: ${item.productName}` };
    }
    if (!variant.isActive || !variant.product.isActive) {
      return { error: `판매 중단된 상품입니다: ${item.productName}` };
    }
    if (variant.stock < item.quantity) {
      return {
        error: `재고가 부족합니다: ${item.productName} (남은 수량: ${variant.stock}개)`,
      };
    }
  }

  // Validate coupon if provided
  let coupon: {
    id: string;
    discountType: string;
    discountValue: number;
    maxDiscount: number | null;
  } | null = null;
  let discountAmount = 0;

  if (couponCode) {
    const subtotalForCoupon = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const couponResult = await validateCoupon(couponCode, subtotalForCoupon);
    if (!couponResult.valid) {
      return { error: couponResult.reason ?? "유효하지 않은 쿠폰입니다." };
    }
    coupon = {
      id: couponResult.couponId!,
      discountType: couponResult.discountType!,
      discountValue: couponResult.discountValue!,
      maxDiscount: couponResult.maxDiscount ?? null,
    };
    discountAmount = couponResult.discount!;
  }

  // Get site config for shipping fee + bank info
  const config = await db.siteConfig.findFirst();
  const freeShippingThreshold = config?.freeShippingThreshold ?? 50000;
  const defaultShippingFee = config?.defaultShippingFee ?? 2500;
  const bankName = config?.bankName ?? "";
  const accountNumber = config?.bankAccount ?? "";

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : defaultShippingFee;
  const totalAmount = subtotal + shippingFee - discountAmount;

  const orderNumber = await ensureUniqueOrderNumber();

  // Create a guest customer placeholder if needed (orders require customerId in schema)
  // For the storefront (non-auth flow), we use a shared guest customer
  let guestCustomer = await db.customer.findFirst({
    where: { email: "guest@theborntobi.com" },
  });
  if (!guestCustomer) {
    guestCustomer = await db.customer.create({
      data: {
        email: "guest@theborntobi.com",
        name: "비회원",
        provider: "guest",
      },
    });
  }

  // Create everything in a transaction
  try {
    const order = await db.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: guestCustomer!.id,
          status: "AWAITING_DEPOSIT",
          subtotal,
          shippingFee,
          discountAmount,
          totalAmount,
          shippingAddress: JSON.stringify(shippingAddress),
          note: note ?? null,
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
      });

      // Create payment
      const depositDeadline = new Date();
      depositDeadline.setHours(depositDeadline.getHours() + 24);

      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: "BANK_TRANSFER",
          amount: totalAmount,
          status: "AWAITING_DEPOSIT",
          bankName,
          accountNumber,
          depositorName,
          depositDeadline,
        },
      });

      // Decrement stock and create inventory logs
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            delta: -item.quantity,
            reason: "ORDER",
            referenceId: newOrder.id,
          },
        });
      }

      // Handle coupon usage
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });

        await tx.couponUsage.create({
          data: {
            couponId: coupon.id,
            customerId: guestCustomer!.id,
            orderId: newOrder.id,
          },
        });
      }

      return newOrder;
    });

    return { orderId: order.id, orderNumber: order.orderNumber };
  } catch (err) {
    console.error("createOrder error:", err);
    return { error: "주문 처리 중 오류가 발생했습니다. 다시 시도해 주세요." };
  }
}

type ValidateCouponResult =
  | {
      valid: true;
      discount: number;
      discountType: string;
      discountValue: number;
      maxDiscount: number | null;
      couponId: string;
      reason?: never;
    }
  | { valid: false; reason: string; discount?: never; discountType?: never; discountValue?: never; maxDiscount?: never; couponId?: never };

export async function validateCoupon(
  code: string,
  orderTotal: number
): Promise<ValidateCouponResult> {
  if (!code.trim()) {
    return { valid: false, reason: "쿠폰 코드를 입력해 주세요." };
  }

  const coupon = await db.coupon.findUnique({ where: { code: code.trim() } });

  if (!coupon) {
    return { valid: false, reason: "존재하지 않는 쿠폰 코드입니다." };
  }

  if (!coupon.isActive) {
    return { valid: false, reason: "사용할 수 없는 쿠폰입니다." };
  }

  const now = new Date();

  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, reason: "아직 사용 기간이 시작되지 않은 쿠폰입니다." };
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, reason: "만료된 쿠폰입니다." };
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, reason: "쿠폰 사용 한도를 초과했습니다." };
  }

  if (coupon.minOrderAmount !== null && orderTotal < coupon.minOrderAmount) {
    return {
      valid: false,
      reason: `최소 주문금액 ₩${coupon.minOrderAmount.toLocaleString("ko-KR")} 이상일 때 사용 가능합니다.`,
    };
  }

  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = Math.floor((orderTotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount !== null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    // FIXED
    discount = coupon.discountValue;
  }

  // Discount cannot exceed order total
  discount = Math.min(discount, orderTotal);

  return {
    valid: true,
    discount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscount: coupon.maxDiscount,
    couponId: coupon.id,
  };
}

export async function getOrderById(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payment: true,
    },
  });
  return order;
}
