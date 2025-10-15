# AI 图片生成器桌面应用

基于 Electron + React + Bootstrap 构建的 AI 图片生成桌面应用，使用 Node.js 作为本地处理方法，通过 IPC 进行前后端通信。

## 🚀 功能特点

- 🎨 **AI 图片生成**: 
  - ✅ 文生图（Text-to-Image）
  - ✅ 图生图（Image-to-Image）
  - ✅ 多图融合（最多10张参考图）
  - ✅ 组图生成（最多15张连续图片）
  - ✅ 支持 Seedream 4.0、3.0 和 SeedEdit 3.0 模型
- 🎬 **AI 视频生成**:
  - ✅ 文生视频（Text-to-Video）
  - ✅ 图生视频（Image-to-Video）
  - ✅ 支持多种视频模型
  - ✅ 任务管理和进度跟踪
- 🔍 **智能搜图** (🆕):
  - ✅ 以图搜图（Image-to-Image Search）
  - ✅ 以文搜图（Text-to-Image Search）
  - ✅ 多模态混合搜索
  - ✅ 本地向量数据库管理
  - ✅ 余弦相似度计算
  - ✅ 搜索历史记录
- 🎭 **动作模仿**:
  - ✅ 视频驱动角色动画
  - ✅ 单图视频生成
- 🖥️ **桌面应用**: 原生桌面体验，无需浏览器
- 🔒 **安全通信**: 使用 IPC 进行安全的前后端数据交互
- 📱 **跨平台**: 支持 Windows、macOS 和 Linux
- 🎯 **用户友好**: 现代化 UI 设计，操作简单直观

## 🛠️ 技术架构

- **前端**: React + Bootstrap + React-Bootstrap
- **桌面框架**: Electron
- **通信方式**: IPC (Inter-Process Communication)
- **API 服务**: Node.js + node-fetch
- **构建工具**: React Scripts + Electron Builder

## 📦 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动桌面应用

使用智能启动脚本（推荐）：
```bash
npm run app
# 或
npm run launch
```

手动启动：
```bash
# 构建并启动
npm run desktop

# 仅启动（需要先构建）
npm run desktop-quick

# 开发模式
npm run dev
```

### 3. 开发模式

```bash
# 启动开发服务器 + Electron
npm run electron-dev

# 仅开发模式 Electron
npm run desktop-dev
```

## 📋 脚本说明

| 脚本 | 描述 |
|------|------|
| `npm run app` | 智能启动桌面应用（自动检查构建） |
| `npm run launch` | 同 app 命令 |
| `npm run desktop` | 构建并启动桌面应用 |
| `npm run desktop-dev` | 开发模式启动 |
| `npm run desktop-quick` | 快速启动（跳过构建） |
| `npm run dev` | 开发模式 |
| `npm run build` | 构建 React 应用 |
| `npm run dist` | 打包桌面应用 |

## 📦 打包分发

### 打包所有平台
```bash
npm run dist
```

### 打包特定平台
```bash
npm run dist-mac    # macOS
npm run dist-win    # Windows
npm run dist-linux  # Linux
```

## 🔄 IPC 通信架构

应用使用 Electron 的 IPC 机制进行安全的前后端通信：

### 主进程 (desktop-app.js)
- 处理窗口管理
- 注册 IPC 处理器
- 调用 API 服务

### 渲染进程 (React 应用)
- 用户界面
- 通过 electronAPI 调用主进程功能

### Preload 脚本 (public/preload.js)
- 安全地暴露 IPC 接口
- 防止直接访问 Node.js API

### 可用的 IPC 接口

```javascript
// 图片生成
window.electronAPI.generateImages(requestData)

// 连接测试
window.electronAPI.testConnection(apiKey)

// 获取应用信息
window.electronAPI.getAppInfo()

// 文件对话框
window.electronAPI.showSaveDialog(options)
window.electronAPI.showOpenDialog(options)

// 系统通知
window.electronAPI.showNotification(options)
```

## 📁 项目结构

```
hs_demo/
├── desktop-app.js          # Electron 主进程
├── start-desktop.js        # 智能启动脚本
├── api-service.js          # API 服务层
├── public/
│   ├── preload.js         # Preload 脚本
│   └── electron.js        # 备用 Electron 配置
├── src/
│   ├── App.js             # React 主组件
│   ├── components/        # React 组件
│   │   ├── Header.js      # 头部组件
│   │   ├── Sidebar.js     # 侧边栏组件
│   │   ├── Dashboard.js   # 仪表板组件
│   │   ├── ImageGenerator.js # 图片生成组件
│   │   ├── VideoGenerator.js # 视频生成组件
│   │   ├── MotionImitation.js # 动作模仿组件
│   │   ├── ImageSearch.js # 智能搜图组件 (🆕)
│   │   ├── Settings.js    # 设置组件
│   │   └── About.js       # 关于组件
│   └── utils/             # 工具函数
├── docs/                  # 文档目录
│   ├── IMAGE_SEARCH_GUIDE.md # 智能搜图使用指南 (🆕)
│   ├── IMAGE_SEARCH_IMPLEMENTATION.md # 技术实现文档 (🆕)
│   └── IMAGE_SEARCH_UPDATE.md # 更新说明 (🆕)
├── build/                 # 构建输出
└── dist/                  # 打包输出
```

