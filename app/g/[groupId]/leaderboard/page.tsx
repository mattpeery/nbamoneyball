import { redirect } from "next/navigation";

export default function GroupLeaderboardPage({ params }: { params: { groupId: string } }) {
  redirect(`/home?g=${params.groupId}`);
}
