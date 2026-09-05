import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { fullName?: unknown; email?: unknown; password?: unknown } | null;
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!fullName || fullName.length > 100) return NextResponse.json({ message: "Enter your full name using 100 characters or fewer." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ message: "Authentication is not configured yet." }, { status: 503 });
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: new URL("/auth/confirm", request.url).toString(), data: { full_name: fullName } } });
  if (error) return NextResponse.json({ message: "We could not create your account. Check your details and try again." }, { status: 400 });
  if (!data.session) return NextResponse.json({ message: "confirmation_required" });
  return NextResponse.json({ redirect: "/dashboard" });
}
