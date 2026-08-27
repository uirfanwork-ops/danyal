"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { requireOwner, logActivity } from "@/lib/session";

export type FormState = { error?: string; ok?: string };

export async function updateSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  const viewer = await requireOwner();

  const academyName = String(fd.get("academy_name") ?? "").trim();
  const currencyCode = String(fd.get("currency_code") ?? "").trim().toUpperCase();
  const currencySymbol = String(fd.get("currency_symbol") ?? "").trim();
  const feeDueDay = Number(fd.get("fee_due_day"));

  if (!academyName) return { error: "Give your academy a name." };
  if (!/^[A-Z]{3}$/.test(currencyCode)) return { error: "Currency code should be three letters, like CAD or PKR." };
  if (!currencySymbol) return { error: "Enter the symbol you want shown before amounts." };
  if (!Number.isInteger(feeDueDay) || feeDueDay < 1 || feeDueDay > 28) {
    return { error: "The fee due day must be between 1 and 28." };
  }

  const supabase = await getSupabase();
  const { error } = await supabase
    .from("am_settings")
    .update({
      academy_name: academyName,
      currency_code: currencyCode,
      currency_symbol: currencySymbol,
      fee_due_day: feeDueDay,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) return { error: "Could not save these settings." };

  await logActivity(viewer, "settings_updated", "settings", "settings", {
    academyName, currencyCode, feeDueDay,
  });
  revalidatePath("/", "layout");
  return { ok: "Settings saved." };
}
