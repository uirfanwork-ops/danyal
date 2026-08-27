import Link from "next/link";
import { requireViewer, isStaff } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/server";
import { WEEKDAYS, formatTime } from "@/lib/format";
import ClassForm from "./ClassForm";

export default async function ClassesPage() {
  const viewer = await requireViewer();
  const supabase = await getSupabase();

  const { data: classes } = await supabase
    .from("am_classes")
    .select("id, name, status, teacher_id, am_teachers(full_name), am_class_slots(weekday, starts_at, ends_at), am_enrollments(id)")
    .order("name");

  const { data: teachers } = await supabase
    .from("am_teachers")
    .select("id, full_name")
    .eq("status", "active")
    .order("full_name");

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Classes</h1>
          <p>
            {isStaff(viewer)
              ? "Each class has a teacher, a weekly schedule, and the students enrolled in it."
              : "The classes you teach."}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><h2>All classes</h2></div>
        {(classes ?? []).length === 0 ? (
          <div className="empty">No classes yet.</div>
        ) : (
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>Class</th><th>Teacher</th><th>Schedule</th>
                  <th className="right">Students</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(classes ?? []).map((c) => {
                  const teacher = c.am_teachers as unknown as { full_name: string } | null;
                  const slots = (c.am_class_slots ?? []) as { weekday: number; starts_at: string; ends_at: string }[];
                  const enrolled = (c.am_enrollments ?? []) as { id: string }[];
                  return (
                    <tr key={c.id}>
                      <td><Link href={`/classes/${c.id}`}>{c.name}</Link></td>
                      <td>{teacher?.full_name ?? <span className="muted">unassigned</span>}</td>
                      <td className="small muted">
                        {slots.length === 0
                          ? "—"
                          : slots
                              .slice()
                              .sort((a, b) => a.weekday - b.weekday || a.starts_at.localeCompare(b.starts_at))
                              .map((s) => `${WEEKDAYS[s.weekday].slice(0, 3)} ${formatTime(s.starts_at)}`)
                              .join(", ")}
                      </td>
                      <td className="right num">{enrolled.length}</td>
                      <td>
                        <span className={`pill ${c.status === "active" ? "ok" : "off"}`}>
                          {c.status === "active" ? "Active" : "Archived"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isStaff(viewer) ? (
        <div className="card">
          <div className="card-title"><h2>Create a class</h2></div>
          <div className="card-pad">
            <ClassForm teachers={(teachers ?? []).map((t) => ({ id: t.id, name: t.full_name }))} />
          </div>
        </div>
      ) : null}
    </>
  );
}
