# 📋 版本变更日志 - v2.0.0

## 🎉 v2.0.0 - Web 版本重大升级 (2025-10-18)

这是一个重大架构升级版本，将项目从 Electron 桌面应用转换为纯 Web 应用。

### 🚀 架构变更

#### 移除的技术
- ❌ Electron 38.1.2（桌面框架）
- ❌ Electron Builder（打包工具）
- ❌ IPC 通信机制
- ❌ Preload 脚本
- ❌ 主进程/渲染进程分离

#### 新增的技术
- ✅ Express 5.1.0（后端框架）
- ✅ RESTful API 架构
- ✅ HTTP 客户端（Fetch API）
- ✅ CORS 支持
- ✅ 前后端分离架构

### 📦 文件变更

#### 新增文件
- `server/index.js` - Express 后端服务器（完整的 API 路由）
- `src/utils/apiClient.js` - 前端 API 客户端（替代 IPC）
- `QUICKSTART.md` - 快速启动指南
- `MIGRATION.md` - 从 Electron 版迁移指南
- `CHANGELOG_V2.md` - 本文件
- `start.sh` - 便捷启动脚本

#### 删除文件
- `public/electron.js` - Electron 主进程（不再需要）
- `public/preload.js` - Electron preload 脚本（不再需要）
- `desktop-app.js` - 桌面应用入口（不再需要）
- `scripts/start-desktop.js` - 桌面启动脚本（不再需要）
- `scripts/start-dev.js` - 开发启动脚本（不再需要）

#### 修改文件
- `package.json` - 移除 Electron 依赖，更新脚本命令
- `src/App.js` - 使用 webAPI 替代 electronAPI
- `README.md` - 完全重写为 Web 版文档
- `server/index.js` - 扩展为完整的 API 服务器

### 🔧 功能变更

#### 保持不变的功能
- ✅ 所有 AI 功能完整保留
- ✅ 图片生成（Seedream 4.0, 即梦系列）
- ✅ 视频生成和任务管理
- ✅ 动作模仿（经典版 + 即梦版）
- ✅ 数字人 (OmniHuman1.5)
- ✅ 智能绘图 (Inpainting)
- ✅ 视频指令编辑
- ✅ 智能搜图和向量数据库
- ✅ UI 界面保持一致
- ✅ 用户配置功能

#### 改进的功能
- ✨ 支持多用户同时使用
- ✨ 支持远程访问（通过浏览器）
- ✨ 支持移动端浏览器访问
- ✨ 更快的启动速度
- ✨ 更小的资源占用
- ✨ 更易于部署和更新
- ✨ 支持在多个标签页中同时使用

#### 配置存储变更
- **旧版**: Electron Store（操作系统文件系统）
- **新版**: LocalStorage（浏览器存储）
- **影响**: 需要在 Web 版重新配置 API 密钥

### 📡 API 端点

新增完整的 RESTful API 端点（32+ 个）：

#### 图片生成 API
- `POST /api/v3/images/generations` - Seedream 4.0
- `POST /api/jimeng40/submit` - 即梦 4.0 提交
- `POST /api/jimeng40/query` - 即梦 4.0 查询
- `POST /api/jimeng31/submit` - 即梦 3.1 提交
- `POST /api/jimeng31/query` - 即梦 3.1 查询
- `POST /api/jimeng-i2i30/submit` - 即梦图生图 3.0 提交
- `POST /api/jimeng-i2i30/query` - 即梦图生图 3.0 查询

#### 视频生成 API
- `POST /api/video/create` - 创建视频任务
- `GET /api/video/tasks/:id` - 查询单个任务
- `GET /api/video/tasks` - 查询任务列表
- `DELETE /api/video/tasks/:id` - 删除任务
- `POST /api/jimeng30pro-video/submit` - 即梦 3.0 Pro 提交
- `POST /api/jimeng30pro-video/query` - 即梦 3.0 Pro 查询

#### 动作模仿 API
- `POST /api/motion-imitation/submit` - 经典版提交
- `POST /api/motion-imitation/query` - 经典版查询
- `POST /api/jimeng-motion-imitation/submit` - 即梦版提交
- `POST /api/jimeng-motion-imitation/query` - 即梦版查询

#### 数字人 API
- `POST /api/omnihuman/identify/submit` - 主体识别提交
- `POST /api/omnihuman/identify/query` - 主体识别查询
- `POST /api/omnihuman/detect` - 主体检测
- `POST /api/omnihuman/video/submit` - 视频生成提交
- `POST /api/omnihuman/video/query` - 视频生成查询

#### 智能绘图 & 视频编辑 API
- `POST /api/inpainting/submit` - Inpainting 提交
- `POST /api/video-edit/submit` - 视频编辑提交
- `POST /api/video-edit/query` - 视频编辑查询

