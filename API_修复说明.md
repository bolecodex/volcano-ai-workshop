# ✅ API直连云端修复完成

## 问题描述

之前AI图片生成和视频生成功能连接的是本地API地址 `http://localhost:3001`，现在已修复为直接连接火山引擎云端API。

## 修复内容

### 📝 修改的文件

1. **`src/utils/apiClient.js`**
   - 移除本地代理依赖
   - 添加云端API地址配置
   - 智能路由到正确的API端点

2. **`src/components/ImageGenerator.js`**  
   - 图片生成直接调用云端API
   - API连接测试直接调用云端API

3. **`src/components/VideoGenerator.js`**
   - 视频任务查询直接调用云端API
   - 任务删除直接调用云端API

### 🔄 架构变化

**修复前**:
```
前端 → localhost:3001 (本地代理) → 火山引擎API
```

**修复后**:
```
前端 → 火山引擎云端API (直接连接)
```

## 支持的API

### ✅ 已支持直连（使用API Key）

- **Seedream 4.0 图片生成** - `https://ark.cn-beijing.volces.com/api/v3/images/generations`
- **方舟视频生成** - `https://ark.cn-beijing.volces.com/api/v1/text2video/*`
- **向量数据库服务** - `https://api-vikingdb.volces.com`

### ⚠️ 需要IPC/代理（需要AccessKey签名）

- 即梦系列API（即梦4.0、即梦3.1、即梦图生图3.0）
- 动作模仿API
- 数字人API

> 💡 **说明**: 这些API需要Signature V4签名认证，为了安全考虑，在Web模式下仍需通过IPC或本地代理调用。

## 使用方式

### 🖥️ Electron桌面应用（推荐）

无需任何配置，继续使用IPC通信，所有功能正常工作。

### 🌐 Web浏览器模式

1. **直接使用** - 打开浏览器访问应用，图片生成和视频生成会自动直连云端API

2. **CORS问题** - 如果遇到跨域错误：
   - 方案1: 在火山引擎控制台配置CORS白名单
   - 方案2: 使用CORS浏览器扩展（开发环境）
   - 方案3: 部署到服务器上

3. **即梦功能** - 需要启动本地服务器：
   ```bash
   npm run server
   ```

## 验证修复

### 1. 打开浏览器开发者工具

按 `F12` 打开开发者工具，切换到 **Network** 标签

### 2. 测试图片生成

1. 进入"AI 图片生成"页面
2. 输入提示词，点击"生成图片"
3. 查看Network标签，确认请求URL是：
   ```
   https://ark.cn-beijing.volces.com/api/v3/images/generations
   ```
4. ✅ 如果看到这个地址，说明已直连云端API

### 3. 测试视频生成

1. 进入"视频生成"页面
2. 创建视频任务
3. 查看Network标签，确认API请求直接发送到云端

## 优势

| 特性 | 修复前 | 修复后 |
|------|--------|--------|
| 部署复杂度 | 需要运行本地服务器 | 直接部署静态文件 |
| 网络延迟 | 2跳（前端→代理→云端） | 1跳（前端→云端） |
| 单点故障 | 本地服务器可能失败 | 直接连接，更可靠 |
| 扩展性 | 受限于本地资源 | 可部署到CDN |

## 常见问题

### Q: 为什么即梦功能还需要本地服务器？

A: 即梦系列API使用Signature V4签名认证，需要AccessKey和SecretKey。在浏览器中直接调用会暴露密钥，存在安全风险。因此这些API仍需通过本地代理或Electron IPC调用。

### Q: 遇到CORS错误怎么办？

A: CORS（跨域资源共享）是浏览器的安全机制。解决方案：
1. **最佳方案**: 在火山引擎控制台配置CORS白名单
2. **开发环境**: 使用"CORS Unblock"等浏览器扩展
3. **生产环境**: 部署到支持CORS的服务器

### Q: API Key在哪里配置？

A: 点击左侧菜单的"Settings"，在"API凭证配置"中填写API Key。

### Q: 如何回退到本地代理模式？

A: 设置环境变量后重新构建：
```bash
export REACT_APP_API_URL=http://localhost:3001
npm run build
```

## 检查清单

测试以下功能确认修复成功：

- [ ] 图片生成 - Seedream 4.0
- [ ] 图片生成 - 测试连接按钮
- [ ] 视频生成 - 创建任务
- [ ] 视频生成 - 查看任务列表
- [ ] 视频生成 - 删除任务
- [ ] 即梦4.0 - 通过Electron IPC正常工作
- [ ] 即梦3.1 - 通过Electron IPC正常工作

## 技术细节

完整的技术文档请查看：[docs/changelog/API_DIRECT_CONNECTION.md](docs/changelog/API_DIRECT_CONNECTION.md)

---

**修复日期**: 2025年10月18日  
**影响范围**: Web模式下的API调用  
**向后兼容**: ✅ 完全兼容现有功能

