# 🔄 本地代理服务器使用指南

## 📖 概述

本地代理服务器是解决浏览器CORS（跨域资源共享）限制的最佳方案。它作为中间层，接收前端请求并转发到火山引擎云端API，避免了直接从浏览器调用第三方API时遇到的跨域问题。

## 🎯 为什么需要本地代理？

### 问题背景

当你在浏览器中直接调用火山引擎API时，会遇到以下错误：

```
Failed to fetch
TypeError: Failed to fetch
```

或者：

```
Access to fetch at 'https://ark.cn-beijing.volces.com/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

### 原因分析

浏览器出于安全考虑，默认阻止跨域请求。火山引擎API服务器没有配置允许 `localhost:3000` 的CORS头，因此请求被浏览器拦截。

### 解决方案

使用本地代理服务器：

```
┌─────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   浏览器     │ ────▶ │  本地代理服务器   │ ────▶ │  火山引擎API    │
│ :3000       │  无跨域 │  :3001          │  服务端 │  云端服务       │
└─────────────┘        └──────────────────┘        └─────────────────┘
```

## 🚀 快速开始

### 1. 启动代理服务器

在项目根目录下运行：

```bash
npm run server
```

你会看到以下输出：

```
🌋 ========================================
   火山AI创作工坊 Web版 - 后端服务
========================================== 🌋

🚀 服务器运行中: http://localhost:3001

📡 API 端点:
   图片生成: http://localhost:3001/api/v3/images/generations
   视频生成: http://localhost:3001/api/video/create
   动作模仿: http://localhost:3001/api/motion-imitation/submit
   数字人: http://localhost:3001/api/omnihuman/video/submit
   智能绘图: http://localhost:3001/api/inpainting/submit
   视频编辑: http://localhost:3001/api/video-edit/submit
   健康检查: http://localhost:3001/api/health

✨ 准备就绪，开始创作！
```

### 2. 启动前端开发服务器

在**另一个终端窗口**中运行：

```bash
npm start
```

前端会在 `http://localhost:3000` 启动。

### 3. 访问应用

在浏览器中打开：`http://localhost:3000`

现在所有API请求都会通过本地代理服务器，不会有CORS问题！

## 💡 一键启动（推荐）

使用以下命令同时启动前端和后端：

```bash
npm run dev
```

这个命令会并发运行：
- 前端开发服务器 (localhost:3000)
- 后端代理服务器 (localhost:3001)

## 🔧 配置说明

### 代理服务器配置

代理服务器的配置文件位于：`server/index.js`

关键配置：

```javascript
const PORT = process.env.PORT || 3001;  // 服务器端口

// CORS配置
app.use(cors());  // 允许所有跨域请求

// 静态文件服务
app.use(express.static(path.join(__dirname, '../build')));
```

### 前端API客户端配置

前端API客户端配置在：`src/utils/apiClient.js`

```javascript
// 本地代理服务器地址
const LOCAL_PROXY_URL = 'http://localhost:3001';

class APIClient {
  constructor() {
    this.baseURL = LOCAL_PROXY_URL;
  }
  // ...
}
```

### 环境变量配置（可选）

如果需要自定义端口，可以创建 `.env` 文件：

```env
PORT=3001
REACT_APP_PROXY_URL=http://localhost:3001
```

## 📋 支持的API端点

### 图片生成

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/v3/images/generations` | POST | Seedream 4.0 图片生成 |
| `/api/test-connection` | POST | API连接测试 |

### 即梦系列

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/jimeng40/submit` | POST | 即梦4.0 提交任务 |
| `/api/jimeng40/query` | POST | 即梦4.0 查询任务 |
| `/api/jimeng31/submit` | POST | 即梦3.1 提交任务 |
| `/api/jimeng31/query` | POST | 即梦3.1 查询任务 |
| `/api/jimeng-i2i30/submit` | POST | 即梦图生图3.0 提交任务 |
| `/api/jimeng-i2i30/query` | POST | 即梦图生图3.0 查询任务 |

