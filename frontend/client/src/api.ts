export const API_BASE =
  "http://127.0.0.1:5000";

/* =========================
   IMAGE PREDICTION
========================= */

export const predictImage = async (
  file: File
) => {
  const formData = new FormData();

  formData.append(
    "image",
    file
  );

  const res = await fetch(
    `${API_BASE}/predict`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!res.ok) {
    throw new Error(
      "Image prediction failed"
    );
  }

  return res.json();
};

/* =========================
   VIDEO PREDICTION
========================= */

export const predictVideo = async (
  file: File
) => {
  const formData = new FormData();

  formData.append(
    "image",
    file
  );

  const res = await fetch(
    `${API_BASE}/predict-video`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!res.ok) {
    throw new Error(
      "Video prediction failed"
    );
  }

  return res.json();
};

/* =========================
   GET RECENT DETECTIONS
========================= */

export const getRecentDetections =
  async () => {
    const res = await fetch(
      `${API_BASE}/recent-detections`
    );

    if (!res.ok) {
      throw new Error(
        "Failed to fetch detections"
      );
    }

    return res.json();
  };

/* =========================
   GET DASHBOARD STATS
========================= */

export const getDashboardStats =
  async () => {
    const res = await fetch(
      `${API_BASE}/dashboard-stats`
    );

    if (!res.ok) {
      throw new Error(
        "Failed to fetch stats"
      );
    }

    return res.json();
  };

/* =========================
   GET SYSTEM PERFORMANCE
========================= */

export const getSystemPerformance =
  async () => {
    const res = await fetch(
      `${API_BASE}/system-performance`
    );

    if (!res.ok) {
      throw new Error(
        "Failed to fetch analytics"
      );
    }

    return res.json();
  };

/* =========================
   DELETE DETECTION
========================= */

export const deleteDetection =
  async (id: string) => {
    const res = await fetch(
      `${API_BASE}/delete-detection/${id}`,
      {
        method: "DELETE"
      }
    );

    if (!res.ok) {
      throw new Error(
        "Delete request failed"
      );
    }

    return res.json();
  };

/* =========================
   LIVE FEED
========================= */

export const getLiveFeedUrl =
  () => {
    return `${API_BASE}/live-feed`;
  };