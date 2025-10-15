# 开发环境启动指南

## 问题解决

如果您遇到 `net::ERR_FILE_NOT_FOUND` 错误，这通常是因为后端服务器没有正确启动。请按照以下步骤操作：

## 启动方式

### 方式一：完整开发环境（推荐）
```bash
npm run dev-full
```
这个命令会：
1. 启动后端服务器（端口3001）
2. 启动前端开发服务器（端口3000）
3. 自动配置代理

### 方式二：使用 concurrently
```bash
npm run dev-web
```
这个命令会同时启动前端和后端服务器。

### 方式三：手动启动（用于调试）
```bash
# 终端1：启动后端服务器
npm run server

# 终端2：启动前端服务器
npm start
```

## 服务器配置

- **前端服务器**：http://localhost:3000
- **后端服务器**：http://localhost:3001
- **代理配置**：
  - `/api/v3/*` → 火山方舟API服务器
  - `/api/video/*` → 本地后端服务器
  - `/api/health` → 本地后端服务器

## 功能验证

启动成功后，您可以：

1. **访问应用**：打开 http://localhost:3000
2. **检查后端**：访问 http://localhost:3001/api/health
3. **配置API Key**：在设置页面输入您的火山方舟API Key
4. **测试视频生成**：在视频生成页面创建任务

## 常见问题

### 1. 端口占用
如果端口3000或3001被占用：
```bash
# 查找占用进程
lsof -ti:3000
lsof -ti:3001

# 终止进程
kill -9 <PID>
```

### 2. 代理错误
如果出现代理错误，请确保：
- 后端服务器正在运行
- 网络连接正常
- API Key配置正确

### 3. API Key配置
- 在应用的Settings页面配置API Key
- 确保API Key有效且有足够的配额
- API Key会保存在浏览器的localStorage中

## 生产环境部署

### 构建应用
```bash
npm run build
```

### 启动生产服务器
```bash
# 启动后端服务器
PORT=3001 node server/index.js
```

构建后的静态文件会在 `build/` 目录中，后端服务器会自动提供这些静态文件。

## Electron桌面应用

### 开发模式
```bash
npm run electron-dev
```

### 构建桌面应用
```bash
npm run desktop
```

## 项目结构

```
├── src/
│   ├── components/
│   │   ├── VideoGenerator.js    # 视频生成组件
│   │   └── ...
│   ├── utils/
│   │   └── storage.js           # 本地存储工具
│   └── setupProxy.js            # 代理配置
├── server/
│   └── index.js                 # 后端服务器
├── api-service.js               # API服务封装
├── start-dev.js                 # 开发环境启动脚本
└── package.json
```

## 技术栈

- **前端**：React + Bootstrap + React-Bootstrap
- **后端**：Express.js + Node.js
- **桌面**：Electron
- **API**：火山方舟视频生成API
- **代理**：http-proxy-middleware

## 调试技巧

1. **查看网络请求**：打开浏览器开发者工具的Network标签
2. **查看控制台日志**：代理请求会在控制台显示详细日志
3. **检查API响应**：在Network标签中查看API请求和响应
4. **本地存储检查**：在Application标签中查看localStorage中的API Key

如有其他问题，请检查控制台错误信息或联系开发团队。
