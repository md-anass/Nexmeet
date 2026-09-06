"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MeetingActionState = { error: string };

const CODE_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function createPublicCode() {
  const bytes = randomBytes(12);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

export async function createMeeting(_: MeetingActionState, formData: FormData): Promise<MeetingActionState> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title || title.length > 120) return { error: "Enter a meeting title using 120 characters or fewer." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Meetings are not configured yet." };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: "Your session has expired. Please sign in again." };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await supabase
      .from("meetings")
      .insert({
        host_user_id: userData.user.id,
        public_code: createPublicCode(),
        room_name: `nm_${randomUUID()}`,
        title,
        status: "active",
      })
      .select("public_code")
      .single();

    if (!error && data) redirect(`/m/${data.public_code}`);
    if (error?.code !== "23505") return { error: "We could not create your meeting. Please try again." };
  }

  return { error: "We could not create a unique meeting link. Please try again." };
}
