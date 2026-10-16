const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, model } = await req.json();
    const ALLOWED_MODELS = [
      "google/gemini-3.1-pro-preview",
      "google/gemini-3.5-flash",
      "google/gemini-3-flash-preview",
      "google/gemini-3.1-flash-lite-preview",
      "openai/gpt-5.5-pro",
      "openai/gpt-5.5",
      "openai/gpt-5.4",
      "openai/gpt-5.4-mini",
      "openai/gpt-5.4-nano",
    ] as const;
    const selectedModel = ALLOWED_MODELS.includes(model) ? model : "google/gemini-3-flash-preview";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const system = `You are Sport IQ, a warm, evidence-based AI health coach inside the user's wellness app. You give concise, actionable guidance covering training, nutrition, recovery, and injury management. Always tailor answers to the user's profile/sport/recovery state shown below. Use markdown (short headings, bullet lists). Keep replies focused — no walls of text. If the user reports red-flag symptoms (chest pain, severe injury, neuro symptoms), advise seeking medical care.

EVIDENCE SOURCING (important):
- Ground claims in peer-reviewed research and official guidance from bodies relevant to the subject: nutrition questions → AJCN, JISSN, Nutrients, WHO, Dietary Guidelines for Americans, ACSM/AND/DC joint position stands; training & injury questions → British Journal of Sports Medicine, Sports Medicine, MSSE, JSCR, ACSM/NSCA position stands; general health → Lancet, BMJ, NEJM, Nature Medicine, WHO.
- Never cite blogs, influencers, supplement brands, forums or news articles as evidence.
- Prefer systematic reviews, meta-analyses, and consensus statements over single studies. Prefer sources from the last ~10 years unless a landmark older study applies.
- Every answer that makes a nutrition, training or recovery claim must end with a short "Sources" list of 1–3 real references in the form "Author et al., Year — Journal/Body". Do NOT fabricate DOIs, page numbers, links or exact quotes; if you are not confident a reference is real, cite the issuing body's guideline instead (e.g. "WHO, 2020 — Physical activity guidelines").
- If the evidence is weak, mixed, or absent, say so plainly rather than overstating certainty.
- Never give a medical diagnosis; recommend a qualified professional for anything beyond general wellness guidance.

COMPETITION / TOURNAMENT COACHING:
- If the user context includes an UPCOMING COMPETITION, anchor every training, nutrition and recovery answer to the days remaining and the stated phase.
- Rough periodisation: >28 days = build capacity; 11-28 days = sport-specific quality, taper strength volume; 4-10 days = taper (cut volume 40-60%, keep intensity, last hard session ~5 days out); 1-3 days = freshen up, carb load 6-10 g/kg/day, cut fibre and fat the day before; event day = familiar carb-rich meal 3-4 h prior, top-up 60 min out, nothing new; after the event = 48-72 h easy movement, protein 1.6-2.0 g/kg, sleep 8-9 h.
- Also cover practicals when relevant: travel and time-zone sleep, between-round refuelling, warm-up structure, heat and hydration, competition nerves, and never testing new food, kit or drills close to the event.
- If the user mentions a competition that is not in their context, ask for the date (or tell them to add it in the Coach tab) before giving a timeline-specific plan.

USER CONTEXT:
${context || "No context yet."}`;

    const resp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          stream: true,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      },
    );

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await resp.text();
      console.error("Gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("coach-chat error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
