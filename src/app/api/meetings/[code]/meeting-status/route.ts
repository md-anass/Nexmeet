import { NextResponse } from "next/server";
import { normalizePublicMeeting } from "@/lib/meeting-lifecycle";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ code: string }> };

export async function GET(_: Request, { params }: RouteContext) {
  const { code } = await params;
  if (!/^[a-z0-9]{10,16}$/.test(code)) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Meeting status unavailable." }, { status: 503 });

  const { data, error } = await supabase.rpc("get_public_meeting_by_code", { meeting_code: code }).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Meeting status unavailable." }, { status: 503 });

  const meeting = normalizePublicMeeting(data);
  if (!meeting) return NextResponse.json({ error: "Meeting status unavailable." }, { status: 503 });

  return NextResponse.json({ status: meeting.status, startedAt: meeting.startedAt, endedAt: meeting.endedAt });
}
