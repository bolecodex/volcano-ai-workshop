const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // API calls via IPC
  generateImages: (requestData) => {
    console.log('🎨 Preload: Calling generate-images via IPC');
    return ipcRenderer.invoke('generate-images', requestData);
  },
  
  testConnection: (apiKey) => {
    console.log('🔍 Preload: Calling test-connection via IPC');
    return ipcRenderer.invoke('test-connection', apiKey);
  },

  // Video generation API calls via IPC
  createVideoTask: (requestData) => {
    console.log('🎬 Preload: Calling create-video-task via IPC');
    return ipcRenderer.invoke('create-video-task', requestData);
  },

  getVideoTask: (taskId, apiKey) => {
    console.log('📹 Preload: Calling get-video-task via IPC');
    return ipcRenderer.invoke('get-video-task', { taskId, apiKey });
  },

  getVideoTasks: (queryParams, apiKey) => {
    console.log('📋 Preload: Calling get-video-tasks via IPC');
    return ipcRenderer.invoke('get-video-tasks', { queryParams, apiKey });
  },

  deleteVideoTask: (taskId, apiKey) => {
    console.log('🗑️ Preload: Calling delete-video-task via IPC');
    return ipcRenderer.invoke('delete-video-task', { taskId, apiKey });
  },

  // Motion Imitation API calls via IPC
  submitMotionImitationTask: (requestData) => {
    console.log('🎭 Preload: Calling submit-motion-imitation-task via IPC');
    return ipcRenderer.invoke('submit-motion-imitation-task', requestData);
  },

  queryMotionImitationTask: (requestData) => {
    console.log('🔍 Preload: Calling query-motion-imitation-task via IPC');
    return ipcRenderer.invoke('query-motion-imitation-task', requestData);
  },

  // Jimeng Motion Imitation API calls via IPC (新版本)
  submitJimengMotionImitationTask: (requestData) => {
    console.log('🎭 Preload: Calling submit-jimeng-motion-imitation-task via IPC');
    return ipcRenderer.invoke('submit-jimeng-motion-imitation-task', requestData);
  },

  queryJimengMotionImitationTask: (requestData) => {
    console.log('🔍 Preload: Calling query-jimeng-motion-imitation-task via IPC');
    return ipcRenderer.invoke('query-jimeng-motion-imitation-task', requestData);
  },

  // 即梦AI 4.0 API calls via IPC
  submitJimeng40Task: (requestData) => {
    console.log('🎨 Preload: Calling submit-jimeng40-task via IPC');
    return ipcRenderer.invoke('submit-jimeng40-task', requestData);
  },

  queryJimeng40Task: (requestData) => {
    console.log('🔍 Preload: Calling query-jimeng40-task via IPC');
    return ipcRenderer.invoke('query-jimeng40-task', requestData);
  },

  // OmniHuman1.5 数字人 API calls via IPC
  submitOmniHumanIdentifyTask: (requestData) => {
    console.log('🧑 Preload: Calling submit-omnihuman-identify-task via IPC');
    return ipcRenderer.invoke('submit-omnihuman-identify-task', requestData);
  },

  queryOmniHumanIdentifyTask: (requestData) => {
    console.log('🔍 Preload: Calling query-omnihuman-identify-task via IPC');
    return ipcRenderer.invoke('query-omnihuman-identify-task', requestData);
  },

  detectOmniHumanSubject: (requestData) => {
    console.log('🎯 Preload: Calling detect-omnihuman-subject via IPC');
    return ipcRenderer.invoke('detect-omnihuman-subject', requestData);
  },

  submitOmniHumanVideoTask: (requestData) => {
    console.log('🎬 Preload: Calling submit-omnihuman-video-task via IPC');
    return ipcRenderer.invoke('submit-omnihuman-video-task', requestData);
  },

  queryOmniHumanVideoTask: (requestData) => {
    console.log('🔍 Preload: Calling query-omnihuman-video-task via IPC');
    return ipcRenderer.invoke('query-omnihuman-video-task', requestData);
  },

  // 即梦文生图 3.1 API calls via IPC
  submitJimeng31Task: (requestData) => {
    console.log('🎨 Preload: Calling submit-jimeng31-task via IPC');
    return ipcRenderer.invoke('submit-jimeng31-task', requestData);
  },

  queryJimeng31Task: (requestData) => {
    console.log('🔍 Preload: Calling query-jimeng31-task via IPC');
    return ipcRenderer.invoke('query-jimeng31-task', requestData);
  },

  // 即梦AI 3.0 Pro 视频生成 API calls via IPC
  submitJimeng30ProVideoTask: (requestData) => {
    console.log('🎬 Preload: Calling submit-jimeng30pro-video-task via IPC');
    return ipcRenderer.invoke('submit-jimeng30pro-video-task', requestData);
  },

  queryJimeng30ProVideoTask: (requestData) => {
    console.log('🔍 Preload: Calling query-jimeng30pro-video-task via IPC');
    return ipcRenderer.invoke('query-jimeng30pro-video-task', requestData);
  },

  // 即梦图生图3.0智能参考 API calls via IPC
  submitJimengI2I30Task: (requestData) => {
    console.log('🎨 Preload: Calling submit-jimeng-i2i30-task via IPC');
    return ipcRenderer.invoke('submit-jimeng-i2i30-task', requestData);
  },

  queryJimengI2I30Task: (requestData) => {
    console.log('🔍 Preload: Calling query-jimeng-i2i30-task via IPC');
    return ipcRenderer.invoke('query-jimeng-i2i30-task', requestData);
  },

  // 图像向量化 API calls via IPC
  imageEmbedding: (requestData) => {
    console.log('🔍 Preload: Calling image-embedding via IPC');
    return ipcRenderer.invoke('image-embedding', requestData);
  },

  // 向量数据库 - 多模态检索 API calls via IPC
  searchByMultiModal: (requestData) => {
    console.log('🔍 Preload: Calling search-by-multimodal via IPC');
    return ipcRenderer.invoke('search-by-multimodal', requestData);
  },

  // TOS - 生成预签名 URL
  getTosPreSignedUrl: (requestData) => {
    console.log('🔗 Preload: Calling get-tos-presigned-url via IPC');
    return ipcRenderer.invoke('get-tos-presigned-url', requestData);
  },

  // 向量数据库 - 数据写入 API calls via IPC
  upsertVectorData: (requestData) => {
    console.log('📝 Preload: Calling upsert-vector-data via IPC');
    return ipcRenderer.invoke('upsert-vector-data', requestData);
  },

  // 向量数据库 - 向量化计算 API calls via IPC
  computeEmbedding: (requestData) => {
    console.log('🧮 Preload: Calling compute-embedding via IPC');
    return ipcRenderer.invoke('compute-embedding', requestData);
  },

  // Inpainting涂抹编辑 API calls via IPC
  submitInpaintingTask: (requestData) => {
    console.log('🖌️ Preload: Calling submit-inpainting-task via IPC');
    return ipcRenderer.invoke('submit-inpainting-task', requestData);
  },

  // TOS Upload
  uploadToTOS: (fileData, config) => {
    console.log('📤 Preload: Calling upload-to-tos via IPC');
    return ipcRenderer.invoke('upload-to-tos', fileData, config);
  },
  
  // App info
  getAppInfo: () => {
    console.log('📱 Preload: Getting app info via IPC');
    return ipcRenderer.invoke('get-app-info');
  },
  
  // File operations
  showSaveDialog: (options) => {
    console.log('💾 Preload: Showing save dialog');
    return ipcRenderer.invoke('show-save-dialog', options);
  },
  
  showOpenDialog: (options) => {
    console.log('📂 Preload: Showing open dialog');
    return ipcRenderer.invoke('show-open-dialog', options);
  },
  
  // System notifications
  showNotification: (options) => {
    console.log('🔔 Preload: Showing notification');
    return ipcRenderer.invoke('show-notification', options);
  },
  
  // Platform info
  platform: process.platform,
  
  // Version info
  versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome
  },
  
  // Check if running in Electron
  isElectron: true,
  
  // Environment info
  isDev: process.env.NODE_ENV === 'development'
});

// Enhanced DOM ready handler
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Preload: DOM content loaded in Electron environment');
  
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
      console.log(`📝 Preload: Updated ${selector} with ${text}`);
    }
  };

  // Update version info if elements exist
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type]);
  }
  
  // Add Electron-specific styling
  document.body.classList.add('electron-app');
  
  // Prevent drag and drop of files
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  console.log('✅ Preload: Initialization completed');
});

// Security: Prevent eval and new Function
window.eval = global.eval = () => {
  throw new Error('eval() is disabled for security reasons.');
};

// Log preload script loading
console.log('🔧 Preload: Script loaded successfully');
