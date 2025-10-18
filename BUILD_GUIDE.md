# 📦 构建和部署指南

## 构建信息

**构建日期**: 2025-10-18  
**版本**: 2.0.0-web  
**输出目录**: `build/`  
**总大小**: 2.6 MB

## 📊 构建统计

### 文件大小（Gzip 压缩后）
- **JavaScript**: 123.17 KB (`main.f7ea1a7a.js`)
- **CSS**: 33.05 KB (`main.e9cdcd85.css`)
- **总计**: ~156 KB（压缩后）

### 未压缩大小
- **JavaScript**: 474 KB
- **CSS**: 239 KB
- **静态资源**: 2.6 MB（包括所有文件）

## 🚀 快速部署

### 方法 1：使用内置服务器（推荐）

```bash
# 启动生产服务器
npm run prod

# 或
npm run serve
```

访问: `http://localhost:3001`

### 方法 2：使用 serve 包

```bash
# 全局安装 serve（如果还没有）
npm install -g serve

# 启动静态文件服务器
serve -s build -l 3000

# 或指定端口
serve -s build -p 8080
```

### 方法 3：使用 Node.js + Express

项目已内置 Express 服务器，直接运行：

```bash
node server/index.js
```

## 📁 构建目录结构

```
build/
├── asset-manifest.json      # 资源清单
├── index.html              # 主页面
├── logo.svg                # Logo
├── manifest.json           # PWA 配置
└── static/
    ├── css/
    │   ├── main.e9cdcd85.css        # 主样式（239 KB）
    │   └── main.e9cdcd85.css.map    # Source Map
    ├── js/
    │   ├── main.f7ea1a7a.js         # 主脚本（474 KB）
    │   ├── main.f7ea1a7a.js.LICENSE.txt
    │   └── main.f7ea1a7a.js.map     # Source Map
    └── media/
        └── ...                       # 媒体资源
```

## 🌐 部署到生产环境

### 部署到服务器

#### 1. 准备服务器
```bash
# 确保服务器已安装 Node.js 14+
node --version

# 上传项目文件
scp -r * user@your-server:/path/to/app/
```

#### 2. 安装依赖
```bash
cd /path/to/app
npm install --production
```

#### 3. 启动应用
```bash
# 使用 PM2（推荐）
npm install -g pm2
pm2 start server/index.js --name volcano-ai-workshop

# 或使用 systemd
# 创建 /etc/systemd/system/volcano-ai.service
```

#### 4. 配置反向代理（Nginx）

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

### 部署到 Vercel

1. 安装 Vercel CLI:
```bash
npm install -g vercel
```

2. 部署:
```bash
vercel
```

3. 配置 `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "build/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/build/$1"
    }
  ]
}
```

### 部署到 Docker

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制构建文件和服务器代码
COPY build/ ./build/
COPY server/ ./server/

# 暴露端口
EXPOSE 3001

# 启动服务器
CMD ["node", "server/index.js"]
```

构建和运行:
```bash
# 构建镜像
docker build -t volcano-ai-workshop .

# 运行容器
docker run -p 3001:3001 volcano-ai-workshop
```

## 🔧 环境变量

创建 `.env.production` 文件：

```env
# 生产环境配置
NODE_ENV=production
PORT=3001

# API 配置（可选）
REACT_APP_API_URL=http://your-api-server.com
```

## 📊 性能优化

### 已启用的优化
- ✅ 代码压缩和混淆
- ✅ CSS 提取和压缩
- ✅ Tree shaking
- ✅ 代码分割
- ✅ Gzip 压缩

### 建议的额外优化

#### 1. 启用 Brotli 压缩（Nginx）
```nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

#### 2. 启用 HTTP/2
```nginx
listen 443 ssl http2;
```

#### 3. 配置缓存策略
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 4. 使用 CDN
- 将 `build/static/` 目录上传到 CDN
- 更新 `asset-manifest.json` 中的路径

## 🧪 测试生产构建

### 本地测试

```bash
# 1. 构建
npm run build

# 2. 启动生产服务器
npm run prod

# 3. 访问
open http://localhost:3001
```

### 性能测试

```bash
# 使用 Lighthouse
npx lighthouse http://localhost:3001 --view

# 使用 WebPageTest
# 访问 https://www.webpagetest.org/
```

## 📈 监控和日志

### PM2 日志

```bash
# 查看日志
pm2 logs volcano-ai-workshop

# 查看状态
pm2 status

# 重启
pm2 restart volcano-ai-workshop
```

### 应用日志

服务器日志位置：`server/index.js` 中的 `console.log`

建议使用日志库如 `winston` 或 `pino`。

## 🔒 安全建议

### 生产环境检查清单

- [ ] 移除 source maps（或限制访问）
- [ ] 配置 HTTPS
- [ ] 设置 CORS 策略
- [ ] 配置安全头（Helmet.js）
- [ ] 限流和防 DDoS
- [ ] 定期更新依赖
- [ ] 配置防火墙规则
- [ ] 备份数据库和配置

### Express 安全配置

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 安全头
app.use(helmet());

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 限制 100 个请求
});
app.use('/api/', limiter);

// CORS 配置
app.use(cors({
  origin: ['https://your-domain.com'],
  credentials: true
}));
```

## 📦 持续集成/部署（CI/CD）

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy
      # 根据您的部署方式配置
      run: |
        # 示例：部署到服务器
        scp -r build/* user@server:/path/to/app/build/
```

## 🆘 故障排除

### 构建失败

```bash
# 清理并重新构建
rm -rf build node_modules
npm install
npm run build
```

### 生产环境错误

1. 检查服务器日志
2. 验证环境变量
3. 检查文件权限
4. 验证 Node.js 版本

### 性能问题

1. 使用生产构建（不是开发模式）
2. 启用 Gzip/Brotli 压缩
3. 使用 CDN
4. 启用浏览器缓存
5. 优化图片和资源

## 📞 支持

遇到问题？

1. 查看 [README.md](README.md)
2. 查看 [QUICKSTART.md](QUICKSTART.md)
3. 查看服务器日志
4. 提交 Issue

---

**最后更新**: 2025-10-18  
**维护者**: 开发团队

