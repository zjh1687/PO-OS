import { displayDate } from "@/lib/date";
import { sortTasks } from "@/lib/utils";
import type { AppData, Task } from "@/types/po-os";

function listTasks(tasks: Task[]): string {
  if (!tasks.length) return "- 없음";
  return tasks.map((task) => `- ${task.project_name || "프로젝트 없음"} / ${task.title} / ${task.status} / ${task.priority} / ${displayDate(task.due_date)}`).join("\n");
}

export function buildWeeklyReport(data: AppData): string {
  const done = data.tasks.filter((task) => task.status === "done").sort(sortTasks);
  const doing = data.tasks.filter((task) => task.status === "doing").sort(sortTasks);
  const waiting = data.tasks.filter((task) => task.status === "waiting").sort(sortTasks);
  const open = data.tasks.filter((task) => task.status !== "done").sort(sortTasks);

  return `주간 PO 업무 리포트

1. 이번 주 완료
${listTasks(done.slice(0, 8))}

2. 진행 중
${listTasks(doing.slice(0, 8))}

3. 대기 / 블로커
${listTasks(waiting.slice(0, 8))}

4. 지연 / 리스크
${listTasks(open.filter((task) => task.priority === "high").slice(0, 8))}

5. 주요 의사결정
${data.decisions.slice(0, 5).map((item) => `- ${item.project_name}: ${item.topic} - ${item.decision}`).join("\n") || "- 없음"}

6. 다음 액션
${listTasks(open.slice(0, 8))}`;
}

export function buildMonthlyReport(data: AppData): string {
  return `월간 PO 업무 리포트

1. 이번 달 완료 산출물
${listTasks(data.tasks.filter((task) => task.status === "done").slice(0, 12))}

2. 주요 프로젝트 현황
${data.projects.map((project) => `- ${project.name}: ${project.status} / 진행률 ${project.progress}% / 리스크 ${project.risk || "없음"}`).join("\n") || "- 없음"}

3. 지연 / 리스크
${listTasks(data.tasks.filter((task) => task.status !== "done" && task.priority === "high").slice(0, 10))}

4. 의사결정 히스토리
${data.decisions.slice(0, 8).map((item) => `- ${displayDate(item.date)} / ${item.topic}: ${item.decision}`).join("\n") || "- 없음"}

5. 다음 달 우선순위
${listTasks(data.tasks.filter((task) => task.status !== "done").sort(sortTasks).slice(0, 8))}`;
}

export function buildCtoReport(data: AppData): string {
  const open = data.tasks.filter((task) => task.status !== "done");
  const high = open.filter((task) => task.priority === "high");
  const waiting = open.filter((task) => task.status === "waiting");

  return `CTO 보고용 PO 업데이트

1. 핵심 요약
- 열린 업무 ${open.length}건, 높은 우선순위 ${high.length}건, 대기/블로커 ${waiting.length}건입니다.

2. 현재 진행 상황
${listTasks(open.filter((task) => task.status === "doing").slice(0, 8))}

3. 의사결정 필요 항목
${listTasks(waiting.slice(0, 8))}

4. 리스크
${listTasks(high.slice(0, 8))}

5. 요청드릴 사항
- 우선순위 충돌 항목의 결정 기준 확인
- 인증/제품 방향 관련 추가 피드백`;
}
