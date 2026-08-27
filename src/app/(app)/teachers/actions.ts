"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { requireStaff, requireOwner, logActivity } from "@/lib/session";
import { parseAmountToMinor } from "@/lib/money";

export type FormState = { error?: string; ok?: string };

const text = (fd: FormData, key: string) => {
  const v = String(fd.get(key) ?? "").trim();
  return v === "" ? null : v;
};

export async function createTeacher(_prev: FormState, fd: FormData): Promise<FormState> {
  const viewer = await requireStaff();
  const fullName = text(fd, "full_name");
  if (!fullName) return { error: "A teacher needs a name." };

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("am_teachers")
    .insert({
      full_name: fullName,
      phone: text(fd, "phone"),
      email: text(fd, "email"),
      joined_on: text(fd, "joined_on"),
      status: String(fd.get("status") ?? "active"),
      notes: text(fd, "notes"),
      created_by: viewer.id,
    })
    .select("id")
    .single();

  if (error) return { error: "Could not save this teacher." };

  await logActivity(viewer, "teacher_created", "teacher", data.id, { name: fullName });
  revalidatePath("/teachers");
  return { ok: `${fullName} added.` };
}

export async function setTeacherPay(_prev: FormState, fd: FormData): Promise<FormState> {
  const viewer = await requireOwner();
  const teacherId = String(fd.get("teacher_id") ?? "");
  if (!teacherId) return { error: "Missing teacher." };

  const payType = String(fd.get("pay_type") ?? "monthly_salary");
  const minor = parseAmountToMinor(String(fd.get("pay_rate") ?? "0"));
  if (minor === null) return { error: "Enter an amount like 40000 or 40000.50." };

  const supabase = await getSupabase();
  const { error } = await supabase
    .from("am_teacher_pay")
    .upsert(
      { teacher_id: teacherId, pay_type: payType, pay_rate_minor: minor, updated_by: viewer.id, updated_at: new Date().toISOString() },
      { onConflict: "teacher_id" },
    );

  if (error) return { error: "Could not save this pay arrangement." };

  await logActivity(viewer, "teacher_pay_set", "teacher", teacherId, {
    pay_type: payType, pay_rate_minor: minor,
  });
  revalidatePath("/teachers");
  return { ok: "Pay arrangement saved." };
}
