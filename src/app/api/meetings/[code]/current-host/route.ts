import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ code: string }> };

function currentHostKey(value: unknown) {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length === 1 && typeof value[0] === "string") return value[0];
  return null;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!/^[a-z0-9]{10,16}$/.test(code)) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Meeting status unavailable." }, { status: 503 });

  const { data, error } = await supabase.rpc("get_current_host_participant_key", { meeting_code: code });
  if (error) return NextResponse.json({ error: "Meeting status unavailable." }, { status: 503 });

  return NextResponse.json({ currentHostParticipantKey: currentHostKey(data) });
}
