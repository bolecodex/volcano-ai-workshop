# 🗄️ 存储系统迁移文档

## 概述

本项目已从 localStorage 迁移到 IndexedDB，以获得更好的性能和更大的存储容量。

## 迁移日期

**2025-10-18**

## 为什么迁移？

### localStorage 的限制
- ❌ 存储容量小（通常 5-10MB）
- ❌ 同步操作，可能阻塞 UI
- ❌ 只能存储字符串
- ❌ 没有索引和查询能力
- ❌ 安全性较低

### IndexedDB 的优势
- ✅ 存储容量大（通常 50MB+ 到无限制）
- ✅ 异步操作，不阻塞 UI
- ✅ 支持复杂数据类型（对象、数组、Blob 等）
- ✅ 支持索引和高效查询
- ✅ 更好的性能
- ✅ 事务支持，数据更安全

## 架构设计

### 三层架构

```
┌─────────────────────────────────┐
│   组件层 (Components)            │
│   - Settings.js                 │
│   - ImageGenerator.js           │
│   - VideoEditor.js              │
│   - SmartSearch.js              │
│   - MotionImitation.js          │
│   - DigitalHuman.js             │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│   API 层 (storage.js)           │  ← 主要 API，支持异步操作
│   或 (storageSync.js)           │  ← 同步包装器（使用缓存）
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│   数据库层 (db.js)               │
│   - DatabaseManager             │
│   - IndexedDB 操作               │
└─────────────────────────────────┘
```

### 核心文件

1. **`src/utils/db.js`** - IndexedDB 数据库管理器
   - 数据库初始化
   - CRUD 操作
   - 索引查询
   - 批量操作

2. **`src/utils/storage.js`** - 主要存储 API（异步）
   - 凭证管理
   - 配置管理
   - 历史记录管理
   - 自动数据迁移

3. **`src/utils/storageSync.js`** - 同步包装器
   - 内存缓存
   - 同步 API（向后兼容）
   - 后台异步持久化

## 数据库结构

### 数据库名称
`VolcanoAIWorkshop`

### 对象存储空间（类似表）

#### 1. `credentials` - API 凭证
```javascript
{
  key: string,           // 主键，如 'seedream_api_key'
  type: string,          // 凭证类型：'api_key', 'access_key', 'secret_key'
  value: string,         // 凭证值
  createdAt: string,     // 创建时间 ISO 8601
  updatedAt: string      // 更新时间 ISO 8601
}
```

索引：
- `type` - 按凭证类型查询
- `updatedAt` - 按更新时间查询

#### 2. `configs` - 配置
```javascript
{
  key: string,           // 主键，如 'tos_config'
  category: string,      // 配置类别：'storage', 'general' 等
  value: object,         // 配置值（任意对象）
  createdAt: string,
  updatedAt: string
}
```

索引：
- `category` - 按配置类别查询
- `updatedAt` - 按更新时间查询

#### 3. `history` - 历史记录
```javascript
{
  id: string,            // 主键（自动生成）
  type: string,          // 历史类型：'image_generation', 'video_edit' 等
  data: object,          // 历史数据
  status: string,        // 状态：'completed', 'failed' 等
  createdAt: string,
  updatedAt: string
}
```

索引：
- `type` - 按历史类型查询
- `createdAt` - 按创建时间查询
- `status` - 按状态查询

#### 4. `tasks` - 任务
```javascript
{
  id: string,            // 主键（任务 ID）
  type: string,          // 任务类型：'jimeng_30pro_video' 等
  status: string,        // 任务状态：'pending', 'processing', 'completed' 等
  data: object,          // 任务数据
  createdAt: string,
  updatedAt: string
}
```

索引：
- `type` - 按任务类型查询
- `status` - 按状态查询
- `createdAt` - 按创建时间查询
- `updatedAt` - 按更新时间查询

#### 5. `keyvalue` - 通用键值对
```javascript
{
  key: string,           // 主键
  value: any,            // 任意值
  updatedAt: string
}
```

## 数据迁移

### 自动迁移

应用首次启动时会自动从 localStorage 迁移数据到 IndexedDB。

#### 迁移内容

