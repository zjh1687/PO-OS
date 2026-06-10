"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, CalendarDays, ClipboardList, Database, LayoutDashboard, LogOut, Map, MessageSquareText, Settings } from "lucide-react";
import { PODataProvider, usePOData } from "@/components/PODataProvider";
import { ToastProvider } from "@/components/Toast";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/decisions", label: "Decision Log", icon: MessageSquareText },
  { href: "/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/gpt", label: "GPT Assistant", icon: Bot },
  { href: "/settings", label: "Backup / Settings", icon: Settings },
];

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <PODataProvider>{children}</PODataProvider>
    </ToastProvider>
  );
}

export function AppShell({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <AppProviders>
      <ShellFrame title={title} eyebrow={eyebrow}>
        {children}
      </ShellFrame>
    </AppProviders>
  );
}

function ShellFrame({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut, envReady } = usePOData();

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#f4f6fb] lg:grid-cols-[288px_minmax(0,1fr)]">
      <aside className="bg-slate-950 p-5 text-white lg:sticky lg:top-0 lg:h-screen lg:p-7">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-lg font-black text-primary">PO</div>
          <div>
            <h1 className="text-lg font-black tracking-tight">PO OS</h1>
            <p className="text-xs text-slate-300">Product Operating System</p>
          </div>
        </div>
        <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1" aria-label="주요 메뉴">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white",
                  active && "bg-slate-800 text-white",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">Today&apos;s rule</p>
          <strong className="mt-2 block text-sm leading-6">업무는 말보다 근거와 결과로 관리합니다.</strong>
        </div>
      </aside>
      <main className="min-w-0 p-5 lg:p-8">
        <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-primary">{eyebrow || "Daily Command Center"}</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-ink">{title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!envReady ? (
              <span className="inline-flex min-h-10 items-center rounded-lg bg-amber-50 px-3 text-sm font-bold text-amber-800">
                Supabase 환경변수 필요
              </span>
            ) : null}
            {user ? <span className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-muted">{user.email}</span> : null}
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-extrabold text-slate-600 transition hover:text-ink"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function MetricCard({ label, value, sub }: { label: string; value: number | string; sub: string }) {
  return (
    <article className="relative overflow-hidden rounded-lg border border-line bg-white p-5 shadow-panel">
      <Database className="absolute -right-4 -top-5 h-24 w-24 text-blue-50" />
      <p className="relative text-sm font-bold text-muted">{label}</p>
      <strong className="relative mt-2 block text-4xl font-black tracking-tight">{value}</strong>
      <span className="relative mt-2 block text-xs font-semibold text-muted">{sub}</span>
    </article>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-muted">{message}</div>;
}
