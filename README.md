# 🌋 火山AI创作工坊

基于 Electron + React + Bootstrap 构建的全功能 AI 创作桌面应用，集成火山引擎多模态 AI 能力。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/electron-38.1.2-blue.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)

## ✨ 核心功能

### 🎨 AI 图片生成
- ✅ **文生图** (Text-to-Image): 使用文字描述生成高质量图片
- ✅ **图生图** (Image-to-Image): 基于参考图片生成新图片
- ✅ **智能编辑**: 精准执行编辑指令，保持图像完整性
- ✅ **多图融合**: 最多支持 10 张参考图混合生成
- ✅ **组图生成**: 一次生成最多 15 张连续图片
- ✅ **4K 分辨率**: 支持高清输出（1K/2K/4K）

#### 支持的模型
- **Seedream 4.0** (推荐): 支持文生图、图生图、组图生成
- **即梦AI 4.0** ⭐: 文生图、图生图、多图融合，支持4K，组图生成
- **即梦图生图 3.0** 🖼️: 图生图编辑专用，精准执行编辑指令
- **即梦文生图 3.1** 🎨: 画面美感升级，风格精准多样，细节丰富

### 🎬 AI 视频生成
- ✅ **文生视频** (Text-to-Video): 文字描述生成动态视频
- ✅ **图生视频** (Image-to-Video): 静态图片转动态视频
- ✅ **即梦 3.0 Pro**: 支持自定义帧数和宽高比
- ✅ **任务管理**: 实时查看生成进度和状态
- ✅ **批量操作**: 支持批量查询和删除

### 🎭 动作模仿
- ✅ **视频驱动**: 使用驱动视频生成角色动画
- ✅ **单图生成**: 上传静态图片创建动态角色
- ✅ **实时预览**: 任务状态实时更新
- ✅ **URL 支持**: 支持在线视频链接

### 🔍 智能搜图
- ✅ **以图搜图**: 上传图片查找相似图片
- ✅ **以文搜图**: 使用文字描述搜索图片
- ✅ **多模态搜索**: 结合图片和文字进行混合搜索
- ✅ **向量数据库**: 本地向量库管理和持久化
- ✅ **余弦相似度**: 高精度相似度计算
- ✅ **搜索历史**: 自动记录搜索历史

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0
- **操作系统**: Windows / macOS / Linux

### 1. 克隆项目

```bash
git clone https://github.com/bolecodex/volcano-ai-workshop.git
cd volcano-ai-workshop
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 API 密钥

启动应用后，进入"设置"页面配置以下密钥：

- **ARK API Key**: 用于图片生成（Seedream 4.0）
- **Access Key ID / Secret Access Key**: 用于即梦系列、视频生成、动作模仿等功能

### 4. 启动应用

#### 推荐方式（智能启动）
```bash
npm run app
# 或
npm run launch
```

#### 其他启动方式
```bash
# 构建并启动
npm run desktop

# 快速启动（跳过构建）
npm run desktop-quick

# 开发模式
npm run dev
npm run desktop-dev
```

## 📦 打包分发

### 打包当前平台
```bash
npm run dist
```

### 打包特定平台
```bash
npm run dist-mac    # macOS (DMG + ZIP)
npm run dist-win    # Windows (NSIS)
npm run dist-linux  # Linux (AppImage)
```

打包文件输出到 `dist/` 目录。

## 🏗️ 技术架构

### 核心技术栈
- **前端框架**: React 18.2.0
- **UI 库**: Bootstrap 5.2.3 + React-Bootstrap 2.7.0
- **桌面框架**: Electron 38.1.2
- **构建工具**: React Scripts 5.0.1
- **打包工具**: Electron Builder 23.6.0

### IPC 通信架构

应用采用安全的 IPC (Inter-Process Communication) 架构：

```
┌─────────────────┐         ┌──────────────────┐
│  渲染进程 (React) │ ←──IPC──→ │  主进程 (Node.js) │
│  用户界面        │         │  API 服务        │
└─────────────────┘         └──────────────────┘
         ↓                            ↓
    Preload.js                  api-service.js
    (安全桥接)                   (API 调用)
