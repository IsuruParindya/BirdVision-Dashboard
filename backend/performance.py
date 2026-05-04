import time
import psutil

POWER_EFFICIENCY = "Optimized"

last_response_time = 0.4
last_inference_speed = "25 FPS"
last_model_accuracy = "0%"


def update_performance(start_time, frame_count=1):
    global last_response_time
    global last_inference_speed

    end_time = time.time()
    last_response_time = end_time - start_time

    if frame_count > 0 and last_response_time > 0:
        fps = round(frame_count / last_response_time)
        last_inference_speed = f"{fps} FPS"


def update_accuracy(confidence):
    global last_model_accuracy

    accuracy = round(float(confidence) * 100, 2)
    last_model_accuracy = f"{accuracy}%"


def format_response_time(seconds):
    if seconds >= 60:
        minutes = seconds / 60
        return f"{minutes:.2f} min"
    else:
        return f"{seconds:.2f} sec"


def get_system_performance():
    cpu_usage = psutil.cpu_percent(interval=1)
    memory_usage = psutil.virtual_memory().percent

    if cpu_usage < 70:
        stability = "High"
    elif cpu_usage < 85:
        stability = "Moderate"
    else:
        stability = "Low"

    return {
        "modelAccuracy": last_model_accuracy,
        "inferenceSpeed": last_inference_speed,
        "cpuUsage": f"{cpu_usage}%",
        "responseTime": format_response_time(last_response_time),
        "powerEfficiency": POWER_EFFICIENCY,
        "systemStability": stability,
        "memoryUsage": f"{memory_usage}%"
    }