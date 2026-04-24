import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Contact = Tables<"contacts">;
export type ContactInsert = Omit<TablesInsert<"contacts">, "user_id">;
export type ContactUpdate = TablesUpdate<"contacts">;

export const contactsService = {
  async list(opts?: { search?: string; limit?: number; offset?: number }): Promise<Contact[]> {
    let q = supabase.from("contacts").select("*").order("created_at", { ascending: false });
    if (opts?.search) q = q.ilike("name", `%${opts.search}%`);
    if (opts?.limit) q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<Contact | null> {
    const { data, error } = await supabase.from("contacts").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(input: ContactInsert): Promise<Contact> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("contacts")
      .insert({ ...input, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, input: ContactUpdate): Promise<Contact> {
    const { data, error } = await supabase.from("contacts").update(input).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) throw error;
  },
};
