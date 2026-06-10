"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell, EmptyState } from "@/components/AppShell";
import { usePOData } from "@/components/PODataProvider";
import { displayDate } from "@/lib/date";
import { cn, sortTasks } from "@/lib/utils";
import { priorityLabel, taskStatuses, type Task, type TaskPriority, type TaskStatus } from "@/types/po-os";

type TaskFormState = {
  title: string;
  project_name: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  source: string;
  memo: string;
};

const emptyTaskForm: TaskFormState = {
  title: "",
  project_name: "",
  priority: "medium",
  status: "doing",
  due_date: "",
  source: "",
  memo: "",
};

export function TasksView() {
  return (
    <AppShell title="Tasks">
      <TasksContent />
    </AppShell>
  );
}

function TasksContent() {
  const { tasks, projects, addTask, updateTask, moveTask, deleteTask } = usePOData();
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormState>(emptyTaskForm);

  const projectNames = useMemo(
    () => [...new Set([...projects.map((project) => project.name), ...tasks.map((task) => task.project_name)].filter(Boolean))].sort(),
    [projects, tasks],
  );

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks
      .filter((task) => {
        const text = `${task.title} ${task.project_name} ${task.memo} ${task.source}`.toLowerCase();
        const searchOk = !query || text.includes(query);
        const projectOk = projectFilter === "all" || task.project_name === projectFilter;
        const priorityOk = priorityFilter === "all" || task.priority === priorityFilter;
        return searchOk && projectOk && priorityOk;
      })
      .sort(sortTasks);
  }, [priorityFilter, projectFilter, search, tasks]);

  function openCreate() {
    setEditingTask(null);
    setForm({ ...emptyTaskForm });
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
    setForm({
      title: task.title,
      project_name: task.project_name,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date || "",
      source: task.source,
      memo: task.memo,
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      project_name: form.project_name.trim(),
      priority: form.priority,
      status: form.status,
      due_date: form.due_date || null,
      source: form.source.trim(),
      memo: form.memo.trim(),
    };
    if (editingTask) await updateTask(editingTask.id, payload);
    else await addTask(payload);
    setEditingTask(null);
    setForm({ ...emptyTaskForm });
    setFormOpen(false);
  }

  async function requestDelete(task: Task) {
    const ok = window.confirm(`업무를 삭제할까요?\n\n${task.title}`);
    if (ok) await deleteTask(task.id);
  }

  return (
    <>
      <section className="mb-5 rounded-lg border border-line bg-white p-4 shadow-panel">
        <div className="grid gap-3 xl:grid-cols-[1fr_220px_180px_auto]">
          <input
            className="focus-ring rounded-lg border border-line px-4 py-3"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="업무, 프로젝트, 메모 검색"
            type="search"
          />
          <select className="focus-ring rounded-lg border border-line px-4 py-3" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
            <option value="all">전체 프로젝트</option>
            {projectNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select className="focus-ring rounded-lg border border-line px-4 py-3" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
            <option value="all">전체 우선순위</option>
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-extrabold text-white hover:bg-primary-dark" type="button" onClick={openCreate}>
            <Plus size={18} />
            업무 추가
          </button>
        </div>
      </section>
      <TaskForm
        open={formOpen}
        form={form}
        setForm={setForm}
        editingTask={editingTask}
        projectNames={projectNames}
        onSubmit={submit}
        onCancel={() => {
          setEditingTask(null);
          setForm({ ...emptyTaskForm });
          setFormOpen(false);
        }}
      />
      <section className="grid gap-4 overflow-x-auto pb-3 xl:grid-cols-5">
        {taskStatuses.map((status) => {
          const columnTasks = filteredTasks.filter((task) => task.status === status.id);
          return (
            <div key={status.id} className="min-h-[520px] min-w-[250px] rounded-lg border border-line bg-white/80 p-3 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3 border-b border-line px-1 pb-3">
                <div>
                  <h3 className="font-black">{status.label}</h3>
                  <p className="mt-1 text-xs font-semibold text-muted">{status.hint}</p>
                </div>
                <span className="grid h-8 min-w-8 place-items-center rounded-full bg-soft-primary px-2 text-xs font-black text-primary-dark">{columnTasks.length}</span>
              </div>
              <div className="grid gap-3">
                {columnTasks.length ? (
                  columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={() => openEdit(task)} onDelete={() => void requestDelete(task)} onMove={(nextStatus) => void moveTask(task.id, nextStatus)} />
                  ))
                ) : (
                  <EmptyState message="업무 없음" />
                )}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}

function TaskForm({
  open,
  form,
  setForm,
  editingTask,
  projectNames,
  onSubmit,
  onCancel,
}: {
  open: boolean;
  form: TaskFormState;
  setForm: React.Dispatch<React.SetStateAction<TaskFormState>>;
  editingTask: Task | null;
  projectNames: string[];
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <section className="mb-5 rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-black">{editingTask ? "업무 수정" : "업무 추가"}</h3>
        <button className="rounded-lg border border-line px-3 py-2 text-sm font-bold text-muted hover:text-ink" type="button" onClick={onCancel}>
          닫기
        </button>
      </div>
      <form className="grid gap-3 xl:grid-cols-6" onSubmit={onSubmit}>
        <label className="grid gap-2 text-sm font-bold text-slate-700 xl:col-span-2">
          업무명
          <input className="focus-ring rounded-lg border border-line px-4 py-3" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          프로젝트
          <input
            className="focus-ring rounded-lg border border-line px-4 py-3"
            value={form.project_name}
            onChange={(event) => setForm((prev) => ({ ...prev, project_name: event.target.value }))}
            list="project-options"
          />
          <datalist id="project-options">
            {projectNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          우선순위
          <select className="focus-ring rounded-lg border border-line px-4 py-3" value={form.priority} onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))}>
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          상태
          <select className="focus-ring rounded-lg border border-line px-4 py-3" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as TaskStatus }))}>
            {taskStatuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          마감일
          <input className="focus-ring rounded-lg border border-line px-4 py-3" type="date" value={form.due_date} onChange={(event) => setForm((prev) => ({ ...prev, due_date: event.target.value }))} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700 xl:col-span-2">
          출처
          <input className="focus-ring rounded-lg border border-line px-4 py-3" value={form.source} onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700 xl:col-span-4">
          메모
          <textarea className="focus-ring min-h-24 rounded-lg border border-line px-4 py-3" value={form.memo} onChange={(event) => setForm((prev) => ({ ...prev, memo: event.target.value }))} />
        </label>
        <div className="flex items-end justify-end xl:col-span-6">
          <button className="min-h-11 rounded-lg bg-primary px-5 font-extrabold text-white hover:bg-primary-dark" type="submit">
            저장
          </button>
        </div>
      </form>
    </section>
  );
}

