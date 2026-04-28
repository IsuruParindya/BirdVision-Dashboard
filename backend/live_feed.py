import os
import cv2
import json
import torch
import numpy as np
import time

from flask import Blueprint, Response, request
from PIL import Image, ImageDraw, ImageFont
from torchvision import transforms, models
from torch import nn
from ultralytics import YOLO

live_bp = Blueprint("live_feed", __name__)

# =========================
# PATHS
# =========================

base = os.path.join(os.path.dirname(__file__), "models")
font_path = os.path.join(
    os.path.dirname(__file__),
    "fonts",
    "NotoSansSinhala-Regular.ttf"
)

pth = os.path.join(base, "bird_resnet50.pth")
cls = os.path.join(base, "classes.json")
si = os.path.join(base, "sinhala_map.json")
yolo_path = os.path.join(base, "best.pt")

classes = json.load(open(cls, encoding="utf-8"))
sinhala = json.load(open(si, encoding="utf-8"))

device = torch.device("cpu")

# =========================
# CLASSIFIER
# =========================

clf = models.resnet50(weights=None)
clf.fc = nn.Linear(clf.fc.in_features, len(classes))
clf.load_state_dict(torch.load(pth, map_location=device))
clf = clf.eval()

detector = YOLO(yolo_path)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])


def classify(img):
    img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    x = transform(img).unsqueeze(0)

    with torch.no_grad():
        probs = torch.softmax(clf(x), dim=1)
        conf, pred = torch.max(probs, 1)

    return classes[int(pred)], float(conf)


# =========================
# FONT
# =========================

def load_font(size):
    try:
        return ImageFont.truetype(font_path, size)
    except:
        return ImageFont.load_default()


def draw_sinhala(draw, x, y, text, font):
    for ch in text:
        draw.text((x, y), ch, font=font, fill=(255, 255, 255))
        x += font.getbbox(ch)[2]


# =========================
# CAMERA
# =========================

def get_camera(camera_index=0):
    cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)

    if cap.isOpened():
        ret, _ = cap.read()

        if ret:
            print(f"Using camera index: {camera_index}")
            return cap

        cap.release()

    raise Exception(f"Camera index {camera_index} not found")


# =========================
# STREAM GENERATOR
# =========================

def generate_frames(camera_index=0):
    try:
        cap = get_camera(camera_index)
    except Exception as e:
        print(str(e))
        return

    last_detect_time = 0
    DETECT_INTERVAL = 1.5

    last_label = ""
    last_si = ""
    last_conf = 0

    while True:
        success, frame = cap.read()

        if not success:
            break

        frame = cv2.flip(frame, 1)
        current_time = time.time()

        if current_time - last_detect_time > DETECT_INTERVAL:
            results = detector.predict(
                frame,
                conf=0.3,
                imgsz=640,
                verbose=False
            )[0]

            if results.boxes is not None and len(results.boxes) > 0:
                b = results.boxes[0]
                x1, y1, x2, y2 = map(int, b.xyxy[0])

                crop = frame[y1:y2, x1:x2]

                if crop.size != 0:
                    raw, conf = classify(crop)

                    if conf > 0.6:
                        last_label = raw.replace("_", " ").title()
                        last_si = sinhala.get(raw, "")
                        last_conf = conf

                        cv2.rectangle(
                            frame,
                            (x1, y1),
                            (x2, y2),
                            (0, 180, 100),
                            2
                        )

                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        pil = Image.fromarray(rgb)
                        draw = ImageDraw.Draw(pil)

                        font_en = load_font(20)
                        font_si = load_font(18)

                        label = f"{last_label} ({int(last_conf * 100)}%)"

                        draw.rectangle(
                            [x1, y1 - 55, x1 + 300, y1],
                            fill=(30, 30, 30)
                        )

                        draw.text(
                            (x1 + 5, y1 - 50),
                            label,
                            font=font_en,
                            fill=(255, 255, 255)
                        )

                        draw_sinhala(
                            draw,
                            x1 + 5,
                            y1 - 25,
                            last_si,
                            font_si
                        )

                        frame = cv2.cvtColor(
                            np.array(pil),
                            cv2.COLOR_RGB2BGR
                        )

            last_detect_time = current_time

        _, buffer = cv2.imencode(".jpg", frame)
        frame_bytes = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" +
            frame_bytes +
            b"\r\n"
        )

    cap.release()


# =========================
# ROUTE
# =========================

@live_bp.route("/live-feed")
def live_feed():
    camera_index = request.args.get("camera", default=0, type=int)

    return Response(
        generate_frames(camera_index),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )