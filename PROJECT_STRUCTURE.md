# 📁 项目目录结构

## 整体概览

```
volcano-ai-workshop/
├── 📄 核心配置文件
│   ├── package.json              # 项目配置和依赖
│   ├── package-lock.json         # 依赖锁定文件
│   └── README.md                 # 项目说明文档
│
├── ⚙️ 主程序文件
│   ├── desktop-app.js            # Electron主进程（生产环境）
│   ├── api-service.js            # API服务封装
│   └── signature-v4.js           # AWS Signature V4签名
│
├── 📂 public/                    # 静态资源和Electron配置
│   ├── electron.js               # Electron主进程（开发环境）
│   ├── preload.js                # Preload脚本（安全桥接）
│   ├── index.html                # HTML模板
│   ├── logo.svg                  # 应用图标
│   └── manifest.json             # Web应用清单
│
├── 📂 src/                       # React源代码
│   ├── App.js                    # React主组件
│   ├── index.js                  # React入口
│   ├── index.css                 # 全局样式
│   ├── setupProxy.js             # 开发代理配置
│   │
│   ├── components/               # React组件
│   │   ├── Header.js             # 顶部导航栏
│   │   ├── Sidebar.js            # 侧边栏菜单
│   │   ├── Dashboard.js          # 控制台
│   │   ├── ImageGenerator.js     # 🎨 图片生成
│   │   ├── VideoGenerator.js     # 🎬 视频生成
│   │   ├── MotionImitation.js    # 🎭 动作模仿
│   │   ├── SmartSearch.js        # 🔍 智能搜图
│   │   ├── Settings.js           # ⚙️ 设置
│   │   └── About.js              # ℹ️ 关于
│   │
│   └── utils/                    # 工具函数
│       └── storage.js            # 本地存储工具
│
├── 📂 scripts/                   # 辅助脚本
│   ├── start-desktop.js          # 智能启动脚本
│   ├── start-dev.js              # 开发环境启动
│   └── proxy-server.js           # 代理服务器（开发用）
│
├── 📂 server/                    # 后端服务（可选）
│   └── index.js                  # Express服务器
│
├── 📂 docs/                      # 📚 文档目录
│   ├── guides/                   # 用户指南
│   │   ├── USAGE.md              # 基本使用说明
│   │   ├── VIDEO_GENERATOR_USAGE.md # 视频生成使用
│   │   ├── IMAGE_GENERATION_GUIDE.md # 图片生成指南
│   │   ├── IMAGE_SEARCH_GUIDE.md # 智能搜图指南
│   │   └── SMART_SEARCH_GUIDE.md # 智能搜索指南
│   │
│   ├── api/                      # API文档
│   │   ├── IMAGE_SEARCH_IMPLEMENTATION.md # 图像搜索实现
│   │   ├── JIMENG_I2I_30_INTEGRATION.md # 即梦图生图集成
│   │   ├── gerenrate-image.md    # 图片生成API
│   │   └── 向量库/               # 向量数据库文档
│   │       ├── 向量化计算(Embedding).md
│   │       ├── 多模态检索-SearchByMultiModal.md
│   │       └── 数据写入-UpsertData.md
│   │
│   ├── dev/                      # 开发文档
│   │   ├── DEVELOPMENT_GUIDE.md  # 开发指南
│   │   ├── ELECTRON_STARTUP_GUIDE.md # Electron启动指南
│   │   └── IPC_SETUP_GUIDE.md    # IPC设置指南
│   │
│   ├── changelog/                # 更新日志
│   │   ├── RELEASE_NOTES.md      # 发布说明
│   │   ├── UPDATE_LOG.md         # 更新日志
│   │   ├── API_INTEGRATION_SUMMARY.md # API集成总结
│   │   ├── IMAGE_SEARCH_SUMMARY.md # 图像搜索总结
│   │   ├── SMART_SEARCH_UPDATE.md # 智能搜索更新
│   │   ├── IMAGE_SEARCH_UPDATE.md # 图像搜索更新
│   │   ├── PACKAGING_FIX.md      # 打包修复
│   │   ├── TOS_403_FIX.md        # TOS 403错误修复
│   │   ├── SMART_SEARCH_BUGFIX.md # 智能搜索Bug修复
│   │   └── MOTION_IMITATION_*.md # 动作模仿相关更新
│   │
│   └── zh-CN/                    # 中文文档
│       ├── 即梦4.0.md
│       ├── 即梦文生图3.1.md
│       ├── 即梦图生图3.0智能参考.md
│       ├── 即梦AI-视频生成3.0 Pro.md
│       ├── 即梦动作模仿.md
│       ├── 单图视频驱动.md
│       ├── jimeng-i2i-30-guide.md
│       ├── jimeng30pro-video-guide.md
│       ├── video.md
│       ├── video_task_info.md
│       └── list_tasks.md
│
├── 📂 build/                     # 构建输出（React）
│   ├── index.html
│   ├── static/
│   └── ...
│
└── 📂 dist/                      # 打包输出（Electron）
    ├── 火山AI创作工坊.app        # macOS应用
    ├── *.dmg                     # macOS安装包
    └── ...
```

