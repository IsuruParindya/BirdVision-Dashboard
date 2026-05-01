import cv2
import unicodedata
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from config import font_path

def load_font(size):
    try:
        return ImageFont.truetype(font_path, size)
    except:
        return ImageFont.load_default()

def draw_label(frame, x1, y1, x2, y2, english, sinhala_name, conf):
    h, w, _ = frame.shape
    scale = max(w, h) / 800

    font_size_en = max(16, int(20 * scale))
    font_size_si = max(14, int(18 * scale))

    font_en_dynamic = load_font(font_size_en)
    font_si_dynamic = load_font(font_size_si)

    box_w = int(300 * scale)
    box_h = int(55 * scale)
    padding = int(5 * scale)

    thickness = max(2, int(2 * scale))

    # shading
    overlay = frame.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), (0, 180, 100), -1)
    frame = cv2.addWeighted(overlay, 0.12, frame, 0.88, 0)

    # border
    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 180, 100), thickness)

    # convert to PIL
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    draw = ImageDraw.Draw(pil)

    label_en = f"{english} ({int(conf * 100)}%)"

    # ✅ Normalize Sinhala unicode before rendering
    sinhala_name = unicodedata.normalize('NFC', sinhala_name)

    # background
    draw.rectangle(
        [x1, y1 - box_h, x1 + box_w, y1],
        fill=(200, 220, 255)
    )

    # english
    draw.text(
        (x1 + padding, y1 - box_h + padding),
        label_en,
        font=font_en_dynamic,
        fill=(0, 0, 0)
    )
    # sinhala
    draw.text(
        (x1 + padding, y1 - box_h + padding + font_size_en + 2),
        sinhala_name,
        font=font_si_dynamic,
        fill=(0, 0, 0)
    )

    frame = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    return frame