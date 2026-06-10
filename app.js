const STORAGE_KEY = "po-os-state-v1";

const statusConfig = [
  { id: "inbox", label: "Inbox", hint: "새로 들어온 업무" },
  { id: "backlog", label: "Backlog", hint: "정리된 대기 업무" },
  { id: "doing", label: "Doing", hint: "진행 중" },
  { id: "waiting", label: "Waiting", hint: "외부 응답 / 의사결정 대기" },
  { id: "done", label: "Done", hint: "완료" },
];

const priorityLabel = {
  high: "상",
  medium: "중",
  low: "하",
};

const priorityWeight = {
  high: 3,
  medium: 2,
  low: 1,
};

let state = loadState() || createSeedState();
let currentReportType = "weekly";
let currentPromptType = "triage";
let draggedTaskId = null;

saveState();
boot();

function boot() {
  bindNavigation();
  bindQuickTaskForm();
  bindFilters();
  bindProjectDialog();
  bindDecisionForm();
  bindMeetingForm();
  bindReportControls();
  bindPromptControls();
  bindBackupControls();
  renderAll();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("저장 데이터를 읽을 수 없습니다.", error);
    return null;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createSeedState() {
  const today = new Date();
  const d = (offset) => toISODate(addDays(today, offset));
  const now = new Date().toISOString();

  return {
    version: 1,
    owner: "승철",
    tasks: [
      {
        id: uid(),
        title: "NET 인증 Novel Technology 차별성 분석",
        project: "NET 인증",
        priority: "high",
        status: "doing",
        dueDate: d(7),
        source: "CTO 피드백",
        memo: "기술 차별성, 신규성, 시장 적용 가능성을 한 문서로 정리",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uid(),
        title: "NET 인증 특허 / 논문 / 기술자료 근거 수집",
        project: "NET 인증",
        priority: "high",
        status: "waiting",
        dueDate: d(10),
        source: "인증 준비",
        memo: "기술성 설명에 쓸 근거자료와 레퍼런스 확보 필요",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uid(),
        title: "SQL Agent 제품 요구사항 PRD 초안 작성",
        project: "SQL Agent",
        priority: "high",
        status: "doing",
        dueDate: d(5),
        source: "제품 기획",
        memo: "권한, Trace, API, Admin 화면 범위를 명확히 정의",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uid(),
        title: "SQL Agent API / 권한 정책 개발 범위 확정",
        project: "SQL Agent",
        priority: "medium",
        status: "backlog",
        dueDate: d(12),
        source: "개발 협의",
        memo: "개발자와 작업 단위 분리 후 Jira Story로 등록",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uid(),
        title: "Admin 권한 화면 사용자 플로우 개선안 정리",
        project: "Admin 개선",
        priority: "medium",
        status: "inbox",
        dueDate: d(14),
        source: "자체 발견",
        memo: "권한 부여, 회수, 이력 확인 흐름을 화면 기준으로 정리",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uid(),
        title: "CTO 피드백 대응 목록화",
        project: "PO 운영체계",
        priority: "high",
        status: "doing",
        dueDate: d(2),
        source: "CTO",
        memo: "피드백을 Task / Decision / Risk로 분리",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uid(),
        title: "주간 PO 리포트 작성",
        project: "PO 운영체계",
        priority: "medium",
        status: "backlog",
        dueDate: d(3),
        source: "정기 보고",
        memo: "완료, 진행, 지연, 의사결정 필요 항목 중심",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uid(),
        title: "지난주 회의 액션아이템 정리",
        project: "PO 운영체계",
        priority: "low",
        status: "done",
        dueDate: d(-2),
        source: "회의록",
        memo: "담당자와 마감일 기준으로 정리 완료",
        createdAt: now,
        updatedAt: now,
        completedAt: now,
      },
    ],
    projects: [
      {
        id: uid(),
        name: "NET 인증",
        goal: "자사 핵심 기술의 신규성, 독창성, 사업화 가능성을 증명해 인증 신청 기반을 확보한다.",
        status: "yellow",
        dueDate: d(30),
        progress: 35,
        risk: "Novel Technology 정의와 기존 기술 대비 차별성 근거가 더 필요함",
      },
      {
        id: uid(),
        name: "SQL Agent",
        goal: "DB 접근, 권한, Trace, Admin 흐름을 제품 요구사항으로 확정하고 개발 가능한 단위로 분리한다.",
        status: "green",
        dueDate: d(45),
        progress: 48,
        risk: "권한 정책 범위가 넓어질 경우 Sprint 일정이 밀릴 수 있음",
      },
      {
        id: uid(),
        name: "Admin 개선",
        goal: "관리자 사용성이 낮은 권한/설정 흐름을 개선한다.",
        status: "green",
        dueDate: d(60),
        progress: 18,
        risk: "기존 사용자 권한 모델 확인 필요",
      },
      {
        id: uid(),
        name: "PO 운영체계",
        goal: "업무, 회의, 의사결정, 보고를 하나의 루틴으로 관리한다.",
        status: "green",
        dueDate: d(21),
        progress: 55,
        risk: "업무 입력 루틴이 유지되지 않으면 데이터 품질이 낮아질 수 있음",
      },
    ],
    decisions: [
      {
        id: uid(),
        date: d(-1),
        project: "NET 인증",
        topic: "NET 인증 스토리라인 방향",
        decision: "기술 설명은 기능 나열보다 Novel Technology와 차별성 중심으로 구성한다.",
        reason: "인증 심사에서 신규성, 기술성, 적용 가능성의 설득력이 중요하기 때문",
        requestedBy: "CTO 피드백",
        nextAction: "기존 기술 대비 차별점 표 작성",
      },
      {
        id: uid(),
        date: d(-3),
        project: "SQL Agent",
        topic: "PRD 작성 단위",
        decision: "권한 정책, API, Trace UI를 분리해 각각 Story로 관리한다.",
        reason: "개발 일정 산정과 리뷰 범위를 명확히 하기 위해서",
        requestedBy: "PO 판단",
        nextAction: "Jira Epic / Story 구조 초안 작성",
      },
    ],
    meetings: [
      {
        id: uid(),
        date: d(-1),
        title: "CTO 피드백 싱크",
        attendees: "CTO, PO",
        summary: "NET 인증의 기술 차별성을 더 선명하게 보여줘야 한다는 피드백을 받음. SQL Agent는 개발 범위를 작게 나누어 일정 리스크를 낮추기로 함.",
        actions: "- NET 인증 차별성 표 작성 / 승철 / 이번 주\n- SQL Agent PRD 초안 작성 / 승철 / 다음 회의 전",
      },
    ],
  };
}

function bindNavigation() {
  const buttons = document.querySelectorAll(".nav-item");
  const title = document.getElementById("sectionTitle");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      document.querySelectorAll(".content-section").forEach((section) => section.classList.remove("active"));
      document.getElementById(button.dataset.section).classList.add("active");
      title.textContent = button.textContent;
      if (button.dataset.section === "settings") renderDataPreview();
      if (button.dataset.section === "reports") renderReport();
      if (button.dataset.section === "gpt") renderPrompt();
    });
  });

  document.getElementById("openQuickAdd").addEventListener("click", () => {
    document.getElementById("quickCapture").classList.toggle("open");
    document.getElementById("taskTitle").focus();
  });

  document.getElementById("seedBtn").addEventListener("click", () => {
    if (!confirm("현재 데이터를 샘플 데이터로 초기화할까요? 기존 데이터는 사라집니다.")) return;
    state = createSeedState();
    saveState();
    renderAll();
    toast("샘플 데이터로 초기화했습니다.");
  });
}

