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

  // TOS Upload IPC handler
  ipcMain.handle('upload-to-tos', async (event, fileData, config) => {
    console.log('📤 IPC: Uploading file to TOS...', {
      fileName: fileData.name,
      fileSize: fileData.size
    });
    try {
      const result = await apiService.uploadToTOS(fileData, config);
      console.log('✅ IPC: File upload completed');
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

  // Motion Imitation IPC handlers
  ipcMain.handle('submit-motion-imitation-task', async (event, requestData) => {
    console.log('🎭 IPC: Submitting motion imitation task...');
    try {
      const result = await apiService.submitMotionImitationTask(requestData);
      console.log('✅ IPC: Motion imitation task submission completed');
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

  // Jimeng Motion Imitation IPC handlers (新版本)
  ipcMain.handle('submit-jimeng-motion-imitation-task', async (event, requestData) => {
    console.log('🎭 IPC: Submitting Jimeng motion imitation task...');
    try {
      const result = await apiService.submitJimengMotionImitationTask(requestData);
      console.log('✅ IPC: Jimeng motion imitation task submission completed');
      return result;
    } catch (error) {
      console.error('❌ IPC Error in submit-jimeng-motion-imitation-task:', error);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'IPC_ERROR'
        }
      };
    }
  });

  ipcMain.handle('query-jimeng-motion-imitation-task', async (event, requestData) => {
    console.log('🔍 IPC: Querying Jimeng motion imitation task:', requestData.task_id);
    try {
      const result = await apiService.queryJimengMotionImitationTask(requestData);
      console.log('✅ IPC: Jimeng motion imitation task query completed');
      return result;
    } catch (error) {
      console.error('❌ IPC Error in query-jimeng-motion-imitation-task:', error);
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
    console.log('🎨 IPC: Submitting Jimeng 4.0 task...');
    try {
      const result = await apiService.submitJimeng40Task(requestData);
      console.log('✅ IPC: Jimeng 4.0 task submission completed');
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

  // OmniHuman1.5 数字人 IPC handlers
  ipcMain.handle('submit-omnihuman-identify-task', async (event, requestData) => {
    console.log('🧑 IPC: Submitting OmniHuman identify task');
    try {
      const result = await apiService.submitOmniHumanIdentifyTask(requestData);
      console.log('✅ IPC: OmniHuman identify task submitted');
      return result;
    } catch (error) {
      console.error('❌ IPC Error in submit-omnihuman-identify-task:', error);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'IPC_ERROR'
        }
      };
    }
  });

  ipcMain.handle('query-omnihuman-identify-task', async (event, requestData) => {
    console.log('🔍 IPC: Querying OmniHuman identify task:', requestData.task_id);
    try {
      const result = await apiService.queryOmniHumanIdentifyTask(requestData);
      console.log('✅ IPC: OmniHuman identify task query completed');
      return result;
    } catch (error) {
      console.error('❌ IPC Error in query-omnihuman-identify-task:', error);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'IPC_ERROR'
        }
      };
    }
  });

  ipcMain.handle('detect-omnihuman-subject', async (event, requestData) => {
    console.log('🎯 IPC: Detecting OmniHuman subject');
    try {
      const result = await apiService.detectOmniHumanSubject(requestData);
      console.log('✅ IPC: OmniHuman subject detection completed');
      return result;
    } catch (error) {
      console.error('❌ IPC Error in detect-omnihuman-subject:', error);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'IPC_ERROR'
        }
      };
    }
  });

  ipcMain.handle('submit-omnihuman-video-task', async (event, requestData) => {
    console.log('🎬 IPC: Submitting OmniHuman video task');
    try {
      const result = await apiService.submitOmniHumanVideoTask(requestData);
      console.log('✅ IPC: OmniHuman video task submitted');
      return result;
    } catch (error) {
      console.error('❌ IPC Error in submit-omnihuman-video-task:', error);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'IPC_ERROR'
        }
      };
    }
  });

  ipcMain.handle('query-omnihuman-video-task', async (event, requestData) => {
    console.log('🔍 IPC: Querying OmniHuman video task:', requestData.task_id);
    try {
      const result = await apiService.queryOmniHumanVideoTask(requestData);
      console.log('✅ IPC: OmniHuman video task query completed');
      return result;
    } catch (error) {
      console.error('❌ IPC Error in query-omnihuman-video-task:', error);
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

  // 即梦 3.0 Pro 视频生成 IPC handlers
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
    console.log('🔗 IPC: Getting TOS pre-signed URL...');
    try {
      const result = await apiService.getTosPreSignedUrl(requestData);
      console.log('✅ IPC: TOS pre-signed URL completed');
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
    console.log('📝 IPC: Upserting vector data...');
    try {
      const result = await apiService.upsertVectorData(requestData);
      console.log('✅ IPC: Vector data upsert completed');
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
    console.log('🧮 IPC: Computing embedding...');
    try {
      const result = await apiService.computeEmbedding(requestData);
      console.log('✅ IPC: Embedding computation completed');
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

  // Inpainting涂抹编辑 IPC handler
  ipcMain.handle('submit-inpainting-task', async (event, requestData) => {
    console.log('🖌️ IPC: Submitting Inpainting task...');
    try {
      const result = await apiService.submitInpaintingTask(requestData);
      console.log('✅ IPC: Inpainting task completed');
      return result;
    } catch (error) {
      console.error('❌ IPC Error in submit-inpainting-task:', error);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'IPC_ERROR'
        }
      };
    }
  });

  // ===== 视频编辑 IPC Handlers =====
  
  ipcMain.handle('submit-video-edit-task', async (event, requestData) => {
    console.log('🎬 IPC: Submitting Video Edit task');
    try {
      const result = await apiService.submitVideoEditTask(requestData);
      console.log('✅ IPC: Video Edit task submitted');
      return result;
    } catch (error) {
      console.error('❌ IPC Error in submit-video-edit-task:', error);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'IPC_ERROR'
        }
      };
    }
  });

  ipcMain.handle('query-video-edit-task', async (event, requestData) => {
    console.log('🔍 IPC: Querying Video Edit task:', requestData.task_id);
    try {
      const result = await apiService.queryVideoEditTask(requestData);
      console.log('✅ IPC: Video Edit task query completed');
      return result;
    } catch (error) {
      console.error('❌ IPC Error in query-video-edit-task:', error);
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