### 视频生成

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/video/create` | POST | 创建视频任务 |
| `/api/video/tasks/:id` | GET | 查询单个视频任务 |
| `/api/video/tasks` | GET | 查询视频任务列表 |
| `/api/video/tasks/:id` | DELETE | 删除视频任务 |
| `/api/jimeng30pro-video/submit` | POST | 即梦3.0 Pro视频提交 |
| `/api/jimeng30pro-video/query` | POST | 即梦3.0 Pro视频查询 |

### 动作模仿

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/motion-imitation/submit` | POST | 动作模仿提交任务 |
| `/api/motion-imitation/query` | POST | 动作模仿查询任务 |
| `/api/jimeng-motion-imitation/submit` | POST | 即梦动作模仿提交 |
| `/api/jimeng-motion-imitation/query` | POST | 即梦动作模仿查询 |

### OmniHuman1.5 数字人

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/omnihuman/identify/submit` | POST | 主体识别提交 |
| `/api/omnihuman/identify/query` | POST | 主体识别查询 |
| `/api/omnihuman/detect` | POST | 主体检测（同步） |
| `/api/omnihuman/video/submit` | POST | 数字人视频生成提交 |
| `/api/omnihuman/video/query` | POST | 数字人视频生成查询 |

### Inpainting 涂抹编辑

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/inpainting/submit` | POST | 涂抹编辑提交任务 |

### 视频编辑

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/video-edit/submit` | POST | 视频编辑提交任务 |
| `/api/video-edit/query` | POST | 视频编辑查询任务 |

### 向量搜索

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/embedding/image` | POST | 图像向量化 |
| `/api/search/multimodal` | POST | 多模态检索 |
| `/api/embedding/compute` | POST | 向量化计算 |
| `/api/vector/upsert` | POST | 数据写入 |
| `/api/tos/presigned-url` | POST | TOS预签名URL |
| `/api/tos/upload` | POST | TOS文件上传 |

### 系统监控

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |

## 🔍 验证代理是否工作

### 方法1：健康检查

在终端运行：

```bash
curl http://localhost:3001/api/health
```

正常响应：

```json
{
  "status": "OK",
  "message": "火山AI创作工坊后端服务运行中",
  "timestamp": "2025-10-18T09:24:31.975Z",
  "port": 3001,
  "version": "2.0.0-web"
}
```

### 方法2：浏览器开发者工具

1. 打开浏览器，按 `F12` 打开开发者工具
2. 切换到 **Network** 标签
3. 在应用中生成一张图片
4. 查看请求列表，确认请求URL为：
   ```
   http://localhost:3001/api/v3/images/generations
   ```
5. 检查响应状态码为 `200 OK`

### 方法3：Console日志

在浏览器开发者工具的 **Console** 标签中，你应该看到：

```
使用本地代理服务器: http://localhost:3001
```

而不是 CORS 错误信息。

## 🛠️ 故障排查

### 问题1：端口被占用

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**解决方案：**

1. 查找占用端口的进程：
   ```bash
   # macOS/Linux
   lsof -i :3001
   
   # Windows
   netstat -ano | findstr :3001
   ```

2. 终止进程：
   ```bash
   # macOS/Linux
   kill -9 <PID>
   
   # Windows
   taskkill /PID <PID> /F
   ```

3. 或者使用其他端口：
   ```bash
   PORT=3002 npm run server
   ```
   
   同时修改 `src/utils/apiClient.js`：
   ```javascript
   const LOCAL_PROXY_URL = 'http://localhost:3002';
   ```

### 问题2：代理服务器无响应

**症状：** 请求一直pending，没有响应

**排查步骤：**

1. 确认代理服务器正在运行：
   ```bash
   curl http://localhost:3001/api/health
   ```

2. 检查防火墙设置，确保允许 localhost 连接

3. 重启代理服务器：
   ```bash
   # 按 Ctrl+C 停止服务器
   npm run server
   ```

### 问题3：CORS错误仍然存在

**症状：** 仍然看到 CORS 错误

**解决方案：**

