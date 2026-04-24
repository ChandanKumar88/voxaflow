import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

export type Deal = Tables<"deals">;
export type DealInsert = Omit<TablesInsert<"deals">, "user_id">;
export type DealUpdate = TablesUpdate<"deals">;
export type DealStage = Enums<"deal_stage">;

export const DEAL_STAGES: DealStage[] = ["New Lead", "Contacted", "Interested", "Negotiation", "Closed"];

export const dealsService = {
  async list(opts?: { stage?: DealStage; search?: string }): Promise<Deal[]> {
    let q = supabase.from("deals").select("*").order("created_at", { ascending: false });
    if (opts?.stage) q = q.eq("stage", opts.stage);
    if (opts?.search) q = q.ilike("company", `%${opts.search}%`);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },

  async listWithContacts() {
    const { data, error } = await supabase
      .from("deals")
      .select("*, contact:contacts(id, name, phone, email)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<Deal | null> {
    const { data, error } = await supabase.from("deals").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(input: DealInsert): Promise<Deal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("deals")
      .insert({ ...input, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, input: DealUpdate): Promise<Deal> {
    const { data, error } = await supabase.from("deals").update(input).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async updateStage(id: string, stage: DealStage): Promise<Deal> {
    return this.update(id, { stage });
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("deals").delete().eq("id", id);
    if (error) throw error;
  },
};
