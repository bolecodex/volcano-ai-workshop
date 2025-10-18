# 📦 迁移指南：从 Electron 桌面版到 Web 版

本文档帮助您从 v1.x Electron 桌面版迁移到 v2.0 Web 版。

## 🔄 版本对比

| 特性 | v1.x (Electron) | v2.0 (Web) |
|------|----------------|-----------|
| 架构 | Electron 桌面应用 | React + Express Web 应用 |
| 运行方式 | 独立桌面程序 | 浏览器访问 |
| 通信方式 | IPC | HTTP REST API |
| 部署方式 | 打包为可执行文件 | 部署到服务器 |
| 跨平台 | Windows/Mac/Linux | 任何现代浏览器 |
| 多用户 | ❌ 单用户 | ✅ 支持多用户 |
| 远程访问 | ❌ 仅本地 | ✅ 支持远程访问 |

## ✨ 优势

### Web 版的优势
1. **更易部署**: 无需打包，直接部署到服务器
2. **跨设备访问**: 可以在任何设备的浏览器中使用
3. **多用户支持**: 多个用户可以同时使用
4. **更新简单**: 刷新页面即可获得最新版本
5. **资源占用更小**: 不需要 Electron 运行时
6. **开发更快**: 前后端分离，开发效率更高

### 保留的功能
- ✅ 所有 AI 功能完全保留
- ✅ 用户配置通过浏览器 LocalStorage 保存
- ✅ 所有 API 调用保持不变
- ✅ UI 界面保持一致

## 📋 迁移步骤

### 1. 备份配置（重要！）

在迁移前，导出您的 API 配置：

**Electron 版本的配置位置**:
- Windows: `%APPDATA%/volcengine-ai-studio/`
- macOS: `~/Library/Application Support/volcengine-ai-studio/`
- Linux: `~/.config/volcengine-ai-studio/`

手动记录以下配置：
- ARK API Key
- Access Key ID
- Secret Access Key
- TOS Bucket 配置
- 向量库配置

### 2. 卸载旧版本（可选）

如果不再需要 Electron 桌面版：
- Windows: 通过控制面板卸载
- macOS: 将应用拖到废纸篓
- Linux: 删除安装目录

### 3. 获取 Web 版代码

```bash
# 如果是从旧项目更新
cd volcano-ai-workshop
git pull origin main

# 或重新克隆
git clone https://github.com/bolecodex/volcano-ai-workshop.git
cd volcano-ai-workshop
```

### 4. 清理旧依赖

```bash
# 删除 Electron 相关的依赖
rm -rf node_modules
rm package-lock.json

# 重新安装依赖
npm install
```

### 5. 启动 Web 版

```bash
# 开发模式
npm run dev

# 或生产模式
npm run prod
```

### 6. 重新配置

1. 在浏览器中打开 `http://localhost:3000`
2. 进入"设置"页面
3. 输入之前备份的 API 配置
4. 测试连接确认配置正确

## 🔧 配置迁移

### LocalStorage vs Electron Store

**Electron 版本**使用 electron-store 存储配置。

**Web 版本**使用浏览器 LocalStorage 存储配置。

### 配置键名对应关系

| 配置项 | Electron | Web |
|--------|----------|-----|
| ARK API Key | `arkApiKey` | `arkApiKey` |
| Access Key ID | `accessKeyId` | `accessKeyId` |
| Secret Key | `secretAccessKey` | `secretAccessKey` |
| TOS Bucket | `tosBucket` | `tosBucket` |

**注意**: 配置键名保持不变，但需要在 Web 版的设置页面重新输入。

## 🚨 重要变化

### 1. 无需打包

**旧方式** (Electron):
```bash
npm run dist          # 打包
npm run dist-mac      # macOS 打包
npm run dist-win      # Windows 打包
```

**新方式** (Web):
```bash
npm run build         # 构建前端
npm run server        # 启动服务器
```

### 2. 启动命令变化

| 操作 | Electron 命令 | Web 命令 |
|------|--------------|---------|
| 开发 | `npm run desktop-dev` | `npm run dev` |
| 生产 | `npm run desktop` | `npm run prod` |
| 快速启动 | `npm run app` | `npm run dev` |

