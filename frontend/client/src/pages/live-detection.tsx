import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Camera,
  StopCircle,
  Play,
  Maximize,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { getLiveFeedUrl } from "@/api";
import en from "@/contents/en";
import sin from "@/contents/sin";

type LangMode = "english" | "sinhala" | "both";

export default function LiveDetection() {
  const { language } = useLanguage() as { language: LangMode };

  const [isScanning, setIsScanning] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(0);

  const e = en.liveDetection;
  const s = sin.liveDetection;

  const getBoth = (eVal: string, sVal: string) =>
    language === "both"
      ? `${eVal} / ${sVal}`
      : language === "sinhala"
      ? sVal
      : eVal;

  const streamUrl = `${getLiveFeedUrl()}?camera=${selectedCamera}`;

  const toggleScan = () => {
    setIsScanning(!isScanning);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] gap-6">

        {/* Header */}
        <div className="flex justify-between items-start gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">
              {getBoth(e.title, s.title)}
            </h1>

            <p className="text-muted-foreground mt-2">
              {getBoth(e.subtitle, s.subtitle)}
            </p>
          </div>

          {/* Camera Switch Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCamera(0)}
              className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                selectedCamera === 0
                  ? "bg-primary/90 text-white shadow-lg"
                  : "bg-white border text-gray-700 hover:bg-gray-50"
              }`}
            >
              Laptop Camera
            </button>

            <button
              onClick={() => setSelectedCamera(1)}
              className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                selectedCamera === 1
                  ? "bg-primary/90 text-white shadow-lg"
                  : "bg-white border text-gray-700 hover:bg-gray-50"
              }`}
            >
              External Camera
            </button>
          </div>
        </div>

        {/* Camera Stage */}
        <div className="relative flex-1 rounded-[32px] overflow-hidden bg-white shadow-2xl border-2 border-dashed border-primary/30 flex items-center justify-center group">

          {/* Live Label */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-30">
            <Camera className="w-6 h-6 text-accent animate-pulse" />

            <span className="text-accent font-semibold">
              {getBoth(e.liveLabel, s.liveLabel)}
            </span>
          </div>

          {/* Small Live Status Alert */}
          {isScanning && (
            <div className="absolute top-4 right-4 z-30 bg-green-100 text-green-700 px-4 py-2 rounded-full shadow-md text-sm font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/90 animate-pulse" />
              Live Detection Active
            </div>
          )}

          {/* Live Stream */}
          {isScanning ? (
            <img
              src={streamUrl}
              alt="Live Feed"
              className="w-full h-full object-cover transition-opacity duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-black/40 text-center px-6">
              <Camera className="w-16 h-16 mb-4 opacity-50" />

              <p className="text-lg font-medium tracking-wide">
                {getBoth(e.paused, s.paused)}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-8 inset-x-0 z-30 px-8">
            <div className="relative w-full h-11">

              {/* Start / Stop */}
              <div className="absolute left-1/2 -translate-x-1/2">
                <button
                  onClick={toggleScan}
                  className={`h-11 inline-flex items-center justify-center gap-2 px-5 rounded-xl font-bold text-base shadow-xl transition-all duration-300 ${
                    isScanning
                      ? "bg-red-500/90 text-white hover:bg-red-500 backdrop-blur-md hover:shadow-red-500/25"
                      : "bg-primary/90 text-white hover:bg-primary backdrop-blur-md hover:shadow-primary/25 hover:-translate-y-0.5"
                  }`}
                >
                  {isScanning ? (
                    <>
                      <StopCircle className="w-5 h-5" />
                      {getBoth(e.stop, s.stop)}
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      {getBoth(e.start, s.start)}
                    </>
                  )}
                </button>
              </div>

              {/* Maximize */}
              <div className="absolute right-0">
                <button
                  type="button"
                  className="h-11 w-11 inline-flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20"
                  aria-label="Maximize"
                >
                  <Maximize className="w-6 h-6" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}