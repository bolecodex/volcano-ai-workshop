# 🚀 快速启动指南

## 从 Electron 桌面版迁移到 Web 版

本项目已从 Electron 桌面应用升级为纯 Web 应用。所有功能保持不变，但运行方式有所改变。

## 🔄 主要变化

### 架构变化
- **旧版**: Electron 桌面应用（前后端一体）
- **新版**: React 前端 + Express 后端（前后端分离）

### 启动方式变化
- **旧版**: `npm run desktop` 或 `npm run app`
- **新版**: `npm run dev` 或 `npm run prod`

### 访问方式变化
- **旧版**: 桌面应用窗口
- **新版**: 浏览器访问 `http://localhost:3000` 或 `http://localhost:3001`

## 📦 安装依赖

由于移除了 Electron 相关依赖，建议重新安装依赖：

```bash
# 删除旧的依赖
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

## 🎯 启动应用

### 方式一：开发模式（推荐）

```bash
npm run dev
```

这会同时启动：
- React 开发服务器（端口 3000）
- Express 后端服务器（端口 3001）

访问 `http://localhost:3000`

### 方式二：生产模式

```bash
npm run prod
```

或者

```bash
npm run serve
```

这会先构建 React 应用，然后启动 Express 服务器。

访问 `http://localhost:3001`

### 方式三：分别启动

#### 启动前端（开发模式）
```bash
npm start
```
访问 `http://localhost:3000`

#### 启动后端
```bash
npm run server
```
后端运行在 `http://localhost:3001`

## 🔧 配置

### API 密钥配置

启动应用后，进入"设置"页面配置：

1. **ARK API Key**: 用于 Seedream 4.0 图片生成
2. **Access Key ID**: 用于即梦系列功能
3. **Secret Access Key**: 用于即梦系列功能
4. **TOS Bucket**: 用于文件上传（可选）
5. **向量库配置**: 用于智能搜图（可选）

配置会自动保存到浏览器的 LocalStorage 中。

### 环境变量（可选）

创建 `.env` 文件配置环境变量：

```env
# API 基础 URL（前端使用）
REACT_APP_API_URL=http://localhost:3001

# 后端端口
PORT=3001
```

## ✨ 功能验证

启动应用后，验证以下功能是否正常：

1. ✅ 图片生成（Seedream 4.0 或即梦系列）
2. ✅ 视频生成
3. ✅ 动作模仿
4. ✅ 数字人
5. ✅ 智能绘图
6. ✅ 视频编辑
7. ✅ 智能搜图

## 🐛 常见问题

### 1. 端口被占用

**错误**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决**:
```bash
# 查找占用端口的进程
lsof -ti:3000

# 杀死进程
kill -9 $(lsof -ti:3000)

# 或使用不同端口
PORT=3002 npm run server
```

### 2. API 调用失败

**症状**: 前端页面显示，但 API 调用失败

**检查**:
1. 后端服务器是否正常运行
2. 查看后端终端的日志输出
3. 检查浏览器控制台的网络请求
4. 确认 API 密钥配置正确

**解决**:
```bash
# 确保后端正在运行
npm run server

# 检查健康状态
curl http://localhost:3001/api/health
```

### 3. 无法访问应用

**检查**:
1. 确认服务器已启动
2. 检查防火墙设置
3. 尝试使用 `127.0.0.1` 替代 `localhost`

### 4. 构建失败

**解决**:
```bash
# 清理缓存
rm -rf node_modules build package-lock.json

# 重新安装依赖
npm install

# 重新构建
npm run build
```

## 🚀 下一步

1. 配置 API 密钥
2. 尝试生成第一张图片
3. 探索其他 AI 功能
4. 查看详细文档了解高级功能

## 📚 更多资源

- [完整文档](README.md)
- [API 文档](docs/api/)
- [用户指南](docs/guides/)
- [故障排除](docs/troubleshooting/)

## 💡 提示

- **开发模式**适合开发和调试，支持热重载
- **生产模式**适合正式使用，性能更好
- 建议使用现代浏览器（Chrome, Firefox, Edge）以获得最佳体验
- 可以在局域网内其他设备访问（需要使用服务器 IP 地址）

---

**祝您使用愉快！** 🎉

如有问题，请查看 [Issues](https://github.com/bolecodex/volcano-ai-workshop/issues) 或提交新的 Issue。

