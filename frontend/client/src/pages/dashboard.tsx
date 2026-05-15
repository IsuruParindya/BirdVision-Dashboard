import { useEffect } from "react";
import { useDetections, useStats } from "@/hooks/use-birdvision";
import { deleteDetection } from "@/api";
import { AppLayout } from "@/components/layout/app-layout";
import { StatCard } from "@/components/ui/stat-card";
import { Bird, CheckCircle2, Camera, ScanEye } from "lucide-react";
import RecentDetections from "./RecentDetections";
import { useLanguage } from "./LanguageContext";
import en from "@/contents/en";
import sin from "@/contents/sin";

type LangMode = "english" | "sinhala" | "both";

export default function Dashboard() {
  const { language } = useLanguage() as { language: LangMode };

  const e = en.dashboard;
  const s = sin.dashboard;

  const getBoth = (eVal: string, sVal: string) =>
    language === "both" ? `${eVal} / ${sVal}` : language === "sinhala" ? sVal : eVal;

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useStats();

  const {
    data: detections = [],
    isLoading: detectionsLoading,
    refetch: refetchDetections,
  } = useDetections();

  /* =========================
     AUTO REFRESH DASHBOARD
  ========================= */

  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
      refetchDetections();
    }, 3000);

    return () => clearInterval(interval);
  }, [refetchStats, refetchDetections]);

  /* =========================
     AVG CONFIDENCE FIX
  ========================= */

  const avgConfidence =
    stats?.averageConfidence && stats.averageConfidence <= 1
      ? Math.round(stats.averageConfidence * 100)
      : Math.round(stats?.averageConfidence ?? 0);

  /* =========================
     MOST DETECTED BIRD LABEL
  ========================= */

  const mostDetectedLabel = statsLoading
    ? "..."
    : language === "sinhala"
    ? stats?.mostDetectedBirdSinhala ?? "දත්ත නැත"
    : language === "both"
    ? `${stats?.mostDetectedBird ?? "No Data"} / ${stats?.mostDetectedBirdSinhala ?? ""}`
    : stats?.mostDetectedBird ?? "No Data";

  /* =========================
     SEPARATE IMAGE + VIDEO
  ========================= */

  const imageDetections = detections.filter(
    (item: any) => item.sourceType === "image"
  );

  const videoDetections = detections.filter(
    (item: any) => item.sourceType === "video"
  );

  /* =========================
     DELETE DETECTION
  ========================= */

  const handleDelete = async (id: string) => {
    try {
      await deleteDetection(id);
      await refetchStats();
      await refetchDetections();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-display font-bold">
            {getBoth(e.title, s.title)}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {getBoth(e.subtitle, s.subtitle)}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

          <StatCard
            title={getBoth(e.stats.totalDetections, s.stats.totalDetections)}
            value={statsLoading ? "..." : String(stats?.totalDetections ?? 0)}
            icon={Camera}
          />

          <StatCard
            title={getBoth(e.stats.speciesIdentified, s.stats.speciesIdentified)}
            value={statsLoading ? "..." : String(stats?.speciesIdentified ?? 0)}
            icon={ScanEye}
          />

          <StatCard
            title={getBoth(e.stats.avgConfidence, s.stats.avgConfidence)}
            value={statsLoading ? "..." : `${avgConfidence}%`}
            icon={CheckCircle2}
          />

          <StatCard
            title={getBoth(e.stats.mostDetected, s.stats.mostDetected)}
            value={mostDetectedLabel}
            icon={Bird}
          />

        </div>

        {/* IMAGE + VIDEO DETECTIONS VERTICAL */}
        <div className="space-y-6">

          {/* IMAGE DETECTIONS */}
          <RecentDetections
            title={getBoth(e.recentImageDetections, s.recentImageDetections)}
            detections={imageDetections}
            detectionsLoading={detectionsLoading}
            getBoth={getBoth}
            e={e}
            s={s}
            handleDelete={handleDelete}
          />

          {/* VIDEO DETECTIONS */}
          <RecentDetections
            title={getBoth(e.recentVideoDetections, s.recentVideoDetections)}
            detections={videoDetections}
            detectionsLoading={detectionsLoading}
            getBoth={getBoth}
            e={e}
            s={s}
            handleDelete={handleDelete}
          />

        </div>

      </div>
    </AppLayout>
  );
}