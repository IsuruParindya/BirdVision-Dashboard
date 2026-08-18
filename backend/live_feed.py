import os
import cv2
import numpy as np
import time

from flask import Blueprint, Response, request, jsonify
from PIL import Image, ImageDraw, ImageFont

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
# CONFIGURATION
# =========================

DETECT_INTERVAL = 0.2

YOLO_CONF = 0.25
YOLO_IMGSZ = 320

MAX_DETECTIONS = 3

CONF_THRESHOLD = 0.45
MARGIN_THRESHOLD = 0.20

JPEG_QUALITY = 80


# =========================
# FONT CACHE
# =========================

_font_cache = {}


def load_font(size):
    if size not in _font_cache:
        try:
            _font_cache[size] = ImageFont.truetype(
                font_path,
                size
            )
        except Exception:
            _font_cache[size] = ImageFont.load_default()

    return _font_cache[size]


# =========================
# DRAW LABELS + BOUNDING BOXES
# =========================

def draw_labels(frame, detections):

    if not detections:
        return frame

    h, w = frame.shape[:2]

    scale = max(w, h) / 800

    font_size_en = max(16, int(20 * scale))
    font_size_si = max(14, int(18 * scale))

    font_en = load_font(font_size_en)
    font_si = load_font(font_size_si)

    box_w = int(300 * scale)
    box_h = int(55 * scale)
    padding = int(5 * scale)
    thickness = max(2, int(2 * scale))

    # Convert frame to PIL once
    rgb = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    pil = Image.fromarray(rgb)
    draw = ImageDraw.Draw(pil)

    for (
        x1,
        y1,
        x2,
        y2,
        english,
        sinhala_name,
        conf
    ) in detections:

        # =========================
        # VALIDATE COORDINATES
        # =========================

        x1 = max(0, min(x1, w - 1))
        y1 = max(0, min(y1, h - 1))
        x2 = max(0, min(x2, w - 1))
        y2 = max(0, min(y2, h - 1))

        if x2 <= x1 or y2 <= y1:
            continue

        # =========================
        # BOUNDING BOX
        # =========================

        draw.rectangle(
            [x1, y1, x2, y2],
            outline=(0, 180, 100),
            width=thickness
        )

        # =========================
        # LABEL
        # =========================

        label_y = max(0, y1 - box_h)

        label_en = (
            f"{english} ({int(conf * 100)}%)"
            if conf > 0
            else english
        )

        draw.rectangle(
            [
                x1,
                label_y,
                x1 + box_w,
                y1
            ],
            fill=(200, 220, 255)
        )

        draw.text(
            (
                x1 + padding,
                label_y + padding
            ),
            label_en,
            font=font_en,
            fill=(0, 0, 0)
        )

        draw.text(
            (
                x1 + padding,
                label_y + padding + font_size_en + 2
            ),
            sinhala_name,
            font=font_si,
            fill=(0, 0, 0)
        )

    # Convert back to OpenCV once
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

        try:
            active_camera.release()
        except Exception:
            pass

        active_camera = None

        print("Camera released")


def get_camera(camera_index=0):

    global active_camera

    release_camera()

    candidates = (
        [camera_index]
        + [
            i for i in range(5)
            if i != camera_index
        ]
    )

    for idx in candidates:

        cap = cv2.VideoCapture(
            idx,
            cv2.CAP_DSHOW
        )

        if not cap.isOpened():

            cap.release()
            continue

        ret, _ = cap.read()

        if ret:

            print(
                f"Using camera index: {idx}"
            )

            # Set camera capture resolution
            cap.set(
                cv2.CAP_PROP_FRAME_WIDTH,
                640
            )

            cap.set(
                cv2.CAP_PROP_FRAME_HEIGHT,
                480
            )

            active_camera = cap

            return cap

        cap.release()

    raise Exception(
        f"No camera found near index {camera_index}"
    )


# =========================
# DETECTION
# =========================

