CREATE TABLE IF NOT EXISTS detections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    english_name TEXT,
    sinhala_name TEXT,
    confidence REAL,
    habitat TEXT,
    diet TEXT,
    image_url TEXT,
    video_url TEXT,
    source_type TEXT,
    created_at TEXT
);