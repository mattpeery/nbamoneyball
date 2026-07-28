import "server-only";
import crypto from "crypto";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { hashGroupPassword } from "./groupPassword";

export type Group = { id: string; name: string; createdAt: number };

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function slugifyGroupName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "group";
}

type GroupRow = { id: string; name: string; name_normalized: string; password_hash: string; created_at: string };

function rowToGroup(row: GroupRow): Group {
  return { id: row.id, name: row.name, createdAt: new Date(row.created_at).getTime() };
}

export type CreateGroupResult = { ok: true; group: Group } | { ok: false; error: string };

export async function createGroup(name: string, password: string): Promise<CreateGroupResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Database isn't configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are unset)." };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 40) {
    return { ok: false, error: "Group name must be between 2 and 40 characters." };
  }
  if (password.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
  }

  const nameNormalized = normalizeName(trimmedName);
  const { data: existing } = await supabase.from("groups").select("id").eq("name_normalized", nameNormalized).maybeSingle();
  if (existing) {
    return { ok: false, error: "A group with that name already exists - pick a different name." };
  }

  const id = `${slugifyGroupName(trimmedName)}-${crypto.randomBytes(3).toString("hex")}`;
  const passwordHash = hashGroupPassword(password);

  const { error } = await supabase.from("groups").insert({
    id,
    name: trimmedName,
    name_normalized: nameNormalized,
    password_hash: passwordHash,
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true, group: { id, name: trimmedName, createdAt: Date.now() } };
}

export async function getGroupByNormalizedName(name: string): Promise<(Group & { passwordHash: string }) | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const nameNormalized = normalizeName(name);
  const { data } = await supabase.from("groups").select("*").eq("name_normalized", nameNormalized).maybeSingle();
  if (!data) return null;
  const row = data as GroupRow;
  return { ...rowToGroup(row), passwordHash: row.password_hash };
}

export async function getGroupById(id: string): Promise<(Group & { passwordHash: string }) | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data } = await supabase.from("groups").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const row = data as GroupRow;
  return { ...rowToGroup(row), passwordHash: row.password_hash };
}
