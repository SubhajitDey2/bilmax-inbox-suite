// Campaign queue worker — drains campaign_queue, sends via Meta, updates status
// Runs on schedule (pg_cron) or can be invoked manually.
// MOCKED: doesn't actually call Meta. Marks ~80% as sent, ~20% as failed for realism.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_PER_RUN = 50; // Meta compliance: spread over time
const MAX_ATTEMPTS = 3;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Pick pending items whose scheduled_for <= now
    const { data: items, error } = await admin
      .from("campaign_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(RATE_LIMIT_PER_RUN);

    if (error) throw error;

    let sent = 0;
    let failed = 0;

    for (const item of items ?? []) {
      // Mark processing
      await admin.from("campaign_queue").update({ status: "processing", attempts: item.attempts + 1 }).eq("id", item.id);

      // MOCK: 80% success
      const success = Math.random() < 0.8;

      if (success) {
        await admin.from("campaign_queue").update({
          status: "sent",
          sent_at: new Date().toISOString(),
          last_error: null,
        }).eq("id", item.id);
        // Bump campaign counters
        await admin.rpc as any; // keep TS happy
        const { data: camp } = await admin.from("campaigns").select("sent_count").eq("id", item.campaign_id).single();
        if (camp) {
          await admin.from("campaigns").update({ sent_count: camp.sent_count + 1 }).eq("id", item.campaign_id);
        }
        sent++;
      } else {
        const willRetry = item.attempts + 1 < MAX_ATTEMPTS;
        await admin.from("campaign_queue").update({
          status: willRetry ? "pending" : "failed",
          scheduled_for: willRetry ? new Date(Date.now() + 60_000 * (item.attempts + 1)).toISOString() : item.scheduled_for,
          last_error: "Mocked transient error",
        }).eq("id", item.id);
        if (!willRetry) {
          const { data: camp } = await admin.from("campaigns").select("failed_count").eq("id", item.campaign_id).single();
          if (camp) {
            await admin.from("campaigns").update({ failed_count: camp.failed_count + 1 }).eq("id", item.campaign_id);
          }
          failed++;
        }
      }
    }

    // Mark campaigns as sent if their queue is fully processed
    const campaignIds = Array.from(new Set((items ?? []).map((i) => i.campaign_id)));
    for (const cid of campaignIds) {
      const { count: pending } = await admin
        .from("campaign_queue")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", cid)
        .in("status", ["pending", "processing"]);
      if ((pending ?? 0) === 0) {
        await admin.from("campaigns").update({ status: "sent" }).eq("id", cid);
      }
    }

    return new Response(JSON.stringify({ processed: items?.length ?? 0, sent, failed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("worker error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
