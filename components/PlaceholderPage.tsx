"use client";

import { AppShell } from "@/components/AppShell";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <AppShell title={title}>
      <section className="rounded-lg border border-line bg-white p-6 shadow-panel">
        <h3 className="text-xl font-black">{title}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{description}</p>
      </section>
    </AppShell>
  );
}
