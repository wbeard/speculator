import path from 'path';
import prompts from 'prompts';
import kleur from 'kleur';
import { copyDir, copyFile, ensureDir, installCommands, templatesDir } from '../utils/templates.js';

const cwd = process.cwd();

export function registerInitCommands(program) {
  program
    .command('init')
    .description('Initialize Speculator in the current project')
    .option('--agent <type>', 'Agent type: claude-code or cursor')
    .option('--rules', 'Install CLAUDE.md (for claude-code) or cursor rule (for cursor)')
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
  if (agent && !['claude-code', 'cursor'].includes(agent)) {
    console.error(kleur.red(`Error: Invalid agent type "${agent}". Must be "claude-code" or "cursor".`));
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
        { title: 'Cursor', value: 'cursor' }
      ],
      initial: 0
    });

    if (!response.agent) {
      console.log(kleur.dim('Installation cancelled.'));
      process.exit(0);
    }

    agent = response.agent;
  }

  const installClaude = agent === 'claude-code';
  const installCursor = agent === 'cursor';
  const includeRules = options.rules || false;

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
    if (includeRules) {
      console.log(kleur.dim('Installing Cursor rule...'));
      await copyDir(
        path.join(templatesDir, 'cursor', 'rules'),
        path.join(cwd, '.cursor', 'rules')
      );
    }
  }

  // Install Claude Code templates
  if (installClaude) {
    console.log(kleur.dim('Installing Claude Code commands...'));
    await installCommands(path.join(cwd, '.claude', 'commands'), true);
    if (includeRules) {
      console.log(kleur.dim('Installing CLAUDE.md...'));
      await copyFile(
        path.join(templatesDir, 'claude-code', 'CLAUDE.md'),
        path.join(cwd, 'CLAUDE.md')
      );
    }
    // Auto-install orchestration skill for Claude Code
    console.log(kleur.dim('Installing multi-agent orchestration skill...'));
    await copyDir(
      path.join(templatesDir, 'skills', 'speculator-orchestration'),
      path.join(cwd, '.claude', 'skills', 'speculator-orchestration')
    );
  }

  console.log();
  console.log(kleur.green('Speculator installed!'));
  console.log();
  console.log(kleur.bold('Workflow Commands:'));
  console.log('  /spec.new       - Start a new feature spec');
  console.log('  /spec.fix       - Create a bug fix from repro steps');
  console.log('  /spec.next      - Check status and suggest next step');
  console.log('  /spec.research  - Gather context before planning');
  console.log('  /spec.plan      - Create implementation plan');
  console.log('  /spec.tasks     - Break plan into executable tasks');
  console.log('  /spec.implement - Execute tasks in a loop');
  console.log('  /spec.clarify   - Update spec and assess impact');
  if (installClaude) {
    console.log();
    console.log(kleur.bold('Multi-Agent Orchestration:'));
    console.log('  Use the `spec` CLI to manage tasks across multiple agents.');
    console.log('  Run `spec --help` for available commands.');
  }
  console.log();
  console.log(kleur.bold('Hooks:'));
  console.log('  Add custom hooks in .speculator/hooks/{pre|post}-{command}/');
  console.log();
  console.log(kleur.dim('Start with /spec.new, or run /spec.next to check your current status.'));
  console.log();
}
