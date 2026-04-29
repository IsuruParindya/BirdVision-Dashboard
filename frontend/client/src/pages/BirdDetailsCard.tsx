import {
  Bird,
  MapPin,
  Drumstick
} from "lucide-react";

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

type Props = {
  result: Result | null;
  error: string | null;
  videoPreview: string | null;
  resetState: () => void;
};

type InfoCardProps = {
  title: string;
  value: string;
  icon?: React.ReactNode;
};

function InfoCard({
  title,
  value,
  icon
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/50 p-4 lg:p-5 transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex gap-3">
        {icon ? (
          <div className="mt-1 shrink-0">
            {icon}
          </div>
        ) : null}

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
            {title}
          </p>

          <p className="text-base font-semibold text-foreground leading-7 whitespace-pre-line">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BirdDetailsCard({
  result,
  error,
  videoPreview,
  resetState
}: Props) {
  const { language } = useLanguage() as {
    language: LangMode;
  };

  const e = en.birdDetailsCard;
  const s = sin.birdDetailsCard;

  const getBoth = (
    eVal: string,
    sVal: string
  ) =>
    language === "both"
      ? `${eVal} / ${sVal}`
      : language === "sinhala"
      ? sVal
      : eVal;

  return (
    <div className="glass-card rounded-[28px] p-5 lg:p-7 h-fit">

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-5">
          ⚠️ {error}
        </div>
      )}

      {/* RESULT */}
      {result ? (
        <>
          {/* HEADER */}
          <div className="flex items-center gap-3 pb-5 border-b border-border/50">
            <div className="h-12 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Bird size={24} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">
                {getBoth(
                  e.title,
                  s.title
                )}
              </h3>

              <p className="text-sm text-muted-foreground">
                {getBoth(
                  e.subtitle,
                  s.subtitle
                )}
              </p>
            </div>
          </div>

          {/* CONTENT */}
          <div className="mt-6 space-y-4">
            <InfoCard
              title={getBoth(
                e.englishName,
                s.englishName
              )}
              value={
                result.englishName || "-"
              }
            />

            <InfoCard
              title={getBoth(
                e.sinhalaName,
                s.sinhalaName
              )}
              value={
                result.sinhalaName || "-"
              }
            />

            <InfoCard
              title={getBoth(
                e.dietHabitat,
                s.dietHabitat
              )}
              value={`${getBoth(
                e.diet,
                s.diet
              )}: ${result.diet_en || "-"}

              ${getBoth(
                e.habitat,
                s.habitat
              )}: ${result.habitat_en || "-"}`}
              icon={
                <div className="flex flex-col gap-2">
                  <Drumstick
                    size={18}
                    className="text-primary"
                  />

                  <MapPin
                    size={18}
                    className="text-primary"
                  />
                </div>
              }
            />
          </div>
        </>
      ) : (
        /* EMPTY STATE */
        <div className="py-16 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Bird size={26} />
            </div>
          </div>

          <h3 className="text-lg font-semibold">
            No Detection Yet
          </h3>

          <p className="text-sm text-muted-foreground mt-2">
            Upload an image or video
            to see bird details here
          </p>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="mt-8 flex items-center justify-between gap-4">

        {videoPreview ? (
          <a
            href={videoPreview}
            download="processed-video.mp4"
            className="px-5 py-3 bg-primary/90 text-white rounded-xl min-w-[170px] text-center"
          >
            {getBoth(
              e.downloadVideo,
              s.downloadVideo
            )}
          </a>
        ) : (
          <div />
        )}

        <button
          onClick={resetState}
          className="px-5 py-3 bg-primary/90 text-white rounded-xl min-w-[170px] text-center"
        >
          {getBoth(
            e.uploadAnother,
            s.uploadAnother
          )}
        </button>

      </div>
    </div>
  );
}