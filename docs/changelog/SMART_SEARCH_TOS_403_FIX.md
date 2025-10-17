# 智能搜索 TOS 403 错误修复

## 问题描述

在智能搜索功能中,访问火山引擎 TOS(对象存储)中的视频文件时出现 403 Forbidden 错误。错误表现为:

```
GET https://zhaoweibo-video-demo.tos-cn-beijing.volces.com/0005.mp4 403 (Forbidden)
GET https://zhaoweibo-video-demo.tos-cn-beijing.volces.com/0012.mp4 403 (Forbidden)
...
```

## 根本原因

1. **未签名的 URL 访问**: 代码尝试直接访问 HTTPS 格式的 TOS URL,但这些 URL 指向的是私有 bucket,需要签名才能访问
2. **URL 格式识别问题**: 代码只识别 `tos://` 格式的 URL,但实际从 VikingDB 返回的是 HTTPS 格式的 TOS URL
3. **预签名 URL 生成问题**: 预签名 URL 的生成算法在 URI 编码和查询参数排序方面存在问题

## 修复内容

### 1. 智能搜索组件 (`src/components/SmartSearch.js`)

#### 改进 URL 识别逻辑

```javascript
// 新增:识别 HTTPS 格式的 TOS URL
const isHttpsTosUrl = videoUrl && typeof videoUrl === 'string' && 
  (videoUrl.includes('.tos-cn-beijing.volces.com/') || 
   (videoUrl.includes('.tos') && videoUrl.includes('.volces.com/')));

// 排除 TOS 的 HTTPS URL,避免误判为普通 HTTP URL
let isHttpUrl = videoUrl && typeof videoUrl === 'string' && 
  (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) && 
  !isHttpsTosUrl;
```

#### 改进 URL 使用逻辑

```javascript
// 检查是否已有预签名URL
if (presignedUrls[videoUrl]) {
  displayUrl = presignedUrls[videoUrl];
  isHttpUrl = true;
} else if (isTosUrl || isHttpsTosUrl) {
  // 需要预签名URL但还未生成
  needsPresignedUrl = true;
  displayUrl = null; // 不显示未签名的URL,防止403错误
} else if (isHttpUrl) {
  // 普通的HTTP URL,可以直接使用
  displayUrl = videoUrl;
}
```

#### 改进视频显示逻辑

新增状态提示,在预签名 URL 未生成时显示锁定图标和提示信息:

```javascript
{needsPresignedUrl && !displayUrl ? (
  <div className="text-white text-center">
    <i className="bi bi-lock" style={{ fontSize: '48px' }}></i>
    <div className="mt-2 small">
      需要生成预签名URL才能访问
    </div>
  </div>
) : ...}
```

### 2. API 服务 (`api-service.js`)

#### 优化 TOS 预签名 URL 生成算法

**修复前的问题:**
- URI 编码不完整
- 查询参数使用 `URLSearchParams` 可能导致编码问题
- 缺少调试日志

**修复后的改进:**

```javascript
// 1. 正确的 URI 编码(保留斜杠)
const canonicalUri = '/' + objectKey.split('/').map(part => encodeURIComponent(part)).join('/');

// 2. 手动构造规范查询字符串(按键排序)
const queryParamsMap = {
  'X-Tos-Algorithm': 'TOS4-HMAC-SHA256',
  'X-Tos-Credential': credential,
  'X-Tos-Date': amzDate,
  'X-Tos-Expires': expiresIn.toString(),
  'X-Tos-SignedHeaders': 'host'
};

const canonicalQueryString = Object.keys(queryParamsMap)
  .sort()
  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParamsMap[key])}`)
  .join('&');

