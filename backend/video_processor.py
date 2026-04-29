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
from database import save_detection


def predict_video():
    try:
        start_time = time.time()

        file = request.files["image"]

        input_path = tempfile.mktemp(
            suffix=".mp4"
        )

        output_path = tempfile.mktemp(
            suffix=".mp4"
        )

        file.save(input_path)

        cap = cv2.VideoCapture(
            input_path
        )

        fps = int(
            cap.get(
                cv2.CAP_PROP_FPS
            )
        )

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

        out = cv2.VideoWriter(
            output_path,
            cv2.VideoWriter_fourcc(*"avc1"),
            fps,
            (w, h)
        )

        detected_info = None
        frame_count = 0

        preview_frame = ""

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
                    raw, conf = classify(crop)

                    if conf > 0.6:
                        detected_info = {
                            "raw": raw,
                            "confidence": conf,
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

            if frame_count % 10 == 0:
                success, buffer = cv2.imencode(
                    ".jpg",
                    frame
                )

                if success:
                    preview_frame = base64.b64encode(
                        buffer
                    ).decode("utf-8")

            out.write(frame)

        cap.release()
        out.release()

        with open(
            output_path,
            "rb"
        ) as f:
            video_bytes = f.read()

        details = (
            species_info.get(
                detected_info["raw"],
                {}
            )
            if detected_info
            else {}
        )

        # =========================
        # SAVE VIDEO DETECTION
        # =========================

        if detected_info:
            sinhala_name = sinhala.get(
                detected_info["raw"],
                ""
            )

            print(
                "Saving VIDEO detection:",
                detected_info["englishName"],
                sinhala_name,
                detected_info["confidence"]
            )

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
                "VIDEO detection saved successfully"
            )

        update_performance(
            start_time,
            frame_count
        )

        return jsonify({
            "video": base64.b64encode(
                video_bytes
            ).decode("utf-8"),

            "preview_frame": preview_frame,

            "englishName": (
                detected_info["englishName"]
                if detected_info
                else ""
            ),

            "sinhalaName": (
                sinhala.get(
                    detected_info["raw"],
                    ""
                )
                if detected_info
                else ""
            ),

            "confidence": (
                detected_info["confidence"]
                if detected_info
                else 0
            ),

            "category": details.get(
                "category",
                ""
            ),

            "habitat_en": details.get(
                "habitat_en",
                ""
            ),

            "diet_en": details.get(
                "diet_en",
                ""
            )
        })

    except Exception as e:
        print(
            "VIDEO ERROR:",
            e
        )

        return jsonify({
            "error": "Video processing failed"
        })