# 🌋 火山AI创作工坊 Web版

基于 React + Express + Bootstrap 构建的全功能 AI 创作 Web 应用，集成火山引擎多模态 AI 能力。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/express-5.1.0-green.svg)](https://expressjs.com/)

## ✨ 核心功能


### 🎨 AI 图片生成
- ✅ **文生图** (Text-to-Image): 使用文字描述生成高质量图片
- ✅ **图生图** (Image-to-Image): 基于
参考图片生成新图片
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
- ✅ **即梦动作模仿** ⭐ (推荐): 生动模式，更稳定逼真，突破竖屏限制
- ✅ **经典版本**: 原有动作模仿接口
- ✅ **视频驱动**: 使用驱动视频生成角色动画
- ✅ **单图生成**: 上传静态图片创建动态角色
- ✅ **版本选择**: 支持在即梦版本和经典版本间切换
- ✅ **实时预览**: 任务状态实时更新

### 🧑 数字人 (OmniHuman1.5) ⭐
- ✅ **图片+音频生成视频**: 单张图片配合音频生成数字人视频
- ✅ **多主体支持**: 支持人物、宠物、动漫角色等
- ✅ **任意画幅**: 突破传统竖屏限制，支持各种比例
- ✅ **主体检测**: 可选择性指定特定主体说话（多人场景）
- ✅ **提示词增强**: 支持多语言提示词调整画面效果
- ✅ **三步工作流**: 主体识别 → 主体检测（可选） → 视频生成
- ✅ **快速模式**: 可选快速生成模式

### 🖌️ 智能绘图 (Inpainting) ⭐
- ✅ **涂抹编辑**: 使用蒙版图精准编辑图片区域
- ✅ **智能填充**: AI 智能理解上下文填充内容
- ✅ **同步生成**: 实时获取编辑结果，无需等待
- ✅ **参数可调**: 支持调节采样步数、引导强度等
- ✅ **双重输入**: 支持 URL 或 Base64 格式输入

### 🎞️ 视频指令编辑 ⭐
- ✅ **文字编辑视频**: 通过文字指令编辑视频内容
- ✅ **高质量输出**: 支持高清视频输出
- ✅ **可控参数**: 自定义随机种子和帧数

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
- **浏览器**: Chrome, Firefox, Safari, Edge (现代浏览器)

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

#### 开发模式（推荐）
```bash
npm run dev
```
这会同时启动：
- React 开发服务器（端口 3000）
- Express 后端服务器（端口 3001）

然后在浏览器中访问 `http://localhost:3000`

> 💡 **提示**: 本地代理服务器会自动解决CORS跨域问题。详见 [本地代理使用指南](docs/guides/LOCAL_PROXY_GUIDE.md)

#### 单独启动前端
```bash
npm start
```

#### 单独启动后端
```bash
npm run server
```

#### 生产模式
```bash
# 构建前端并启动后端
npm run prod

# 或使用
npm run serve
```

生产模式会构建优化后的静态文件并启动服务器，访问 `http://localhost:3001`

## 🏗️ 技术架构

### 核心技术栈
- **前端框架**: React 18.2.0
- **UI 库**: Bootstrap 5.2.3 + React-Bootstrap 2.7.0
- **后端框架**: Express 5.1.0
- **HTTP 客户端**: Fetch API
- **状态管理**: React Hooks + LocalStorage

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    浏览器 (Browser)                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │         React 前端应用 (Port 3000)                   │ │
│  │  - 用户界面组件                                       │ │
│  │  - API 客户端 (apiClient.js)                        │ │
│  │  - 本地存储管理                                       │ │
│  └────────────────┬───────────────────────────────────┘ │
└───────────────────┼─────────────────────────────────────┘
                    │ HTTP API 调用
                    ▼
┌─────────────────────────────────────────────────────────┐
│         Express 后端服务器 (Port 3001)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  路由层 (server/index.js)                           │ │
│  │  - RESTful API 端点                                 │ │
│  │  - 请求验证和错误处理                                │ │
│  └────────────────┬───────────────────────────────────┘ │
│  ┌────────────────▼───────────────────────────────────┐ │
│  │  服务层 (api-service.js)                            │ │
│  │  - 火山引擎 API 调用                                 │ │
│  │  - 签名生成 (SignatureV4)                           │ │
│  │  - TOS 文件上传                                      │ │
│  └────────────────┬───────────────────────────────────┘ │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────┐
        │   火山引擎 API 服务        │
        │  - ARK API              │
        │  - Visual API           │
        │  - VikingDB API         │
        │  - TOS 对象存储          │
        └─────────────────────────┘
```

### API 端点总览

#### 图片生成
- `POST /api/v3/images/generations` - Seedream 4.0 图片生成
- `POST /api/jimeng40/submit` - 即梦 4.0 提交任务
- `POST /api/jimeng40/query` - 即梦 4.0 查询任务
- `POST /api/jimeng31/submit` - 即梦 3.1 提交任务
- `POST /api/jimeng31/query` - 即梦 3.1 查询任务
- `POST /api/jimeng-i2i30/submit` - 即梦图生图 3.0 提交
- `POST /api/jimeng-i2i30/query` - 即梦图生图 3.0 查询

#### 视频生成
- `POST /api/video/create` - 创建视频任务
- `GET /api/video/tasks/:id` - 查询单个任务
- `GET /api/video/tasks` - 查询任务列表
- `DELETE /api/video/tasks/:id` - 删除任务
- `POST /api/jimeng30pro-video/submit` - 即梦 3.0 Pro 提交
- `POST /api/jimeng30pro-video/query` - 即梦 3.0 Pro 查询

#### 动作模仿
- `POST /api/motion-imitation/submit` - 经典版提交
- `POST /api/motion-imitation/query` - 经典版查询
- `POST /api/jimeng-motion-imitation/submit` - 即梦版提交
- `POST /api/jimeng-motion-imitation/query` - 即梦版查询

#### 数字人 (OmniHuman1.5)
- `POST /api/omnihuman/identify/submit` - 主体识别提交
- `POST /api/omnihuman/identify/query` - 主体识别查询
- `POST /api/omnihuman/detect` - 主体检测（同步）
- `POST /api/omnihuman/video/submit` - 视频生成提交
- `POST /api/omnihuman/video/query` - 视频生成查询

#### 智能绘图 & 视频编辑
- `POST /api/inpainting/submit` - Inpainting 涂抹编辑
- `POST /api/video-edit/submit` - 视频编辑提交
- `POST /api/video-edit/query` - 视频编辑查询

#### 向量搜索
- `POST /api/embedding/image` - 图像向量化
- `POST /api/search/multimodal` - 多模态检索
- `POST /api/embedding/compute` - 向量化计算
- `POST /api/vector/upsert` - 数据写入
- `POST /api/tos/presigned-url` - TOS 预签名 URL
- `POST /api/tos/upload` - TOS 文件上传

## 📁 项目结构

```
volcano-ai-workshop/
├── server/
│   └── index.js              # Express 后端服务器
├── src/
│   ├── App.js                # React 主组件
│   ├── index.js              # React 入口
│   ├── index.css             # 全局样式
│   ├── components/           # React 组件
│   │   ├── Header.js         # 顶部导航栏
│   │   ├── Sidebar.js        # 侧边栏菜单
│   │   ├── Dashboard.js      # 控制台
│   │   ├── ImageGenerator.js # 图片生成
│   │   ├── InpaintingEditor.js # 智能绘图
│   │   ├── VideoGenerator.js # 视频生成
│   │   ├── VideoEditor.js    # 视频编辑
│   │   ├── MotionImitation.js # 动作模仿
│   │   ├── DigitalHuman.js   # 数字人
│   │   ├── SmartSearch.js    # 智能搜图
│   │   ├── Settings.js       # 设置页面
│   │   └── About.js          # 关于页面
│   └── utils/
│       ├── apiClient.js      # API 客户端
│       └── storage.js        # 本地存储工具
├── public/
│   ├── index.html            # HTML 模板
│   └── logo.svg              # 应用图标
├── api-service.js            # API 服务封装
├── signature-v4.js           # AWS Signature V4 签名
├── docs/                     # 文档目录
├── build/                    # 构建输出
└── node_modules/             # 依赖包
```

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

#### 即梦动作模仿（推荐）
1. 选择"即梦动作模仿"版本
2. 上传参考图片和驱动视频（支持 URL 或本地文件）
3. 提交任务
4. 等待 3-5 分钟后查看结果
5. 下载生成的视频

#### 经典版本
- 适用于需要使用原有接口的场景

### 数字人 (OmniHuman1.5)

#### 快速生成（跳过主体检测）
1. 上传图片（人物、宠物、动漫等）
2. 上传音频（< 35秒）
3. 关闭"启用主体检测"
4. 点击"直接生成视频"
5. 等待 2-5 分钟完成

#### 高级生成（指定主体）
1. 上传包含多人的图片
2. 开启"启用主体检测"
3. 点击"开始识别主体"
4. 点击"检测主体"选择要说话的人物
5. 上传音频并生成视频

**支持的高级选项**：
- 提示词（支持中英日韩等多语言）
- 随机种子（固定值可复现结果）
- 快速模式（加速生成）

### 智能绘图 (Inpainting)

1. 上传原图和蒙版图（或使用 URL）
2. 输入编辑提示词
3. 调整参数：
   - **采样步数** (steps): 25（默认）
   - **引导强度** (scale): 5（默认）
   - **随机种子** (seed): -1 为随机
4. 点击提交，实时获取结果
5. 预览或下载编辑后的图片

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

### 用户指南
- 📖 [图片生成完整指南](docs/guides/IMAGE_GENERATION_GUIDE.md)
- 📖 [视频生成使用手册](docs/guides/VIDEO_GENERATOR_USAGE.md)
- 📖 [智能搜图指南](docs/guides/IMAGE_SEARCH_GUIDE.md)
- 📖 [数字人使用指南](docs/guides/DIGITAL_HUMAN_GUIDE.md)
- 📖 [智能绘图编辑器指南](docs/guides/INPAINTING_EDITOR_GUIDE.md)
- 📖 [视频编辑器指南](docs/guides/VIDEO_EDITOR_GUIDE.md)
- 🔄 [本地代理服务器使用指南](docs/guides/LOCAL_PROXY_GUIDE.md) ⭐

### API 文档
- 📖 [OmniHuman1.5 API](docs/api/OmniHuman1.5.md)
- 📖 [即梦动作模仿 API](docs/api/即梦动作模仿.md)
- 📖 [Inpainting 涂抹编辑 API](docs/api/inpainting涂抹编辑.md)
- 📖 [视频指令编辑 API](docs/api/视频指令编辑.md)

## 🔧 常见问题

### Q1: 应用无法启动？
**A**: 
1. 确认已安装依赖：`npm install`
2. 检查 Node.js 版本 >= 14.0.0
3. 删除 `node_modules` 和 `package-lock.json` 重新安装
4. 确保端口 3000 和 3001 未被占用

### Q2: API 调用失败？
**A**:
1. 检查网络连接
2. 验证 API Key 是否正确
3. 确认是否配置了 AccessKey（即梦系列需要）
4. 查看浏览器控制台的错误信息
5. 检查后端服务器是否正常运行

### Q3: 遇到 "Failed to fetch" 或 CORS 跨域错误？
**A**:
这是浏览器的跨域限制导致的。解决方案：
1. **确保后端代理服务器正在运行**：
   ```bash
   npm run dev  # 或者 npm run server
   ```
2. 检查后端服务器状态：访问 `http://localhost:3001/api/health`
3. **刷新浏览器页面**：按 `Ctrl + F5` 强制刷新
4. 查看详细解决方案：📖 [本地代理使用指南](docs/guides/LOCAL_PROXY_GUIDE.md)

### Q4: 如何查看后端日志？
**A**:
后端服务器的日志会输出到终端。如果使用 `npm run dev`，日志会显示在运行该命令的终端窗口中。

### Q5: 如何部署到生产环境？
**A**:
1. 构建前端：`npm run build`
2. 配置环境变量（如果需要）
3. 启动服务器：`npm run server`
4. 建议使用 PM2 或 Docker 进行进程管理
5. 配置 Nginx 作为反向代理
6. 启用 HTTPS

### Q6: 支持跨域访问吗？
**A**:
是的，后端服务器已配置 CORS 支持。如果需要自定义 CORS 设置，可以修改 `server/index.js` 中的 CORS 配置。

## 🛠️ 开发说明

### 添加新的 API 端点

#### 1. 在后端添加路由（server/index.js）
```javascript
app.post('/api/your-new-endpoint', async (req, res) => {
  try {
    const result = await apiService.yourNewFunction(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});
```

#### 2. 在 API 服务层实现（api-service.js）
```javascript
async yourNewFunction(requestData) {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { /* ... */ },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: { message: error.message } };
  }
}
```

#### 3. 在前端 API 客户端添加方法（src/utils/apiClient.js）
```javascript
async yourNewFunction(requestData) {
  return this.request('/api/your-new-endpoint', {
    method: 'POST',
    body: JSON.stringify(requestData)
  });
}
```

#### 4. 在组件中使用
```javascript
const result = await window.electronAPI.yourNewFunction(data);
```

### 热重载开发

```bash
# 开发模式会自动启用热重载
npm run dev
```

前端修改会自动刷新浏览器，后端修改需要重启服务器。

## 📝 脚本命令

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 React 开发服务器（仅前端） |
| `npm run build` | 构建生产版本 |
| `npm run server` | 启动 Express 后端服务器 |
| `npm run dev` | 同时启动前端和后端（开发模式） |
| `npm run prod` | 构建并启动生产服务器 |
| `npm run serve` | 同 prod |
| `npm test` | 运行测试 |

## 🎉 版本更新

### v2.0.0 (2025-10-18) 🚀 重大更新
**✨ 架构升级**
- 🌐 **从桌面应用转为 Web 应用**: 移除 Electron，改用纯 Web 技术栈
- 🔄 **前后端分离**: React 前端 + Express 后端
- 📡 **RESTful API**: HTTP API 替代 IPC 通信
- 🚀 **更易部署**: 支持云端部署和容器化

**🎨 保留所有功能**
- ✅ 完整的图片生成功能（Seedream 4.0, 即梦系列）
- ✅ 视频生成和任务管理
- ✅ 动作模仿（经典版 + 即梦版）
- ✅ 数字人 (OmniHuman1.5)
- ✅ 智能绘图 (Inpainting)
- ✅ 视频指令编辑
- ✅ 智能搜图和向量数据库

**📦 技术改进**
- ⚡ 更快的启动速度
- 🔒 更安全的架构设计
- 📱 支持移动端浏览器访问
- 🌍 支持多用户同时使用
- 🔧 更易于维护和扩展

### v1.2.0 (2025-10-17) - Electron 桌面版
- 🧑 OmniHuman1.5 数字人
- 🖌️ 智能绘图 (Inpainting)
- 🎭 即梦动作模仿
- 🐛 各种 Bug 修复

## 🚀 部署指南

### 使用 Node.js 部署

```bash
# 1. 构建项目
npm run build

# 2. 启动服务器
npm run server

# 3. 访问应用
# http://your-server-ip:3001
```

### 使用 PM2 部署

```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 构建项目
npm run build

# 3. 启动应用
pm2 start server/index.js --name volcano-ai

# 4. 开机自启
pm2 startup
pm2 save
```

### 使用 Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "server"]
```

构建和运行:

```bash
docker build -t volcano-ai-workshop .
docker run -p 3001:3001 volcano-ai-workshop
```

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

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

- [React](https://reactjs.org/) - 用户界面库
- [Express](https://expressjs.com/) - Web 应用框架
- [Bootstrap](https://getbootstrap.com/) - UI 组件库
- [火山引擎](https://www.volcengine.com/) - AI 能力提供商

## 📞 联系方式

- **项目地址**: https://github.com/bolecodex/volcano-ai-workshop
- **问题反馈**: [Issues](https://github.com/bolecodex/volcano-ai-workshop/issues)
- **功能建议**: [Discussions](https://github.com/bolecodex/volcano-ai-workshop/discussions)

---

**✨ 享受 AI 创作的乐趣！**

如果这个项目对你有帮助，请给一个 ⭐️ Star 支持一下！

**Made with ❤️ for AI creators** 🎉
