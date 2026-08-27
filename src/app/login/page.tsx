import { redirect } from "next/navigation";
import { getViewer } from "@/lib/session";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const configured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (configured) {
    const viewer = await getViewer();
    if (viewer) redirect("/dashboard");
  }

  const { next } = await searchParams;

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-head">
          <div className="mark">
            Academy<span>Manager</span>
          </div>
          <p>Fees, discounts and payments</p>
        </div>

        {configured ? (
          <LoginForm next={next ?? "/dashboard"} />
        ) : (
          <div className="card card-pad stack">
            <div className="notice info">This app is not connected to its database yet.</div>
            <p className="small muted" style={{ margin: 0 }}>
              Two environment variables need to be set on the hosting project:
              <br />
              <code>NEXT_PUBLIC_SUPABASE_URL</code>
              <br />
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
