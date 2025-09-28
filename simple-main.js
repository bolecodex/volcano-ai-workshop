const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'public/preload.js')
    },
    show: false
  });

  // Load the built React app
  mainWindow.loadFile('build/index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Window shown');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Simple IPC handler for testing
ipcMain.handle('test-ipc', async () => {
  return { message: 'IPC is working!' };
});

app.whenReady().then(() => {
  console.log('App ready, creating window');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

console.log('Simple Electron main process loaded');
