import cv2
import base64
import tempfile
import time

from flask import request, jsonify

from config import (
    detector,
    sinhala,
    species_info
)

from classifier import classify
from label_drawer import draw_label
from performance import update_performance

# DATABASE
from database import save_detection


def predict_video():
    try:
        start_time = time.time()

        file = request.files["image"]

        # =========================
        # TEMP FILES
        # =========================

        input_path = tempfile.mktemp(
            suffix=".mp4"
        )

        output_path = tempfile.mktemp(
            suffix=".mp4"
        )

        file.save(input_path)

        # =========================
        # OPEN VIDEO
        # =========================

        cap = cv2.VideoCapture(
            input_path
        )

        if not cap.isOpened():
            return jsonify({
                "error": "Invalid video file"
            })

        fps = int(
            cap.get(
                cv2.CAP_PROP_FPS
            )
        )

        # fallback if fps broken
        if fps <= 0:
            fps = 25

        w = int(
            cap.get(
                cv2.CAP_PROP_FRAME_WIDTH
            )
        )

        h = int(
            cap.get(
                cv2.CAP_PROP_FRAME_HEIGHT
            )
        )

        if w <= 0 or h <= 0:
            return jsonify({
                "error": "Invalid video dimensions"
            })

        # =========================
        # OUTPUT VIDEO
        # use mp4v
        # =========================

        out = cv2.VideoWriter(
            output_path,
            cv2.VideoWriter_fourcc(*"mp4v"),
            fps,
            (w, h)
        )

        if not out.isOpened():
            return jsonify({
                "error": "Failed to create output video"
            })

        detected_info = None
        frame_count = 0

        # =========================
        # PROCESS FRAMES
        # =========================

        while True:
            ret, frame = cap.read()

            if not ret:
                break

            frame_count += 1

            results = detector.predict(
                frame,
                conf=0.3,
                imgsz=640,
                verbose=False
            )[0]

            if (
                results.boxes is not None
                and len(results.boxes) > 0
            ):
                b = results.boxes[0]

                x1, y1, x2, y2 = map(
                    int,
                    b.xyxy[0]
                )

                x1 = max(0, x1)
                y1 = max(0, y1)
                x2 = min(w - 1, x2)
                y2 = min(h - 1, y2)

                crop = frame[
                    y1:y2,
                    x1:x2
                ]

                if crop.size != 0:
                    raw, conf = classify(
                        crop
                    )

                    if conf > 0.6:
                        detected_info = {
                            "raw": raw,
                            "confidence": float(conf),
                            "englishName": raw.replace(
                                "_",
                                " "
                            ).title()
                        }

                if detected_info:
                    sinhala_name = sinhala.get(
                        detected_info["raw"],
                        ""
                    )

                    frame = draw_label(
                        frame,
                        x1,
                        y1,
                        x2,
                        y2,
                        detected_info["englishName"],
                        sinhala_name,
                        detected_info["confidence"]
                    )

            out.write(frame)

        cap.release()
        out.release()

        # =========================
        # NO DETECTION
        # =========================

        if not detected_info:
            return jsonify({
                "error": "No bird detected in video"
            })

        # =========================
        # READ FINAL VIDEO
        # =========================

        with open(
            output_path,
            "rb"
        ) as f:
            video_bytes = f.read()

        details = species_info.get(
            detected_info["raw"],
            {}
        )

        sinhala_name = sinhala.get(
            detected_info["raw"],
            ""
        )

        # =========================
        # SAVE TO DATABASE
        # IMPORTANT PART
        # =========================

        save_detection(
            english_name=detected_info["englishName"],
            sinhala_name=sinhala_name,
            confidence=float(
                detected_info["confidence"]
            ),
            habitat=details.get(
                "habitat_en",
                ""
            ),
            diet=details.get(
                "diet_en",
                ""
            ),
            image_url="",
            source_type="video"
        )

        print(
            "VIDEO DETECTION SAVED:",
            detected_info["englishName"]
        )

        # =========================
        # PERFORMANCE
        # =========================

        update_performance(
            start_time,
            frame_count
        )

        # =========================
        # RESPONSE
        # =========================

        return jsonify({
            "video": base64.b64encode(
                video_bytes
            ).decode("utf-8"),

            "englishName":
                detected_info["englishName"],

            "sinhalaName":
                sinhala_name,

            "confidence":
                detected_info["confidence"],

            "category":
                details.get(
                    "category",
                    ""
                ),

            "habitat_en":
                details.get(
                    "habitat_en",
                    ""
                ),

            "diet_en":
                details.get(
                    "diet_en",
                    ""
                ),

            "source_type": "video"
        })

    except Exception as e:
        print(
            "VIDEO ERROR:",
            e
        )

        return jsonify({
            "error": "Video processing failed"
        })