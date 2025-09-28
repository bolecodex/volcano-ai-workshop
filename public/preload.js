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
