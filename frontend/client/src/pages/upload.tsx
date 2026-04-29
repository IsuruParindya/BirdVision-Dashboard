import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import { predictImage, predictVideo } from "@/api";
import BirdDetailsCard from "@/pages/BirdDetailsCard";
import UploadMediaSection from "@/pages/UploadMediaSection";

import { useLanguage } from "@/pages/LanguageContext";
import en from "@/contents/en";
import sin from "@/contents/sin";

type LangMode = "english" | "sinhala" | "both";

type Result = {
  englishName: string;
  sinhalaName: string;
  confidence: number;
  habitat_en: string;
  diet_en: string;
};

export default function Upload() {
  const [mode, setMode] = useState<"image" | "video">("image");

  const [preview, setPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [result, setResult] = useState<Result | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { language } = useLanguage() as {
    language: LangMode;
  };

  const e = en.upload;
  const s = sin.upload;

  const getBoth = (
    eVal: string,
    sVal: string
  ) =>
    language === "both"
      ? `${eVal} / ${sVal}`
      : language === "sinhala"
      ? sVal
      : eVal;

  const resetState = () => {
    setPreview(null);
    setVideoPreview(null);
    setResult(null);
    setError(null);
  };

  /* =========================
     HANDLE FILE
  ========================= */

  const handleFile = async (file: File) => {
    if (!file) return;

    resetState();
    setLoading(true);

    try {
      /* ================= VIDEO ================= */

      if (file.type.startsWith("video")) {
        setMode("video");

        const data = await predictVideo(file);

        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        /*
          IMPORTANT FIX:
          use base64 video from backend
          NOT video_url
        */

        if (data.video) {
          const binaryString =
            window.atob(data.video);

          const len =
            binaryString.length;

          const bytes =
            new Uint8Array(len);

          for (
            let i = 0;
            i < len;
            i++
          ) {
            bytes[i] =
              binaryString.charCodeAt(i);
          }

          const blob = new Blob(
            [bytes],
            {
              type: "video/mp4"
            }
          );

          const videoUrl =
            URL.createObjectURL(blob);

          setVideoPreview(
            videoUrl
          );
        }

        setResult({
          englishName:
            data.englishName || "",

          sinhalaName:
            data.sinhalaName || "",

          confidence: Math.round(
            (data.confidence || 0) * 100
          ),

          habitat_en:
            data.habitat_en || "",

          diet_en:
            data.diet_en || ""
        });

        setLoading(false);
        return;
      }

      /* ================= IMAGE ================= */

      setMode("image");

      setPreview(
        URL.createObjectURL(file)
      );

      const data =
        await predictImage(file);

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      let conf = Math.round(
        data.confidence * 100
      );

      if (conf >= 100) {
        conf = 99;
      }

      setTimeout(() => {
        if (data.image) {
          setPreview(
            `data:image/jpeg;base64,${data.image}`
          );
        }

        setResult({
          englishName:
            data.englishName || "",

          sinhalaName:
            data.sinhalaName || "",

          confidence: conf,

          habitat_en:
            data.habitat_en || "",

          diet_en:
            data.diet_en || ""
        });

        setLoading(false);
      }, 1200);

    } catch (error) {
      console.error(error);

      setError(
        "Connection failed"
      );

      setLoading(false);
    }
  };

  const hasResult = Boolean(
    preview ||
    videoPreview ||
    result
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 relative">

        {/* LOADING */}
        <AnimatePresence>
          {loading && (
            <motion.div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">

                <div className="w-12 h-12 border-4 border-gray-300 border-t-green-700 rounded-full animate-spin" />

                <p>
                  {getBoth(
                    e.analyzing,
                    s.analyzing
                  )}
                </p>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TITLE */}
        <div className="text-center space-y-4">

          <h1 className="text-4xl font-bold">
            {getBoth(
              e.title,
              s.title
            )}
          </h1>

          <p className="text-gray-500 max-w-xl mx-auto">
            {getBoth(
              e.subtitle,
              s.subtitle
            )}

            <span className="text-green-700 font-medium">
              {" "}
              {getBoth(
                e.liveResults,
                s.liveResults
              )}
            </span>
          </p>

          {/* TAB SWITCH */}
          <div className="flex justify-center gap-4 pt-1">

            <button
              onClick={() => {
                setMode("image");
                resetState();
              }}
              className={`px-5 py-2 rounded-xl ${
                mode === "image"
                  ? "bg-primary/90 text-white"
                  : "bg-gray-200"
              }`}
            >
              {getBoth(
                e.tabImage,
                s.tabImage
              )}
            </button>

            <button
              onClick={() => {
                setMode("video");
                resetState();
              }}
              className={`px-5 py-2 rounded-xl ${
                mode === "video"
                  ? "bg-primary/90 text-white"
                  : "bg-gray-200"
              }`}
            >
              {getBoth(
                e.tabVideo,
                s.tabVideo
              )}
            </button>

          </div>
        </div>

        {/* UPLOAD SECTION */}
        <UploadMediaSection
          mode={mode}
          preview={preview}
          videoPreview={videoPreview}
          result={result}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          setIsDragging={setIsDragging}
          handleFile={handleFile}
          getBoth={getBoth}
          e={e}
          s={s}
        />

        {/* RESULT SECTION */}
        {hasResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            {/* LEFT */}
            <div className="flex justify-center">

              {videoPreview ? (
                <video
                  controls
                  preload="auto"
                  className="rounded-3xl max-h-[500px]"
                >
                  <source
                    src={videoPreview}
                    type="video/mp4"
                  />
                  
                </video>
              ) : preview ? (
                <img
                  src={preview}
                  alt="Bird Preview"
                  className="rounded-3xl max-h-[500px]"
                />
              ) : null}

            </div>

            {/* RIGHT */}
            <BirdDetailsCard
              result={result}
              error={error}
              videoPreview={videoPreview}
              resetState={resetState}
            />

          </div>
        )}
      </div>
    </AppLayout>
  );
}