import { requireStaff } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/server";
import StudentForm from "../StudentForm";

export default async function NewStudentPage() {
  await requireStaff();
  const supabase = await getSupabase();
  const { data: settings } = await supabase
    .from("am_settings").select("currency_symbol").maybeSingle();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Add student</h1>
          <p>Only a name is required. Everything else can be filled in later.</p>
        </div>
      </div>
      <div className="card card-pad" style={{ maxWidth: "46rem" }}>
        <StudentForm currencySymbol={settings?.currency_symbol ?? "$"} />
      </div>
    </>
  );
}
