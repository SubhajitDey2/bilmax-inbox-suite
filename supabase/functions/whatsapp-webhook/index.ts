// WhatsApp webhook receiver — Meta Cloud API
// Verifies signature, ingests inbound messages, broadcasts via Realtime
// MOCKED: signature verification + Meta payload structure are stubbed.
// Real implementation must validate X-Hub-Signature-256 against per-account app_secret.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // GET = Meta webhook verification handshake
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    // TODO: look up token in whatsapp_accounts.webhook_verify_token
    if (mode === "subscribe" && token && challenge) {
      return new Response(challenge, { status: 200, headers: corsHeaders });
    }
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // TODO: verify X-Hub-Signature-256 with HMAC-SHA256 using app_secret
    // const signature = req.headers.get("x-hub-signature-256");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Meta payload structure: entry[].changes[].value.messages[]
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {};
        const phoneNumberId = value.metadata?.phone_number_id;
        if (!phoneNumberId) continue;

        // Find which org owns this phone number
        const { data: account } = await supabase
          .from("whatsapp_accounts")
          .select("id, org_id")
          .eq("phone_number_id", phoneNumberId)
          .maybeSingle();
        if (!account) continue;

        for (const msg of value.messages ?? []) {
          const fromPhone = msg.from;
          const msgBody = msg.text?.body ?? "[non-text message]";
          const externalId = msg.id;

          // Find or create customer
          let { data: customer } = await supabase
            .from("customers")
            .select("id")
            .eq("org_id", account.org_id)
            .eq("phone", fromPhone)
            .maybeSingle();

          if (!customer) {
            const { data: newC } = await supabase
              .from("customers")
              .insert({ org_id: account.org_id, name: fromPhone, phone: fromPhone })
              .select("id")
              .single();
            customer = newC;
          }
          if (!customer) continue;

          // Find or create conversation
          let { data: convo } = await supabase
            .from("conversations")
            .select("id")
            .eq("org_id", account.org_id)
            .eq("customer_id", customer.id)
            .eq("channel", "whatsapp")
            .maybeSingle();

          if (!convo) {
            const { data: newConvo } = await supabase
              .from("conversations")
              .insert({
                org_id: account.org_id,
                customer_id: customer.id,
                channel: "whatsapp",
                last_message_preview: msgBody.slice(0, 200),
                last_message_at: new Date().toISOString(),
                unread_count: 1,
              })
              .select("id")
              .single();
            convo = newConvo;
          } else {
            await supabase
              .from("conversations")
              .update({
                last_message_preview: msgBody.slice(0, 200),
                last_message_at: new Date().toISOString(),
              })
              .eq("id", convo.id);
          }
          if (!convo) continue;

          await supabase.from("messages").insert({
            org_id: account.org_id,
            conversation_id: convo.id,
            direction: "inbound",
            sender_type: "customer",
            body: msgBody,
            external_id: externalId,
            status: "delivered",
          });
        }

        // Update last sync timestamp
        await supabase
          .from("whatsapp_accounts")
          .update({ last_synced_at: new Date().toISOString(), status: "connected" })
          .eq("id", account.id);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("webhook error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
