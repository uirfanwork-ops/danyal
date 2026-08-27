import Link from "next/link";
import { notFound } from "next/navigation";
import { requireViewer, isStaff } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/server";
import { WEEKDAYS, formatTime, formatDate, STUDENT_STATUS } from "@/lib/format";
import { removeSlot, unenrollStudent } from "../actions";
import ClassForm from "../ClassForm";
import SlotForm from "./SlotForm";
import EnrollForm from "./EnrollForm";

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireViewer();
  const { id } = await params;
  const supabase = await getSupabase();

  const { data: cls } = await supabase
    .from("am_classes")
    .select("id, name, status, teacher_id, am_teachers(full_name)")
    .eq("id", id)
    .maybeSingle();

  if (!cls) notFound();

  const teacher = cls.am_teachers as unknown as { full_name: string } | null;

  const { data: slots } = await supabase
    .from("am_class_slots")
    .select("id, weekday, starts_at, ends_at")
    .eq("class_id", id)
    .order("weekday")
    .order("starts_at");

  const { data: enrollments } = await supabase
    .from("am_enrollments")
    .select("id, enrolled_on, am_students(id, full_name, student_code, status)")
    .eq("class_id", id)
    .order("enrolled_on", { ascending: false });

  const { data: teachers } = isStaff(viewer)
    ? await supabase.from("am_teachers").select("id, full_name").eq("status", "active").order("full_name")
    : { data: [] };

  const enrolledIds = new Set(
    (enrollments ?? [])
      .map((e) => (e.am_students as unknown as { id: string } | null)?.id)
      .filter(Boolean) as string[],
  );

  const { data: allStudents } = isStaff(viewer)
    ? await supabase.from("am_students").select("id, full_name, student_code").eq("status", "active").order("full_name")
    : { data: [] };

  const available = (allStudents ?? []).filter((s) => !enrolledIds.has(s.id));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{cls.name}</h1>
          <p>
            {teacher?.full_name ?? "No teacher assigned"} ·{" "}
            {(enrollments ?? []).length} enrolled ·{" "}
            {cls.status === "active" ? "Active" : "Archived"}
          </p>
        </div>
        <Link className="btn ghost" href="/classes">Back to classes</Link>
      </div>

      <div className="card">
        <div className="card-title"><h2>Weekly schedule</h2></div>
        {(slots ?? []).length === 0 ? (
          <div className="empty">No times set for this class.</div>
        ) : (
          <div className="tscroll">
            <table>
              <thead>
                <tr><th>Day</th><th>Starts</th><th>Finishes</th>{isStaff(viewer) ? <th /> : null}</tr>
              </thead>
              <tbody>
                {(slots ?? []).map((s) => (
                  <tr key={s.id}>
                    <td>{WEEKDAYS[s.weekday]}</td>
                    <td className="num">{formatTime(s.starts_at)}</td>
                    <td className="num">{formatTime(s.ends_at)}</td>
                    {isStaff(viewer) ? (
                      <td className="right">
                        <form action={removeSlot}>
                          <input type="hidden" name="slot_id" value={s.id} />
                          <input type="hidden" name="class_id" value={cls.id} />
                          <button className="btn ghost" type="submit">Remove</button>
                        </form>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {isStaff(viewer) ? (
          <div className="card-pad" style={{ borderTop: "1px solid var(--rule)" }}>
            <SlotForm classId={cls.id} />
          </div>
        ) : null}
      </div>

      <div className="card">
        <div className="card-title"><h2>Students</h2></div>
        {(enrollments ?? []).length === 0 ? (
          <div className="empty">Nobody is enrolled in this class yet.</div>
        ) : (
          <div className="tscroll">
            <table>
              <thead>
                <tr><th>Name</th><th>ID</th><th>Status</th><th>Since</th>{isStaff(viewer) ? <th /> : null}</tr>
              </thead>
              <tbody>
                {(enrollments ?? []).map((e) => {
                  const s = e.am_students as unknown as {
                    id: string; full_name: string; student_code: string | null; status: string;
                  } | null;
                  if (!s) return null;
                  return (
                    <tr key={e.id}>
                      <td><Link href={`/students/${s.id}`}>{s.full_name}</Link></td>
                      <td className="num muted">{s.student_code ?? "—"}</td>
                      <td className="small">{STUDENT_STATUS[s.status] ?? s.status}</td>
                      <td className="num">{formatDate(e.enrolled_on)}</td>
                      {isStaff(viewer) ? (
                        <td className="right">
                          <form action={unenrollStudent}>
                            <input type="hidden" name="enrollment_id" value={e.id} />
                            <input type="hidden" name="class_id" value={cls.id} />
                            <button className="btn ghost" type="submit">Remove</button>
                          </form>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {isStaff(viewer) && available.length > 0 ? (
          <div className="card-pad" style={{ borderTop: "1px solid var(--rule)" }}>
            <EnrollForm
              classId={cls.id}
              students={available.map((s) => ({
                id: s.id,
                label: s.student_code ? `${s.full_name} (${s.student_code})` : s.full_name,
              }))}
            />
          </div>
        ) : null}
      </div>

      {isStaff(viewer) ? (
        <div className="card">
          <div className="card-title"><h2>Class details</h2></div>
          <div className="card-pad">
            <ClassForm
              teachers={(teachers ?? []).map((t) => ({ id: t.id, name: t.full_name }))}
              existing={{ id: cls.id, name: cls.name, teacher_id: cls.teacher_id, status: cls.status }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
