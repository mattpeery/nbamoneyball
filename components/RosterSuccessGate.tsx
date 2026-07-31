"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RosterSuccessModal } from "@/components/RosterSuccessModal";

export function RosterSuccessGate({ teams }: { teams: string[] }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function close() {
    setOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  if (!open) return null;
  return <RosterSuccessModal teams={teams} onClose={close} />;
}
