import { addDays, toISODate } from "@/lib/date";
import type { TaskPriority, TaskStatus } from "@/types/po-os";

export type SeedProject = {
  name: string;
  goal: string;
  status: "green" | "yellow" | "red";
  due_date: string | null;
  progress: number;
  risk: string;
};

export type SeedTask = {
  title: string;
  project_name: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  source: string;
  memo: string;
};

export function createSeedData(): { projects: SeedProject[]; tasks: SeedTask[] } {
  const today = new Date();
  const d = (offset: number) => toISODate(addDays(today, offset));

  return {
    projects: [
      {
        name: "NET 인증",
        goal: "자사 핵심 기술의 신규성과 사업 적용 가능성을 인증 신청 문서로 정리한다.",
        status: "yellow",
        due_date: d(30),
        progress: 35,
        risk: "Novel Technology 차별성 근거가 더 필요함",
      },
      {
        name: "SQL Agent",
        goal: "DB 접근, 권한, Trace, Admin 흐름을 개발 가능한 요구사항으로 확정한다.",
        status: "green",
        due_date: d(45),
        progress: 48,
        risk: "권한 정책 범위가 넓어지면 일정 리스크가 있음",
      },
      {
        name: "Admin 개선",
        goal: "관리자 권한과 설정 흐름을 더 쉽게 사용할 수 있게 개선한다.",
        status: "green",
        due_date: d(60),
        progress: 18,
        risk: "기존 권한 모델 확인 필요",
      },
      {
        name: "PO 운영체계",
        goal: "업무, 회의, 의사결정, 보고를 하나의 운영 루틴으로 관리한다.",
        status: "green",
        due_date: d(21),
        progress: 55,
        risk: "입력 루틴이 유지되지 않으면 데이터 품질이 낮아질 수 있음",
      },
    ],
    tasks: [
      {
        title: "NET 인증 Novel Technology 차별성 분석",
        project_name: "NET 인증",
        priority: "high",
        status: "doing",
        due_date: d(7),
        source: "CTO 피드백",
        memo: "기술 차별성과 시장 적용 가능성을 문서로 정리",
      },
      {
        title: "NET 인증 특허 / 논문 / 기술자료 근거 수집",
        project_name: "NET 인증",
        priority: "high",
        status: "waiting",
        due_date: d(10),
        source: "인증 준비",
        memo: "레퍼런스와 증빙 자료 목록화",
      },
      {
        title: "SQL Agent 제품 요구사항 PRD 초안 작성",
        project_name: "SQL Agent",
        priority: "high",
        status: "doing",
        due_date: d(5),
        source: "제품 기획",
        memo: "권한, Trace, API, Admin 화면 범위 정의",
      },
      {
        title: "SQL Agent API / 권한 정책 개발 범위 확정",
        project_name: "SQL Agent",
        priority: "medium",
        status: "backlog",
        due_date: d(12),
        source: "개발 협의",
        memo: "개발자 작업 단위로 나누어 Jira Story 등록",
      },
      {
        title: "Admin 권한 화면 사용자 플로우 개선안 정리",
        project_name: "Admin 개선",
        priority: "medium",
        status: "inbox",
        due_date: d(14),
        source: "자체 발견",
        memo: "권한 부여와 이력 확인 흐름을 화면 기준으로 정리",
      },
      {
        title: "CTO 피드백 대응 목록화",
        project_name: "PO 운영체계",
        priority: "high",
        status: "doing",
        due_date: d(2),
        source: "CTO",
        memo: "피드백을 Task / Decision / Risk로 분리",
      },
      {
        title: "주간 PO 리포트 작성",
        project_name: "PO 운영체계",
        priority: "medium",
        status: "backlog",
        due_date: d(3),
        source: "정기 보고",
        memo: "완료, 진행, 지연, 의사결정 필요 항목 중심",
      },
    ],
  };
}
