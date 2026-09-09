import { MarketingHome } from "@/components/marketing/marketing-home";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getAuthenticatedUser();

  return <MarketingHome authenticated={Boolean(user)} />;
}