### 3. 访问方式变化

**Electron**: 双击桌面图标或运行命令启动独立窗口

**Web**: 在浏览器中访问:
- 开发: `http://localhost:3000`
- 生产: `http://localhost:3001`

### 4. 文件上传

**Electron**: 使用原生文件选择对话框

**Web**: 使用 HTML5 文件输入
- 功能完全相同
- 支持拖放上传
- 大文件可能需要更长时间

### 5. 多窗口支持

**Electron**: 单窗口应用

**Web**: 可以在多个浏览器标签页中同时打开
- 配置在标签页间共享（LocalStorage）
- 任务可以在不同标签页查看

## 🔒 数据安全

### 配置存储

**Electron 版本**:
- 配置存储在本地文件系统
- 与操作系统集成

**Web 版本**:
- 配置存储在浏览器 LocalStorage
- 每个浏览器独立存储
- 清除浏览器数据会删除配置

**建议**:
- 定期备份 API 密钥
- 使用密码管理器保存密钥
- 不要在公共计算机上保存敏感信息

### 网络安全

**开发环境**:
- 仅本地访问 (localhost)
- 不暴露到公网

**生产部署**:
- 建议使用 HTTPS
- 配置防火墙
- 使用反向代理（Nginx）
- 考虑添加身份验证

## 🌐 部署建议

### 本地使用

适合个人使用，无需特殊配置：

```bash
npm run dev
```

访问 `http://localhost:3000`

### 团队使用

部署到内网服务器供团队使用：

1. 配置服务器环境
2. 构建项目: `npm run build`
3. 使用 PM2 管理进程
4. 配置 Nginx 反向代理
5. 设置访问控制

详细步骤参见 [README.md](README.md#-部署指南)

### 云端部署

部署到云服务器供远程访问：

1. 选择云服务商（阿里云、腾讯云等）
2. 配置服务器和域名
3. 启用 HTTPS (Let's Encrypt)
4. 配置 CDN 加速（可选）
5. 添加访问控制和监控

## ❓ 常见问题

### Q: 我的配置丢失了怎么办？

A: Web 版使用浏览器 LocalStorage 存储配置。配置只在当前浏览器中有效。需要：
1. 在每个浏览器中重新配置
2. 或导出配置手动迁移
3. 建议备份 API 密钥

### Q: 可以同时使用 Electron 版和 Web 版吗？

A: 可以，两者互不干扰。但建议只使用一个版本以避免混淆。

### Q: Web 版比 Electron 版慢吗？

A: 不会。Web 版在功能上与 Electron 版本相同，性能相当。某些操作可能因网络延迟略有不同，但整体体验一致。

### Q: 如何在移动设备上使用？

A: Web 版支持在移动浏览器中访问。只需在移动设备浏览器中打开服务器地址即可。UI 会自动适配。

### Q: 数据安全吗？

A: 
- API 密钥存储在浏览器 LocalStorage 中，不会发送到任何第三方服务器
- 所有 AI API 调用都经过您自己的后端服务器
- 建议在生产环境启用 HTTPS
- 不要在公共计算机上保存敏感配置

### Q: 可以离线使用吗？

A: Web 版需要网络连接：
- 前端需要加载资源（首次访问后会缓存）
- 后端需要调用火山引擎 API
- 未来可能支持 PWA 实现部分离线功能

## 📚 更多资源

- [完整文档](README.md)
- [快速启动指南](QUICKSTART.md)
- [API 文档](docs/api/)
- [部署指南](README.md#-部署指南)

## 💬 获取帮助

如果在迁移过程中遇到问题：

1. 查看 [常见问题](README.md#-常见问题)
2. 搜索 [Issues](https://github.com/bolecodex/volcano-ai-workshop/issues)
3. 提交新的 [Issue](https://github.com/bolecodex/volcano-ai-workshop/issues/new)

---

**祝迁移顺利！** 🎉

如有任何问题，欢迎在 Issues 中反馈。

