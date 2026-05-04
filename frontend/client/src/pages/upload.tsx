import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import { predictImage, predictVideo } from "@/api";
import BirdDetailsCard from "@/pages/BirdDetailsCard";
import UploadMediaSection from "@/pages/UploadMediaSection";
import { useLanguage } from "@/pages/LanguageContext";
import en from "@/contents/en";
import sin from "@/contents/sin";

// ─── Types ────────────────────────────────────────────────────────────────────

type LangMode = "english" | "sinhala" | "both";

type Result = {
  englishName: string;
  sinhalaName: string;
  confidence: number;
  habitat_en: string;
  habitat_si: string;
  diet_en: string;
  diet_si: string;
};

type TabState = {
  preview:   string | null;   // bounding-box image (image tab) or snapshot (video tab)
  result:    Result | null;
  videoBlob: string | null;   // live video URL — only while on video tab
};

// ─── Persistent in-memory store (survives sidebar navigation) ─────────────────

const store: { image: TabState; video: TabState } = {
  image: { preview: null, result: null, videoBlob: null },
  video: { preview: null, result: null, videoBlob: null },
};

// ─── Capture a frame from a <video> element as a JPEG data-URL ────────────────

function captureVideoFrame(videoEl: HTMLVideoElement): string | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width  = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    canvas.getContext("2d")?.drawImage(videoEl, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return null;
  }
}

// ─── Send snapshot to backend to persist after refresh ────────────────────────