| localStorage Key | IndexedDB 存储空间 | 说明 |
|-----------------|-------------------|------|
| `seedream_api_key` | `credentials` | API Key |
| `volcengine_access_key_id` | `credentials` | Access Key ID |
| `volcengine_secret_access_key` | `credentials` | Secret Access Key |
| `tos_config` | `configs` | TOS 配置 |
| `app_settings` | `configs` | 应用设置 |
| `generation_history` | `history` | 图片生成历史 |
| `video_edit_history` | `history` | 视频编辑历史 |
| `jimeng_30pro_video_tasks` | `tasks` | 即梦视频任务 |
| `smartSearchHistory` | `keyvalue` | 智能搜索历史 |
| `vikingdb_collection` | `keyvalue` | VikingDB 集合 |
| `vikingdb_index` | `keyvalue` | VikingDB 索引 |

### 迁移状态

迁移完成后，会在 `keyvalue` 存储空间中设置：
```javascript
{
  key: 'migration_completed',
  value: true,
  timestamp: '2025-10-18T...'
}
```

### 手动触发迁移

如果需要重新迁移：

```javascript
// 清除迁移标记
await storage.removeItem('migration_completed');

// 刷新页面
window.location.reload();
```

## API 使用指南

### 异步 API（推荐）

适用于新组件或可以使用 async/await 的场景：

```javascript
import { storage } from '../utils/storage';

// 在组件中使用
async function saveApiKey(key) {
  await storage.setApiKey(key);
}

async function loadConfig() {
  const apiKey = await storage.getApiKey();
  const tosConfig = await storage.getTOSConfig();
  return { apiKey, tosConfig };
}

// 在 useEffect 中使用
useEffect(() => {
  const loadData = async () => {
    const apiKey = await storage.getApiKey();
    setApiKey(apiKey);
  };
  loadData();
}, []);
```

### 同步 API（兼容模式）

适用于大量使用同步调用的旧组件：

```javascript
import { storageSync as storage } from '../utils/storageSync';

// 同步调用（使用内存缓存）
function saveApiKey(key) {
  storage.setApiKey(key);  // 立即返回，后台异步保存
}

function getApiKey() {
  return storage.getApiKey();  // 立即返回缓存值
}
```

### 主要 API 方法

#### 凭证管理

```javascript
// API Key
await storage.setApiKey(apiKey);
const apiKey = await storage.getApiKey();
await storage.removeApiKey();

// Access Keys
await storage.setAccessKeys(accessKeyId, secretAccessKey);
const accessKeyId = await storage.getAccessKeyId();
const secretAccessKey = await storage.getSecretAccessKey();
const { accessKeyId, secretAccessKey } = await storage.getAccessKeys();
await storage.removeAccessKeys();
```

#### 配置管理

```javascript
// TOS 配置
await storage.setTOSConfig({ bucket, region, endpoint });
const tosConfig = await storage.getTOSConfig();
await storage.removeTOSConfig();

// 应用设置
await storage.setSettings(settings);
const settings = await storage.getSettings();
```

#### 历史记录

```javascript
// 图片生成历史
await storage.saveGenerationHistory(historyItem);
const history = await storage.getGenerationHistory();
await storage.clearGenerationHistory();

// 视频编辑历史
await storage.setVideoEditHistory(history);
const history = await storage.getVideoEditHistory();
await storage.clearVideoEditHistory();
```

#### 任务管理

```javascript
// 即梦视频任务
await storage.saveJimeng30ProTask(task);
const tasks = await storage.getJimeng30ProTasks();
await storage.updateJimeng30ProTask(taskId, updates);
await storage.deleteJimeng30ProTask(taskId);
await storage.clearJimeng30ProTasks();
```

#### 通用键值对

```javascript
await storage.setItem('my_key', { any: 'value' });
const value = await storage.getItem('my_key', defaultValue);
await storage.removeItem('my_key');
```

#### 数据导入导出

```javascript
// 导出所有数据（用于备份）
const data = await storage.exportData();
console.log(JSON.stringify(data, null, 2));

// 导入数据
await storage.importData(data);

// 清空所有数据
await storage.clearAll();
```

## 性能优化

### 缓存策略

`storageSync.js` 使用内存缓存来提高性能：

