/**
 * 应用存储工具
 * 基于 IndexedDB 实现，提供高性能、大容量的数据存储
 * 
 * 迁移说明：从 localStorage 升级到 IndexedDB
 * - 更大的存储容量
 * - 异步操作，不阻塞 UI
 * - 支持结构化数据和索引
 * - 自动数据迁移
 */

import dbManager from './db';

/**
 * 从 localStorage 迁移数据到 IndexedDB
 */
async function migrateFromLocalStorage() {
  try {
    const hasRunMigration = await dbManager.get('keyvalue', 'migration_completed');
    if (hasRunMigration && hasRunMigration.value) {
      return; // 已经迁移过了
    }

    console.log('开始从 localStorage 迁移数据到 IndexedDB...');

    // 迁移 API 凭证
    const credentials = [];
    
    const apiKey = localStorage.getItem('seedream_api_key');
    if (apiKey) {
      credentials.push({
        key: 'seedream_api_key',
        type: 'api_key',
        value: apiKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const accessKeyId = localStorage.getItem('volcengine_access_key_id');
    if (accessKeyId) {
      credentials.push({
        key: 'volcengine_access_key_id',
        type: 'access_key',
        value: accessKeyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const secretAccessKey = localStorage.getItem('volcengine_secret_access_key');
    if (secretAccessKey) {
      credentials.push({
        key: 'volcengine_secret_access_key',
        type: 'secret_key',
        value: secretAccessKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    if (credentials.length > 0) {
      await dbManager.bulkAdd('credentials', credentials);
      console.log('✅ API 凭证迁移完成');
    }

    // 迁移配置
    const configs = [];

    const tosConfig = localStorage.getItem('tos_config');
    if (tosConfig) {
      configs.push({
        key: 'tos_config',
        category: 'storage',
        value: JSON.parse(tosConfig),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const appSettings = localStorage.getItem('app_settings');
    if (appSettings) {
      configs.push({
        key: 'app_settings',
        category: 'general',
        value: JSON.parse(appSettings),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    if (configs.length > 0) {
      await dbManager.bulkAdd('configs', configs);
      console.log('✅ 配置迁移完成');
    }

    // 迁移历史记录
    const generationHistory = localStorage.getItem('generation_history');
    if (generationHistory) {
      const history = JSON.parse(generationHistory);
      const historyItems = history.map((item, index) => ({
        id: `gen_${Date.now()}_${index}`,
        type: 'image_generation',
        data: item,
        status: 'completed',
        createdAt: item.timestamp || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      if (historyItems.length > 0) {
        await dbManager.bulkAdd('history', historyItems);
        console.log('✅ 图片生成历史迁移完成');
      }
    }

    const videoEditHistory = localStorage.getItem('video_edit_history');
    if (videoEditHistory) {
      const history = JSON.parse(videoEditHistory);
      const historyItems = history.map((item, index) => ({
        id: `vedit_${Date.now()}_${index}`,
        type: 'video_edit',
        data: item,
        status: item.status || 'completed',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      if (historyItems.length > 0) {
        await dbManager.bulkAdd('history', historyItems);
        console.log('✅ 视频编辑历史迁移完成');
      }
    }

    // 迁移任务
    const jimeng30ProTasks = localStorage.getItem('jimeng_30pro_video_tasks');
    if (jimeng30ProTasks) {
      const tasks = JSON.parse(jimeng30ProTasks);
      const taskItems = tasks.map(task => ({
        ...task,
        type: 'jimeng_30pro_video',
        status: task.status || 'pending',
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: task.updatedAt || new Date().toISOString()
      }));
      if (taskItems.length > 0) {
        await dbManager.bulkAdd('tasks', taskItems);
        console.log('✅ 即梦视频任务迁移完成');
      }
    }

    // 迁移其他 localStorage 数据
    const smartSearchHistory = localStorage.getItem('smartSearchHistory');
    if (smartSearchHistory) {
      await dbManager.set('keyvalue', {
        key: 'smartSearchHistory',
        value: JSON.parse(smartSearchHistory),
        updatedAt: new Date().toISOString()
      });
    }

    const vikingdbCollection = localStorage.getItem('vikingdb_collection');
    if (vikingdbCollection) {
      await dbManager.set('keyvalue', {
        key: 'vikingdb_collection',
        value: vikingdbCollection,
        updatedAt: new Date().toISOString()
      });
    }

    const vikingdbIndex = localStorage.getItem('vikingdb_index');
    if (vikingdbIndex) {
      await dbManager.set('keyvalue', {
        key: 'vikingdb_index',
        value: vikingdbIndex,
        updatedAt: new Date().toISOString()
      });
    }

    // 标记迁移完成
    await dbManager.set('keyvalue', {
      key: 'migration_completed',
      value: true,
      timestamp: new Date().toISOString()
    });

    console.log('🎉 数据迁移完成！');
    
    // 可选：清理 localStorage（如果需要的话，可以取消注释）
    // localStorage.clear();
    
  } catch (error) {
    console.error('数据迁移失败:', error);
    // 即使迁移失败，也不影响正常使用
  }
}

// 初始化数据库并执行迁移
let migrationPromise = null;
async function ensureMigration() {
  if (!migrationPromise) {
    migrationPromise = (async () => {
      await dbManager.init();
      await migrateFromLocalStorage();
    })();
  }
  return migrationPromise;
}

// 立即开始迁移（后台执行）
ensureMigration().catch(err => console.error('Migration failed:', err));

/**
 * Storage API - 保持向后兼容的接口
 */
export const storage = {
  // ==================== API Key 管理 ====================
  
  setApiKey: async (apiKey) => {
    try {
      await ensureMigration();
      await dbManager.set('credentials', {
        key: 'seedream_api_key',
        type: 'api_key',
        value: apiKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Failed to save API key:', error);
      return false;
    }
  },

  getApiKey: async () => {
    try {
      await ensureMigration();
      const result = await dbManager.get('credentials', 'seedream_api_key');
      return result ? result.value : '';
    } catch (error) {
      console.error('Failed to get API key:', error);
      return '';
    }
  },

  removeApiKey: async () => {
    try {
      await ensureMigration();
      await dbManager.delete('credentials', 'seedream_api_key');
      return true;
    } catch (error) {
      console.error('Failed to remove API key:', error);
      return false;
    }
  },

  // ==================== AccessKey 和 SecretKey 管理 ====================

  setAccessKeys: async (accessKeyId, secretAccessKey) => {
    try {
      await ensureMigration();
      const timestamp = new Date().toISOString();
      
      await dbManager.set('credentials', {
        key: 'volcengine_access_key_id',
        type: 'access_key',
        value: accessKeyId,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      
      await dbManager.set('credentials', {
        key: 'volcengine_secret_access_key',
        type: 'secret_key',
        value: secretAccessKey,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      
      return true;
    } catch (error) {
      console.error('Failed to save access keys:', error);
      return false;
    }
  },

  getAccessKeyId: async () => {
    try {
      await ensureMigration();
      const result = await dbManager.get('credentials', 'volcengine_access_key_id');
      return result ? result.value : '';
    } catch (error) {
      console.error('Failed to get access key id:', error);
      return '';
    }
  },

  getSecretAccessKey: async () => {
    try {
      await ensureMigration();
      const result = await dbManager.get('credentials', 'volcengine_secret_access_key');
      return result ? result.value : '';
    } catch (error) {
      console.error('Failed to get secret access key:', error);
      return '';
    }
  },

  getAccessKeys: async () => {
    try {
      await ensureMigration();
      const accessKeyId = await storage.getAccessKeyId();
      const secretAccessKey = await storage.getSecretAccessKey();
      return { accessKeyId, secretAccessKey };
    } catch (error) {
      console.error('Failed to get access keys:', error);
      return { accessKeyId: '', secretAccessKey: '' };
    }
  },

  removeAccessKeys: async () => {
    try {
      await ensureMigration();
      await dbManager.delete('credentials', 'volcengine_access_key_id');
      await dbManager.delete('credentials', 'volcengine_secret_access_key');
      return true;
    } catch (error) {
      console.error('Failed to remove access keys:', error);
      return false;
    }
  },

  // ==================== TOS 配置管理 ====================

  setTOSConfig: async (config) => {
    try {
      await ensureMigration();
      await dbManager.set('configs', {
        key: 'tos_config',
        category: 'storage',
        value: config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Failed to save TOS config:', error);
      return false;
    }
  },

  getTOSConfig: async () => {
    try {
      await ensureMigration();
      const result = await dbManager.get('configs', 'tos_config');
      return result ? result.value : {
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

  removeTOSConfig: async () => {
    try {
      await ensureMigration();
      await dbManager.delete('configs', 'tos_config');
      return true;
    } catch (error) {
      console.error('Failed to remove TOS config:', error);
      return false;
    }
  },

  // ==================== 通用设置管理 ====================

  setSettings: async (settings) => {
    try {
      await ensureMigration();
      await dbManager.set('configs', {
        key: 'app_settings',
        category: 'general',
        value: settings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  },

  getSettings: async () => {
    try {
      await ensureMigration();
      const result = await dbManager.get('configs', 'app_settings');
      return result ? result.value : {};
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {};
    }
  },

  // ==================== 图片生成历史 ====================

  saveGenerationHistory: async (history) => {
    try {
      await ensureMigration();
      const existingHistory = await storage.getGenerationHistory();
      const updatedHistory = [history, ...existingHistory].slice(0, 50);
      
      // 清除旧的生成历史
      const oldItems = await dbManager.getByIndex('history', 'type', 'image_generation');
      for (const item of oldItems) {
        await dbManager.delete('history', item.id);
      }
      
      // 添加新的历史记录
      const historyItems = updatedHistory.map((item, index) => ({
        id: `gen_${Date.now()}_${index}`,
        type: 'image_generation',
        data: item,
        status: 'completed',
        createdAt: item.timestamp || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      await dbManager.bulkAdd('history', historyItems);
      return true;
    } catch (error) {
      console.error('Failed to save generation history:', error);
      return false;
    }
  },

  getGenerationHistory: async () => {
    try {
      await ensureMigration();
      const items = await dbManager.getByIndex('history', 'type', 'image_generation');
      return items.map(item => item.data).slice(0, 50);
    } catch (error) {
      console.error('Failed to get generation history:', error);
      return [];
    }
  },

  clearGenerationHistory: async () => {
    try {
      await ensureMigration();
      const items = await dbManager.getByIndex('history', 'type', 'image_generation');
      for (const item of items) {
        await dbManager.delete('history', item.id);
      }
      return true;
    } catch (error) {
      console.error('Failed to clear generation history:', error);
      return false;
    }
  },

  // ==================== 即梦 3.0 Pro 视频任务 ====================

  saveJimeng30ProTask: async (task) => {
    try {
      await ensureMigration();
      const existingTask = await dbManager.get('tasks', task.id);
      
      const taskData = {
        ...task,
        type: 'jimeng_30pro_video',
        createdAt: existingTask?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await dbManager.set('tasks', taskData);
      return true;
    } catch (error) {
      console.error('Failed to save Jimeng 3.0 Pro task:', error);
      return false;
    }
  },

  getJimeng30ProTasks: async () => {
    try {
      await ensureMigration();
      const tasks = await dbManager.getByIndex('tasks', 'type', 'jimeng_30pro_video');
      // 按更新时间排序，最新的在前
      return tasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 100);
    } catch (error) {
      console.error('Failed to get Jimeng 3.0 Pro tasks:', error);
      return [];
    }
  },

  updateJimeng30ProTask: async (taskId, updates) => {
    try {
      await ensureMigration();
      const task = await dbManager.get('tasks', taskId);
      if (task) {
        await dbManager.set('tasks', {
          ...task,
          ...updates,
          updatedAt: new Date().toISOString()
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update Jimeng 3.0 Pro task:', error);
      return false;
    }
  },

  deleteJimeng30ProTask: async (taskId) => {
    try {
      await ensureMigration();
      await dbManager.delete('tasks', taskId);
      return true;
    } catch (error) {
      console.error('Failed to delete Jimeng 3.0 Pro task:', error);
      return false;
    }
  },

  clearJimeng30ProTasks: async () => {
    try {
      await ensureMigration();
      const tasks = await dbManager.getByIndex('tasks', 'type', 'jimeng_30pro_video');
      for (const task of tasks) {
        await dbManager.delete('tasks', task.id);
      }
      return true;
    } catch (error) {
      console.error('Failed to clear Jimeng 3.0 Pro tasks:', error);
      return false;
    }
  },

  // ==================== 视频编辑历史 ====================

  setVideoEditHistory: async (history) => {
    try {
      await ensureMigration();
      
      // 清除旧的视频编辑历史
      const oldItems = await dbManager.getByIndex('history', 'type', 'video_edit');
      for (const item of oldItems) {
        await dbManager.delete('history', item.id);
      }
      
      // 添加新的历史记录
      const historyItems = history.map((item, index) => ({
        id: `vedit_${Date.now()}_${index}`,
        type: 'video_edit',
        data: item,
        status: item.status || 'completed',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      if (historyItems.length > 0) {
        await dbManager.bulkAdd('history', historyItems);
      }
      return true;
    } catch (error) {
      console.error('Failed to save video edit history:', error);
      return false;
    }
  },

  getVideoEditHistory: async () => {
    try {
      await ensureMigration();
      const items = await dbManager.getByIndex('history', 'type', 'video_edit');
      return items.map(item => item.data);
    } catch (error) {
      console.error('Failed to get video edit history:', error);
      return [];
    }
  },

  clearVideoEditHistory: async () => {
    try {
      await ensureMigration();
      const items = await dbManager.getByIndex('history', 'type', 'video_edit');
      for (const item of items) {
        await dbManager.delete('history', item.id);
      }
      return true;
    } catch (error) {
      console.error('Failed to clear video edit history:', error);
      return false;
    }
  },

  // ==================== TOS 配置别名（保持兼容性）====================

  getTosConfig: function() {
    return this.getTOSConfig();
  },

  setTosConfig: function(config) {
    return this.setTOSConfig(config);
  },

  // ==================== 通用键值对存储 ====================

  /**
   * 保存任意键值对
   * @param {string} key - 键
   * @param {*} value - 值
   */
  setItem: async (key, value) => {
    try {
      await ensureMigration();
      await dbManager.set('keyvalue', {
        key,
        value,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
      return false;
    }
  },

  /**
   * 获取键值对
   * @param {string} key - 键
   * @param {*} defaultValue - 默认值
   */
  getItem: async (key, defaultValue = null) => {
    try {
      await ensureMigration();
      const result = await dbManager.get('keyvalue', key);
      return result ? result.value : defaultValue;
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return defaultValue;
    }
  },

  /**
   * 删除键值对
   * @param {string} key - 键
   */
  removeItem: async (key) => {
    try {
      await ensureMigration();
      await dbManager.delete('keyvalue', key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  },

  // ==================== 数据库管理 ====================

  /**
   * 清空所有数据（慎用！）
   */
  clearAll: async () => {
    try {
      await ensureMigration();
      await dbManager.clear('credentials');
      await dbManager.clear('configs');
      await dbManager.clear('history');
      await dbManager.clear('tasks');
      await dbManager.clear('keyvalue');
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  },

  /**
   * 导出所有数据
   */
  exportData: async () => {
    try {
      await ensureMigration();
      const data = {
        credentials: await dbManager.getAll('credentials'),
        configs: await dbManager.getAll('configs'),
        history: await dbManager.getAll('history'),
        tasks: await dbManager.getAll('tasks'),
        keyvalue: await dbManager.getAll('keyvalue'),
        exportedAt: new Date().toISOString()
      };
      return data;
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  },

  /**
   * 导入数据
   */
  importData: async (data) => {
    try {
      await ensureMigration();
      
      if (data.credentials) {
        await dbManager.bulkAdd('credentials', data.credentials);
      }
      if (data.configs) {
        await dbManager.bulkAdd('configs', data.configs);
      }
      if (data.history) {
        await dbManager.bulkAdd('history', data.history);
      }
      if (data.tasks) {
        await dbManager.bulkAdd('tasks', data.tasks);
      }
      if (data.keyvalue) {
        await dbManager.bulkAdd('keyvalue', data.keyvalue);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
};

export default storage;