async function saveSnapshotToBackend(snapshot: string): Promise<string | null> {
  try {
    const res = await fetch("/api/save-video-snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.image_url || null;
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Upload() {
  const { language } = useLanguage() as { language: LangMode };
  const e = en.upload;
  const s = sin.upload;

  const getBoth = (eVal: string, sVal: string) =>
    language === "both" ? `${eVal} / ${sVal}` : language === "sinhala" ? sVal : eVal;

  const [mode,       setMode]       = useState<"image" | "video">("image");
  const [preview,    setPreview]    = useState<string | null>(store.image.preview);
  const [videoBlob,  setVideoBlob]  = useState<string | null>(store.video.videoBlob);
  const [result,     setResult]     = useState<Result | null>(store.image.result);
  const [error,      setError]      = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoElRef   = useRef<HTMLVideoElement>(null);
  const modeRef      = useRef(mode); // ref so cleanup effects always read latest mode

  // Keep modeRef in sync
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // ── Restore last detections from DB on fresh page load ──────────────────────
  useEffect(() => {
    const fetchLatest = async (type: "image" | "video") => {
      try {
        const res = await fetch(`/api/latest-detection/${type}`);
        if (!res.ok || res.status === 204) return;

        const data = await res.json();
        if (!data) return;

        const result: Result = {
          englishName: data.english_name,
          sinhalaName: data.sinhala_name,
          confidence:  data.confidence,
          habitat_en:  data.habitat || "",
          habitat_si:  "",
          diet_en:     data.diet    || "",
          diet_si:     "",
        };

        if (type === "image") {
          store.image.preview = data.image_url || null;
          store.image.result  = result;
        } else {
          // Snapshot saved by backend on last leave — restore it if present
          store.video.preview = data.image_url || null;
          store.video.result  = result;
        }
      } catch (err) {
        console.error(`Failed to restore ${type} detection:`, err);
      }
    };

    const restoreAll = async () => {
      if (!store.image.result) await fetchLatest("image");
      if (!store.video.result) await fetchLatest("video");

      // Load image tab into state (default tab on mount)
      setPreview(store.image.preview);
      setResult(store.image.result);
    };

    restoreAll();
  }, []);

  // ── Snapshot + save to backend when component unmounts (sidebar navigation) ──
  useEffect(() => {
    return () => {
      if (modeRef.current === "video" && videoElRef.current) {
        const snapshot = captureVideoFrame(videoElRef.current);
        if (snapshot) {
          store.video.preview   = snapshot;
          store.video.videoBlob = null;
          // Fire-and-forget: save snapshot to backend so it survives refresh
          saveSnapshotToBackend(snapshot);
        }
      }
    };
  }, []);

  // ── Switch between Image / Video tabs ────────────────────────────────────────
  const switchTab = async (next: "image" | "video") => {
    if (next === mode) return;

    // Snapshot video before leaving video tab
    if (mode === "video" && videoElRef.current) {
      const snapshot = captureVideoFrame(videoElRef.current);
      if (snapshot) {
        store.video.preview   = snapshot;
        store.video.videoBlob = null;
        // Save snapshot to backend so it survives refresh
        saveSnapshotToBackend(snapshot);
      }
    }

    setMode(next);
    setError(null);

    if (next === "image") {
      setPreview(store.image.preview);
      setVideoBlob(null);
      setResult(store.image.result);
    } else {
      setPreview(store.video.preview);
      setVideoBlob(store.video.videoBlob);
      setResult(store.video.result);
    }
  };

  // ── Reset current tab ────────────────────────────────────────────────────────
  const resetState = () => {
    setPreview(null);
    setVideoBlob(null);
    setResult(null);
    setError(null);

    if (mode === "image") {
      store.image = { preview: null, result: null, videoBlob: null };
    } else {
      store.video = { preview: null, result: null, videoBlob: null };
    }
  };

  // ── Build and apply result object ────────────────────────────────────────────
  const applyResult = (data: any, confidence: number): Result => {
    const r: Result = {
      englishName: data.englishName || "",
      sinhalaName: data.sinhalaName || "",
      confidence,
      habitat_en:  data.habitat_en  || "",
      habitat_si:  data.habitat_si  || "",
      diet_en:     data.diet_en     || "",
      diet_si:     data.diet_si     || "",
    };
    setResult(r);
    return r;
  };

  // ── Handle uploaded file ─────────────────────────────────────────────────────
  const handleFile = async (file: File) => {
    if (!file) return;
    resetState();
    setLoading(true);

    try {
      /* ── VIDEO ── */
      if (file.type.startsWith("video")) {
        setMode("video");

        const data = await predictVideo(file);
        if (data.error) { setError(data.error); setLoading(false); return; }

        if (data.video) {
          const bytes = Uint8Array.from(atob(data.video), c => c.charCodeAt(0));
          const blob  = new Blob([bytes], { type: "video/mp4" });
          const url   = URL.createObjectURL(blob);
          setVideoBlob(url);
          store.video.videoBlob = url;
        }

        const r = applyResult(data, Math.round((data.confidence || 0) * 100));
        store.video.result  = r;
        store.video.preview = null; // snapshot taken on leave
        setLoading(false);
        return;
      }

      /* ── IMAGE ── */
      setMode("image");

      // Show original immediately while API processes
      const immediateUrl = URL.createObjectURL(file);
      setPreview(immediateUrl);

      const data = await predictImage(file);
      if (data.error) { setError(data.error); setLoading(false); return; }

      let conf = Math.round((data.confidence || 0) * 100);
      if (conf >= 100) conf = 99;

      setTimeout(() => {
        // Replace with bounding-box version from API
        const bbUrl = data.image
          ? `data:image/jpeg;base64,${data.image}`
          : immediateUrl;

        setPreview(bbUrl);
        store.image.preview = bbUrl;

        const r = applyResult(data, conf);
        store.image.result = r;
        setLoading(false);
      }, 1200);

    } catch {
      setError("Connection failed");
      setLoading(false);
    }
  };

  const hasResult = Boolean(preview || videoBlob || result);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            {getBoth(e.title, s.title)}
          </h1>

          <p className="text-gray-500 max-w-xl mx-auto">
            {getBoth(e.subtitle, s.subtitle)}
            <span className="text-green-700 font-medium">
              {" "}{getBoth(e.liveResults, s.liveResults)}
            </span>
          </p>

          {/* Tab switcher */}
          <div className="flex justify-center gap-4 pt-1">
            {(["image", "video"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className={`px-5 py-2 rounded-xl ${
                  mode === tab ? "bg-primary/90 text-white" : "bg-gray-200"
                }`}
              >
                {tab === "image"
                  ? getBoth(e.tabImage, s.tabImage)
                  : getBoth(e.tabVideo, s.tabVideo)}
              </button>
            ))}
          </div>
        </div>

        {/* Upload + result */}
        <div className="relative space-y-10">

          {/* Loading overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-green-700 rounded-full animate-spin" />
                  <p>{getBoth(e.analyzing, s.analyzing)}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload dropzone */}
          <UploadMediaSection
            mode={mode}
            preview={preview}
            videoPreview={videoBlob}
            result={result}
            isDragging={isDragging}
            fileInputRef={fileInputRef}
            setIsDragging={setIsDragging}
            handleFile={handleFile}
            getBoth={getBoth}
            e={e}
            s={s}
          />

          {/* Result row */}
          {hasResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

              {/* Left — media preview */}
              <div className="flex justify-center">
                {videoBlob ? (
                  // Live video — ref attached so we can snapshot on leave
                  <video
                    ref={videoElRef}
                    controls
                    preload="auto"
                    className="rounded-3xl max-h-[500px]"
                  >
                    <source src={videoBlob} type="video/mp4" />
                  </video>
                ) : preview ? (
                  // Bounding-box image OR video snapshot
                  <img
                    src={preview}
                    alt="Bird Preview"
                    className="rounded-3xl max-h-[500px]"
                  />
                ) : null}
              </div>

              {/* Right — bird details */}
              <BirdDetailsCard
                result={result}
                error={error}
                videoPreview={videoBlob}
                resetState={resetState}
              />
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}