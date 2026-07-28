import type { RosterValidationError } from "./scoring";
import { MIN_TEAMS, MAX_TEAMS } from "./teams";

export function slug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function rosterErrorMessage(code: RosterValidationError): string {
  switch (code) {
    case "empty":
      return `Add at least ${MIN_TEAMS} teams.`;
    case "too-few-teams":
      return `Add at least ${MIN_TEAMS} teams (min. ${MIN_TEAMS}, max. ${MAX_TEAMS}).`;
    case "too-many-teams":
      return `Max ${MAX_TEAMS} teams per roster.`;
    case "over-budget":
      return "Over budget - reduce a pick before submitting.";
    case "invalid-amount":
      return "One of your picks has an invalid amount.";
    case "locked":
      return "The draft is locked.";
    default:
      return "Couldn't validate your roster.";
  }
}

export function M(n: number | undefined): string {
  return "$" + Math.round(n || 0).toLocaleString() + "M";
}

export function M2(n: number | undefined): string {
  const v = Math.round((n || 0) * 100) / 100;
  return "$" + v.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "M";
}

export function sanitizeGroupName(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export const PUBLIC_GROUP_ID = "public";

export function draftPathFor(groupId: string): string {
  return groupId === PUBLIC_GROUP_ID ? "/draft" : `/g/${groupId}/draft`;
}

export function leaderboardPathFor(groupId: string): string {
  return groupId === PUBLIC_GROUP_ID ? "/leaderboard" : `/g/${groupId}/leaderboard`;
}
