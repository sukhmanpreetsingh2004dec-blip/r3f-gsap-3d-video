import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const npmCli = 'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js';

console.log('⚡ Running fast npm install (--ignore-scripts --no-optional)...');
try {
  execFileSync(process.execPath, [
    npmCli,
    'install',
    '--ignore-scripts',
    '--no-optional',
    '--no-fund',
    '--no-audit',
    '--no-progress'
  ], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  console.log('✅ Dependencies installed successfully!');
} catch (err) {
  console.error('❌ Installation failed:', err);
  process.exit(1);
}
