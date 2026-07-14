CREATE TABLE IF NOT EXISTS meetings (
  id              UUID PRIMARY KEY,
  title           TEXT NOT NULL,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  participant_ids TEXT[] NOT NULL DEFAULT '{}',
  is_online       BOOLEAN NOT NULL DEFAULT false,
  location        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT meetings_time_check CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS meetings_starts_at_idx ON meetings (starts_at);
CREATE INDEX IF NOT EXISTS meetings_participant_ids_idx ON meetings USING GIN (participant_ids);
