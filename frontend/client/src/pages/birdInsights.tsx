import { AppLayout } from "@/components/layout/app-layout";
import {
  BadgeAlert,
  MapPin,
  Drumstick,
  Bird,
  ShieldCheck,
  Sparkles,
  Leaf,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import en from "../contents/en";
import sin from "../contents/sin";

type LangMode = "english" | "sinhala" | "both";

export default function BirdInsights() {
  const { language } = useLanguage() as { language: LangMode };

  const e = en.birdInsights;
  const s = sin.birdInsights;

  const t = language === "sinhala" ? s : e;

  const getBoth = (eVal: string, sVal: string) =>
    language === "both" ? `${eVal} / ${sVal}` : language === "sinhala" ? sVal : eVal;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-[28px] border border-border/50 bg-gradient-to-br from-emerald-500/10 via-background to-cyan-500/10 p-8 lg:p-10">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <Sparkles size={16} />
              {getBoth(e.badge, s.badge)}
            </div>

            <h1 className="mt-5 text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
              {getBoth(e.title, s.title)}
            </h1>

            <p className="mt-3 text-lg text-muted-foreground leading-8">
              {getBoth(e.subtitle, s.subtitle)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3 space-y-8">
            <div className="glass-card rounded-[28px] p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 items-center">
                <div className="relative mx-auto md:mx-0">
                  <div className="h-56 w-56 rounded-[28px] bg-gradient-to-br from-emerald-500/20 via-background to-cyan-500/20 border border-border/50 flex items-center justify-center overflow-hidden shadow-xl">
                    <img
                      src="/blue-magpie.jpg"
                      alt={e.bird.englishName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-[10px] bg-white/90 border border-slate-200 px-5 py-2 text-xs font-medium text-status-busy shadow-md min-w-[140px] whitespace-nowrap">
                    <BadgeAlert size={13} className="shrink-0" />
                    <span>{getBoth(e.imageDesc, s.imageDesc)}</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                    {e.bird.englishName}
                  </h2>

                  <p className="mt-2 text-lg text-muted-foreground font-medium">
                    {e.bird.sinhalaName}
                  </p>

                  <p className="mt-2 text-sm italic text-muted-foreground">
                    {e.bird.scientificName}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-600 px-4 py-2 text-sm font-semibold">
                      <ShieldCheck size={16} />
                      {getBoth(e.bird.rarity, s.bird.rarity)}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold">
                      <Bird size={16} />
                      {getBoth(e.lastDetected, s.lastDetected)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-[28px] p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Leaf size={22} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {getBoth(e.about, s.about)}
                  </h3>
                  <p className="text-sm text-muted-foreground">{e.bird.englishName}</p>
                </div>
              </div>

              <p className="text-base lg:text-lg leading-8 text-muted-foreground">
                {getBoth(e.bird.description, s.bird.description)}
              </p>
            </div>
          </div>

          <div className="xl:col-span-2">
            <div className="glass-card rounded-[28px] p-5 lg:p-7 h-full">
              <div className="flex items-center gap-3 pb-5 border-b border-border/50">
                <div className="h-12 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bird size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {getBoth(e.panelTitle, s.panelTitle)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getBoth(e.panelDesc, s.panelDesc)}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <InfoCard
                  title={getBoth(e.englishName, s.englishName)}
                  value={e.bird.englishName}
                />

                <InfoCard
                  title={getBoth(e.sinhalaName, s.sinhalaName)}
                  value={e.bird.sinhalaName}
                />

                <InfoCard
                  title={getBoth(e.food, s.food)}
                  value={getBoth(e.bird.eats, s.bird.eats)}
                  icon={<Drumstick size={18} className="text-primary" />}
                />

                <InfoCard
                  title={getBoth(e.whereFound, s.whereFound)}
                  value={getBoth(e.bird.location, s.bird.location)}
                  icon={<MapPin size={18} className="text-primary" />}
                />

                <InfoCard
                  title={getBoth(e.rarity, s.rarity)}
                  value={getBoth(e.bird.rarity, s.bird.rarity)}
                  icon={<ShieldCheck size={18} className="text-emerald-600" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

type InfoCardProps = {
  title: string;
  value: string;
  icon?: React.ReactNode;
  italic?: boolean;
};

function InfoCard({ title, value, icon, italic = false }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/50 p-4 lg:p-5 transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex gap-3">
        {icon ? <div className="mt-1 shrink-0">{icon}</div> : null}
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
            {title}
          </p>
          <p className={`text-base font-semibold text-foreground leading-7 ${italic ? "italic" : ""}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}