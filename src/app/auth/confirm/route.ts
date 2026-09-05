import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const allowedTypes = ["email", "signup", "invite", "recovery", "email_change"] as const;
  const supabase = await createSupabaseServerClient();

  if (!supabase || !tokenHash || !type || !allowedTypes.includes(type as (typeof allowedTypes)[number])) {
    return NextResponse.redirect(new URL("/login?error=confirmation", request.url));
  }

  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as (typeof allowedTypes)[number] });
  return error
    ? NextResponse.redirect(new URL("/login?error=confirmation", request.url))
    : NextResponse.redirect(new URL("/dashboard", request.url));
}
