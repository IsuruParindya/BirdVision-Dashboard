type DetectionResult = {
  mode: "image" | "video";
  preview: string | null;
  videoPreview: string | null;
  result: {
    englishName: string;
    sinhalaName: string;
    confidence: number;
    habitat_en: string;
    habitat_si: string;
    diet_en: string;
    diet_si: string;
  } | null;
};

let imageDetection: DetectionResult | null = null;
let videoDetection: DetectionResult | null = null;

export const detectionStore = {
  saveImage: (data: DetectionResult) => { imageDetection = data; },
  saveVideo: (data: DetectionResult) => { videoDetection = data; },
  getImage: () => imageDetection,
  getVideo: () => videoDetection,
  clearImage: () => { imageDetection = null; },
  clearVideo: () => { videoDetection = null; },
};