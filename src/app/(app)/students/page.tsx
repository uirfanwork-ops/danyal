import Link from "next/link";
import { requireViewer, isStaff } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/server";
import { formatMinor } from "@/lib/money";
import { formatDate, STUDENT_STATUS } from "@/lib/format";

type StudentRow = {
  id: string;
  student_code: string | null;
  full_name: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  joined_on: string;
  status: string;
};

const PILL: Record<string, string> = {
  active: "ok", on_leave: "warn", left: "off", completed: "off",
};

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const viewer = await requireViewer();
  const { q } = await searchParams;
  const supabase = await getSupabase();

  let query = supabase
    .from("am_students")
    .select("id, student_code, full_name, guardian_name, guardian_phone, joined_on, status")
    .order("full_name");

  if (q && q.trim() !== "") {
    const term = `%${q.trim()}%`;
    query = query.or(
      `full_name.ilike.${term},student_code.ilike.${term},guardian_name.ilike.${term},phone.ilike.${term},guardian_phone.ilike.${term}`,
    );
  }

  const { data, error } = await query;
  const students = (data ?? []) as StudentRow[];

  const { data: settings } = await supabase
    .from("am_settings").select("currency_symbol").maybeSingle();
  const symbol = settings?.currency_symbol ?? "$";

  // Current fee per student: the most recent arrangement that has already started.
  const today = new Date().toISOString().slice(0, 10);
  const { data: fees } = await supabase
    .from("am_fee_arrangements")
    .select("student_id, monthly_amount_minor, effective_from")
    .lte("effective_from", today)
    .order("effective_from", { ascending: false });

  const currentFee = new Map<string, number>();
  for (const fee of fees ?? []) {
    if (!currentFee.has(fee.student_id)) {
      currentFee.set(fee.student_id, fee.monthly_amount_minor);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Students</h1>
          <p>
            {students.length} {students.length === 1 ? "student" : "students"}
            {q ? ` matching “${q}”` : ""}.
          </p>
        </div>
        {isStaff(viewer) ? (
          <Link className="btn" href="/students/new">Add student</Link>
        ) : null}
      </div>

      <div className="card">
        <div className="card-title">
          <form className="btn-row" method="get">
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search name, ID, guardian or phone"
              style={{ minWidth: "18rem" }}
            />
            <button className="btn ghost" type="submit">Search</button>
            {q ? <Link className="btn ghost" href="/students">Clear</Link> : null}
          </form>
        </div>

        {error ? (
          <div className="empty">Could not load students.</div>
        ) : students.length === 0 ? (
          <div className="empty">
            {q ? "No student matches that search." : "No students yet."}
          </div>
        ) : (
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Guardian</th>
                  <th>Joined</th>
                  <th>Status</th>
                  {isStaff(viewer) ? <th className="right">Monthly fee</th> : null}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/students/${s.id}`}>{s.full_name}</Link>
                    </td>
                    <td className="num muted">{s.student_code ?? "—"}</td>
                    <td>
                      {s.guardian_name ?? "—"}
                      {s.guardian_phone ? (
                        <div className="small muted num">{s.guardian_phone}</div>
                      ) : null}
                    </td>
                    <td className="num">{formatDate(s.joined_on)}</td>
                    <td>
                      <span className={`pill ${PILL[s.status] ?? "off"}`}>
                        {STUDENT_STATUS[s.status] ?? s.status}
                      </span>
                    </td>
                    {isStaff(viewer) ? (
                      <td className="right num">
                        {currentFee.has(s.id)
                          ? formatMinor(currentFee.get(s.id)!, symbol)
                          : <span className="muted">not set</span>}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
