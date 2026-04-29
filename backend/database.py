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

    with open(
        schema_path,
        "r",
        encoding="utf-8"
    ) as f:
        schema_sql = f.read()

    cursor.executescript(
        schema_sql
    )

    conn.commit()
    conn.close()


def save_detection(
    english_name,
    sinhala_name,
    confidence,
    habitat,
    diet,
    image_url="",
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
            source_type,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            english_name,
            sinhala_name,
            confidence,
            habitat,
            diet,
            image_url,
            source_type,
            datetime.now().isoformat()
        )
    )

    conn.commit()

    print(
        "DB INSERT SUCCESS"
    )

    conn.close()


def delete_detection(
    detection_id
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM detections
        WHERE id = ?
        """,
        (detection_id,)
    )

    conn.commit()

    print(
        f"Detection deleted: {detection_id}"
    )

    conn.close()


def get_dashboard_stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT COUNT(*) as total
        FROM detections
        """
    )

    total_detections = (
        cursor.fetchone()["total"]
    )

    cursor.execute(
        """
        SELECT COUNT(DISTINCT english_name) as total
        FROM detections
        """
    )

    species_identified = (
        cursor.fetchone()["total"]
    )

    cursor.execute(
        """
        SELECT AVG(confidence) as avg_conf
        FROM detections
        """
    )

    avg_result = (
        cursor.fetchone()["avg_conf"]
    )

    average_confidence = round(
        avg_result
        if avg_result
        else 0,
        2
    )

    cursor.execute(
        """
        SELECT
            english_name,
            COUNT(*) as total
        FROM detections
        GROUP BY english_name
        ORDER BY total DESC
        LIMIT 1
        """
    )

    most_detected = (
        cursor.fetchone()
    )

    most_detected_bird = (
        most_detected[
            "english_name"
        ]
        if most_detected
        else "No Data"
    )

    conn.close()

    return {
        "totalDetections":
            total_detections,
        "speciesIdentified":
            species_identified,
        "averageConfidence":
            average_confidence,
        "mostDetectedBird":
            most_detected_bird
    }


def get_recent_detections(
    limit=5
):
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

    return [
        dict(row)
        for row in rows
    ]