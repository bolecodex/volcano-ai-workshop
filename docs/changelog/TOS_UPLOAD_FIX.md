# TOS上传功能修复

## 更新日期
2025-10-16

## 问题描述

在使用本地文件上传功能时，遇到了TOS上传认证失败的错误：

```
Error: 上传失败: HTTP 400
{"Code":"InvalidArgument","Message":"Unsupported Authorization Type"}
```

错误原因：代码使用了AWS S3兼容的 `AWS4-HMAC-SHA256` 签名方式，但火山引擎TOS不支持这种认证类型。

## 修复方案

改用火山引擎TOS官方SDK（`@volcengine/tos-sdk`）来处理文件上传和预签名URL生成。

## 技术变更

### 文件修改：`api-service.js`

#### 1. 修复 `uploadToTOS()` 方法

**之前的实现**（有问题）:
```javascript
// 使用手动签名方式
const signer = new SignatureV4(config.accessKeyId, config.secretAccessKey, {
  service: 'tos',
  region: region
});
const signedHeaders = signer.sign('PUT', uploadUrl, baseHeaders, fileData.buffer);
```

**修复后的实现**:
```javascript
// 使用官方TOS SDK
const { TosClient } = require('@volcengine/tos-sdk');

const client = new TosClient({
  accessKeyId: config.accessKeyId,
  accessKeySecret: config.secretAccessKey,
  region: region,
  endpoint: `tos-${region}.volces.com`,
  secure: true
});

const uploadResult = await client.putObject({
  bucket: config.bucket,
  key: objectKey,
  body: Buffer.from(fileData.buffer),
  contentType: fileData.type || 'application/octet-stream'
});
```

#### 2. 修复 `getTosPreSignedUrl()` 方法

同样改用TosClient而不是手动构造签名。

**关键修改**:
```javascript
// 错误的导入方式
const TOS = require('@volcengine/tos-sdk');  // ❌ TOS is not a constructor

// 正确的导入方式
const { TosClient } = require('@volcengine/tos-sdk');  // ✅ 正确
```

## 测试验证

### 上传流程
1. 用户选择本地图片/视频文件
2. 文件通过IPC发送到主进程
3. 使用TosClient.putObject()上传文件
4. 返回可访问的公网URL
5. 使用该URL提交动作模仿任务

### 预签名URL流程
1. 从向量库搜索结果获取 `tos://bucket/object_key` 格式的URL
2. 使用TosClient.getPreSignedUrl()生成临时访问链接
3. 前端使用预签名URL播放/下载视频

## 使用说明

### TOS配置要求

在设置页面需要配置以下信息：
- **AccessKeyId**: 火山引擎访问密钥ID
- **SecretAccessKey**: 火山引擎访问密钥Secret
- **TOS Bucket**: 对象存储桶名称
- **Region**: 区域（默认：cn-beijing）

### 权限要求

AccessKey需要具有以下TOS权限：
- `PutObject` - 上传文件
- `GetObject` - 读取文件
- `GetObjectPreSignedUrl` - 生成预签名URL

### 示例配置

```javascript
{
  "accessKeyId": "AKLTxxxxxxxx",
  "secretAccessKey": "xxxxxxxx",
  "bucket": "my-bucket",
  "region": "cn-beijing"
}
```

## 相关文档

- [火山引擎TOS SDK文档](https://www.volcengine.com/docs/6349/74854)
- [TOS Node.js SDK](https://github.com/volcengine/ve-tos-js-sdk)

## 注意事项

⚠️ **重要提示**:

1. **Bucket权限**: 确保Bucket设置了公共读权限或配置了正确的访问策略
2. **跨域配置**: 如果需要在浏览器中直接访问，需要配置CORS规则
3. **文件大小限制**: 
   - 图片建议不超过10MB
   - 视频建议不超过50MB
4. **命名规范**: 上传的文件会自动添加时间戳和随机字符串避免冲突
5. **URL有效期**: 
   - 直接上传的URL为永久有效（取决于Bucket配置）
   - 预签名URL默认1小时有效期

## 后续优化建议

- [ ] 添加上传进度显示
- [ ] 支持大文件分片上传
- [ ] 添加上传失败重试机制
- [ ] 缓存已上传文件的URL避免重复上传
- [ ] 支持从历史上传中选择文件

## 测试结果

✅ 本地图片上传 - 通过  
✅ 本地视频上传 - 通过  
✅ 预签名URL生成 - 通过  
✅ 向量搜索视频播放 - 通过  
✅ 动作模仿任务提交 - 通过


