CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  description TEXT,
  url TEXT,
  email TEXT,
  phone TEXT,
  image_urls TEXT,
  report TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_email TEXT,
  action TEXT,
  details TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id),
  user_email TEXT,
  rating INTEGER,
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);