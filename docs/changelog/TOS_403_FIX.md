# TOS 视频 403 Forbidden 错误修复

## 问题描述

在智能搜索功能中，从火山引擎 TOS（对象存储）获取视频文件时出现 403 Forbidden 错误：

```
GET https://zhaoweibo-video-demo.tos-cn-beijing.volces.com/0006.mp4 403 (Forbidden)
GET https://zhaoweibo-video-demo.tos-cn-beijing.volces.com/0005.mp4 403 (Forbidden)
GET https://zhaoweibo-video-demo.tos-cn-beijing.volces.com/0012.mp4 403 (Forbidden)
...
```

## 原因分析

1. **TOS Bucket 权限设置**：TOS bucket 设置了访问权限，不允许匿名访问
2. **URL 需要签名**：即使是 HTTPS 格式的 URL，也需要通过签名认证才能访问私有资源
3. **原代码问题**：代码仅为 `tos://` 格式的URL生成预签名URL，但实际返回的是 HTTPS 格式的 URL

## 解决方案

### 1. 识别所有 TOS URL

修改代码以识别两种格式的 TOS URL：
- `tos://bucket/object_key` 格式
- `https://bucket.tos-cn-beijing.volces.com/object_key` 格式

### 2. 自动生成预签名 URL

对所有 TOS URL（不管格式如何）自动生成预签名 URL，使其可以被浏览器访问。

### 3. 实现步骤

#### 步骤 1：更新预签名 URL 生成逻辑

在 `SmartSearch.js` 的 `useEffect` 中，添加对 HTTPS 格式 TOS URL 的识别：

```javascript
// 检查是否是 TOS URL (tos://格式)
if (videoUrl.startsWith('tos://')) {
  tosUrl = videoUrl;
  needsPresigning = true;
}
// 检查是否是 TOS HTTPS URL
else if (videoUrl.includes('.tos-cn-beijing.volces.com/') || 
         videoUrl.includes('.tos') && videoUrl.includes('.volces.com/')) {
  // 从HTTPS URL转换回TOS URL格式
  const httpsMatch = videoUrl.match(/https?:\/\/([^.]+)\.tos[^/]*\.volces\.com\/(.+)$/);
  if (httpsMatch) {
    const [, bucket, objectKey] = httpsMatch;
    tosUrl = `tos://${bucket}/${objectKey}`;
    needsPresigning = true;
  }
}
```

#### 步骤 2：优先使用预签名 URL

在渲染视频时，优先检查是否已生成预签名 URL：

```javascript
// 优先使用预签名URL，如果没有则转换为HTTP地址
let displayUrl = videoUrl;
let needsPresignedUrl = false;

if (isTosUrl) {
  // 检查是否已有预签名URL
  if (presignedUrls[videoUrl]) {
    displayUrl = presignedUrls[videoUrl];
    isHttpUrl = true;
  } else {
    // 标记需要预签名URL
    needsPresignedUrl = true;
  }
}
```

#### 步骤 3：添加加载状态提示

在生成预签名 URL 期间显示加载提示：

```javascript
{needsPresignedUrl && generatingUrls ? (
  <div className="text-white text-center">
    <Spinner animation="border" variant="light" className="mb-2" />
    <div className="small">正在生成访问链接...</div>
  </div>
) : isHttpUrl ? (
  <video controls preload="metadata">
    <source src={displayUrl} type="video/mp4" />
  </video>
) : (
  // 默认视频图标
)}
```

## 技术细节

### TOS 预签名 URL 原理

TOS 预签名 URL 使用 Signature V4 算法生成临时访问链接：

1. **凭证范围**：`{dateStamp}/{region}/tos/request`
2. **签名算法**：TOS4-HMAC-SHA256
3. **有效期**：默认 1 小时（可配置）
4. **查询参数**：
   - `X-Tos-Algorithm`: 签名算法
   - `X-Tos-Credential`: AccessKeyId 和凭证范围
   - `X-Tos-Date`: ISO 8601 格式的时间戳
   - `X-Tos-Expires`: 有效期（秒）
   - `X-Tos-SignedHeaders`: 签名的头部列表
   - `X-Tos-Signature`: 签名值

### 签名计算步骤

```javascript
// 1. 构造规范请求
const canonicalRequest = [
  'GET',
  canonicalUri,
  canonicalQueryString,
  canonicalHeaders,
  signedHeaders,
  payloadHash
].join('\n');

// 2. 生成待签名字符串
const stringToSign = [
  'TOS4-HMAC-SHA256',
  amzDate,
  credentialScope,
  canonicalRequestHash
].join('\n');

// 3. 计算签名密钥
const kDate = hmac('TOS4' + secretKey, dateStamp);
const kRegion = hmac(kDate, region);
const kService = hmac(kRegion, 'tos');
const kSigning = hmac(kService, 'request');

// 4. 生成签名
const signature = hmac(kSigning, stringToSign).hex();
```

## 配置要求

### 1. AccessKey 权限

确保 AccessKeyId 和 SecretAccessKey 具有以下权限：
- `tos:GetObject` - 读取对象
- 对应 bucket 的访问权限

### 2. CORS 配置

如果在浏览器中直接访问 TOS 资源，bucket 需要配置 CORS：

```json
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": [],
  "MaxAgeSeconds": 3600
}
```

## 用户体验改进

### 1. 状态提示

- **生成中**：显示加载动画和"正在生成访问链接..."
- **成功**：显示"已使用预签名URL（1小时有效期）"
- **失败**：显示"TOS资源需要预签名URL才能访问"

### 2. 自动重试

如果预签名 URL 生成失败，系统会在下次搜索时重新尝试。

### 3. 缓存机制

已生成的预签名 URL 会被缓存在组件状态中，避免重复生成。

## 常见问题

### Q1: 为什么视频还是无法播放？

**可能原因**：
1. AccessKey 权限不足
2. bucket 名称或 endpoint 配置错误
3. 网络问题

**解决方法**：
- 检查浏览器控制台的错误信息
- 确认 AccessKey 有 `tos:GetObject` 权限
- 验证 bucket 和 endpoint 配置

### Q2: 预签名 URL 的有效期是多久？

默认 1 小时。可以在调用 `getTosPreSignedUrl` 时通过 `expiresIn` 参数配置（单位：秒）。

### Q3: 如何查看详细的调试信息？

打开浏览器控制台，查看以下日志：
- `🔗 生成 TOS 预签名 URL:` - 开始生成
- `✅ 预签名 URL 生成成功` - 生成成功
- `❌ 预签名 URL 生成失败:` - 生成失败及错误信息

## 相关文件

- `src/components/SmartSearch.js` - 智能搜索前端组件
- `api-service.js` - API 服务层（包含 getTosPreSignedUrl 实现）
- `desktop-app.js` - Electron IPC 通信注册
- `public/preload.js` - preload 脚本（暴露 IPC 接口）

## 参考文档

- [火山引擎 TOS 预签名 URL 文档](https://www.volcengine.com/docs/6349/74881)
- [AWS Signature V4 签名规范](https://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html)