## 🔍 智能搜图功能 (🆕)

### 功能概述
智能搜图集成了火山引擎的图像向量化 API，支持多模态图像检索。

### 核心特性
- **以图搜图**: 上传图片查找相似图片
- **以文搜图**: 使用文字描述搜索图片
- **混合搜索**: 结合图片和文字进行搜索
- **向量数据库**: 本地向量库管理和持久化
- **相似度计算**: 余弦相似度算法
- **搜索历史**: 自动记录搜索历史

### 快速开始

#### 1. 配置 API Key
进入"设置"页面，配置火山引擎 ARK API Key。

#### 2. 建立向量库
1. 进入"智能搜图"页面
2. 切换到"向量库"标签页
3. 点击"添加图片"
4. 上传图片并添加描述

#### 3. 开始搜索
1. 切换到"搜索"标签页
2. 选择搜索模式
3. 上传图片或输入描述
4. 查看搜索结果

### 技术细节
- **API**: `https://ark.cn-beijing.volces.com/api/v3/embeddings/multimodal`
- **模型**: `doubao-embedding-vision-250615`
- **向量维度**: 1024 或 2048 维
- **相似度算法**: 余弦相似度（Cosine Similarity）
- **数据存储**: 本地 localStorage

### 支持格式
- **图片**: JPEG, PNG, WebP, BMP 等（最大 10MB）
- **视频**: MP4, AVI, MOV（最大 50MB）
- **文本**: UTF-8 编码（最大 100,000 字节）

### 详细文档
- [智能搜图使用指南](./docs/IMAGE_SEARCH_GUIDE.md)
- [技术实现文档](./docs/IMAGE_SEARCH_IMPLEMENTATION.md)
- [更新说明](./docs/IMAGE_SEARCH_UPDATE.md)

## 🔒 安全特性

- ✅ Context Isolation 启用
- ✅ Node Integration 禁用
- ✅ Remote Module 禁用
- ✅ 防止 eval() 执行
- ✅ 外部链接安全处理
- ✅ 文件拖拽防护

## 🛠️ 开发说明

### 添加新的 IPC 接口

1. 在 `desktop-app.js` 中添加 IPC 处理器：
```javascript
ipcMain.handle('your-function', async (event, data) => {
  // 处理逻辑
  return result;
});
```

2. 在 `public/preload.js` 中暴露接口：
```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  yourFunction: (data) => ipcRenderer.invoke('your-function', data)
});
```

3. 在 React 组件中使用：
```javascript
const result = await window.electronAPI.yourFunction(data);
```

## 🎨 界面预览

应用包含以下主要界面：

- **仪表板**: 显示系统状态、统计信息和快速操作
- **图片生成**: AI 图片生成功能，支持文生图、图生图、多图融合、组图生成
- **视频生成**: AI 视频生成功能，支持文生视频、图生视频、任务管理
- **设置**: 应用配置选项，包括 API 密钥管理
- **关于**: 应用信息、技术栈和系统信息

## 📚 详细文档

- **[图片生成完整指南](docs/IMAGE_GENERATION_GUIDE.md)**: 图片生成 API 的详细使用说明
- **[视频生成使用指南](VIDEO_GENERATOR_USAGE.md)**: 视频生成功能说明
- **[开发指南](DEVELOPMENT_GUIDE.md)**: 开发和贡献指南
- **[使用手册](USAGE.md)**: 基本使用说明

## 🔧 故障排除

### 常见问题

1. **应用无法启动**
   - 确保已安装所有依赖：`npm install`
   - 检查 Node.js 版本是否兼容

2. **构建失败**
   - 清理缓存：`npm run build -- --reset-cache`
   - 删除 node_modules 重新安装

3. **IPC 通信失败**
   - 检查 preload.js 是否正确加载
   - 确认 contextIsolation 设置

4. **API 调用失败**
   - 检查网络连接
   - 验证 API Key 是否有效
   - 查看控制台错误信息

## 🚀 部署

### 开发环境
```bash
# 启动开发模式
npm run dev
```

### 生产环境
```bash
# 构建并启动
npm run app
```

### 打包分发
```bash
# 打包当前平台
npm run dist

# 打包所有平台
npm run dist-mac
npm run dist-win
npm run dist-linux
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 支持

如有问题或建议，请：

1. 查看项目文档
2. 创建新的 Issue
3. 联系开发团队

---

**享受使用 AI 图片生成器的乐趣！** 🎉