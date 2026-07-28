import Link from "next/link";
import { cookies } from "next/headers";
import { getGroupById } from "@/lib/groups";
import { groupCookieName, verifyGroupSessionToken } from "@/lib/groupSession";
import { GroupPasswordGate } from "@/components/GroupPasswordGate";
import { InviteLinkCard } from "@/components/InviteLinkCard";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: { groupId: string } }) {
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
      <div className="w-full max-w-sm bg-white border border-[#DADFE3] rounded-2xl p-5">
        <h3 className="font-display uppercase tracking-wide text-[17px] font-semibold text-[#131518] mb-1">{group.name}</h3>
        <p className="text-[12.5px] text-[#6B7280] mb-4">Your group is ready. Share this link to invite others.</p>

        <InviteLinkCard groupName={group.name} />

        <Link
          href={`/home?g=${group.id}`}
          className="font-display uppercase tracking-wide block w-full mt-4 py-3 rounded-xl bg-[#16A34A] text-white text-[14px] font-semibold text-center active:scale-[0.98]"
        >
          View Group
        </Link>
      </div>
    </div>
  );
}
