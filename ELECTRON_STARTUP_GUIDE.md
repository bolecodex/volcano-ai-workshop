# Electron应用启动指南

## 问题诊断

如果您看到 `POST file:///api/video/create net::ERR_FILE_NOT_FOUND` 错误，这说明您当前在**浏览器**中运行应用，而不是在**Electron桌面应用**中。

## 正确的启动方式

### 方式一：开发模式（推荐用于开发）
```bash
npm run electron-dev
```
这会：
1. 启动React开发服务器（http://localhost:3000）
2. 等待服务器就绪后启动Electron应用
3. Electron会加载React应用并提供IPC功能

### 方式二：生产模式（推荐用于测试）
```bash
# 使用提供的脚本
./start-electron.sh

# 或者手动执行
npm run build
npx electron .
```

### 方式三：快速启动（如果已经构建过）
```bash
npm run desktop-quick
```

## 如何确认运行环境

### 在Electron中运行的标志：
1. **窗口标题**：显示"AI 图片生成器"
2. **菜单栏**：有原生的应用菜单
3. **控制台日志**：会显示IPC相关日志
4. **环境检测**：控制台会显示 `🖥️ 使用Electron IPC通信`

### 在浏览器中运行的标志：
1. **地址栏**：显示 `http://localhost:3000`
2. **控制台日志**：显示 `🌐 使用Web HTTP请求`
3. **错误信息**：`net::ERR_FILE_NOT_FOUND`

## 调试步骤

### 1. 检查环境
打开开发者工具（F12），在控制台中输入：
```javascript
console.log('Electron API:', !!window.electronAPI);
console.log('User Agent:', navigator.userAgent);
```

### 2. 查看启动日志
正确启动Electron时，您应该看到：
```
🚀 Electron app is ready
🔧 Setting up IPC handlers...
✅ IPC handlers setup completed
🚀 Creating Electron desktop window...
✅ Desktop application is ready!
```

### 3. 测试IPC功能
在Electron应用的控制台中测试：
```javascript
// 测试IPC是否可用
window.electronAPI.getAppInfo().then(console.log);
```

## 常见问题解决

### 问题1：`npm run electron-dev` 失败
**解决方案：**
```bash
# 确保依赖已安装
npm install

# 清理缓存
npm run build
rm -rf node_modules/.cache

# 重新启动
npm run electron-dev
```

### 问题2：Electron窗口空白
**解决方案：**
```bash
# 确保React应用已构建
npm run build

# 检查build目录是否存在
ls -la build/

# 重新启动
npx electron .
```

### 问题3：IPC方法不存在
**检查项：**
1. 确保 `public/preload.js` 文件存在
2. 确保 `desktop-app.js` 中的IPC处理器已注册
3. 重新构建应用

### 问题4：API Key配置问题
**解决方案：**
1. 在Electron应用中打开Settings页面
2. 输入有效的火山方舟API Key
3. 点击保存
4. 返回视频生成页面测试

## 开发工作流

### 推荐的开发流程：
1. **开发前端**：使用 `npm start` 在浏览器中开发UI
2. **测试功能**：使用 `npm run electron-dev` 在Electron中测试
3. **构建发布**：使用 `npm run dist` 构建发布版本

### 文件监控：
- 修改React组件后，Electron会自动重新加载
- 修改主进程文件（desktop-app.js）后，需要重启Electron

## 性能提示

### 开发模式优化：
- 使用 `npm run electron-dev` 进行热重载开发
- 避免频繁重启Electron主进程

### 生产模式优化：
- 使用 `npm run build` 构建优化版本
- 使用 `npx electron .` 启动生产版本

## 验证清单

启动应用后，请验证：
- [ ] 应用在独立窗口中运行（不是浏览器标签页）
- [ ] 控制台显示 `🖥️ 使用Electron IPC通信`
- [ ] 可以在Settings中配置API Key
- [ ] 视频生成功能正常工作
- [ ] 没有 `net::ERR_FILE_NOT_FOUND` 错误

如果所有项目都通过验证，说明Electron应用已正确启动并可以使用IPC功能。
