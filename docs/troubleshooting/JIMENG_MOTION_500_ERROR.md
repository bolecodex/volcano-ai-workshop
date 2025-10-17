# 即梦动作模仿持续500错误诊断指南

## 问题现象

任务提交成功后，查询状态时持续返回500 Internal Error，即使等待6分钟以上仍然失败。

## 已排除的原因

✅ 任务提交成功（获得task_id）  
✅ 文件上传成功（TOS返回200）  
✅ 认证正确（签名验证通过）  
✅ 等待时间充足（超过6分钟）

## 可能的原因和解决方案

### 1. TOS Bucket权限问题 ⭐⭐⭐⭐⭐

**最可能的原因！**

即梦API需要能够访问你上传的图片和视频URL。如果Bucket没有设置公共读权限，API无法下载文件导致处理失败。

#### 检查方法

在浏览器中直接访问上传后的URL：
```
https://zhaoweibo-video-demo.tos-cn-beijing.volces.com/motion-imitation/1760620078898-1ymnby.jpeg
```

如果看到：
- ✅ **可以打开** → Bucket权限正常
- ❌ **403 Forbidden / Access Denied** → **这就是问题所在！**

#### 解决方案

登录火山引擎TOS控制台：
1. 找到你的Bucket：`zhaoweibo-video-demo`
2. 进入"权限管理" → "访问权限"
3. 设置为"公共读"或"公共读写"
4. 或者配置自定义策略允许API访问

**详细步骤：**

```
火山引擎控制台
  → 对象存储 TOS
  → 选择 Bucket: zhaoweibo-video-demo
  → 权限管理
  → 访问权限设置
  → 选择"公共读"
  → 保存
```

### 2. 服务开通问题 ⭐⭐⭐⭐

检查是否开通了即梦动作模仿服务。

#### 检查方法

1. 登录火山引擎控制台
2. 进入"视觉智能" → "即梦AI"
3. 检查"动作模仿"服务状态
4. 查看是否有API调用配额

#### 解决方案

如果未开通：
- 申请开通即梦动作模仿服务
- 确保账号有足够余额
- 等待审核通过

### 3. 文件格式问题 ⭐⭐⭐

虽然上传成功，但文件内容可能不符合要求。

#### 检查清单

**图片要求：**
- ✅ 格式：JPEG, PNG
- ✅ 包含清晰可见的人脸
- ✅ 分辨率：建议512x512到2048x2048
- ✅ 大小：不超过10MB
- ✅ 无损坏

**视频要求：**
- ✅ 格式：MP4 (H.264编码)
- ✅ 包含清晰的人物动作
- ✅ 时长：建议3-30秒
- ✅ 分辨率：建议720p-1080p
- ✅ 帧率：建议24-30fps
- ✅ 大小：不超过50MB

#### 解决方案

使用标准的测试文件重试：
- 使用公开的示例图片和视频
- 确保文件符合所有技术要求
- 尝试压缩和优化文件

### 4. 尝试经典版本 ⭐⭐⭐

即梦接口可能有问题，但经典接口可能正常。

#### 测试步骤

1. 打开动作模仿页面
2. 选择"经典版本"而不是"即梦动作模仿"
3. 使用相同的文件提交任务
4. 如果经典版本能成功，说明是即梦API的问题

### 5. 联系技术支持 ⭐⭐

如果以上都不能解决，建议联系火山引擎技术支持。

#### 提供的信息

准备好以下信息：
```
问题描述：即梦动作模仿任务持续返回500错误
任务ID示例：
  - 5830178714494046720
  - 524032755273711396
请求ID示例：
  - 20251016211027E7F52A1A7A559CD3D01E
  - 20251016211411F312D6E4BFC5B1EFD15B
图片URL：https://zhaoweibo-video-demo.tos-cn-beijing.volces.com/motion-imitation/1760620078898-1ymnby.jpeg
视频URL：https://zhaoweibo-video-demo.tos-cn-beijing.volces.com/motion-imitation/1760620079350-8vbnu9.mp4
错误码：50500
错误信息：Internal Error
```

## 立即行动方案

### 优先级1：检查Bucket权限（最重要！）

```bash
# 在浏览器或终端测试URL
curl -I https://zhaoweibo-video-demo.tos-cn-beijing.volces.com/motion-imitation/1760620078898-1ymnby.jpeg

# 如果返回403，需要设置Bucket为公共读
```

### 优先级2：使用公开URL测试

使用一个公开可访问的测试文件：

**测试图片URL：**
```
https://i.imgur.com/your-test-image.jpg
```

**测试视频URL：**
```
https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4
```

### 优先级3：切换到经典版本

在应用中：
1. 打开动作模仿
2. 选择"经典版本"
3. 提交相同的任务
4. 对比结果

## 诊断脚本

创建一个简单的测试脚本来检查URL：

```bash
#!/bin/bash
echo "检查图片URL..."
curl -I https://zhaoweibo-video-demo.tos-cn-beijing.volces.com/motion-imitation/1760620078898-1ymnby.jpeg

echo -e "\n检查视频URL..."
curl -I https://zhaoweibo-video-demo.tos-cn-beijing.volces.com/motion-imitation/1760620079350-8vbnu9.mp4

echo -e "\n如果看到403错误，需要设置Bucket公共读权限"
```

## 成功案例参考

如果配置正确，应该看到：

```
✅ TOS Upload Result: { statusCode: 200 }
✅ Task Submit: { code: 10000, task_id: 'xxx' }
✅ Task Query (5分钟后): { status: 'generating' 或 'done' }
```

## 常见错误对照表

| 错误现象 | 可能原因 | 解决方案 |
|---------|---------|---------|
| 持续500错误 | Bucket权限问题 | 设置公共读 |
| 403 Forbidden | 未开通服务 | 申请开通 |
| 立即返回500 | 文件格式错误 | 检查文件 |
| 任务not_found | task_id错误 | 检查ID |
| 任务expired | 超过12小时 | 重新提交 |

## 下一步建议

1. **立即检查** Bucket权限（最可能的问题）
2. **在浏览器测试** 上传的URL是否可访问
3. **尝试使用** 公开的测试URL
4. **切换到** 经典版本进行对比测试
5. **如果都失败** 联系火山引擎技术支持

## 相关文档

- [TOS权限配置指南](https://www.volcengine.com/docs/6349/74821)
- [即梦动作模仿API文档](../../api/即梦动作模仿.md)
- [错误处理改进文档](../changelog/MOTION_IMITATION_ERROR_HANDLING_IMPROVEMENT.md)


