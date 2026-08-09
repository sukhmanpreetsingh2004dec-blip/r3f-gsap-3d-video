import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const gitDir = path.join(projectRoot, '.git');
if (!fs.existsSync(gitDir)) {
  console.log('📁 Creating .git directory manually...');
  fs.mkdirSync(gitDir, { recursive: true });
}

console.log('🏁 Initializing Git database...');
try {
  const out = execSync('git init', { cwd: projectRoot, encoding: 'utf-8' });
  console.log('Output:', out);
} catch (err) {
  console.error('Error:', err.message);
  console.error('Stderr:', err.stderr);
}
