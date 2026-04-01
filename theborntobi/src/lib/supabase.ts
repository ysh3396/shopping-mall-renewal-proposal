import { createClient } from "@supabase/supabase-js";

// Server-side only Supabase client (service role)
export function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const STORAGE_BUCKET = "images";

export function getPublicUrl(path: string) {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}
