import { spawn } from 'child_process';

console.log('Starting fast npm install with shell true...');

const npmProc = spawn('npm.cmd', ['install', '--no-audit', '--no-fund'], {
  cwd: 'c:\\Users\\kandola\\Videos\\projectremotion',
  shell: true,
  stdio: 'inherit'
});

npmProc.on('close', (code) => {
  console.log(`npm install exited with code ${code}`);
  process.exit(code || 0);
});
