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

async function importData() {
  try {
    console.log('Connecting to database...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    console.log('Connected! Importing data...');
    
    // Read the JSON file
    const dataPath = path.join(__dirname, '..', 'database-export.json');
    if (!fs.existsSync(dataPath)) {
      console.error('Error: database-export.json not found. Please run export-db-data.js first.');
      return;
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Import each table's data
    for (const table in data) {
      if (data[table].length === 0) {
        console.log(`No data for table ${table}, skipping...`);
        continue;
      }
      
      // First, clear the table
      try {
        await pool.query(`DELETE FROM ${table}`);
        console.log(`Cleared table ${table}`);
      } catch (err) {
        console.error(`Error clearing table ${table}:`, err.message);
        continue;
      }
      
      // Insert each row
      for (const row of data[table]) {
        const columns = Object.keys(row).join(', ');
        const placeholders = Object.keys(row).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(row);
        
        try {
          await pool.query(
            `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
            values
          );
        } catch (err) {
          console.error(`Error inserting into ${table}:`, err.message);
          break;
        }
      }
      
      console.log(`Imported ${data[table].length} rows into ${table}`);
    }
    
    console.log('Data import completed successfully');
    
    await pool.end();
  } catch (error) {
    console.error('Import failed:', error);
  }
}

importData();