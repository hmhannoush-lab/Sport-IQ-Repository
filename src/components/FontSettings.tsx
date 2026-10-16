import { useFontPrefs } from "@/hooks/use-font-prefs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Type, RotateCcw } from "lucide-react";
import { loadFont } from "@/lib/fonts";
import { useEffect } from "react";

export const FontSettings = () => {
  const { prefs, setHeading, setBody, setScale, reset, fonts } = useFontPrefs();

  // Preload all font samples so the picker previews render in their actual face.
  useEffect(() => {
    fonts.forEach(loadFont);
  }, [fonts]);

  const headingChoices = fonts.filter((f) => f.category !== "body");
  const bodyChoices = fonts.filter((f) => f.category !== "display");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-full" aria-label="Font settings">
          <Type className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Fonts</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg">Typography</h3>
          <Button variant="ghost" size="sm" onClick={reset} className="h-7 px-2 text-xs rounded-full">
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Headings</Label>
            <div className="mt-2 grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {headingChoices.map((f) => {
                const active = prefs.headingId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setHeading(f.id)}
                    className={`text-left px-3 py-2 rounded-xl border transition-zen text-sm ${
                      active
                        ? "border-primary bg-primary-soft/50 ring-1 ring-primary"
                        : "border-border/60 hover:border-primary/40 hover:bg-muted/40"
                    }`}
                    style={{ fontFamily: f.stack }}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Body</Label>
            <div className="mt-2 grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {bodyChoices.map((f) => {
                const active = prefs.bodyId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setBody(f.id)}
                    className={`text-left px-3 py-2 rounded-xl border transition-zen text-sm ${
                      active
                        ? "border-primary bg-primary-soft/50 ring-1 ring-primary"
                        : "border-border/60 hover:border-primary/40 hover:bg-muted/40"
                    }`}
                    style={{ fontFamily: f.stack }}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Size</Label>
              <span className="text-xs tabular-nums text-muted-foreground">{Math.round(prefs.scale * 100)}%</span>
            </div>
            <Slider
              className="mt-3"
              min={0.85}
              max={1.25}
              step={0.05}
              value={[prefs.scale]}
              onValueChange={(v) => setScale(v[0])}
            />
          </div>

          <div className="rounded-xl bg-muted/40 p-3 border border-border/50">
            <p className="font-display text-xl leading-tight">The quick brown fox</p>
            <p className="text-sm text-muted-foreground mt-1">jumps over the lazy dog — 0123456789</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
