from flask import Flask, jsonify
from flask_cors import CORS

from live_feed import live_bp

# processors
from image_processor import predict_image
from video_processor import predict_video

# performance
from performance import get_system_performance


app = Flask(__name__)
CORS(app)

app.register_blueprint(live_bp)


# =========================================
# HOME
# =========================================

@app.route("/")
def home():
    return {
        "message": "API running"
    }


# =========================================
# SYSTEM PERFORMANCE API
# =========================================

@app.route("/system-performance", methods=["GET"])
def system_performance():
    return jsonify(
        get_system_performance()
    )


# =========================================
# IMAGE API
# =========================================

@app.route("/predict", methods=["POST"])
def predict():
    return predict_image()


# =========================================
# VIDEO API
# =========================================

@app.route("/predict-video", methods=["POST"])
def predict_video_route():
    return predict_video()


# =========================================
# RUN
# =========================================

if __name__ == "__main__":
    app.run(
        debug=True,
        use_reloader=False
    )