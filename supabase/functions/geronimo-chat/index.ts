import { INSTRUCTIONS } from "./instructions.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

const SYSTEM = `${INSTRUCTIONS}

(Interface note: after each long story, the website automatically paints one 16:9 photorealistic image of the surroundings for the traveler. Still end long stories with the required closing question. Write in rich Markdown paragraphs.)`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "AI is not configured" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const input = messages.slice(-30).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? ""),
    }));

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      signal: req.signal,
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: SYSTEM,
        input,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      let message = "The time portal is unavailable right now.";
      if (upstream.status === 429) message = "Too many travelers at once — please wait a moment and try again.";
      else if (upstream.status === 402) message = "The time portal has run out of AI credits.";
      console.error("gateway error", upstream.status, text);
      return new Response(JSON.stringify({ error: message }), { status: upstream.status, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const headers = new Headers(cors);
    headers.set("Content-Type", "text/event-stream");
    const runId = upstream.headers.get("X-Lovable-AIG-Run-ID");
    if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
    return new Response(upstream.body, { headers });
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: cors });
    console.error(e);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
