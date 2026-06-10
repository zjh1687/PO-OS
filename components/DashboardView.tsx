"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, EmptyState, MetricCard } from "@/components/AppShell";
import { usePOData } from "@/components/PODataProvider";
import { displayDate, inCurrentMonth, isDueWithin, isOverdue } from "@/lib/date";
import { sortTasks } from "@/lib/utils";
import { priorityLabel, taskStatuses } from "@/types/po-os";

export function DashboardView() {
  return (
    <AppShell title="Dashboard">
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { tasks, projects, decisions, loading, createSampleData } = usePOData();
  const openTasks = tasks.filter((task) => task.status !== "done");
  const doneTasks = tasks.filter((task) => task.status === "done");
  const highTasks = openTasks.filter((task) => task.priority === "high");
  const dueSoonTasks = openTasks.filter((task) => isDueWithin(task.due_date, false, 7));
  const waitingTasks = tasks.filter((task) => task.status === "waiting");
  const doneThisMonth = doneTasks.filter((task) => inCurrentMonth(task.completed_at || task.updated_at || task.created_at));
  const completionRate = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
  const focusTasks = [...openTasks.filter((task) => isOverdue(task.due_date, false)), ...dueSoonTasks, ...highTasks]
    .filter((task, index, array) => array.findIndex((item) => item.id === task.id) === index)
    .sort(sortTasks)
    .slice(0, 7);

  const chartData = taskStatuses.map((status) => ({
    name: status.label,
    count: tasks.filter((task) => task.status === status.id).length,
  }));

  return (
    <>
      {loading ? <p className="rounded-lg bg-white p-5 font-semibold text-muted shadow-panel">데이터를 불러오는 중입니다.</p> : null}
      {!loading && tasks.length === 0 && projects.length === 0 ? (
        <section className="mb-5 rounded-lg border border-line bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-black">아직 데이터가 없습니다.</h3>
              <p className="mt-1 text-sm text-muted">샘플 데이터를 만들면 기존 HTML 앱의 예시 흐름으로 바로 둘러볼 수 있습니다.</p>
            </div>
            <button className="min-h-11 rounded-lg bg-primary px-4 font-extrabold text-white hover:bg-primary-dark" onClick={createSampleData} type="button">
              샘플 데이터 생성
            </button>
          </div>
        </section>
      ) : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="진행 필요 업무" value={openTasks.length} sub={`높은 우선순위 ${highTasks.length}건`} />
        <MetricCard label="마감 임박" value={dueSoonTasks.length} sub="오늘 기준 7일 이내" />
        <MetricCard label="대기 / 블로커" value={waitingTasks.length} sub="응답 또는 결정 필요" />
        <MetricCard label="이번 달 완료" value={doneThisMonth.length} sub={`전체 완료율 ${completionRate}%`} />
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <div className="mb-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-primary">Focus</p>
            <h3 className="mt-1 text-xl font-black">오늘 집중해야 할 업무</h3>
          </div>
          <div className="grid gap-3">
            {focusTasks.length ? (
              focusTasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-line bg-slate-50 p-4">
                  <h4 className="font-black">{task.title}</h4>
                  <p className="mt-1 text-sm text-muted">
                    {task.project_name || "프로젝트 없음"} · {displayDate(task.due_date)} · {priorityLabel[task.priority]}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState message="오늘 집중할 업무가 없습니다." />
            )}
          </div>
        </article>
        <article className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <div className="mb-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-primary">Project Health</p>
            <h3 className="mt-1 text-xl font-black">프로젝트 상태</h3>
          </div>
          <div className="grid gap-3">
            {projects.length ? (
              projects.map((project) => (
                <div key={project.id} className="rounded-lg border border-line bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-black">{project.name}</h4>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-700">{project.status}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{project.goal}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="프로젝트가 없습니다." />
            )}
          </div>
        </article>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <div className="mb-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-primary">KPI</p>
            <h3 className="mt-1 text-xl font-black">상태별 업무 KPI</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2457d6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <div className="mb-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-primary">Recent Decisions</p>
            <h3 className="mt-1 text-xl font-black">최근 의사결정</h3>
          </div>
          <div className="grid gap-3">
            {decisions.slice(0, 5).length ? (
              decisions.slice(0, 5).map((decision) => (
                <div key={decision.id} className="rounded-lg border border-line bg-slate-50 p-4">
                  <h4 className="font-black">{decision.topic}</h4>
                  <p className="mt-1 text-sm text-muted">{decision.decision}</p>
                </div>
              ))
            ) : (
              <EmptyState message="아직 의사결정 기록이 없습니다." />
            )}
          </div>
        </article>
      </section>
    </>
  );
}