1. **初始加载**：应用启动时自动加载常用数据到缓存
2. **读取优先**：读取操作立即返回缓存值
3. **后台写入**：写入操作立即更新缓存，后台异步持久化
4. **自动同步**：缓存和 IndexedDB 保持同步

### 批量操作

使用批量 API 提高性能：

```javascript
// 批量添加数据
await dbManager.bulkAdd('history', [item1, item2, item3]);

// 而不是
await storage.saveItem(item1);
await storage.saveItem(item2);
await storage.saveItem(item3);
```

## 浏览器兼容性

IndexedDB 支持所有现代浏览器：

- ✅ Chrome 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ Edge 12+
- ✅ Opera 15+
- ✅ iOS Safari 10+
- ✅ Android Chrome 4.4+

## 调试工具

### Chrome DevTools

1. 打开 Chrome DevTools (F12)
2. 点击 "Application" 标签
3. 左侧菜单选择 "Storage" → "IndexedDB"
4. 展开 "VolcanoAIWorkshop" 数据库
5. 查看各个对象存储空间的数据

### 控制台命令

```javascript
// 查看数据库状态
const db = await import('./utils/db.js');
console.log('Database:', db.dbManager);

// 查看缓存状态（如果使用 storageSync）
const { storageSync } = await import('./utils/storageSync.js');
console.log('Cache status:', storageSync.getCacheStatus());

// 导出所有数据
const { storage } = await import('./utils/storage.js');
const data = await storage.exportData();
console.log(JSON.stringify(data, null, 2));

// 刷新缓存
await storageSync.refreshCache();
```

## 故障排除

### 问题 1：数据没有保存

**症状**：设置保存后刷新页面，数据丢失

**解决方案**：
1. 检查浏览器是否阻止了 IndexedDB
2. 打开 DevTools 查看 Console 错误
3. 确认 IndexedDB 配额未满
4. 尝试清除浏览器缓存

### 问题 2：迁移失败

**症状**：控制台显示迁移错误

**解决方案**：
1. 打开 DevTools Console 查看详细错误
2. 检查 localStorage 中的原始数据是否有效
3. 手动导出 localStorage 数据作为备份
4. 联系开发人员

### 问题 3：性能问题

**症状**：应用响应缓慢

**解决方案**：
1. 检查历史记录数量（自动限制为最近 50-100 条）
2. 清理旧数据：`await storage.clearGenerationHistory()`
3. 确认使用了 `storageSync` 而不是直接的异步 API
4. 使用批量操作而不是单个操作

### 问题 4：缓存不同步

**症状**：storageSync 返回的数据不是最新的

**解决方案**：
```javascript
// 手动刷新缓存
import { storageSync } from './utils/storageSync';
await storageSync.refreshCache();
```

## 数据安全

### 敏感数据保护

API 密钥等敏感数据存储在 IndexedDB 中，建议：

1. ⚠️ 不要在公共设备上保存敏感信息
2. ⚠️ 定期更换 API 密钥
3. ⚠️ 使用 HTTPS 访问应用
4. ✅ IndexedDB 数据只能在同源页面访问
5. ✅ 浏览器退出时可以配置清除数据

### 数据备份

定期备份数据：

```javascript
// 导出数据
const data = await storage.exportData();

// 下载为 JSON 文件
const blob = new Blob([JSON.stringify(data, null, 2)], 
  { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `volcano-ai-backup-${Date.now()}.json`;
a.click();
```

## 未来计划

- [ ] 数据加密存储
- [ ] 云端同步
- [ ] 多设备数据同步
- [ ] 更细粒度的缓存控制
- [ ] 压缩存储以节省空间
- [ ] 自动清理过期数据
- [ ] 数据版本管理

## 相关文档

- [IndexedDB API 文档](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [项目 README](README.md)
- [QUICKSTART](QUICKSTART.md)

## 更新日志

### v2.0.0-web (2025-10-18)
- ✅ 从 localStorage 迁移到 IndexedDB
- ✅ 创建 DatabaseManager 类
- ✅ 实现异步 storage API
- ✅ 创建同步包装器 storageSync
- ✅ 自动数据迁移
- ✅ 更新所有组件

---

**最后更新**: 2025-10-18  
**维护者**: 开发团队

