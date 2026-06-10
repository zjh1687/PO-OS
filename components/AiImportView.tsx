"use client";

import { useMemo, useState } from "react";
import { Clipboard, Database, Wand2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { usePOData } from "@/components/PODataProvider";
import { aiImportSchema } from "@/lib/validators";

const exampleJson = `{
  "projects": [
    {
      "name": "SQL Agent",
      "goal": "권한 정책과 API 요구사항을 개발 가능한 범위로 정리한다.",
      "status": "yellow",
      "due_date": "2026-06-30",
      "progress": 20,
      "risk": "권한 범위가 넓어질 수 있음"
    }
  ],
  "tasks": [
    {
      "title": "SQL Agent 권한 정책 정리",
      "project_name": "SQL Agent",
      "priority": "high",
      "status": "doing",
      "due_date": "2026-06-14",
      "source": "AI 정리",
      "memo": "관리자 승인 흐름과 API 접근 범위를 정리한다."
    }
  ],
  "decisions": [
    {
      "date": "2026-06-10",
      "project_name": "SQL Agent",
      "topic": "권한 정책 범위",
      "decision": "초기 MVP에서는 관리자 승인 기반으로 제한한다.",
      "reason": "개발 범위와 보안 리스크를 줄이기 위해",
      "requested_by": "PO",
      "next_action": "정책 초안을 작성한다."
    }
  ],
  "meetings": [
    {
      "date": "2026-06-10",
      "title": "SQL Agent 요구사항 정리",
      "attendees": "PO, CTO",
      "summary": "권한 정책과 API 범위를 MVP 기준으로 좁히기로 했다.",
      "actions": "- PO: 권한 정책 초안 작성 / 2026-06-14"
    }
  ]
}`;

export function AiImportView() {
  return (
    <AppShell title="GPT Assistant" eyebrow="No API Workflow">
      <AiImportContent />
    </AppShell>
  );
}

function AiImportContent() {
  const { projects, tasks, decisions, meetings, importAiJson } = usePOData();
  const [rawJson, setRawJson] = useState(exampleJson);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const prompt = useMemo(
    () => `아래 내용을 PO OS에 저장 가능한 JSON으로 변환해줘.

반드시 JSON만 출력해. 설명, 마크다운 코드블록, 주석은 넣지 마.
허용되는 최상위 키는 projects, tasks, decisions, meetings 뿐이야.
날짜는 YYYY-MM-DD 형식으로 써.
priority는 high, medium, low 중 하나야.
task status는 inbox, backlog, doing, waiting, done 중 하나야.
project status는 green, yellow, red 중 하나야.

[현재 PO OS 요약]
- 프로젝트 ${projects.length}개
- 업무 ${tasks.length}개
- 의사결정 ${decisions.length}개
- 회의록 ${meetings.length}개

[입력할 원문]
여기에 회의 메모, CTO 피드백, 업무 메모를 붙여넣어줘.`,
    [decisions.length, meetings.length, projects.length, tasks.length],
  );

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setMessage("프롬프트를 복사했습니다.");
  }

  async function saveJson() {
    setMessage("");
    setSaving(true);
    try {
      const parsed = JSON.parse(rawJson) as unknown;
      const validated = aiImportSchema.parse(parsed);
      const summary = await importAiJson(validated);
      if (summary) {
        setMessage(
          `저장 완료: 프로젝트 ${summary.projects}개, 업무 ${summary.tasks}개, 의사결정 ${summary.decisions}개, 회의록 ${summary.meetings}개`,
        );
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "JSON을 확인해 주세요.";
      setMessage(`저장 실패: ${detail}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-primary">Prompt Builder</p>
              <h3 className="mt-1 text-xl font-black">AI 도구에 붙여넣을 프롬프트</h3>
            </div>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-soft-primary px-3 text-sm font-extrabold text-primary-dark hover:bg-blue-100"
              type="button"
              onClick={() => void copyPrompt()}
            >
              <Clipboard size={16} />
              복사
            </button>
          </div>
          <textarea className="min-h-[520px] w-full rounded-lg border border-line bg-slate-50 p-4 text-sm leading-6 text-slate-700" readOnly value={prompt} />
        </article>
        <article className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-primary">JSON Import</p>
              <h3 className="mt-1 text-xl font-black">AI 결과를 DB에 저장</h3>
            </div>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-extrabold text-slate-700 hover:text-ink"
              type="button"
              onClick={() => setRawJson(exampleJson)}
            >
              <Wand2 size={16} />
              예시
            </button>
          </div>
          <textarea
            className="min-h-[520px] w-full rounded-lg border border-line p-4 font-mono text-sm leading-6 focus:border-primary focus:outline-none focus:ring-4 focus:ring-blue-100"
            value={rawJson}
            onChange={(event) => setRawJson(event.target.value)}
            spellCheck={false}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-muted">JSON은 저장 전 zod로 검증됩니다.</p>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-extrabold text-white hover:bg-primary-dark disabled:opacity-60"
              type="button"
              disabled={saving}
              onClick={() => void saveJson()}
            >
              <Database size={18} />
              {saving ? "저장 중" : "DB에 저장"}
            </button>
          </div>
          {message ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-700">{message}</p> : null}
        </article>
      </section>
    </>
  );
}
