"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setMessage("Supabase 환경변수를 먼저 설정해 주세요.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);
    setMessage(error ? error.message : "메일함에서 Magic Link를 확인해 주세요.");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6fb] p-5">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-7 shadow-panel">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-lg font-black text-white">PO</div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-primary">Product Operating System</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">PO OS 로그인</h1>
          </div>
        </div>
        <form className="grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            이메일
            <input
              className="focus-ring rounded-lg border border-line px-4 py-3"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
            />
          </label>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-extrabold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            <LogIn size={18} />
            {loading ? "전송 중" : "Magic Link 받기"}
          </button>
        </form>
        {message ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-700">{message}</p> : null}
        {!supabase ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 넣으면 로그인이 활성화됩니다.
          </p>
        ) : null}
      </section>
    </main>
  );
}
