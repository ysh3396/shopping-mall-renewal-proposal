"use client";

import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerCustomer } from "../login/actions";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") || "");
    const passwordConfirm = String(formData.get("passwordConfirm") || "");

    if (password !== passwordConfirm) {
      setLoading(false);
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    const result = await registerCustomer(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (result?.message) {
      setMessage(result.message);
      router.push("/login?registered=1");
      return;
    }

    router.push("/mypage");
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900">회원가입</h1>
          <p className="mt-2 text-sm text-gray-500">더본투비 회원으로 가입하고 마이페이지를 이용하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" required placeholder="이름" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
          <input type="email" name="email" required placeholder="이메일" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
          <input name="phone" placeholder="전화번호" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
          <input type="password" name="password" required placeholder="비밀번호" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
          <input type="password" name="passwordConfirm" required placeholder="비밀번호 확인" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-gray-900 hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
