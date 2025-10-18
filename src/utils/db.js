/**
 * IndexedDB 工具类
 * 用于在浏览器中安全、高效地存储应用数据
 * 
 * 特性:
 * - 支持大容量存储（比 localStorage 大得多）
 * - 异步操作，不阻塞 UI
 * - 支持索引和查询
 * - 自动版本管理
 * - 错误处理和重试机制
 */

class DatabaseManager {
  constructor() {
    this.dbName = 'VolcanoAIWorkshop';
    this.version = 1;
    this.db = null;
    this.initPromise = null;
  }

  /**
   * 初始化数据库
   */
  async init() {
    // 如果已经初始化，返回现有的 promise
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB 打开失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB 初始化成功');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建对象存储空间（类似于表）
        
        // 1. API 凭证存储
        if (!db.objectStoreNames.contains('credentials')) {
          const credentialsStore = db.createObjectStore('credentials', { keyPath: 'key' });
          credentialsStore.createIndex('type', 'type', { unique: false });
          credentialsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 2. 配置存储
        if (!db.objectStoreNames.contains('configs')) {
          const configsStore = db.createObjectStore('configs', { keyPath: 'key' });
          configsStore.createIndex('category', 'category', { unique: false });
          configsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 3. 历史记录存储
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
          historyStore.createIndex('type', 'type', { unique: false });
          historyStore.createIndex('createdAt', 'createdAt', { unique: false });
          historyStore.createIndex('status', 'status', { unique: false });
        }

        // 4. 任务存储
        if (!db.objectStoreNames.contains('tasks')) {
          const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
          tasksStore.createIndex('type', 'type', { unique: false });
          tasksStore.createIndex('status', 'status', { unique: false });
          tasksStore.createIndex('createdAt', 'createdAt', { unique: false });
          tasksStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 5. 通用键值对存储
        if (!db.objectStoreNames.contains('keyvalue')) {
          db.createObjectStore('keyvalue', { keyPath: 'key' });
        }

        console.log('IndexedDB 数据库结构创建完成');
      };
    });

    return this.initPromise;
  }

  /**
   * 确保数据库已初始化
   */
  async ensureDB() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  /**
   * 通用的数据存储方法
   * @param {string} storeName - 存储空间名称
   * @param {*} data - 要存储的数据
   */
  async set(storeName, data) {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to set data in ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * 通用的数据读取方法
   * @param {string} storeName - 存储空间名称
   * @param {*} key - 键
   */
  async get(storeName, key) {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to get data from ${storeName}:`, error);
      return null;
    }
  }

  /**
   * 删除数据
   * @param {string} storeName - 存储空间名称
   * @param {*} key - 键
   */
  async delete(storeName, key) {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to delete data from ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * 获取所有数据
   * @param {string} storeName - 存储空间名称
   */
  async getAll(storeName) {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to get all data from ${storeName}:`, error);
      return [];
    }
  }

  /**
   * 根据索引查询数据
   * @param {string} storeName - 存储空间名称
   * @param {string} indexName - 索引名称
   * @param {*} value - 索引值
   */
  async getByIndex(storeName, indexName, value) {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to get data by index from ${storeName}:`, error);
      return [];
    }
  }

  /**
   * 清空存储空间
   * @param {string} storeName - 存储空间名称
   */
  async clear(storeName) {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to clear ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * 批量添加数据
   * @param {string} storeName - 存储空间名称
   * @param {Array} items - 数据数组
   */
  async bulkAdd(storeName, items) {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        let completed = 0;
        let hasError = false;

        items.forEach(item => {
          const request = store.put(item);
          request.onsuccess = () => {
            completed++;
            if (completed === items.length && !hasError) {
              resolve(true);
            }
          };
          request.onerror = () => {
            hasError = true;
            reject(request.error);
          };
        });
      });
    } catch (error) {
      console.error(`Failed to bulk add to ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * 计数
   * @param {string} storeName - 存储空间名称
   */
  async count(storeName) {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to count ${storeName}:`, error);
      return 0;
    }
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
      console.log('IndexedDB 连接已关闭');
    }
  }

  /**
   * 删除整个数据库
   */
  static async deleteDatabase(dbName = 'VolcanoAIWorkshop') {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);
      
      request.onsuccess = () => {
        console.log(`数据库 ${dbName} 已删除`);
        resolve(true);
      };
      
      request.onerror = () => {
        console.error(`删除数据库 ${dbName} 失败:`, request.error);
        reject(request.error);
      };
    });
  }
}

// 创建单例实例
const dbManager = new DatabaseManager();

// 导出实例和类
export { dbManager, DatabaseManager };
export default dbManager;

