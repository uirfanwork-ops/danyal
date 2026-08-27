import { requireViewer, isOwner, isStaff } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/server";
import { ROLE_LABEL } from "@/lib/format";
import { signOut } from "@/app/login/actions";
import NavLink from "./NavLink";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();

  const supabase = await getSupabase();
  const { data: settings } = await supabase
    .from("am_settings")
    .select("academy_name")
    .maybeSingle();

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/dashboard">
            {settings?.academy_name ?? "Academy"}<span>.</span>
          </a>

          <nav className="nav">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/students">Students</NavLink>
            <NavLink href="/classes">Classes</NavLink>
            {isStaff(viewer) ? <NavLink href="/teachers">Teachers</NavLink> : null}
            {isOwner(viewer) ? <NavLink href="/people">People</NavLink> : null}
            {isOwner(viewer) ? <NavLink href="/settings">Settings</NavLink> : null}
          </nav>

          <div className="whoami">
            <span>
              <b>{viewer.fullName}</b>
              <br />
              {ROLE_LABEL[viewer.role]}
            </span>
            <form action={signOut}>
              <button className="btn ghost" type="submit">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
