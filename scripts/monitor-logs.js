#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import readline from 'readline';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// ANSI color codes for formatting console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Create readline interface for handling user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to format logs
function formatLog(source, log) {
  const timestamp = new Date().toISOString();
  const coloredSource = (() => {
    switch(source) {
      case 'server': return `${colors.bgBlue}${colors.white} SERVER ${colors.reset}`;
      case 'client': return `${colors.bgGreen}${colors.black} CLIENT ${colors.reset}`;
      case 'database': return `${colors.bgYellow}${colors.black} DATABASE ${colors.reset}`;
      case 'error': return `${colors.bgRed}${colors.white} ERROR ${colors.reset}`;
      default: return `${colors.bgWhite}${colors.black} ${source.toUpperCase()} ${colors.reset}`;
    }
  })();
  
  // Format the log message
  let formattedLog = log;
  
  // Highlight errors and warnings
  if (log.includes('error') || log.includes('Error') || log.includes('ERROR')) {
    formattedLog = `${colors.red}${log}${colors.reset}`;
  } else if (log.includes('warn') || log.includes('Warning') || log.includes('WARN')) {
    formattedLog = `${colors.yellow}${log}${colors.reset}`;
  } else if (log.includes('info') || log.includes('Info') || log.includes('INFO')) {
    formattedLog = `${colors.cyan}${log}${colors.reset}`;
  }
  
  return `${colors.dim}[${timestamp}]${colors.reset} ${coloredSource} ${formattedLog}`;
}

// Function to tail logs from npm run dev
function monitorDevServer() {
  console.log(`${colors.cyan}${colors.bright}=== Fabric E-commerce Application Log Monitor ===${colors.reset}`);
  console.log(`${colors.dim}Press Ctrl+C to exit${colors.reset}`);
  console.log(`${colors.yellow}Starting log monitoring...${colors.reset}\n`);
  
  // Start the development server and capture its output
  const devProcess = spawn('npm', ['run', 'dev'], { 
    cwd: rootDir,
    shell: true 
  });
  
  // Handle stdout (standard output)
  devProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      // Try to determine the source of the log based on content
      let source = 'app';
      
      if (line.includes('express') || line.includes('server') || line.includes('routes') || line.includes('http')) {
        source = 'server';
      } else if (line.includes('vite') || line.includes('react') || line.includes('client') || line.includes('component')) {
        source = 'client';
      } else if (line.includes('postgres') || line.includes('database') || line.includes('query') || line.includes('sql')) {
        source = 'database';
      }
      
      console.log(formatLog(source, line));
    });
  });
  
  // Handle stderr (standard error)
  devProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.log(formatLog('error', line));
    });
  });
  
  // Handle process exit
  devProcess.on('close', (code) => {
    console.log(`${colors.red}Dev server process exited with code ${code}${colors.reset}`);
    rl.close();
  });
  
  // Handle user input for interacting with the log monitor
  rl.on('line', (input) => {
    const cmd = input.trim().toLowerCase();
    
    switch(cmd) {
      case 'help':
        console.log(`${colors.cyan}Available commands:${colors.reset}`);
        console.log('  help     - Show this help message');
        console.log('  clear    - Clear the console');
        console.log('  exit     - Exit the log monitor');
        break;
      case 'clear':
        console.clear();
        console.log(`${colors.cyan}${colors.bright}=== Fabric E-commerce Application Log Monitor ===${colors.reset}`);
        console.log(`${colors.dim}Log output cleared. Press Ctrl+C to exit${colors.reset}`);
        break;
      case 'exit':
        console.log(`${colors.yellow}Exiting log monitor...${colors.reset}`);
        devProcess.kill();
        rl.close();
        break;
      default:
        if (cmd) {
          console.log(`${colors.yellow}Unknown command: ${cmd}. Type 'help' for available commands.${colors.reset}`);
        }
    }
  });
  
  // Handle CTRL+C to gracefully exit
  rl.on('SIGINT', () => {
    console.log(`\n${colors.yellow}Received SIGINT. Shutting down...${colors.reset}`);
    devProcess.kill();
    rl.close();
  });
}

// Start monitoring
monitorDevServer();