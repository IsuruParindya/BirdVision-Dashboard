import { useDetections, useStats } from "@/hooks/use-birdvision";
import { AppLayout } from "@/components/layout/app-layout";
import { StatCard } from "@/components/ui/stat-card";
import { Bird, CheckCircle2, Camera, Image as ImageIcon, Video as VideoIcon, ScanEye } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "./LanguageContext";
import en from "@/contents/en";
import sin from "@/contents/sin";

type LangMode = "english" | "sinhala" | "both";

type Stats = {
  totalDetections?: number;
  speciesIdentified?: number;
  averageConfidence?: number;
  mostDetectedBird?: string;
};

type Detection = {
  id: string;
  englishName?: string;
  sinhalaName?: string;
  confidence?: number;
  imageUrl?: string;
  createdAt?: string;
};

type SpeciesInfo = {
  habitat_en: string;
  diet_en: string;
  habitat_si: string;
  diet_si: string;
  sinhalaName: string;
};

export default function Dashboard() {
  const { language } = useLanguage() as { language: LangMode };

  const e = en.dashboard;
  const s = sin.dashboard;

  const getBoth = (eVal: string, sVal: string) =>
    language === "both" ? `${eVal} / ${sVal}` : language === "sinhala" ? sVal : eVal;

  const { data: statsRaw, isLoading: statsLoading } = useStats();
  const { data: detectionsRaw, isLoading: detectionsLoading } = useDetections();

  const stats = statsRaw as Stats | undefined;
  const detections = (detectionsRaw as Detection[] | undefined) ?? [];

  const speciesInfo: Record<string, SpeciesInfo> = {
    "Black-hooded Oriole": {
      habitat_en: e.defaultHabitatEN,
      diet_en: e.defaultDietEN,
      habitat_si: s.defaultHabitatSI,  // ✅ from sin.ts
      diet_si: s.defaultDietSI,         // ✅ from sin.ts
      sinhalaName: s.defaultBirdSI,     // ✅ from sin.ts
    },
    "Indian Peafowl": {
      habitat_en: "Forests, Villages",
      diet_en: "Seeds, Fruits, Insects",
      habitat_si: "වනාන්තර, ගම්මාන ආසන්න",
      diet_si: "බීජ, පළතුරු, කෘමි",
      sinhalaName: "මොණරා",
    },
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500";
    if (confidence >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const fallbackDetections: Detection[] = [
    {
      id: "mock1",
      englishName: e.defaultBirdEN,    // ✅ from en.ts
      sinhalaName: s.defaultBirdSI,    // ✅ from sin.ts
      confidence: 96,
      imageUrl: "",
      createdAt: new Date().toISOString(),
    },
  ];

  const listToRender =
    detections.length > 0 ? detections.slice(0, 5) : fallbackDetections;

  const renderName = (enVal: string, siVal: string) => {
    if (language === "sinhala") return siVal;
    return enVal;
  };

  const renderSecondLine = (enVal: string, siVal: string) => {
    if (language === "both") return siVal;
    return null;
  };

  const renderHabitatDiet = (info: SpeciesInfo) => {
    if (language === "english") return { habitat: info.habitat_en, diet: info.diet_en };
    if (language === "sinhala") return { habitat: info.habitat_si, diet: info.diet_si };
    return {
      habitat: `${info.habitat_en} / ${info.habitat_si}`,
      diet: `${info.diet_en} / ${info.diet_si}`,
    };
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">
            {getBoth(e.title, s.title)}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {getBoth(e.subtitle, s.subtitle)}
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <StatCard
            title={getBoth(e.stats.totalDetections, s.stats.totalDetections)}
            value={statsLoading ? "..." : String(stats?.totalDetections ?? 1284)}
            icon={Camera}
          />
          <StatCard
            title={getBoth(e.stats.speciesIdentified, s.stats.speciesIdentified)}
            value={statsLoading ? "..." : String(stats?.speciesIdentified ?? 42)}
            icon={ScanEye}
          />
          <StatCard
            title={getBoth(e.stats.avgConfidence, s.stats.avgConfidence)}
            value={statsLoading ? "..." : `${Math.round(stats?.averageConfidence ?? 94)}%`}
            icon={CheckCircle2}
          />
          <StatCard
            title={getBoth(e.stats.mostDetected, s.stats.mostDetected)}
            value={statsLoading ? "..." : (stats?.mostDetectedBird ?? e.defaultBirdEN)}
            icon={Bird}
          />
        </div>

        {/* Recent Detections */}
        <div className="glass-card rounded-[24px] overflow-hidden mt-8">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-2xl font-display font-bold">
              {getBoth(e.recentDetections, s.recentDetections)}
            </h2>
          </div>

          <div className="divide-y divide-border/50">
            {detectionsLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-6 animate-pulse">
                    <div className="h-16 bg-muted rounded" />
                  </div>
                ))
              : listToRender.map((detection) => {
                  const enRaw = (detection.englishName ?? e.defaultBirdEN).trim();
                  const conf = Number(detection.confidence ?? 0);

                  const info =
                    speciesInfo[enRaw] ??
                    ({
                      habitat_en: e.defaultHabitatEN,
                      diet_en: e.defaultDietEN,
                      habitat_si: s.defaultHabitatSI,   // ✅ from sin.ts
                      diet_si: s.defaultDietSI,           // ✅ from sin.ts
                      sinhalaName: detection.sinhalaName ?? s.defaultBirdSI, // ✅ from sin.ts
                    } as SpeciesInfo);

                  const siName = info.sinhalaName ?? detection.sinhalaName ?? s.defaultBirdSI; // ✅ from sin.ts
                  const hd = renderHabitatDiet(info);

                  return (
                    <div
                      key={detection.id}
                      className="p-6 flex items-start gap-4 hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-border bg-muted shadow-sm">
                        {detection.imageUrl ? (
                          <img
                            src={detection.imageUrl}
                            alt="bird"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                            <Bird size={20} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {renderName(enRaw, siName)}
                          </h3>
                          <span className={`w-2.5 h-2.5 rounded-full ${getConfidenceColor(conf)}`} />
                        </div>

                        {renderSecondLine(enRaw, siName) && (
                          <p className="text-primary font-medium text-sm">
                            {renderSecondLine(enRaw, siName)}
                          </p>
                        )}

                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {getBoth(e.habitat, s.habitat)}:
                          </span>{" "}
                          {hd.habitat}{" "}
                          <span className="text-muted-foreground/60">|</span>{" "}
                          <span className="font-medium text-foreground">
                            {getBoth(e.diet, s.diet)}:
                          </span>{" "}
                          {hd.diet}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>
                            {detection.createdAt
                              ? format(new Date(detection.createdAt), "MMM d, h:mm a")
                              : getBoth(e.justNow, s.justNow)}
                          </span>

                          <span className="flex items-center gap-1">
                            {detection.imageUrl ? (
                              <><ImageIcon size={14} /> {getBoth(e.image, s.image)}</>
                            ) : (
                              <><VideoIcon size={14} /> {getBoth(e.video, s.video)}</>
                            )}
                          </span>

                          <span className="font-semibold">
                            {Math.round(conf)}% {getBoth(e.confidence, s.confidence)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}