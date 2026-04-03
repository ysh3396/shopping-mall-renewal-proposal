"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { customerSignIn } from "@/lib/customer-auth";
import { loginSchema, registerSchema } from "@/lib/validations/customer";
import {
  processVerification,
  createVerificationToken,
  verifyVerificationToken,
} from "@/lib/inicis-auth";

export async function loginAction(formData: FormData) {
  const raw = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await customerSignIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다" };
  }
}

export async function checkUsernameAction(username: string) {
  if (!username || username.length < 4) return { available: false };
  const existing = await db.customer.findUnique({
    where: { username },
    select: { id: true },
  });
  return { available: !existing };
}

export async function checkEmailAction(email: string) {
  if (!email || !email.includes("@")) return { available: false };
  const existing = await db.customer.findUnique({
    where: { email },
    select: { id: true },
  });
  return { available: !existing };
}

export async function processVerificationAction(
  callbackData: Record<string, string>
) {
  const result = await processVerification(callbackData);

  if (!result.success) {
    return { error: "본인인증에 실패했습니다. 다시 시도해주세요." };
  }

  if (!result.isAdult) {
    return { error: "19세 미만은 가입할 수 없습니다." };
  }

  // Check CI hash deduplication
  const existingCustomer = await db.customer.findFirst({
    where: { ageVerifyCI: result.ciHash },
    select: { id: true },
  });

  if (existingCustomer) {
    return { error: "이미 가입된 본인인증 정보입니다." };
  }

  const token = await createVerificationToken(result);
  return { success: true, token, name: result.name, phone: result.phone };
}

export async function registerAction(formData: FormData) {
  const raw = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    passwordConfirm: formData.get("passwordConfirm") as string,
    email: formData.get("email") as string,
    name: formData.get("name") as string,
    phone: (formData.get("phone") as string) || undefined,
    address1: (formData.get("address1") as string) || undefined,
    address2: (formData.get("address2") as string) || undefined,
    referralCode: (formData.get("referralCode") as string) || undefined,
    verificationToken: formData.get("verificationToken") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify the signed token
  let verified;
  try {
    verified = await verifyVerificationToken(parsed.data.verificationToken);
  } catch {
    return { error: "본인인증이 만료되었습니다. 다시 인증해주세요." };
  }

  if (verified.purpose !== "registration" || !verified.isAdult) {
    return { error: "유효하지 않은 인증 정보입니다." };
  }

  // Check username uniqueness
  const existingUsername = await db.customer.findUnique({
    where: { username: parsed.data.username },
    select: { id: true },
  });
  if (existingUsername) {
    return { error: "이미 사용중인 아이디입니다." };
  }

  // Check email uniqueness
  const existingEmail = await db.customer.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existingEmail) {
    return { error: "이미 사용중인 이메일입니다." };
  }

  // Check CI deduplication
  const existingCI = await db.customer.findFirst({
    where: { ageVerifyCI: verified.ciHash },
    select: { id: true },
  });
  if (existingCI) {
    return { error: "이미 가입된 본인인증 정보입니다." };
  }

  // Get default grade
  const defaultGrade = await db.customerGrade.findFirst({
    where: { name: "일반" },
    select: { id: true },
  });

  // Hash password
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  // Create customer
  try {
    await db.customer.create({
      data: {
        username: parsed.data.username,
        passwordHash,
        email: parsed.data.email,
        name: verified.name,
        phone: verified.phone || parsed.data.phone || null,
        provider: "local",
        providerId: parsed.data.username,
        ageVerified: true,
        ageVerifiedAt: new Date(),
        ageVerifyMethod: "INICIS_SIMPLE",
        ageVerifyCI: verified.ciHash,
        gradeId: defaultGrade?.id || null,
      },
    });
  } catch (e: unknown) {
    const prismaError = e as { code?: string };
    if (prismaError.code === "P2002") {
      return { error: "이미 사용중인 아이디 또는 이메일입니다." };
    }
    throw e;
  }

  // Auto sign-in
  try {
    await customerSignIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch {
    // Registration succeeded but auto-login failed — redirect to login
    return { success: true, loginRequired: true };
  }
}
