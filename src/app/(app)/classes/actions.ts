"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase/server";
import { requireStaff, logActivity } from "@/lib/session";

export type FormState = { error?: string; ok?: string };

export async function createClass(_prev: FormState, fd: FormData): Promise<FormState> {
  const viewer = await requireStaff();
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return { error: "A class needs a name." };

  const teacherId = String(fd.get("teacher_id") ?? "");
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("am_classes")
    .insert({ name, teacher_id: teacherId === "" ? null : teacherId, created_by: viewer.id })
    .select("id")
    .single();

  if (error) return { error: "Could not create this class." };

  await logActivity(viewer, "class_created", "class", data.id, { name });
  revalidatePath("/classes");
  redirect(`/classes/${data.id}`);
}

export async function updateClass(_prev: FormState, fd: FormData): Promise<FormState> {
  const viewer = await requireStaff();
  const id = String(fd.get("id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  if (!id || !name) return { error: "A class needs a name." };

  const teacherId = String(fd.get("teacher_id") ?? "");
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("am_classes")
    .update({
      name,
      teacher_id: teacherId === "" ? null : teacherId,
      status: String(fd.get("status") ?? "active"),
    })
    .eq("id", id);

  if (error) return { error: "Could not save these changes." };

  await logActivity(viewer, "class_updated", "class", id, { name });
  revalidatePath(`/classes/${id}`);
  revalidatePath("/classes");
  return { ok: "Saved." };
}

export async function addSlot(_prev: FormState, fd: FormData): Promise<FormState> {
  const viewer = await requireStaff();
  const classId = String(fd.get("class_id") ?? "");
  const weekday = Number(fd.get("weekday"));
  const startsAt = String(fd.get("starts_at") ?? "");
  const endsAt = String(fd.get("ends_at") ?? "");

  if (!classId || Number.isNaN(weekday) || !startsAt || !endsAt) {
    return { error: "Choose a day and both times." };
  }
  if (endsAt <= startsAt) return { error: "The finish time must be after the start time." };

  const supabase = await getSupabase();
  const { error } = await supabase
    .from("am_class_slots")
    .insert({ class_id: classId, weekday, starts_at: startsAt, ends_at: endsAt });

  if (error) return { error: "Could not add this time." };

  await logActivity(viewer, "class_slot_added", "class", classId, { weekday, startsAt, endsAt });
  revalidatePath(`/classes/${classId}`);
  return { ok: "Time added." };
}

export async function removeSlot(fd: FormData) {
  const viewer = await requireStaff();
  const id = String(fd.get("slot_id") ?? "");
  const classId = String(fd.get("class_id") ?? "");
  if (!id) return;

  const supabase = await getSupabase();
  await supabase.from("am_class_slots").delete().eq("id", id);
  await logActivity(viewer, "class_slot_removed", "class", classId, { slot: id });
  revalidatePath(`/classes/${classId}`);
}

export async function enrollStudent(_prev: FormState, fd: FormData): Promise<FormState> {
  const viewer = await requireStaff();
  const classId = String(fd.get("class_id") ?? "");
  const studentId = String(fd.get("student_id") ?? "");
  if (!classId || !studentId) return { error: "Choose a student." };

  const supabase = await getSupabase();
  const { error } = await supabase
    .from("am_enrollments")
    .insert({ class_id: classId, student_id: studentId });

  if (error) {
    if (error.code === "23505") return { error: "That student is already in this class." };
    return { error: "Could not enrol this student." };
  }

  await logActivity(viewer, "student_enrolled", "class", classId, { student: studentId });
  revalidatePath(`/classes/${classId}`);
  return { ok: "Student enrolled." };
}

export async function unenrollStudent(fd: FormData) {
  const viewer = await requireStaff();
  const id = String(fd.get("enrollment_id") ?? "");
  const classId = String(fd.get("class_id") ?? "");
  if (!id) return;

  const supabase = await getSupabase();
  await supabase.from("am_enrollments").delete().eq("id", id);
  await logActivity(viewer, "student_unenrolled", "class", classId, { enrollment: id });
  revalidatePath(`/classes/${classId}`);
}
