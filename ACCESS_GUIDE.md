# 🌐 访问指南

## 问题说明

您遇到的"拒绝访问"问题是 **React 开发服务器的正常行为**。

### 原因

React 开发服务器（webpack-dev-server）有以下特点：

1. **对命令行工具不友好**: `curl`、`nc` 等工具可能显示"拒绝连接"
2. **但浏览器可以正常访问**: 浏览器通过 WebSocket 和特殊的协议与 dev server 通信
3. **端口可能不显示在 `lsof` 中**: 这是正常的

## ✅ 正确的访问方式

### 方式 1：直接在浏览器中打开（推荐）

```bash
# macOS
open http://localhost:3000

# 或手动在浏览器中输入
http://localhost:3000
```

### 方式 2：使用局域网 IP

```bash
http://192.168.31.8:3000
```

### 方式 3：直接访问后端（用于测试）

后端 API 可以通过命令行访问：

```bash
curl http://localhost:3001/api/health
```

## 🔍 如何验证应用正常运行

### 1. 检查进程

```bash
ps aux | grep react-scripts | grep -v grep
```

应该看到类似：
```
m007   9260  /opt/homebrew/Cellar/node/.../react-scripts/scripts/start.js
```

### 2. 检查日志

```bash
tail -f dev.log
```

应该看到：
```
Compiled successfully!
You can now view volcano-ai-workshop-web in the browser.
  Local:            http://localhost:3000
```

### 3. 测试后端

```bash
curl http://localhost:3001/api/health
```

应该返回：
```json
{"status":"OK","message":"火山AI创作工坊后端服务运行中",...}
```

### 4. 在浏览器中测试

1. 打开浏览器
2. 访问 `http://localhost:3000`
3. 应该看到应用界面，包括：
   - 顶部导航栏："火山AI创作工坊 Web版"
   - 左侧菜单：控制台、图片生成、视频生成等
   - 主要内容区域

## 🐛 故障排除

### 问题 1：浏览器显示"无法访问此网站"

**可能原因**:
- 前端服务器未启动
- 端口被占用
- 防火墙阻止

**解决方案**:
```bash
# 1. 停止所有进程
killall -9 node

# 2. 重新启动
npm run dev

# 3. 等待编译完成（约 20-30 秒）

# 4. 在浏览器中访问
open http://localhost:3000
```

### 问题 2：浏览器显示空白页面

**可能原因**:
- 前端正在编译
- JavaScript 加载失败

**解决方案**:
```bash
# 1. 检查浏览器控制台（F12）是否有错误
# 2. 等待更长时间（首次编译可能需要 30-60 秒）
# 3. 刷新页面（Cmd+R 或 Ctrl+R）
# 4. 清除浏览器缓存后重试
```

### 问题 3：API 调用失败

**检查**:
1. 后端是否运行：`curl http://localhost:3001/api/health`
2. 浏览器控制台网络标签查看请求状态
3. 是否配置了 API 密钥

**解决方案**:
```bash
# 确保后端正在运行
ps aux | grep "server/index.js"

# 如果没有运行，启动它
node server/index.js &
```

## 📖 完整启动流程

### 方法 A：使用 npm run dev（推荐）

```bash
# 1. 确保在项目目录
cd /Users/m007/codes/volcano-ai-workshop

# 2. 启动开发模式
npm run dev

# 3. 等待看到 "Compiled successfully!"

# 4. 在浏览器中打开
open http://localhost:3000
```

### 方法 B：使用自定义脚本

```bash
chmod +x start-web.sh
./start-web.sh
```

### 方法 C：分别启动

```bash
# 终端 1 - 后端
npm run server

# 终端 2 - 前端  
npm start

# 等待编译完成后在浏览器中访问
```

## ✨ 成功标志

当您看到以下情况时，说明应用正常运行：

### 在终端中
```
✅ 后端日志显示:
   🚀 服务器运行中: http://localhost:3001
   ✨ 准备就绪，开始创作！

✅ 前端日志显示:
   Compiled successfully!
   You can now view volcano-ai-workshop-web in the browser.
     Local:            http://localhost:3000
```

### 在浏览器中
```
✅ 页面加载显示:
   - 顶部：火山AI创作工坊 Web版
   - 左侧：功能菜单
   - 中间：控制台或功能页面
   - 底部：版本信息
```

## 📱 移动设备访问

如果要在手机或其他设备上访问：

```
1. 确保设备在同一局域网
2. 使用局域网 IP 访问：http://192.168.31.8:3000
3. 手机浏览器中输入上述地址
```

## 🔐 配置 API 密钥

首次使用需要配置：

1. 在浏览器中打开应用
2. 点击左侧菜单的"设置"
3. 输入您的 API 密钥：
   - ARK API Key
   - Access Key ID  
   - Secret Access Key
4. 点击"保存配置"
5. 返回控制台开始使用

## 💡 重要提示

1. **不要使用 curl 测试前端**: React dev server 不响应 curl 请求
2. **使用浏览器访问**: 这是唯一正确的访问方式
3. **等待编译完成**: 首次启动需要 20-60 秒
4. **查看浏览器控制台**: F12 打开开发者工具查看详细错误
5. **后端可以用 curl**: 后端 API 可以用命令行工具测试

## 📞 需要帮助？

如果按照以上步骤仍然无法访问：

1. 查看 [完整文档](README.md)
2. 查看 [快速启动指南](QUICKSTART.md)
3. 查看 [状态文档](STATUS.md)
4. 提交 [Issue](https://github.com/bolecodex/volcano-ai-workshop/issues)

---

**最后更新**: 2025-10-18

**关键要点**: 请使用浏览器访问 http://localhost:3000，不要用命令行工具！

