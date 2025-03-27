#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import readline from 'readline';

const { Pool } = pg;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const backupDir = path.join(rootDir, 'backup');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Load environment variables
console.log('📦 Loading environment variables...');
dotenv.config({ path: path.join(rootDir, '.env') });

async function importData() {
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
    rl.close();
    process.exit(1);
  }

  // Check if backup directory exists
  if (!fs.existsSync(backupDir)) {
    console.error(`❌ Backup directory not found: ${backupDir}`);
    console.log('Please run export-data.js first to create backup files.');
    rl.close();
    process.exit(1);
  }

  // Get all backup files from the backup directory
  const backupFiles = fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      table: path.basename(file, '.json'),
      path: path.join(backupDir, file)
    }));

  if (backupFiles.length === 0) {
    console.error('❌ No backup files found in the backup directory.');
    console.log('Please run export-data.js first to create backup files.');
    rl.close();
    process.exit(1);
  }

  console.log(`📋 Found ${backupFiles.length} backup files: ${backupFiles.map(f => f.table).join(', ')}`);
  
  // Ask for confirmation
  const confirm = await question('\n⚠️ This will overwrite existing data in your database. Continue? (y/n): ');
  
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Import cancelled.');
    rl.close();
    return false;
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

    // Get foreign key constraints to handle them properly
    const constraintsResult = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY';
    `);

    const foreignKeys = constraintsResult.rows;
    
    // Sort tables based on foreign key dependencies
    // Tables with no foreign keys first, then tables with foreign keys
    const sortedTables = [...backupFiles].sort((a, b) => {
      const aHasForeignKeys = foreignKeys.some(fk => fk.table_name === a.table);
      const bHasForeignKeys = foreignKeys.some(fk => fk.table_name === b.table);
      
      if (aHasForeignKeys && !bHasForeignKeys) return 1;
      if (!aHasForeignKeys && bHasForeignKeys) return -1;
      return 0;
    });

    // Temporarily disable triggers and foreign key constraints
    console.log('🔄 Temporarily disabling triggers and constraints...');
    await client.query('SET session_replication_role = replica;');

    // Import data for each table
    for (const { table, path: filePath } of sortedTables) {
      console.log(`🔄 Importing data for ${table}...`);
      
      // Read the data from the backup file
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.length === 0) {
        console.log(`⚠️ No data to import for ${table}, skipping.`);
        continue;
      }
      
      // Truncate the table before importing
      await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
      
      // Get the column names from the first row
      const columns = Object.keys(data[0]);
      
      // Import each row
      for (const row of data) {
        const values = columns.map(col => row[col]);
        const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
        
        // Skip if no columns
        if (columns.length === 0) continue;
        
        // Build and execute the insert query
        const query = `
          INSERT INTO ${table} (${columns.join(', ')})
          VALUES (${placeholders})
        `;
        
        await client.query(query, values);
      }
      
      console.log(`✅ Imported ${data.length} rows into ${table}`);
    }

    // Re-enable triggers and foreign key constraints
    console.log('🔄 Re-enabling triggers and constraints...');
    await client.query('SET session_replication_role = DEFAULT;');

    // Update sequences to match the max ID
    console.log('🔄 Updating sequences...');
    
    for (const { table } of backupFiles) {
      try {
        await client.query(`
          SELECT setval(pg_get_serial_sequence('${table}', 'id'), 
            COALESCE((SELECT MAX(id) FROM ${table}), 1), 
            false);
        `);
      } catch (err) {
        console.log(`⚠️ Could not update sequence for ${table}: ${err.message}`);
      }
    }

    // Release the client back to the pool
    client.release();
    
    console.log('\n🎉 Data import completed successfully.');
    rl.close();
    return true;
  } catch (error) {
    console.error('❌ Error importing data:', error);
    rl.close();
    return false;
  } finally {
    // Close the pool
    await pool.end();
  }
}

console.log('🚀 Starting data import...');
importData()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unhandled error:', error);
    rl.close();
    process.exit(1);
  });