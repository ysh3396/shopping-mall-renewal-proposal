"use server";

import { getSupabaseAdmin, STORAGE_BUCKET, getPublicUrl } from "@/lib/supabase";
import { requireAuth } from "@/lib/rbac";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadImage(formData: FormData) {
  await requireAuth();

  const file = formData.get("file") as File | null;
  if (!file) return { error: "파일이 없습니다." };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "지원하지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)" };
  }
  if (file.size > MAX_SIZE) {
    return { error: "파일 크기가 10MB를 초과합니다." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storagePath = `products/${filename}`;

  const supabase = getSupabaseAdmin();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return { error: `업로드 실패: ${error.message}` };
  }

  return { url: getPublicUrl(storagePath) };
}
