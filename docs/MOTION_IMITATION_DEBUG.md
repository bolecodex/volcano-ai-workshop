# 动作模仿功能 - 调试指南

## 当前状态

已添加详细的调试日志，帮助诊断 API 调用问题。

### 最新改进

✅ **增强的日志输出** (v1.2.2)
- 输出完整的请求 URL 预览
- 显示图片和视频 URL 的类型和长度
- 显示请求体的前500个字符
- 记录签名过程的详细信息

## 当前遇到的错误

根据终端日志，有两个主要错误：

### 错误 1: 提交任务失败
```
Status: 400 Bad Request
Content: "Error when parsing request"
```

**可能原因：**
1. 请求体格式不正确
2. URL 无法访问
3. AccessKey 权限不足

### 错误 2: 查询任务失败  
```
Status: 400
Code: 50215
Message: "Input invalid for this service."
```

**可能原因：**
1. 服务未开通或没有权限
2. req_key 不正确
3. AccessKey 配置问题

## 调试步骤

### 第一步：查看新的详细日志

现在应用已经重新构建，包含了更详细的日志输出。请尝试提交一个任务，然后检查终端输出中的以下信息：

```javascript
Motion Imitation Request: {
  url: 'https://visual.volcengineapi.com?Action=CVSubmitTask&Version=2022-08-31',
  req_key: 'realman_avatar_imitator_v2v_gen_video',
  has_image: true,
  has_video: true,
  image_url_type: 'url',  // 应该是 'url' 而不是 'base64'
  image_url_length: 100,  // URL 长度
  image_url_preview: 'https://...',  // URL 的前100个字符
  video_url_type: 'url',
  video_url_length: 100,
  video_url_preview: 'https://...',
  body_size: 200,  // 请求体大小
  body_preview: '{"req_key":"realman_avatar_imitator_v2v_gen_video",...}',  // 完整请求体预览
  accessKeyId: 'AKLTMDlm***'
}
```

### 第二步：验证 URL 可访问性

**测试图片 URL：**
1. 复制您输入的图片 URL
2. 在浏览器中打开
3. 确认可以直接显示图片（不是下载页面）

**测试视频 URL：**
1. 复制您输入的视频 URL
2. 在浏览器中打开
3. 确认可以直接播放视频（不是下载页面）

### 第三步：检查 AccessKey 权限

1. 登录火山引擎控制台
2. 进入 IAM 密钥管理
3. 检查 AccessKey 的权限设置
4. 确认有访问"视觉服务"的权限

### 第四步：确认服务开通状态

1. 登录火山引擎控制台
2. 进入"视觉服务"
3. 确认"动作模仿"服务已开通
4. 检查服务状态是否正常

## 测试用例

### 推荐的测试 URL

**图片 URL 示例：**
```
https://i.imgur.com/example.jpg
https://images.unsplash.com/photo-xxx
```

**视频 URL 示例：**  
```
https://storage.example.com/video.mp4
```

### 请求体格式示例

```json
{
  "req_key": "realman_avatar_imitator_v2v_gen_video",
  "image_url": "https://example.com/image.jpg",
  "driving_video_info": {
    "store_type": 0,
    "video_url": "https://example.com/video.mp4"
  }
}
```

## 常见问题排查

### Q1: 如何判断是URL问题还是认证问题？

**查看日志中的 `body_preview`：**
- 如果能看到完整的 URL，说明前端处理正常
- 检查 URL 是否以 `https://` 或 `http://` 开头
- 确认没有特殊字符或编码问题

### Q2: 如何判断签名是否正确？

**查看日志中的签名过程：**
```
Canonical Request: POST
/
Action=CVSubmitTask&Version=2022-08-31
content-type:application/json
host:visual.volcengineapi.com
x-date:20251012T223941Z
...
Signature: b35a8747820ac6b269f9a820cfbc46d26b5660a1c6b44847029aa655cd963aec
```

如果签名过程没有错误，说明签名生成正常。

### Q3: 400 错误的可能原因有哪些？

**按可能性排序：**
1. **URL 无法访问** (最常见)
   - 检查 URL 是否公开可访问
   - 测试是否需要登录或认证
   - 确认没有防盗链限制

2. **AccessKey 权限不足**
   - 检查 IAM 权限配置
   - 确认有"视觉服务"的访问权限
   - 验证 AccessKey 是否已激活

3. **服务未开通**
   - 确认已开通"动作模仿"服务
   - 检查服务地区是否正确（cn-north-1）
   - 验证账户状态正常

4. **请求格式问题**
   - 检查 `req_key` 是否正确
   - 确认 `store_type` 为 0
   - 验证 JSON 格式无误

## 下一步行动

### 方案 A：继续调试当前实现

1. 运行应用并提交任务
2. 检查新的详细日志
3. 根据日志信息定位问题
4. 提供日志给技术支持

### 方案 B：简化实现

如果 API 持续失败，可以考虑：

1. **使用测试 URL**
   - 使用公开的测试图片和视频
   - 排除 URL 访问问题

2. **联系技术支持**
   - 提供完整的请求日志
   - 确认 API 版本和参数
   - 验证账户权限设置

3. **参考官方 SDK**
   - 查看火山引擎官方文档
   - 使用官方 SDK 示例
   - 对比请求格式差异

## 参考资料

### 官方文档
- [火山引擎视觉服务](https://www.volcengine.com/docs/6790/overview)
- [IAM 访问控制](https://www.volcengine.com/docs/6257/overview)
- [Signature V4 签名](https://www.volcengine.com/docs/6790/65918)

### 相关文档
- [动作模仿 URL 限制说明](./MOTION_IMITATION_URL_ONLY.md)
- [动作模仿设置指南](./MOTION_IMITATION_SETUP.md)
- [Bug 修复记录](./MOTION_IMITATION_BUGFIXES.md)

## 日志分析示例

### 成功的请求应该包含：

```
✅ Motion Imitation Request: {
  image_url_type: 'url',           // ✓ 正确的 URL 类型
  image_url_preview: 'https://...',// ✓ 可访问的 URL
  body_preview: '{"req_key":...}', // ✓ 格式正确
  body_size: 150                   // ✓ 合理的大小（不是几MB）
}

✅ Motion Imitation Raw Response: {
  status: 200,                     // ✓ 成功状态码
  data: {
    task_id: '1234567890'         // ✓ 返回任务ID
  }
}
```

### 失败的请求可能显示：

```
❌ Motion Imitation Request: {
  image_url_type: 'base64',        // ✗ 错误：使用了base64
  image_url_length: 2500000,       // ✗ 错误：太大
  body_size: 3000000               // ✗ 错误：请求体过大
}

❌ Motion Imitation Raw Response: {
  status: 400,                     // ✗ 错误状态码
  responsePreview: 'Error when parsing request'
}
```

## 联系支持

如果问题持续，请提供以下信息：

1. **完整的终端日志** (包括请求和响应)
2. **使用的 URL** (用于测试访问性)
3. **AccessKey 配置** (隐藏敏感信息)
4. **账户和服务状态** (截图)

---

**更新时间：** 2025-10-13  
**版本：** v1.2.2  
**状态：** 调试中 - 等待详细日志输出

