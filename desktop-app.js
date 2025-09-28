#!/usr/bin/env node

const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const apiService = require('./api-service');

let mainWindow;

// Check if running in development mode
const isDev = process.env.NODE_ENV === 'development' || 
              process.defaultApp || 
              /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || 
              /[\\/]electron[\\/]/.test(process.execPath);

function createWindow() {
  console.log('🚀 Creating Electron desktop window...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'public/preload.js')
    },
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    icon: path.join(__dirname, 'public/logo.svg'),
    title: 'AI 图片生成器'
  });

  // Load the built React app
  const indexPath = path.join(__dirname, 'build/index.html');
  console.log('📂 Loading app from:', indexPath);
  
  mainWindow.loadFile(indexPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ Desktop application is ready!');
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle navigation - prevent external navigation
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // 可以在这里添加新建功能
            console.log('新建功能');
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectall', label: '全选' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '重置缩放' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'close', label: '关闭' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: 'AI 图片生成器',
              detail: '基于 Electron + React + Bootstrap 构建\n版本: 1.0.0'
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: '关于 ' + app.getName() },
        { type: 'separator' },
        { role: 'services', label: '服务' },
        { type: 'separator' },
        { role: 'hide', label: '隐藏 ' + app.getName() },
        { role: 'hideOthers', label: '隐藏其他' },
        { role: 'unhide', label: '显示全部' },
        { type: 'separator' },
        { role: 'quit', label: '退出 ' + app.getName() }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 设置 IPC 处理器
function setupIpcHandlers() {
  console.log('🔧 Setting up IPC handlers...');
  
  // IPC handlers for API calls
  ipcMain.handle('generate-images', async (event, requestData) => {
    console.log('🎨 IPC: Generating images...');
    try {
      const result = await apiService.generateImages(requestData);
      console.log('✅ IPC: Image generation completed');
      return result;
    } catch (error) {
      console.error('❌ IPC Error in generate-images:', error);
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
    console.log('🔍 IPC: Testing API connection...');
    try {
      const result = await apiService.testConnection(apiKey);
      console.log('✅ IPC: Connection test completed');
      return result;
    } catch (error) {
      console.error('❌ IPC Error in test-connection:', error);
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

  // Video generation IPC handlers
  ipcMain.handle('create-video-task', async (event, requestData) => {
    console.log('🎬 IPC: Creating video task...');
    try {
      const result = await apiService.createVideoTask(requestData);
      console.log('✅ IPC: Video task creation completed');
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
      console.log('✅ IPC: Video task retrieval completed');
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
    console.log('📋 IPC: Getting video tasks list...');
    try {
      const result = await apiService.getVideoTasks(queryParams, apiKey);
      console.log('✅ IPC: Video tasks list retrieval completed');
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
      console.log('✅ IPC: Video task deletion completed');
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
  
  console.log('✅ IPC handlers setup completed');
}

// App event handlers
app.whenReady().then(() => {
  console.log('🚀 Electron app is ready');
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    navigationEvent.preventDefault();
  });
});

console.log('🖥️  Desktop application starting...');