## 目录说明

### 核心文件

| 文件 | 说明 |
|------|------|
| `desktop-app.js` | Electron 主进程，生产环境使用 |
| `api-service.js` | 统一的 API 服务封装层 |
| `signature-v4.js` | AWS Signature V4 签名算法实现 |
| `package.json` | 项目配置、依赖管理、脚本命令 |

### public/ - 静态资源

| 文件 | 说明 |
|------|------|
| `electron.js` | Electron 主进程，开发环境使用 |
| `preload.js` | Preload 脚本，安全地桥接主进程和渲染进程 |
| `index.html` | HTML 模板 |
| `logo.svg` | 应用图标 |

### src/ - React 源代码

#### 主要组件

| 组件 | 功能 |
|------|------|
| `ImageGenerator.js` | 🎨 AI 图片生成（Seedream 4.0、即梦系列） |
| `VideoGenerator.js` | 🎬 AI 视频生成（文生视频、图生视频） |
| `MotionImitation.js` | 🎭 动作模仿（视频驱动角色动画） |
| `SmartSearch.js` | 🔍 智能搜图（以图搜图、以文搜图） |
| `Settings.js` | ⚙️ 设置页面（API Key 配置） |
| `Dashboard.js` | 📊 控制台（统计信息、快速操作） |

### scripts/ - 辅助脚本

| 脚本 | 说明 |
|------|------|
| `start-desktop.js` | 智能启动脚本，自动检查构建状态 |
| `start-dev.js` | 开发环境启动脚本 |
| `proxy-server.js` | 开发用代理服务器 |

### docs/ - 文档目录

#### docs/guides/ - 用户指南
面向最终用户的使用说明文档。

#### docs/api/ - API 文档
API 接口说明、集成文档、技术实现细节。

#### docs/dev/ - 开发文档
面向开发者的技术文档、架构说明、开发指南。

#### docs/changelog/ - 更新日志
版本更新记录、Bug 修复、功能改进说明。

#### docs/zh-CN/ - 中文文档
中文技术文档和指南。

## 构建和打包

### 开发环境

```bash
npm run dev          # 开发模式
npm run electron-dev # React热重载 + Electron
```

### 构建

```bash
npm run build        # 构建React应用到build/
```

### 打包

```bash
npm run dist         # 打包到dist/（当前平台）
npm run dist-mac     # 打包macOS版本
npm run dist-win     # 打包Windows版本
npm run dist-linux   # 打包Linux版本
```

## 文件命名规范

- **组件文件**: PascalCase (如 `ImageGenerator.js`)
- **工具文件**: camelCase (如 `storage.js`)
- **配置文件**: kebab-case (如 `start-desktop.js`)
- **文档文件**: SCREAMING_SNAKE_CASE (如 `README.md`)

## Git 忽略

以下目录在 `.gitignore` 中被忽略，不会提交到版本库：

- `node_modules/` - NPM 依赖包
- `build/` - React 构建输出
- `dist/` - Electron 打包输出
- `.DS_Store` - macOS 系统文件

## 快速导航

### 我想要...

| 需求 | 查看文件 |
|------|---------|
| 了解项目功能 | `README.md` |
| 学习如何使用 | `docs/guides/USAGE.md` |
| 了解 API 接口 | `docs/api/*.md` |
| 参与开发 | `docs/dev/DEVELOPMENT_GUIDE.md` |
| 查看更新记录 | `docs/changelog/UPDATE_LOG.md` |
| 修改主进程逻辑 | `desktop-app.js` 或 `public/electron.js` |
| 修改 API 调用 | `api-service.js` |
| 添加新组件 | `src/components/` |
| 修改样式 | `src/index.css` 或各组件内联样式 |

## 注意事项

1. **不要直接修改 build/ 和 dist/** - 这些是自动生成的目录
2. **修改源码后需要重新构建** - 运行 `npm run build`
3. **IPC 接口修改需要同步三处** - `desktop-app.js`、`preload.js`、组件代码
4. **文档更新要及时** - 代码变更后更新相关文档

## 维护指南

### 添加新功能

1. 在 `src/components/` 创建新组件
2. 在 `desktop-app.js` 添加 IPC handler
3. 在 `preload.js` 暴露 IPC 接口
4. 在 `api-service.js` 添加 API 调用
5. 更新文档

### 添加新文档

- 用户指南 → `docs/guides/`
- API 文档 → `docs/api/`
- 开发文档 → `docs/dev/`
- 更新日志 → `docs/changelog/`
- 中文文档 → `docs/zh-CN/`

---

**最后更新**: 2025-10-15  
**维护者**: Development Team

