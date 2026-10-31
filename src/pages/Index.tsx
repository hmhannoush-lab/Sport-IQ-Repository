import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Onboarding } from "@/components/Onboarding";
import { Dashboard } from "@/components/Dashboard";
import { Diet } from "@/components/Diet";
import { Fatigue } from "@/components/Fatigue";
import { Workouts } from "@/components/Workouts";
import { Sports } from "@/components/Sports";
import { CoachBrief } from "@/components/CoachBrief";
import { Friends } from "@/components/Friends";
import { EvidenceSources } from "@/components/EvidenceSources";
import { InjuryPreventionDetail } from "@/components/InjuryPreventionDetail";
import { Insights } from "@/components/Insights";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Leaf, LayoutDashboard, Salad, HeartPulse, Dumbbell, RotateCcw, BookOpen, Volleyball, Sparkles, Users, Menu, Check, LineChart, Shield } from "lucide-react";
import { VitalLogo } from "@/components/VitalLogo";
import { Roadmap } from "@/components/Roadmap";
import { Settings } from "@/components/Settings";
import { getAvatarStyle } from "@/lib/badges";
import { AvatarEditor } from "@/components/AvatarEditor";
import { useT } from "@/lib/i18n";
import { useMorningReminder } from "@/hooks/use-morning-reminder";

type Tab = "dashboard" | "insights" | "coach" | "diet" | "fatigue" | "workouts" | "sports" | "prevention" | "friends" | "sources";

const TABS: { id: Tab; label: string; icon: typeof Leaf }[] = [
  { id: "dashboard", label: "Today", icon: LayoutDashboard },
  { id: "insights", label: "Insights", icon: LineChart },
  { id: "coach", label: "Coach", icon: Sparkles },
  { id: "diet", label: "Diet", icon: Salad },
  { id: "fatigue", label: "Recovery", icon: HeartPulse },
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "sports", label: "Sports", icon: Volleyball },
  { id: "prevention", label: "Prevention", icon: Shield },
  { id: "friends", label: "Friends", icon: Users },
  { id: "sources", label: "Sources", icon: BookOpen },
];

const PageMenu = ({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) => {
  const t = useT();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground rounded-full"
          aria-label={t("Pages")}
        >
          <Menu className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("Pages")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3 rounded-2xl">
        <div className="grid grid-cols-1 gap-1">
          {TABS.map((tb) => {
            const Icon = tb.icon;
            const active = tab === tb.id;
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-zen text-sm ${
                  active
                    ? "border-primary bg-primary-soft/50 ring-1 ring-primary"
                    : "border-border/60 hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{t(tb.label)}</span>
                </span>
                {active && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Index = () => {
  const { store, reset, dismissRoadmap } = useStore();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editing, setEditing] = useState(false);
  const t = useT();

  // Listen for cross-component tab navigation requests (e.g. "Customize with Coach").
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { tab?: Tab } | undefined;
      if (detail?.tab) setTab(detail.tab);
    };
    window.addEventListener("sport-iq:goto-tab", handler);
    return () => window.removeEventListener("sport-iq:goto-tab", handler);
  }, []);

  useMorningReminder();

  if (!store.profile) return <Onboarding />;
  if (editing) return <Onboarding onClose={() => setEditing(false)} />;
  if (!store.hasSeenRoadmap) return <Roadmap onEnter={dismissRoadmap} />;

  return (
    <div className="min-h-screen bg-hero relative overflow-hidden grain">
      {/* Ambient floating orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-orb" />
        <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-3xl animate-orb" style={{ animationDelay: "-6s" }} />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-highlight/25 blur-3xl animate-orb" style={{ animationDelay: "-12s" }} />
        <div className="absolute top-2/3 right-1/4 h-72 w-72 rounded-full bg-primary-soft/40 blur-3xl animate-orb" style={{ animationDelay: "-3s" }} />
      </div>

      <header className="sticky top-0 z-30 glass border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
            <VitalLogo className="h-7 w-7 sm:h-9 sm:w-9 lg:h-10 lg:w-10 shrink-0" />
            <div>
              <p className="font-display text-[11px] uppercase tracking-[0.35em] text-muted-foreground leading-none mb-1.5">{t("Sport IQ")}</p>
              <h1 className="font-display text-base leading-tight">{t("Hello")}, <span className="text-gradient-sage italic">{store.profile.name}</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <PageMenu tab={tab} setTab={setTab} />
            <Settings />
            <Button variant="ghost" size="sm" onClick={() => { if (confirm(t("Reset all data and start over?"))) reset(); }} className="text-muted-foreground hover:text-foreground rounded-full">
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("Reset")}</span>
            </Button>
            {(() => {
              const av = store.profile.avatar ? getAvatarStyle(store.profile.avatar) : null;
              const bg = av ? av.gradient : "var(--gradient-sage)";
              const glow = av ? `${av.ring}66` : "hsl(var(--primary) / 0.4)";
              return (
                <AvatarEditor>
                  <div className="relative ml-1 group cursor-pointer">
                    <div className="absolute -inset-1 rounded-2xl blur-lg opacity-50 animate-breathe" style={{ background: bg }} />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-white/30" />
                    <div className="relative h-11 w-11 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: bg, boxShadow: `0 10px 30px -8px ${glow}` }}>
                      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-black/15" />
                      <div aria-hidden className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-white/40 blur-md" />
                      {store.profile.avatarImage ? (
                        <img
                          src={store.profile.avatarImage}
                          alt={store.profile.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : store.profile.avatar ? (
                        <span className="relative text-xl leading-none drop-shadow-sm transition-transform duration-700 group-hover:rotate-[8deg]">
                          {store.profile.avatar}
                        </span>
                      ) : (
                        <VitalLogo className="h-6 w-6 relative transition-transform duration-700 group-hover:rotate-[8deg]" />
                      )}
                    </div>
                  </div>
                </AvatarEditor>
              );
            })()}
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32 sm:pb-10">
        {tab === "dashboard" && <Dashboard />}
        {tab === "insights" && <Insights />}
        {tab === "coach" && <CoachBrief />}
        {tab === "diet" && <Diet />}
        {tab === "fatigue" && <Fatigue />}
        {tab === "workouts" && <Workouts />}
        {tab === "sports" && <Sports />}
        {tab === "prevention" && <InjuryPreventionDetail />}
        {tab === "friends" && <Friends />}
        {tab === "sources" && <EvidenceSources />}
      </main>

    </div>
  );
};

export default Index;
