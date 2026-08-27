"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { requireOwner, logActivity } from "@/lib/session";

export type FormState = { error?: string; ok?: string };

export async function invitePerson(_prev: FormState, fd: FormData): Promise<FormState> {
  const viewer = await requireOwner();

  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const fullName = String(fd.get("full_name") ?? "").trim();
  const role = String(fd.get("role") ?? "staff");
  const teacherId = String(fd.get("teacher_id") ?? "");

  if (!email || !fullName) return { error: "Enter a name and an email address." };
  if (role === "teacher" && teacherId === "") {
    return { error: "Choose which teacher record this login belongs to." };
  }

  const supabase = await getSupabase();
  const { error } = await supabase.from("am_invites").insert({
    email,
    full_name: fullName,
    role,
    teacher_id: role === "teacher" ? teacherId : null,
    created_by: viewer.id,
  });

  if (error) {
    if (error.code === "23505") return { error: "That email has already been invited." };
    return { error: "Could not create this invitation." };
  }

  await logActivity(viewer, "invite_created", "invite", email, { role });
  revalidatePath("/people");
  return { ok: `${fullName} can now create an account using ${email}.` };
}

export async function revokeInvite(fd: FormData) {
  const viewer = await requireOwner();
  const id = String(fd.get("invite_id") ?? "");
  if (!id) return;

  const supabase = await getSupabase();
  await supabase.from("am_invites").delete().eq("id", id).is("accepted_at", null);
  await logActivity(viewer, "invite_revoked", "invite", id);
  revalidatePath("/people");
}

export async function setProfileActive(fd: FormData) {
  const viewer = await requireOwner();
  const id = String(fd.get("profile_id") ?? "");
  const active = String(fd.get("active") ?? "") === "true";
  if (!id || id === viewer.id) return;

  const supabase = await getSupabase();
  await supabase.from("am_profiles").update({ is_active: active }).eq("id", id);
  await logActivity(viewer, active ? "access_restored" : "access_revoked", "profile", id);
  revalidatePath("/people");
}
