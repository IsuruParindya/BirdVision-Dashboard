import cv2
import base64
import tempfile
import time
import os
from datetime import datetime
from flask import request, jsonify
from config import (detector, sinhala, species_info)
from classifier import classify
from label_drawer import draw_label
from performance import update_performance, update_accuracy
from database import save_detection


def predict_video():
    try:
        start_time = time.time()

        file = request.files["image"]

        input_path = tempfile.mktemp(suffix=".mp4")

        # Save processed video to saved_videos/ folder instead of a temp file
        save_folder = os.path.join(
            os.path.dirname(__file__),
            "saved_videos"
        )
        os.makedirs(save_folder, exist_ok=True)

        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
        output_path = os.path.join(save_folder, filename)

        file.save(input_path)

        cap = cv2.VideoCapture(input_path)

        fps = int(cap.get(cv2.CAP_PROP_FPS))
        if fps <= 0:
            fps = 25

        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

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

                x1, y1, x2, y2 = map(int, b.xyxy[0])
                x1 = max(0, x1)
                y1 = max(0, y1)
                x2 = min(w - 1, x2)
                y2 = min(h - 1, y2)

                crop = frame[y1:y2, x1:x2]

                if crop.size != 0:
                    raw, conf = classify(crop)
                    update_accuracy(conf)

                    if conf > 0.6:
                        raw_key = raw.lower().replace(" ", "_").strip()
                        detected_info = {
                            "raw": raw_key,
                            "confidence": conf,
                            "englishName": raw_key.replace("_", " ").title()
                        }

                if detected_info:
                    sinhala_name = sinhala.get(detected_info["raw"], "")
                    frame = draw_label(
                        frame,
                        x1, y1, x2, y2,
                        detected_info["englishName"],
                        sinhala_name,
                        detected_info["confidence"]
                    )

            if frame_count % 10 == 0:
                success, buffer = cv2.imencode(".jpg", frame)
                if success:
                    preview_frame = base64.b64encode(buffer).decode("utf-8")

            out.write(frame)

        cap.release()
        out.release()

        # Read processed video for base64 response to frontend
        with open(output_path, "rb") as f:
            video_bytes = f.read()

        # ── Bird Details ──────────────────────────────────────────────────────

        details = (
            species_info.get(detected_info["raw"], {})
            if detected_info
            else {}
        )

        # ── Save to DB ────────────────────────────────────────────────────────

        video_url = f"/saved_videos/{filename}"

        if detected_info:
            sinhala_name = sinhala.get(detected_info["raw"], "")

            print(
                "Saving VIDEO detection:",
                detected_info["englishName"],
                sinhala_name,
                detected_info["confidence"]
            )

            save_detection(
                english_name=detected_info["englishName"],
                sinhala_name=sinhala_name,
                confidence=float(detected_info["confidence"]),
                habitat=details.get("habitat_en", ""),
                diet=details.get("diet_en", ""),
                image_url="",
                video_url=video_url,
                source_type="video"
            )

            print("VIDEO detection saved successfully")

        # ── Performance Update ────────────────────────────────────────────────

        update_performance(start_time, frame_count)

        # ── Final Response ────────────────────────────────────────────────────

        return jsonify({
            "video": base64.b64encode(video_bytes).decode("utf-8"),
            "preview_frame": preview_frame,
            "video_url": video_url,

            "englishName": detected_info["englishName"] if detected_info else "",
            "sinhalaName": sinhala.get(detected_info["raw"], "") if detected_info else "",
            "confidence":  detected_info["confidence"] if detected_info else 0,

            "category":   details.get("category",    ""),
            "habitat_en": details.get("habitat_en",  ""),
            "habitat_si": details.get("habitat_si",  ""),
            "diet_en":    details.get("diet_en",     ""),
            "diet_si":    details.get("diet_si",     ""),
        })

    except Exception as e:
        print("VIDEO ERROR:", e)
        return jsonify({"error": "Video processing failed"})