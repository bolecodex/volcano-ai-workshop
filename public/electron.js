const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const apiService = require('../api-service');

// Keep a global reference of the window object
let mainWindow;

// Check if running in development mode
const isDev = process.env.NODE_ENV === 'development' || 
              process.defaultApp || 
              /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || 
              /[\\/]electron[\\/]/.test(process.execPath);

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    titleBarStyle: 'default',
    icon: path.join(__dirname, 'logo.svg')
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  console.log('Loading app from:', startUrl);
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Electron window is ready and visible');
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            console.log('New file clicked');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for API calls
ipcMain.handle('generate-images', async (event, requestData) => {
  console.log('IPC: Received generate-images request');
  try {
    const result = await apiService.generateImages(requestData);
    return result;
  } catch (error) {
    console.error('IPC Error in generate-images:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

ipcMain.handle('test-connection', async (event, apiKey) => {
  console.log('IPC: Received test-connection request');
  try {
    const result = await apiService.testConnection(apiKey);
    return result;
  } catch (error) {
    console.error('IPC Error in test-connection:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

ipcMain.handle('get-app-info', async (event) => {
  return {
    platform: process.platform,
    version: app.getVersion(),
    isElectron: true,
    isDev: isDev
  };
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('Electron app is ready');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    navigationEvent.preventDefault();
  });
});

console.log('Electron main process loaded with IPC support');