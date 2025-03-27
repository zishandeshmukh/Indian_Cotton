# Database Setup Guide

This document provides comprehensive instructions for setting up and managing the PostgreSQL database for the Fabric Shop application.

## Prerequisites

- PostgreSQL 12 or higher installed on your system
- Basic knowledge of PostgreSQL commands
- Node.js and npm installed on your system

## Local Setup

### Step 1: Install PostgreSQL

#### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

#### Windows
1. Download the installer from [PostgreSQL website](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the on-screen instructions
3. Add PostgreSQL bin directory to your PATH

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Create the Database

You can create the database using one of the following methods:

#### Method 1: Using the setup-local.js script
```bash
# Interactive setup
node scripts/setup-local.js

# For Windows users
scripts\setup-local.bat
```

#### Method 2: Using the init-database.js script
1. Create a `.env` file in the project root directory with the following content:
```
DATABASE_URL=postgres://postgres:your_password@localhost:5432/fabricshop
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=your_password
PGDATABASE=fabricshop
PGPORT=5432
```

2. Run the database initialization script:
```bash
node scripts/init-database.js

# For Windows users
scripts\init-database.bat
```

#### Method 3: Using the SQL script directly
```bash
# Connect to PostgreSQL
psql -U postgres

# Run the SQL script
\i scripts/create-database.sql
```

### Step 3: Push Schema Changes

After creating the database, you need to push the schema changes using Drizzle:

```bash
node scripts/db-push.js

# For Windows users
scripts\db-push.bat

# Alternatively, you can use npm
npm run db:push
```

## Database Structure

The application uses the following database tables:

### Products
- `id`: Serial primary key
- `name`: Text (product name)
- `description`: Text (product description)
- `price`: Integer (price in cents/paise)
- `image_url`: Text (main product image URL)
- `media_files`: JSONB (array of additional media files)
- `category`: Enum ('frock', 'lehenga', 'kurta', 'net', 'cutpiece')
- `stock`: Integer (quantity in stock)
- `is_featured`: Boolean (whether the product is featured)
- `is_active`: Boolean (whether the product is active)
- `sku`: Text (stock keeping unit)

### Categories
- `id`: Serial primary key
- `name`: Text (category name, unique)
- `description`: Text (category description)
- `product_count`: Integer (number of products in the category)

### Cart Items
- `id`: Serial primary key
- `cart_id`: Text (unique identifier for the shopping cart)
- `product_id`: Integer (foreign key to products.id)
- `quantity`: Integer (quantity of the product in the cart)

### Admins
- `id`: Serial primary key
- `username`: Text (admin username, unique)
- `password`: Text (admin password, stored in plain text)
- `email`: Text (admin email address)
- `role`: Text (admin role, default 'user')

## Database Backup and Restore

### Backup
To export your database data to JSON files:

```bash
node scripts/export-data.js

# For Windows users
scripts\export-data.bat
```

This will create a `backup` directory with JSON files for all database tables.

### Restore
To import data from the backup files:

```bash
node scripts/import-data.js

# For Windows users
scripts\import-data.bat
```

This will restore the database from the JSON files in the `backup` directory.

## Troubleshooting

### Connection Issues
- Check if PostgreSQL service is running
- Verify the connection details in your `.env` file
- Make sure your PostgreSQL user has the necessary permissions

### Schema Issues
- Run `npm run db:push` to synchronize the schema
- Check if your schema changes are compatible with existing data

### Data Issues
- Backup your data using `node scripts/export-data.js`
- Check the backup files for any data issues
- Fix the issues and restore the data using `node scripts/import-data.js`

## PostgreSQL Commands Reference

Here are some useful PostgreSQL commands for managing your database:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- List all databases
\l

-- Connect to a database
\c fabricshop

-- List all tables
\dt

-- Show table structure
\d products

-- Export database
pg_dump -U postgres fabricshop > backup.sql

-- Import database
psql -U postgres fabricshop < backup.sql
```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Documentation](https://drizzle.dev/docs/overview)
- [Node-Postgres Documentation](https://node-postgres.com/)