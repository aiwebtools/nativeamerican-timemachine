import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Plus, Send, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string; image?: string; imageLoading?: boolean; imageError?: string };
type Journey = { id: string; title: string; messages: Msg[]; updatedAt: number };

const KEY = "geronimo-journeys-v1";
const BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GREETING =
  "🌈🦅 **Great Spirit! Traveler, what date would you like to teleport to, & which tribal land or region do you wish to walk upon?**";

const newJourney = (): Journey => ({
  id: crypto.randomUUID(),
  title: "New Journey",
  messages: [{ role: "assistant", content: GREETING }],
  updatedAt: Date.now(),
});

const load = (): Journey[] => {
  try {
    const j = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(j) && j.length ? j : [newJourney()];
  } catch {
    return [newJourney()];
  }
};

const save = (js: Journey[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(js));
  } catch {
    // Storage full: drop images from older journeys and retry
    const slim = js.map((j, i) => (i === 0 ? j : { ...j, messages: j.messages.map(({ image, ...m }) => m) }));
    try { localStorage.setItem(KEY, JSON.stringify(slim)); } catch { /* ignore */ }
  }
};

const TimePortal: React.FC = () => {
  const [journeys, setJourneys] = useState<Journey[]>(load);
  const [activeId, setActiveId] = useState(() => journeys[0].id);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const active = journeys.find((j) => j.id === activeId) ?? journeys[0];

  useEffect(() => save(journeys), [journeys]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [active.messages]);

  const update = (id: string, fn: (msgs: Msg[]) => Msg[], title?: string) =>
    setJourneys((prev) =>
      [...prev.map((j) => (j.id === id ? { ...j, messages: fn(j.messages), title: title ?? j.title, updatedAt: Date.now() } : j))]
        .sort((a, b) => b.updatedAt - a.updatedAt)
    );

  const paint = async (id: string, index: number, scene: string) => {
    update(id, (m) => m.map((x, i) => (i === index ? { ...x, imageLoading: true, imageError: undefined } : x)));
    try {
      const r = await fetch(`${BASE}/functions/v1/geronimo-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ scene }),
      });
      const d = await r.json();
      if (!r.ok || !d.image) throw new Error(d.error || "Could not paint the vision.");
      update(id, (m) => m.map((x, i) => (i === index ? { ...x, image: d.image, imageLoading: false } : x)));
    } catch (e) {
      update(id, (m) => m.map((x, i) => (i === index ? { ...x, imageLoading: false, imageError: (e as Error).message } : x)));
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const id = active.id;
    const history: Msg[] = [...active.messages, { role: "user", content: text }];
    const assistantIndex = history.length;
    setInput("");
    setBusy(true);
    update(id, () => [...history, { role: "assistant", content: "" }], active.title === "New Journey" ? text.slice(0, 40) : undefined);

    let full = "";
    try {
      const r = await fetch(`${BASE}/functions/v1/geronimo-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      if (!r.ok || !r.body) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || "The time portal is unavailable right now.");
      }
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const ev = JSON.parse(payload);
            if (ev.type === "response.output_text.delta" && ev.delta) {
              full += ev.delta;
              const snapshot = full;
              update(id, (m) => m.map((x, i) => (i === assistantIndex ? { ...x, content: snapshot } : x)));
            } else if (ev.type === "response.failed" || ev.type === "error") {
              throw new Error(ev.response?.error?.message || ev.message || "The vision was interrupted.");
            }
          } catch (err) {
            if (err instanceof SyntaxError) continue;
            throw err;
          }
        }
      }
      if (!full) throw new Error("Geronimo was silent. Please try again.");
    } catch (e) {
      update(id, (m) => m.map((x, i) => (i === assistantIndex ? { ...x, content: full + `\n\n⚠️ ${(e as Error).message}` } : x)));
      setBusy(false);
      return;
    }
    setBusy(false);
    // Paint the surroundings automatically after long stories
    if (full.length > 600) paint(id, assistantIndex, full);
  };

  const startNew = () => {
    const j = newJourney();
    setJourneys((p) => [j, ...p]);
    setActiveId(j.id);
  };
  const remove = (id: string) => {
    setJourneys((p) => {
      const rest = p.filter((j) => j.id !== id);
      const next = rest.length ? rest : [newJourney()];
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  return (
    <section id="time-portal" aria-label="Native American history time portal" className="relative pt-6 pb-12 md:pt-8 md:pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-3">
          <span className="rainbow-text-glow">Native American History Time Machine GPT</span>
        </h1>
        <p className="text-center text-light-gray/80 mb-5 max-w-2xl mx-auto">
          Geronimo, Chief of Rainbow Apache Destiny
        </p>

        <div className="cyberpunk-card rainbow-dreamcatcher-border portal-workspace flex flex-col md:flex-row overflow-hidden bg-black/70">
          {/* Journeys list */}
          <aside className="md:w-60 border-b md:border-b-0 md:border-r border-primary-purple/30 p-3 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0">
            <button onClick={startNew} className="rainbow-button-glow text-white rounded-md px-3 py-2 text-sm font-semibold flex items-center gap-2 shrink-0">
              <Plus size={16} /> New Journey
            </button>
            {journeys.map((j) => (
              <div
                key={j.id}
                className={cn(
                  "group flex items-center gap-1 rounded-md px-2 py-2 text-sm cursor-pointer shrink-0 max-w-[200px] md:max-w-none",
                  j.id === active.id ? "bg-primary-purple/25 text-white" : "text-light-gray/80 hover:bg-primary-purple/10"
                )}
                onClick={() => setActiveId(j.id)}
              >
                <span className="truncate flex-1">{j.title}</span>
                <button aria-label="Delete journey" onClick={(e) => { e.stopPropagation(); remove(j.id); }} className="opacity-60 hover:opacity-100">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </aside>

          {/* Conversation */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {active.messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-full md:max-w-[85%]", m.role === "user" ? "bg-primary-purple/30 border border-primary-purple/50 text-white rounded-2xl px-4 py-2" : "text-light-gray")}>
                    {m.role === "assistant" && <div className="text-xs font-bold rainbow-text mb-1">🪶 Geronimo</div>}
                    {m.content ? (
                      <div className="prose prose-invert max-w-none text-light-gray prose-p:leading-relaxed">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-light-gray/70 italic"><Loader2 className="animate-spin" size={16} /> Initiating sacred time teleporting sequence…</div>
                    )}
                    {m.imageLoading && (
                      <div className="mt-4 aspect-video w-full rounded-lg border border-primary-purple/40 bg-primary-purple/10 flex items-center justify-center gap-2 text-light-gray/80 animate-pulse">
                        <ImageIcon size={18} /> Painting a vision of your surroundings…
                      </div>
                    )}
                    {m.image && (
                      <a href={m.image} download="time-portal-vision.png" target="_blank" rel="noreferrer">
                        <img src={m.image} alt="Painted vision of the surroundings" className="mt-4 w-full aspect-video object-cover rounded-lg border border-primary-purple/40" />
                      </a>
                    )}
                    {m.imageError && (
                      <button onClick={() => paint(active.id, i, m.content)} className="mt-3 text-sm text-primary-purple underline">
                        {m.imageError} Try painting again
                      </button>
                    )}
                    {m.role === "assistant" && i > 0 && m.content && !m.image && !m.imageLoading && !m.imageError && !busy && (
                      <button onClick={() => paint(active.id, i, m.content)} className="mt-3 text-xs text-primary-purple flex items-center gap-1 hover:underline">
                        <ImageIcon size={14} /> Paint this scene
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-primary-purple/30 p-3 flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={2}
                aria-label="Time travel destination or message"
                placeholder="e.g. 1876, Black Hills — Lakota lands…"
                className="flex-1 resize-none rounded-md bg-black/60 border border-primary-purple/40 px-3 py-2 text-white placeholder:text-light-gray/50 focus:outline-none focus:border-primary-purple"
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="rainbow-button-glow text-white rounded-md h-11 w-11 flex items-center justify-center shrink-0 disabled:opacity-50">
                {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>
        <p className="text-center text-xs text-light-gray/60 mt-3">For informational, educational, and research purposes only. Journeys are saved on this device.</p>
      </div>
    </section>
  );
};

export default TimePortal;