def detect_birds(frame):

    detections = []

    results = detector.predict(
        frame,
        conf=YOLO_CONF,
        imgsz=YOLO_IMGSZ,
        verbose=False
    )[0]

    if results.boxes is None:
        return detections

    # Process maximum 3 detected birds
    for b in results.boxes[:MAX_DETECTIONS]:

        # =========================
        # GET BOUNDING BOX
        # =========================

        x1, y1, x2, y2 = map(
            int,
            b.xyxy[0]
        )

        # =========================
        # VALIDATE COORDINATES
        # =========================

        x1 = max(0, x1)
        y1 = max(0, y1)

        x2 = min(
            frame.shape[1],
            x2
        )

        y2 = min(
            frame.shape[0],
            y2
        )

        if x2 <= x1 or y2 <= y1:
            continue

        # =========================
        # CROP BIRD REGION
        # =========================

        crop = frame[
            y1:y2,
            x1:x2
        ]

        if crop.size == 0:
            continue

        # =========================
        # RESNET50 CLASSIFICATION
        # =========================

        raw, conf, margin = classify(crop)

        raw_key = (
            raw
            .lower()
            .replace(" ", "_")
            .strip()
        )

        # =========================
        # UNKNOWN BIRD LOGIC
        # =========================

        if (
            conf >= CONF_THRESHOLD
            and margin >= MARGIN_THRESHOLD
        ):

            english = (
                raw_key
                .replace("_", " ")
                .title()
            )

            sinhala_name = sinhala.get(
                raw_key,
                ""
            )

        else:

            english = "Unknown Bird"

            sinhala_name = (
                "හඳුනාගත නොහැක"
            )

            conf = 0.0

        # =========================
        # SAVE DETECTION
        # =========================

        detections.append(
            (
                x1,
                y1,
                x2,
                y2,
                english,
                sinhala_name,
                conf
            )
        )

    return detections


# =========================
# STREAM
# =========================

def generate_frames(camera_index=0):

    try:

        cap = get_camera(
            camera_index
        )

    except Exception as e:

        print(
            f"Camera error: {e}"
        )

        return

    last_detect_time = 0
    last_detections = []

    try:

        while True:

            # =========================
            # READ CAMERA FRAME
            # =========================

            success, frame = cap.read()

            if not success:
                break

            # =========================
            # MIRROR CAMERA
            # =========================

            frame = cv2.flip(
                frame,
                1
            )

            # =========================
            # RESIZE FRAME
            # =========================

            h, w = frame.shape[:2]

            if w != 640:

                scale = 640 / float(w)

                new_height = int(
                    h * scale
                )

                frame = cv2.resize(
                    frame,
                    (
                        640,
                        new_height
                    ),
                    interpolation=cv2.INTER_AREA
                )

            # =========================
            # CHECK DETECTION INTERVAL
            # =========================

            current_time = time.time()

            if (
                current_time - last_detect_time
                >= DETECT_INTERVAL
            ):

                try:

                    last_detections = (
                        detect_birds(frame)
                    )

                except Exception as e:

                    print(
                        f"Detection error: {e}"
                    )

                last_detect_time = (
                    current_time
                )

            # =========================
            # DRAW LAST DETECTIONS
            # =========================

            frame = draw_labels(
                frame,
                last_detections
            )

            # =========================
            # JPEG ENCODING
            # =========================

            success, buffer = cv2.imencode(
                ".jpg",
                frame,
                [
                    cv2.IMWRITE_JPEG_QUALITY,
                    JPEG_QUALITY
                ]
            )

            if not success:
                continue

            frame_bytes = buffer.tobytes()

            # =========================
            # MJPEG STREAM
            # =========================

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + frame_bytes
                + b"\r\n"
            )

    finally:

        try:
            cap.release()
        except Exception:
            pass

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
        generate_frames(
            camera_index
        ),
        mimetype=(
            "multipart/x-mixed-replace; "
            "boundary=frame"
        )
    )


@live_bp.route(
    "/stop-live-feed",
    methods=["POST"]
)
def stop_live_feed():

    release_camera()

    return jsonify({
        "message":
            "Camera stopped successfully"
    })