#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Load environment variables
console.log('📦 Loading environment variables...');
dotenv.config({ path: path.join(rootDir, '.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set in .env file');
  console.log('\n💡 Your .env file should contain:');
  console.log('DATABASE_URL=postgres://postgres:1234@localhost:5432/fabricshop');
  console.log('PGUSER=postgres');
  console.log('PGHOST=localhost');
  console.log('PGPASSWORD=1234');
  console.log('PGDATABASE=fabricshop');
  console.log('PGPORT=5432');
  process.exit(1);
}

try {
  // First test if we can connect to the database
  console.log(`🔍 Testing connection to database: ${process.env.DATABASE_URL}`);
  
  // Export the environment variables explicitly for the child process
  const env = { ...process.env };
  
  try {
    // Run the database initialization script directly
    console.log('🚀 Running database push...');
    execSync('npx drizzle-kit push', { 
      stdio: 'inherit',
      env
    });
    console.log('✅ Database schema updated successfully');
  } catch (error) {
    console.error('❌ Error running database push:', error.message);
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n💡 The database does not exist. You need to create it first:');
      console.log('1. Connect to PostgreSQL:');
      console.log('   psql -U postgres');
      console.log('2. Create the database:');
      console.log('   CREATE DATABASE fabricshop;');
      console.log('3. Or use the provided SQL script:');
      console.log('   psql -U postgres -f scripts/create-database.sql');
    }
    
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}