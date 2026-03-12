CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY, level VARCHAR(10), event VARCHAR(100),
  user_id INTEGER, message TEXT, meta JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);