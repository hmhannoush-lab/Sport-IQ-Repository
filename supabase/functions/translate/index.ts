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
    const { texts, target } = await req.json();
    if (!Array.isArray(texts) || typeof target !== "string") {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (texts.length === 0) {
      return new Response(JSON.stringify({ translations: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LANG_NAMES: Record<string, string> = {
      en: "English", es: "Spanish", fr: "French", de: "German",
      it: "Italian", pt: "Portuguese", nl: "Dutch", sv: "Swedish",
      ja: "Japanese", zh: "Simplified Chinese", ko: "Korean", ar: "Arabic",
    };
    const langName = LANG_NAMES[target] ?? target;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const system = `You are a professional UI translator for a wellness/sports app. Translate each string from English to ${langName}. Preserve placeholders like {name}, numbers, units (kg, km, kcal, bpm), emoji, and casing style. Keep translations concise — UI strings, not prose. Return ONLY a JSON array of strings in the same order, no commentary.`;

    const userMsg = JSON.stringify(texts);

    const resp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      return new Response(JSON.stringify({ error: t }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "[]";

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      const m = content.match(/\[[\s\S]*\]/);
      parsed = m ? JSON.parse(m[0]) : [];
    }

    let translations: string[] = [];
    if (Array.isArray(parsed)) {
      translations = parsed.map(String);
    } else if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      const arr = obj.translations ?? obj.result ?? obj.items ?? Object.values(obj)[0];
      if (Array.isArray(arr)) translations = arr.map(String);
    }

    // Fallback: pad to length with originals
    if (translations.length !== texts.length) {
      const padded = texts.map((t: string, i: number) => translations[i] ?? t);
      translations = padded;
    }

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
