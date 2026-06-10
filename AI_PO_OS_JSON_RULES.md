# PO OS AI JSON Rules

Use this rule when ChatGPT, Codex, Claude, Gemini, or another AI tool helps organize PO work for PO OS.

## Goal

Convert meeting notes, CTO feedback, planning notes, or raw task dumps into JSON that can be pasted into PO OS > GPT Assistant > JSON Import.

## Output Rules

- Output JSON only.
- Do not wrap the JSON in markdown code fences.
- Do not add explanations, comments, or prose outside the JSON.
- Use only these top-level keys:
  - `projects`
  - `tasks`
  - `decisions`
  - `meetings`
- If there is no data for a key, return an empty array.
- Dates must use `YYYY-MM-DD`.
- Do not invent deadlines when there is no clue. Use `null` for unknown task or project due dates.
- Keep titles short and action-oriented.
- Preserve original business context in `memo`, `reason`, `summary`, or `actions`.

## Allowed Values

Task `priority`:

- `high`
- `medium`
- `low`

Task `status`:

- `inbox`
- `backlog`
- `doing`
- `waiting`
- `done`

Project `status`:

- `green`
- `yellow`
- `red`

## JSON Schema Shape

```json
{
  "projects": [
    {
      "name": "Project name",
      "goal": "Project goal",
      "status": "yellow",
      "due_date": "2026-06-30",
      "progress": 0,
      "risk": "Known risk"
    }
  ],
  "tasks": [
    {
      "title": "Action-oriented task title",
      "project_name": "Project name",
      "priority": "high",
      "status": "inbox",
      "due_date": "2026-06-14",
      "source": "Meeting / CTO / Slack / AI 정리",
      "memo": "Context, acceptance criteria, risk, or detail"
    }
  ],
  "decisions": [
    {
      "date": "2026-06-10",
      "project_name": "Project name",
      "topic": "Decision topic",
      "decision": "What was decided",
      "reason": "Why it was decided",
      "requested_by": "Requester or decision maker",
      "next_action": "Follow-up action"
    }
  ],
  "meetings": [
    {
      "date": "2026-06-10",
      "title": "Meeting title",
      "attendees": "Names or roles",
      "summary": "Short meeting summary",
      "actions": "- Owner: Action / Due date"
    }
  ]
}
```

## Prompt Template

```text
Convert the following notes into PO OS import JSON.

Rules:
- Output JSON only.
- Do not use markdown code fences.
- Use only projects, tasks, decisions, meetings as top-level keys.
- Dates must be YYYY-MM-DD.
- Task priority must be high, medium, or low.
- Task status must be inbox, backlog, doing, waiting, or done.
- Project status must be green, yellow, or red.
- If there is no data for a key, return an empty array.
- Do not invent unknown due dates. Use null.

Notes:
[paste notes here]
```

## Example Output

```json
{
  "projects": [
    {
      "name": "SQL Agent",
      "goal": "Define API permissions and admin approval flow for MVP.",
      "status": "yellow",
      "due_date": "2026-06-30",
      "progress": 20,
      "risk": "Permission scope may expand."
    }
  ],
  "tasks": [
    {
      "title": "Draft SQL Agent permission policy",
      "project_name": "SQL Agent",
      "priority": "high",
      "status": "doing",
      "due_date": "2026-06-14",
      "source": "CTO feedback",
      "memo": "Clarify admin approval flow and API access boundaries."
    }
  ],
  "decisions": [
    {
      "date": "2026-06-10",
      "project_name": "SQL Agent",
      "topic": "Permission scope",
      "decision": "Limit MVP permissions to admin approval based flow.",
      "reason": "Reduce security and delivery risk.",
      "requested_by": "CTO",
      "next_action": "PO drafts policy."
    }
  ],
  "meetings": []
}
```
