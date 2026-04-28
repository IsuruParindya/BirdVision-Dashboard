import os
import json
import torch

from torchvision import transforms, models
from torch import nn
from ultralytics import YOLO


# =========================================
# BASE PATHS
# =========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODELS_DIR = os.path.join(
    BASE_DIR,
    "models"
)

FONTS_DIR = os.path.join(
    BASE_DIR,
    "fonts"
)

# =========================================
# FILE PATHS
# =========================================

PTH_PATH = os.path.join(
    MODELS_DIR,
    "bird_resnet50.pth"
)

CLASSES_PATH = os.path.join(
    MODELS_DIR,
    "classes.json"
)

SINHALA_MAP_PATH = os.path.join(
    MODELS_DIR,
    "sinhala_map.json"
)

SPECIES_INFO_PATH = os.path.join(
    MODELS_DIR,
    "species_info.json"
)

YOLO_PATH = os.path.join(
    MODELS_DIR,
    "best.pt"
)

font_path = os.path.join(
    FONTS_DIR,
    "NotoSansSinhala-Regular.ttf"
)


# =========================================
# LOAD JSON FILES
# =========================================

with open(
    CLASSES_PATH,
    encoding="utf-8"
) as f:
    classes = json.load(f)

with open(
    SINHALA_MAP_PATH,
    encoding="utf-8"
) as f:
    sinhala = json.load(f)

with open(
    SPECIES_INFO_PATH,
    encoding="utf-8"
) as f:
    species_info = json.load(f)


# =========================================
# DEVICE
# =========================================

device = torch.device("cpu")


# =========================================
# RESNET50 CLASSIFIER
# =========================================

clf = models.resnet50(
    weights=None
)

clf.fc = nn.Linear(
    clf.fc.in_features,
    len(classes)
)

clf.load_state_dict(
    torch.load(
        PTH_PATH,
        map_location=device
    )
)

clf = clf.eval()


# =========================================
# YOLO DETECTOR
# =========================================

detector = YOLO(
    YOLO_PATH
)


# =========================================
# IMAGE TRANSFORM
# =========================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])