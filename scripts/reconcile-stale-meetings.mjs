import fs from "node:fs";
import process from "node:process";
import { setTimeout as wait } from "node:timers/promises";
import { createClient } from "@supabase/supabase-js";
import { RoomServiceClient } from "livekit-server-sdk";

const WAIT_SECONDS = 120;
const APPLY_MODE = process.argv.slice(2).includes("--apply");
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--apply");

if (unknownArguments.length > 0) {
  console.error(`Unknown argument(s): ${unknownArguments.join(", ")}`);
  process.exit(1);
}

function loadLocalEnvironment() {
  if (!fs.existsSync(".env.local")) throw new Error("Missing .env.local.");
  const values = {};
  for (const sourceLine of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const name = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[name] = value;
  }
  return { ...values, ...process.env };
}

function requireEnvironment(environment, name) {
  const value = environment[name];
  if (typeof value !== "string" || value.length === 0) throw new Error(`Missing required environment variable: ${name}.`);
  return value;
}

function printClassification(label, meetings) {
  const publicCodes = meetings.map((meeting) => meeting.public_code).sort();
  console.log(`${label}_COUNT=${publicCodes.length}`);
  console.log(`${label}_PUBLIC_CODES=${publicCodes.length > 0 ? publicCodes.join(",") : "NONE"}`);
}

async function liveKitPresence(roomClient, meetings) {
  if (meetings.length === 0) return { live: [], empty: [] };
  const rooms = await roomClient.listRooms(meetings.map((meeting) => meeting.room_name));
  const participantsByRoom = new Map(rooms.map((room) => [room.name, room.numParticipants]));
  const live = [];
  const empty = [];
  for (const meeting of meetings) {
    const participantCount = participantsByRoom.get(meeting.room_name) ?? 0;
    (participantCount >= 1 ? live : empty).push(meeting);
  }
  return { live, empty };
}

async function main() {
  const environment = loadLocalEnvironment();
  const supabaseUrl = requireEnvironment(environment, "NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnvironment(environment, "SUPABASE_SERVICE_ROLE_KEY");
  const liveKitUrl = requireEnvironment(environment, "LIVEKIT_URL");
  const liveKitApiKey = requireEnvironment(environment, "LIVEKIT_API_KEY");
  const liveKitApiSecret = requireEnvironment(environment, "LIVEKIT_API_SECRET");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const roomClient = new RoomServiceClient(liveKitUrl, liveKitApiKey, liveKitApiSecret);

  const { data, error } = await supabase
    .from("meetings")
    .select("public_code,room_name")
    .eq("status", "active");
  if (error) throw new Error(`Unable to load active meetings (${error.code || "unknown_error"}).`);

  const meetings = (data ?? []).filter((meeting) =>
    typeof meeting.public_code === "string" && meeting.public_code.length > 0 &&
    typeof meeting.room_name === "string" && meeting.room_name.length > 0
  );
  if (meetings.length !== (data ?? []).length) throw new Error("An active meeting returned an invalid reconciliation record.");

  console.log(`MODE=${APPLY_MODE ? "APPLY" : "DRY_RUN"}`);
  console.log(`ACTIVE_MEETINGS_FOUND=${meetings.length}`);
  console.log("LIVEKIT_CHECK_1=STARTED");
  const firstCheck = await liveKitPresence(roomClient, meetings);
  const firstObservedEmptyAt = new Date().toISOString();
  printClassification("CHECK_1_LIVE", firstCheck.live);
  printClassification("CHECK_1_EMPTY", firstCheck.empty);

  console.log(`WAITING_FOR_SECOND_CHECK_SECONDS=${WAIT_SECONDS}`);
  await wait(WAIT_SECONDS * 1000);

  console.log("LIVEKIT_CHECK_2=STARTED");
  const secondCheck = await liveKitPresence(roomClient, firstCheck.empty);
  printClassification("BECAME_LIVE", secondCheck.live);
  printClassification("TWICE_CONFIRMED_EMPTY", secondCheck.empty);

  if (!APPLY_MODE) {
    console.log("DATABASE_MUTATIONS=0");
    console.log("DRY_RUN_COMPLETE=true");
    return;
  }

  const repaired = [];
  const skipped = [...secondCheck.live.map((meeting) => meeting.public_code)];
  const failures = [];
  for (const meeting of secondCheck.empty) {
    const { data: result, error: reconciliationError } = await supabase.rpc("reconcile_stale_active_meeting", {
      requested_public_code: meeting.public_code,
      requested_observed_empty_at: firstObservedEmptyAt,
    });
    if (reconciliationError) {
      failures.push(meeting.public_code);
    } else if (result === false) {
      skipped.push(meeting.public_code);
    } else {
      repaired.push(meeting.public_code);
    }
  }

  console.log(`REPAIRED_COUNT=${repaired.length}`);
  console.log(`REPAIRED_PUBLIC_CODES=${repaired.length > 0 ? repaired.sort().join(",") : "NONE"}`);
  console.log(`SKIPPED_COUNT=${skipped.length}`);
  console.log(`SKIPPED_PUBLIC_CODES=${skipped.length > 0 ? skipped.sort().join(",") : "NONE"}`);
  console.log(`FAILURE_COUNT=${failures.length}`);
  console.log(`FAILED_PUBLIC_CODES=${failures.length > 0 ? failures.sort().join(",") : "NONE"}`);
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Reconciliation failed.");
  process.exitCode = 1;
});
