import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { computeBadges } from "@/lib/badges";
import { useBadgeUnlockNotifier } from "@/hooks/use-badge-unlock-notifier";
import { Check, Lock, Award, Bell, BellOff } from "lucide-react";
import {
  notificationsSupported,
  getNotificationPermission,
  notificationsEnabled,
  requestNotificationPermission,
  setNotificationsPref,
} from "@/lib/pushNotifications";

export const Badges = () => {
  const { store } = useStore();
  useBadgeUnlockNotifier();
  const badges = computeBadges(store.profile, store.metrics, store.workouts);
  const earned = badges.filter((b) => b.achieved).length;

  const [notifOn, setNotifOn] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const supported = notificationsSupported();

  useEffect(() => {
    setPermission(getNotificationPermission());
    setNotifOn(notificationsEnabled());
  }, []);

  const toggleNotifications = async () => {
    if (!supported) {
      toast("Notifications aren't supported on this device.");
      return;
    }
    if (notifOn) {
      setNotificationsPref(false);
      setNotifOn(false);
      toast("Badge notifications paused.");
      return;
    }
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === "granted") {
      setNotifOn(true);
      toast("You'll get a nudge when you unlock a new badge. 🔔");
    } else if (result === "denied") {
      toast("Notifications are blocked. Enable them in your browser settings.");
    }
  };


  return (
    <Card className="p-6 sm:p-7 border-border/40 shadow-lift bg-gradient-to-br from-card via-card to-primary-soft/30 rounded-2xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary-soft flex items-center justify-center">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Achievements</p>
            <h3 className="font-display text-xl text-foreground leading-tight">Your badges</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-display text-2xl text-foreground">{earned}</span>
          <span className="text-muted-foreground">/{badges.length}</span>
        </p>
      </div>

      {supported && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {notifOn ? (
              <Bell className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground leading-tight">
                {notifOn ? "Badge notifications on" : "Get notified when you unlock a badge"}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                {permission === "denied"
                  ? "Blocked — enable in your browser settings"
                  : notifOn
                  ? "A gentle nudge each time you level up"
                  : "One tap to allow calm system alerts"}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant={notifOn ? "outline" : "default"}
            onClick={toggleNotifications}
            disabled={permission === "denied"}
            className="shrink-0 rounded-full h-8 text-xs"
          >
            {notifOn ? "Pause" : "Enable"}
          </Button>
        </div>
      )}


      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`relative p-4 rounded-xl border transition-zen overflow-hidden ${
              b.achieved
                ? "border-primary/40 bg-gradient-to-br from-primary-soft/60 via-accent-soft/40 to-highlight/20 shadow-lift ring-1 ring-primary/20"
                : "border-border/40 bg-muted/10 opacity-70"
            }`}
          >
            {b.achieved && (
              <div
                aria-hidden
                className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl"
              />
            )}
            <div className="relative flex items-start gap-3">
              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-zen ${
                  b.achieved
                    ? "bg-card shadow-soft ring-1 ring-primary/30"
                    : "bg-muted/30 grayscale opacity-60"
                }`}
              >
                {b.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-medium truncate ${b.achieved ? "text-foreground" : "text-muted-foreground"}`}>{b.title}</p>
                  {b.achieved ? (
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  ) : (
                    <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{b.description}</p>
              </div>
            </div>
            {!b.achieved && (
              <div className="relative mt-3">
                <Progress value={b.progress * 100} className="h-1" />
                {b.hint && <p className="text-[10px] text-muted-foreground mt-1.5">{b.hint}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
