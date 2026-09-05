import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || !password) return NextResponse.json({ message: "Invalid email or password." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ message: "Authentication is not configured yet." }, { status: 503 });
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  return NextResponse.json({ redirect: "/dashboard" });
}
