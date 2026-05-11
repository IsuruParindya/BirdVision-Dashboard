export default {
  birdInsights: {
    title: "Bird Insights",
    subtitle:
      "Explore rare and important bird species identified through BirdVision.",
    badge: "Rare Bird Spotlight",
    panelTitle: "Species Profile",
    panelDesc: "A highlighted rare species recognized by the system.",
    englishName: "English Name",
    sinhalaName: "Sinhala Name",
    food: "Usually Eats",
    whereFound: "Where You Can See Them",
    rarity: "Conservation Status",
    about: "About This Bird",
    imageTitle: "Featured Species",
    imageDesc: "Rare bird highlight",
    lastDetected: "Last detected 2 hours ago",
  },

  dashboard: {
    title: "Dashboard",
    subtitle: "Real-time bird species monitoring and identification system.",

    recentImageDetections: "Recent Image Detections",
    recentVideoDetections: "Recent Video Detections",

    stats: {
      totalDetections: "Total Detections",
      speciesIdentified: "Bird Species Identified",
      avgConfidence: "Avg. Confidence",
      mostDetected: "Most Detected",
    },

    recentDetections: "Recent Detections",
    image: "Image",
    video: "Video",
    confidence: "Confidence",
    habitat: "Habitat",
    diet: "Diet",
    justNow: "Just now",

    defaultBirdEN: "Black-hooded Oriole",
    defaultHabitatEN: "Forests, Gardens",
    defaultDietEN: "Fruits, Nectar, Insects",
    notRecognizedEN: "Not Recognized",
  },

  liveDetection: {
    title: "Live Detection",
    subtitle: "Real-time species recognition using your camera.",

    thresholdLabel: "Confidence Threshold",
    paused: "Camera paused. Click Start to begin detection.",

    start: "Start",
    stop: "Stop",
    detectedMatch: "Detected Match",
    confidence: "Confidence",
    audio: "Audio",
    liveLabel: "Live Feed",

    // Camera selector
    laptopCamera: "Laptop",
    externalCamera: "External",

    // Side panel
    sectionStatus: "Status",
    sectionCamera: "Camera",
    sectionTips: "Tips",

    statusActive: "Active",
    statusIdle: "Idle",
    statusDetecting: "Detecting species in real-time",
    statusStandby: "Standby",

    tip1: "Point camera at bird clearly.",
    tip2: "Ensure good lighting.",
    tip3: "Keep camera steady.",

    // Top label
    realTimeRecognition: "Real-Time Recognition",

    // Best time card
    bestTimeTitle: "Best Time",
    bestTimeDesc: "Early morning (6–9 AM) is ideal for spotting active bird species.",
  },

  upload: {
    title: "Analyze Media",
    subtitle:
      "Upload images or videos of birds from your gallery for instant species identification.",

    tabImage: "Image",
    tabVideo: "Video",

    dragTitle: "Drag & Drop to Upload",
    dragDesc:
      "Supports JPG, PNG, MP4 up to 50MB. High resolution recommended for better accuracy.",

    browse: "Browse Files",
    clear: "Clear",

    resultTitle: "Analysis Result",
    processing: "Processing media via neural network...",

    primaryMatch: "Primary Match",
    confidenceScore: "Confidence Score",
    saveDb: "Save to Database",

    liveResults: "Real-time Sinhala + English results.",
    dropHere: "Drop it here",
    clickOrDragImage: "Click or Drag Image",
    clickOrDragVideo: "Click or Drag Video",
    analyzing: "Analyzing...",
  },

  birdDetailsCard: {
    title: "Bird Details",
    subtitle: "Detected Bird Information",

    englishName: "English Name",
    sinhalaName: "Sinhala Name",

    dietHabitat: "Diet & Habitat",
    diet: "Diet",
    habitat: "Habitat",

    downloadVideo: "Download Video",
    uploadAnother: "Upload Another",
  },

  systemPerformance: {
    title: "System Performance",
    subtitle:
      "Real-time monitoring of BirdVision model performance and system efficiency",

    overviewTitle: "Performance Overview",
    overviewDescription:
      "BirdVision is optimized for edge-based biodiversity monitoring using YOLOv8 object detection and ResNet50 classification. The system balances predictive performance, low latency, and hardware efficiency for smooth real-time bird recognition across image, video, and live camera feeds.",

    researchTitle: "Research Insight",
    researchDescription:
      "Performance improves significantly on GPU-enabled devices such as gaming laptops and NVIDIA Jetson edge devices. CPU-only systems can still run the platform successfully, but live feed detection may operate with slightly reduced smoothness due to heavier inference workload.",

    stats: {
      modelAccuracy: {
        title: "Model Accuracy",
        value: "90%",
        description: "YOLOv8 + ResNet50 overall detection accuracy",
      },
      inferenceSpeed: {
        title: "Inference Speed",
        value: "25 FPS",
        description: "Average live feed detection speed on GPU devices",
      },
      cpuUsage: {
        title: "CPU Usage",
        value: "65%",
        description: "Average CPU load during real-time detection",
      },
      responseTime: {
        title: "Response Time",
        value: "0.4s",
        description: "Average detection response latency",
      },
      powerEfficiency: {
        title: "Power Efficiency",
        value: "Optimized",
        description: "Designed for edge-based deployment",
      },
      systemStability: {
        title: "System Stability",
        value: "High",
        description: "Smooth detection with optimized live feed",
      },
    },
  },

  settings: {
    title: "Settings",
    subtitle: "Configure your system preferences.",

    displayLanguage: "Display Language",

    languageTab: "Language",
    notificationsTab: "Notifications",
    dataStorageTab: "Data Storage",
    privacyTab: "Privacy",

    notification: "Language set to",

    options: {
      english: {
        label: "English Only",
        desc: "Display all UI and results in English.",
      },
      sinhala: {
        label: "Sinhala Only (සිංහල)",
        desc: "Display all UI and results in Sinhala.",
      },
      both: {
        label: "Bilingual (Recommended)",
        desc: "Display English with prominent Sinhala translations.",
      },
    },
  },

  sidebar: {
    systemOnline: "System Online",
    bilingualSupports: "Bilingual Supports",

    nav: {
      dashboard: "Dashboard",
      liveDetection: "Live Detection",
      upload: "Upload",
      systemPerformance: "Performance",
      settings: "Settings",
    },
  },
};