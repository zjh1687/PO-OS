import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function parseHttpUrl(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

export function getSupabaseConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const parsedUrl = parseHttpUrl(url);

  if (!parsedUrl) {
    return "NEXT_PUBLIC_SUPABASE_URL은 https://xxxx.supabase.co 형식의 Supabase Project URL이어야 합니다.";
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isLocalSupabase = hostname === "localhost" || hostname === "127.0.0.1";
  const isHostedSupabase = hostname.endsWith(".supabase.co");
  if (!isLocalSupabase && !isHostedSupabase) {
    return "NEXT_PUBLIC_SUPABASE_URL에 Vercel 주소가 아니라 Supabase Project URL을 넣어 주세요.";
  }

  if (!anonKey) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY에 Supabase anon public key를 넣어 주세요.";
  }

  return null;
}

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (getSupabaseConfigError()) return null;
  if (!browserClient) {
    browserClient = createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return browserClient;
}
