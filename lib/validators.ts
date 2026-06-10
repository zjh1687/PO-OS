import { z } from "zod";

export const taskInputSchema = z.object({
  title: z.string().min(1, "업무명을 입력해 주세요."),
  project_name: z.string().optional().default(""),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["inbox", "backlog", "doing", "waiting", "done"]),
  due_date: z.string().nullable().optional(),
  source: z.string().optional().default(""),
  memo: z.string().optional().default(""),
});

export const backupSchema = z.object({
  version: z.literal(1),
  owner: z.string().optional(),
  tasks: z.array(z.record(z.unknown())),
  projects: z.array(z.record(z.unknown())),
  decisions: z.array(z.record(z.unknown())),
  meetings: z.array(z.record(z.unknown())),
});
