# Fabric E-commerce Platform

A full-stack fabric e-commerce platform specializing in Indian textile sales, offering a comprehensive product catalog and user-friendly shopping experience.

## Features

- **Admin Panel**: Manage products, categories, and view orders
- **User Panel**: Browse products, search, filter by categories, shopping cart functionality
- **Product Management**: Support for multiple photos and videos for each product
- **Payment Processing**: UPI QR code payment integration
- **Database**: PostgreSQL database for product information and user data

## Tech Stack

- **Frontend**: React, TailwindCSS, ShadcnUI, React Query
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **Authentication**: Passport.js
- **Form Validation**: React Hook Form, Zod

## Quick Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- Git

### Option 1: Automated Setup (Recommended)

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd fabric-ecommerce
   ```

2. Run the setup script:
   - For Unix/Mac:
     ```bash
     node scripts/setup-local.js
     ```
   - For Windows:
     ```bash
     scripts\setup-local.bat
     ```

3. Follow the instructions provided by the setup script to complete the installation.

### Option 2: Manual Setup

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd fabric-ecommerce
   ```

2. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your PostgreSQL database credentials:
   ```
   DATABASE_URL=postgres://yourusername:yourpassword@localhost:5432/fabricshop
   PGUSER=yourusername
   PGHOST=localhost
   PGPASSWORD=yourpassword
   PGDATABASE=fabricshop
   PGPORT=5432

   PORT=5000
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Initialize the PostgreSQL database (this will create the database if it doesn't exist):
   - For Windows:
     ```bash
     scripts\init-database.bat
     ```
   - For Unix/Mac:
     ```bash
     node scripts/init-database.js
     ```

6. Push the Drizzle schema to the database:
   - For Windows:
     ```bash
     scripts\db-push.bat
     ```
   - For Unix/Mac:
     ```bash
     node scripts/db-push.js
     ```
   
   > **Note:** If you encounter issues with `npm run db:push`, use these scripts instead as they properly load environment variables.

7. (Optional) Import sample data:
   ```bash
   node scripts/import-data.js
   ```

8. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Application Structure

- `/client` - Frontend React application
  - `/src/components` - React components
  - `/src/pages` - Page components
  - `/src/context` - Context providers
  - `/src/hooks` - Custom hooks
  - `/src/lib` - Utility functions

- `/server` - Backend Express server
  - `/routes.ts` - API routes
  - `/storage.ts` - Data storage interface
  - `/db.ts` - Database connection and schema initialization

- `/shared` - Shared code between frontend and backend
  - `/schema.ts` - Data schema definitions

## Default Admin Access

- Username: `admin`
- Password: `admin123`
- Email: `deshmukhzishan06@gmail.com`

## Product Categories

- Frock
- Lehenga
- Kurta
- Net
- Cutpiece

## Database Schema

The application uses the following database tables:

- `products` - Stores product information
- `categories` - Stores category information
- `cart_items` - Stores shopping cart items
- `admins` - Stores admin user information

## Development Commands

### Built-in Commands
- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run db:push` - Push schema changes to the database

### Additional Useful Commands
You can run these commands directly from the command line:

```bash
# Initialize the database (create database, tables, and default data)
node scripts/init-database.js

# Push Drizzle schema to the database
node scripts/db-push.js

# Export database content to JSON files in the backup directory
node scripts/export-data.js

# Import database content from JSON files in the backup directory
node scripts/import-data.js

# Run the application with colorized and formatted log output
node scripts/monitor-logs.js

# Interactive setup for local development environment
node scripts/setup-local.js
```

For Windows users, batch files are available:
```bash
# Initialize the database
scripts\init-database.bat

# Push Drizzle schema to the database
scripts\db-push.bat

# Export database data to backup files
scripts\export-data.bat

# Import database data from backup files
scripts\import-data.bat

# Monitor application logs
scripts\monitor-logs.bat

# Interactive setup for local development environment
scripts\setup-local.bat
```

## Database Export and Import

To export your database data (useful for migrations or backups):

```bash
node scripts/export-data.js
```

This will create a `backup` directory with JSON files for all database tables.

To import data from a backup:

```bash
node scripts/import-data.js
```

This will restore the database from the JSON files in the `backup` directory.

## Detailed Documentation

For more detailed information, please refer to the documentation in the `docs` directory:

- [VS Code Setup Guide](docs/vscode-setup.md) - How to set up Visual Studio Code for optimal development
- [Database Setup Guide](docs/database-setup.md) - Comprehensive guide for PostgreSQL setup and management