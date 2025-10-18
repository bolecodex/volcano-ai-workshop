/**
 * 同步包装器 for storage
 * 
 * 为了保持向后兼容，提供同步API
 * 实际操作是异步的，但使用内存缓存来提供即时响应
 * 
 * 使用说明：
 * 1. 数据会先从缓存返回（如果有）
 * 2. 后台异步更新 IndexedDB
 * 3. 应用启动时自动加载数据到缓存
 */

import { storage } from './storage';

// 内存缓存
const cache = {
  credentials: {},
  configs: {},
  initialized: false
};

// 初始化缓存
async function initializeCache() {
  if (cache.initialized) return;
  
  try {
    console.log('🔄 正在从 IndexedDB 加载数据到缓存...');
    
    // 加载凭证
    cache.credentials.apiKey = await storage.getApiKey();
    cache.credentials.accessKeyId = await storage.getAccessKeyId();
    cache.credentials.secretAccessKey = await storage.getSecretAccessKey();
    
    // 加载配置
    cache.configs.tosConfig = await storage.getTOSConfig();
    cache.configs.appSettings = await storage.getSettings();
    
    cache.initialized = true;
    console.log('✅ 缓存初始化完成');
  } catch (error) {
    console.error('❌ 缓存初始化失败:', error);
  }
}

// 立即开始初始化
initializeCache();

/**
 * 同步 Storage API（使用缓存）
 */
export const storageSync = {
  // ==================== API Key 管理 ====================
  
  setApiKey: (apiKey) => {
    cache.credentials.apiKey = apiKey;
    storage.setApiKey(apiKey).catch(err => 
      console.error('后台保存 API Key 失败:', err)
    );
    return true;
  },

  getApiKey: () => {
    return cache.credentials.apiKey || '';
  },

  // ==================== AccessKey 和 SecretKey 管理 ====================

  setAccessKeys: (accessKeyId, secretAccessKey) => {
    cache.credentials.accessKeyId = accessKeyId;
    cache.credentials.secretAccessKey = secretAccessKey;
    storage.setAccessKeys(accessKeyId, secretAccessKey).catch(err =>
      console.error('后台保存 Access Keys 失败:', err)
    );
    return true;
  },

  getAccessKeyId: () => {
    return cache.credentials.accessKeyId || '';
  },

  getSecretAccessKey: () => {
    return cache.credentials.secretAccessKey || '';
  },

  getAccessKeys: () => {
    return {
      accessKeyId: cache.credentials.accessKeyId || '',
      secretAccessKey: cache.credentials.secretAccessKey || ''
    };
  },

  // ==================== TOS 配置管理 ====================

  setTOSConfig: (config) => {
    cache.configs.tosConfig = config;
    storage.setTOSConfig(config).catch(err =>
      console.error('后台保存 TOS 配置失败:', err)
    );
    return true;
  },

  getTOSConfig: () => {
    return cache.configs.tosConfig || {
      bucket: '',
      region: 'cn-beijing',
      endpoint: ''
    };
  },

  // 别名
  getTosConfig: function() {
    return this.getTOSConfig();
  },

  setTosConfig: function(config) {
    return this.setTOSConfig(config);
  },

  // ==================== 通用设置管理 ====================

  setSettings: (settings) => {
    cache.configs.appSettings = settings;
    storage.setSettings(settings).catch(err =>
      console.error('后台保存设置失败:', err)
    );
    return true;
  },

  getSettings: () => {
    return cache.configs.appSettings || {};
  },

  // ==================== 历史记录和任务（异步方法，需要 await）====================

  saveGenerationHistory: storage.saveGenerationHistory,
  getGenerationHistory: storage.getGenerationHistory,
  clearGenerationHistory: storage.clearGenerationHistory,

  saveJimeng30ProTask: storage.saveJimeng30ProTask,
  getJimeng30ProTasks: storage.getJimeng30ProTasks,
  updateJimeng30ProTask: storage.updateJimeng30ProTask,
  deleteJimeng30ProTask: storage.deleteJimeng30ProTask,
  clearJimeng30ProTasks: storage.clearJimeng30ProTasks,

  setVideoEditHistory: storage.setVideoEditHistory,
  getVideoEditHistory: storage.getVideoEditHistory,
  clearVideoEditHistory: storage.clearVideoEditHistory,

  setItem: storage.setItem,
  getItem: storage.getItem,
  removeItem: storage.removeItem,

  // ==================== 工具方法 ====================

  /**
   * 手动刷新缓存
   */
  refreshCache: async () => {
    cache.initialized = false;
    await initializeCache();
  },

  /**
   * 获取缓存状态
   */
  getCacheStatus: () => {
    return {
      initialized: cache.initialized,
      credentials: Object.keys(cache.credentials).length,
      configs: Object.keys(cache.configs).length
    };
  },

  /**
   * 清除缓存
   */
  clearCache: () => {
    cache.credentials = {};
    cache.configs = {};
    cache.initialized = false;
  }
};

// 为了兼容性，也导出为 storage
export { storageSync as storage };
export default storageSync;

