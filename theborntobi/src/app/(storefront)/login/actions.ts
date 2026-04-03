"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 8;

export async function loginCustomer(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요." };
  }

  try {
    await signIn("customer-credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
}

export async function registerCustomer(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!email || !password || !name) {
    return { error: "이름, 이메일, 비밀번호는 필수입니다." };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.` };
  }

  const exists = await db.customer.findUnique({ where: { email } });
  if (exists) {
    return { error: "이미 가입된 이메일입니다." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const normalGrade = await db.customerGrade.findFirst({
    where: { name: { in: ["일반", "Normal", "normal"] } },
  });

  await db.customer.create({
    data: {
      email,
      name,
      phone: phone || null,
      provider: "local",
      passwordHash,
      gradeId: normalGrade?.id,
    },
  });

  return {
    success: true,
    message: "회원가입이 완료되었습니다. 로그인해 주세요.",
    requiresLogin: true,
  };
}
