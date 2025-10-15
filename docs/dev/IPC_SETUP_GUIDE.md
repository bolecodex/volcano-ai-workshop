# IPC 视频生成功能使用指南

## 概述

视频生成功能现已完全集成到Electron应用中，使用IPC（Inter-Process Communication）进行前后端通信，无需HTTP代理。

## 架构说明

### IPC通信流程
```
React前端 → Preload脚本 → Main进程 → API服务 → 火山方舟API
```

### 关键文件
- `public/preload.js` - 暴露IPC方法给渲染进程
- `desktop-app.js` - 主进程IPC处理器
- `api-service.js` - API服务封装
- `src/components/VideoGenerator.js` - 前端组件

## 启动方式

### Electron桌面应用（推荐）
```bash
# 开发模式
npm run electron-dev

# 或者先构建再启动
npm run desktop
```

### Web版本（备用）
```bash
# 启动完整开发环境
npm run dev-web
```

## IPC方法列表

### 视频生成相关
- `window.electronAPI.createVideoTask(requestData)` - 创建视频任务
- `window.electronAPI.getVideoTask(taskId, apiKey)` - 获取单个任务详情
- `window.electronAPI.getVideoTasks(queryParams, apiKey)` - 获取任务列表
- `window.electronAPI.deleteVideoTask(taskId, apiKey)` - 删除任务

### 图片生成相关
- `window.electronAPI.generateImages(requestData)` - 生成图片
- `window.electronAPI.testConnection(apiKey)` - 测试连接

## 环境检测

组件会自动检测运行环境：
- **Electron环境**：使用IPC通信
- **Web环境**：使用HTTP请求（需要代理服务器）

```javascript
if (window.electronAPI) {
  // Electron环境，使用IPC
  result = await window.electronAPI.createVideoTask(requestData);
} else {
  // Web环境，使用HTTP请求
  const response = await fetch('/api/video/create', {...});
}
```

## 功能特性

### 1. 自动环境适配
- 在Electron中自动使用IPC通信
- 在浏览器中回退到HTTP请求
- 无需手动配置

### 2. 统一错误处理
- IPC和HTTP请求使用相同的错误格式
- 统一的成功/失败响应结构

### 3. 安全性
- 使用contextBridge安全暴露API
- 禁用nodeIntegration和enableRemoteModule
- 启用contextIsolation

## 调试技巧

### 1. 查看IPC日志
在Electron开发者工具的控制台中查看：
```
🎬 Preload: Calling create-video-task via IPC
🎬 IPC: Creating video task...
✅ IPC: Video task creation completed
```

### 2. 检查API服务
API服务的日志会显示在主进程控制台：
```
API Service: Creating video generation task with data: {...}
Video API Success: { status: 200, taskId: 'cgt-xxx' }
```

### 3. 错误排查
- 检查API Key是否正确配置
- 确认网络连接正常
- 查看控制台错误信息

## 开发注意事项

### 1. preload.js 安全性
- 只暴露必要的API方法
- 使用contextBridge而不是直接暴露require
- 验证所有输入参数

### 2. 主进程处理
- 所有IPC处理器都有错误捕获
- 统一的错误响应格式
- 详细的日志记录

### 3. 渲染进程调用
- 检查window.electronAPI是否存在
- 提供HTTP请求作为备用方案
- 统一的响应处理逻辑

## 部署说明

### 构建桌面应用
```bash
# 构建所有平台
npm run dist

# 构建特定平台
npm run dist-mac    # macOS
npm run dist-win    # Windows
npm run dist-linux  # Linux
```

### 文件结构
```
build/
├── index.html          # React应用
├── static/             # 静态资源
└── ...

public/
├── preload.js          # 预加载脚本
└── electron.js         # Electron主进程

api-service.js          # API服务
desktop-app.js          # 主应用文件
```

## 故障排除

### 常见问题

1. **"window.electronAPI is undefined"**
   - 确保在Electron环境中运行
   - 检查preload.js是否正确加载

2. **IPC调用失败**
   - 检查主进程IPC处理器是否注册
   - 查看控制台错误信息

3. **API Key问题**
   - 在设置页面重新配置API Key
   - 确认API Key有效且有足够配额

4. **网络连接问题**
   - 检查防火墙设置
   - 确认能访问火山方舟API服务器

### 日志级别
- `console.log` - 一般信息
- `console.error` - 错误信息
- IPC调用会显示详细的请求/响应日志

## 性能优化

### 1. IPC通信优化
- 避免传递大量数据
- 使用异步调用（invoke/handle）
- 合理设置超时时间

### 2. 内存管理
- 及时清理大文件引用
- 避免内存泄漏
- 监控主进程内存使用

### 3. 用户体验
- 显示加载状态
- 提供错误反馈
- 支持操作取消

这种IPC架构提供了更好的性能、安全性和用户体验，是Electron应用的推荐做法。
