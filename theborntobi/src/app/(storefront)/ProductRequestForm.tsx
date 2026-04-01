"use client";

import { useActionState } from "react";
import { submitProductRequest, type ProductRequestState } from "./product-request-action";

const initialState: ProductRequestState = { success: false, message: "" };

export default function ProductRequestForm() {
  const [state, formAction, pending] = useActionState(submitProductRequest, initialState);

  if (state.success) {
    return (
      <p className="text-sm font-semibold text-green-400 py-2">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col sm:flex-row gap-2 flex-1 w-full">
      <input
        type="text"
        name="productName"
        placeholder="상품명"
        required
        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-gray-500 transition"
      />
      <input
        type="text"
        name="customerName"
        placeholder="이름"
        required
        className="w-full sm:w-32 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-gray-500 transition"
      />
      <input
        type="tel"
        name="phone"
        placeholder="연락처 (010-0000-0000)"
        required
        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-gray-500 transition"
      />
      <div className="flex flex-col gap-1">
        <button
          type="submit"
          disabled={pending}
          className="bg-white text-gray-900 font-bold px-6 py-2 rounded text-sm hover:bg-gray-100 transition-colors whitespace-nowrap disabled:opacity-60"
        >
          {pending ? "처리중..." : "요청하기"}
        </button>
        {state.message && (
          <p className="text-xs text-red-400">{state.message}</p>
        )}
      </div>
    </form>
  );
}