1. 清除浏览器缓存：`Ctrl + Shift + Delete`

2. 强制刷新页面：`Ctrl + F5` (Windows) 或 `Cmd + Shift + R` (Mac)

3. 检查 `src/utils/apiClient.js` 中的配置：
   ```javascript
   const LOCAL_PROXY_URL = 'http://localhost:3001';
   ```

4. 确认前端正确使用代理：
   ```javascript
   // 应该看到
   this.baseURL = LOCAL_PROXY_URL;
   
   // 而不是
   this.baseURL = 'https://ark.cn-beijing.volces.com';
   ```

### 问题4：API Key无效

**错误信息：**
```
API Key 无效或已过期
```

**解决方案：**

1. 访问 [火山引擎控制台](https://console.volcengine.com/ark) 确认API Key是否有效

2. 在应用的 **Settings** 页面重新配置API Key

3. 对于即梦系列API，确保已配置 AccessKeyId 和 SecretAccessKey

## 📦 生产环境部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm run prod
```

或者：

```bash
npm run serve
```

这会：
1. 构建优化后的前端代码到 `build/` 目录
2. 启动生产服务器在 3001 端口
3. 同时提供前端静态文件和API代理服务

### 访问生产版本

浏览器打开：`http://localhost:3001`

生产模式的优势：
- ✅ 单一端口（3001）
- ✅ 优化的前端资源
- ✅ 更好的性能
- ✅ 更简单的部署

## 🔒 安全注意事项

### 1. 不要暴露API密钥

API Key 和 AccessKey 只在服务器端使用，永远不要在前端代码中硬编码。

### 2. 生产环境CORS配置

生产环境应该配置严格的CORS策略：

```javascript
// server/index.js
app.use(cors({
  origin: ['https://your-domain.com'],
  credentials: true
}));
```

### 3. 环境变量管理

敏感信息应该存储在环境变量中：

```bash
# .env (不要提交到git)
VOLCANO_API_KEY=your-api-key
VOLCANO_ACCESS_KEY_ID=your-access-key-id
VOLCANO_SECRET_ACCESS_KEY=your-secret-access-key
```

在 `.gitignore` 中添加：
```
.env
.env.local
```

## 📚 相关文档

- [API集成总结](../changelog/API_INTEGRATION_SUMMARY.md)
- [API直连说明](../changelog/API_DIRECT_CONNECTION.md)
- [开发指南](../dev/DEVELOPMENT_GUIDE.md)
- [快速开始](../../QUICKSTART.md)

## 💬 常见问题

### Q: 为什么不直接在浏览器中调用API？

A: 浏览器的同源策略（Same-Origin Policy）会阻止跨域请求。虽然可以通过CORS头解决，但这需要API服务器支持。火山引擎API服务器没有配置允许所有来源的CORS头，因此需要通过代理服务器中转。

### Q: Electron版本也需要代理吗？

A: 不需要！Electron应用使用IPC（进程间通信），在Node.js环境中直接调用API，没有浏览器的CORS限制。

### Q: 可以将代理部署到远程服务器吗？

A: 可以！你可以将整个应用部署到云服务器上：
```bash
# 在服务器上
npm run build
PORT=80 npm run server
```

### Q: 代理会影响性能吗？

A: 影响很小。本地代理只是简单的请求转发，延迟通常在1-5ms之间。网络延迟主要来自访问火山引擎API。

### Q: 如何监控代理服务器？

A: 可以查看代理服务器的日志输出，或者使用 `/api/health` 端点进行健康检查。

## 🎉 总结

使用本地代理服务器是在浏览器中使用火山引擎API的**最佳实践**：

✅ 解决CORS跨域问题  
✅ 保护API密钥安全  
✅ 支持所有API功能  
✅ 易于开发和调试  
✅ 可直接部署到生产环境  

只需记住：**开发时运行 `npm run dev`，生产时运行 `npm run prod`**

---

**更新日期:** 2025年10月18日  
**适用版本:** v2.0.0  
**维护者:** 火山AI创作工坊团队

