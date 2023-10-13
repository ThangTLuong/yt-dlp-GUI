const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process')
const path = require('path');
const fs = require('fs');

const isMac = process.platform === 'darwin';
const width = 400;
const height = 300;

let pythonProcess;

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title:  'Schedule Savior',
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.setMinimumSize(width, height);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

function getFormattedTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function log(message, type = 'info') {
  const logMessage = `[${getFormattedTimestamp()}] [${type.toUpperCase()}]: ${message}\n`;
  fs.appendFile('app.log', logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

app.whenReady().then(() => {
  createMainWindow();
  log('Starting the GUI.');

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });

  ipcMain.on('data-to-backend', (event, data) => {
    const pythonScriptPath = path.join(__dirname, '..', '..', 'normal_app.py');
    const pythonProcess = spawn('python', [pythonScriptPath]);
    log(`Path to python file: ${pythonScriptPath}`);

    pythonProcess.stdin.write(JSON.stringify(data));
    pythonProcess.stdin.end();
    log('Executing yt-dlp from python.')
  
    pythonProcess.stdout.on('data', (output) => {
      log(`Python Script Output: ${output.toString()}`);
  
      if (output.toString().includes('Task completed')) {
        event.sender.send('backend-to-frontend', 'Task completed');
      }
    });
  
    pythonProcess.on('error', (error) => {
      log(`Error running Python script: ${error}`, 'error');
      event.sender.send('backend-to-frontend', `Error: ${error.message}`);
    });
  });

});

app.on('window-all-closed', function () {
  if (!isMac) app.quit();
});