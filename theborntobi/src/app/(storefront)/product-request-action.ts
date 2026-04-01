"use server";

import { db } from "@/lib/db";

export type ProductRequestState = {
  success: boolean;
  message: string;
};

export async function submitProductRequest(
  prevState: ProductRequestState,
  formData: FormData
): Promise<ProductRequestState> {
  const productName = (formData.get("productName") as string)?.trim();
  const customerName = (formData.get("customerName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  if (!productName || !customerName || !phone) {
    return { success: false, message: "모든 항목을 입력해 주세요." };
  }

  try {
    // Use or create the guest customer (same pattern as checkout/actions.ts)
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

    await db.productRequest.create({
      data: {
        customerId: guestCustomer.id,
        productName,
        description: `요청자: ${customerName} / 연락처: ${phone}`,
      },
    });

    return { success: true, message: "요청이 접수되었습니다. 빠르게 연락드리겠습니다!" };
  } catch {
    return { success: false, message: "요청 처리 중 오류가 발생했습니다. 다시 시도해 주세요." };
  }
}
