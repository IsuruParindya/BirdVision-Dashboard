import sqlite3
from datetime import datetime
import os

DB_NAME = "birdvision.db"
SCHEMA_FILE = "schema.sql"


def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    schema_path = os.path.join(
        os.path.dirname(__file__),
        SCHEMA_FILE
    )

    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    cursor.executescript(schema_sql)

    # Add video_url column if it doesn't exist (for existing DBs)
    try:
        cursor.execute("ALTER TABLE detections ADD COLUMN video_url TEXT DEFAULT ''")
        conn.commit()
        print("Added video_url column to detections table")
    except Exception:
        pass  # Column already exists

    conn.commit()
    conn.close()


def save_detection(
    english_name,
    sinhala_name,
    confidence,
    habitat,
    diet,
    image_url="",
    video_url="",
    source_type="image",
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO detections (
            english_name,
            sinhala_name,
            confidence,
            habitat,
            diet,
            image_url,
            video_url,
            source_type,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            english_name,
            sinhala_name,
            confidence,
            habitat,
            diet,
            image_url,
            video_url,
            source_type,
            datetime.now().isoformat()
        )
    )

    conn.commit()
    print("DB INSERT SUCCESS")
    conn.close()


def update_detection_image_url(source_type, image_url):
    """Update image_url of the latest detection for a given source_type."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE detections
        SET image_url = ?
        WHERE id = (
            SELECT id FROM detections
            WHERE source_type = ?
            ORDER BY id DESC
            LIMIT 1
        )
        """,
        (image_url, source_type)
    )

    conn.commit()
    print(f"Updated image_url for latest {source_type} detection")
    conn.close()


def delete_detection(detection_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM detections WHERE id = ?",
        (detection_id,)
    )

    conn.commit()
    print(f"Detection deleted: {detection_id}")
    conn.close()


def get_dashboard_stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM detections")
    total_detections = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(DISTINCT english_name) as total FROM detections")
    species_identified = cursor.fetchone()["total"]

    cursor.execute("SELECT AVG(confidence) as avg_conf FROM detections")
    avg_result = cursor.fetchone()["avg_conf"]
    average_confidence = round(avg_result if avg_result else 0, 2)

    # Most detected bird with sinhala name
    cursor.execute(
        """
        SELECT english_name, sinhala_name, COUNT(*) as total
        FROM detections
        GROUP BY english_name
        ORDER BY total DESC
        LIMIT 1
        """
    )
    most_detected = cursor.fetchone()

    most_detected_english = most_detected["english_name"] if most_detected else "No Data"
    most_detected_sinhala = most_detected["sinhala_name"] if most_detected else "දත්ත නැත"

    # Latest source_type for the most detected bird
    most_detected_source = ""
    if most_detected:
        row = conn.execute(
            """
            SELECT source_type FROM detections
            WHERE english_name = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (most_detected_english,)
        ).fetchone()
        most_detected_source = row["source_type"] if row else ""

    conn.close()

    return {
        "totalDetections":            total_detections,
        "speciesIdentified":          species_identified,
        "averageConfidence":          average_confidence,
        "mostDetectedBird":           most_detected_english,
        "mostDetectedBirdSinhala":    most_detected_sinhala,
        "mostDetectedBirdSourceType": most_detected_source,
    }


def get_recent_detections(limit=5):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            english_name,
            sinhala_name,
            confidence,
            habitat,
            diet,
            image_url,
            video_url,
            source_type,
            created_at
        FROM detections
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,)
    )

    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_latest_detection_by_type(source_type):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            english_name,
            sinhala_name,
            confidence,
            habitat,
            diet,
            image_url,
            video_url,
            source_type
        FROM detections
        WHERE source_type = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (source_type,)
    )

    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None