import cv2
import base64
import numpy as np

from flask import request, jsonify

from config import (
    detector,
    sinhala,
    species_info
)

from classifier import classify
from label_drawer import draw_label
from performance import update_performance

import time


def predict_image():
    try:
        start_time = time.time()

        file = request.files["image"]
        file_bytes = np.frombuffer(file.read(), np.uint8)
        frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        results = detector.predict(
            frame,
            conf=0.3,
            imgsz=640,
            verbose=False
        )[0]

        if results.boxes is None or len(results.boxes) == 0:
            return jsonify({
                "error": "Unknown bird"
            })

        b = results.boxes[0]
        x1, y1, x2, y2 = map(
            int,
            b.xyxy[0]
        )

        h, w, _ = frame.shape

        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(w - 1, x2)
        y2 = min(h - 1, y2)

        crop = frame[y1:y2, x1:x2]

        raw, conf = classify(crop)

        if conf < 0.6:
            return jsonify({
                "error": "Unknown bird"
            })

        english = raw.replace(
            "_",
            " "
        ).title()

        sinhala_name = sinhala.get(
            raw,
            ""
        )

        details = species_info.get(
            raw,
            {}
        )

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

        img_base64 = base64.b64encode(
            buffer
        ).decode("utf-8")

        update_performance(start_time)

        return jsonify({
            "image": img_base64,
            "englishName": english,
            "sinhalaName": sinhala_name,
            "confidence": conf,
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
        print("IMAGE ERROR:", e)

        return jsonify({
            "error": "Server error"
        })