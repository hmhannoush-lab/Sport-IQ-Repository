import { allergenLabels } from "@/lib/allergies";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useStore, localDateKey } from "@/lib/store";
import { SPORTS } from "@/lib/sports";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Send, Loader2, Trash2, BookOpen, ExternalLink, FileText, FileDown, HeartPulse } from "lucide-react";
import { downloadBibliographyCsv, printBibliographyPdf } from "@/lib/bibliography";
import { NUTRITION_SOURCES, TRAINING_SOURCES, getRecoveryCitations } from "@/lib/evidence";
import { tournamentContext } from "@/lib/tournament";
import { TournamentPlanner } from "@/components/TournamentPlanner";
import { toast } from "@/hooks/use-toast";

const COACH_SOURCES = [
  NUTRITION_SOURCES.acsmNutrition,
  NUTRITION_SOURCES.issnProtein,
  NUTRITION_SOURCES.whoHealthyDiet,
  TRAINING_SOURCES[0],
  TRAINING_SOURCES[2],
  TRAINING_SOURCES[3],
];

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Design my workout for today",
  "What should I eat to hit my macros?",
  "My right knee aches when squatting — what now?",
  "How should I taper for my next tournament?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`;

function buildContext(store: ReturnType<typeof useStore>["store"]) {
  const p = store.profile;
  if (!p) return "";
  const latestFatigue = store.fatigue[0];
  const sportLines = store.sports.map((sp) => {
    const info = SPORTS.find((s) => s.id === sp.sportId);
    return `- ${info?.name ?? sp.sportId} (${sp.level}, ${sp.sessionsPerWeek}x/wk)${sp.notes ? ` — ${sp.notes}` : ""}`;
  });
  const recentWorkouts = store.workouts.slice(0, 5).map(
    (w) => `- ${w.date}: ${w.type} ${w.durationMin}min @ ${w.intensity}`,
  );
  const allergyList = [
    ...allergenLabels(store.healthBaseline?.allergies ?? []),
    ...(store.healthBaseline?.allergyNotes?.trim() ? [store.healthBaseline.allergyNotes.trim()] : []),
  ];
  return [
    `Name: ${p.name}, ${p.age}y ${p.sex}, ${p.heightCm}cm/${p.weightKg}kg`,
    `Lifestyle: ${p.lifestyle}, Diet: ${p.diet}, Goal: ${p.goal}`,
    allergyList.length
      ? `ALLERGIES / INTOLERANCES (never suggest these foods): ${allergyList.join(", ")}`
      : "Allergies: none reported",
    sportLines.length ? `Sports:\n${sportLines.join("\n")}` : "Sports: none logged",
    tournamentContext(store.tournament),
    latestFatigue
      ? `Latest recovery: fatigue ${latestFatigue.fatigueLevel}/10, sleep ${latestFatigue.sleepQuality}/5, sore: ${latestFatigue.soreness.join(", ") || "none"}${latestFatigue.injuries ? `, injuries: ${latestFatigue.injuries}` : ""}`
      : "No recovery check-in yet",
    recentWorkouts.length ? `Recent workouts:\n${recentWorkouts.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

type ModelId =
  | "google/gemini-3.1-pro-preview"
  | "google/gemini-3.5-flash"
  | "google/gemini-3-flash-preview"
  | "google/gemini-3.1-flash-lite-preview"
  | "openai/gpt-5.5-pro"
  | "openai/gpt-5.5"
  | "openai/gpt-5.4"
  | "openai/gpt-5.4-mini"
  | "openai/gpt-5.4-nano";

type Tier = "Flagship" | "Balanced" | "Lightning";
const TIER_STYLES: Record<Tier, string> = {
  Flagship: "bg-primary/15 text-primary border-primary/30",
  Balanced: "bg-accent/20 text-foreground border-accent/40",
  Lightning: "bg-muted text-muted-foreground border-border",
};

type ModelInfo = {
  id: ModelId;
  label: string;
  provider: "Google" | "OpenAI";
  rank: number; // overall capability rank, 1 = best
  tier: Tier;
  speed: 1 | 2 | 3 | 4 | 5; // 5 = fastest
  reasoning: 1 | 2 | 3 | 4 | 5; // 5 = deepest
  cost: "$" | "$$" | "$$$";
  blurb: string;
  bestFor: string;
};

// Latest model from each family, ordered by overall capability.
const MODELS: ModelInfo[] = [
  { id: "openai/gpt-5.5-pro",                   label: "GPT-5.5 Pro",            provider: "OpenAI", rank: 1, tier: "Flagship",  speed: 1, reasoning: 5, cost: "$$$", blurb: "OpenAI's most capable model — premium extended reasoning for the hardest problems.", bestFor: "Long-horizon planning, intricate injury reasoning, nuanced nutrition." },
  { id: "openai/gpt-5.5",                       label: "GPT-5.5",                provider: "OpenAI", rank: 2, tier: "Flagship",  speed: 2, reasoning: 5, cost: "$$$", blurb: "State-of-the-art reasoning, coding and instruction following.", bestFor: "Multi-week training blocks, deep diet questions." },
  { id: "google/gemini-3.1-pro-preview",        label: "Gemini 3.1 Pro",         provider: "Google", rank: 3, tier: "Flagship",  speed: 2, reasoning: 5, cost: "$$$", blurb: "Google's newest flagship preview — huge context + strong multimodal reasoning.", bestFor: "Photos of meals or form, long check-in history." },
  { id: "openai/gpt-5.4",                       label: "GPT-5.4",                provider: "OpenAI", rank: 4, tier: "Flagship",  speed: 2, reasoning: 5, cost: "$$$", blurb: "Advanced reasoning model with adjustable depth — great at multi-step analysis.", bestFor: "Periodization, structured plans, tradeoffs." },
  { id: "openai/gpt-5.4-mini",                  label: "GPT-5.4 Mini",           provider: "OpenAI", rank: 5, tier: "Balanced",  speed: 4, reasoning: 4, cost: "$$",  blurb: "Smaller, faster GPT-5.4 — strong reasoning at lower cost.", bestFor: "Everyday coaching, quick plan tweaks." },
  { id: "google/gemini-3.5-flash",              label: "Gemini 3.5 Flash",       provider: "Google", rank: 6, tier: "Balanced",  speed: 5, reasoning: 4, cost: "$$",  blurb: "High-efficiency Gemini — fast coding, reasoning and agentic workflows.", bestFor: "Snappy multi-turn chat with solid depth." },
  { id: "google/gemini-3-flash-preview",        label: "Gemini 3 Flash",         provider: "Google", rank: 7, tier: "Balanced",  speed: 5, reasoning: 4, cost: "$$",  blurb: "Fast next-gen Flash preview — recommended default.", bestFor: "Best speed/quality tradeoff for daily use." },
  { id: "openai/gpt-5.4-nano",                  label: "GPT-5.4 Nano",           provider: "OpenAI", rank: 8, tier: "Lightning", speed: 5, reasoning: 3, cost: "$",   blurb: "Fastest and cheapest GPT-5.4 — built for speed-sensitive asks.", bestFor: "Quick lookups, short summaries." },
  { id: "google/gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite",  provider: "Google", rank: 9, tier: "Lightning", speed: 5, reasoning: 2, cost: "$",   blurb: "Cost-efficient preview — high-volume classification, summarization, extraction.", bestFor: "Tiny tasks, single-fact answers." },
];

const Dots = ({ value, color }: { value: number; color: string }) => (
  <span className="inline-flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        className={`h-1.5 w-1.5 rounded-full ${n <= value ? color : "bg-muted-foreground/20"}`}
      />
    ))}
  </span>
);

export const Coach = () => {
  const { store } = useStore();
  const latestFatigue = store.fatigue[0];
  const weekAgo = localDateKey(new Date(Date.now() - 7 * 864e5));
  const recoveryCitations = getRecoveryCitations({
    fatigueLevel: latestFatigue?.fatigueLevel,
    sleepQuality: latestFatigue?.sleepQuality,
    soreness: latestFatigue?.soreness,
    injuries: latestFatigue?.injuries,
    weeklySessions: store.workouts.filter((w) => w.date >= weekAgo).length,
  });
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<ModelId>("google/gemini-3-flash-preview");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, context: buildContext(store), model }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast({ title: "Slow down", description: "Too many requests — try again in a moment." });
        else if (resp.status === 402) toast({ title: "AI credits exhausted", description: "Add credits in Workspace settings." });
        else toast({ title: "Coach is unavailable", description: "Please try again." });
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages((m) => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: acc } : msg));
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Network error", description: "Couldn't reach the coach." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">AI Coach</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-tight">
            Ask <span className="text-gradient-sage italic">Sport IQ</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed">
            Your private coach for training, fueling, recovery and injuries — tuned to your profile, sports and latest check-in.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap w-full lg:w-auto">
          <Select value={model} onValueChange={(v) => setModel(v as ModelId)}>
            <SelectTrigger
              className="min-h-[44px] h-auto py-2 px-4 rounded-full w-full sm:w-[280px] text-sm"
              title="Choose AI model"
              aria-label="Choose AI model"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-[min(92vw,360px)]">
              {MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs py-3">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-muted-foreground tabular-nums w-5">#{m.rank}</span>
                      <span className="font-medium">{m.label}</span>
                      <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${TIER_STYLES[m.tier]}`}>
                        {m.tier}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{m.provider}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-snug">{m.blurb}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">Reason <Dots value={m.reasoning} color="bg-primary" /></span>
                      <span className="flex items-center gap-1">Speed <Dots value={m.speed} color="bg-accent-foreground/60" /></span>
                    </div>
                    <p className="text-[10px] italic text-muted-foreground/80">Best for: {m.bestFor}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessages([])}
              className="rounded-full min-h-[44px] px-4"
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>

      </div>

      <TournamentPlanner onAsk={send} />

      <Card className="border-border/50 shadow-card overflow-hidden flex flex-col h-[60vh] min-h-[420px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-8">
              <div className="h-14 w-14 rounded-2xl bg-sage flex items-center justify-center shadow-glow">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="text-muted-foreground max-w-sm">
                Try one of these, or ask anything about your training, diet, recovery or injuries.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-sm p-3 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-muted/40 transition-zen"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-sage text-primary-foreground shadow-glow"
                      : "bg-muted/50 text-foreground"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-foreground">
                      {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <Loader2 className="h-4 w-4 animate-spin opacity-60" />}
                      {m.content && (
                        <p className="mt-3 pt-2 border-t border-border/40 text-[10px] text-muted-foreground italic">
                          AI is not a doctor. For medical advice, please consult a qualified healthcare professional.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border/60 p-3 sm:p-4 bg-background/50">
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex gap-2 items-end"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask your coach…"
              rows={1}
              className="resize-none min-h-[44px] max-h-32 rounded-xl"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()} size="icon" className="rounded-xl h-11 w-11 shrink-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>

      <Card className="p-5 border-border/50 shadow-card rounded-2xl bg-card/80">
        <div className="flex items-start gap-3">
          <HeartPulse className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base">Evidence behind your fatigue & injury advice</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {latestFatigue
                ? `Based on your latest check-in (fatigue ${latestFatigue.fatigueLevel}/10, sleep ${latestFatigue.sleepQuality}/5). Each rule below links to the research it comes from.`
                : "No recovery check-in yet — these are the baseline prevention rules and their sources."}
            </p>
            <ul className="mt-3 space-y-3">
              {recoveryCitations.map((c) => (
                <li key={c.advice} className="rounded-xl bg-muted/30 border border-border/40 p-3">
                  <p className="text-sm text-foreground/90 leading-snug">{c.advice}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    {c.sources.map((s) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.citation}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                      >
                        {s.label}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>


      <Card className="p-5 border-border/50 shadow-card rounded-2xl bg-card/80">
        <div className="flex items-start gap-3">
          <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base">Sources your coach draws on</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Answers are grounded in peer-reviewed sports-medicine and nutrition literature and official
              guidance — the coach cites its references at the end of each answer.
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
              {COACH_SOURCES.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.citation}
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  {s.label}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => printBibliographyPdf()}>
                <FileText className="h-3.5 w-3.5" /> Bibliography PDF
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => downloadBibliographyCsv()}>
                <FileDown className="h-3.5 w-3.5" /> CSV
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>

  );
};