function TaskCard({ task, onEdit, onDelete, onMove }: { task: Task; onEdit: () => void; onDelete: () => void; onMove: (status: TaskStatus) => void }) {
  return (
    <article className="rounded-lg border border-line bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-black", priorityTone(task.priority))}>우선순위 {priorityLabel[task.priority]}</span>
        <button className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100" title="삭제" type="button" onClick={onDelete}>
          <Trash2 size={16} />
        </button>
      </div>
      <button className="block text-left" type="button" onClick={onEdit}>
        <h4 className="text-sm font-black leading-6">{task.title}</h4>
      </button>
      <p className="mt-2 text-xs leading-5 text-muted">
        {task.project_name || "프로젝트 없음"} · 마감 {displayDate(task.due_date)} · {task.source || "직접 입력"}
      </p>
      {task.memo ? <p className="mt-2 text-xs leading-5 text-muted">{task.memo}</p> : null}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {taskStatuses
          .filter((status) => status.id !== task.status)
          .map((status) => (
            <button key={status.id} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600 hover:bg-soft-primary hover:text-primary-dark" type="button" onClick={() => onMove(status.id)}>
              {status.label}
            </button>
          ))}
      </div>
    </article>
  );
}

function priorityTone(priority: TaskPriority): string {
  if (priority === "high") return "bg-rose-50 text-rose-700";
  if (priority === "medium") return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}
