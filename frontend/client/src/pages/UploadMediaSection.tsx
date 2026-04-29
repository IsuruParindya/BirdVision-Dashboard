import { ImageUp } from "lucide-react";
import React from "react";

type Props = {
  mode: "image" | "video";
  preview: string | null;
  videoPreview: string | null;
  result: unknown | null;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  setIsDragging: (value: boolean) => void;
  handleFile: (file: File) => void;
  getBoth: (eVal: string, sVal: string) => string;
  e: any;
  s: any;
};

export default function UploadMediaSection({
  mode,
  preview,
  videoPreview,
  result,
  isDragging,
  fileInputRef,
  setIsDragging,
  handleFile,
  getBoth,
  e,
  s,
}: Props) {
  if (preview || videoPreview || result) {
    return null;
  }

  return (
    <div
      className={`
        border-2 border-dashed
        p-16
        text-center
        rounded-3xl
        cursor-pointer
        transition-all duration-200
        ${
          isDragging
            ? "bg-green-50 border-green-600 scale-[1.03] shadow-lg shadow-green-200"
            : "bg-white border-gray-300"
        }
      `}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => {
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];

        if (file) {
          handleFile(file);
        }
      }}
    >
      <ImageUp
        size={50}
        className={`mx-auto mb-4 ${
          isDragging
            ? "text-green-700 scale-110"
            : ""
        }`}
      />

      <p className="font-medium">
        {isDragging
          ? getBoth(
              e.dropHere,
              s.dropHere
            )
          : mode === "image"
          ? getBoth(
              e.clickOrDragImage,
              s.clickOrDragImage
            )
          : getBoth(
              e.clickOrDragVideo,
              s.clickOrDragVideo
            )}
      </p>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={
          mode === "image"
            ? "image/*"
            : "video/*"
        }
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            handleFile(file);
          }
        }}
      />
    </div>
  );
}