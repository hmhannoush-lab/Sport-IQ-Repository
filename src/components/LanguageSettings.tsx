import { useLanguage } from "@/hooks/use-language";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Languages, Check } from "lucide-react";

export const LanguageSettings = () => {
  const { code, current, languages, setLanguage } = useLanguage();
  const t = useT();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground rounded-full"
          aria-label="Language settings"
        >
          <Languages className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("Language")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg">Language</h3>
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {current.native}
          </span>
        </div>
        <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Preferred language
        </Label>
        <div className="mt-2 grid grid-cols-1 gap-1 max-h-72 overflow-y-auto pr-1">
          {languages.map((lang) => {
            const active = code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-zen text-sm ${
                  active
                    ? "border-primary bg-primary-soft/50 ring-1 ring-primary"
                    : "border-border/60 hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <span className="flex flex-col items-start leading-tight">
                    <span className="font-medium">{lang.native}</span>
                    <span className="text-[11px] text-muted-foreground">{lang.name}</span>
                  </span>
                </span>
                {active && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          The whole app — including coach replies and instructions — translates automatically. Saved on this device.
        </p>
      </PopoverContent>
    </Popover>
  );
};
