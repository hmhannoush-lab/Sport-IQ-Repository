import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useStore, todayKey } from "@/lib/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Check, RotateCcw, Palette, Type, Languages, Moon, DatabaseBackup, Download, Upload, Ruler, FileSpreadsheet, Smartphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultPreferences, type Preferences } from "@/lib/store";
import { downloadText, metricsCsv, workoutsCsv } from "@/lib/exportFiles";
import { useInstallPrompt } from "@/lib/pwa";
import { getQuietHours, setQuietHours, isQuietNow } from "@/lib/quietHours";
import { useTheme } from "@/hooks/use-theme";
import { useFontPrefs } from "@/hooks/use-font-prefs";
import { useLanguage } from "@/hooks/use-language";
import { loadFont } from "@/lib/fonts";
import { useT } from "@/lib/i18n";

export const Settings = () => {
  const t = useT();
  const { themes, currentId, setTheme } = useTheme();
  const { prefs, setHeading, setBody, setScale, reset, fonts } = useFontPrefs();
  const { code, languages, setLanguage } = useLanguage();
  const [quiet, setQuiet] = useState(getQuietHours);
  const updateQuiet = (patch: Parameters<typeof setQuietHours>[0]) => setQuiet(setQuietHours(patch));
  const { store, exportData, importData, updatePreferences } = useStore();
  const prefsNow = store.preferences ?? defaultPreferences;
  const fileRef = useRef<HTMLInputElement>(null);
  const { canInstall, install, installed } = useInstallPrompt();

  const downloadBackup = () => {
    downloadText(`sport-iq-backup-${todayKey()}.json`, exportData(), "application/json");
    toast.success(t("Backup downloaded"));
  };

  const downloadCsv = (kind: "metrics" | "workouts") => {
    const empty = kind === "metrics" ? Object.keys(store.metrics).length === 0 : store.workouts.length === 0;
    if (empty) {
      toast.error(t("Nothing to export yet."));
      return;
    }
    const csv = kind === "metrics" ? metricsCsv(store.metrics) : workoutsCsv(store.workouts);
    downloadText(`sport-iq-${kind}-${todayKey()}.csv`, csv, "text/csv");
  };

  const restoreBackup = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (!confirm(t("Restoring replaces all current data on this device. Continue?"))) return;
    const ok = importData(await file.text());
    if (ok) toast.success(t("Backup restored"));
    else toast.error(t("That file isn't a valid Sport IQ backup."));
  };


  useEffect(() => {
    fonts.forEach(loadFont);
  }, [fonts]);

  const headingChoices = fonts.filter((f) => f.category !== "body");
  const bodyChoices = fonts.filter((f) => f.category !== "display");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground rounded-full"
          aria-label={t("Settings")}
        >
          <SettingsIcon className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("Settings")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">{t("Settings")}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {t("Theme")}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((th) => {
                const active = th.id === currentId;
                const v = th.vars;
                return (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`relative text-left rounded-xl border p-2.5 transition-zen hover:-translate-y-0.5 ${
                      active ? "border-primary ring-2 ring-primary/40" : "border-border/60 hover:border-primary/40"
                    }`}
                    style={{ background: `hsl(${v.background})` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg leading-none">{th.emoji}</span>
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
                      <span className="h-4 flex-1 rounded-md" style={{ background: `hsl(${v.primary})` }} />
                      <span className="h-4 flex-1 rounded-md" style={{ background: `hsl(${v.accent})` }} />
                      <span className="h-4 flex-1 rounded-md" style={{ background: `hsl(${v.highlight})` }} />
                    </div>
                    <p className="font-display text-sm" style={{ color: `hsl(${v.foreground})` }}>
                      {th.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Fonts */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {t("Typography")}
                </h3>
              </div>
              <Button variant="ghost" size="sm" onClick={reset} className="h-7 px-2 text-xs rounded-full">
                <RotateCcw className="h-3 w-3 mr-1" /> {t("Reset")}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t("Headings")}
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
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
                <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t("Body")}
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
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
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t("Size")}
                  </Label>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {Math.round(prefs.scale * 100)}%
                  </span>
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
            </div>
          </section>

          {/* Language */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {t("Language")}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-72 overflow-y-auto pr-1">
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
          </section>

          {/* Quiet hours */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {t("Quiet hours")}
              </h3>
            </div>

            <div className="rounded-xl border border-border/60 p-3 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Label className="text-sm">{t("Silence alerts while I sleep")}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isQuietNow(new Date(), quiet)
                      ? t("Quiet hours are active right now.")
                      : t("No sounds or notifications during this window.")}
                  </p>
                </div>
                <Switch checked={quiet.enabled} onCheckedChange={(v) => updateQuiet({ enabled: v })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t("From")}
                  </Label>
                  <Input
                    type="time"
                    className="mt-1.5"
                    value={quiet.start}
                    disabled={!quiet.enabled}
                    onChange={(e) => updateQuiet({ start: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t("Until")}
                  </Label>
                  <Input
                    type="time"
                    className="mt-1.5"
                    value={quiet.end}
                    disabled={!quiet.enabled}
                    onChange={(e) => updateQuiet({ end: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">{t("Mute sounds")}</Label>
                  <Switch
                    checked={quiet.muteSound}
                    disabled={!quiet.enabled}
                    onCheckedChange={(v) => updateQuiet({ muteSound: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">{t("Mute notifications")}</Label>
                  <Switch
                    checked={quiet.muteNotifications}
                    disabled={!quiet.enabled}
                    onCheckedChange={(v) => updateQuiet({ muteNotifications: v })}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Units & coaching tone */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {t("Units & coaching")}
              </h3>
            </div>
            <div className="rounded-xl border border-border/60 p-3 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm">{t("Units")}</Label>
                <Select value={prefsNow.units} onValueChange={(v) => updatePreferences({ units: v as Preferences["units"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">{t("Metric (kg, cm, L)")}</SelectItem>
                    <SelectItem value="imperial">{t("Imperial (lb, ft/in, fl oz)")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">{t("Motivation style")}</Label>
                <Select value={prefsNow.motivationStyle} onValueChange={(v) => updatePreferences({ motivationStyle: v as Preferences["motivationStyle"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gentle">{t("Gentle — kind & supportive")}</SelectItem>
                    <SelectItem value="balanced">{t("Balanced — encouraging with clear goals")}</SelectItem>
                    <SelectItem value="intense">{t("Intense — push me, hold me accountable")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t("Changes your streak messages, reminders and the AI coach's tone.")}</p>
              </div>
            </div>
          </section>

          {/* Backup & restore */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <DatabaseBackup className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {t("Backup & restore")}
              </h3>
            </div>
            <div className="rounded-xl border border-border/60 p-3 space-y-3">
              <p className="text-xs text-muted-foreground">
                {t("Your data lives only in this browser. Download a backup to keep it safe or move it to another device.")}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={downloadBackup}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> {t("Download")}
                </Button>
                <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> {t("Restore")}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => restoreBackup(e.target.files?.[0])}
                />
              </div>
              <div className="pt-3 border-t border-border/40 space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> {t("Spreadsheet export (CSV, metric units)")}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => downloadCsv("metrics")}>
                    {t("Daily metrics")}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => downloadCsv("workouts")}>
                    {t("Workouts")}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Install as an app */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {t("Install app")}
              </h3>
            </div>
            <div className="rounded-xl border border-border/60 p-3 space-y-3">
              {installed ? (
                <p className="text-xs text-muted-foreground">{t("Sport IQ is installed on this device.")}</p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    {canInstall
                      ? t("Add Sport IQ to your home screen. It opens like an app and works offline.")
                      : t("To install, open your browser menu and choose \"Add to Home Screen\" or \"Install app\". On iPhone, use Safari's Share button.")}
                  </p>
                  {canInstall && (
                    <Button variant="outline" size="sm" className="w-full rounded-full" onClick={install}>
                      <Download className="h-3.5 w-3.5 mr-1.5" /> {t("Install Sport IQ")}
                    </Button>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};
