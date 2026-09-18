CREATE TABLE IF NOT EXISTS classification_runs (
  id TEXT PRIMARY KEY,
  model TEXT NOT NULL,
  status TEXT NOT NULL,
  total_events INTEGER NOT NULL DEFAULT 0,
  processed_events INTEGER NOT NULL DEFAULT 0,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_latency_ms INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_classification_runs_model_started
ON classification_runs(model, started_at DESC);

CREATE TABLE IF NOT EXISTS event_classifications (
  source_id TEXT NOT NULL,
  model TEXT NOT NULL,
  run_id TEXT NOT NULL,
  signal TEXT NOT NULL,
  best_for TEXT NOT NULL,
  vibe INTEGER NOT NULL,
  verdict TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  classified_at TEXT NOT NULL,
  PRIMARY KEY (source_id, model),
  FOREIGN KEY (source_id) REFERENCES events(source_id),
  FOREIGN KEY (run_id) REFERENCES classification_runs(id)
);

CREATE INDEX IF NOT EXISTS idx_event_classifications_model_signal
ON event_classifications(model, signal);

PRAGMA optimize;
