"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createAddress,
  deleteAddress,
  getMyAddresses,
  setDefaultAddress,
  updateAddress,
} from "../actions";

type Address = Awaited<ReturnType<typeof getMyAddresses>>[number];

type FormState = {
  label: string;
  recipient: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2: string;
  isDefault: boolean;
};

const EMPTY_FORM: FormState = {
  label: "",
  recipient: "",
  phone: "",
  zipCode: "",
  address1: "",
  address2: "",
  isDefault: false,
};

export default function MyAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(EMPTY_FORM);

  async function load() {
    const result = await getMyAddresses();
    setAddresses(result);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setFormState(EMPTY_FORM);
  }

  function fillForm(address: Address) {
    setEditingId(address.id);
    setFormState({
      label: address.label ?? "",
      recipient: address.recipient,
      phone: address.phone,
      zipCode: address.zipCode,
      address1: address.address1,
      address2: address.address2 ?? "",
      isDefault: address.isDefault,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const result = editingId
      ? await updateAddress(editingId, formData)
      : await createAddress(formData);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setMessage(editingId ? "배송지를 수정했습니다." : "배송지를 추가했습니다.");
    resetForm();
    await load();
  }

  async function handleDelete(addressId: string) {
    setError("");
    setMessage("");
    const result = await deleteAddress(addressId);
    if (result?.error) {
      setError(result.error);
      return;
    }
    if (editingId === addressId) resetForm();
    setMessage("배송지를 삭제했습니다.");
    await load();
  }

  async function handleSetDefault(addressId: string) {
    setError("");
    setMessage("");
    const result = await setDefaultAddress(addressId);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setMessage("기본 배송지를 변경했습니다.");
    await load();
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">배송지 관리</h1>
          <p className="mt-2 text-sm text-gray-500">기본 배송지와 자주 쓰는 배송지를 관리하세요.</p>
        </div>
        <Link href="/mypage" className="text-sm font-semibold text-gray-700 hover:underline">마이페이지로</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">내 배송지</h2>
          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500">등록된 배송지가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div key={address.id} className="rounded-xl border border-gray-100 px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{address.recipient}</p>
                        {address.isDefault && <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white">기본</span>}
                        {address.label && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{address.label}</span>}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{[address.zipCode, address.address1, address.address2].filter(Boolean).join(" ")}</p>
                      <p className="mt-1 text-sm text-gray-500">{address.phone}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(address.id)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          기본으로 설정
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => fillForm(address)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(address.id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900">{editingId ? "배송지 수정" : "배송지 추가"}</h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm font-semibold text-gray-500 hover:text-gray-900">
                새로 입력
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input name="label" value={formState.label} onChange={(e) => setFormState((prev) => ({ ...prev, label: e.target.value }))} placeholder="배송지 이름 (예: 집, 사무실)" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
            <input name="recipient" required value={formState.recipient} onChange={(e) => setFormState((prev) => ({ ...prev, recipient: e.target.value }))} placeholder="받는 분" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
            <input name="phone" required value={formState.phone} onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))} placeholder="연락처" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
            <input name="zipCode" required value={formState.zipCode} onChange={(e) => setFormState((prev) => ({ ...prev, zipCode: e.target.value }))} placeholder="우편번호" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
            <input name="address1" required value={formState.address1} onChange={(e) => setFormState((prev) => ({ ...prev, address1: e.target.value }))} placeholder="기본 주소" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
            <input name="address2" value={formState.address2} onChange={(e) => setFormState((prev) => ({ ...prev, address2: e.target.value }))} placeholder="상세 주소" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" name="isDefault" checked={formState.isDefault} onChange={(e) => setFormState((prev) => ({ ...prev, isDefault: e.target.checked }))} /> 기본 배송지로 설정
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-emerald-600">{message}</p>}
            <button type="submit" className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700">{editingId ? "배송지 수정" : "배송지 저장"}</button>
          </form>
        </section>
      </div>
    </div>
  );
}
