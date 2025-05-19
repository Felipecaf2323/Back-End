const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '..', 'logs');
const logFile = path.join(logPath, 'error.log');

// Garante que a pasta exista
if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath);
}

module.exports = {
  error: (err) => {
    const message = `[${new Date().toISOString()}] ${err.stack || err.message || err}\n`;
    fs.appendFileSync(logFile, message);
  }
};
