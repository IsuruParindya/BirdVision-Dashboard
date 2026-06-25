import cv2
import torch
from PIL import Image

from config import clf, transform, classes


def classify(img):
    img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    x = transform(img).unsqueeze(0)

    with torch.no_grad():
        probs = torch.softmax(clf(x), dim=1)
        top2_probs, top2_idx = torch.topk(probs, 2, dim=1)

    top1_conf = float(top2_probs[0][0])
    top2_conf = float(top2_probs[0][1])
    margin = top1_conf - top2_conf

    pred_idx = int(top2_idx[0][0])

    return classes[pred_idx], top1_conf, margin