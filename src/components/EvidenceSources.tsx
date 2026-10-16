import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getBibliography, downloadBibliographyCsv, printBibliographyPdf } from "@/lib/bibliography";
import { BookOpen, Brain, Salad, Activity, ExternalLink, FileDown, FileText } from "lucide-react";

interface Insight {
  icon: typeof Brain;
  tag: string;
  headline: string;
  takeaway: string;
  appliedHere: string;
  planSummary?: string;
  citation: string;
  url: string;
  pros?: string[];
}

const insights: Insight[] = [
  {
    icon: Salad,
    tag: "Nutrition",
    headline: "Minimally processed, plant-predominant eating wins across diet wars",
    takeaway:
      "After reviewing decades of trials (Mediterranean, DASH, low-carb, vegan, paleo), the authors conclude no single diet is provably superior — but every pattern with strong health evidence overlaps on one rule: foods close to nature, mostly plants, minimal ultra-processing.",
    appliedHere:
      "Your nutrition focus and meal plan default to whole foods, fiber-rich plants, and lean protein scaling — not a fad macro split.",
    planSummary:
      "Build each meal around vegetables, whole grains and lean protein; limit packaged snacks and sugary drinks; adjust portion size to your training day, not a rigid diet label.",
    citation:
      "Katz, D.L. & Meller, S. (2014). Can We Say What Diet Is Best for Health? Annual Review of Public Health, 35:83–103.",
    url: "https://doi.org/10.1146/annurev-publhealth-032013-182351",
    pros: [
      "Synthesises 200+ studies across competing diet camps instead of championing one",
      "Verdict is pattern-based, not a rigid macro prescription, so it ages well",
      "Published in a peer-reviewed Annual Review journal with transparent methods",
      "Overlap conclusion has since been reinforced by PREDIMED, EAT-Lancet and 2023 BMJ umbrella reviews",
    ],
  },
  {
    icon: Activity,
    tag: "Injury prevention",
    headline: "AI + self-reported load reliably flags rising injury risk",
    takeaway:
      "Recent review of ML in sports medicine (Random Forest, SVM, KNN on training load, fatigue, soreness and biomechanics) shows that combining subjective wellness scores with workload trends predicts soft-tissue injury better than either signal alone.",
    appliedHere:
      "Your fatigue + soreness + 7-day workout volume feed a rules engine that down-shifts intensity (Amber/Red) the moment load and recovery diverge — the same signals these models rely on.",
    citation:
      "Musat, C.L. et al. (2024). Diagnostic Applications of AI in Sports: A Comprehensive Review of Injury Risk Prediction Methods. Diagnostics, 14(22):2516.",
    url: "https://doi.org/10.3390/diagnostics14222516",
  },
  {
    icon: Brain,
    tag: "Health AI",
    headline: "Trustworthy health AI must stay transparent and human-in-the-loop",
    takeaway:
      "A 2-year review of medical AI in Nature Medicine stresses that the most useful systems are interpretable, explain their reasoning, and assist rather than replace clinical judgement — especially when training data is scarce or biased.",
    appliedHere:
      "Every recommendation in this app is rule-based and shows the signals it used (fatigue, soreness, sleep, load). No black-box scores — you can audit why each tip appeared.",
    citation:
      "Rajpurkar, P., Chen, E., Banerjee, O. & Topol, E.J. (2022). AI in health and medicine. Nature Medicine, 28:31–38.",
    url: "https://doi.org/10.1038/s41591-021-01614-0",
  },
  {
    icon: BookOpen,
    tag: "Sport tech",
    headline: "Wearable & app-based tracking changes athlete behaviour, not just data",
    takeaway:
      "Ratten's analysis of sports technology adoption shows that the value of fitness tech comes less from the sensor and more from how feedback loops nudge daily decisions — hydration, sleep timing, session intensity.",
    appliedHere:
      "Daily check-ins, sparkline trends, hydration quick-adds and a single 'Log today' form are designed as behavioural nudges, not passive dashboards.",
    citation:
      "Ratten, V. (2019). Sports Technology and Innovation: Assessing Cultural and Social Factors. Palgrave Macmillan.",
    url: "https://doi.org/10.1007/978-3-319-75046-0",
  },
];

export const EvidenceSources = () => {
  const bib = getBibliography();

  const exportCsv = () => {
    downloadBibliographyCsv(bib);
    toast({ title: "Bibliography exported", description: `${bib.length} sources saved as CSV.` });
  };

  const exportPdf = () => {
    const ok = printBibliographyPdf(bib);
    if (!ok) {
      toast({
        title: "Pop-up blocked",
        description: "Allow pop-ups for this site to export the PDF, or use the CSV export.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Print view opened", description: "Choose “Save as PDF” in the print dialog." });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Evidence base</p>
        <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-tight">
          The science <span className="text-gradient-sage italic">behind</span> your plan
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
          Every recommendation engine in this app is grounded in peer-reviewed research on nutrition,
          sports injury prediction, medical AI and sport-tech adoption. Here's what we drew from and how it
          shows up in your daily plan.
        </p>
      </div>

      <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div>
            <h3 className="font-display text-lg mb-1">Export the full bibliography</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All {bib.length} references behind your training, diet and recovery plans — with citations and links.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button onClick={exportPdf} className="gap-2">
              <FileText className="h-4 w-4" /> PDF
            </Button>
            <Button onClick={exportCsv} variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" /> CSV
            </Button>
          </div>
        </div>
      </Card>



      <div className="grid gap-4 md:grid-cols-2">
        {insights.map((it) => {
          const Icon = it.icon;
          return (
            <Card
              key={it.citation}
              className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm flex flex-col gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-2xl bg-primary-soft flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <Badge className="bg-primary text-primary-foreground border-0 uppercase text-[10px] tracking-wider mb-2">
                    {it.tag}
                  </Badge>
                  <h3 className="font-display text-lg sm:text-xl leading-snug text-foreground">
                    {it.headline}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed">{it.takeaway}</p>

              <div className="rounded-2xl bg-muted/30 border border-border/40 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  How it shapes this app
                </p>
                <p className="text-sm text-foreground/90 italic leading-relaxed">{it.appliedHere}</p>
              </div>

              {it.planSummary && (
                <div className="rounded-2xl bg-accent-soft/40 border border-accent/20 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-accent-foreground mb-1">
                    What this means for your plan
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed">{it.planSummary}</p>
                </div>
              )}

              {it.pros && it.pros.length > 0 && (
                <div className="rounded-2xl bg-primary-soft/30 border border-primary/20 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-primary mb-2">Strengths</p>
                  <ul className="space-y-1.5">
                    {it.pros.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground/90">
                        <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto pt-2 border-t border-border/40">
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{it.citation}</p>
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  View source
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-accent-soft/40">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-accent mt-1 shrink-0" />
          <div>
            <h3 className="font-display text-lg mb-1">A note on what this app is — and isn't</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">
              These tools translate published guidance into a daily plan. They are not a medical
              device and do not replace advice from a qualified clinician, dietitian or sports
              physiotherapist — particularly if you're managing an injury or chronic condition.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
