"use client";

import type React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { changePassword, getMyProfile, updateMyProfile } from "../actions";

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getMyProfile>> | null>(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function load() {
    const result = await getMyProfile();
    setProfile(result);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleProfileUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileMessage("");
    setProfileError("");
    const formData = new FormData(e.currentTarget);
    const result = await updateMyProfile(formData);
    if (result?.error) {
      setProfileError(result.error);
      return;
    }
    setProfileMessage("회원정보를 저장했습니다.");
    await load();
  }

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");
    const formData = new FormData(e.currentTarget);
    const result = await changePassword(formData);
    if (result?.error) {
      setPasswordError(result.error);
      return;
    }
    setPasswordMessage("비밀번호를 변경했습니다.");
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">회원정보 수정</h1>
          <p className="mt-2 text-sm text-gray-500">기본 정보와 비밀번호를 관리하세요.</p>
        </div>
        <Link href="/mypage" className="text-sm font-semibold text-gray-700 hover:underline">마이페이지로</Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">기본 정보</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-3">
            <input name="name" defaultValue={profile?.name ?? ""} placeholder="이름" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
            <input value={profile?.email ?? ""} disabled className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500" />
            <input name="phone" defaultValue={profile?.phone ?? ""} placeholder="전화번호" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
            {profileError && <p className="text-sm text-red-600">{profileError}</p>}
            {profileMessage && <p className="text-sm text-emerald-600">{profileMessage}</p>}
            <button type="submit" className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700">저장하기</button>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">비밀번호 변경</h2>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <input type="password" name="oldPassword" placeholder="현재 비밀번호" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
            <input type="password" name="newPassword" placeholder="새 비밀번호" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900" />
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordMessage && <p className="text-sm text-emerald-600">{passwordMessage}</p>}
            <button type="submit" className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700">비밀번호 변경</button>
          </form>
        </section>
      </div>
    </div>
  );
}