```

### 已实现的 IPC 接口

#### 图片生成
- `generateImages` - 同步生成图片 (Seedream 4.0)
- `submitJimeng40Task` - 提交即梦 4.0 任务
- `queryJimeng40Task` - 查询即梦 4.0 任务
- `submitJimeng31Task` - 提交即梦 3.1 任务
- `queryJimeng31Task` - 查询即梦 3.1 任务
- `submitJimengI2I30Task` - 提交即梦图生图 3.0 任务
- `queryJimengI2I30Task` - 查询即梦图生图 3.0 任务

#### 视频生成
- `createVideoTask` - 创建视频生成任务
- `getVideoTask` - 获取单个任务信息
- `getVideoTasks` - 批量查询任务
- `deleteVideoTask` - 删除任务
- `submitJimeng30ProVideoTask` - 提交即梦 3.0 Pro 视频任务
- `queryJimeng30ProVideoTask` - 查询即梦 3.0 Pro 视频任务

#### 动作模仿
- `submitMotionImitationTask` - 提交动作模仿任务
- `queryMotionImitationTask` - 查询任务结果

#### 向量搜索
- `imageEmbedding` - 图像向量化
- `searchByMultiModal` - 多模态检索
- `computeEmbedding` - 向量化计算
- `upsertVectorData` - 数据写入
- `getTosPreSignedUrl` - 生成 TOS 预签名 URL

#### 系统功能
- `uploadToTOS` - 文件上传到对象存储
- `testConnection` - 测试 API 连接
- `getAppInfo` - 获取应用信息

## 📁 项目结构

```
volcano-ai-workshop/
├── desktop-app.js              # Electron 主进程（生产）
├── start-desktop.js            # 智能启动脚本
├── api-service.js              # API 服务封装
├── signature-v4.js             # AWS Signature V4 签名
├── public/
│   ├── electron.js            # Electron 主进程（开发）
│   ├── preload.js             # Preload 脚本（安全桥接）
│   ├── index.html             # HTML 模板
│   └── logo.svg               # 应用图标
├── src/
│   ├── App.js                 # React 主组件
│   ├── index.js               # React 入口
│   ├── index.css              # 全局样式
│   ├── components/            # React 组件
│   │   ├── Header.js          # 顶部导航栏
│   │   ├── Sidebar.js         # 侧边栏菜单
│   │   ├── Dashboard.js       # 控制台
│   │   ├── ImageGenerator.js  # 图片生成
│   │   ├── VideoGenerator.js  # 视频生成
│   │   ├── MotionImitation.js # 动作模仿
│   │   ├── SmartSearch.js     # 智能搜图
│   │   ├── Settings.js        # 设置页面
│   │   └── About.js           # 关于页面
│   └── utils/
│       └── storage.js         # 本地存储工具
├── docs/                      # 文档目录
│   ├── IMAGE_GENERATION_GUIDE.md
│   ├── IMAGE_SEARCH_GUIDE.md
│   ├── VIDEO_GENERATOR_USAGE.md
│   └── ...
├── build/                     # 构建输出（React）
├── dist/                      # 打包输出（Electron）
└── node_modules/              # 依赖包
```

## 🔒 安全特性

- ✅ **Context Isolation**: 渲染进程和主进程完全隔离
- ✅ **Node Integration**: 禁用，防止 XSS 攻击
- ✅ **Remote Module**: 禁用，防止远程代码执行
- ✅ **Preload 脚本**: 安全的 API 桥接
- ✅ **防 eval()**: 禁止执行动态代码
- ✅ **拖拽防护**: 防止恶意文件拖拽
- ✅ **外部链接**: 阻止未授权的新窗口

## 🎯 使用指南

### 图片生成

#### 1. Seedream 4.0（推荐，无需 AccessKey）
- 支持文生图、图生图、多图融合
- 支持 1-10 张参考图
- 支持组图生成（最多 15 张）
- 支持流式输出

#### 2. 即梦 AI 4.0
- 需要配置 AccessKey
- 支持 4K 分辨率
- 画质更高，细节更丰富

#### 3. 即梦图生图 3.0
- 专注于图片编辑
- 精准执行编辑指令
- 保持图像完整性
- 支持编辑强度调节（0-1）

#### 4. 即梦文生图 3.1
- 画面美感升级
- 风格精准多样
- 细节更加丰富

### 视频生成

1. 选择生成模式（文生视频 / 图生视频）
2. 输入提示词或上传图片
3. 配置视频参数（分辨率、回调 URL）
4. 提交任务
5. 在任务列表中查看进度

### 动作模仿

1. 上传参考图片（角色静态图）
2. 提供驱动视频 URL
3. 提交任务
4. 等待生成完成
5. 下载结果视频

### 智能搜图

#### 建立向量库
1. 进入"智能搜图" → "向量库"
2. 点击"添加图片"
3. 上传图片并添加描述
4. 系统自动生成向量

#### 搜索图片
1. 切换到"搜索"标签
2. 选择搜索模式：
   - 以图搜图
   - 以文搜图
   - 混合搜索
3. 输入查询内容
4. 查看搜索结果和相似度

## 📚 详细文档

- 📖 [图片生成完整指南](docs/IMAGE_GENERATION_GUIDE.md)
- 📖 [视频生成使用手册](docs/VIDEO_GENERATOR_USAGE.md)
- 📖 [智能搜图指南](docs/IMAGE_SEARCH_GUIDE.md)
- 📖 [即梦图生图 3.0 集成文档](docs/JIMENG_I2I_30_INTEGRATION.md)
- 📖 [开发指南](docs/DEVELOPMENT_GUIDE.md)
- 📖 [使用手册](USAGE.md)

## 🔧 常见问题

### Q1: 应用无法启动？
**A**: 
1. 确认已安装依赖：`npm install`
2. 检查 Node.js 版本 >= 14.0.0
3. 删除 `node_modules` 重新安装

### Q2: API 调用失败？
**A**:
1. 检查网络连接
2. 验证 API Key 是否正确
3. 确认是否配置了 AccessKey（即梦系列需要）
4. 查看开发者工具控制台的错误信息

### Q3: 图片生成报错"No handler registered"？
**A**: 
- 已修复！确保使用最新版本
- 如仍有问题，重启应用

### Q4: 如何切换到开发模式？
**A**:
```bash
npm run desktop-dev  # 开发模式，不需要构建
```

### Q5: 打包后的应用很大？
**A**:
- 正常现象，包含了完整的 Electron 和 Node.js 运行时
- macOS 约 150-200 MB
- Windows 约 100-150 MB

## 🛠️ 开发说明

### 添加新的 IPC 接口

#### 1. 在主进程注册（public/electron.js）
```javascript
ipcMain.handle('your-new-function', async (event, requestData) => {
  try {
    const result = await apiService.yourNewFunction(requestData);
    return result;
  } catch (error) {
    return {
      success: false,
      error: { message: error.message }
    };
  }
});
```

#### 2. 在 Preload 暴露（public/preload.js）
```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  yourNewFunction: (requestData) => {
    return ipcRenderer.invoke('your-new-function', requestData);
  }
});
```

#### 3. 在 API 服务实现（api-service.js）
```javascript
async yourNewFunction(requestData) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { /* ... */ },
    body: JSON.stringify(requestData)
  });
  return await response.json();
}
```

#### 4. 在组件中使用
```javascript
const result = await window.electronAPI.yourNewFunction(data);
```

### 热重载开发

```bash
# 启动 React 开发服务器（端口 3000）
npm start

