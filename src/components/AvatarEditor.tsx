import { useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStore } from "@/lib/store";
import { AVATAR_OPTIONS } from "@/lib/badges";
import { Upload, Trash2 } from "lucide-react";
import { useT } from "@/lib/i18n";

export const AvatarEditor = ({ children }: { children: React.ReactNode }) => {
  const { store, setProfile } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const t = useT();
  const profile = store.profile;
  if (!profile) return <>{children}</>;

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert(t("Please choose an image under 3 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfile({ ...profile, avatarImage: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label={t("Edit profile picture")} className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4 rounded-2xl">
        <div className="space-y-4">
          <div>
            <p className="font-display text-sm mb-1">{t("Profile picture")}</p>
            <p className="text-xs text-muted-foreground">{t("Upload a photo or pick an icon below.")}</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/40 transition-zen"
            >
              <Upload className="h-4 w-4" />
              {profile.avatarImage ? t("Replace photo") : t("Upload photo")}
            </button>
            {profile.avatarImage && (
              <button
                type="button"
                onClick={() => setProfile({ ...profile, avatarImage: undefined })}
                className="inline-flex items-center justify-center gap-1.5 text-sm px-3 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-zen"
                title={t("Remove photo")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">{t("Or choose an icon")}</p>
            <div className="grid grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1">
              {AVATAR_OPTIONS.map((a) => {
                const selected = !profile.avatarImage && (profile.avatar ?? "🌿") === a.emoji;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, avatar: a.emoji, avatarImage: undefined })}
                    title={a.label}
                    className={`relative aspect-square rounded-xl flex items-center justify-center transition-zen overflow-hidden ${
                      selected ? "ring-2 ring-offset-2 ring-offset-background scale-105" : "ring-1 ring-border/60 hover:scale-105"
                    }`}
                    style={{
                      background: a.gradient,
                      ...(selected ? { ["--tw-ring-color" as string]: a.ring } : {}),
                    }}
                  >
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/10" />
                    <span className="relative text-xl drop-shadow-sm">{a.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
