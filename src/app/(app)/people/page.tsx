import { requireOwner } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/server";
import { ROLE_LABEL } from "@/lib/format";
import { revokeInvite, setProfileActive } from "./actions";
import InviteForm from "./InviteForm";

export default async function PeoplePage() {
  const viewer = await requireOwner();
  const supabase = await getSupabase();

  const { data: profiles } = await supabase
    .from("am_profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .order("created_at");

  const { data: invites } = await supabase
    .from("am_invites")
    .select("id, email, full_name, role, accepted_at, created_at")
    .order("created_at", { ascending: false });

  const { data: teachers } = await supabase
    .from("am_teachers").select("id, full_name").eq("status", "active").order("full_name");

  const pending = (invites ?? []).filter((i) => !i.accepted_at);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>People</h1>
          <p>
            Nobody can reach this system unless you invite their email address first.
            Inviting someone does not create their password — they set that themselves
            when they sign up.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><h2>Who has access</h2></div>
        <div className="tscroll">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name}{p.id === viewer.id ? <span className="muted small"> (you)</span> : null}</td>
                  <td className="small muted">{p.email}</td>
                  <td>{ROLE_LABEL[p.role] ?? p.role}</td>
                  <td>
                    <span className={`pill ${p.is_active ? "ok" : "off"}`}>
                      {p.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="right">
                    {p.id === viewer.id ? null : (
                      <form action={setProfileActive}>
                        <input type="hidden" name="profile_id" value={p.id} />
                        <input type="hidden" name="active" value={String(!p.is_active)} />
                        <button className={p.is_active ? "btn danger" : "btn ghost"} type="submit">
                          {p.is_active ? "Suspend" : "Restore"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><h2>Invitations waiting to be used</h2></div>
        {pending.length === 0 ? (
          <div className="empty">No invitations outstanding.</div>
        ) : (
          <div className="tscroll">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th /></tr></thead>
              <tbody>
                {pending.map((i) => (
                  <tr key={i.id}>
                    <td>{i.full_name}</td>
                    <td className="small muted">{i.email}</td>
                    <td>{ROLE_LABEL[i.role] ?? i.role}</td>
                    <td className="right">
                      <form action={revokeInvite}>
                        <input type="hidden" name="invite_id" value={i.id} />
                        <button className="btn ghost" type="submit">Cancel</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title"><h2>Invite someone</h2></div>
        <div className="card-pad">
          <InviteForm teachers={(teachers ?? []).map((t) => ({ id: t.id, name: t.full_name }))} />
        </div>
      </div>
    </>
  );
}
