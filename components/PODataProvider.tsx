"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { createSeedData } from "@/lib/seed";
import type { AppData, Decision, Meeting, Project, Task, TaskPriority, TaskStatus } from "@/types/po-os";
import { useToast } from "@/components/Toast";

type TaskInput = {
  title: string;
  project_name: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  source: string;
  memo: string;
};

type DataContextValue = AppData & {
  user: User | null;
  loading: boolean;
  envReady: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  addTask: (input: TaskInput) => Promise<void>;
  updateTask: (taskId: string, input: Partial<TaskInput>) => Promise<void>;
  moveTask: (taskId: string, status: TaskStatus) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createSampleData: () => Promise<void>;
};

const DataContext = createContext<DataContextValue | null>(null);

export function PODataProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const { showToast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppData>({ projects: [], tasks: [], decisions: [], meetings: [] });

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData.session;
    setSession(currentSession);
    if (!currentSession) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    setLoading(true);
    const [projectsResult, tasksResult, decisionsResult, meetingsResult] = await Promise.all([
      supabase.from("projects").select("*").order("updated_at", { ascending: false }),
      supabase.from("tasks").select("*").order("due_date", { ascending: true, nullsFirst: false }),
      supabase.from("decisions").select("*").order("date", { ascending: false }),
      supabase.from("meetings").select("*").order("date", { ascending: false }),
    ]);

    const error = projectsResult.error || tasksResult.error || decisionsResult.error || meetingsResult.error;
    if (error) {
      showToast(error.message, "error");
    } else {
      setData({
        projects: (projectsResult.data || []) as Project[],
        tasks: (tasksResult.data || []) as Task[],
        decisions: (decisionsResult.data || []) as Decision[],
        meetings: (meetingsResult.data || []) as Meeting[],
      });
    }
    setLoading(false);
  }, [router, showToast, supabase]);

  useEffect(() => {
    void refresh();
    if (!supabase) return undefined;
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) router.replace("/login");
    });
    return () => subscription.subscription.unsubscribe();
  }, [refresh, router, supabase]);

  const ensureProject = useCallback(
    async (projectName: string): Promise<Project | null> => {
      if (!supabase || !session?.user || !projectName.trim()) return null;
      const existing = data.projects.find((project) => project.name === projectName);
      if (existing) return existing;

      const { data: inserted, error } = await supabase
        .from("projects")
        .insert({
          user_id: session.user.id,
          name: projectName,
          goal: "목표를 입력해 주세요.",
          status: "yellow",
          progress: 0,
          risk: "",
        })
        .select("*")
        .single();

      if (error) {
        showToast(error.message, "error");
        return null;
      }
      return inserted as Project;
    },
    [data.projects, session?.user, showToast, supabase],
  );

  const addTask = useCallback(
    async (input: TaskInput) => {
      if (!supabase || !session?.user) return;
      const project = await ensureProject(input.project_name);
      const completedAt = input.status === "done" ? new Date().toISOString() : null;
      const { error } = await supabase.from("tasks").insert({
        user_id: session.user.id,
        project_id: project?.id || null,
        ...input,
        completed_at: completedAt,
      });
      if (error) showToast(error.message, "error");
      else {
        showToast("업무를 추가했습니다.");
        await refresh();
      }
    },
    [ensureProject, refresh, session?.user, showToast, supabase],
  );

  const updateTask = useCallback(
    async (taskId: string, input: Partial<TaskInput>) => {
      if (!supabase) return;
      const payload: Record<string, string | null> = {};
      if (input.title !== undefined) payload.title = input.title;
      if (input.project_name !== undefined) payload.project_name = input.project_name;
      if (input.priority !== undefined) payload.priority = input.priority;
      if (input.status !== undefined) payload.status = input.status;
      if (input.due_date !== undefined) payload.due_date = input.due_date;
      if (input.source !== undefined) payload.source = input.source;
      if (input.memo !== undefined) payload.memo = input.memo;
      if (input.status === "done") payload.completed_at = new Date().toISOString();
      if (input.status && input.status !== "done") payload.completed_at = null;

      if (input.project_name) {
        const project = await ensureProject(input.project_name);
        payload.project_id = project?.id || null;
      }

      const { error } = await supabase.from("tasks").update(payload).eq("id", taskId);
      if (error) showToast(error.message, "error");
      else {
        showToast("업무를 수정했습니다.");
        await refresh();
      }
    },
    [ensureProject, refresh, showToast, supabase],
  );

  const moveTask = useCallback(
    async (taskId: string, status: TaskStatus) => {
      await updateTask(taskId, { status });
    },
    [updateTask],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!supabase) return;
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) showToast(error.message, "error");
      else {
        showToast("업무를 삭제했습니다.");
        await refresh();
      }
    },
    [refresh, showToast, supabase],
  );

  const createSampleData = useCallback(async () => {
    if (!supabase || !session?.user) return;
    const seed = createSeedData();
    const { data: insertedProjects, error: projectError } = await supabase
      .from("projects")
      .insert(seed.projects.map((project) => ({ ...project, user_id: session.user.id })))
      .select("*");

    if (projectError) {
      showToast(projectError.message, "error");
      return;
    }

    const projects = (insertedProjects || []) as Project[];
    const { error: taskError } = await supabase.from("tasks").insert(
      seed.tasks.map((task) => {
        const project = projects.find((item) => item.name === task.project_name);
        return {
          ...task,
          user_id: session.user.id,
          project_id: project?.id || null,
          completed_at: task.status === "done" ? new Date().toISOString() : null,
        };
      }),
    );

    if (taskError) showToast(taskError.message, "error");
    else {
      showToast("샘플 데이터를 만들었습니다.");
      await refresh();
    }
  }, [refresh, session?.user, showToast, supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/login");
  }, [router, supabase]);

  const value = useMemo<DataContextValue>(
    () => ({
      ...data,
      user: session?.user || null,
      loading,
      envReady: Boolean(supabase),
      refresh,
      signOut,
      addTask,
      updateTask,
      moveTask,
      deleteTask,
      createSampleData,
    }),
    [addTask, createSampleData, data, deleteTask, loading, moveTask, refresh, session?.user, signOut, supabase, updateTask],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function usePOData() {
  const value = useContext(DataContext);
  if (!value) throw new Error("usePOData must be used inside PODataProvider");
  return value;
}
