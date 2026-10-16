import { useStore } from "@/lib/store";
import { calcMacros, getWeekMealPlan, dietGuidance } from "@/lib/health";
import { getRecipe, getMealNutrition, getWhyItMatters, getMacroPresence } from "@/lib/recipes";
import { getMealSources, PLAN_SOURCES } from "@/lib/evidence";
import { substituteForAllergies, allergenLabels, ALLERGEN_MAP } from "@/lib/allergies";
import { GroceryList } from "@/components/GroceryList";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UtensilsCrossed, Sparkles, ChefHat, Clock, ChevronDown, HeartPulse, Flame, MessageSquare, ShieldCheck, BookOpen, ExternalLink } from "lucide-react";

export const Diet = () => {
  const { store } = useStore();
  const profile = store.profile!;
  const allergies = store.healthBaseline?.allergies ?? [];
  const allergyNotes = store.healthBaseline?.allergyNotes ?? "";
  const macros = calcMacros(profile);
  const week = getWeekMealPlan(profile, allergies);
  const tips = dietGuidance(profile, store.sports, allergies, allergyNotes);


  return (
    <div className="space-y-7 animate-fade-up">
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Nourishment</p>
        <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-tight">Your daily <span className="text-gradient-warm italic">plan</span></h2>
        <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed">
          Tailored to your <span className="text-foreground font-medium">{profile.lifestyle}</span> lifestyle, <span className="text-foreground font-medium">{profile.diet}</span> diet and goal to <span className="text-foreground font-medium">{profile.goal === "maintain" ? "maintain" : profile.goal}</span>.
        </p>
      </div>

      <Card className="relative p-6 sm:p-7 bg-sage text-primary-foreground border-0 shadow-lift overflow-hidden rounded-2xl">
        <div aria-hidden className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative flex items-baseline justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] opacity-80">Daily target</p>
            <p className="font-display text-5xl mt-1 tracking-tight">{macros.calories.toLocaleString()} <span className="text-lg opacity-80 font-sans">kcal</span></p>
          </div>
          <div className="flex gap-6">
            <div><p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Protein</p><p className="font-display text-2xl">{macros.proteinG}g</p></div>
            <div><p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Carbs</p><p className="font-display text-2xl">{macros.carbG}g</p></div>
            <div><p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Fat</p><p className="font-display text-2xl">{macros.fatG}g</p></div>
          </div>
        </div>
      </Card>

      {(allergies.length > 0 || allergyNotes.trim()) && (
        <Card className="p-5 border-border/50 shadow-card rounded-2xl bg-highlight/20">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg leading-tight">Allergy-safe plan</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Every meal, recipe and ingredient below is adjusted to avoid what you told us at sign-up.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {allergies.map((id) => (
                  <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/70 border border-border/50 text-xs">
                    <span>{ALLERGEN_MAP.get(id)?.emoji ?? "⚠️"}</span>
                    <span className="text-foreground/90">No {ALLERGEN_MAP.get(id)?.label ?? id}</span>
                  </span>
                ))}
                {allergyNotes.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/70 border border-border/50 text-xs">
                    ⚠️ <span className="text-foreground/90">{allergyNotes.trim()}</span>
                  </span>
                )}
              </div>
              {allergenLabels(allergies).length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-3 italic">
                  Always double-check packaged foods — cross-contamination isn't visible in a recipe.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {week
          .filter((day) => day.isToday)
          .map((day) => (
            <div key={day.dayLabel + day.dateLabel} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-2xl text-foreground tracking-tight">
                  {day.dayLabel}
                  <span className="ml-2 text-[10px] uppercase tracking-[0.25em] text-accent align-middle">Today</span>
                </h3>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{day.dateLabel}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {day.meals.map((m) => {
                  const baseRecipe = getRecipe(m);
                  const recipe = allergies.length
                    ? {
                        ...baseRecipe,
                        ingredients: baseRecipe.ingredients.map((i) => substituteForAllergies(i, allergies)),
                        steps: baseRecipe.steps.map((s) => substituteForAllergies(s, allergies)),
                      }
                    : baseRecipe;
                  const nutrition = getMealNutrition(m, profile);
                  const importance = getWhyItMatters(m);
                  const macroTags = getMacroPresence(m, nutrition);
                  const levelStyles: Record<string, string> = {
                    high: "bg-primary text-primary-foreground border-primary",
                    moderate: "bg-highlight/50 text-foreground border-highlight",
                    low: "bg-muted/40 text-muted-foreground border-border",
                  };
                  return (
                  <Card key={day.dayLabel + m.meal} className="p-5 border-border/50 shadow-card transition-zen hover:shadow-soft hover:-translate-y-0.5 ring-1 ring-accent/40">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-9 w-9 rounded-xl bg-primary-soft flex items-center justify-center">
                        <UtensilsCrossed className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">{m.meal}</span>
                    </div>
                    <h4 className="font-display text-xl text-foreground mb-2">{m.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>

                    {/* Macro presence chips */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {macroTags.map((t) => (
                        <span
                          key={t.label}
                          title={t.note}
                          className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-medium ${levelStyles[t.level]}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {t.label}: {t.level}
                        </span>
                      ))}
                    </div>


                    {/* Why it matters */}
                    <div className="mt-4 rounded-xl bg-primary-soft/40 border border-primary/20 p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <HeartPulse className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-primary/90">Why it matters</span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed mb-2">{importance.why}</p>
                      <ul className="space-y-1">
                        {importance.benefits.map((b, i) => (
                          <li key={i} className="flex gap-2 text-xs text-foreground/80">
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 pt-2 border-t border-primary/15">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Evidence</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {getMealSources(`${m.title} ${m.desc}`).map((s) => (
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
                      </div>
                    </div>


                    {/* Nutrition facts */}
                    <div className="mt-3 rounded-xl border border-border/50 bg-background/40 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Flame className="h-3.5 w-3.5 text-accent" />
                          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Nutrition facts</span>
                        </div>
                        <span className="font-display text-sm tracking-tight text-foreground">{nutrition.calories} kcal</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                          { label: "Protein", value: `${nutrition.proteinG}g` },
                          { label: "Carbs", value: `${nutrition.carbG}g` },
                          { label: "Fat", value: `${nutrition.fatG}g` },
                          { label: "Fiber", value: `${nutrition.fiberG}g` },
                        ].map((n) => (
                          <div key={n.label} className="rounded-lg bg-muted/30 py-1.5">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{n.label}</p>
                            <p className="font-display text-sm text-foreground">{n.value}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 italic">Estimated from your {calcMacros(profile).calories.toLocaleString()} kcal daily target.</p>
                    </div>


                    <Collapsible className="mt-4">
                      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl border border-border/50 bg-background/40 px-3 py-2 text-left transition-colors hover:bg-accent-soft/30">
                        <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/80">
                          <ChefHat className="h-3.5 w-3.5 text-accent" />
                          Recipe
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground normal-case tracking-normal">
                            <Clock className="h-3 w-3" />
                            {recipe.timeMin} min
                          </span>
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-3 space-y-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Ingredients · serves {recipe.servings}</p>
                          <ul className="grid grid-cols-1 gap-1">
                            {recipe.ingredients.map((ing, i) => (
                              <li key={i} className="flex gap-2 text-sm text-foreground/90">
                                <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                                <span>{ing}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Method</p>
                          <ol className="space-y-1.5">
                            {recipe.steps.map((s, i) => (
                              <li key={i} className="flex gap-2 text-sm text-foreground/90 leading-relaxed">
                                <span className="font-display text-xs text-accent shrink-0 w-4">{i + 1}.</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      <GroceryList />

      {/* Personalization CTA */}
      <Card className="p-5 sm:p-6 border-border/50 shadow-card bg-primary-soft/40 rounded-2xl">
        <div className="flex items-start gap-3 flex-wrap justify-between">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg leading-tight">Want a different menu?</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Chat with the AI coach to swap meals, add allergies, hit a specific macro, or plan around today's training.
              </p>
            </div>
          </div>
          <Button
            onClick={() => window.dispatchEvent(new CustomEvent("sport-iq:goto-tab", { detail: { tab: "coach" } }))}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
          >
            <Sparkles className="h-4 w-4 mr-1.5" /> Personalize with Coach
          </Button>
        </div>
      </Card>

      <Card className="p-5 border-border/50 shadow-card bg-accent-soft/40">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="font-display text-xl">Guidance for you</h3>
        </div>
        <ul className="space-y-2">
          {tips.map((t, i) => (
            <li key={i} className="flex gap-3 text-sm text-foreground/90 leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </Card>

      {/* Evidence behind this plan */}
      <Card className="p-5 border-border/50 shadow-card rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="font-display text-xl">Where this plan comes from</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Calorie and macro targets, meal structure and hydration advice follow public-health
          dietary guidance and peer-reviewed sports-nutrition position stands — not diet trends.
        </p>
        <ul className="space-y-3">
          {PLAN_SOURCES.map((s) => (
            <li key={s.url} className="text-xs leading-relaxed">
              <p className="text-muted-foreground">{s.citation}</p>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline mt-0.5"
              >
                {s.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          ))}
        </ul>
      </Card>

    </div>
  );
};
