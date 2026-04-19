// WhatsApp send — proxies outbound messages to Meta Cloud API
// MOCKED: real send not performed. Marks message as "sent" and returns mock external_id.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: cErr } = await supabase.auth.getClaims(token);
    if (cErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { conversation_id, body } = await req.json();
    if (!conversation_id || !body) {
      return new Response(JSON.stringify({ error: "conversation_id and body required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client for trusted DB writes
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: convo, error: convoErr } = await admin
      .from("conversations")
      .select("id, org_id, customer_id, channel")
      .eq("id", conversation_id)
      .single();
    if (convoErr || !convo) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up WhatsApp credentials for the org
    const { data: account } = await admin
      .from("whatsapp_accounts")
      .select("phone_number_id, access_token_encrypted, status")
      .eq("org_id", convo.org_id)
      .eq("connection_type", "cloud_api")
      .maybeSingle();

    if (!account || account.status !== "connected") {
      // Still write the message but mark as queued
      const { data: msg } = await admin.from("messages").insert({
        org_id: convo.org_id,
        conversation_id,
        direction: "outbound",
        sender_type: "agent",
        sender_user_id: claims.claims.sub,
        body,
        status: "queued",
      }).select().single();
      return new Response(JSON.stringify({ ok: true, mocked: true, message: msg }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Actual Meta Graph API call
    // const accessToken = decrypt(account.access_token_encrypted);
    // const res = await fetch(`https://graph.facebook.com/v18.0/${account.phone_number_id}/messages`, {
    //   method: "POST",
    //   headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    //   body: JSON.stringify({ messaging_product: "whatsapp", to: customerPhone, text: { body } }),
    // });

    const mockExternalId = `mock-${Date.now()}`;
    const { data: msg, error: insErr } = await admin.from("messages").insert({
      org_id: convo.org_id,
      conversation_id,
      direction: "outbound",
      sender_type: "agent",
      sender_user_id: claims.claims.sub,
      body,
      external_id: mockExternalId,
      status: "sent",
    }).select().single();

    if (insErr) throw insErr;

    await admin
      .from("conversations")
      .update({
        last_message_preview: body.slice(0, 200),
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversation_id);

    return new Response(JSON.stringify({ ok: true, message: msg }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
