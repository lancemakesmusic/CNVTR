const fs = require('fs');
const path = require('path');

let logFile = null;

function configure({ userDataPath }) {
  if (!userDataPath) return;
  logFile = path.join(userDataPath, 'logs', 'cnvtr.log');
  try {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
  } catch (_) {
    logFile = null;
  }
}

function writeLine(level, msg, data) {
  const payload = { t: new Date().toISOString(), level, msg };
  if (data && typeof data === 'object') Object.assign(payload, data);
  const line = `${JSON.stringify(payload)}\n`;
  if (level === 'error') console.error(msg, data || '');
  else if (level === 'warn') console.warn(msg, data || '');
  else console.log(msg, data || '');
  if (logFile) {
    try {
      fs.appendFileSync(logFile, line);
    } catch (_) {
      /* disk full / permissions */
    }
  }
}

module.exports = {
  configure,
  info: (msg, data) => writeLine('info', msg, data),
  warn: (msg, data) => writeLine('warn', msg, data),
  error: (msg, data) => writeLine('error', msg, data),
};
