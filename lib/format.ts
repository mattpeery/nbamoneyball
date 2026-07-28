import type { RosterValidationError } from "./scoring";

export function slug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function rosterErrorMessage(code: RosterValidationError): string {
  switch (code) {
    case "empty":
      return "Add at least 1 team.";
    case "over-budget":
      return "Over budget - reduce a pick before submitting.";
    case "invalid-amount":
      return "One of your picks doesn't match the current price - remove it and buy again.";
    case "locked":
      return "The draft is locked.";
    default:
      return "Couldn't validate your roster.";
  }
}

export function usd(n: number | undefined): string {
  return "$" + (Math.round((n || 0) * 100) / 100).toFixed(2);
}

export function sanitizeGroupName(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export const PUBLIC_GROUP_ID = "public";

export function draftPathFor(groupId: string): string {
  return groupId === PUBLIC_GROUP_ID ? "/draft" : `/g/${groupId}/draft`;
}

export function leaderboardPathFor(groupId: string): string {
  return groupId === PUBLIC_GROUP_ID ? "/home" : `/home?g=${groupId}`;
}
