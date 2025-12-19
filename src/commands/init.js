import path from 'path';
import prompts from 'prompts';
import kleur from 'kleur';
import { copyDir, copyFile, ensureDir, installCommands, templatesDir } from '../utils/templates.js';

const cwd = process.cwd();

export function registerInitCommands(program) {
  program
    .command('init')
    .description('Initialize Speculator in the current project')
    .option('--agent <type>', 'Agent type: claude-code, cursor, or both')
    .action(async (options) => {
      await runInit(options);
    });
}

async function runInit(options) {
  console.log();
  console.log(kleur.bold().cyan('Speculator'));
  console.log(kleur.dim('Spec-driven workflow commands for AI agents'));
  console.log();

  let agent = options.agent;

  // Validate agent option if provided
  if (agent && !['claude-code', 'cursor', 'both'].includes(agent)) {
    console.error(kleur.red(`Error: Invalid agent type "${agent}". Must be "claude-code", "cursor", or "both".`));
    process.exit(1);
  }

  // If no agent specified, prompt interactively
  if (!agent) {
    const response = await prompts({
      type: 'select',
      name: 'agent',
      message: 'Which agent to install for?',
      choices: [
        { title: 'Claude Code', value: 'claude-code' },
        { title: 'Cursor', value: 'cursor' },
        { title: 'Both', value: 'both' }
      ],
      initial: 0
    });

    if (!response.agent) {
      console.log(kleur.dim('Installation cancelled.'));
      process.exit(0);
    }

    agent = response.agent;
  }

  const installClaude = agent === 'claude-code' || agent === 'both';
  const installCursor = agent === 'cursor' || agent === 'both';

  // Always install shared templates
  console.log(kleur.dim('Installing shared templates...'));
  await copyDir(
    path.join(templatesDir, 'shared', 'speculator'),
    path.join(cwd, '.speculator')
  );

  // Create hooks directory (empty by default)
  console.log(kleur.dim('Creating hooks directory...'));
  await ensureDir(path.join(cwd, '.speculator', 'hooks'));

  // Install Cursor templates
  if (installCursor) {
    console.log(kleur.dim('Installing Cursor commands...'));
    await installCommands(path.join(cwd, '.cursor', 'commands'), false);
    console.log(kleur.dim('Installing Cursor rule...'));
    await copyDir(
      path.join(templatesDir, 'cursor', 'rules'),
      path.join(cwd, '.cursor', 'rules')
    );
  }

  // Install Claude Code templates
  if (installClaude) {
    console.log(kleur.dim('Installing Claude Code commands...'));
    await installCommands(path.join(cwd, '.claude', 'commands'), true);
    console.log(kleur.dim('Installing CLAUDE.md...'));
    await copyFile(
      path.join(templatesDir, 'claude-code', 'CLAUDE.md'),
      path.join(cwd, 'CLAUDE.md')
    );
    // Auto-install orchestration skill for Claude Code
    console.log(kleur.dim('Installing multi-agent orchestration skill...'));
    await copyDir(
      path.join(templatesDir, 'skills', 'speculator-orchestration'),
      path.join(cwd, '.claude', 'skills', 'speculator-orchestration')
    );
  }

  console.log();

  // Agent-specific success message
  if (agent === 'both') {
    console.log(kleur.green('Speculator initialized for Claude Code and Cursor!'));
    console.log();
    console.log(`Commands added to ${kleur.cyan('.claude/commands/')} and ${kleur.cyan('.cursor/commands/')}`);
    console.log(`Skill installed to ${kleur.cyan('.claude/skills/speculator-orchestration/')}`);
    console.log(`Rule added to ${kleur.cyan('.cursor/rules/speculator.mdc')}`);
  } else if (agent === 'claude-code') {
    console.log(kleur.green('Speculator initialized for Claude Code!'));
    console.log();
    console.log(`Commands added to ${kleur.cyan('.claude/commands/')}`);
    console.log(`Skill installed to ${kleur.cyan('.claude/skills/speculator-orchestration/')}`);
  } else {
    console.log(kleur.green('Speculator initialized for Cursor!'));
    console.log();
    console.log(`Commands added to ${kleur.cyan('.cursor/commands/')}`);
    console.log(`Rule added to ${kleur.cyan('.cursor/rules/speculator.mdc')}`);
  }

  console.log();
  console.log(kleur.dim('Get started by running /spec.new in your agent.'));
  console.log();
}
