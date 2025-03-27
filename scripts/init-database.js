#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Load environment variables
console.log('📦 Loading environment variables...');
dotenv.config({ path: path.join(rootDir, '.env') });

// Check required environment variables
const requiredVars = ['PGUSER', 'PGHOST', 'PGPASSWORD', 'PGDATABASE', 'PGPORT'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.log('\n💡 Your .env file should contain:');
  console.log('DATABASE_URL=postgres://postgres:1234@localhost:5432/fabricshop');
  console.log('PGUSER=postgres');
  console.log('PGHOST=localhost');
  console.log('PGPASSWORD=1234');
  console.log('PGDATABASE=fabricshop');
  console.log('PGPORT=5432');
  process.exit(1);
}

async function initDb() {
  // First, try to connect to the PostgreSQL server (not the specific database)
  const pgServerPool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT || '5432'),
    database: 'postgres' // Connect to the default postgres database initially
  });

  try {
    console.log('🔄 Connecting to PostgreSQL server...');
    const client = await pgServerPool.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if the database exists
    const result = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = $1
    `, [process.env.PGDATABASE]);

    if (result.rowCount === 0) {
      console.log(`🔄 Creating database ${process.env.PGDATABASE}...`);
      // Create the database
      await client.query(`CREATE DATABASE ${process.env.PGDATABASE}`);
      console.log(`✅ Database ${process.env.PGDATABASE} created successfully`);
    } else {
      console.log(`✅ Database ${process.env.PGDATABASE} already exists`);
    }

    // Release the client back to the pool
    client.release();

    // Now connect to the specific database
    const dbPool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      password: process.env.PGPASSWORD,
      port: parseInt(process.env.PGPORT || '5432'),
      database: process.env.PGDATABASE
    });

    console.log('🔄 Connecting to application database...');
    const dbClient = await dbPool.connect();
    console.log(`✅ Connected to database ${process.env.PGDATABASE}`);

    // Create an extension for enums if not exists
    console.log('🔄 Setting up database schema...');
    await dbClient.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Create category enum type
    await dbClient.query(`
      DO $$ BEGIN
        CREATE TYPE category_enum AS ENUM ('frock', 'lehenga', 'kurta', 'net', 'cutpiece');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create products table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        media_files JSONB DEFAULT '[]' NOT NULL,
        category category_enum NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        sku TEXT NOT NULL
      );
    `);

    // Create categories table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        product_count INTEGER DEFAULT 0
      );
    `);

    // Create cart items table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      );
    `);

    // Create admins table
    await dbClient.query(`
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
      await dbClient.query(`
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING;
      `, [category.name, category.description]);
    }

    // Insert default admin if not exists
    await dbClient.query(`
      INSERT INTO admins (username, password, email, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING;
    `, ['admin', 'admin123', 'deshmukhzishan06@gmail.com', 'admin']);

    console.log('✅ Database schema setup completed');
    
    // Release the client back to the pool
    dbClient.release();
    
    // Close the pools
    await pgServerPool.end();
    await dbPool.end();

    console.log('📊 Database initialization completed successfully');
    console.log('🚀 You can now run: node scripts/db-push.js');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    await pgServerPool.end().catch(() => {});
    return false;
  }
}

console.log('🚀 Initializing the database...');
initDb()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });