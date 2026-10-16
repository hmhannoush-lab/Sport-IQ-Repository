import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { FriendRelationship } from "@/lib/store";
import { buildSnapshot, encodeShareCode, decodeShareCode, FriendSnapshot } from "@/lib/shareCode";
import { computeLevel } from "@/lib/level";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Copy, Share2, UserPlus, Trash2, Trophy, Footprints, Moon, Droplets, Dumbbell, HeartPulse, Sparkles,
  Search, X,
} from "lucide-react";

type StatusKey = "all" | "fresh" | "recent" | "stale";
type RelationFilter = "all" | FriendRelationship | "unset";

const RELATIONSHIP_OPTIONS: { value: FriendRelationship; label: string; emoji: string }[] = [
  { value: "training-partner", label: "Training partner", emoji: "🏋️" },
  { value: "coach", label: "Coach", emoji: "🧭" },
  { value: "family", label: "Family", emoji: "🏡" },
  { value: "friend", label: "Friend", emoji: "🤝" },
  { value: "rival", label: "Rival", emoji: "🔥" },
];

const relationshipMeta = (r?: FriendRelationship) =>
  RELATIONSHIP_OPTIONS.find((o) => o.value === r);

function snapshotStatus(createdAt: number): { key: Exclude<StatusKey, "all">; label: string; tone: string } {
  const days = (Date.now() - createdAt) / 86_400_000;
  if (days <= 7) return { key: "fresh", label: "Fresh", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" };
  if (days <= 30) return { key: "recent", label: "Recent", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
  return { key: "stale", label: "Stale", tone: "bg-muted text-muted-foreground" };
}

// Official brand marks (simple-icons, CC0). Safe for nominative use (linking to the service).
const GmailLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#fff" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
);
const TelegramLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#fff" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);
const SmsLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#fff" d="M12 2C6.486 2 2 5.945 2 10.8c0 2.52 1.21 4.79 3.146 6.39-.114 1.27-.49 2.68-1.394 3.81 1.92-.18 3.59-.92 4.86-1.97 1.05.31 2.18.47 3.388.47 5.514 0 10-3.945 10-8.7S17.514 2 12 2z"/>
  </svg>
);

function Stat({ icon: Icon, label, mine, theirs, betterWhen = "up", unit = "" }: {
  icon: typeof Footprints; label: string; mine: number; theirs: number; betterWhen?: "up" | "down"; unit?: string;
}) {
  const diff = mine - theirs;
  const iWin = betterWhen === "up" ? diff > 0 : diff < 0;
  const tie = diff === 0 || (!mine && !theirs);
  const tone = tie ? "text-muted-foreground" : iWin ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">You</p>
          <p className="font-display text-xl">{mine ? mine.toLocaleString() : "—"}<span className="text-xs text-muted-foreground ml-1">{unit}</span></p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Friend</p>
          <p className="font-display text-xl">{theirs ? theirs.toLocaleString() : "—"}<span className="text-xs text-muted-foreground ml-1">{unit}</span></p>
        </div>
      </div>
      <p className={`mt-2 text-[11px] ${tone}`}>
        {tie ? "Neck and neck." : iWin ? `You lead by ${Math.abs(diff).toLocaleString()} ${unit}` : `Friend leads by ${Math.abs(diff).toLocaleString()} ${unit}`}
      </p>
    </div>
  );
}

