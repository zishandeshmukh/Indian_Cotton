# Visual Studio Code Setup Guide

This guide will help you set up Visual Studio Code for optimal development experience with this project.

## Recommended Extensions

The project includes a `.vscode/extensions.json` file that will prompt you to install recommended extensions when you open the project in VS Code. Here's what each extension does:

1. **ESLint** (`dbaeumer.vscode-eslint`) - Integrates ESLint into VS Code for JavaScript/TypeScript linting
2. **Prettier** (`esbenp.prettier-vscode`) - Code formatter that ensures consistent code style
3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - Provides autocomplete, syntax highlighting, and linting for Tailwind CSS
4. **Material Icon Theme** (`pkief.material-icon-theme`) - Provides attractive file icons for better visual distinction
5. **TypeScript Next** (`ms-vscode.vscode-typescript-next`) - Enhanced TypeScript language features
6. **PostgreSQL** (`ckolkman.vscode-postgres`) - PostgreSQL management tool for VS Code
7. **DotENV** (`mikestead.dotenv`) - Support for .env file highlighting
8. **Volar** (`johnsoncodehk.volar`) - Vue/JSX language support
9. **Code Spell Checker** (`streetsidesoftware.code-spell-checker`) - Spell checking for code and comments
10. **Auto Rename Tag** (`formulahendry.auto-rename-tag`) - Automatically rename paired HTML/React/XML tags
11. **Peacock** (`johnpapa.vscode-peacock`) - Changes VS Code workspace color for better distinction between projects
12. **Prisma** (`prisma.prisma`) - Prisma schema language support (useful for database schema visualization)

## VS Code Settings

The project includes a `.vscode/settings.json` file with optimized settings for this project:

- **Default Formatter**: Set to Prettier for consistent code formatting
- **Format on Save**: Enabled to ensure code is always properly formatted
- **ESLint Auto-Fix**: Enabled to automatically fix ESLint issues on save
- **TypeScript SDK**: Set to use the workspace version of TypeScript
- **Import Management**: Configured to auto-update imports when files are moved
- **Emmet and Tailwind Support**: Enhanced for React/TypeScript development
- **File Watching and Search Optimization**: Excludes node_modules and dist folders
- **Custom Color Theme**: Project-specific color theme (using Peacock) for better visual identification

## Launch Configurations

The project includes a `.vscode/launch.json` file with predefined configurations for:

- **Launch Server**: Run the Express server with debugging
- **Export Database**: Run the database export script with debugging
- **Import Database**: Run the database import script with debugging
- **Monitor Logs**: Run the log monitoring script with debugging
- **Setup Local**: Run the local setup script with debugging
- **Full Stack**: Combined configuration to run both client and server

## Debugging

To debug the application:

1. Click the "Run and Debug" icon in the VS Code sidebar (or press `Ctrl+Shift+D` / `Cmd+Shift+D`)
2. Select the appropriate launch configuration from the dropdown
3. Click the green play button or press `F5` to start debugging

## Project-Specific Tasks

The project includes a `.vscode/tasks.json` file with predefined tasks for:

- **dev:client**: Start the Vite development server
- **db:push**: Push database schema changes
- **Create Database**: Run the database creation SQL script

To run a task:
1. Press `Ctrl+Shift+P` / `Cmd+Shift+P` to open the command palette
2. Type "Run Task" and select "Tasks: Run Task"
3. Select the task you want to run

## Keyboard Shortcuts

Here are some useful keyboard shortcuts for this project:

- `F5` - Start debugging
- `Ctrl+Shift+B` / `Cmd+Shift+B` - Run build task
- `Ctrl+Shift+P` / `Cmd+Shift+P` - Open command palette
- `Ctrl+Space` / `Cmd+Space` - Trigger IntelliSense
- `Alt+Shift+F` / `Option+Shift+F` - Format document
- `F8` / `F8` - Navigate to next error or warning
- `Shift+F8` / `Shift+F8` - Navigate to previous error or warning

## TypeScript Configuration

The project is configured to use the TypeScript version installed in the workspace, which ensures all developers use the same version. The `tsconfig.json` file in the project root defines the TypeScript configuration.

## Database Connection

To connect to the PostgreSQL database using the VS Code PostgreSQL extension:

1. Open the PostgreSQL explorer in the sidebar
2. Click "Add Connection"
3. Enter your connection details from the `.env` file
   - Host: `PGHOST` value (e.g., localhost)
   - Port: `PGPORT` value (e.g., 5432)
   - User: `PGUSER` value
   - Password: `PGPASSWORD` value
   - Database: `PGDATABASE` value (e.g., fabricshop)
4. Click "Connect"

## Tailwind CSS Integration

The Tailwind CSS IntelliSense extension provides:

1. Class name autocomplete
2. Syntax highlighting for Tailwind CSS classes
3. Linting for invalid class names
4. Hover previews of class definitions

## Prettier and ESLint Integration

The project is configured to use Prettier for code formatting and ESLint for linting. The VS Code settings ensure that:

1. Prettier is used as the default formatter for JavaScript, TypeScript, and other supported file types
2. Code is automatically formatted when you save a file
3. ESLint automatically fixes issues when possible on save

## Custom Workspace Colors

The Peacock extension sets custom colors for this workspace, making it visually distinct from other projects you might have open. The colors are configured in the `.vscode/settings.json` file.

## Additional Resources

For more information on using VS Code for JavaScript/TypeScript development:

- [VS Code Documentation](https://code.visualstudio.com/docs)
- [TypeScript in VS Code](https://code.visualstudio.com/docs/languages/typescript)
- [Debugging in VS Code](https://code.visualstudio.com/docs/editor/debugging)
- [Tasks in VS Code](https://code.visualstudio.com/docs/editor/tasks)
- [User and Workspace Settings](https://code.visualstudio.com/docs/getstarted/settings)