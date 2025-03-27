# PostgreSQL Database Setup Guide

This guide will help you set up and configure PostgreSQL for the Fabric E-commerce application.

## Prerequisites

- PostgreSQL installed on your system (version 12 or higher recommended)
- Basic knowledge of SQL and PostgreSQL commands
- Access to the terminal/command prompt

## Installation

### Windows

1. Download and install PostgreSQL from the [official website](https://www.postgresql.org/download/windows/)
2. During installation, set a password for the 'postgres' user
3. You can use the pgAdmin tool that comes with the installation for GUI-based management

### macOS

Using Homebrew:
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Database Setup

### Option 1: Using the SQL Script (Recommended)

The project includes a SQL script to create the database with all required tables and initial data:

1. Open a terminal/command prompt
2. Navigate to the project directory
3. Run the following command:
   ```bash
   psql -U postgres -f scripts/create-database.sql
   ```
   If you're prompted for a password, enter the password for the 'postgres' user you set during installation.

### Option 2: Manual Setup

If you prefer to set up the database manually:

1. Log in to PostgreSQL:
   ```bash
   psql -U postgres
   ```

2. Create the database:
   ```sql
   CREATE DATABASE fabricshop;
   ```

3. Connect to the new database:
   ```sql
   \c fabricshop
   ```

4. After setting up the database connection in your `.env` file, run the schema push command:
   ```bash
   npm run db:push
   ```

## Environment Configuration

Update the `.env` file in the project root with your PostgreSQL connection details:

```
DATABASE_URL=postgres://yourusername:yourpassword@localhost:5432/fabricshop
PGUSER=yourusername
PGHOST=localhost
PGPASSWORD=yourpassword
PGDATABASE=fabricshop
PGPORT=5432

PORT=5000
```

- Replace `yourusername` with your PostgreSQL username (typically 'postgres' for the default admin user)
- Replace `yourpassword` with your PostgreSQL password
- Keep `localhost` if PostgreSQL is running on the same machine
- Keep `5432` as the port unless you've configured PostgreSQL to use a different port

## Database Schema

The application uses the following tables:

1. **products** - Stores product information
   - id (primary key)
   - name
   - description
   - price
   - image_url
   - media_files (JSON array for multiple images/videos)
   - category (enum: 'frock', 'lehenga', 'kurta', 'net', 'cutpiece')
   - stock
   - is_featured
   - is_active
   - sku

2. **categories** - Stores category information
   - id (primary key)
   - name (unique)
   - description
   - product_count

3. **cart_items** - Stores shopping cart items
   - id (primary key)
   - cart_id (user's session ID)
   - product_id (foreign key to products)
   - quantity

4. **admins** - Stores admin user information
   - id (primary key)
   - username (unique)
   - password
   - email
   - role

## Database Management

### Accessing the Database

To directly access the database from the command line:

```bash
psql -U postgres -d fabricshop
```

Some useful PostgreSQL commands:
- `\dt` - List all tables
- `\d tablename` - Show table structure
- `\q` - Quit PostgreSQL CLI

### Data Backup and Restore

The project includes scripts for data export and import:

1. To export data to JSON files:
   ```bash
   node scripts/export-data.js
   ```
   This creates JSON files in the 'backup' directory.

2. To import data from JSON files:
   ```bash
   node scripts/import-data.js
   ```
   This restores the database from the JSON files in the 'backup' directory.

### Using pgAdmin

pgAdmin is a graphical management tool for PostgreSQL, which makes it easier to:
- View and edit table data
- Execute SQL queries
- Manage users and permissions
- Create database backups

If installed with PostgreSQL on Windows, you can access it from the Start menu. Otherwise, download it from [pgAdmin's website](https://www.pgadmin.org/).

## Schema Migrations

This project uses Drizzle ORM for database schema management. To update the database schema:

1. Make changes to the schema definitions in `shared/schema.ts`
2. Run the schema push command:
   ```bash
   npm run db:push
   ```

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Verify PostgreSQL is running:
   - Windows: Check Services app
   - macOS: `brew services list`
   - Linux: `sudo systemctl status postgresql`

2. Check your connection details in the `.env` file

3. Ensure PostgreSQL is accepting connections:
   - Check the `pg_hba.conf` file in your PostgreSQL installation directory
   - Default settings should allow local connections

### Permission Issues

If you encounter permission issues:

1. Ensure your user has the necessary permissions:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE fabricshop TO yourusername;
   ```

2. For table-level permissions:
   ```sql
   \c fabricshop
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO yourusername;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO yourusername;
   ```

## Local Development with VS Code

For an enhanced development experience, this project includes VS Code configurations for database management:

1. Install the recommended PostgreSQL extension for VS Code
2. Use the provided launch configuration for database operations
3. Use the task `Create Database` to initialize the database

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)