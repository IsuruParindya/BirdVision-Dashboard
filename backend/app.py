import os, cv2, json, torch, numpy as np, base64, tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont
from torchvision import transforms, models
from torch import nn
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# ---- Paths ----
base = os.path.join(os.path.dirname(__file__), "models")
font_path = os.path.join(os.path.dirname(__file__), "fonts", "NotoSansSinhala-Regular.ttf")

pth = os.path.join(base, "bird_resnet50.pth")
cls = os.path.join(base, "classes.json")
si  = os.path.join(base, "sinhala_map.json")
info_path = os.path.join(base, "species_info.json")
yolo_path = os.path.join(base, "best.pt")

# ---- Load JSON ----
classes = json.load(open(cls, encoding="utf-8"))
sinhala = json.load(open(si, encoding="utf-8"))
species_info = json.load(open(info_path, encoding="utf-8"))

device = torch.device("cpu")

# ---- Model ----
clf = models.resnet50(weights=None)
clf.fc = nn.Linear(clf.fc.in_features, len(classes))
clf.load_state_dict(torch.load(pth, map_location=device))
clf = clf.eval()

detector = YOLO(yolo_path)

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])

def classify(img):
    img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    x = transform(img).unsqueeze(0)

    with torch.no_grad():
        probs = torch.softmax(clf(x), dim=1)
        conf, pred = torch.max(probs,1)

    return classes[int(pred)], float(conf)

# ---- FONT ----
def load_font(size):
    try:
        return ImageFont.truetype(font_path, size)
    except:
        return ImageFont.load_default()

def draw_sinhala(draw, x, y, text, font):
    for ch in text:
        draw.text((x, y), ch, font=font, fill=(0,0,0))
        x += font.getbbox(ch)[2]

# ---- Dynamic label drawing ----
def draw_label(frame, x1, y1, x2, y2, english, sinhala_name, conf):
    h, w, _ = frame.shape
    scale = max(w, h) / 800

    font_size_en = max(16, int(20 * scale))
    font_size_si = max(14, int(18 * scale))
    font_en_dynamic = load_font(font_size_en)
    font_si_dynamic = load_font(font_size_si)

    box_w = int(300 * scale)
    box_h = int(55 * scale)
    padding = int(5 * scale)
    thickness = max(2, int(3 * scale))

    # shading
    overlay = frame.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), (0, 220, 120), -1)
    frame = cv2.addWeighted(overlay, 0.15, frame, 0.85, 0)

    # border
    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 220, 120), thickness)

    # PIL text
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    draw = ImageDraw.Draw(pil)

    label_en = f"{english} ({int(conf * 100)}%)"

    # label background box
    draw.rectangle([x1, y1 - box_h, x1 + box_w, y1], fill=(200, 220, 255))

    # English text
    draw.text((x1 + padding, y1 - box_h + padding), label_en, font=font_en_dynamic, fill=(0, 0, 0))

    # Sinhala text
    draw_sinhala(draw, x1 + padding, y1 - box_h + padding + font_size_en + 2, sinhala_name, font_si_dynamic)

    frame = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    return frame

@app.route("/")
def home():
    return {"message": "API running"}

# =========================
# 🖼 IMAGE API
# =========================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        file = request.files["image"]
        file_bytes = np.frombuffer(file.read(), np.uint8)
        frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        results = detector.predict(frame, conf=0.3, imgsz=640, verbose=False)[0]

        if results.boxes is None or len(results.boxes) == 0:
            return jsonify({"error": "Unknown bird"})

        b = results.boxes[0]
        x1, y1, x2, y2 = map(int, b.xyxy[0])

        h, w, _ = frame.shape
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w - 1, x2), min(h - 1, y2)

        crop = frame[y1:y2, x1:x2]
        raw, conf = classify(crop)

        if conf < 0.6:
            return jsonify({"error": "Unknown bird"})

        english = raw.replace("_", " ").title()
        sinhala_name = sinhala.get(raw, "")
        details = species_info.get(raw, {})

        frame = draw_label(frame, x1, y1, x2, y2, english, sinhala_name, conf)

        _, buffer = cv2.imencode(".jpg", frame)
        img_base64 = base64.b64encode(buffer).decode("utf-8")

        return jsonify({
            "image": img_base64,
            "englishName": english,
            "sinhalaName": sinhala_name,
            "confidence": conf,
            "category": details.get("category", ""),
            "habitat_en": details.get("habitat_en", ""),
            "diet_en": details.get("diet_en", "")
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "Server error"})

# =========================
# 🎥 VIDEO API
# =========================
@app.route("/predict-video", methods=["POST"])
def predict_video():
    try:
        file = request.files["image"]

        input_path = tempfile.mktemp(suffix=".mp4")
        output_path = tempfile.mktemp(suffix=".mp4")

        file.save(input_path)

        cap = cv2.VideoCapture(input_path)

        fps = int(cap.get(cv2.CAP_PROP_FPS))
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        out = cv2.VideoWriter(
            output_path,
            cv2.VideoWriter_fourcc(*"avc1"),
            fps,
            (w, h)
        )

        detected_info = None

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            results = detector.predict(frame, conf=0.3, imgsz=640, verbose=False)[0]

            if results.boxes is not None and len(results.boxes) > 0:
                b = results.boxes[0]
                x1, y1, x2, y2 = map(int, b.xyxy[0])

                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w - 1, x2), min(h - 1, y2)

                crop = frame[y1:y2, x1:x2]

                if crop.size != 0:
                    raw, conf = classify(crop)

                    if conf > 0.6:
                        detected_info = {
                            "raw": raw,
                            "confidence": conf,
                            "englishName": raw.replace("_", " ").title()
                        }

                if detected_info:
                    sinhala_name = sinhala.get(detected_info["raw"], "")
                    frame = draw_label(frame, x1, y1, x2, y2, detected_info["englishName"], sinhala_name, detected_info["confidence"])

            out.write(frame)

        cap.release()
        out.release()

        with open(output_path, "rb") as f:
            video_bytes = f.read()

        details = species_info.get(detected_info["raw"], {}) if detected_info else {}

        return jsonify({
            "video": base64.b64encode(video_bytes).decode("utf-8"),
            "englishName": detected_info["englishName"] if detected_info else "",
            "sinhalaName": sinhala.get(detected_info["raw"], "") if detected_info else "",
            "confidence": detected_info["confidence"] if detected_info else 0,
            "category": details.get("category", ""),
            "habitat_en": details.get("habitat_en", ""),
            "diet_en": details.get("diet_en", "")
        })

    except Exception as e:
        print("VIDEO ERROR:", e)
        return jsonify({"error": "Video processing failed"})

if __name__ == "__main__":
    app.run(debug=True)