import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure required directories exist
const dirs = [
  'src/components',
  'src/contexts',
  'src/hooks',
  'src/lib',
  'src/pages',
  'src/types',
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create .env if it doesn't exist
if (!fs.existsSync('.env')) {
  fs.copyFileSync('.env.example', '.env');
}

// Install dependencies
console.log('Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Initialize Firebase if not already initialized
if (!fs.existsSync('.firebaserc')) {
  console.log('Initializing Firebase...');
  execSync('firebase init', { stdio: 'inherit' });
}

console.log('Setup complete! You can now start the development server with:');
console.log('npm run dev');