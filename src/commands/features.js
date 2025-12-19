import { Command } from 'commander';
import { listFeatures } from '../operations/features.js';

export function registerFeaturesCommands(program) {
  program
    .command('features')
    .description('List all features')
    .option('-s, --status <status>', 'Filter by status (active, completed, archived)')
    .action((options) => {
      const result = listFeatures(options.status);
      console.log(JSON.stringify(result, null, 2));
    });
}
