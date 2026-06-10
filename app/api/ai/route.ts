import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: "AI API integration is reserved for the next phase. Use lib/promptBuilder.ts for copy-ready prompts.",
    },
    { status: 501 },
  );
}
