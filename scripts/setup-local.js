#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import readline from 'readline';
import pg from 'pg';

const { Pool } = pg;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEnvironment() {
  console.log('🚀 Setting up local development environment...');
  
  // Check if .env file exists
  const envPath = path.join(rootDir, '.env');
  let envExists = fs.existsSync(envPath);
  
  // Default database connection values
  let pgUser = 'postgres';
  let pgPassword = '1234';
  let pgHost = 'localhost';
  let pgPort = '5432';
  let pgDatabase = 'fabricshop';
  let databaseUrl = `postgres://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;
  
  if (envExists) {
    console.log('📋 Found existing .env file. Do you want to update it?');
    const updateEnv = await question('Update .env? (y/n): ');
    
    if (updateEnv.toLowerCase() !== 'y') {
      console.log('✅ Keeping existing .env file.');
    } else {
      envExists = false; // Force recreation of .env file
    }
  }
  
  if (!envExists) {
    console.log('📝 Setting up PostgreSQL connection details...');
    
    pgUser = await question(`PostgreSQL Username (default: ${pgUser}): `) || pgUser;
    pgPassword = await question(`PostgreSQL Password (default: ${pgPassword}): `) || pgPassword;
    pgHost = await question(`PostgreSQL Host (default: ${pgHost}): `) || pgHost;
    pgPort = await question(`PostgreSQL Port (default: ${pgPort}): `) || pgPort;
    pgDatabase = await question(`PostgreSQL Database Name (default: ${pgDatabase}): `) || pgDatabase;
    databaseUrl = `postgres://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;
    
    // Create .env file
    const envContent = `DATABASE_URL=${databaseUrl}
PGUSER=${pgUser}
PGHOST=${pgHost}
PGPASSWORD=${pgPassword}
PGDATABASE=${pgDatabase}
PGPORT=${pgPort}
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with database connection details.');
  }
  
  // Check if .env.example file exists, create if not
  const envExamplePath = path.join(rootDir, '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    const envExampleContent = `DATABASE_URL=postgres://postgres:password@localhost:5432/fabricshop
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=password
PGDATABASE=fabricshop
PGPORT=5432
`;
    fs.writeFileSync(envExamplePath, envExampleContent);
    console.log('✅ Created .env.example file.');
  }
  
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: rootDir });
    console.log('✅ Dependencies installed successfully.');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
  }
  
  console.log('🔄 Would you like to initialize the database now?');
  const initDb = await question('Initialize database? (y/n): ');
  
  if (initDb.toLowerCase() === 'y') {
    try {
      console.log('🚀 Initializing database...');
      execSync('node scripts/init-database.js', { stdio: 'inherit', cwd: rootDir });
      console.log('✅ Database initialized successfully.');
      
      console.log('🔄 Would you like to push the Drizzle schema to the database now?');
      const pushSchema = await question('Push schema? (y/n): ');
      
      if (pushSchema.toLowerCase() === 'y') {
        console.log('🚀 Pushing schema to database...');
        execSync('node scripts/db-push.js', { stdio: 'inherit', cwd: rootDir });
        console.log('✅ Schema pushed successfully.');
      }
    } catch (error) {
      console.error('❌ Error initializing database:', error.message);
    }
  }
  
  console.log('\n🎉 Local development environment setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Access the application at: http://localhost:5000');
  console.log('3. Admin login: admin / admin123');
  
  rl.close();
}

setupEnvironment().catch(error => {
  console.error('❌ Unhandled error:', error);
  rl.close();
  process.exit(1);
});