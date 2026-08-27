"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase/server";
import { requireStaff, logActivity } from "@/lib/session";
import { parseAmountToMinor } from "@/lib/money";

export type FormState = { error?: string; ok?: string };

const text = (fd: FormData, key: string) => {
  const value = String(fd.get(key) ?? "").trim();
  return value === "" ? null : value;
};

export async function createStudent(_prev: FormState, fd: FormData): Promise<FormState> {
  const viewer = await requireStaff();

  const fullName = text(fd, "full_name");
  if (!fullName) return { error: "A student needs a name." };

  const feeRaw = String(fd.get("monthly_fee") ?? "").trim();
  let feeMinor: number | null = null;
  if (feeRaw !== "") {
    feeMinor = parseAmountToMinor(feeRaw);
    if (feeMinor === null) {
      return { error: "The monthly fee must be an amount like 5000 or 5000.50." };
    }
  }

  const supabase = await getSupabase();
  const joinedOn = text(fd, "joined_on") ?? new Date().toISOString().slice(0, 10);

  const { data: student, error } = await supabase
    .from("am_students")
    .insert({
      full_name: fullName,
      student_code: text(fd, "student_code"),
      phone: text(fd, "phone"),
      guardian_name: text(fd, "guardian_name"),
      guardian_phone: text(fd, "guardian_phone"),
      joined_on: joinedOn,
      status: String(fd.get("status") ?? "active"),
      notes: text(fd, "notes"),
      created_by: viewer.id,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "That student ID is already used by another student." };
    return { error: "Could not save this student. Nothing was changed." };
  }

  if (feeMinor !== null) {
    const { error: feeError } = await supabase.from("am_fee_arrangements").insert({
      student_id: student.id,
      monthly_amount_minor: feeMinor,
      effective_from: joinedOn,
      note: "Fee agreed when the student was added",
      created_by: viewer.id,
    });
    if (feeError) {
      await logActivity(viewer, "student_fee_failed", "student", student.id);
    }
  }

  await logActivity(viewer, "student_created", "student", student.id, { name: fullName });

  revalidatePath("/students");
  redirect(`/students/${student.id}`);
}

export async function updateStudent(_prev: FormState, fd: FormData): Promise<FormState> {
  const viewer = await requireStaff();
  const id = String(fd.get("id") ?? "");
  if (!id) return { error: "Missing student." };

  const fullName = text(fd, "full_name");
  if (!fullName) return { error: "A student needs a name." };

  const supabase = await getSupabase();
  const { error } = await supabase
    .from("am_students")
    .update({
      full_name: fullName,
      student_code: text(fd, "student_code"),
      phone: text(fd, "phone"),
      guardian_name: text(fd, "guardian_name"),
      guardian_phone: text(fd, "guardian_phone"),
      joined_on: text(fd, "joined_on"),
      status: String(fd.get("status") ?? "active"),
      notes: text(fd, "notes"),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "That student ID is already used by another student." };
    return { error: "Could not save these changes." };
  }

  await logActivity(viewer, "student_updated", "student", id, { name: fullName });
  revalidatePath(`/students/${id}`);
  revalidatePath("/students");
  return { ok: "Saved." };
}

/**
 * Fees are a dated history. This adds a new arrangement rather than editing
 * the old one, so past months keep the amount that actually applied to them.
 */
export async function setFee(_prev: FormState, fd: FormData): Promise<FormState> {
  const viewer = await requireStaff();
  const studentId = String(fd.get("student_id") ?? "");
  if (!studentId) return { error: "Missing student." };

  const minor = parseAmountToMinor(String(fd.get("amount") ?? ""));
  if (minor === null) return { error: "Enter an amount like 5000 or 5000.50." };

  const effectiveFrom = text(fd, "effective_from");
  if (!effectiveFrom) return { error: "Choose the date this fee starts from." };

  const supabase = await getSupabase();
  const { error } = await supabase.from("am_fee_arrangements").insert({
    student_id: studentId,
    monthly_amount_minor: minor,
    effective_from: effectiveFrom,
    note: text(fd, "note"),
    created_by: viewer.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A fee already starts on that date. Pick a different date." };
    }
    return { error: "Could not record this fee." };
  }

  await logActivity(viewer, "fee_set", "student", studentId, {
    amount_minor: minor,
    effective_from: effectiveFrom,
  });

  revalidatePath(`/students/${studentId}`);
  return { ok: "Fee recorded." };
}
