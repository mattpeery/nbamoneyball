import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import { getTeamData } from "@/lib/data";
import { AdminClient } from "@/components/AdminClient";
import { AdminLoginGate } from "@/components/AdminLoginGate";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return <AdminLoginGate />;
  }
  const teamdata = await getTeamData();
  return <AdminClient teamdata={teamdata} />;
}
