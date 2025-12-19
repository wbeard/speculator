import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';

function wouldCreateCycle(taskId, dependsOnId) {
  const db = getDb();
  const visited = new Set();
  const queue = [dependsOnId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === taskId) {
      return true;
    }
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const deps = db
      .prepare('SELECT depends_on_id FROM task_dependencies WHERE task_id = ?')
      .all(current);

    for (const dep of deps) {
      queue.push(dep.depends_on_id);
    }
  }

  return false;
}

export function addTask(featureId, title, description, parentId) {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  if (parentId) {
    const parent = db.prepare('SELECT id FROM tasks WHERE id = ?').get(parentId);
    if (!parent) {
      throw new Error(`Parent task ${parentId} not found`);
    }
  }

  const feature = db.prepare('SELECT id FROM features WHERE id = ?').get(featureId);
  if (!feature) {
    throw new Error(`Feature ${featureId} not found`);
  }

  db.prepare(`
    INSERT INTO tasks (id, feature_id, parent_id, title, description, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'todo', ?, ?)
  `).run(id, featureId, parentId || null, title, description || null, now, now);

  return {
    id,
    feature_id: featureId,
    parent_id: parentId || null,
    title,
    description: description || null,
    status: 'todo',
    assigned_to: null,
    blocked_reason: null,
    created_at: now,
    updated_at: now,
  };
}

export function getTask(taskId) {
  const db = getDb();

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

  if (!task) {
    return null;
  }

  const dependsOn = db
    .prepare('SELECT depends_on_id FROM task_dependencies WHERE task_id = ?')
    .all(taskId);

  const blocking = db
    .prepare('SELECT task_id FROM task_dependencies WHERE depends_on_id = ?')
    .all(taskId);

  return {
    ...task,
    depends_on: dependsOn.map((d) => d.depends_on_id),
    blocking: blocking.map((b) => b.task_id),
  };
}

export function claimTask(taskId, agentId) {
  const db = getDb();

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  if (task.status !== 'todo') {
    throw new Error(`Task ${taskId} is not available (status: ${task.status})`);
  }

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE tasks SET status = 'in_progress', assigned_to = ?, updated_at = ?
    WHERE id = ?
  `).run(agentId, now, taskId);

  return {
    ...task,
    status: 'in_progress',
    assigned_to: agentId,
    updated_at: now,
  };
}

export function completeTask(taskId) {
  const db = getDb();

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  if (task.status !== 'in_progress') {
    throw new Error(`Task ${taskId} is not in progress (status: ${task.status})`);
  }

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE tasks SET status = 'done', updated_at = ?
    WHERE id = ?
  `).run(now, taskId);

  return {
    ...task,
    status: 'done',
    updated_at: now,
  };
}

export function blockTask(taskId, reason) {
  const db = getDb();

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE tasks SET status = 'blocked', blocked_reason = ?, updated_at = ?
    WHERE id = ?
  `).run(reason, now, taskId);

  return {
    ...task,
    status: 'blocked',
    blocked_reason: reason,
    updated_at: now,
  };
}

export function unblockTask(taskId) {
  const db = getDb();

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  if (task.status !== 'blocked') {
    throw new Error(`Task ${taskId} is not blocked (status: ${task.status})`);
  }

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE tasks SET status = 'todo', blocked_reason = NULL, updated_at = ?
    WHERE id = ?
  `).run(now, taskId);

  return {
    ...task,
    status: 'todo',
    blocked_reason: null,
    updated_at: now,
  };
}

export function releaseTask(taskId) {
  const db = getDb();

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  if (task.status !== 'in_progress') {
    throw new Error(`Task ${taskId} is not in progress (status: ${task.status})`);
  }

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE tasks SET status = 'todo', assigned_to = NULL, updated_at = ?
    WHERE id = ?
  `).run(now, taskId);

  return {
    ...task,
    status: 'todo',
    assigned_to: null,
    updated_at: now,
  };
}

export function addDependency(taskId, dependsOnId) {
  const db = getDb();

  const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  const dependsOn = db.prepare('SELECT id FROM tasks WHERE id = ?').get(dependsOnId);
  if (!dependsOn) {
    throw new Error(`Dependency task ${dependsOnId} not found`);
  }

  if (wouldCreateCycle(taskId, dependsOnId)) {
    throw new Error('Adding this dependency would create a cycle');
  }

  db.prepare(`
    INSERT OR IGNORE INTO task_dependencies (task_id, depends_on_id)
    VALUES (?, ?)
  `).run(taskId, dependsOnId);
}

export function getReadyTasks(featureId) {
  const db = getDb();

  let query = `
    SELECT t.* FROM tasks t
    WHERE t.status = 'todo'
    AND NOT EXISTS (
      SELECT 1 FROM task_dependencies td
      JOIN tasks dep ON td.depends_on_id = dep.id
      WHERE td.task_id = t.id AND dep.status != 'done'
    )
  `;

  const params = [];

  if (featureId) {
    query += ' AND t.feature_id = ?';
    params.push(featureId);
  }

  query += ' ORDER BY t.created_at';

  return db.prepare(query).all(...params);
}

export function importTasks(featureId, tasks) {
  const db = getDb();

  const feature = db.prepare('SELECT id FROM features WHERE id = ?').get(featureId);
  if (!feature) {
    throw new Error(`Feature ${featureId} not found`);
  }

  const createdTasks = [];
  const now = new Date().toISOString();

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, feature_id, parent_id, title, description, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'todo', ?, ?)
  `);

  const insertDep = db.prepare(`
    INSERT INTO task_dependencies (task_id, depends_on_id)
    VALUES (?, ?)
  `);

  const transaction = db.transaction(() => {
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const id = uuidv4();
      let parentId = null;

      if (task.parent_index !== undefined && task.parent_index < i) {
        parentId = createdTasks[task.parent_index].id;
      }

      insertTask.run(id, featureId, parentId, task.title, task.description || null, now, now);

      createdTasks.push({
        id,
        feature_id: featureId,
        parent_id: parentId,
        title: task.title,
        description: task.description || null,
        status: 'todo',
        assigned_to: null,
        blocked_reason: null,
        created_at: now,
        updated_at: now,
      });
    }

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (task.depends_on_indices) {
        for (const depIndex of task.depends_on_indices) {
          if (depIndex < createdTasks.length) {
            insertDep.run(createdTasks[i].id, createdTasks[depIndex].id);
          }
        }
      }
    }
  });

  transaction();

  return createdTasks;
}