function bindQuickTaskForm() {
  const form = document.getElementById("quickTaskForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const now = new Date().toISOString();
    state.tasks.unshift({
      id: uid(),
      title: data.title.trim(),
      project: data.project.trim(),
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      source: data.source.trim() || "직접 입력",
      memo: data.memo.trim(),
      createdAt: now,
      updatedAt: now,
      completedAt: data.status === "done" ? now : null,
    });
    ensureProject(data.project.trim());
    saveState();
    form.reset();
    document.getElementById("taskPriority").value = "medium";
    document.getElementById("taskStatus").value = "doing";
    renderAll();
    toast("업무를 추가했습니다.");
  });
}

function bindFilters() {
  ["taskSearch", "taskProjectFilter", "taskPriorityFilter"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderKanban);
  });
}

function bindProjectDialog() {
  const dialog = document.getElementById("projectDialog");
  const form = document.getElementById("projectForm");
  document.getElementById("addProjectBtn").addEventListener("click", () => dialog.showModal());
  document.getElementById("cancelProjectDialog").addEventListener("click", () => dialog.close());

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    state.projects.unshift({
      id: uid(),
      name: data.name.trim(),
      goal: data.goal.trim(),
      status: data.status,
      dueDate: data.dueDate,
      progress: Number(data.progress || 0),
      risk: data.risk.trim(),
    });
    saveState();
    form.reset();
    dialog.close();
    renderAll();
    toast("프로젝트를 추가했습니다.");
  });
}

