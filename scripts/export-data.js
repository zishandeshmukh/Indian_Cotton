#!/usr/bin/env node

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
const backupDir = path.join(rootDir, 'backup');

// Load environment variables
console.log('📦 Loading environment variables...');
dotenv.config({ path: path.join(rootDir, '.env') });

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

async function exportData() {
  // Check required environment variables
  const requiredVars = ['PGUSER', 'PGHOST', 'PGPASSWORD', 'PGDATABASE', 'PGPORT'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.log('\n💡 Your .env file should contain:');
    console.log('DATABASE_URL=postgres://postgres:your_password@localhost:5432/fabricshop');
    console.log('PGUSER=postgres');
    console.log('PGHOST=localhost');
    console.log('PGPASSWORD=your_password');
    console.log('PGDATABASE=fabricshop');
    console.log('PGPORT=5432');
    process.exit(1);
  }

  // Create a new database pool
  const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT || '5432'),
  });

  try {
    console.log('🔄 Connecting to the database...');
    const client = await pool.connect();
    console.log(`✅ Connected to database ${process.env.PGDATABASE}`);

    // Get all table names from the database
    const tableResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `);

    const tables = tableResult.rows.map(row => row.table_name);
    console.log(`📋 Found ${tables.length} tables: ${tables.join(', ')}`);

    // Export data from each table
    for (const table of tables) {
      console.log(`🔄 Exporting data from ${table}...`);
      
      // Get all rows from the table
      const result = await client.query(`SELECT * FROM ${table}`);
      
      // Write the data to a JSON file
      const filePath = path.join(backupDir, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(result.rows, null, 2));
      
      console.log(`✅ Exported ${result.rows.length} rows from ${table} to ${filePath}`);
    }

    // Release the client back to the pool
    client.release();
    
    console.log('\n🎉 Data export completed successfully.');
    console.log(`📂 Backup files are stored in the '${backupDir}' directory.`);
    
    return true;
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    return false;
  } finally {
    // Close the pool
    await pool.end();
  }
}

console.log('🚀 Starting data export...');
exportData()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });