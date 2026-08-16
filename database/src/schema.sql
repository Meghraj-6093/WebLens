-- WebLens SQLite / PostgreSQL compatible schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  tier TEXT DEFAULT 'free', -- 'free' | 'pro' | 'agency'
  avatar_url TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pwd_reset_token ON password_reset_tokens(token_hash);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_domain ON projects(domain);

CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  domain TEXT NOT NULL,
  status TEXT NOT NULL, -- 'queued', 'running', 'completed', 'failed', 'timeout', 'partial'
  overall_score INTEGER,
  stage TEXT,
  progress INTEGER DEFAULT 0,
  screenshot_url TEXT,
  mobile_screenshot_url TEXT,
  error_message TEXT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_scans_domain ON scans(domain);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);

CREATE TABLE IF NOT EXISTS project_scans (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  scan_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_scans_project ON project_scans(project_id);
CREATE INDEX IF NOT EXISTS idx_project_scans_scan ON project_scans(scan_id);

CREATE TABLE IF NOT EXISTS category_scores (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL,
  category TEXT NOT NULL,
  score INTEGER NOT NULL,
  rating TEXT NOT NULL,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  passed_count INTEGER DEFAULT 0,
  weight REAL NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cat_scores_scan_id ON category_scores(scan_id);

CREATE TABLE IF NOT EXISTS audit_results (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL,
  category TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  technical_details TEXT,
  location TEXT,
  passed INTEGER NOT NULL,
  score_impact INTEGER DEFAULT 0,
  fix_status TEXT DEFAULT 'not_fixed',
  created_at TEXT NOT NULL,
  FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_results_scan_id ON audit_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_audit_results_category ON audit_results(category);
CREATE INDEX IF NOT EXISTS idx_audit_results_severity ON audit_results(severity);

CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL,
  url TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  size_bytes INTEGER DEFAULT 0,
  load_time_ms INTEGER DEFAULT 0,
  status_code INTEGER DEFAULT 200,
  mime_type TEXT,
  is_compressed INTEGER DEFAULT 0,
  is_cached INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_resources_scan_id ON resources(scan_id);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  visibility TEXT DEFAULT 'public', -- 'public' | 'private'
  created_at TEXT NOT NULL,
  expires_at TEXT,
  FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reports_token ON reports(share_token);

CREATE TABLE IF NOT EXISTS usage_records (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL, -- user_id or IP address
  date TEXT NOT NULL,       -- YYYY-MM-DD
  count INTEGER DEFAULT 1,
  UNIQUE(identifier, date)
);

CREATE INDEX IF NOT EXISTS idx_usage_identifier ON usage_records(identifier, date);