function bindDecisionForm() {
  const form = document.getElementById("decisionForm");
  form.date.value = toISODate(new Date());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    state.decisions.unshift({
      id: uid(),
      date: data.date,
      project: data.project.trim(),
      topic: data.topic.trim(),
      decision: data.decision.trim(),
      reason: data.reason.trim(),
      requestedBy: data.requestedBy.trim(),
      nextAction: data.nextAction.trim(),
    });
    ensureProject(data.project.trim());
    saveState();
    form.reset();
    form.date.value = toISODate(new Date());
    renderAll();
    toast("의사결정을 저장했습니다.");
  });
}

function bindMeetingForm() {
  const form = document.getElementById("meetingForm");
  form.date.value = toISODate(new Date());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    state.meetings.unshift({
      id: uid(),
      date: data.date,
      title: data.title.trim(),
      attendees: data.attendees.trim(),
      summary: data.summary.trim(),
      actions: data.actions.trim(),
    });
    saveState();
    form.reset();
    form.date.value = toISODate(new Date());
    renderAll();
    toast("회의록을 저장했습니다.");
  });
}

function bindReportControls() {
  document.querySelectorAll("[data-report]").forEach((button) => {
    button.addEventListener("click", () => {
      currentReportType = button.dataset.report;
      document.querySelectorAll("[data-report]").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      renderReport();
    });
  });

  document.getElementById("refreshReport").addEventListener("click", renderReport);
  document.getElementById("copyReport").addEventListener("click", () => copyText(document.getElementById("reportOutput").value));
}

function bindPromptControls() {
  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      currentPromptType = button.dataset.prompt;
      renderPrompt();
    });
  });
  document.getElementById("copyPrompt").addEventListener("click", () => copyText(document.getElementById("promptOutput").value));
}

