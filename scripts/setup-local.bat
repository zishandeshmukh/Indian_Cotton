@echo off
echo 📦 Setting up local development environment for Fabric E-commerce...
echo.

REM Check for .env file
echo 🔍 Checking for .env file...
if exist ".env" (
  echo ✅ .env file exists
) else (
  if exist ".env.example" (
    echo ⚠️ .env file not found, creating from .env.example
    copy ".env.example" ".env"
    echo ✅ Created .env file. Please update with your database credentials.
  ) else (
    echo ❌ Neither .env nor .env.example found. Please create an .env file with your database credentials.
  )
)

REM Check for backup directory
echo.
echo 🔍 Checking for backup directory...
if exist "backup" (
  echo ✅ Backup directory exists
) else (
  echo ⚠️ Backup directory not found, creating...
  mkdir backup
  echo ✅ Created backup directory
)

REM List next steps
echo.
echo 🚀 Setup completed! Next steps:
echo 1. Edit the .env file with your PostgreSQL database credentials
echo 2. Run the following commands:
echo    npm install        - Install dependencies
echo    npm run db:push    - Initialize database schema
echo    node scripts/import-data.js    - Import sample data (optional)
echo    npm run dev        - Start the development server
echo.
echo 📝 The application will be available at http://localhost:5000
echo 👤 Default admin credentials: admin / admin123
echo.

pause