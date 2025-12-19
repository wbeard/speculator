import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

let db = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS features (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  feature_id TEXT NOT NULL,
  parent_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  assigned_to TEXT,
  blocked_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (feature_id) REFERENCES features(id),
  FOREIGN KEY (parent_id) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS task_dependencies (
  task_id TEXT NOT NULL,
  depends_on_id TEXT NOT NULL,
  PRIMARY KEY (task_id, depends_on_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (depends_on_id) REFERENCES tasks(id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_feature_id ON tasks(feature_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_deps_task_id ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_depends_on ON task_dependencies(depends_on_id);
`;

export function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== '/') {
    if (existsSync(join(dir, '.speculator'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return process.cwd();
}

export function initDb(dbPath) {
  if (db) return db;

  const projectRoot = findProjectRoot();
  const finalPath = dbPath || join(projectRoot, '.speculator', 'tasks.db');

  const dir = dirname(finalPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  db = new Database(finalPath);
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA);

  return db;
}

export function getDb() {
  if (!db) {
    return initDb();
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
