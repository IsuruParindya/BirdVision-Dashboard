import os
import base64
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from live_feed import live_bp

# processors
from image_processor import predict_image
from video_processor import predict_video

# performance
from performance import get_system_performance

# config
from config import species_info

# database
from database import (
    init_db,
    get_dashboard_stats,
    get_recent_detections,
    delete_detection,
    get_latest_detection_by_type,
    update_detection_image_url,
)

app = Flask(__name__)
CORS(app)

# initialize SQLite database + create table from schema.sql
init_db()

app.register_blueprint(live_bp)


# ─── Home ─────────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return {"message": "API running"}


# ─── Serve Saved Images ───────────────────────────────────────────────────────

@app.route("/saved_images/<path:filename>")
def serve_saved_image(filename):
    folder = os.path.join(os.path.dirname(__file__), "saved_images")
    return send_from_directory(folder, filename)


# ─── System Performance ───────────────────────────────────────────────────────

@app.route("/system-performance", methods=["GET"])
def system_performance():
    return jsonify(get_system_performance())


# ─── Dashboard ────────────────────────────────────────────────────────────────

@app.route("/dashboard-stats", methods=["GET"])
def dashboard_stats():
    return jsonify(get_dashboard_stats())


@app.route("/recent-detections", methods=["GET"])
def recent_detections():
    return jsonify(get_recent_detections())


# ─── Latest Detection by Type ─────────────────────────────────────────────────

@app.route("/latest-detection/<string:source_type>", methods=["GET"])
def latest_detection(source_type):
    if source_type not in ("image", "video"):
        return jsonify({"error": "Invalid type"}), 400

    data = get_latest_detection_by_type(source_type)

    if not data:
        return jsonify(None), 204

    # Re-map Sinhala habitat & diet from species_info using english_name
    raw_key = data["english_name"].lower().replace(" ", "_")
    details = species_info.get(raw_key, {})

    data["habitat_si"] = details.get("habitat_si", "")
    data["diet_si"]    = details.get("diet_si", "")

    return jsonify(data)


# ─── Save Video Snapshot ──────────────────────────────────────────────────────

@app.route("/save-video-snapshot", methods=["POST"])
def save_video_snapshot():
    try:
        body = request.get_json()
        snapshot_b64 = body.get("snapshot", "")

        if not snapshot_b64:
            return jsonify({"error": "No snapshot provided"}), 400

        # Strip data:image/jpeg;base64, prefix if present
        if "," in snapshot_b64:
            snapshot_b64 = snapshot_b64.split(",", 1)[1]

        # Decode and save to saved_images/
        image_bytes = base64.b64decode(snapshot_b64)

        save_folder = os.path.join(os.path.dirname(__file__), "saved_images")
        os.makedirs(save_folder, exist_ok=True)

        filename = f"video_snapshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        saved_path = os.path.join(save_folder, filename)

        with open(saved_path, "wb") as f:
            f.write(image_bytes)

        # Relative URL so it works through the Vite proxy
        image_url = f"/saved_images/{filename}"

        # Update the latest video detection's image_url in DB
        update_detection_image_url("video", image_url)

        print(f"Video snapshot saved: {filename}")

        return jsonify({"image_url": image_url})

    except Exception as e:
        print("SNAPSHOT ERROR:", e)
        return jsonify({"error": "Failed to save snapshot"}), 500


# ─── Delete Detection ─────────────────────────────────────────────────────────

@app.route("/delete-detection/<int:detection_id>", methods=["DELETE"])
def delete_detection_route(detection_id):
    try:
        delete_detection(detection_id)
        return jsonify({"message": "Detection deleted successfully"})
    except Exception as e:
        print("DELETE ERROR:", e)
        return jsonify({"error": "Failed to delete detection"}), 500


# ─── Image & Video Prediction ─────────────────────────────────────────────────

@app.route("/predict", methods=["POST"])
def predict():
    return predict_image()


@app.route("/predict-video", methods=["POST"])
def predict_video_route():
    return predict_video()


# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)