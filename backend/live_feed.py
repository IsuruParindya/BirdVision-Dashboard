import os
import cv2
import json
import numpy as np
import time

from flask import Blueprint, Response, request, jsonify
from PIL import Image, ImageDraw, ImageFont

# use shared config + classifier like image_processor.py / video_processor.py
from config import detector, sinhala
from classifier import classify

live_bp = Blueprint("live_feed", __name__)

# =========================
# PATHS
# =========================

font_path = os.path.join(
    os.path.dirname(__file__),
    "fonts",
    "NotoSansSinhala-Regular.ttf"
)

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
        draw.text(
            (x, y),
            ch,
            font=font,
            fill=(0, 0, 0)
        )
        x += font.getbbox(ch)[2]


# =========================
# DRAW LABEL
# =========================

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

    thickness = max(2, int(2 * scale))

    overlay = frame.copy()

    cv2.rectangle(
        overlay,
        (x1, y1),
        (x2, y2),
        (0, 180, 100),
        -1
    )

    frame = cv2.addWeighted(
        overlay,
        0.12,
        frame,
        0.88,
        0
    )

    cv2.rectangle(
        frame,
        (x1, y1),
        (x2, y2),
        (0, 180, 100),
        thickness
    )

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    draw = ImageDraw.Draw(pil)

    label_en = f"{english} ({int(conf * 100)}%)"

    draw.rectangle(
        [
            x1,
            y1 - box_h,
            x1 + box_w,
            y1
        ],
        fill=(200, 220, 255)
    )

    draw.text(
        (
            x1 + padding,
            y1 - box_h + padding
        ),
        label_en,
        font=font_en_dynamic,
        fill=(0, 0, 0)
    )

    draw_sinhala(
        draw,
        x1 + padding,
        y1 - box_h + padding + font_size_en + 2,
        sinhala_name,
        font_si_dynamic
    )

    frame = cv2.cvtColor(
        np.array(pil),
        cv2.COLOR_RGB2BGR
    )

    return frame


# =========================
# CAMERA CONTROL
# =========================

active_camera = None


def release_camera():
    global active_camera

    if active_camera is not None:
        active_camera.release()
        active_camera = None
        print("Camera released")


def get_camera(camera_index=0):
    global active_camera

    release_camera()

    # Try the requested index first, then scan nearby indices as fallback
    # This handles cases where Windows shifts camera indices on USB reconnect
    candidates = [camera_index] + [i for i in range(5) if i != camera_index]

    for idx in candidates:
        cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW)

        if cap.isOpened():
            ret, _ = cap.read()

            if ret:
                print(f"Using camera index: {idx}")
                active_camera = cap
                return cap

        cap.release()

    raise Exception(
        f"No camera found near index {camera_index}"
    )


# =========================
# STREAM
# =========================

def generate_frames(camera_index=0):
    try:
        cap = get_camera(camera_index)
    except Exception as e:
        print(str(e))
        return

    DETECT_INTERVAL = 0.2
    last_detect_time = 0

    last_boxes = []
    last_labels = []

    while True:
        success, frame = cap.read()

        if not success:
            break

        frame = cv2.flip(frame, 1)

        h, w = frame.shape[:2]
        scale = 640 / w

        frame = cv2.resize(
            frame,
            (640, int(h * scale))
        )

        current_time = time.time()

        if current_time - last_detect_time > DETECT_INTERVAL:
            last_boxes = []
            last_labels = []

            results = detector.predict(
                frame,
                conf=0.25,
                imgsz=320,
                verbose=False
            )[0]

            if results.boxes is not None and len(results.boxes) > 0:
                for b in results.boxes[:3]:
                    x1, y1, x2, y2 = map(
                        int,
                        b.xyxy[0]
                    )

                    crop = frame[y1:y2, x1:x2]

                    if crop.size == 0:
                        continue

                    raw, conf = classify(crop)

                    if conf < 0.45:
                        continue

                    raw_key = raw.lower().replace(" ", "_").strip()

                    english = raw_key.replace(
                        "_",
                        " "
                    ).title()

                    sinhala_name = sinhala.get(
                        raw_key,
                        ""
                    )

                    last_boxes.append(
                        (x1, y1, x2, y2)
                    )

                    last_labels.append(
                        (
                            english,
                            sinhala_name,
                            conf
                        )
                    )

            last_detect_time = current_time

        for i, box in enumerate(last_boxes):
            x1, y1, x2, y2 = box
            english, sinhala_name, conf = last_labels[i]

            frame = draw_label(
                frame,
                x1,
                y1,
                x2,
                y2,
                english,
                sinhala_name,
                conf
            )

        _, buffer = cv2.imencode(
            ".jpg",
            frame
        )

        frame_bytes = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + frame_bytes +
            b"\r\n"
        )

    release_camera()


# =========================
# ROUTES
# =========================

@live_bp.route("/live-feed")
def live_feed():
    camera_index = request.args.get(
        "camera",
        default=0,
        type=int
    )

    return Response(
        generate_frames(camera_index),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@live_bp.route(
    "/stop-live-feed",
    methods=["POST"]
)
def stop_live_feed():
    release_camera()

    return jsonify({
        "message": "Camera stopped successfully"
    })