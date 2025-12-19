import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const templatesDir = path.join(__dirname, '..', '..', 'templates');

export async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export async function copyFile(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

export async function writeFile(dest, content) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, content, 'utf8');
}

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

export async function installCommands(destDir, addFrontmatter = false) {
  const commandsDir = path.join(templatesDir, 'commands');
  const metaPath = path.join(commandsDir, 'meta.json');

  await fs.mkdir(destDir, { recursive: true });

  // Load metadata for frontmatter
  let meta = {};
  if (addFrontmatter) {
    const metaContent = await fs.readFile(metaPath, 'utf8');
    meta = JSON.parse(metaContent);
  }

  // Get command files (exclude meta.json)
  const entries = await fs.readdir(commandsDir);
  const commandFiles = entries.filter(f => f.endsWith('.md'));

  for (const file of commandFiles) {
    const srcPath = path.join(commandsDir, file);
    const destPath = path.join(destDir, file);
    let content = await fs.readFile(srcPath, 'utf8');

    if (addFrontmatter) {
      // Extract command name from filename (e.g., "spec.new" from "spec.new.md")
      const commandName = file.replace('.md', '');
      const description = meta[commandName] || '';

      if (description) {
        content = `---\ndescription: ${description}\n---\n\n${content}`;
      }
    }

    await writeFile(destPath, content);
  }
}
