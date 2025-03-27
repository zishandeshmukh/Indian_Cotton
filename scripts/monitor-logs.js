import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Create logs directory if it doesn't exist
const logsDir = path.join(rootDir, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create log file
const logFile = path.join(logsDir, 'app.log');
if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, '');
}

console.log('📊 Monitoring application logs...');
console.log(`Log file: ${logFile}`);
console.log('Press Ctrl+C to stop\n');

// Start watching log file
let lastSize = fs.statSync(logFile).size;
fs.watchFile(logFile, { interval: 1000 }, (curr, prev) => {
  if (curr.size > lastSize) {
    const buffer = Buffer.alloc(curr.size - lastSize);
    const fileDescriptor = fs.openSync(logFile, 'r');
    fs.readSync(fileDescriptor, buffer, 0, curr.size - lastSize, lastSize);
    fs.closeSync(fileDescriptor);
    process.stdout.write(buffer.toString());
    lastSize = curr.size;
  }
});

// Modify process.console methods to also write to log file
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.log = function() {
  const args = Array.from(arguments);
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' ');
  
  fs.appendFileSync(logFile, `[LOG] ${new Date().toISOString()} - ${message}\n`);
  originalConsoleLog.apply(console, args);
};

console.error = function() {
  const args = Array.from(arguments);
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' ');
  
  fs.appendFileSync(logFile, `[ERROR] ${new Date().toISOString()} - ${message}\n`);
  originalConsoleError.apply(console, args);
};

console.warn = function() {
  const args = Array.from(arguments);
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' ');
  
  fs.appendFileSync(logFile, `[WARN] ${new Date().toISOString()} - ${message}\n`);
  originalConsoleWarn.apply(console, args);
};

console.info = function() {
  const args = Array.from(arguments);
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' ');
  
  fs.appendFileSync(logFile, `[INFO] ${new Date().toISOString()} - ${message}\n`);
  originalConsoleInfo.apply(console, args);
};

// Log startup message
console.log('Log monitoring started');

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.info = originalConsoleInfo;
  
  fs.unwatchFile(logFile);
  console.log('\nLog monitoring stopped');
  process.exit();
});