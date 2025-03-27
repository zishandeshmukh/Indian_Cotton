#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('📦 Setting up local development environment for Fabric E-commerce...');

async function setupEnvironment() {
  try {
    // Check for .env file
    console.log('\n🔍 Checking for .env file...');
    if (fs.existsSync(path.join(rootDir, '.env'))) {
      console.log('✅ .env file exists');
    } else {
      if (fs.existsSync(path.join(rootDir, '.env.example'))) {
        console.log('⚠️ .env file not found, creating from .env.example');
        fs.copyFileSync(
          path.join(rootDir, '.env.example'),
          path.join(rootDir, '.env')
        );
        console.log('✅ Created .env file. Please update with your database credentials.');
      } else {
        console.log('❌ Neither .env nor .env.example found. Please create an .env file with your database credentials.');
      }
    }

    // Check for backup directory
    console.log('\n🔍 Checking for backup directory...');
    const backupDir = path.join(rootDir, 'backup');
    if (fs.existsSync(backupDir)) {
      console.log('✅ Backup directory exists');
    } else {
      console.log('⚠️ Backup directory not found, creating...');
      fs.mkdirSync(backupDir);
      console.log('✅ Created backup directory');
    }

    // Check for logs directory
    console.log('\n🔍 Checking for logs directory...');
    const logsDir = path.join(rootDir, 'logs');
    if (fs.existsSync(logsDir)) {
      console.log('✅ Logs directory exists');
    } else {
      console.log('⚠️ Logs directory not found, creating...');
      fs.mkdirSync(logsDir);
      console.log('✅ Created logs directory');
    }

    // Display next steps
    console.log('\n🚀 Setup completed! Next steps:');
    console.log('1. Edit the .env file with your PostgreSQL database credentials');
    console.log('2. Run the following commands:');
    console.log('   npm install        - Install dependencies');
    console.log('   npm run db:push    - Initialize database schema');
    console.log('   node scripts/import-data.js    - Import sample data (optional)');
    console.log('   npm run dev        - Start the development server');
    console.log('\n📝 The application will be available at http://localhost:5000');
    console.log('👤 Default admin credentials: admin / admin123');
    console.log('\n');
  } catch (error) {
    console.error('❌ Error setting up environment:', error);
    process.exit(1);
  }
}

setupEnvironment();