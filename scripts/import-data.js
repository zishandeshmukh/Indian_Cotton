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

async function importData() {
  try {
    console.log('Starting data import...');
    
    // Check if backup directory exists
    const backupDir = path.join(__dirname, '..', 'backup');
    if (!fs.existsSync(backupDir)) {
      console.error('Error: Backup directory not found');
      return;
    }
    
    // Import categories
    if (fs.existsSync(path.join(backupDir, 'categories.json'))) {
      const categoriesData = JSON.parse(fs.readFileSync(path.join(backupDir, 'categories.json')));
      
      // Clear existing categories
      await db.query('TRUNCATE categories CASCADE');
      
      // Insert categories
      for (const category of categoriesData) {
        await db.query(
          'INSERT INTO categories (id, name, description, product_count) VALUES ($1, $2, $3, $4)',
          [category.id, category.name, category.description, category.product_count]
        );
      }
      
      // Reset sequence
      await db.query('SELECT setval(\'categories_id_seq\', (SELECT MAX(id) FROM categories))');
      
      console.log(`Imported ${categoriesData.length} categories`);
    }
    
    // Import products
    if (fs.existsSync(path.join(backupDir, 'products.json'))) {
      const productsData = JSON.parse(fs.readFileSync(path.join(backupDir, 'products.json')));
      
      // Clear existing products
      await db.query('TRUNCATE products CASCADE');
      
      // Insert products
      for (const product of productsData) {
        await db.query(
          'INSERT INTO products (id, name, description, price, image_url, media_files, category, stock, is_featured, is_active, sku) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [
            product.id,
            product.name,
            product.description,
            product.price,
            product.image_url,
            product.media_files || '[]',
            product.category,
            product.stock,
            product.is_featured,
            product.is_active,
            product.sku
          ]
        );
      }
      
      // Reset sequence
      await db.query('SELECT setval(\'products_id_seq\', (SELECT MAX(id) FROM products))');
      
      console.log(`Imported ${productsData.length} products`);
    }
    
    // Import admins
    if (fs.existsSync(path.join(backupDir, 'admins.json'))) {
      const adminsData = JSON.parse(fs.readFileSync(path.join(backupDir, 'admins.json')));
      
      // Clear existing admins
      await db.query('TRUNCATE admins CASCADE');
      
      // Insert admins
      for (const admin of adminsData) {
        await db.query(
          'INSERT INTO admins (id, username, password, email, role) VALUES ($1, $2, $3, $4, $5)',
          [admin.id, admin.username, admin.password, admin.email, admin.role]
        );
      }
      
      // Reset sequence
      await db.query('SELECT setval(\'admins_id_seq\', (SELECT MAX(id) FROM admins))');
      
      console.log(`Imported ${adminsData.length} admins`);
    }
    
    // Import cart_items
    if (fs.existsSync(path.join(backupDir, 'cart_items.json'))) {
      const cartItemsData = JSON.parse(fs.readFileSync(path.join(backupDir, 'cart_items.json')));
      
      // Clear existing cart_items
      await db.query('TRUNCATE cart_items CASCADE');
      
      // Insert cart_items
      for (const item of cartItemsData) {
        await db.query(
          'INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES ($1, $2, $3, $4)',
          [item.id, item.cart_id, item.product_id, item.quantity]
        );
      }
      
      // Reset sequence
      await db.query('SELECT setval(\'cart_items_id_seq\', (SELECT MAX(id) FROM cart_items))');
      
      console.log(`Imported ${cartItemsData.length} cart items`);
    }
    
    console.log('Data import completed successfully!');
    
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await db.end();
  }
}

importData();