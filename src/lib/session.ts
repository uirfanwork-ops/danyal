import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase/server";

export type Role = "owner" | "staff" | "teacher";

export type Viewer = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  teacherId: string | null;
};

/**
 * The signed-in person and what they are allowed to do.
 *
 * A signed-in account with no academy profile is somebody who belongs to the
 * other system sharing this database. They are not an error — they simply have
 * no access here.
 */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("am_profiles")
    .select("id, full_name, email, role, teacher_id, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!data || !data.is_active) return null;

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    role: data.role as Role,
    teacherId: data.teacher_id,
  };
}

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  return viewer;
}

export async function requireStaff(): Promise<Viewer> {
  const viewer = await requireViewer();
  if (viewer.role === "teacher") redirect("/dashboard");
  return viewer;
}

export async function requireOwner(): Promise<Viewer> {
  const viewer = await requireViewer();
  if (viewer.role !== "owner") redirect("/dashboard");
  return viewer;
}

export const isStaff = (v: Viewer) => v.role === "owner" || v.role === "staff";
export const isOwner = (v: Viewer) => v.role === "owner";

/** Records who did what. Failures here must never block the actual work. */
export async function logActivity(
  viewer: Viewer,
  action: string,
  entityType: string,
  entityId: string,
  detail?: Record<string, unknown>,
) {
  try {
    const supabase = await getSupabase();
    await supabase.from("am_activity_log").insert({
      actor_id: viewer.id,
      actor_name: viewer.fullName,
      action,
      entity_type: entityType,
      entity_id: entityId,
      detail: detail ?? null,
    });
  } catch {
    // Deliberately swallowed.
  }
}
