import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useStore, todayKey, defaultPreferences, type Preferences } from "@/lib/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Check, RotateCcw, Palette, Globe, BellOff, DatabaseBackup, Download, Upload, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getQuietHours, setQuietHours, isQuietNow } from "@/lib/quietHours";
import { useTheme } from "@/hooks/use-theme";
import { useFontPrefs } from "@/hooks/use-font-prefs";
import { useLanguage, type LanguageCode } from "@/hooks/use-language";
import { loadFont } from "@/lib/fonts";
import { useT } from "@/lib/i18n";
import { downloadText, metricsCsv, workoutsCsv } from "@/lib/exportFiles";
import { useInstallPrompt } from "@/lib/pwa";

/** Accordion header: icon, title, and a one-line summary of the current values. */
const SectionHeader = ({ icon: Icon, title, summary }: { icon: LucideIcon; title: string; summary: string }) => (
  <span className="flex items-center gap-3 text-left min-w-0">
    <span className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </span>
    <span className="min-w-0">
      <span className="block font-display text-base leading-tight">{title}</span>
      <span className="block text-xs text-muted-foreground font-normal truncate">{summary}</span>
    </span>
  </span>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
  </div>
);

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
  const theme = themes.find((th) => th.id === currentId);
  const language = languages.find((l) => l.code === code);
  const unitsLabel = prefsNow.units === "imperial" ? t("Imperial") : t("Metric");
  const styleLabel = { gentle: t("Gentle"), balanced: t("Balanced"), intense: t("Intense") }[prefsNow.motivationStyle];

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

        <Accordion type="multiple" className="mt-4">
          {/* Appearance: theme + text */}
          <AccordionItem value="appearance" className="border-border/50">
            <AccordionTrigger className="hover:no-underline">
              <SectionHeader
                icon={Palette}
                title={t("Appearance")}
                summary={`${theme?.name ?? ""} · ${t("text")} ${Math.round(prefs.scale * 100)}%`}
              />
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {themes.map((th) => {
                  const active = th.id === currentId;
                  const v = th.vars;
                  return (
                    <button
                      key={th.id}
                      onClick={() => setTheme(th.id)}
                      className={`relative rounded-xl border p-2 text-left transition-zen ${
                        active ? "border-primary ring-2 ring-primary/40" : "border-border/60 hover:border-primary/40"
                      }`}
                      style={{ background: `hsl(${v.background})` }}
                    >
                      <div className="flex gap-1 mb-1.5">
                        <span className="h-3 flex-1 rounded" style={{ background: `hsl(${v.primary})` }} />
                        <span className="h-3 flex-1 rounded" style={{ background: `hsl(${v.accent})` }} />
                      </div>
                      <p className="text-xs truncate" style={{ color: `hsl(${v.foreground})` }}>
                        {th.emoji} {th.name}
                      </p>
                      {active && (
                        <Check className="absolute top-1 right-1 h-3 w-3" style={{ color: `hsl(${v.primary})` }} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label={t("Heading font")}>
                  <Select value={prefs.headingId} onValueChange={setHeading}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {headingChoices.map((f) => (
                        <SelectItem key={f.id} value={f.id} style={{ fontFamily: f.stack }}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={t("Body font")}>
                  <Select value={prefs.bodyId} onValueChange={setBody}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {bodyChoices.map((f) => (
                        <SelectItem key={f.id} value={f.id} style={{ fontFamily: f.stack }}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">{t("Text size")}</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs tabular-nums text-muted-foreground">{Math.round(prefs.scale * 100)}%</span>
                    <Button variant="ghost" size="sm" onClick={reset} className="h-6 px-2 text-xs rounded-full">
                      <RotateCcw className="h-3 w-3 mr-1" /> {t("Reset")}
                    </Button>
                  </div>
                </div>
                <Slider className="mt-2" min={0.85} max={1.25} step={0.05} value={[prefs.scale]} onValueChange={(v) => setScale(v[0])} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Language, units & coaching */}
          <AccordionItem value="preferences" className="border-border/50">
            <AccordionTrigger className="hover:no-underline">
              <SectionHeader
                icon={Globe}
                title={t("Language & units")}
                summary={`${language?.native ?? code} · ${unitsLabel} · ${styleLabel} ${t("coaching")}`}
              />
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <Field label={t("Language")}>
                <Select value={code} onValueChange={(v) => setLanguage(v as LanguageCode)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.native}{lang.native !== lang.name ? ` · ${lang.name}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("Units")}>
                <Select value={prefsNow.units} onValueChange={(v) => updatePreferences({ units: v as Preferences["units"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">{t("Metric (kg, cm, L)")}</SelectItem>
                    <SelectItem value="imperial">{t("Imperial (lb, ft/in, fl oz)")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("Motivation style")}>
                <Select value={prefsNow.motivationStyle} onValueChange={(v) => updatePreferences({ motivationStyle: v as Preferences["motivationStyle"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gentle">{t("Gentle — kind & supportive")}</SelectItem>
                    <SelectItem value="balanced">{t("Balanced — encouraging with clear goals")}</SelectItem>
                    <SelectItem value="intense">{t("Intense — push me, hold me accountable")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <p className="text-xs text-muted-foreground">{t("Motivation style changes your streak messages, reminders and the AI coach's tone.")}</p>
            </AccordionContent>
          </AccordionItem>

          {/* Quiet hours */}
          <AccordionItem value="quiet" className="border-border/50">
            <AccordionTrigger className="hover:no-underline">
              <SectionHeader
                icon={BellOff}
                title={t("Quiet hours")}
                summary={quiet.enabled ? `${quiet.start}–${quiet.end}${isQuietNow(new Date(), quiet) ? ` · ${t("active now")}` : ""}` : t("Off")}
              />
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm">{t("Silence alerts while I sleep")}</Label>
                <Switch checked={quiet.enabled} onCheckedChange={(v) => updateQuiet({ enabled: v })} />
              </div>
              {quiet.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("From")}>
                      <Input type="time" value={quiet.start} onChange={(e) => updateQuiet({ start: e.target.value })} />
                    </Field>
                    <Field label={t("Until")}>
                      <Input type="time" value={quiet.end} onChange={(e) => updateQuiet({ end: e.target.value })} />
                    </Field>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">{t("Mute sounds")}</Label>
                    <Switch checked={quiet.muteSound} onCheckedChange={(v) => updateQuiet({ muteSound: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">{t("Mute notifications")}</Label>
                    <Switch checked={quiet.muteNotifications} onCheckedChange={(v) => updateQuiet({ muteNotifications: v })} />
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Backup, restore & export */}
          <AccordionItem value="data" className="border-border/50">
            <AccordionTrigger className="hover:no-underline">
              <SectionHeader icon={DatabaseBackup} title={t("Your data")} summary={t("Backup, restore & spreadsheet export")} />
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {t("Your data lives only in this browser. Download a backup to keep it safe or move it to another device.")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={downloadBackup}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> {t("Backup")}
                </Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> {t("Restore")}
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" onClick={() => downloadCsv("metrics")}>
                  {t("Metrics CSV")}
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" onClick={() => downloadCsv("workouts")}>
                  {t("Workouts CSV")}
                </Button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => restoreBackup(e.target.files?.[0])}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Install as an app — hidden once installed */}
          {!installed && (
            <AccordionItem value="install" className="border-border/50">
              <AccordionTrigger className="hover:no-underline">
                <SectionHeader icon={Smartphone} title={t("Install app")} summary={t("Home screen & offline use")} />
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
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
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </SheetContent>
    </Sheet>
  );
};
