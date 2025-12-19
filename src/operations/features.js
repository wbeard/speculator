import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';

export function createFeature(name, description) {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO features (id, name, description, status, created_at, updated_at)
    VALUES (?, ?, ?, 'active', ?, ?)
  `).run(id, name, description || null, now, now);

  return {
    id,
    name,
    description: description || null,
    status: 'active',
    created_at: now,
    updated_at: now,
  };
}

export function listFeatures(status) {
  const db = getDb();

  let query = 'SELECT * FROM features';
  const params = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  const features = db.prepare(query).all(...params);

  return features.map((feature) => {
    const counts = db
      .prepare(
        `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked
      FROM tasks
      WHERE feature_id = ?
    `
      )
      .get(feature.id);

    return {
      ...feature,
      task_counts: {
        total: counts.total || 0,
        todo: counts.todo || 0,
        in_progress: counts.in_progress || 0,
        done: counts.done || 0,
        blocked: counts.blocked || 0,
      },
    };
  });
}

function buildTaskTree(tasks) {
  const taskMap = new Map();
  const rootTasks = [];
  const db = getDb();

  for (const task of tasks) {
    const deps = db
      .prepare('SELECT depends_on_id FROM task_dependencies WHERE task_id = ?')
      .all(task.id);

    taskMap.set(task.id, {
      ...task,
      children: [],
      dependencies: deps.map((d) => d.depends_on_id),
    });
  }

  for (const task of tasks) {
    const taskWithChildren = taskMap.get(task.id);
    if (task.parent_id && taskMap.has(task.parent_id)) {
      taskMap.get(task.parent_id).children.push(taskWithChildren);
    } else {
      rootTasks.push(taskWithChildren);
    }
  }

  return rootTasks;
}

export function findFeatureByName(name) {
  const db = getDb();
  return db.prepare('SELECT * FROM features WHERE name = ?').get(name);
}

export function resolveFeatureId(nameOrId) {
  // Check if it looks like a UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(nameOrId)) {
    return nameOrId;
  }
  // Otherwise, look up by name
  const feature = findFeatureByName(nameOrId);
  if (!feature) {
    throw new Error(`Feature "${nameOrId}" not found`);
  }
  return feature.id;
}

export function getFeature(featureId) {
  const db = getDb();

  // Support both name and UUID
  const resolvedId = resolveFeatureId(featureId);
  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(resolvedId);

  if (!feature) {
    return null;
  }

  const counts = db
    .prepare(
      `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
      SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked
    FROM tasks
    WHERE feature_id = ?
  `
    )
    .get(resolvedId);

  const tasks = db.prepare('SELECT * FROM tasks WHERE feature_id = ? ORDER BY created_at').all(resolvedId);

  return {
    ...feature,
    task_counts: {
      total: counts.total || 0,
      todo: counts.todo || 0,
      in_progress: counts.in_progress || 0,
      done: counts.done || 0,
      blocked: counts.blocked || 0,
    },
    tasks: buildTaskTree(tasks),
  };
}
