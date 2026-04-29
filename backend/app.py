from flask import Flask, jsonify
from flask_cors import CORS
from live_feed import live_bp

# processors
from image_processor import predict_image
from video_processor import predict_video

# performance
from performance import get_system_performance

# database
from database import (
    init_db,
    get_dashboard_stats,
    get_recent_detections,
    delete_detection
)

app = Flask(__name__)
CORS(app)

# initialize SQLite database + create table from schema.sql
init_db()

app.register_blueprint(live_bp)

# HOME

@app.route("/")
def home():
    return {
        "message": "API running"
    }

# SYSTEM PERFORMANCE API

@app.route("/system-performance", methods=["GET"])
def system_performance():
    return jsonify(
        get_system_performance()
    )

# DASHBOARD DATABASE API

@app.route("/dashboard-stats", methods=["GET"])
def dashboard_stats():
    return jsonify(
        get_dashboard_stats()
    )


@app.route("/recent-detections", methods=["GET"])
def recent_detections():
    return jsonify(
        get_recent_detections()
    )

# DELETE DETECTION API

@app.route(
    "/delete-detection/<int:detection_id>",
    methods=["DELETE"]
)
def delete_detection_route(
    detection_id
):
    try:
        delete_detection(
            detection_id
        )

        return jsonify({
            "message":
                "Detection deleted successfully"
        })

    except Exception as e:
        print(
            "DELETE ERROR:",
            e
        )

        return jsonify({
            "error":
                "Failed to delete detection"
        }), 500

# IMAGE API

@app.route("/predict", methods=["POST"])
def predict():
    return predict_image()

# VIDEO API

@app.route("/predict-video", methods=["POST"])
def predict_video_route():
    return predict_video()

# RUN

if __name__ == "__main__":
    app.run(
        debug=True,
        use_reloader=False
    )