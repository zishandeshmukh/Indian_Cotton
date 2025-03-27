-- Create fabric shop database
CREATE DATABASE fabricshop;

-- Connect to the database
\c fabricshop

-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create category enum type
DO $$ BEGIN
  CREATE TYPE category_enum AS ENUM ('frock', 'lehenga', 'kurta', 'net', 'cutpiece');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create products table
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

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  product_count INTEGER DEFAULT 0
);

-- Create cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'user'
);

-- Insert default admin user
INSERT INTO admins (username, password, email, role)
VALUES ('admin', 'admin123', 'deshmukhzishan06@gmail.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, description)
VALUES 
  ('frock', 'Casual and formal dress materials for children and women'),
  ('lehenga', 'Traditional Indian clothing for women, often worn during weddings and festivals'),
  ('kurta', 'Traditional Indian clothing materials for men and women'),
  ('net', 'Transparent, delicate fabrics used for overlays and decorative purposes'),
  ('cutpiece', 'Pre-cut fabric pieces ready for specific garment patterns')
ON CONFLICT (name) DO NOTHING;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fabricshop TO current_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO current_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO current_user;