# 另一个终端启动 Electron（监听 3000 端口）
npm run electron-dev
```

## 📝 脚本命令

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 React 开发服务器 |
| `npm run build` | 构建 React 应用 |
| `npm run app` | 智能启动桌面应用 |
| `npm run launch` | 同 app |
| `npm run desktop` | 构建 + 启动 |
| `npm run desktop-quick` | 快速启动（跳过构建） |
| `npm run desktop-dev` | 开发模式启动 |
| `npm run electron-dev` | React 热重载 + Electron |
| `npm run dist` | 打包当前平台 |
| `npm run dist-mac` | 打包 macOS |
| `npm run dist-win` | 打包 Windows |
| `npm run dist-linux` | 打包 Linux |

## 🎉 最近更新

### v1.0.1 (2025-10-15)
- ✅ 修复即梦图生图 3.0 的 IPC handler 注册问题
- ✅ 添加所有缺失的 20 个 IPC handlers
- ✅ 删除 Seedream 3.0 T2I 和 SeedEdit 3.0 I2I 模型
- ✅ 优化代码结构，减小打包体积
- ✅ 完善文档和使用指南

### v1.0.0
- 🎨 完整的图片生成功能
- 🎬 视频生成和任务管理
- 🎭 动作模仿功能
- 🔍 智能搜图功能
- 🖥️ 原生桌面应用体验

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献流程
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [React](https://reactjs.org/) - 用户界面库
- [Bootstrap](https://getbootstrap.com/) - UI 组件库
- [火山引擎](https://www.volcengine.com/) - AI 能力提供商

## 📞 联系方式

- **项目地址**: https://github.com/bolecodex/volcano-ai-workshop
- **问题反馈**: [Issues](https://github.com/bolecodex/volcano-ai-workshop/issues)
- **功能建议**: [Discussions](https://github.com/bolecodex/volcano-ai-workshop/discussions)

---

**✨ 享受 AI 创作的乐趣！**

如果这个项目对你有帮助，请给一个 ⭐️ Star 支持一下！

**享受使用 AI 图片生成器的乐趣！** 🎉