function bindBackupControls() {
  document.getElementById("exportData").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `po-os-backup-${toISODate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    toast("백업 파일을 내보냈습니다.");
  });

  document.getElementById("importData").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      validateImportedState(imported);
      state = imported;
      saveState();
      renderAll();
      toast("백업 데이터를 가져왔습니다.");
    } catch (error) {
      alert("JSON 파일을 가져올 수 없습니다. PO OS 백업 파일인지 확인해주세요.");
      console.error(error);
    }
  });

  document.getElementById("clearData").addEventListener("click", () => {
    if (!confirm("정말 전체 데이터를 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;
    state = { version: 1, owner: "승철", tasks: [], projects: [], decisions: [], meetings: [] };
    saveState();
    renderAll();
    toast("전체 데이터를 삭제했습니다.");
  });
}

function renderAll() {
  renderProjectOptions();
  renderDashboard();
  renderKanban();
  renderRoadmap();
  renderDecisions();
  renderMeetings();
  renderReport();
  renderPrompt();
  renderDataPreview();
}

function renderProjectOptions() {
  const names = getProjectNames();
  const dataList = document.getElementById("projectList");
  dataList.innerHTML = names.map((name) => `<option value="${escapeHtml(name)}"></option>`).join("");

  const filter = document.getElementById("taskProjectFilter");
  const current = filter.value;
  filter.innerHTML = `<option value="all">전체 프로젝트</option>` + names.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
  filter.value = names.includes(current) ? current : "all";
}

function renderDashboard() {
  const openTasks = state.tasks.filter((task) => task.status !== "done");
  const doneTasks = state.tasks.filter((task) => task.status === "done");
  const overdueTasks = openTasks.filter(isOverdue);
  const dueSoonTasks = openTasks.filter((task) => isDueWithin(task, 7));
  const waitingTasks = state.tasks.filter((task) => task.status === "waiting");
  const highTasks = openTasks.filter((task) => task.priority === "high");

  const doneThisMonth = doneTasks.filter((task) => inCurrentMonth(task.completedAt || task.updatedAt || task.createdAt));
  const completionRate = state.tasks.length ? Math.round((doneTasks.length / state.tasks.length) * 100) : 0;

  const cards = [
    { label: "진행 필요 업무", value: openTasks.length, sub: `상 우선순위 ${highTasks.length}건` },
    { label: "마감 임박", value: dueSoonTasks.length, sub: "7일 이내 마감" },
    { label: "대기 / 블로커", value: waitingTasks.length, sub: "응답 또는 결정 필요" },
    { label: "이번 달 완료", value: doneThisMonth.length, sub: `전체 완료율 ${completionRate}%` },
  ];

  document.getElementById("metricCards").innerHTML = cards.map((card) => `
    <article class="metric-card">
      <p>${escapeHtml(card.label)}</p>
      <strong>${card.value}</strong>
      <span>${escapeHtml(card.sub)}</span>
    </article>
  `).join("");

  const focus = [...overdueTasks, ...dueSoonTasks, ...highTasks]
    .filter(uniqueById)
    .sort(taskSort)
    .slice(0, 7);

  document.getElementById("focusList").innerHTML = focus.length ? focus.map((task) => `
    <article class="list-item">
      <h4>${escapeHtml(task.title)}</h4>
      <p>${escapeHtml(task.project)} · ${statusLabel(task.status)} · 마감 ${displayDate(task.dueDate)}</p>
      <div class="meta-row">
        <span class="badge ${task.priority}">우선순위 ${priorityLabel[task.priority]}</span>
        ${isOverdue(task) ? `<span class="badge high">지연</span>` : ""}
        ${task.source ? `<span class="badge status">${escapeHtml(task.source)}</span>` : ""}
      </div>
    </article>
  `).join("") : emptyState("오늘 집중할 업무가 없습니다.");

  document.getElementById("projectHealth").innerHTML = state.projects.length ? state.projects.map((project) => {
    const related = state.tasks.filter((task) => task.project === project.name);
    const open = related.filter((task) => task.status !== "done").length;
    return `
      <article class="project-item">
        <h4>${escapeHtml(project.name)} <span class="badge ${project.status}">${projectStatusLabel(project.status)}</span></h4>
        <p>${escapeHtml(project.goal)}</p>
        <div class="progress-track"><div class="progress-bar" style="width:${clamp(project.progress, 0, 100)}%"></div></div>
        <div class="meta-row">
          <span class="badge status">진척 ${project.progress}%</span>
          <span class="badge status">열린 업무 ${open}건</span>
          <span class="badge status">마감 ${displayDate(project.dueDate)}</span>
        </div>
      </article>
    `;
  }).join("") : emptyState("프로젝트가 없습니다.");

  document.getElementById("recentDecisions").innerHTML = state.decisions.slice(0, 5).map((decision) => `
    <article class="list-item">
      <h4>${escapeHtml(decision.topic)}</h4>
      <p>${escapeHtml(decision.decision)}</p>
      <div class="meta-row">
        <span class="badge status">${displayDate(decision.date)}</span>
        <span class="badge status">${escapeHtml(decision.project)}</span>
      </div>
    </article>
  `).join("") || emptyState("아직 의사결정 기록이 없습니다.");

  drawKpiChart();
}

function renderKanban() {
  const search = document.getElementById("taskSearch").value.trim().toLowerCase();
  const projectFilter = document.getElementById("taskProjectFilter").value;
  const priorityFilter = document.getElementById("taskPriorityFilter").value;

  let tasks = state.tasks.filter((task) => {
    const haystack = `${task.title} ${task.project} ${task.memo} ${task.source}`.toLowerCase();
    const searchOk = !search || haystack.includes(search);
    const projectOk = projectFilter === "all" || task.project === projectFilter;
    const priorityOk = priorityFilter === "all" || task.priority === priorityFilter;
    return searchOk && projectOk && priorityOk;
  });

  const board = document.getElementById("kanbanBoard");
  board.innerHTML = statusConfig.map((status) => {
    const columnTasks = tasks.filter((task) => task.status === status.id).sort(taskSort);
    return `
      <section class="kanban-column" data-status="${status.id}">
        <div class="kanban-column-header">
          <div>
            <h3>${status.label}</h3>
            <p class="muted">${status.hint}</p>
          </div>
          <span>${columnTasks.length}</span>
        </div>
        <div class="kanban-list">
          ${columnTasks.map(renderTaskCard).join("") || emptyState("업무 없음")}
        </div>
      </section>
    `;
  }).join("");

  board.querySelectorAll(".task-card").forEach((card) => {
    card.addEventListener("dragstart", () => {
      draggedTaskId = card.dataset.id;
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => {
      draggedTaskId = null;
      card.classList.remove("dragging");
      document.querySelectorAll(".kanban-column").forEach((column) => column.classList.remove("drag-over"));
    });
  });

  board.querySelectorAll(".kanban-column").forEach((column) => {
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      column.classList.add("drag-over");
    });
    column.addEventListener("dragleave", () => column.classList.remove("drag-over"));
    column.addEventListener("drop", () => {
      if (!draggedTaskId) return;
      moveTask(draggedTaskId, column.dataset.status);
      column.classList.remove("drag-over");
    });
  });

  board.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", () => moveTask(button.closest(".task-card").dataset.id, button.dataset.move));
  });

  board.querySelectorAll(".delete-task").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".task-card");
      const task = state.tasks.find((item) => item.id === card.dataset.id);
      if (!confirm(`업무를 삭제할까요?\n\n${task.title}`)) return;
      state.tasks = state.tasks.filter((item) => item.id !== card.dataset.id);
      saveState();
      renderAll();
      toast("업무를 삭제했습니다.");
    });
  });
}

function renderTaskCard(task) {
  const due = task.dueDate ? `마감 ${displayDate(task.dueDate)}` : "마감 없음";
  return `
    <article class="task-card" draggable="true" data-id="${task.id}">
      <div class="task-topline">
        <span class="badge priority ${task.priority}">우선순위 ${priorityLabel[task.priority]}</span>
        <button class="icon-btn delete-task" title="삭제">×</button>
      </div>
      <h4>${escapeHtml(task.title)}</h4>
      <p class="task-meta">${escapeHtml(task.project)} · ${due} · ${escapeHtml(task.source || "직접 입력")}</p>
      ${task.memo ? `<p class="task-memo">${escapeHtml(task.memo)}</p>` : ""}
      <div class="task-actions">
        <button data-move="backlog">Backlog</button>
        <button data-move="doing">Doing</button>
        <button data-move="waiting">Waiting</button>
        <button data-move="done">Done</button>
      </div>
    </article>
  `;
}

function renderRoadmap() {
  document.getElementById("roadmapList").innerHTML = state.projects.length ? state.projects.map((project) => {
    const tasks = state.tasks.filter((task) => task.project === project.name);
    const done = tasks.filter((task) => task.status === "done").length;
    const open = tasks.length - done;
    const high = tasks.filter((task) => task.status !== "done" && task.priority === "high").length;
    return `
      <article class="roadmap-item">
        <h4>${escapeHtml(project.name)} <span class="badge ${project.status}">${projectStatusLabel(project.status)}</span></h4>
        <p>${escapeHtml(project.goal)}</p>
        <div class="progress-track"><div class="progress-bar" style="width:${clamp(project.progress, 0, 100)}%"></div></div>
        <div class="meta-row">
          <span class="badge status">진척 ${project.progress}%</span>
          <span class="badge status">마감 ${displayDate(project.dueDate)}</span>
          <span class="badge status">완료 ${done}건</span>
          <span class="badge status">진행 ${open}건</span>
          ${high ? `<span class="badge high">상 우선순위 ${high}건</span>` : ""}
        </div>
        ${project.risk ? `<p style="margin-top:12px;"><strong>리스크:</strong> ${escapeHtml(project.risk)}</p>` : ""}
      </article>
    `;
  }).join("") : emptyState("프로젝트가 없습니다. 프로젝트 추가 버튼으로 첫 로드맵을 만들어주세요.");
}

function renderDecisions() {
  const sorted = [...state.decisions].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  document.getElementById("decisionList").innerHTML = sorted.map((decision) => `
    <article class="timeline-item">
      <h4>${escapeHtml(decision.topic)}</h4>
      <p><strong>결정:</strong> ${escapeHtml(decision.decision)}</p>
      <p><strong>이유:</strong> ${escapeHtml(decision.reason)}</p>
      ${decision.nextAction ? `<p><strong>다음 액션:</strong> ${escapeHtml(decision.nextAction)}</p>` : ""}
      <div class="meta-row">
        <span class="badge status">${displayDate(decision.date)}</span>
        <span class="badge status">${escapeHtml(decision.project)}</span>
        ${decision.requestedBy ? `<span class="badge status">${escapeHtml(decision.requestedBy)}</span>` : ""}
      </div>
    </article>
  `).join("") || emptyState("아직 기록된 의사결정이 없습니다.");
}

function renderMeetings() {
  const sorted = [...state.meetings].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  document.getElementById("meetingList").innerHTML = sorted.map((meeting) => `
    <article class="timeline-item">
      <h4>${escapeHtml(meeting.title)}</h4>
      <p>${escapeHtml(meeting.summary)}</p>
      ${meeting.actions ? `<p style="margin-top:10px;"><strong>Action Items</strong><br>${escapeHtml(meeting.actions).replace(/\n/g, "<br>")}</p>` : ""}
      <div class="meta-row">
        <span class="badge status">${displayDate(meeting.date)}</span>
        ${meeting.attendees ? `<span class="badge status">${escapeHtml(meeting.attendees)}</span>` : ""}
      </div>
    </article>
  `).join("") || emptyState("아직 회의록이 없습니다.");
}

function renderReport() {
  const output = document.getElementById("reportOutput");
  if (!output) return;
  output.value = buildReport(currentReportType);
}

function buildReport(type) {
  const today = toISODate(new Date());
  const open = state.tasks.filter((task) => task.status !== "done").sort(taskSort);
  const done = state.tasks.filter((task) => task.status === "done").sort((a, b) => (b.completedAt || b.updatedAt || "").localeCompare(a.completedAt || a.updatedAt || ""));
  const doing = state.tasks.filter((task) => task.status === "doing").sort(taskSort);
  const waiting = state.tasks.filter((task) => task.status === "waiting").sort(taskSort);
  const overdue = open.filter(isOverdue).sort(taskSort);
  const high = open.filter((task) => task.priority === "high").sort(taskSort);
  const recentDecisions = state.decisions.slice(0, 5);
  const projectSummary = state.projects.map((project) => `- ${project.name}: ${projectStatusLabel(project.status)} / 진척 ${project.progress}% / 리스크: ${project.risk || "없음"}`).join("\n") || "- 등록된 프로젝트 없음";

  if (type === "monthly") {
    const monthDone = done.filter((task) => inCurrentMonth(task.completedAt || task.updatedAt || task.createdAt));
    return `[월간 PO 업무 리포트] ${today}\n\n1. 이번 달 완료한 산출물\n${listTasks(monthDone)}\n\n2. 프로젝트 현황\n${projectSummary}\n\n3. 주요 의사결정\n${listDecisions(recentDecisions)}\n\n4. 현재 리스크 / 블로커\n${listTasks([...waiting, ...overdue].filter(uniqueById))}\n\n5. 다음 달 집중 과제\n${listTasks(high.slice(0, 7))}\n`;
  }

  if (type === "cto") {
    return `[CTO 보고용 PO 업데이트] ${today}\n\n1. 핵심 요약\n- 현재 열린 업무 ${open.length}건, 상 우선순위 ${high.length}건, 대기/블로커 ${waiting.length}건입니다.\n\n2. 주요 진행 사항\n${listTasks(doing.slice(0, 8))}\n\n3. 의사결정이 필요한 항목\n${listTasks(waiting.slice(0, 8))}\n\n4. 주요 리스크\n${listTasks(overdue.concat(high).filter(uniqueById).slice(0, 8))}\n\n5. 최근 의사결정\n${listDecisions(recentDecisions)}\n\n6. 요청드릴 사항\n- 우선순위 충돌 항목이 있을 경우 결정 필요\n- 인증/제품 방향성 관련 추가 피드백 필요\n`;
  }

  return `[주간 PO 업무 리포트] ${today}\n\n1. 이번 주 완료\n${listTasks(done.slice(0, 8))}\n\n2. 진행 중\n${listTasks(doing.slice(0, 8))}\n\n3. 대기 / 블로커\n${listTasks(waiting.slice(0, 8))}\n\n4. 지연 / 리스크\n${listTasks(overdue.slice(0, 8))}\n\n5. 주요 의사결정\n${listDecisions(recentDecisions)}\n\n6. 다음 액션\n${listTasks(open.slice(0, 8))}\n`;
}

function renderPrompt() {
  const output = document.getElementById("promptOutput");
  if (!output) return;
  output.value = buildPrompt(currentPromptType);
}

function buildPrompt(type) {
  const context = buildCompactContext();
  const base = `당신은 B2B SaaS / AI 제품을 담당하는 시니어 PO 코치입니다.\n아래 PO OS 데이터를 기준으로 분석해주세요.\n\n[현재 데이터]\n${context}\n`;

  const prompts = {
    triage: `${base}\n[요청]\n1. 업무를 긴급도/중요도 기준으로 재분류해주세요.\n2. 지금 당장 해야 할 Top 5를 뽑아주세요.\n3. 각 업무에 대해 산출물 정의, 다음 액션, 예상 리스크를 표로 정리해주세요.\n4. Jira Story로 전환할 수 있는 업무는 제목과 Acceptance Criteria까지 작성해주세요.`,
    risk: `${base}\n[요청]\n1. 현재 프로젝트별 리스크를 기술/일정/조직/고객/인증 관점으로 분석해주세요.\n2. 리스크별 가능성, 영향도, 대응 방안을 표로 정리해주세요.\n3. CTO에게 즉시 공유해야 할 항목과 PO가 자체 해결할 항목을 구분해주세요.`,
    weekly: `${base}\n[요청]\n1. CTO에게 보고할 수 있는 주간 PO 리포트를 작성해주세요.\n2. 완료/진행/대기/리스크/의사결정 필요 항목으로 나눠주세요.\n3. 문장은 짧고 명확하게 작성해주세요.\n4. 마지막에 다음 주 우선순위 5개를 제안해주세요.`,
    meeting: `${base}\n[요청]\n내가 아래에 붙여넣을 회의 메모를 PO 관점으로 정리해주세요.\n\n[회의 메모]\n여기에 회의 내용을 붙여넣겠습니다.\n\n[출력 형식]\n1. 핵심 요약\n2. 결정 사항\n3. Action Item: 담당자 / 할 일 / 마감일\n4. Jira Task 후보\n5. Decision Log 후보\n6. 리스크`,
    net: `${base}\n[요청]\nNET 인증 준비 관점에서 현재 데이터를 분석해주세요.\n1. Novel Technology 주장 포인트를 정리해주세요.\n2. 기존 기술 대비 차별성 표를 작성해주세요.\n3. 심사자가 물어볼 만한 질문과 답변 초안을 작성해주세요.\n4. 추가로 준비해야 할 증빙자료 목록을 제안해주세요.\n5. 기술 설명서 목차를 작성해주세요.`,
  };

  return prompts[type] || prompts.triage;
}

function buildCompactContext() {
  const tasks = state.tasks.sort(taskSort).map((task) => `- [${statusLabel(task.status)} / ${priorityLabel[task.priority]}] ${task.project}: ${task.title} / 마감 ${displayDate(task.dueDate)} / 출처 ${task.source || "-"} / 메모 ${task.memo || "-"}`).join("\n") || "- 없음";
  const projects = state.projects.map((project) => `- ${project.name}: ${projectStatusLabel(project.status)}, 진척 ${project.progress}%, 목표 ${project.goal}, 리스크 ${project.risk || "없음"}`).join("\n") || "- 없음";
  const decisions = state.decisions.slice(0, 8).map((decision) => `- ${decision.date} / ${decision.project} / ${decision.topic}: ${decision.decision} / 이유 ${decision.reason}`).join("\n") || "- 없음";
  const meetings = state.meetings.slice(0, 5).map((meeting) => `- ${meeting.date} / ${meeting.title}: ${meeting.summary} / 액션 ${meeting.actions || "없음"}`).join("\n") || "- 없음";

  return `[Tasks]\n${tasks}\n\n[Projects]\n${projects}\n\n[Decision Log]\n${decisions}\n\n[Meetings]\n${meetings}`;
}

function renderDataPreview() {
  const preview = document.getElementById("dataPreview");
  if (preview) preview.value = JSON.stringify(state, null, 2);
}

function drawKpiChart() {
  const canvas = document.getElementById("kpiChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.width;
  const height = 260;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.height = `${height}px`;
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, width, height);

  const data = statusConfig.map((status) => ({
    label: status.label,
    count: state.tasks.filter((task) => task.status === status.id).length,
  }));
  const max = Math.max(1, ...data.map((item) => item.count));
  const padding = 36;
  const barGap = 16;
  const barWidth = Math.max(32, (width - padding * 2 - barGap * (data.length - 1)) / data.length);
  const chartHeight = height - 78;

  ctx.font = "12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillStyle = "#667085";
  ctx.fillText("상태별 업무 개수", padding, 18);

  data.forEach((item, index) => {
    const x = padding + index * (barWidth + barGap);
    const barHeight = (item.count / max) * chartHeight;
    const y = height - 42 - barHeight;
    const radius = 12;

    ctx.fillStyle = "#e8efff";
    roundedRect(ctx, x, height - 42 - chartHeight, barWidth, chartHeight, radius);
    ctx.fill();

    ctx.fillStyle = "#2457d6";
    roundedRect(ctx, x, y, barWidth, barHeight, radius);
    ctx.fill();

    ctx.fillStyle = "#101828";
    ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(item.count, x + barWidth / 2, Math.max(28, y - 9));

    ctx.fillStyle = "#667085";
    ctx.font = "12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    ctx.fillText(item.label, x + barWidth / 2, height - 16);
  });
  ctx.textAlign = "left";
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function moveTask(taskId, nextStatus) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || task.status === nextStatus) return;
  const now = new Date().toISOString();
  task.status = nextStatus;
  task.updatedAt = now;
  task.completedAt = nextStatus === "done" ? now : null;
  saveState();
  renderAll();
  toast(`업무 상태를 ${statusLabel(nextStatus)}로 변경했습니다.`);
}

function ensureProject(name) {
  if (!name) return;
  const exists = state.projects.some((project) => project.name === name);
  if (exists) return;
  state.projects.push({
    id: uid(),
    name,
    goal: "목표를 입력해주세요.",
    status: "yellow",
    dueDate: "",
    progress: 0,
    risk: "아직 정리되지 않음",
  });
}

function listTasks(tasks) {
  if (!tasks.length) return "- 없음";
  return tasks.map((task) => `- ${task.project} / ${task.title} / 상태 ${statusLabel(task.status)} / 우선순위 ${priorityLabel[task.priority]} / 마감 ${displayDate(task.dueDate)}${task.memo ? ` / 메모: ${task.memo}` : ""}`).join("\n");
}

function listDecisions(decisions) {
  if (!decisions.length) return "- 없음";
  return decisions.map((decision) => `- ${displayDate(decision.date)} / ${decision.project} / ${decision.topic}: ${decision.decision}`).join("\n");
}

function getProjectNames() {
  return [...new Set([...state.projects.map((project) => project.name), ...state.tasks.map((task) => task.project)].filter(Boolean))].sort((a, b) => a.localeCompare(b, "ko"));
}

function taskSort(a, b) {
  const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
  if (priorityDiff) return priorityDiff;
  const dateA = a.dueDate || "9999-12-31";
  const dateB = b.dueDate || "9999-12-31";
  return dateA.localeCompare(dateB);
}

function isOverdue(task) {
  if (!task.dueDate || task.status === "done") return false;
  return task.dueDate < toISODate(new Date());
}

function isDueWithin(task, days) {
  if (!task.dueDate || task.status === "done") return false;
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(`${task.dueDate}T00:00:00`));
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diff >= 0 && diff <= days;
}

function inCurrentMonth(dateLike) {
  if (!dateLike) return false;
  const date = new Date(dateLike);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toISODate(date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function displayDate(date) {
  if (!date) return "없음";
  return date.replace(/-/g, ".");
}

function statusLabel(status) {
  return statusConfig.find((item) => item.id === status)?.label || status;
}

function projectStatusLabel(status) {
  return { green: "정상", yellow: "주의", red: "위험" }[status] || status;
}

function uniqueById(item, index, array) {
  return array.findIndex((candidate) => candidate.id === item.id) === index;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function uid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    toast("복사했습니다.");
  } catch (error) {
    const helper = document.createElement("textarea");
    helper.value = value;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
    toast("복사했습니다.");
  }
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(el.timer);
  el.timer = setTimeout(() => el.classList.remove("show"), 2200);
}

function validateImportedState(imported) {
  if (!imported || !Array.isArray(imported.tasks) || !Array.isArray(imported.projects) || !Array.isArray(imported.decisions) || !Array.isArray(imported.meetings)) {
    throw new Error("Invalid PO OS backup file");
  }
}

window.addEventListener("resize", () => {
  if (document.getElementById("dashboard").classList.contains("active")) drawKpiChart();
});
