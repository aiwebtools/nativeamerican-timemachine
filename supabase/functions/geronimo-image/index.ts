const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { scene } = await req.json();
    if (!scene || typeof scene !== "string") return json({ error: "scene required" }, 400);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured" }, 401);

    const prompt = `Photorealistic 4K cinematic 16:9 wide landscape photograph of the surroundings described in this historically accurate Native American time-travel scene. Authentic period details, natural light, no text, no copyrighted characters.\n\nScene:\n${scene.slice(0, 2500)}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai/gpt-image-2.5-sunburst", prompt, size: "1536x1024", n: 1 }),
    });
    if (!r.ok) {
      console.error("image error", r.status, await r.text());
      const msg = r.status === 429 ? "Too many requests — try again shortly." : r.status === 402 ? "Out of AI credits." : "Could not paint the vision.";
      return json({ error: msg }, r.status);
    }
    const data = await r.json();
    const item = data?.data?.[0];
    const url = item?.b64_json ? `data:image/png;base64,${item.b64_json}` : item?.url;
    if (!url) return json({ error: "No image returned" }, 502);
    return json({ image: url });
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong" }, 500);
  }
});
