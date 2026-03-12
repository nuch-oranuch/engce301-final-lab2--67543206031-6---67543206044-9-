CREATE TABLE IF NOT EXISTS user_profiles (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio          TEXT,
  avatar_url   VARCHAR(255),
  updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY, level VARCHAR(10), event VARCHAR(100),
  user_id INTEGER, message TEXT, meta JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);