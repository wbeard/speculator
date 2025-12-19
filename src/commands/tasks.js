import { Command } from 'commander';
import { getReadyTasks, importTasks } from '../operations/tasks.js';
import { resolveFeatureId } from '../operations/features.js';
import { formatOutput } from '../utils/toon.js';

export function registerTasksCommands(program) {
  const tasks = program.command('tasks').description('Task queries and bulk operations');

  tasks
    .command('ready')
    .description('List tasks ready for work')
    .option('-f, --feature <name>', 'Filter by feature name')
    .action((options) => {
      try {
        const featureId = options.feature ? resolveFeatureId(options.feature) : null;
        const result = getReadyTasks(featureId);
        console.log(formatOutput(result));
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    });

  tasks
    .command('import')
    .description('Import tasks from JSON (reads from stdin)')
    .requiredOption('-f, --feature <name>', 'Feature name')
    .action(async (options) => {
      let input = '';

      process.stdin.setEncoding('utf8');

      for await (const chunk of process.stdin) {
        input += chunk;
      }

      try {
        const featureId = resolveFeatureId(options.feature);
        const tasksData = JSON.parse(input);
        if (!Array.isArray(tasksData)) {
          throw new Error('Input must be a JSON array of tasks');
        }
        const result = importTasks(featureId, tasksData);
        console.log(formatOutput(result));
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    });
}
