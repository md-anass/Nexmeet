import { NextResponse } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import { createLiveKitLifecycleClient } from "@/lib/supabase/livekit-lifecycle";

export const runtime = "nodejs";

function eventTimestamp(createdAt: bigint) {
  const seconds = Number(createdAt);
  if (!Number.isSafeInteger(seconds) || seconds <= 0) return null;
  const timestamp = new Date(seconds * 1000);
  return Number.isFinite(timestamp.getTime()) ? timestamp.toISOString() : null;
}

export async function POST(request: Request) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "Webhook service unavailable." }, { status: 503 });
  }

  const rawBody = await request.text();
  const authorization = request.headers.get("authorization");
  let event;
  try {
    event = await new WebhookReceiver(apiKey, apiSecret).receive(rawBody, authorization ?? undefined);
  } catch {
    return NextResponse.json({ error: "Invalid webhook." }, { status: 401 });
  }

  if (event.event !== "participant_joined" && event.event !== "participant_left" && event.event !== "room_finished") {
    return NextResponse.json({ ok: true });
  }

  const roomName = event.room?.name;
  const occurredAt = eventTimestamp(event.createdAt);
  if (!roomName || !occurredAt) {
    return NextResponse.json({ error: "Invalid lifecycle event." }, { status: 400 });
  }

  const supabase = createLiveKitLifecycleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Lifecycle service unavailable." }, { status: 503 });
  }

  if (event.event === "room_finished") {
    const { error } = await supabase.rpc("finalize_meeting_from_livekit_room_finished", {
      requested_room_name: roomName,
      requested_event_at: occurredAt,
    });
    return error
      ? NextResponse.json({ error: "Lifecycle update failed." }, { status: 503 })
      : NextResponse.json({ ok: true });
  }

  const participantKey = event.participant?.identity;
  if (!participantKey) {
    return NextResponse.json({ error: "Invalid lifecycle event." }, { status: 400 });
  }

  const functionName = event.event === "participant_joined"
    ? "apply_livekit_participant_joined"
    : "apply_livekit_participant_left";
  const { error } = await supabase.rpc(functionName, {
    requested_room_name: roomName,
    requested_participant_key: participantKey,
    requested_event_at: occurredAt,
  });
  return error
    ? NextResponse.json({ error: "Lifecycle update failed." }, { status: 503 })
    : NextResponse.json({ ok: true });
}