#### 向量搜索 API
- `POST /api/embedding/image` - 图像向量化
- `POST /api/search/multimodal` - 多模态检索
- `POST /api/embedding/compute` - 向量化计算
- `POST /api/vector/upsert` - 数据写入
- `POST /api/tos/presigned-url` - TOS 预签名 URL
- `POST /api/tos/upload` - TOS 文件上传

#### 系统 API
- `POST /api/test-connection` - 测试连接
- `GET /api/health` - 健康检查

### 🔄 命令变更

#### 开发命令
| 功能 | v1.x (Electron) | v2.0 (Web) |
|------|----------------|-----------|
| 启动开发 | `npm run desktop-dev` | `npm run dev` |
| 启动生产 | `npm run desktop` | `npm run prod` |
| 快速启动 | `npm run app` | `npm run dev` |
| 打包应用 | `npm run dist` | `npm run build` |

#### 新增命令
- `npm run dev` - 同时启动前端和后端（开发模式）
- `npm run server` - 仅启动后端服务器
- `npm run prod` - 构建并启动生产服务器
- `npm run serve` - 同 prod
- `./start.sh` - 交互式启动脚本（仅 macOS/Linux）

#### 移除命令
- `npm run desktop`
- `npm run desktop-dev`
- `npm run desktop-quick`
- `npm run app`
- `npm run launch`
- `npm run dist`
- `npm run dist-mac`
- `npm run dist-win`
- `npm run dist-linux`

### 📚 文档更新

#### 新增文档
- `QUICKSTART.md` - 快速启动指南
- `MIGRATION.md` - 迁移指南
- `CHANGELOG_V2.md` - 本变更日志

#### 更新文档
- `README.md` - 完全重写为 Web 版文档
  - 更新技术栈说明
  - 添加架构图
  - 添加 API 端点列表
  - 添加部署指南
  - 更新使用说明

### 🔒 安全性改进

- ✅ CORS 配置
- ✅ API 认证（Bearer Token）
- ✅ 请求大小限制（50MB）
- ✅ 错误处理和验证
- ✅ 环境变量支持
- ✅ 生产部署建议（HTTPS, Nginx）

### 🐛 Bug 修复

- 修复了所有 IPC 相关的错误
- 改进了错误处理机制
- 统一了 API 响应格式
- 优化了文件上传处理

### ⚡ 性能优化

- 更快的启动时间（无 Electron 开销）
- 更小的资源占用
- 支持并发请求
- 优化的构建流程

### 📊 代码统计

#### 代码行数变化
- 删除: ~2,500 行（Electron 相关代码）
- 新增: ~1,800 行（Express 后端 + API 客户端）
- 净减少: ~700 行

#### 依赖变化
- 移除: 3 个依赖（electron, electron-builder, wait-on）
- 保持: 10+ 个依赖（React, Bootstrap, TOS SDK 等）
- 新增: 0 个新依赖（Express 和 CORS 已在 v1.x 存在）

### 🎯 升级建议

#### 对于个人用户
1. 备份当前配置（API 密钥）
2. 更新到 v2.0
3. 运行 `npm install` 重新安装依赖
4. 运行 `npm run dev` 启动应用
5. 在浏览器中重新配置 API 密钥

#### 对于团队用户
1. 评估是否需要部署到服务器
2. 准备服务器环境（如需要）
3. 按照部署指南配置服务器
4. 迁移并测试所有功能
5. 培训用户使用 Web 版

#### 对于开发者
1. 查看 `MIGRATION.md` 了解详细变更
2. 学习新的 API 架构
3. 更新自定义代码（如有）
4. 测试所有功能
5. 参考新的开发指南

### 🔮 未来计划

- [ ] PWA 支持（渐进式 Web 应用）
- [ ] 离线功能（Service Worker）
- [ ] 用户认证系统
- [ ] 多语言支持
- [ ] 主题定制
- [ ] API 限流和配额管理
- [ ] WebSocket 实时通知
- [ ] 批量任务管理
- [ ] 导出/导入配置功能

### 💬 反馈和支持

如果您在升级过程中遇到任何问题：

1. 查看 [快速启动指南](QUICKSTART.md)
2. 查看 [迁移指南](MIGRATION.md)
3. 搜索 [Issues](https://github.com/bolecodex/volcano-ai-workshop/issues)
4. 提交新的 [Issue](https://github.com/bolecodex/volcano-ai-workshop/issues/new)

### 🙏 致谢

感谢所有用户的支持和反馈。v2.0 是一个重要的里程碑，标志着项目向更现代、更灵活的架构迈进。

---

**🌋 火山AI创作工坊 v2.0 - 让 AI 创作更简单、更自由！**

