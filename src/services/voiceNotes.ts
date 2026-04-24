import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type VoiceNote = Tables<"voice_notes">;
export type VoiceNoteInsert = Omit<TablesInsert<"voice_notes">, "user_id">;
export type VoiceNoteUpdate = TablesUpdate<"voice_notes">;

export const voiceNotesService = {
  async list(opts?: { contactId?: string; dealId?: string; limit?: number }): Promise<VoiceNote[]> {
    let q = supabase.from("voice_notes").select("*").order("created_at", { ascending: false });
    if (opts?.contactId) q = q.eq("contact_id", opts.contactId);
    if (opts?.dealId) q = q.eq("deal_id", opts.dealId);
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },

  async create(input: VoiceNoteInsert): Promise<VoiceNote> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("voice_notes")
      .insert({ ...input, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, input: VoiceNoteUpdate): Promise<VoiceNote> {
    const { data, error } = await supabase.from("voice_notes").update(input).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("voice_notes").delete().eq("id", id);
    if (error) throw error;
  },
};
