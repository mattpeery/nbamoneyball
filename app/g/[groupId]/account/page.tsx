import { cookies } from "next/headers";
import { getGroupById } from "@/lib/groups";
import { groupCookieName, verifyGroupSessionToken } from "@/lib/groupSession";
import { GroupPasswordGate } from "@/components/GroupPasswordGate";
import { AccountSetupForm } from "@/components/AccountSetupForm";

export const dynamic = "force-dynamic";

export default async function AccountPage({ params }: { params: { groupId: string } }) {
  const group = await getGroupById(params.groupId);
  if (!group) {
    return (
      <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center px-4 text-center">
        <p className="text-[14px] text-[#6B7280]">That group doesn&apos;t exist. Check the link, or create a new one from the homepage.</p>
      </div>
    );
  }

  const token = cookies().get(groupCookieName(group.id))?.value;
  if (!verifyGroupSessionToken(group.id, token)) {
    return <GroupPasswordGate groupId={group.id} groupName={group.name} />;
  }

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center px-4">
      <AccountSetupForm groupId={group.id} />
    </div>
  );
}
