export const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-CA", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function formatTime(value: string): string {
  const [h, m] = value.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "pm" : "am";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m}${suffix}`;
}

export const STUDENT_STATUS: Record<string, string> = {
  active: "Active",
  on_leave: "On leave",
  left: "Left",
  completed: "Completed",
};

export const PAY_TYPE: Record<string, string> = {
  monthly_salary: "Monthly salary",
  per_class: "Per class taught",
  per_student: "Per student enrolled",
  fee_share: "Share of fees collected",
};

export const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  staff: "Office staff",
  teacher: "Teacher",
};
