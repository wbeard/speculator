#!/usr/bin/env node

import { Command } from 'commander';
import { initDb } from '../src/db.js';
import { registerFeatureCommands } from '../src/commands/feature.js';
import { registerFeaturesCommands } from '../src/commands/features.js';
import { registerTaskCommands } from '../src/commands/task.js';
import { registerTasksCommands } from '../src/commands/tasks.js';
import { registerInitCommands } from '../src/commands/init.js';

const program = new Command();

program
  .name('spec')
  .description('Speculator task management CLI')
  .version('1.0.0');

// Register init command first (does not need database)
registerInitCommands(program);

// Check if running init command - skip database initialization
const isInitCommand = process.argv[2] === 'init';

if (!isInitCommand) {
  // Initialize database only for non-init commands
  initDb();

  // Register database-dependent commands
  registerFeatureCommands(program);
  registerFeaturesCommands(program);
  registerTaskCommands(program);
  registerTasksCommands(program);
}

program.parse();
