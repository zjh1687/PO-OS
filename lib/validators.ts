import { z } from "zod";

const nullableDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜는 YYYY-MM-DD 형식이어야 합니다.")
  .nullable()
  .optional();

export const taskInputSchema = z.object({
  title: z.string().min(1, "업무명을 입력해 주세요."),
  project_name: z.string().optional().default(""),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["inbox", "backlog", "doing", "waiting", "done"]),
  due_date: nullableDateSchema,
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

export const aiImportSchema = z.object({
  projects: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        goal: z.string().trim().optional().default(""),
        status: z.enum(["green", "yellow", "red"]).optional().default("yellow"),
        due_date: nullableDateSchema,
        progress: z.number().int().min(0).max(100).optional().default(0),
        risk: z.string().trim().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  tasks: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        project_name: z.string().trim().optional().default(""),
        priority: z.enum(["high", "medium", "low"]).optional().default("medium"),
        status: z.enum(["inbox", "backlog", "doing", "waiting", "done"]).optional().default("inbox"),
        due_date: nullableDateSchema,
        source: z.string().trim().optional().default("AI 정리"),
        memo: z.string().trim().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  decisions: z
    .array(
      z.object({
        date: z
          .string()
          .trim()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜는 YYYY-MM-DD 형식이어야 합니다."),
        project_name: z.string().trim().optional().default(""),
        topic: z.string().trim().min(1),
        decision: z.string().trim().min(1),
        reason: z.string().trim().optional().default(""),
        requested_by: z.string().trim().optional().default(""),
        next_action: z.string().trim().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  meetings: z
    .array(
      z.object({
        date: z
          .string()
          .trim()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜는 YYYY-MM-DD 형식이어야 합니다."),
        title: z.string().trim().min(1),
        attendees: z.string().trim().optional().default(""),
        summary: z.string().trim().optional().default(""),
        actions: z.string().trim().optional().default(""),
      }),
    )
    .optional()
    .default([]),
});

export type AiImportInput = z.infer<typeof aiImportSchema>;
