import Link from "next/link";
import { requireViewer, isStaff, isOwner } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/server";
import { formatMinor } from "@/lib/money";
import { WEEKDAYS, formatTime } from "@/lib/format";

export default async function DashboardPage() {
  const viewer = await requireViewer();
  const supabase = await getSupabase();

  const { data: settings } = await supabase
    .from("am_settings").select("academy_name, currency_symbol").maybeSingle();
  const symbol = settings?.currency_symbol ?? "$";

  const { data: students } = await supabase.from("am_students").select("id, status");
  const active = (students ?? []).filter((s) => s.status === "active");

  const { data: classes } = await supabase
    .from("am_classes")
    .select("id, name, status, am_class_slots(weekday, starts_at, ends_at), am_enrollments(id), am_teachers(full_name)")
    .eq("status", "active")
    .order("name");

  const { data: teachers } = isStaff(viewer)
    ? await supabase.from("am_teachers").select("id").eq("status", "active")
    : { data: null };

  // Expected monthly fee income: each active student's most recent fee that has started.
  const today = new Date().toISOString().slice(0, 10);
  let expectedMinor = 0;
  let withoutFee = 0;

  if (isStaff(viewer)) {
    const { data: fees } = await supabase
      .from("am_fee_arrangements")
      .select("student_id, monthly_amount_minor, effective_from")
      .lte("effective_from", today)
      .order("effective_from", { ascending: false });

    const current = new Map<string, number>();
    for (const f of fees ?? []) {
      if (!current.has(f.student_id)) current.set(f.student_id, f.monthly_amount_minor);
    }
    for (const s of active) {
      if (current.has(s.id)) expectedMinor += current.get(s.id)!;
      else withoutFee += 1;
    }
  }

  const todayWeekday = new Date().getDay();
  const todaysClasses = (classes ?? []).filter((c) =>
    ((c.am_class_slots ?? []) as { weekday: number }[]).some((s) => s.weekday === todayWeekday),
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{settings?.academy_name ?? "Academy"}</h1>
          <p>
            Signed in as {viewer.fullName}. This is phase 1 — records only.
            Billing, payments and the transaction log arrive in phase 2.
          </p>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="label">Active students</div>
          <div className="value">{active.length}</div>
          <div className="sub">{(students ?? []).length} on the books in total</div>
        </div>

        <div className="stat">
          <div className="label">Active classes</div>
          <div className="value">{(classes ?? []).length}</div>
          <div className="sub">{todaysClasses.length} running today</div>
        </div>

        {isStaff(viewer) ? (
          <div className="stat">
            <div className="label">Teachers</div>
            <div className="value">{(teachers ?? []).length}</div>
            <div className="sub">active</div>
          </div>
        ) : null}

        {isStaff(viewer) ? (
          <div className="stat">
            <div className="label">Expected monthly fees</div>
            <div className="value">{formatMinor(expectedMinor, symbol)}</div>
            <div className="sub">
              {withoutFee > 0
                ? `${withoutFee} active ${withoutFee === 1 ? "student has" : "students have"} no fee set`
                : "every active student has a fee"}
            </div>
          </div>
        ) : null}
      </div>

      {isStaff(viewer) && withoutFee > 0 ? (
        <div className="card card-pad" style={{ marginTop: "1.25rem" }}>
          <div className="notice info">
            {withoutFee} active {withoutFee === 1 ? "student does" : "students do"} not have a
            monthly fee recorded. They cannot be billed until that is set.{" "}
            <Link href="/students">Review students</Link>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: "1.25rem" }}>
        <div className="card-title">
          <h2>Today — {WEEKDAYS[todayWeekday]}</h2>
        </div>
        {todaysClasses.length === 0 ? (
          <div className="empty">No classes scheduled for today.</div>
        ) : (
          <div className="tscroll">
            <table>
              <thead>
                <tr><th>Class</th><th>Teacher</th><th>Time</th><th className="right">Students</th></tr>
              </thead>
              <tbody>
                {todaysClasses.map((c) => {
                  const teacher = c.am_teachers as unknown as { full_name: string } | null;
                  const slot = ((c.am_class_slots ?? []) as { weekday: number; starts_at: string; ends_at: string }[])
                    .filter((s) => s.weekday === todayWeekday)
                    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
                  return (
                    <tr key={c.id}>
                      <td><Link href={`/classes/${c.id}`}>{c.name}</Link></td>
                      <td>{teacher?.full_name ?? <span className="muted">unassigned</span>}</td>
                      <td className="num">
                        {slot ? `${formatTime(slot.starts_at)} – ${formatTime(slot.ends_at)}` : "—"}
                      </td>
                      <td className="right num">{((c.am_enrollments ?? []) as { id: string }[]).length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isOwner(viewer) && active.length === 0 ? (
        <div className="card card-pad" style={{ marginTop: "1.25rem" }}>
          <h2 style={{ marginBottom: "0.5rem" }}>Getting started</h2>
          <ol className="small muted" style={{ margin: 0, paddingLeft: "1.1rem", lineHeight: 1.9 }}>
            <li>Set your academy name and currency in <Link href="/settings">Settings</Link>.</li>
            <li>Add your teachers under <Link href="/teachers">Teachers</Link>.</li>
            <li>Add your students under <Link href="/students">Students</Link>, with their monthly fee.</li>
            <li>Create your classes and enrol students into them.</li>
            <li>Invite your office staff under <Link href="/people">People</Link>.</li>
          </ol>
        </div>
      ) : null}
    </>
  );
}
