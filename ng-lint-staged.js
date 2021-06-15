#!/usr/bin/env node

// Inspired by: https://github.com/angular/angular-cli/issues/7612#issuecomment-455802617

const { spawn } = require('child_process');
const path = require('path');

const script = process.argv[2] || 'lint';

const scriptArgs = [];
const fileArgs = [];

let filesSwitch = false;
for (const arg of process.argv) {
  if (arg === '--') {
    filesSwitch = true;
    continue;
  }

  if (filesSwitch) {
    fileArgs.push(arg);
  } else {
    scriptArgs.push(arg);
  }
}

const files = fileArgs.map(file => {
  // ng lint's --files argument only works with relative paths
  // strip cwd and leading path delimiter
  return `--files="${path.relative(process.cwd(), file)}"`;
});
const npm = spawn('npm', ['run', script, '--', ...scriptArgs, ...files], {
  cwd: process.cwd(),
  env: process.env,
  shell: true,
});

npm.stdout.on('data', data => {
  console.log(data.toString());
});

npm.stderr.on('data', data => {
  console.error(data.toString());
});

npm.on('close', code => {
  if (code) {
    console.error(`Child process existed with code ${code}`);
    process.exit(1);
  }
});
