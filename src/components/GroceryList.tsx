import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { buildGroceryList, groceryListToText } from "@/lib/grocery";
import { allergenLabels, ALLERGEN_MAP } from "@/lib/allergies";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ShoppingBasket, ChevronDown, Copy, Download, Repeat2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const GroceryList = () => {
  const { store } = useStore();
  const profile = store.profile!;
  const allergies = store.healthBaseline?.allergies ?? [];
  const [days, setDays] = useState(1);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const list = useMemo(() => buildGroceryList(profile, allergies, days), [profile, allergies, days]);
  const labels = allergenLabels(allergies);

  const copy = async () => {
    await navigator.clipboard.writeText(groceryListToText(list, labels));
    toast.success("Grocery list copied");
  };

  const download = () => {
    const blob = new Blob([groceryListToText(list, labels)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grocery-list-${days === 1 ? "today" : `${days}-days`}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-2xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
            <ShoppingBasket className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display text-xl leading-tight">Grocery list</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {list.totalItems} items with quantities, built from your meal plan
              {labels.length ? ` and free from ${labels.join(", ").toLowerCase()}` : ""}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border/60 p-1">
          {[
            { d: 1, label: "Today" },
            { d: 3, label: "3 days" },
            { d: 7, label: "Week" },
          ].map((o) => (
            <button
              key={o.d}
              onClick={() => setDays(o.d)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                days === o.d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {labels.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {allergies.map((id) => (
            <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-soft/50 border border-primary/20 text-xs">
              <ShieldCheck className="h-3 w-3 text-primary" />
              No {ALLERGEN_MAP.get(id)?.label ?? id}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {list.categories.map((cat) => (
          <div key={cat.name}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{cat.name}</p>
            <ul className="space-y-1.5">
              {cat.items.map((item) => {
                const key = `${cat.name}-${item.name}`;
                return (
                  <li key={key} className="flex items-start gap-2.5">
                    <Checkbox
                      id={key}
                      checked={!!checked[key]}
                      onCheckedChange={(v) => setChecked((c) => ({ ...c, [key]: !!v }))}
                      className="mt-0.5"
                    />
                    <label htmlFor={key} className="flex-1 cursor-pointer">
                      <span className={`text-sm ${checked[key] ? "line-through text-muted-foreground" : "text-foreground/90"}`}>
                        {item.name}
                      </span>
                      <span className="text-sm text-muted-foreground"> · {item.qty} {item.unit}</span>
                      {item.swappedFrom && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-accent">
                          <Repeat2 className="h-3 w-3" /> instead of {item.swappedFrom.toLowerCase()}
                        </span>
                      )}
                      <span className="block text-[11px] text-muted-foreground/80">{item.usedIn.slice(0, 3).join(" · ")}{item.usedIn.length > 3 ? ` +${item.usedIn.length - 3}` : ""}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {list.swaps.length > 0 && (
        <Collapsible className="mt-5">
          <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl border border-border/50 bg-background/40 px-3 py-2 text-left transition-colors hover:bg-accent-soft/30">
            <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/80">
              <Repeat2 className="h-3.5 w-3.5 text-accent" />
              Substitutions made ({list.swaps.length})
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <ul className="space-y-1.5">
              {list.swaps.map((s) => (
                <li key={s.from} className="text-sm text-foreground/85">
                  <span className="text-muted-foreground line-through">{s.from}</span>
                  <span className="mx-2 text-accent">→</span>
                  <span>{s.to}</span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="mt-5 flex gap-2 flex-wrap">
        <Button onClick={copy} variant="outline" className="rounded-full">
          <Copy className="h-4 w-4 mr-1.5" /> Copy list
        </Button>
        <Button onClick={download} variant="outline" className="rounded-full">
          <Download className="h-4 w-4 mr-1.5" /> Download
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground mt-4 italic">
        Quantities are estimates for one person. Always check labels for hidden allergens and cross-contamination.
      </p>
    </Card>
  );
};
