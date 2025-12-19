import { Command } from 'commander';
import { createFeature, getFeature } from '../operations/features.js';

export function registerFeatureCommands(program) {
  const feature = program.command('feature').description('Single feature operations');

  feature
    .command('create <name>')
    .description('Create a new feature')
    .option('-d, --description <description>', 'Feature description')
    .action((name, options) => {
      const result = createFeature(name, options.description);
      console.log(JSON.stringify(result, null, 2));
    });

  feature
    .command('show <id>')
    .description('Show feature details with tasks')
    .action((id) => {
      const result = getFeature(id);
      if (!result) {
        console.error(JSON.stringify({ error: `Feature ${id} not found` }));
        process.exit(1);
      }
      console.log(JSON.stringify(result, null, 2));
    });
}
