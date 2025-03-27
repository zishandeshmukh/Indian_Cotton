import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create PostgreSQL connection pool
const { Pool } = pg;
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function exportData() {
  try {
    console.log('Starting data export...');
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '..', 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    // Export admins
    const admins = await db.query('SELECT * FROM admins');
    fs.writeFileSync(
      path.join(backupDir, 'admins.json'),
      JSON.stringify(admins.rows, null, 2)
    );
    console.log(`Exported ${admins.rows.length} admins`);
    
    // Export categories
    const categories = await db.query('SELECT * FROM categories');
    fs.writeFileSync(
      path.join(backupDir, 'categories.json'),
      JSON.stringify(categories.rows, null, 2)
    );
    console.log(`Exported ${categories.rows.length} categories`);
    
    // Export products
    const products = await db.query('SELECT * FROM products');
    fs.writeFileSync(
      path.join(backupDir, 'products.json'),
      JSON.stringify(products.rows, null, 2)
    );
    console.log(`Exported ${products.rows.length} products`);
    
    // Export cart_items
    const cartItems = await db.query('SELECT * FROM cart_items');
    fs.writeFileSync(
      path.join(backupDir, 'cart_items.json'),
      JSON.stringify(cartItems.rows, null, 2)
    );
    console.log(`Exported ${cartItems.rows.length} cart items`);
    
    console.log('Data export completed successfully!');
    console.log(`Backup files are stored in: ${backupDir}`);
    
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    await db.end();
  }
}

exportData();