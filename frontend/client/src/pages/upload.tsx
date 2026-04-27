import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { ImageUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Result = {
  englishName: string;
  sinhalaName: string;
  confidence: number;
  category: string;
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

  const resetState = () => {
    setPreview(null);
    setVideoPreview(null);
    setResult(null);
    setError(null);
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    resetState();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      if (file.type.startsWith("video")) {
        setMode("video");

        const res = await fetch("http://127.0.0.1:5000/predict-video", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          const byteCharacters = atob(data.video);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "video/mp4" });
          const videoUrl = URL.createObjectURL(blob);

          setVideoPreview(videoUrl);

          if (data.englishName) {
            setResult({
              englishName: data.englishName,
              sinhalaName: data.sinhalaName || "",
              confidence: Math.round(data.confidence * 100),
              category: data.category || "",
              habitat_en: data.habitat_en || "",
              diet_en: data.diet_en || "",
            });
          }
        }

        setLoading(false);
        return;
      }

      // IMAGE
      setMode("image");
      setPreview(URL.createObjectURL(file));

      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        let conf = Math.round(data.confidence * 100);
        if (conf >= 100) conf = 99;

        setTimeout(() => {
          if (data.image) {
            setPreview(`data:image/jpeg;base64,${data.image}`);
          }

          setResult({
            englishName: data.englishName,
            sinhalaName: data.sinhalaName,
            confidence: conf,
            category: data.category,
            habitat_en: data.habitat_en,
            diet_en: data.diet_en,
          });

          setLoading(false);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setError("Connection failed");
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 relative">

        {/* LOADING */}
        <AnimatePresence>
          {loading && (
            <motion.div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-green-700 rounded-full animate-spin"></div>
                <p>Analyzing...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className="text-4xl text-center font-bold">Analyze Media</h1>

        {/* MODE SWITCH */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => { setMode("image"); resetState(); }}
            className={`px-5 py-2 rounded-xl ${
              mode === "image" ? "bg-green-700 text-white" : "bg-gray-200"
            }`}
          >
            Image
          </button>

          <button
            onClick={() => { setMode("video"); resetState(); }}
            className={`px-5 py-2 rounded-xl ${
              mode === "video" ? "bg-green-700 text-white" : "bg-gray-200"
            }`}
          >
            Video
          </button>
        </div>

        {/* UPLOAD */}
        {!preview && !videoPreview && (
          <div
            className={`border-2 border-dashed p-16 text-center rounded-3xl cursor-pointer transition-all duration-200
              ${isDragging 
                ? "bg-green-50 border-green-600 scale-[1.03] shadow-lg shadow-green-200"
                : "bg-white border-gray-300"
              }`}
            onClick={() => fileInputRef.current?.click()}

            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}

            onDragLeave={() => setIsDragging(false)}

            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);

              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
          >
            <ImageUp
              className={`mx-auto mb-4 transition-all ${
                isDragging ? "text-green-700 scale-110" : ""
              }`}
              size={50}
            />

            <p className="font-medium">
              {isDragging
                ? "Drop it here 👇"
                : `Click or Drag ${mode === "image" ? "Image" : "Video"}`
              }
            </p>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept={mode === "image" ? "image/*" : "video/*"}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        )}

        {/* RESULT */}
        {(preview || videoPreview) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            {/* LEFT */}
            <div className="flex justify-center">
              {videoPreview ? (
                <video src={videoPreview} controls className="rounded-3xl max-h-[500px]" />
              ) : (
                <img src={preview!} className="rounded-3xl max-h-[500px]" />
              )}
            </div>

            {/* RIGHT */}
            <div className="bg-white p-8 rounded-3xl shadow-xl space-y-6 h-fit">
              {error && <p className="text-red-500">{error}</p>}

              {result && (
                <>
                  <h2 className="text-2xl font-bold">Bird Details</h2>
                  <p><strong>Category:</strong> {result.category}</p>
                  <p><strong>Habitat:</strong> {result.habitat_en}</p>
                  <p><strong>Diet:</strong> {result.diet_en}</p>
                </>
              )}

              <div className="flex gap-4">
                {videoPreview && (
                  <a href={videoPreview} download="processed-video.mp4" className="px-5 py-3 bg-black text-white rounded-xl">
                    Download Video
                  </a>
                )}

                <button onClick={resetState} className="px-5 py-3 bg-black text-white rounded-xl">
                  Upload Another
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </AppLayout>
  );
}