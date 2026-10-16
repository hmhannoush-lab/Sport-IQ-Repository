import { todayKey } from "./store";
import { NUTRITION_SOURCES, TRAINING_SOURCES, RECOVERY_SOURCES, type Source } from "@/lib/evidence";

export interface BibEntry extends Source {
  category: "Nutrition & diet plan" | "Training & injury prevention" | "Health AI & behaviour";
}

const APP_RESEARCH: BibEntry[] = [
  {
    category: "Nutrition & diet plan",
    label: "Diet-pattern review",
    citation:
      "Katz, D.L. & Meller, S. (2014). Can We Say What Diet Is Best for Health? Annual Review of Public Health, 35:83–103.",
    url: "https://doi.org/10.1146/annurev-publhealth-032013-182351",
  },
  {
    category: "Training & injury prevention",
    label: "ML injury-risk prediction",
    citation:
      "Musat, C.L. et al. (2024). Diagnostic Applications of AI in Sports: A Comprehensive Review of Injury Risk Prediction Methods. Diagnostics, 14(22):2516.",
    url: "https://doi.org/10.3390/diagnostics14222516",
  },
  {
    category: "Health AI & behaviour",
    label: "AI in health and medicine",
    citation:
      "Rajpurkar, P., Chen, E., Banerjee, O. & Topol, E.J. (2022). AI in health and medicine. Nature Medicine, 28:31–38.",
    url: "https://doi.org/10.1038/s41591-021-01614-0",
  },
  {
    category: "Health AI & behaviour",
    label: "Sports technology adoption",
    citation:
      "Ratten, V. (2019). Sports Technology and Innovation: Assessing Cultural and Social Factors. Palgrave Macmillan.",
    url: "https://doi.org/10.1007/978-3-319-75046-0",
  },
];

/** Every source the app's diet, training and coaching guidance is built on. */
export function getBibliography(): BibEntry[] {
  const nutrition: BibEntry[] = Object.values(NUTRITION_SOURCES).map((s) => ({
    ...s,
    category: "Nutrition & diet plan" as const,
  }));
  const training: BibEntry[] = TRAINING_SOURCES.map((s) => ({
    ...s,
    category: "Training & injury prevention" as const,
  }));
  const recovery: BibEntry[] = Object.values(RECOVERY_SOURCES).map((s) => ({
    ...s,
    category: "Training & injury prevention" as const,
  }));
  const all = [...nutrition, ...training, ...recovery, ...APP_RESEARCH];
  const seen = new Set<string>();
  return all.filter((e) => (seen.has(e.url) ? false : (seen.add(e.url), true)));
}

function csvCell(v: string) {
  return `"${v.replace(/"/g, '""')}"`;
}

export function bibliographyCsv(entries = getBibliography()): string {
  const rows = [
    ["Category", "Label", "Citation", "URL"],
    ...entries.map((e) => [e.category, e.label, e.citation, e.url]),
  ];
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export function downloadBibliographyCsv(entries = getBibliography()) {
  const blob = new Blob([`\uFEFF${bibliographyCsv(entries)}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sport-iq-bibliography-${todayKey()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Opens a print-ready page — the browser's "Save as PDF" produces the file. */
export function printBibliographyPdf(entries = getBibliography()) {
  const date = new Date().toLocaleDateString();
  const categories = [...new Set(entries.map((e) => e.category))];
  const body = categories
    .map((cat) => {
      const items = entries
        .filter((e) => e.category === cat)
        .map(
          (e) =>
            `<li><span class="cite">${esc(e.citation)}</span><br/><a href="${esc(e.url)}">${esc(e.url)}</a></li>`,
        )
        .join("");
      return `<h2>${esc(cat)}</h2><ol>${items}</ol>`;
    })
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"/>
<title>Sport IQ — Bibliography</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;color:#1b1b1b;margin:40px;line-height:1.5}
  h1{font-size:24px;margin-bottom:4px}
  .sub{color:#555;font-size:12px;margin-bottom:24px}
  h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;margin-top:28px;border-bottom:1px solid #ccc;padding-bottom:4px}
  ol{padding-left:20px}
  li{margin-bottom:10px;font-size:12.5px}
  a{color:#0f766e;word-break:break-all;font-size:11.5px}
  .note{margin-top:32px;font-size:11px;color:#555;border-top:1px solid #ccc;padding-top:10px}
  @media print{ @page{margin:18mm} }
</style></head><body>
<h1>Sport IQ — Evidence bibliography</h1>
<div class="sub">Sources behind your training, diet and recovery plans · exported ${esc(date)} · ${entries.length} references</div>
${body}
<p class="note">These references support general wellness guidance and are not a substitute for advice from a qualified clinician, dietitian or sports physiotherapist.</p>
<script>window.onload=function(){window.print()}</script>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}
