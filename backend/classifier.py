import cv2
import torch
from PIL import Image

from config import clf, transform, classes


def classify(img):
    img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    x = transform(img).unsqueeze(0)

    with torch.no_grad():
        probs = torch.softmax(clf(x), dim=1)
        conf, pred = torch.max(probs, 1)

    return classes[int(pred)], float(conf)