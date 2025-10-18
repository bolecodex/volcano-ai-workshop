# API直连云端修复

**日期**: 2025年10月18日  
**问题**: AI图片生成和视频生成功能连接到本地API地址(localhost:3001)，应改为直接连接云端API

## 问题描述

在Web模式下，应用通过本地代理服务器(localhost:3001)转发请求到火山引擎云端API，而不是直接连接。这导致：

1. 依赖本地服务器运行
2. 部署时需要额外配置代理
3. 增加了网络延迟

请求示例（修复前）：
```
前端 → http://localhost:3001/api/v3/images/generations → 火山引擎API
```

修复后：
```
前端 → https://ark.cn-beijing.volces.com/api/v3/images/generations
```

## 修复内容

### 1. 修改 `apiClient.js`

**文件路径**: `src/utils/apiClient.js`

**主要更改**:
- 移除了对本地代理服务器的依赖
- 添加了火山引擎云端API的基础URL配置
- 实现了智能路由，根据API类型选择正确的云端地址

```javascript
// 火山引擎API基础地址
const VOLCANO_API_BASE_URL = 'https://api-vikingdb.volces.com';  // 向量数据库API
const ARK_API_BASE_URL = 'https://ark.cn-beijing.volces.com';   // 方舟API
```

**支持的API类型**:
- `/api/v3/*` → 方舟图片生成API
- `/api/video/*` → 方舟视频生成API  
- `/api/embedding/*`, `/api/search/*`, `/api/vector/*` → 向量数据库API

**不支持直连的API**（需要AccessKey签名认证）:
- 即梦系列API（需要使用Electron IPC或本地代理）
- 动作模仿API（需要使用Electron IPC或本地代理）

### 2. 修改 `ImageGenerator.js`

**文件路径**: `src/components/ImageGenerator.js`

**主要更改**:
- 导入 `webAPI` 模块
- 移除了硬编码的 `localhost:3001` 地址
- 在非Electron环境下使用 `webAPI` 直接调用云端API

**修改的函数**:
1. `generateImage()` - 图片生成
2. `testConnection()` - API连接测试

**示例代码**:
```javascript
if (window.electronAPI) {
  // Electron环境：使用IPC
  result = await window.electronAPI.generateImages(requestData);
} else {
  // Web环境：直接调用云端API
  result = await webAPI.generateImages(requestData);
}
```

### 3. 修改 `VideoGenerator.js`

**文件路径**: `src/components/VideoGenerator.js`

**主要更改**:
- 导入 `webAPI` 模块
- 替换了3处使用相对路径的 `fetch` 调用
- 在非Electron环境下使用 `webAPI` 直接调用云端API

**修改的函数**:
1. `fetchTasks()` - 获取任务列表
2. `fetchTaskDetail()` - 获取任务详情
3. `deleteTask()` - 删除任务

## 架构改进

### 修复前架构

```
┌─────────┐     HTTP      ┌──────────────┐     HTTP      ┌──────────────┐
│  前端   │ ───────────▶  │本地代理服务器│ ───────────▶  │火山引擎API   │
│ React   │               │localhost:3001│               │云端服务      │
└─────────┘               └──────────────┘               └──────────────┘
```

### 修复后架构

```
┌─────────┐                                               ┌──────────────┐
│  前端   │ ─────────────── 直接HTTPS ─────────────────▶  │火山引擎API   │
│ React   │                                               │云端服务      │
└─────────┘                                               └──────────────┘
```

### Electron模式（保持不变）

```
┌─────────┐     IPC       ┌──────────────┐     HTTP      ┌──────────────┐
│  前端   │ ───────────▶  │ Electron主进程│ ───────────▶  │火山引擎API   │
│ React   │               │              │               │云端服务      │
└─────────┘               └──────────────┘               └──────────────┘
```

## 优势

1. **简化部署**: 不再需要运行本地代理服务器
2. **降低延迟**: 减少一层网络跳转
3. **提高可靠性**: 减少单点故障
4. **更好的可扩展性**: 可直接部署到静态托管服务

## 注意事项

### 1. CORS跨域问题

直接调用云端API可能会遇到CORS跨域限制。建议：
- 在火山引擎控制台配置CORS白名单
- 或使用支持CORS的浏览器扩展（开发环境）
- 或部署到与API同域的服务器

### 2. API认证方式

- **API Key认证**（✓ 支持直连）: 
  - Seedream图片生成
  - 方舟视频生成
  - 向量数据库服务

- **Signature V4签名认证**（⚠️ 需要IPC或代理）:
  - 即梦系列API
  - 动作模仿API
  - 数字人API

### 3. 兼容性

修改后的代码保持了向后兼容：
- Electron桌面应用：继续使用IPC通信（推荐）
- Web模式：直接连接云端API
- 本地代理模式：仍可通过环境变量配置（`REACT_APP_API_URL`）

## 测试建议

1. **图片生成测试**:
   - 打开浏览器开发者工具（Network标签）
   - 创建一个图片生成任务
   - 确认请求URL是 `https://ark.cn-beijing.volces.com/api/v3/images/generations`
   - 检查响应状态码为200

2. **视频生成测试**:
   - 创建一个视频生成任务
   - 查看任务列表
   - 确认API请求直接发送到云端

3. **连接测试**:
   - 点击"测试连接"按钮
   - 确认能成功验证API Key

## 回退方案

如果需要回退到本地代理模式，可以：

1. 设置环境变量：
```bash
export REACT_APP_API_URL=http://localhost:3001
```

2. 启动本地代理服务器：
```bash
npm run server
```

3. 重新构建前端：
```bash
npm run build
```

## 相关文件

- `src/utils/apiClient.js` - API客户端核心逻辑
- `src/components/ImageGenerator.js` - 图片生成组件
- `src/components/VideoGenerator.js` - 视频生成组件
- `server/index.js` - 本地代理服务器（保留，用于特殊场景）

## 下一步计划

1. 监控生产环境的API调用情况
2. 优化错误处理和重试机制
3. 考虑添加API缓存层
4. 实现请求限流和熔断机制

