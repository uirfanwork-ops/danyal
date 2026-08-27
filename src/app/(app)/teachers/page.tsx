import { requireStaff, isOwner } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/server";
import { formatMinor } from "@/lib/money";
import { formatDate, PAY_TYPE } from "@/lib/format";
import TeacherForm from "./TeacherForm";
import PayForm from "./PayForm";

export default async function TeachersPage() {
  const viewer = await requireStaff();
  const supabase = await getSupabase();

  const { data: teachers } = await supabase
    .from("am_teachers")
    .select("id, full_name, phone, email, joined_on, status")
    .order("full_name");

  const { data: settings } = await supabase
    .from("am_settings").select("currency_symbol").maybeSingle();
  const symbol = settings?.currency_symbol ?? "$";

  const { data: pay } = isOwner(viewer)
    ? await supabase.from("am_teacher_pay").select("teacher_id, pay_type, pay_rate_minor")
    : { data: null };

  const payBy = new Map((pay ?? []).map((p) => [p.teacher_id, p]));

  const { data: classCounts } = await supabase
    .from("am_classes").select("teacher_id").eq("status", "active");
  const classesBy = new Map<string, number>();
  for (const c of classCounts ?? []) {
    if (c.teacher_id) classesBy.set(c.teacher_id, (classesBy.get(c.teacher_id) ?? 0) + 1);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Teachers</h1>
          <p>
            {isOwner(viewer)
              ? "You are the only role that can see or change what a teacher is paid."
              : "Pay arrangements are visible to the owner only."}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><h2>All teachers</h2></div>
        {(teachers ?? []).length === 0 ? (
          <div className="empty">No teachers yet.</div>
        ) : (
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Contact</th><th>Joined</th>
                  <th className="right">Classes</th><th>Status</th>
                  {isOwner(viewer) ? <th>Pay</th> : null}
                </tr>
              </thead>
              <tbody>
                {(teachers ?? []).map((t) => {
                  const p = payBy.get(t.id);
                  return (
                    <tr key={t.id}>
                      <td>{t.full_name}</td>
                      <td className="small muted">
                        {t.phone ? <div className="num">{t.phone}</div> : null}
                        {t.email ?? (t.phone ? null : "—")}
                      </td>
                      <td className="num">{formatDate(t.joined_on)}</td>
                      <td className="right num">{classesBy.get(t.id) ?? 0}</td>
                      <td>
                        <span className={`pill ${t.status === "active" ? "ok" : "off"}`}>
                          {t.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {isOwner(viewer) ? (
                        <td className="small">
                          {p ? (
                            <>
                              <div>{PAY_TYPE[p.pay_type] ?? p.pay_type}</div>
                              <div className="num muted">{formatMinor(p.pay_rate_minor, symbol)}</div>
                            </>
                          ) : (
                            <span className="muted">not set</span>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title"><h2>Add a teacher</h2></div>
        <div className="card-pad"><TeacherForm /></div>
      </div>

      {isOwner(viewer) && (teachers ?? []).length > 0 ? (
        <div className="card">
          <div className="card-title"><h2>Set a pay arrangement</h2></div>
          <div className="card-pad">
            <PayForm
              teachers={(teachers ?? []).map((t) => ({ id: t.id, name: t.full_name }))}
              currencySymbol={symbol}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
