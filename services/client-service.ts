import { createClient } from "@/lib/supabase/server";
import { requirePortalRole } from "@/services/auth-service";
import type { ClientInput } from "@/utils/validation/phase2";

export type ClientRecord = {
  id: string;
  name: string;
  created_at: string;
};

export async function listClientsForStaff(): Promise<ClientRecord[]> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load clients: ${error.message}`);
  }

  return data as ClientRecord[];
}

export async function listClientsForSelect(): Promise<Pick<ClientRecord, "id" | "name">[]> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load clients: ${error.message}`);
  }

  return data as Pick<ClientRecord, "id" | "name">[];
}

export async function listClientsPublic(): Promise<Pick<ClientRecord, "id" | "name">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []) as Pick<ClientRecord, "id" | "name">[];
}

export async function createClientRecord(input: ClientInput): Promise<ClientRecord> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: input.name,
    })
    .select("id, name, created_at")
    .single();

  if (error) {
    throw new Error(`Unable to create client: ${error.message}`);
  }

  return data as ClientRecord;
}

export async function updateClientRecord(id: string, input: ClientInput): Promise<ClientRecord> {
  await requirePortalRole("staff");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .update({
      name: input.name,
    })
    .eq("id", id)
    .select("id, name, created_at")
    .single();

  if (error) {
    throw new Error(`Unable to update client: ${error.message}`);
  }

  return data as ClientRecord;
}
