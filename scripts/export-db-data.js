import pg from 'pg';
const { Pool } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportData() {
  try {
    console.log('Connecting to database...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    console.log('Connected! Exporting data...');
    
    // List of tables to export
    const tables = [
      'products',
      'categories',
      'users',
      'orders',
      'order_items',
      'cart_items',
      'uploaded_files',
      'admins'
    ];
    
    const data = {};

    // Export each table's data
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT * FROM ${table}`);
        data[table] = result.rows;
        console.log(`Exported ${result.rowCount} rows from ${table}`);
      } catch (err) {
        console.log(`Table ${table} not found or empty, skipping.`);
      }
    }

    // Write to file
    const outputPath = path.join(__dirname, '..', 'database-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`Data exported to ${outputPath}`);
    
    await pool.end();
  } catch (error) {
    console.error('Export failed:', error);
  }
}

exportData();