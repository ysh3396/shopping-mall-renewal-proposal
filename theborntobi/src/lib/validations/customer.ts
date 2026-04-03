import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(4, "아이디는 4자 이상이어야 합니다"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(4, "아이디는 4자 이상이어야 합니다")
      .max(20, "아이디는 20자 이하여야 합니다")
      .regex(/^[a-zA-Z0-9]+$/, "아이디는 영문과 숫자만 사용 가능합니다"),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다")
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)/,
        "비밀번호는 영문과 숫자를 포함해야 합니다"
      ),
    passwordConfirm: z.string(),
    email: z.string().email("올바른 이메일 형식이 아닙니다"),
    name: z.string().min(1, "이름을 입력해주세요"),
    phone: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    referralCode: z.string().optional(),
    verificationToken: z.string().min(1, "본인인증이 필요합니다"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
