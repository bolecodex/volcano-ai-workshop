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

// 视频生成相关 IPC handlers
ipcMain.handle('create-video-task', async (event, requestData) => {
  console.log('🎬 IPC: Creating video generation task');
  try {
    const result = await apiService.createVideoTask(requestData);
    console.log('✅ IPC: Video task created');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in create-video-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

ipcMain.handle('get-video-task', async (event, { taskId, apiKey }) => {
  console.log('📹 IPC: Getting video task:', taskId);
  try {
    const result = await apiService.getVideoTask(taskId, apiKey);
    console.log('✅ IPC: Video task retrieved');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in get-video-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

ipcMain.handle('get-video-tasks', async (event, { queryParams, apiKey }) => {
  console.log('📋 IPC: Getting video tasks');
  try {
    const result = await apiService.getVideoTasks(queryParams, apiKey);
    console.log('✅ IPC: Video tasks retrieved');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in get-video-tasks:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

ipcMain.handle('delete-video-task', async (event, { taskId, apiKey }) => {
  console.log('🗑️ IPC: Deleting video task:', taskId);
  try {
    const result = await apiService.deleteVideoTask(taskId, apiKey);
    console.log('✅ IPC: Video task deleted');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in delete-video-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

// TOS 上传 IPC handler
ipcMain.handle('upload-to-tos', async (event, fileData, config) => {
  console.log('📤 IPC: Uploading file to TOS');
  try {
    const result = await apiService.uploadToTOS(fileData, config);
    console.log('✅ IPC: File uploaded to TOS');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in upload-to-tos:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

// 动作模仿 IPC handlers
ipcMain.handle('submit-motion-imitation-task', async (event, requestData) => {
  console.log('🎭 IPC: Submitting motion imitation task');
  try {
    const result = await apiService.submitMotionImitationTask(requestData);
    console.log('✅ IPC: Motion imitation task submitted');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in submit-motion-imitation-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

ipcMain.handle('query-motion-imitation-task', async (event, requestData) => {
  console.log('🔍 IPC: Querying motion imitation task:', requestData.task_id);
  try {
    const result = await apiService.queryMotionImitationTask(requestData);
    console.log('✅ IPC: Motion imitation task query completed');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in query-motion-imitation-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

// 即梦AI 4.0 IPC handlers
ipcMain.handle('submit-jimeng40-task', async (event, requestData) => {
  console.log('🎨 IPC: Submitting Jimeng 4.0 task');
  try {
    const result = await apiService.submitJimeng40Task(requestData);
    console.log('✅ IPC: Jimeng 4.0 task submitted');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in submit-jimeng40-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

ipcMain.handle('query-jimeng40-task', async (event, requestData) => {
  console.log('🔍 IPC: Querying Jimeng 4.0 task:', requestData.task_id);
  try {
    const result = await apiService.queryJimeng40Task(requestData);
    console.log('✅ IPC: Jimeng 4.0 task query completed');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in query-jimeng40-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

// 即梦文生图 3.1 IPC handlers
ipcMain.handle('submit-jimeng31-task', async (event, requestData) => {
  console.log('🎨 IPC: Submitting Jimeng 3.1 task');
  try {
    const result = await apiService.submitJimeng31Task(requestData);
    console.log('✅ IPC: Jimeng 3.1 task submitted');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in submit-jimeng31-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

ipcMain.handle('query-jimeng31-task', async (event, requestData) => {
  console.log('🔍 IPC: Querying Jimeng 3.1 task:', requestData.task_id);
  try {
    const result = await apiService.queryJimeng31Task(requestData);
    console.log('✅ IPC: Jimeng 3.1 task query completed');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in query-jimeng31-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

// 即梦AI 3.0 Pro 视频生成 IPC handlers
ipcMain.handle('submit-jimeng30pro-video-task', async (event, requestData) => {
  console.log('🎬 IPC: Submitting Jimeng 3.0 Pro video task');
  try {
    const result = await apiService.submitJimeng30ProVideoTask(requestData);
    console.log('✅ IPC: Jimeng 3.0 Pro video task submitted');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in submit-jimeng30pro-video-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

ipcMain.handle('query-jimeng30pro-video-task', async (event, requestData) => {
  console.log('🔍 IPC: Querying Jimeng 3.0 Pro video task:', requestData.task_id);
  try {
    const result = await apiService.queryJimeng30ProVideoTask(requestData);
    console.log('✅ IPC: Jimeng 3.0 Pro video task query completed');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in query-jimeng30pro-video-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

// 即梦图生图3.0智能参考 IPC handlers
ipcMain.handle('submit-jimeng-i2i30-task', async (event, requestData) => {
  console.log('🎨 IPC: Submitting Jimeng I2I 3.0 task');
  try {
    const result = await apiService.submitJimengI2I30Task(requestData);
    console.log('✅ IPC: Jimeng I2I 3.0 task submitted');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in submit-jimeng-i2i30-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

ipcMain.handle('query-jimeng-i2i30-task', async (event, requestData) => {
  console.log('🔍 IPC: Querying Jimeng I2I 3.0 task:', requestData.task_id);
  try {
    const result = await apiService.queryJimengI2I30Task(requestData);
    console.log('✅ IPC: Jimeng I2I 3.0 task query completed');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in query-jimeng-i2i30-task:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

// 图像向量化 IPC handler
ipcMain.handle('image-embedding', async (event, requestData) => {
  console.log('🔍 IPC: Creating image embedding...');
  try {
    const result = await apiService.imageEmbedding(requestData);
    console.log('✅ IPC: Image embedding completed');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in image-embedding:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

// 向量数据库 - 多模态检索 IPC handler
ipcMain.handle('search-by-multimodal', async (event, requestData) => {
  console.log('🔍 IPC: Multi-modal search...');
  try {
    const result = await apiService.searchByMultiModal(requestData);
    console.log('✅ IPC: Multi-modal search completed');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in search-by-multimodal:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

// TOS - 生成预签名 URL IPC handler
ipcMain.handle('get-tos-presigned-url', async (event, requestData) => {
  console.log('🔗 IPC: Generating TOS pre-signed URL...');
  try {
    const result = await apiService.getTosPreSignedUrl(requestData);
    console.log('✅ IPC: TOS pre-signed URL generated');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in get-tos-presigned-url:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

// 向量数据库 - 数据写入 IPC handler
ipcMain.handle('upsert-vector-data', async (event, requestData) => {
  console.log('📝 IPC: Upsert vector data...');
  try {
    const result = await apiService.upsertVectorData(requestData);
    console.log('✅ IPC: Vector data upserted');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in upsert-vector-data:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
});

// 向量数据库 - 向量化计算 IPC handler
ipcMain.handle('compute-embedding', async (event, requestData) => {
  console.log('🧮 IPC: Compute embedding...');
  try {
    const result = await apiService.computeEmbedding(requestData);
    console.log('✅ IPC: Embedding computed');
    return result;
  } catch (error) {
    console.error('❌ IPC Error in compute-embedding:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: 'IPC_ERROR'
      }
    };
  }
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