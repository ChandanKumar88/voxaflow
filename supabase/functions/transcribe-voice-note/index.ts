// Transcribe a voice note using Lovable AI Gateway (Gemini multimodal audio).
// Public CORS, JWT-verified by default. Asynchronous: returns 202 immediately.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

async function transcribe(voiceNoteId: string) {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  try {
    await admin.from("voice_notes").update({ status: "processing" }).eq("id", voiceNoteId);

    const { data: note, error: noteErr } = await admin
      .from("voice_notes")
      .select("id, user_id, audio_url")
      .eq("id", voiceNoteId)
      .single();
    if (noteErr || !note) throw new Error(noteErr?.message || "Voice note not found");

    // Find the storage path. audio_url may be a signed URL or a raw path.
    let storagePath = note.audio_url as string;
    const marker = "/object/sign/voice-notes/";
    const idx = storagePath?.indexOf(marker);
    if (idx >= 0) {
      storagePath = storagePath.substring(idx + marker.length).split("?")[0];
    } else if (storagePath?.startsWith(`${note.user_id}/`)) {
      // already a path
    } else {
      // try to extract after bucket name
      const m = storagePath?.match(/voice-notes\/(.+?)(\?|$)/);
      if (m) storagePath = m[1];
    }

    const { data: file, error: dlErr } = await admin.storage.from("voice-notes").download(storagePath);
    if (dlErr || !file) throw new Error(dlErr?.message || "Failed to download audio");

    const buf = new Uint8Array(await file.arrayBuffer());
    // base64 encode
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < buf.length; i += chunk) {
      binary += String.fromCharCode(...buf.subarray(i, i + chunk));
    }
    const b64 = btoa(binary);
    const mime = file.type || "audio/webm";

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a transcription engine. Output ONLY the verbatim spoken transcript of the audio. No commentary, no labels, no timestamps. If the audio is silent or unintelligible, return an empty string.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Transcribe this audio." },
              { type: "input_audio", input_audio: { data: b64, format: mime.includes("mp3") ? "mp3" : "wav" } },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`AI gateway ${aiRes.status}: ${errText}`);
    }

    const aiData = await aiRes.json();
    const transcript: string = aiData.choices?.[0]?.message?.content?.trim() || "";

    await admin
      .from("voice_notes")
      .update({ status: "completed", transcript: transcript || "(no speech detected)" })
      .eq("id", voiceNoteId);
  } catch (err) {
    console.error("transcribe error", err);
    await admin
      .from("voice_notes")
      .update({ status: "failed", transcript: `Transcription failed: ${(err as Error).message}` })
      .eq("id", voiceNoteId);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { voiceNoteId } = await req.json();
    if (!voiceNoteId) {
      return new Response(JSON.stringify({ error: "voiceNoteId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the requester owns the note
    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: owned } = await admin
      .from("voice_notes")
      .select("id")
      .eq("id", voiceNoteId)
      .eq("user_id", userRes.user.id)
      .maybeSingle();
    if (!owned) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fire and forget — keep worker alive until done
    // @ts-expect-error EdgeRuntime is provided by Supabase Edge runtime
    EdgeRuntime.waitUntil(transcribe(voiceNoteId));

    return new Response(JSON.stringify({ status: "processing", voiceNoteId }), {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
