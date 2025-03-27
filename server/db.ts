import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;

// Load environment variables
dotenv.config();

// Create PostgreSQL connection pool
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
export async function testConnection() {
  try {
    const client = await db.connect();
    console.log('Successfully connected to PostgreSQL database!');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Initialize database tables
export async function initDb() {
  try {
    // Create an extension for enums if not exists
    await db.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Create category enum type
    await db.query(`
      DO $$ BEGIN
        CREATE TYPE category_enum AS ENUM ('frock', 'lehenga', 'kurta', 'net', 'cutpiece');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        category category_enum NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        sku TEXT NOT NULL
      );
    `);

    // Create categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        product_count INTEGER DEFAULT 0
      );
    `);

    // Create cart items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      );
    `);

    // Create admins table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'user'
      );
    `);

    // Insert default categories if not exist
    const defaultCategories = [
      { name: 'frock', description: 'Casual and formal dress materials for children and women' },
      { name: 'lehenga', description: 'Traditional Indian clothing for women, often worn during weddings and festivals' },
      { name: 'kurta', description: 'Traditional Indian clothing materials for men and women' },
      { name: 'net', description: 'Transparent, delicate fabrics used for overlays and decorative purposes' },
      { name: 'cutpiece', description: 'Pre-cut fabric pieces ready for specific garment patterns' }
    ];

    for (const category of defaultCategories) {
      await db.query(`
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING;
      `, [category.name, category.description]);
    }

    // Insert default admin if not exists
    await db.query(`
      INSERT INTO admins (username, password, email, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING;
    `, ['admin', 'admin123', 'deshmukhzishan06@gmail.com', 'admin']);

    // Insert sample products if table is empty
    const productsCount = await db.query('SELECT COUNT(*) FROM products');
    
    if (parseInt(productsCount.rows[0].count) === 0) {
      const sampleProducts = [
        {
          name: 'Royal Silk Lehenga Fabric',
          description: 'Premium silk fabric for lehenga, perfect for weddings and special occasions.',
          price: 49900, // 499.00
          image_url: 'https://images.unsplash.com/photo-1596942517067-59ecf323f71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          category: 'lehenga',
          stock: 23,
          is_featured: true,
          is_active: true,
          sku: 'FB-LS-001'
        },
        {
          name: 'Premium Cotton Frock Fabric',
          description: 'Soft cotton fabric ideal for children\'s frocks and casual wear.',
          price: 34900, // 349.00
          image_url: 'https://images.unsplash.com/photo-1604917621956-10dfa7cce2e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          category: 'frock',
          stock: 45,
          is_featured: false,
          is_active: true,
          sku: 'FB-FR-002'
        },
        {
          name: 'Handloom Kurta Fabric',
          description: 'Traditional handloom fabric perfect for ethnic kurtas.',
          price: 59900, // 599.00
          image_url: 'https://images.unsplash.com/photo-1589891685388-c9038979ed0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          category: 'kurta',
          stock: 12,
          is_featured: false,
          is_active: true,
          sku: 'FB-KR-003'
        },
        {
          name: 'Embroidered Net Fabric',
          description: 'Delicate net fabric with beautiful embroidery for overlays and decorative purposes.',
          price: 79900, // 799.00
          image_url: 'https://images.unsplash.com/photo-1595515106883-5fedd5a53110?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          category: 'net',
          stock: 35,
          is_featured: false,
          is_active: true,
          sku: 'FB-NT-004'
        },
        {
          name: 'Designer Cut Piece',
          description: 'Pre-cut fabric piece ready for specific garment patterns.',
          price: 29900, // 299.00
          image_url: 'https://images.unsplash.com/photo-1558304970-abd589baebe5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          category: 'cutpiece',
          stock: 20,
          is_featured: false,
          is_active: true,
          sku: 'FB-CP-005'
        },
        {
          name: 'Bridal Lehenga Fabric',
          description: 'Luxury fabric for bridal lehengas with intricate embellishments.',
          price: 129900, // 1299.00
          image_url: 'https://images.unsplash.com/photo-1606603696914-2c60681ef707?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          category: 'lehenga',
          stock: 8,
          is_featured: true,
          is_active: true,
          sku: 'FB-LS-006'
        },
        {
          name: 'Linen Kurta Fabric',
          description: 'Breathable linen fabric perfect for summer kurtas.',
          price: 49900, // 499.00
          image_url: 'https://images.unsplash.com/photo-1549349807-34dfcbe3ed16?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          category: 'kurta',
          stock: 30,
          is_featured: false,
          is_active: true,
          sku: 'FB-KR-007'
        },
        {
          name: 'Designer Frock Material',
          description: 'Premium material for designer frocks with unique patterns.',
          price: 39900, // 399.00
          image_url: 'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          category: 'frock',
          stock: 18,
          is_featured: false,
          is_active: true,
          sku: 'FB-FR-008'
        }
      ];

      for (const product of sampleProducts) {
        await db.query(`
          INSERT INTO products (name, description, price, image_url, category, stock, is_featured, is_active, sku)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `, [
          product.name,
          product.description,
          product.price,
          product.image_url,
          product.category,
          product.stock,
          product.is_featured,
          product.is_active,
          product.sku
        ]);

        // Update category product count
        await db.query(`
          UPDATE categories 
          SET product_count = product_count + 1 
          WHERE name = $1;
        `, [product.category]);
      }
    }

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}