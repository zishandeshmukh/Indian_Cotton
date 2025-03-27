# VS Code Setup Guide

This document provides recommendations for setting up Visual Studio Code for optimal development experience with the Fabric Shop application.

## Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/) installed on your system
- [Node.js and npm](https://nodejs.org/) installed on your system

## Recommended Extensions

These extensions will help improve your development workflow:

### JavaScript and TypeScript
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Integrates ESLint into VS Code
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Code formatter using prettier
- [JavaScript and TypeScript Nightly](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next) - Latest TypeScript features

### React
- [ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets) - React code snippets
- [Simple React Snippets](https://marketplace.visualstudio.com/items?itemName=burkeholland.simple-react-snippets) - Dead simple React snippets
- [vscode-styled-components](https://marketplace.visualstudio.com/items?itemName=styled-components.vscode-styled-components) - Syntax highlighting for styled-components

### CSS and Tailwind
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - IntelliSense for Tailwind CSS
- [PostCSS Language Support](https://marketplace.visualstudio.com/items?itemName=csstools.postcss) - PostCSS language support

### Database
- [PostgreSQL](https://marketplace.visualstudio.com/items?itemName=ckolkman.vscode-postgres) - PostgreSQL extension for VS Code
- [SQLTools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools) - Database management for VS Code
- [SQLTools PostgreSQL/Redshift Driver](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools-driver-pg) - SQLTools PostgreSQL driver

### Other Utilities
- [DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv) - .env syntax highlighting
- [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense) - Autocomplete filenames
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) - Git supercharged
- [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme) - Material Design Icons for VS Code

## Workspace Settings

Create a `.vscode` directory in your project root and add the following files:

### settings.json
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "files.associations": {
    "*.css": "postcss"
  },
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "typescript": "typescript",
    "javascriptreact": "javascriptreact",
    "typescriptreact": "typescriptreact"
  },
  "tailwindCSS.emmetCompletions": true,
  "editor.quickSuggestions": {
    "strings": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[sql]": {
    "editor.defaultFormatter": "mtxr.sqltools"
  }
}
```

### extensions.json
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "dsznajder.es7-react-js-snippets",
    "burkeholland.simple-react-snippets",
    "styled-components.vscode-styled-components",
    "bradlc.vscode-tailwindcss",
    "csstools.postcss",
    "ckolkman.vscode-postgres",
    "mtxr.sqltools",
    "mtxr.sqltools-driver-pg",
    "mikestead.dotenv",
    "christian-kohler.path-intellisense",
    "eamodio.gitlens",
    "PKief.material-icon-theme"
  ]
}
```

### launch.json
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    },
    {
      "name": "Debug Client",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5000",
      "webRoot": "${workspaceFolder}/client/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*",
        "webpack:///client/src/*": "${webRoot}/*"
      }
    }
  ],
  "compounds": [
    {
      "name": "Full Stack Debug",
      "configurations": ["Debug Server", "Debug Client"]
    }
  ]
}
```

## Keyboard Shortcuts

Here are some useful keyboard shortcuts for VS Code:

### General
- `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) - Command Palette
- `Ctrl+P` (Windows/Linux) or `Cmd+P` (macOS) - Quick Open
- `Ctrl+,` (Windows/Linux) or `Cmd+,` (macOS) - User Settings
- `Ctrl+Shift+E` (Windows/Linux) or `Cmd+Shift+E` (macOS) - Explorer
- `Ctrl+Shift+G` (Windows/Linux) or `Cmd+Shift+G` (macOS) - Source Control

### Editing
- `Ctrl+Space` (Windows/Linux) or `Cmd+Space` (macOS) - Trigger suggestion
- `Alt+Up/Down` (Windows/Linux) or `Option+Up/Down` (macOS) - Move line up/down
- `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Shift+K` (macOS) - Delete line
- `Ctrl+D` (Windows/Linux) or `Cmd+D` (macOS) - Add selection to next find match
- `Ctrl+/` (Windows/Linux) or `Cmd+/` (macOS) - Toggle line comment

### Navigation
- `Ctrl+G` (Windows/Linux) or `Cmd+G` (macOS) - Go to line
- `F12` - Go to definition
- `Alt+F12` (Windows/Linux) or `Option+F12` (macOS) - Peek definition
- `Ctrl+Tab` (Windows/Linux) or `Cmd+Tab` (macOS) - Navigate editor tabs

### Terminal
- ``Ctrl+` `` (Windows/Linux) or ``Cmd+` `` (macOS) - Toggle terminal
- `Ctrl+Shift+5` (Windows/Linux) or `Cmd+Shift+5` (macOS) - Split terminal

## Debugging Tips

### React Developer Tools
Install the [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) browser extension for better React debugging experience.

### Using the Debugger
1. Set breakpoints by clicking on the gutter next to the line numbers
2. Start debugging by pressing F5 or clicking the Run and Debug button
3. Use the debug toolbar to step through the code
4. Inspect variables in the Variables panel
5. Use the Debug Console to evaluate expressions

## Additional Resources

- [VS Code Documentation](https://code.visualstudio.com/docs)
- [VS Code Keyboard Shortcuts](https://code.visualstudio.com/docs/getstarted/keybindings)
- [React DevTools Documentation](https://reactjs.org/blog/2019/08/15/new-react-devtools.html)
- [Debugging in VS Code](https://code.visualstudio.com/docs/editor/debugging)