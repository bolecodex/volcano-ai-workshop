// Local storage utilities for the application

export const storage = {
  // API Key management
  setApiKey: (apiKey) => {
    try {
      localStorage.setItem('seedream_api_key', apiKey);
      return true;
    } catch (error) {
      console.error('Failed to save API key:', error);
      return false;
    }
  },

  getApiKey: () => {
    try {
      return localStorage.getItem('seedream_api_key') || '';
    } catch (error) {
      console.error('Failed to get API key:', error);
      return '';
    }
  },

  removeApiKey: () => {
    try {
      localStorage.removeItem('seedream_api_key');
      return true;
    } catch (error) {
      console.error('Failed to remove API key:', error);
      return false;
    }
  },

  // AccessKey and SecretKey management (for visual services)
  setAccessKeys: (accessKeyId, secretAccessKey) => {
    try {
      localStorage.setItem('volcengine_access_key_id', accessKeyId);
      localStorage.setItem('volcengine_secret_access_key', secretAccessKey);
      return true;
    } catch (error) {
      console.error('Failed to save access keys:', error);
      return false;
    }
  },

  getAccessKeyId: () => {
    try {
      return localStorage.getItem('volcengine_access_key_id') || '';
    } catch (error) {
      console.error('Failed to get access key id:', error);
      return '';
    }
  },

  getSecretAccessKey: () => {
    try {
      return localStorage.getItem('volcengine_secret_access_key') || '';
    } catch (error) {
      console.error('Failed to get secret access key:', error);
      return '';
    }
  },

  getAccessKeys: () => {
    try {
      return {
        accessKeyId: localStorage.getItem('volcengine_access_key_id') || '',
        secretAccessKey: localStorage.getItem('volcengine_secret_access_key') || ''
      };
    } catch (error) {
      console.error('Failed to get access keys:', error);
      return {
        accessKeyId: '',
        secretAccessKey: ''
      };
    }
  },

  removeAccessKeys: () => {
    try {
      localStorage.removeItem('volcengine_access_key_id');
      localStorage.removeItem('volcengine_secret_access_key');
      return true;
    } catch (error) {
      console.error('Failed to remove access keys:', error);
      return false;
    }
  },

  // TOS (Object Storage) configuration
  setTOSConfig: (config) => {
    try {
      localStorage.setItem('tos_config', JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Failed to save TOS config:', error);
      return false;
    }
  },

  getTOSConfig: () => {
    try {
      const config = localStorage.getItem('tos_config');
      return config ? JSON.parse(config) : {
        bucket: '',
        region: 'cn-beijing',
        endpoint: ''
      };
    } catch (error) {
      console.error('Failed to get TOS config:', error);
      return {
        bucket: '',
        region: 'cn-beijing',
        endpoint: ''
      };
    }
  },

  removeTOSConfig: () => {
    try {
      localStorage.removeItem('tos_config');
      return true;
    } catch (error) {
      console.error('Failed to remove TOS config:', error);
      return false;
    }
  },

  // General settings management
  setSettings: (settings) => {
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  },

  getSettings: () => {
    try {
      const settings = localStorage.getItem('app_settings');
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {};
    }
  },

  // Image generation history
  saveGenerationHistory: (history) => {
    try {
      const existingHistory = storage.getGenerationHistory();
      const updatedHistory = [history, ...existingHistory].slice(0, 50); // Keep last 50 generations
      localStorage.setItem('generation_history', JSON.stringify(updatedHistory));
      return true;
    } catch (error) {
      console.error('Failed to save generation history:', error);
      return false;
    }
  },

  getGenerationHistory: () => {
    try {
      const history = localStorage.getItem('generation_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get generation history:', error);
      return [];
    }
  },

  clearGenerationHistory: () => {
    try {
      localStorage.removeItem('generation_history');
      return true;
    } catch (error) {
      console.error('Failed to clear generation history:', error);
      return false;
    }
  },

  // Jimeng 3.0 Pro video tasks management
  saveJimeng30ProTask: (task) => {
    try {
      const tasks = storage.getJimeng30ProTasks();
      // 检查是否已存在该任务，如果存在则更新，否则添加
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      if (existingIndex >= 0) {
        tasks[existingIndex] = { ...tasks[existingIndex], ...task, updatedAt: new Date().toISOString() };
      } else {
        tasks.unshift({ ...task, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      // 只保留最近的 100 个任务
      const updatedTasks = tasks.slice(0, 100);
      localStorage.setItem('jimeng_30pro_video_tasks', JSON.stringify(updatedTasks));
      return true;
    } catch (error) {
      console.error('Failed to save Jimeng 3.0 Pro task:', error);
      return false;
    }
  },

  getJimeng30ProTasks: () => {
    try {
      const tasks = localStorage.getItem('jimeng_30pro_video_tasks');
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Failed to get Jimeng 3.0 Pro tasks:', error);
      return [];
    }
  },

  updateJimeng30ProTask: (taskId, updates) => {
    try {
      const tasks = storage.getJimeng30ProTasks();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex >= 0) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('jimeng_30pro_video_tasks', JSON.stringify(tasks));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update Jimeng 3.0 Pro task:', error);
      return false;
    }
  },

  deleteJimeng30ProTask: (taskId) => {
    try {
      const tasks = storage.getJimeng30ProTasks();
      const filteredTasks = tasks.filter(t => t.id !== taskId);
      localStorage.setItem('jimeng_30pro_video_tasks', JSON.stringify(filteredTasks));
      return true;
    } catch (error) {
      console.error('Failed to delete Jimeng 3.0 Pro task:', error);
      return false;
    }
  },

  clearJimeng30ProTasks: () => {
    try {
      localStorage.removeItem('jimeng_30pro_video_tasks');
      return true;
    } catch (error) {
      console.error('Failed to clear Jimeng 3.0 Pro tasks:', error);
      return false;
    }
  },

  // Video Edit tasks management
  setVideoEditHistory: (history) => {
    try {
      localStorage.setItem('video_edit_history', JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Failed to save video edit history:', error);
      return false;
    }
  },

  getVideoEditHistory: () => {
    try {
      const history = localStorage.getItem('video_edit_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get video edit history:', error);
      return [];
    }
  },

  clearVideoEditHistory: () => {
    try {
      localStorage.removeItem('video_edit_history');
      return true;
    } catch (error) {
      console.error('Failed to clear video edit history:', error);
      return false;
    }
  },

  // TOS config alias for consistency
  getTosConfig: function() {
    return this.getTOSConfig();
  },

  setTosConfig: function(config) {
    return this.setTOSConfig(config);
  },

  // Generic get/set/remove methods for custom data
  get: (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        return defaultValue;
      }
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, valueToStore);
      return true;
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  }
};
