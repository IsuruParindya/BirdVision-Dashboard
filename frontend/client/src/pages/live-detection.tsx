import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Camera,
  StopCircle,
  Play,
  Maximize,
  Radio,
  SwitchCamera,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { getLiveFeedUrl, API_BASE } from "@/api";
import en from "@/contents/en";
import sin from "@/contents/sin";

type LangMode = "english" | "sinhala" | "both";

export default function LiveDetection() {
  const { language } = useLanguage() as { language: LangMode };
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [streamKey, setStreamKey] = useState(0);

  const e = en.liveDetection;
  const s = sin.liveDetection;

  const getBoth = (eVal: string, sVal: string) =>
    language === "both"
      ? `${eVal} / ${sVal}`
      : language === "sinhala"
      ? sVal
      : eVal;

  const streamUrl = `${getLiveFeedUrl()}?camera=${selectedCamera}&t=${streamKey}`;

  const toggleScan = async () => {
    if (isScanning) {
      try {
        await fetch(`${API_BASE}/stop-live-feed`, { method: "POST" });
      } catch (error) {
        console.error("Failed to stop camera:", error);
      }
      setIsScanning(false);
      setStreamKey((prev) => prev + 1);
    } else {
      setIsScanning(true);
    }
  };

  const switchCamera = async (cameraIndex: number) => {
    if (selectedCamera === cameraIndex) return;

    if (isScanning) {
      try {
        await fetch(`${API_BASE}/stop-live-feed`, { method: "POST" });
      } catch (error) {
        console.error("Failed stopping old camera:", error);
      }
    }

    setSelectedCamera(cameraIndex);
    setStreamKey((prev) => prev + 1);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full gap-0 pb-1">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary/60 mb-1">
              {getBoth(e.realTimeRecognition, s.realTimeRecognition)}
            </p>

            <h1 className="text-3xl font-display font-bold text-foreground leading-none">
              {getBoth(e.title, s.title)}
            </h1>

            <p className="text-sm text-muted-foreground mt-1.5">
              {getBoth(e.subtitle, s.subtitle)}
            </p>
          </div>

          {/* Camera selector */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200">
            <button
              onClick={() => switchCamera(0)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                selectedCamera === 0
                  ? "bg-white text-primary shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Camera className="w-4 h-4" />
              {getBoth(e.laptopCamera, s.laptopCamera)}
            </button>

            <button
              onClick={() => switchCamera(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                selectedCamera === 1
                  ? "bg-white text-primary shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <SwitchCamera className="w-4 h-4" />
              {getBoth(e.externalCamera, s.externalCamera)}
            </button>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div className="flex gap-4 min-h-0 flex-1">

          {/* Feed */}
          <div className="relative flex-1 aspect-video rounded-3xl overflow-hidden bg-gray-950 shadow-2xl">

            {isScanning ? (
              <img
                key={streamKey}
                src={streamUrl}
                alt="Live Feed"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative flex items-center justify-center">
                  <span
                    className="absolute w-32 h-32 rounded-full border border-primary/10 animate-ping"
                    style={{ animationDuration: "3s" }}
                  />
                  <span className="absolute w-24 h-24 rounded-full border border-primary/20" />
                  <span className="absolute w-16 h-16 rounded-full border border-primary/30" />

                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-primary/50" />
                  </div>
                </div>

                <p className="text-white/30 text-sm font-medium tracking-wide text-center px-8">
                  {getBoth(e.paused, s.paused)}
                </p>
              </div>
            )}

            {/* Live badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <Radio
                className={`w-3.5 h-3.5 ${
                  isScanning ? "text-emerald-400" : "text-white/30"
                }`}
              />

              <span
                className={`text-xs font-semibold tracking-wide ${
                  isScanning ? "text-emerald-300" : "text-white/30"
                }`}
              >
                {isScanning
                  ? getBoth(e.liveLabel, s.liveLabel)
                  : getBoth(e.statusStandby, s.statusStandby)}
              </span>
            </div>

            {/* Maximize */}
            <button
              type="button"
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm text-white/60 hover:text-white hover:bg-black/50 transition-all border border-white/10"
              aria-label="Maximize"
            >
              <Maximize className="w-4 h-4" />
            </button>

            {/* Bottom control */}
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-center p-5 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
              <button
                onClick={toggleScan}
                className={`inline-flex items-center gap-2.5 px-7 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all duration-300 ${
                  isScanning
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {isScanning ? (
                  <>
                    <StopCircle className="w-4 h-4" />
                    {getBoth(e.stop, s.stop)}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    {getBoth(e.start, s.start)}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-56 flex flex-col gap-3 shrink-0 min-h-0">

            {/* Status */}
            <div
              className={`rounded-2xl p-4 border transition-all duration-500 ${
                isScanning
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                {getBoth(e.sectionStatus, s.sectionStatus)}
              </p>

              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isScanning ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                  }`}
                />

                <span
                  className={`text-sm font-bold ${
                    isScanning ? "text-emerald-700" : "text-gray-400"
                  }`}
                >
                  {isScanning
                    ? getBoth(e.statusActive, s.statusActive)
                    : getBoth(e.statusIdle, s.statusIdle)}
                </span>
              </div>

              {isScanning && (
                <p className="text-xs text-emerald-600 mt-2 leading-relaxed">
                  {getBoth(e.statusDetecting, s.statusDetecting)}
                </p>
              )}
            </div>

            {/* Camera */}
            <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200">
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                {getBoth(e.sectionCamera, s.sectionCamera)}
              </p>

              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />

                <span className="text-sm font-semibold text-gray-700">
                  {selectedCamera === 0
                    ? getBoth(e.laptopCamera, s.laptopCamera)
                    : getBoth(e.externalCamera, s.externalCamera)}
                </span>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl p-4 bg-primary/5 border border-primary/15">
              <p className="text-xs font-semibold tracking-widest uppercase text-primary/50 mb-3">
                {getBoth(e.sectionTips, s.sectionTips)}
              </p>

              <ul className="space-y-2.5">
                {(["tip1", "tip2", "tip3"] as const).map((key, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed"
                  >
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                      {i + 1}
                    </span>

                    {getBoth(e[key], s[key])}
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Time */}
            <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200 flex-1">
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                {getBoth(e.bestTimeTitle, s.bestTimeTitle)}
              </p>

              <p className="text-xs text-gray-500 leading-relaxed">
                {getBoth(e.bestTimeDesc, s.bestTimeDesc)}
              </p>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}