import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Check } from "lucide-react";

export const ThemeToggle = () => {
  const { themes, currentId, setTheme } = useTheme();
  const current = themes.find((t) => t.id === currentId) ?? themes[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground rounded-full"
          aria-label="Theme"
        >
          <span className="text-base leading-none sm:mr-1.5">{current.emoji}</span>
          <Palette className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3 rounded-2xl">
        <h3 className="font-display text-lg mb-2 px-1">Pick a vibe</h3>
        <div className="grid grid-cols-2 gap-2">
          {themes.map((t) => {
            const active = t.id === currentId;
            const v = t.vars;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative group text-left rounded-xl border p-2.5 transition-zen hover:-translate-y-0.5 ${
                  active ? "border-primary ring-2 ring-primary/40 shadow-glow" : "border-border/60 hover:border-primary/40"
                }`}
                style={{ background: `hsl(${v.background})` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg leading-none">{t.emoji}</span>
                  {active && (
                    <span
                      className="h-5 w-5 rounded-full flex items-center justify-center"
                      style={{ background: `hsl(${v.primary})`, color: "white" }}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="flex gap-1 mb-2">
                  <span className="h-5 flex-1 rounded-md" style={{ background: `hsl(${v.primary})` }} />
                  <span className="h-5 flex-1 rounded-md" style={{ background: `hsl(${v.accent})` }} />
                  <span className="h-5 flex-1 rounded-md" style={{ background: `hsl(${v.highlight})` }} />
                </div>
                <p className="font-display text-sm" style={{ color: `hsl(${v.foreground})` }}>
                  {t.name}
                </p>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