export const Friends = () => {
  const { store, addFriend, removeFriend, updateFriend } = useStore();
  const profile = store.profile!;
  const [paste, setPaste] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusKey>("all");
  const [relationFilter, setRelationFilter] = useState<RelationFilter>("all");

  const mySnap = useMemo(
    () => buildSnapshot(profile, store.metrics, store.workouts),
    [profile, store.metrics, store.workouts],
  );
  const myCode = useMemo(() => encodeShareCode(mySnap), [mySnap]);
  const myLevel = computeLevel(mySnap.badges);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(myCode);
      toast.success("Code copied", { description: "Share it with a friend so they can compare." });
    } catch {
      toast.error("Couldn't copy — select and copy manually.");
    }
  };

  const shareText = `Compare our wellness journey on Sport IQ — paste my code:\n\n${myCode}`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  const shareLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Sport IQ", text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Invite copied", { description: "Paste it into any message." });
      }
    } catch { /* user cancelled */ }
  };

  const shareEmail = () => {
    const subject = encodeURIComponent("Let's compare on Sport IQ");
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };


  const shareTelegram = () => {
    const text = encodeURIComponent(shareText);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, "_blank");
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareSms = () => {
    const text = encodeURIComponent(shareText);
    // iOS wants `sms:&body=`, Android wants `sms:?body=`. `sms:?&body=` works on both.
    const href = `sms:?&body=${text}`;
    // Prefer the native share sheet on mobile — it lists Messages plus other messaging apps.
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: unknown }).share) {
      navigator.share({ title: "Sport IQ", text: shareText }).catch(() => {
        window.location.href = href;
      });
      return;
    }
    window.location.href = href;
  };

  const shareGeneric = async () => {
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: unknown }).share) {
      try {
        await navigator.share({ title: "Sport IQ", text: shareText });
        return;
      } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Invite copied", { description: "Paste it into any app." });
    } catch {
      toast.error("Couldn't copy the invite.");
    }
  };

  const handleAdd = () => {
    const snap = decodeShareCode(paste);
    if (!snap) {
      toast.error("That code doesn't look right.", { description: "Make sure you copied the whole thing." });
      return;
    }
    addFriend({ snapshot: snap });
    setPaste("");
    toast.success(`${snap.name} joined your circle.`, { description: `Level ${computeLevel(snap.badges).level} · ${snap.levelTitle}` });
  };

  return (
    <div className="space-y-7 animate-fade-up">
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Together</p>
        <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-tight">
          Your <span className="text-gradient-sage italic">circle</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          Share a code with a friend and compare your 7-day rhythm side by side. Badges boost your level — collect them to climb.
        </p>
      </div>

      {/* My code card */}
      <section className="relative rounded-3xl border border-border/50 bg-card/70 backdrop-blur p-6 shadow-soft overflow-hidden">
        <div aria-hidden className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-sage flex items-center justify-center shadow-glow text-xl">
              {profile.avatar ?? "🌿"}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Your profile</p>
              <h3 className="font-display text-xl">{profile.name}</h3>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Level {myLevel.level} · {myLevel.title}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {mySnap.badges} badges{myLevel.boost > 0 ? ` · +${myLevel.boost} boost` : ""}
            </p>
          </div>
        </div>

        <div className="relative rounded-2xl bg-muted/50 border border-border/40 p-3 mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Your share code</p>
          <p className="font-mono text-xs break-all leading-relaxed select-all">{myCode}</p>
        </div>

        <div className="relative flex flex-wrap gap-2 mb-4">
          <Button onClick={copyCode} className="rounded-full">
            <Copy className="h-4 w-4 mr-1.5" /> Copy code
          </Button>
          <Button variant="outline" onClick={shareLink} className="rounded-full">
            <Share2 className="h-4 w-4 mr-1.5" /> Invite a friend
          </Button>
        </div>

        <div className="relative rounded-2xl bg-muted/30 border border-border/30 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Share via</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={shareEmail} className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-[6px] bg-white border border-border/40 mr-1.5 overflow-hidden">
                <GmailLogo className="h-3.5 w-3.5" />
              </span>
              Gmail
            </Button>
            <Button variant="ghost" size="sm" onClick={shareTelegram} className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#26A5E4] mr-1.5">
                <TelegramLogo className="h-3.5 w-3.5" />
              </span>
              Telegram
            </Button>
            <Button variant="ghost" size="sm" onClick={shareWhatsApp} className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#25D366] mr-1.5 text-white text-[10px] font-bold">
                W
              </span>
              WhatsApp
            </Button>
            <Button variant="ghost" size="sm" onClick={shareSms} className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#34C759] mr-1.5">
                <SmsLogo className="h-3 w-3" />
              </span>
              Messages
            </Button>
            <Button variant="ghost" size="sm" onClick={shareGeneric} className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60">
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              More…
            </Button>
          </div>
        </div>
      </section>

      {/* Add friend */}
      <section className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg">Add a friend</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Paste the code they sent you.</p>
        <Textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="VTL1-…"
          className="font-mono text-xs min-h-[80px] rounded-2xl"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={handleAdd} disabled={!paste.trim()} className="rounded-full">
            Compare
          </Button>
        </div>
      </section>

      {/* Friend comparisons */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Side by side
          </h3>
          {store.friends.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              {(() => {
                const total = store.friends.length;
                const shown = store.friends.filter((f) => {
                  const matchName = !query.trim() || f.snapshot.name.toLowerCase().includes(query.trim().toLowerCase());
                  const status = snapshotStatus(f.snapshot.createdAt).key;
                  const matchStatus = statusFilter === "all" || status === statusFilter;
                  const matchRel =
                    relationFilter === "all" ||
                    (relationFilter === "unset" ? !f.relationship : f.relationship === relationFilter);
                  return matchName && matchStatus && matchRel;
                }).length;
                return shown === total ? `${total} friend${total === 1 ? "" : "s"}` : `${shown} of ${total}`;
              })()}
            </p>
          )}
        </div>

        {store.friends.length > 0 && (
          <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name…"
                className="pl-9 pr-9 rounded-full bg-background/60"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-muted/60 flex items-center justify-center text-muted-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Status</p>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusKey)}>
                  <SelectTrigger className="rounded-full bg-background/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="fresh">Fresh · ≤ 7 days</SelectItem>
                    <SelectItem value="recent">Recent · ≤ 30 days</SelectItem>
                    <SelectItem value="stale">Stale · &gt; 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Relationship</p>
                <Select value={relationFilter} onValueChange={(v) => setRelationFilter(v as RelationFilter)}>
                  <SelectTrigger className="rounded-full bg-background/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All relationships</SelectItem>
                    {RELATIONSHIP_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.emoji} {o.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="unset">Untagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(query || statusFilter !== "all" || relationFilter !== "all") && (
              <button
                type="button"
                onClick={() => { setQuery(""); setStatusFilter("all"); setRelationFilter("all"); }}
                className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {store.friends.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
            No friends yet. Share your code to start a friendly comparison.
          </div>
        ) : (() => {
          const q = query.trim().toLowerCase();
          const filtered = store.friends.filter((f) => {
            const matchName = !q || f.snapshot.name.toLowerCase().includes(q);
            const status = snapshotStatus(f.snapshot.createdAt).key;
            const matchStatus = statusFilter === "all" || status === statusFilter;
            const matchRel =
              relationFilter === "all" ||
              (relationFilter === "unset" ? !f.relationship : f.relationship === relationFilter);
            return matchName && matchStatus && matchRel;
          });

          if (filtered.length === 0) {
            return (
              <div className="rounded-3xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                No friends match those filters.
              </div>
            );
          }

          return filtered.map((f) => {
            const s: FriendSnapshot = f.snapshot;
            const theirLevel = computeLevel(s.badges);
            const leader = myLevel.level >= theirLevel.level ? profile.name : s.name;
            const status = snapshotStatus(s.createdAt);
            const rel = relationshipMeta(f.relationship);
            return (
              <div key={f.id} className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur p-6 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-accent/30 flex items-center justify-center text-lg">
                      {s.avatar ?? "✨"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display text-lg leading-tight">{s.name}</h4>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.tone}`}>{status.label}</span>
                        {rel && (
                          <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                            {rel.emoji} {rel.label}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Level {theirLevel.level} · {theirLevel.title} · {s.badges} badges
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={f.relationship ?? "unset"}
                      onValueChange={(v) =>
                        updateFriend(f.id, { relationship: v === "unset" ? undefined : (v as FriendRelationship) })
                      }
                    >
                      <SelectTrigger className="h-8 rounded-full text-xs w-[140px]"><SelectValue placeholder="Tag" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unset">No tag</SelectItem>
                        {RELATIONSHIP_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.emoji} {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">{leader}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive" onClick={() => removeFriend(f.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Stat icon={Footprints} label="Steps · 7d avg" mine={mySnap.steps} theirs={s.steps} />
                  <Stat icon={Moon} label="Sleep · 7d avg" mine={mySnap.sleepHours} theirs={s.sleepHours} unit="h" />
                  <Stat icon={Droplets} label="Water · 7d avg" mine={Math.round(mySnap.waterMl / 100) / 10} theirs={Math.round(s.waterMl / 100) / 10} unit="L" />
                  <Stat icon={Dumbbell} label="Workouts · 7d total" mine={mySnap.workoutMin} theirs={s.workoutMin} unit="min" />
                  <Stat icon={HeartPulse} label="Resting HR" mine={mySnap.restingHr} theirs={s.restingHr} betterWhen="down" unit="bpm" />
                  <Stat icon={Trophy} label="Badges" mine={mySnap.badges} theirs={s.badges} />
                </div>

                <p className="mt-4 text-xs text-muted-foreground italic">
                  Snapshot from {new Date(s.createdAt).toLocaleDateString()} — ask {s.name} for a fresh code anytime.
                </p>
              </div>
            );
          });
        })()}
      </section>
    </div>
  );
};
