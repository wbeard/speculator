import { Command } from 'commander';
import {
  addTask,
  getTask,
  claimTask,
  completeTask,
  blockTask,
  unblockTask,
  releaseTask,
  addDependency,
} from '../operations/tasks.js';
import { resolveFeatureId } from '../operations/features.js';
import { formatOutput } from '../utils/toon.js';

export function registerTaskCommands(program) {
  const task = program.command('task').description('Single task operations');

  task
    .command('add')
    .description('Add a new task')
    .requiredOption('-f, --feature <name>', 'Feature name')
    .requiredOption('-t, --title <title>', 'Task title')
    .option('-d, --description <description>', 'Task description')
    .option('-p, --parent <id>', 'Parent task ID')
    .action((options) => {
      try {
        const featureId = resolveFeatureId(options.feature);
        const result = addTask(
          featureId,
          options.title,
          options.description,
          options.parent
        );
        console.log(formatOutput(result));
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    });

  task
    .command('show <id>')
    .description('Show task details')
    .action((id) => {
      const result = getTask(id);
      if (!result) {
        console.error(`Task ${id} not found`);
        process.exit(1);
      }
      console.log(formatOutput(result));
    });

  task
    .command('claim <id>')
    .description('Claim a task for an agent')
    .option('-a, --agent [agent-id]', 'Agent ID (optional)')
    .action((id, options) => {
      try {
        const result = claimTask(id, options.agent || null);
        console.log(formatOutput(result));
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    });

  task
    .command('complete <id>')
    .description('Mark a task as complete')
    .action((id) => {
      try {
        const result = completeTask(id);
        console.log(formatOutput(result));
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    });

  task
    .command('block <id>')
    .description('Block a task')
    .requiredOption('-r, --reason <reason>', 'Reason for blocking')
    .action((id, options) => {
      try {
        const result = blockTask(id, options.reason);
        console.log(formatOutput(result));
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    });

  task
    .command('unblock <id>')
    .description('Unblock a task')
    .action((id) => {
      try {
        const result = unblockTask(id);
        console.log(formatOutput(result));
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    });

  task
    .command('release <id>')
    .description('Release a claimed task back to todo')
    .action((id) => {
      try {
        const result = releaseTask(id);
        console.log(formatOutput(result));
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    });

  task
    .command('depend <id>')
    .description('Add a dependency to a task')
    .requiredOption('-o, --on <other-id>', 'ID of task this depends on')
    .action((id, options) => {
      try {
        addDependency(id, options.on);
        console.log(formatOutput({ success: true, task_id: id, depends_on: options.on }));
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    });
}
