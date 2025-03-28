# Indian Cotton - Fabric E-commerce Website

A full-stack fabric e-commerce platform specializing in Indian textile sales, offering an immersive and interactive shopping experience for textile enthusiasts.

## Features
- Product catalog with detailed fabric information
- Admin panel for managing products, categories, and orders
- User authentication with signup/login
- Shopping cart and checkout functionality
- Responsive design for mobile and desktop
- Payment processing with Stripe integration
- Multi-photo and video support for product displays
- Category-based filtering for easy navigation
- Search functionality for products

## Setup
1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with the required environment variables (see `.env.example`)
4. Set up the PostgreSQL database:
   - Make sure PostgreSQL is installed and running
   - Update database connection details in the `.env` file
   - Run schema migrations with `npm run db:push`
5. Start the development server with `npm run dev`

## API Keys and Configuration
This project requires the following environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `PGUSER`, `PGHOST`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`: PostgreSQL connection details
- `STRIPE_SECRET_KEY`: Your Stripe secret key for payment processing (server-side)
- `VITE_STRIPE_PUBLIC_KEY`: Your Stripe publishable key (client-side)
- `SESSION_SECRET`: Secret for session management

## Admin Access
The admin panel is accessible at `/admin` with the following default credentials:
- Username: admin
- Password: admin123

## Database Management
- Export database: `node scripts/export-db-data.js`
- Import database: `node scripts/import-db-data.js`

## Technologies
- Frontend: React, Vite, TypeScript, TailwindCSS, Shadcn UI
- Backend: Express, Node.js
- Database: PostgreSQL
- ORM: Drizzle
- Authentication: Passport.js
- Payment Processing: Stripe
- File Upload: Multer

## Contact
Indian Cotton
Rangar Galli, City Chowk, Aurangabad, 431001
Email: info@indiancotton.com