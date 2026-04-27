# 🐦 BirdVision

BirdVision is a full-stack bird recognition system that detects and classifies bird species from images and videos using deep learning.

## 🚀 Features
- Image and Video bird detection
- YOLOv8 object detection
- ResNet50 species classification
- Sinhala + English bilingual output
- Real-time video processing
- Interactive dashboard UI

## 🛠 Tech Stack
- **Backend:** Flask API, PyTorch, OpenCV
- **Frontend:** React, TypeScript, Tailwind CSS
- **Models:** YOLOv8 (Detection) + ResNet50 (Classification)

## ⚙️ Setup for the Backend

### Backend
```bash
cd backend
py -3.11 -m venv venv
venv\Scripts\activate
(venv_final\Scripts\activate)
pip install -r requirements.txt
python app.py
```

### Frontend
```
cd frontend
npm install
npm run dev
```

## 📸 Usage
Upload an image or video → system detects bird → shows:
- Name (English + Sinhala)
- Confidence
- Habitat & diet info

## 📌 Notes
- Ensure correct dependencies (numpy + opencv compatibility)

---

🔥 Built for real-time biodiversity monitoring and edge AI applications