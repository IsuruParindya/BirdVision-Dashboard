export const API_BASE = "http://127.0.0.1:5000";

export const predictImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  });

  return res.json();
};

export const predictVideo = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/predict-video`, {
    method: "POST",
    body: formData,
  });

  return res.json();
};