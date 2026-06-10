import { displayDate } from "@/lib/date";
import { sortTasks } from "@/lib/utils";
import type { AppData } from "@/types/po-os";

function compactContext(data: AppData): string {
  const tasks = data.tasks
    .sort(sortTasks)
    .map((task) => `- [${task.status}/${task.priority}] ${task.project_name}: ${task.title} / 마감 ${displayDate(task.due_date)} / 메모 ${task.memo || "-"}`)
    .join("\n") || "- 없음";
  const projects = data.projects.map((project) => `- ${project.name}: ${project.status}, ${project.progress}%, ${project.goal}`).join("\n") || "- 없음";
  return `[Tasks]\n${tasks}\n\n[Projects]\n${projects}`;
}

function base(data: AppData): string {
  return `당신은 B2B SaaS / AI 제품을 담당하는 시니어 PO 코치입니다.\n아래 PO OS 데이터를 기반으로 분석해 주세요.\n\n${compactContext(data)}`;
}

export function buildTriagePrompt(data: AppData): string {
  return `${base(data)}\n\n업무를 긴급도와 중요도 기준으로 재분류하고, 지금 당장 해야 할 Top 5를 제안해 주세요.`;
}

export function buildRiskPrompt(data: AppData): string {
  return `${base(data)}\n\n프로젝트별 리스크를 기술, 일정, 조직, 고객, 인증 관점으로 분석하고 대응 방안을 제안해 주세요.`;
}

export function buildWeeklyPrompt(data: AppData): string {
  return `${base(data)}\n\nCTO에게 보고 가능한 주간 PO 리포트를 간결하고 명확하게 작성해 주세요.`;
}

export function buildMeetingPrompt(data: AppData): string {
  return `${base(data)}\n\n아래에 붙여 넣을 회의 메모를 PO 관점으로 요약하고, Action Item과 Decision Log 후보를 정리해 주세요.`;
}

export function buildNetCertificationPrompt(data: AppData): string {
  return `${base(data)}\n\nNET 인증 준비 관점에서 Novel Technology 주장, 기존 기술 대비 차별점, 추가 증빙 자료 목록을 제안해 주세요.`;
}
