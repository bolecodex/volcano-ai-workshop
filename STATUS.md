# 🚀 项目运行状态

## ✅ 服务器状态

### 后端服务器
- **状态**: ✅ 运行中
- **端口**: 3001
- **访问地址**: http://localhost:3001
- **API 健康检查**: http://localhost:3001/api/health
- **说明**: Express 后端服务器正常运行，所有 API 端点可用

### 前端服务器  
- **状态**: ✅ 编译成功
- **端口**: 3000
- **本地访问**: http://localhost:3000
- **局域网访问**: http://192.168.31.8:3000
- **说明**: React 开发服务器已编译成功，支持热重载

## 🌐 访问方式

### 推荐方式
在浏览器中打开: **http://localhost:3000**

这会加载前端应用，前端会通过代理自动连接后端 API。

### API 直接访问
如果需要直接访问后端 API: **http://localhost:3001**

## 📋 下一步操作

1. **打开浏览器访问应用**
   ```
   http://localhost:3000
   ```

2. **配置 API 密钥**
   - 点击左侧菜单的"设置"
   - 输入您的 ARK API Key
   - 输入您的 Access Key ID 和 Secret Access Key
   - 点击"保存配置"

3. **开始使用**
   - 尝试图片生成功能
   - 探索其他 AI 功能

## 🛠️ 管理命令

### 停止服务
```bash
# 停止后端
pkill -f "node server/index.js"

# 停止前端
pkill -f "react-scripts"

# 停止所有
pkill -f "node server/index.js" && pkill -f "react-scripts"
```

### 重启服务
```bash
# 开发模式（推荐）
npm run dev

# 分别启动
npm run server  # 后端
npm start       # 前端
```

### 查看状态
```bash
# 检查端口
lsof -i :3000 -i :3001

# 检查进程
ps aux | grep -E "(node|react-scripts)"

# 测试后端 API
curl http://localhost:3001/api/health
```

## 🔧 故障排除

### 问题：无法访问前端 (端口 3000)

**解决方案**:
1. 确认 React 进程正在运行: `ps aux | grep react-scripts`
2. 检查端口占用: `lsof -i :3000`
3. 如果端口被占用，停止占用进程或更改端口
4. 重启前端: `pkill -f "react-scripts" && npm start`
5. 在浏览器中访问 http://localhost:3000

### 问题：无法访问后端 API (端口 3001)

**解决方案**:
1. 确认后端进程正在运行: `ps aux | grep "server/index.js"`
2. 检查端口占用: `lsof -i :3001`
3. 测试 API: `curl http://localhost:3001/api/health`
4. 如果失败，重启后端: `npm run server`

### 问题：API 调用失败

**检查**:
1. 后端服务器是否运行在 3001 端口
2. 前端代理配置是否正确 (src/setupProxy.js)
3. 浏览器控制台是否有错误
4. 网络请求是否被拦截

### 问题：curl 无法连接

**说明**:
React 开发服务器可能对某些 HTTP 客户端有限制。请使用浏览器访问。

curl 可能无法连接到 React dev server，但浏览器可以正常访问。

## 📝 注意事项

1. **开发模式特点**:
   - 前端支持热重载，修改代码会自动刷新
   - 后端需要手动重启才能应用更改
   - 两个服务器都需要运行

2. **端口使用**:
   - 前端: 3000 (React)
   - 后端: 3001 (Express)
   - 确保这两个端口没有被其他程序占用

3. **配置存储**:
   - 配置保存在浏览器 LocalStorage
   - 每个浏览器独立存储
   - 清除浏览器数据会删除配置

4. **网络访问**:
   - 本地访问: http://localhost:3000
   - 局域网访问: http://192.168.31.8:3000
   - 其他设备可以通过局域网 IP 访问

## 🎉 成功提示

如果您看到以下情况，说明一切正常：

- ✅ 浏览器成功打开并显示应用界面
- ✅ 可以看到侧边栏菜单和各个功能模块
- ✅ 在设置页面可以输入和保存 API 密钥
- ✅ 尝试图片生成功能可以正常工作

## 📚 更多帮助

- [完整文档](README.md)
- [快速启动指南](QUICKSTART.md)
- [迁移指南](MIGRATION.md)

---

**最后更新**: 2025-10-18

如有问题，请查看 [故障排除](QUICKSTART.md#-常见问题) 或提交 Issue。