// 3. 添加调试日志
console.log('📝 Canonical Request:', canonicalRequest.substring(0, 200));
console.log('📝 String to Sign:', stringToSign);
console.log('🔐 Signature:', signature);
```

## 技术细节

### TOS 预签名 URL 原理

TOS 使用兼容 AWS S3 的 Signature V4 签名算法:

1. **规范请求 (Canonical Request)**
   ```
   HTTP_METHOD\n
   CANONICAL_URI\n
   CANONICAL_QUERY_STRING\n
   CANONICAL_HEADERS\n
   SIGNED_HEADERS\n
   PAYLOAD_HASH
   ```

2. **待签名字符串 (String to Sign)**
   ```
   TOS4-HMAC-SHA256\n
   TIMESTAMP\n
   CREDENTIAL_SCOPE\n
   HASHED_CANONICAL_REQUEST
   ```

3. **签名密钥派生 (Signing Key)**
   ```
   kDate = HMAC("TOS4" + SecretKey, DateStamp)
   kRegion = HMAC(kDate, Region)
   kService = HMAC(kRegion, "tos")
   kSigning = HMAC(kService, "request")
   ```

4. **最终签名 (Signature)**
   ```
   Signature = HMAC(kSigning, StringToSign).hex()
   ```

### URL 编码规范

根据 AWS Signature V4 规范:
- URI 路径中的斜杠 `/` 不编码
- 特殊字符需要百分号编码
- 查询参数的键和值都需要编码
- 查询参数必须按字母顺序排序

## 使用方法

### 1. 重启应用

```bash
cd /Users/bytedance/Documents/实验/volcano-ai-workshop
npm run desktop
```

### 2. 配置访问密钥

在应用的"设置"页面配置:
- AccessKeyId: 你的火山引擎访问密钥 ID
- SecretAccessKey: 你的火山引擎访问密钥

确保该密钥具有以下权限:
- `tos:GetObject` - 读取 TOS 对象
- 对应 bucket 的访问权限

### 3. 使用智能搜索

1. 进入"智能搜索"页面
2. 配置数据集名称和索引名称
3. 选择搜索模式(文本/图片/视频/混合)
4. 输入搜索内容
5. 点击"开始搜索"

### 4. 观察预签名 URL 生成过程

在搜索结果中,你会看到:

1. **生成中**: 显示加载动画和"正在生成访问链接..."
2. **成功**: 视频可以正常播放,底部显示"已使用预签名URL(1小时有效期)"
3. **未生成**: 显示锁定图标和"需要生成预签名URL才能访问"

### 5. 查看调试日志

打开开发者工具(F12),在控制台中查看:

```
🔗 生成 TOS 预签名 URL: tos://bucket/objectKey
📝 Canonical Request: GET
/path/to/object...
📝 String to Sign: TOS4-HMAC-SHA256
20251015T123456Z...
🔐 Signature: abc123def456...
✅ 预签名 URL 生成成功
```

## 预期结果

修复后:
- ✅ 不再出现 403 Forbidden 错误
- ✅ TOS 视频可以正常播放
- ✅ 预签名 URL 自动生成
- ✅ 有清晰的加载状态提示
- ✅ 有详细的调试日志

## 注意事项

### 1. 预签名 URL 有效期

预签名 URL 默认有效期为 1 小时。过期后需要重新搜索或刷新页面以生成新的预签名 URL。

### 2. TOS Bucket 权限

确保你的 AccessKey 对目标 bucket 有读取权限。如果出现权限错误,请检查:

- IAM 策略是否包含 `tos:GetObject` 权限
- Bucket 策略是否允许该 AccessKey 访问
- 资源的 ACL 设置

### 3. CORS 配置

如果视频无法在浏览器中播放,可能需要在 TOS bucket 中配置 CORS:

```json
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["Content-Length", "Content-Type"],
  "MaxAgeSeconds": 3600
}
```

### 4. 网络问题

如果预签名 URL 生成成功但视频仍无法加载,检查:

- 网络连接是否正常
- 是否有防火墙或代理阻止访问
- TOS endpoint 是否可访问

## 故障排查

### 问题 1: 仍然出现 403 错误

**可能原因:**
- AccessKey 权限不足
- 签名算法有误
- 时间戳不同步

**解决方法:**
1. 验证 AccessKey 权限
2. 检查控制台的签名日志
3. 确保系统时间准确

### 问题 2: 视频不显示

**可能原因:**
- 预签名 URL 未生成
- 网络问题
- CORS 配置问题

**解决方法:**
1. 查看是否有"正在生成访问链接..."提示
2. 检查网络连接
3. 配置 bucket CORS

### 问题 3: 签名不匹配

**可能原因:**
- URI 编码问题
- 查询参数顺序不对
- SecretKey 错误

**解决方法:**
1. 查看控制台的详细日志
2. 验证 Canonical Request 格式
3. 确认 SecretKey 正确

## 相关文件

- `src/components/SmartSearch.js` - 智能搜索前端组件
- `api-service.js` - API 服务层(包含预签名 URL 生成)
- `desktop-app.js` - Electron IPC 通信注册
- `public/preload.js` - preload 脚本(暴露 IPC 接口)

## 参考文档

- [火山引擎 TOS 预签名 URL](https://www.volcengine.com/docs/6349/74881)
- [AWS Signature Version 4 签名流程](https://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html)
- [火山引擎 VikingDB 多模态检索](https://www.volcengine.com/docs/84313/1254471)

## 更新日志

**日期**: 2025-10-15
**版本**: 1.0.1
**作者**: AI Assistant

**更改内容**:
1. 修复 TOS URL 识别逻辑
2. 优化预签名 URL 生成算法
3. 改进视频加载状态显示
4. 添加详细的调试日志
5. 更新错误提示信息



