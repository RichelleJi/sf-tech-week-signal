#!/usr/bin/env python3
"""Build browser assets, a portable SQLite database, and the D1 migration."""

from __future__ import annotations

import json
import shutil
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "sf-tech-week-events.json"
DIST_DATA = ROOT / "dist" / "data"
CLIENT = ROOT / "dist" / "client"
MIGRATIONS = ROOT / "drizzle"
SCRAPED_AT = "2026-09-17"

COLUMNS = (
    "source_id",
    "event_date",
    "event_time",
    "title",
    "host",
    "location",
    "status",
    "source_url",
    "description",
    "description_status",
    "scraped_at",
)

SCHEMA = """CREATE TABLE IF NOT EXISTS events (
  source_id TEXT PRIMARY KEY,
  event_date TEXT NOT NULL,
  event_time TEXT NOT NULL,
  title TEXT NOT NULL,
  host TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  description_status TEXT NOT NULL DEFAULT 'pending',
  scraped_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_event_date_idx ON events(event_date);
CREATE INDEX IF NOT EXISTS events_title_idx ON events(title);
"""


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def normalize(record: dict) -> dict:
    description = str(record.get("description") or "").strip()
    return {
        "source_id": str(record["source_id"]),
        "date": str(record["date"]),
        "time": str(record.get("time") or ""),
        "title": str(record.get("title") or ""),
        "host": str(record.get("host") or ""),
        "location": str(record.get("location") or ""),
        "status": str(record.get("status") or ""),
        "source_url": str(record.get("source_url") or ""),
        "description": description,
        "description_status": "retained" if description else "pending",
        "scraped_at": str(record.get("scraped_at") or SCRAPED_AT),
    }


def db_row(record: dict) -> tuple[str, ...]:
    return (
        record["source_id"],
        record["date"],
        record["time"],
        record["title"],
        record["host"],
        record["location"],
        record["status"],
        record["source_url"],
        record["description"],
        record["description_status"],
        record["scraped_at"],
    )


def build_migration(records: list[dict]) -> str:
    statements = [SCHEMA]
    column_sql = ", ".join(COLUMNS)
    updates = ", ".join(
        f"{column}=excluded.{column}" for column in COLUMNS if column != "source_id"
    )
    for start in range(0, len(records), 100):
        values = []
        for record in records[start : start + 100]:
            values.append("(" + ", ".join(sql_literal(v) for v in db_row(record)) + ")")
        statements.append(
            f"INSERT INTO events ({column_sql}) VALUES\n"
            + ",\n".join(values)
            + f"\nON CONFLICT(source_id) DO UPDATE SET {updates};\n"
        )
    return "\n".join(statements)


def main() -> None:
    records = [normalize(record) for record in json.loads(SOURCE.read_text())]
    if len(records) != 1697 or len({record["source_id"] for record in records}) != len(records):
        raise RuntimeError("Expected 1,697 unique SF Tech Week events")

    DIST_DATA.mkdir(parents=True, exist_ok=True)
    CLIENT.mkdir(parents=True, exist_ok=True)
    MIGRATIONS.mkdir(parents=True, exist_ok=True)

    formatted = json.dumps(records, ensure_ascii=False, indent=2) + "\n"
    compact = json.dumps(records, ensure_ascii=False, separators=(",", ":"))
    SOURCE.write_text(formatted)
    (DIST_DATA / "events.json").write_text(formatted)
    (DIST_DATA / "events.js").write_text(f"window.SF_TECH_WEEK_EVENTS={compact};\n")
    (MIGRATIONS / "0000_events.sql").write_text(build_migration(records))

    database = DIST_DATA / "events.sqlite"
    if database.exists():
        database.unlink()
    connection = sqlite3.connect(database)
    try:
        connection.executescript(SCHEMA)
        connection.executemany(
            f"INSERT INTO events ({', '.join(COLUMNS)}) VALUES ({', '.join('?' for _ in COLUMNS)})",
            [db_row(record) for record in records],
        )
        connection.commit()
    finally:
        connection.close()

    for filename in ("index.html", "styles.css", "app.js"):
        shutil.copy2(ROOT / "dist" / filename, CLIENT / filename)
    client_data = CLIENT / "data"
    if client_data.exists():
        shutil.rmtree(client_data)
    shutil.copytree(DIST_DATA, client_data)

    print(f"Built {len(records):,} records in JSON, JavaScript, SQLite, and D1 migration formats")


if __name__ == "__main__":
    main()
