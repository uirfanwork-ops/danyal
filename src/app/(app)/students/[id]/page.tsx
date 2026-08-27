import Link from "next/link";
import { notFound } from "next/navigation";
import { requireViewer, isStaff } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/server";
import { formatMinor } from "@/lib/money";
import { formatDate, STUDENT_STATUS, WEEKDAYS, formatTime } from "@/lib/format";
import StudentForm from "../StudentForm";
import FeeForm from "./FeeForm";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireViewer();
  const { id } = await params;
  const supabase = await getSupabase();

  const { data: student } = await supabase
    .from("am_students")
    .select("id, student_code, full_name, phone, guardian_name, guardian_phone, joined_on, status, notes")
    .eq("id", id)
    .maybeSingle();

  if (!student) notFound();

  const { data: settings } = await supabase
    .from("am_settings").select("currency_symbol").maybeSingle();
  const symbol = settings?.currency_symbol ?? "$";

  const { data: fees } = isStaff(viewer)
    ? await supabase
        .from("am_fee_arrangements")
        .select("id, monthly_amount_minor, effective_from, note")
        .eq("student_id", id)
        .order("effective_from", { ascending: false })
    : { data: null };

  const today = new Date().toISOString().slice(0, 10);
  const active = (fees ?? []).find((f) => f.effective_from <= today);

  const { data: enrollments } = await supabase
    .from("am_enrollments")
    .select("id, enrolled_on, ended_on, am_classes(id, name, am_class_slots(weekday, starts_at, ends_at))")
    .eq("student_id", id)
    .order("enrolled_on", { ascending: false });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{student.full_name}</h1>
          <p>
            {student.student_code ? `ID ${student.student_code} · ` : ""}
            Joined {formatDate(student.joined_on)} ·{" "}
            {STUDENT_STATUS[student.status] ?? student.status}
          </p>
        </div>
        <Link className="btn ghost" href="/students">Back to students</Link>
      </div>

      <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)" }}
           className="student-grid">
        <div>
          {isStaff(viewer) ? (
            <div className="card">
              <div className="card-title"><h2>Details</h2></div>
              <div className="card-pad">
                <StudentForm student={student} currencySymbol={symbol} />
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-title"><h2>Details</h2></div>
              <div className="card-pad stack">
                <div className="row-between"><span className="muted">Guardian</span>
                  <span>{student.guardian_name ?? "—"}</span></div>
                <div className="row-between"><span className="muted">Guardian phone</span>
                  <span className="num">{student.guardian_phone ?? "—"}</span></div>
                <div className="row-between"><span className="muted">Student phone</span>
                  <span className="num">{student.phone ?? "—"}</span></div>
              </div>
            </div>
          )}
        </div>

        <div>
          {isStaff(viewer) ? (
            <div className="card">
              <div className="card-title">
                <h2>Fee</h2>
                <span className="num" style={{ fontWeight: 600 }}>
                  {active ? formatMinor(active.monthly_amount_minor, symbol) : "not set"}
                </span>
              </div>
              <div className="card-pad">
                <FeeForm studentId={student.id} currencySymbol={symbol} />
              </div>
              {(fees ?? []).length > 0 ? (
                <div className="tscroll">
                  <table>
                    <thead>
                      <tr><th>From</th><th className="right">Amount</th><th>Note</th></tr>
                    </thead>
                    <tbody>
                      {(fees ?? []).map((f) => (
                        <tr key={f.id}>
                          <td className="num">{formatDate(f.effective_from)}</td>
                          <td className="right num">{formatMinor(f.monthly_amount_minor, symbol)}</td>
                          <td className="muted small">{f.note ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="card">
            <div className="card-title"><h2>Classes</h2></div>
            {(enrollments ?? []).length === 0 ? (
              <div className="empty">Not enrolled in any class.</div>
            ) : (
              <div className="tscroll">
                <table>
                  <thead><tr><th>Class</th><th>Schedule</th><th>Since</th></tr></thead>
                  <tbody>
                    {(enrollments ?? []).map((e) => {
                      const cls = e.am_classes as unknown as {
                        id: string; name: string;
                        am_class_slots: { weekday: number; starts_at: string; ends_at: string }[];
                      } | null;
                      if (!cls) return null;
                      return (
                        <tr key={e.id}>
                          <td><Link href={`/classes/${cls.id}`}>{cls.name}</Link></td>
                          <td className="small muted">
                            {cls.am_class_slots.length === 0
                              ? "—"
                              : cls.am_class_slots
                                  .map((s) => `${WEEKDAYS[s.weekday].slice(0, 3)} ${formatTime(s.starts_at)}`)
                                  .join(", ")}
                          </td>
                          <td className="num">{formatDate(e.enrolled_on)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
