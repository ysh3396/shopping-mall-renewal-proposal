"use client";

import { useState } from "react";
import { updateSiteConfig } from "./actions";

interface SiteConfig {
  id: string;
  siteName: string;
  domain: string | null;
  businessName: string | null;
  businessNumber: string | null;
  ceoName: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  bankName: string | null;
  bankAccount: string | null;
  bankHolder: string | null;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  returnShippingFee: number;
  restrictionMode: string;
}

interface Props {
  config: SiteConfig | null;
}

export function SettingsClient({ config }: Props) {
  const [form, setForm] = useState({
    siteName: config?.siteName ?? "",
    domain: config?.domain ?? "",
    businessName: config?.businessName ?? "",
    businessNumber: config?.businessNumber ?? "",
    ceoName: config?.ceoName ?? "",
    address: config?.address ?? "",
    phone: config?.phone ?? "",
    email: config?.email ?? "",
    bankName: config?.bankName ?? "",
    bankAccount: config?.bankAccount ?? "",
    bankHolder: config?.bankHolder ?? "",
    freeShippingThreshold: String(config?.freeShippingThreshold ?? 50000),
    defaultShippingFee: String(config?.defaultShippingFee ?? 2500),
    returnShippingFee: String(config?.returnShippingFee ?? 3000),
    restrictionMode: config?.restrictionMode ?? "NONE",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await updateSiteConfig({
        siteName: form.siteName,
        domain: form.domain || null,
        businessName: form.businessName || null,
        businessNumber: form.businessNumber || null,
        ceoName: form.ceoName || null,
        address: form.address || null,
        phone: form.phone || null,
        email: form.email || null,
        bankName: form.bankName || null,
        bankAccount: form.bankAccount || null,
        bankHolder: form.bankHolder || null,
        freeShippingThreshold: Number(form.freeShippingThreshold) || 50000,
        defaultShippingFee: Number(form.defaultShippingFee) || 2500,
        returnShippingFee: Number(form.returnShippingFee) || 3000,
        restrictionMode: form.restrictionMode,
      });
      setMessage("저장되었습니다.");
    } catch {
      setMessage("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">기본 정보</h3>
        {(
          [
            ["사이트 이름", "siteName"],
            ["도메인", "domain"],
            ["상호명", "businessName"],
            ["사업자등록번호", "businessNumber"],
            ["대표자명", "ceoName"],
            ["주소", "address"],
            ["전화번호", "phone"],
            ["이메일", "email"],
          ] as const
        ).map(([label, key]) => (
          <div className="space-y-1.5" key={key}>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition"
            />
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">계좌 정보</h3>
        {(
          [
            ["은행명", "bankName"],
            ["계좌번호", "bankAccount"],
            ["예금주", "bankHolder"],
          ] as const
        ).map(([label, key]) => (
          <div className="space-y-1.5" key={key}>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition"
            />
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">배송 설정</h3>
        {(
          [
            ["무료배송 기준금액 (원)", "freeShippingThreshold"],
            ["기본 배송비 (원)", "defaultShippingFee"],
            ["반품 배송비 (원)", "returnShippingFee"],
          ] as const
        ).map(([label, key]) => (
          <div className="space-y-1.5" key={key}>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
              type="number"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {message && (
          <span className="text-sm text-green-600">{message}</span>
        )}
      </div>
    </div>
  );
}
