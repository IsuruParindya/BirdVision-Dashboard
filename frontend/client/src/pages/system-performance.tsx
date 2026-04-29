import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Cpu,
  Gauge,
  Zap,
  Activity,
  Bird,
  Timer,
} from "lucide-react";

import { getSystemPerformance } from "@/api";

import { useLanguage } from "@/pages/LanguageContext";
import en from "@/contents/en";
import sin from "@/contents/sin";

type LangMode = "english" | "sinhala" | "both";

type PerformanceData = {
  modelAccuracy: string;
  inferenceSpeed: string;
  cpuUsage: string;
  responseTime: string;
  powerEfficiency: string;
  systemStability: string;
  memoryUsage: string;
};

export default function SystemPerformance() {
  const { language } = useLanguage() as {
    language: LangMode;
  };

  const [performance, setPerformance] =
    useState<PerformanceData | null>(null);

  const e = en.systemPerformance;
  const s = sin.systemPerformance;

  const getBoth = (
    eVal: string,
    sVal: string
  ) =>
    language === "both"
      ? `${eVal} / ${sVal}`
      : language === "sinhala"
      ? sVal
      : eVal;

  /* =========================
     FETCH REAL SYSTEM PERFORMANCE
  ========================= */

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const data =
          await getSystemPerformance();

        setPerformance(data);
      } catch (error) {
        console.error(
          "Failed to fetch system performance:",
          error
        );
      }
    };

    fetchPerformance();

    const interval = setInterval(() => {
      fetchPerformance();
    }, 3000);

    return () =>
      clearInterval(interval);
  }, []);

  const performanceStats = [
    {
      title: getBoth(
        e.stats.modelAccuracy.title,
        s.stats.modelAccuracy.title
      ),
      value:
        performance?.modelAccuracy || "...",
      description: getBoth(
        e.stats.modelAccuracy.description,
        s.stats.modelAccuracy.description
      ),
      icon: Bird,
    },

    {
      title: getBoth(
        e.stats.inferenceSpeed.title,
        s.stats.inferenceSpeed.title
      ),
      value:
        performance?.inferenceSpeed || "...",
      description: getBoth(
        e.stats.inferenceSpeed.description,
        s.stats.inferenceSpeed.description
      ),
      icon: Gauge,
    },

    {
      title: getBoth(
        e.stats.cpuUsage.title,
        s.stats.cpuUsage.title
      ),
      value:
        performance?.cpuUsage || "...",
      description: getBoth(
        e.stats.cpuUsage.description,
        s.stats.cpuUsage.description
      ),
      icon: Cpu,
    },

    {
      title: getBoth(
        e.stats.responseTime.title,
        s.stats.responseTime.title
      ),
      value:
        performance?.responseTime || "...",
      description: getBoth(
        e.stats.responseTime.description,
        s.stats.responseTime.description
      ),
      icon: Timer,
    },

    {
      title: getBoth(
        e.stats.powerEfficiency.title,
        s.stats.powerEfficiency.title
      ),
      value:
        performance?.powerEfficiency || "...",
      description: getBoth(
        e.stats.powerEfficiency.description,
        s.stats.powerEfficiency.description
      ),
      icon: Zap,
    },

    {
      title: getBoth(
        e.stats.systemStability.title,
        s.stats.systemStability.title
      ),
      value:
        performance?.systemStability || "...",
      description: getBoth(
        e.stats.systemStability.description,
        s.stats.systemStability.description
      ),
      icon: Activity,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            {getBoth(
              e.title,
              s.title
            )}
          </h1>

          <p className="text-muted-foreground mt-2 text-lg">
            {getBoth(
              e.subtitle,
              s.subtitle
            )}
          </p>
        </div>

        {/* Main Summary Card */}
        <div className="rounded-[28px] border border-border/50 bg-gradient-to-br from-emerald-500/10 via-background to-cyan-500/10 p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-3">
            {getBoth(
              e.overviewTitle,
              s.overviewTitle
            )}
          </h2>

          <p className="text-muted-foreground leading-8 text-base">
            {getBoth(
              e.overviewDescription,
              s.overviewDescription
            )}
          </p>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {performanceStats.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-border/50 bg-white p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Icon size={22} />
                    </div>

                    <span className="text-2xl font-bold text-foreground">
                      {item.value}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-7">
                    {item.description}
                  </p>
                </div>
              );
            }
          )}
        </div>

        {/* Footer Insight */}
        <div className="rounded-[24px] border border-border/50 bg-background p-6">
          <h3 className="text-xl font-bold mb-3">
            {getBoth(
              e.researchTitle,
              s.researchTitle
            )}
          </h3>

          <p className="text-muted-foreground leading-8">
            {getBoth(
              e.researchDescription,
              s.researchDescription
            )}
          </p>
        </div>

      </div>
    </AppLayout>
  );
}