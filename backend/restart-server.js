const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SERVER_PORT = 5000;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const MAX_RESTART_ATTEMPTS = 5;
const RESTART_DELAY = 5000; // 5 seconds

let serverProcess = null;
let restartAttempts = 0;
let isShuttingDown = false;

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Also write to log file
  const logFile = path.join(__dirname, 'logs', 'server-monitor.log');
  fs.appendFileSync(logFile, logMessage + '\n');
}

// Health check function
async function checkServerHealth() {
  try {
    const response = await fetch(`http://localhost:${SERVER_PORT}/health`);
    if (response.ok) {
      const data = await response.json();
      return data.status === 'OK';
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Start server function
function startServer() {
  if (isShuttingDown) return;
  
  log('Starting RefuLearn backend server...');
  
  // Kill existing process if any
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
  
  // Start new server process
  serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });
  
  // Handle server output
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(`[SERVER] ${output}`);
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.error(`[SERVER ERROR] ${output}`);
    }
  });
  
  // Handle server exit
  serverProcess.on('exit', (code, signal) => {
    log(`Server process exited with code ${code} and signal ${signal}`);
    serverProcess = null;
    
    if (!isShuttingDown) {
      if (restartAttempts < MAX_RESTART_ATTEMPTS) {
        restartAttempts++;
        log(`Attempting restart ${restartAttempts}/${MAX_RESTART_ATTEMPTS} in ${RESTART_DELAY}ms...`);
        setTimeout(startServer, RESTART_DELAY);
      } else {
        log('Max restart attempts reached. Manual intervention required.');
        process.exit(1);
      }
    }
  });
  
  // Handle server error
  serverProcess.on('error', (error) => {
    log(`Server process error: ${error.message}`);
  });
  
  // Reset restart attempts on successful start
  setTimeout(() => {
    if (serverProcess && !serverProcess.killed) {
      restartAttempts = 0;
      log('Server started successfully. Reset restart attempts.');
    }
  }, 10000); // Wait 10 seconds before considering it a successful start
}

// Health monitoring function
async function monitorHealth() {
  if (isShuttingDown) return;
  
  const isHealthy = await checkServerHealth();
  
  if (!isHealthy && serverProcess) {
    log('Health check failed. Server appears to be unresponsive.');
    log('Restarting server...');
    
    // Kill the unresponsive server
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
      
      // Force kill if it doesn't respond in 5 seconds
      setTimeout(() => {
        if (serverProcess) {
          log('Force killing unresponsive server...');
          serverProcess.kill('SIGKILL');
        }
      }, 5000);
    }
  } else if (isHealthy) {
    // Reset restart attempts on successful health check
    restartAttempts = 0;
  }
  
  // Schedule next health check
  setTimeout(monitorHealth, HEALTH_CHECK_INTERVAL);
}

// Graceful shutdown function
function gracefulShutdown(signal) {
  log(`Received ${signal}. Initiating graceful shutdown...`);
  isShuttingDown = true;
  
  if (serverProcess) {
    log('Stopping server process...');
    serverProcess.kill('SIGTERM');
    
    // Force kill if it doesn't respond in 10 seconds
    setTimeout(() => {
      if (serverProcess) {
        log('Force killing server process...');
        serverProcess.kill('SIGKILL');
      }
      process.exit(0);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// Setup signal handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Start the monitoring system
log('RefuLearn Server Monitor starting...');
log(`Health check interval: ${HEALTH_CHECK_INTERVAL}ms`);
log(`Max restart attempts: ${MAX_RESTART_ATTEMPTS}`);

// Start server and monitoring
startServer();

// Wait a bit before starting health monitoring
setTimeout(() => {
  log('Starting health monitoring...');
  monitorHealth();
}, 15000); // Wait 15 seconds for server to fully start

// Keep the process alive
setInterval(() => {
  // This keeps the monitor process running
}, 60000); 