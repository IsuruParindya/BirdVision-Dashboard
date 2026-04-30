import cv2
import base64
import numpy as np
import time
import os
from datetime import datetime

from flask import request, jsonify

from config import (
    detector,
    sinhala,
    species_info
)

from classifier import classify
from label_drawer import draw_label
from performance import update_performance, update_accuracy

# database
from database import save_detection


def predict_image():
    try:
        start_time = time.time()

        # =========================
        # GET IMAGE FROM REQUEST
        # =========================

        file = request.files["image"]

        file_bytes = np.frombuffer(
            file.read(),
            np.uint8
        )

        frame = cv2.imdecode(
            file_bytes,
            cv2.IMREAD_COLOR
        )

        if frame is None:
            return jsonify({
                "error": "Invalid image file"
            })

        # =========================
        # YOLO DETECTION
        # =========================

        results = detector.predict(
            frame,
            conf=0.3,
            imgsz=640,
            verbose=False
        )[0]

        if (
            results.boxes is None
            or len(results.boxes) == 0
        ):
            return jsonify({
                "error": "Unknown bird"
            })

        # first detected bird
        box = results.boxes[0]

        x1, y1, x2, y2 = map(
            int,
            box.xyxy[0]
        )

        h, w, _ = frame.shape

        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(w - 1, x2)
        y2 = min(h - 1, y2)

        crop = frame[
            y1:y2,
            x1:x2
        ]

        if crop.size == 0:
            return jsonify({
                "error": "Invalid crop area"
            })

        # =========================
        # CLASSIFICATION
        # =========================

        raw, conf = classify(crop)

        update_accuracy(conf)

        if conf < 0.6:
            return jsonify({
                "error": "Unknown bird"
            })

        # =========================
        # NORMALIZE CLASSIFIER OUTPUT
        # =========================

        raw_key = raw.lower().replace(
            " ",
            "_"
        ).strip()

        english = raw_key.replace(
            "_",
            " "
        ).title()

        sinhala_name = sinhala.get(
            raw_key,
            ""
        )

        details = species_info.get(
            raw_key,
            {}
        )

        print("RAW:", raw)
        print("RAW KEY:", raw_key)
        print("DETAILS FOUND:", details)

        # =========================
        # DRAW LABEL
        # =========================

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

        # =========================
        # SAVE PROCESSED IMAGE FILE
        # =========================

        save_folder = os.path.join(
            os.path.dirname(__file__),
            "saved_images"
        )

        os.makedirs(
            save_folder,
            exist_ok=True
        )

        filename = (
            f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        )

        saved_path = os.path.join(
            save_folder,
            filename
        )

        cv2.imwrite(
            saved_path,
            frame
        )

        image_url = (
            f"http://127.0.0.1:5000/saved_images/{filename}"
        )

        # =========================
        # BASE64 RESPONSE
        # =========================

        _, buffer = cv2.imencode(
            ".jpg",
            frame
        )

        img_base64 = base64.b64encode(
            buffer
        ).decode("utf-8")

        # =========================
        # SAVE TO SQLITE
        # =========================

        print(
            "Saving IMAGE detection:",
            english,
            sinhala_name,
            float(conf),
            image_url
        )

        save_detection(
            english_name=english,
            sinhala_name=sinhala_name,
            confidence=float(conf),
            habitat=details.get(
                "habitat_en",
                ""
            ),
            diet=details.get(
                "diet_en",
                ""
            ),
            image_url=image_url,
            source_type="image"
        )

        print(
            "Image detection saved successfully"
        )

        # =========================
        # PERFORMANCE UPDATE
        # =========================

        update_performance(start_time)

        # =========================
        # FINAL RESPONSE
        # =========================

        return jsonify({
            "image": img_base64,
            "englishName": english,
            "sinhalaName": sinhala_name,
            "confidence": float(conf),

            "category": details.get(
                "category",
                ""
            ),

            "habitat_en": details.get(
                "habitat_en",
                ""
            ),

            "habitat_si": details.get(
                "habitat_si",
                ""
            ),

            "diet_en": details.get(
                "diet_en",
                ""
            ),

            "diet_si": details.get(
                "diet_si",
                ""
            ),

            "image_url": image_url,
            "source_type": "image"
        })

    except Exception as e:
        print(
            "IMAGE ERROR:",
            e
        )

        return jsonify({
            "error": "Server error"
        })