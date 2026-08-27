import { requireOwner } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  await requireOwner();
  const supabase = await getSupabase();

  const { data } = await supabase
    .from("am_settings")
    .select("academy_name, currency_code, currency_symbol, fee_due_day")
    .maybeSingle();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>These apply everywhere in the app.</p>
        </div>
      </div>
      <div className="card card-pad" style={{ maxWidth: "40rem" }}>
        <SettingsForm
          settings={{
            academy_name: data?.academy_name ?? "My Academy",
            currency_code: data?.currency_code ?? "CAD",
            currency_symbol: data?.currency_symbol ?? "$",
            fee_due_day: data?.fee_due_day ?? 1,
          }}
        />
      </div>
    </>
  );
}
