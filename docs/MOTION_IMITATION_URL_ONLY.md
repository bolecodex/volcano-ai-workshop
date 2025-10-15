# 动作模仿功能 - 仅支持URL方式说明

## 问题说明

在测试动作模仿功能时，遇到 `400 Bad Request: Error when parsing request` 错误。

### 错误日志

```
Motion Imitation Raw Response: {
  status: 400,
  statusText: 'Bad Request',
  contentType: 'text/plain; charset=utf-8',
  responsePreview: 'Error when parsing request'
}
```

## 问题原因

经过分析API文档和测试，发现：

### 1. API限制

火山引擎视觉服务的动作模仿API **仅支持URL格式的输入**，不支持base64编码的图片和视频数据。

根据官方文档示例：

```json
{
    "req_key": "realman_avatar_imitator_v2v_gen_video",
    "image_url": "https://xxxxx.jpeg",     // 必须是URL
    "driving_video_info":  {
        "store_type": 0,
        "video_url": "https://xxxxx.mp4"   // 必须是URL
    }
}
```

### 2. 之前的实现问题

- 允许用户上传本地文件
- 将文件转换为base64编码
- 尝试将base64数据发送给API
- 导致 `400 Bad Request` 错误

## 解决方案

### 已实施的修复

✅ **1. 移除本地文件上传功能**
- 删除文件上传选项
- 移除 `handleImageFileChange` 和 `handleVideoFileChange` 函数
- 移除 `fileToBase64` 转换函数

✅ **2. 简化UI为纯URL输入**
- 只保留URL输入框
- 添加URL格式验证
- 明确提示仅支持URL方式

✅ **3. 增强输入验证**
```javascript
// 验证URL格式
try {
  new URL(formData.imageUrl.trim());
  new URL(formData.videoUrl.trim());
} catch (urlError) {
  showAlert('warning', '请输入有效的URL地址（必须以 http:// 或 https:// 开头）');
  return;
}
```

✅ **4. 更新使用说明**
- 添加醒目的警告提示
- 说明必须使用URL方式
- 推荐图床和对象存储服务
- 提供完整的使用流程

✅ **5. 增强日志记录**
- 记录URL类型（URL vs base64）
- 记录请求体大小
- 便于问题排查

## 使用指南

### 准备工作

#### 1. 图片上传服务推荐

**免费图床服务：**
- [Imgur](https://imgur.com/) - 国际知名图床
- [SM.MS](https://sm.ms/) - 免费图床，支持中文
- [路过图床](https://imgse.com/) - 国内访问快

**云存储服务：**
- 火山引擎TOS（推荐）
- 阿里云OSS
- 腾讯云COS
- 七牛云KODO
- 又拍云

#### 2. 视频上传服务推荐

**对象存储服务（推荐）：**
- 火山引擎TOS
- 阿里云OSS
- 腾讯云COS
- AWS S3

**注意：** 视频文件较大，建议使用专业的对象存储服务，而不是普通图床。

### 使用步骤

#### 第一步：上传图片
1. 准备一张包含人脸的图片（JPEG或PNG格式）
2. 上传到图床服务（如Imgur、火山引擎TOS）
3. 获取图片的公开访问URL
4. 确保URL可以直接在浏览器中打开

#### 第二步：上传视频
1. 准备驱动视频（MP4、MOV或AVI格式）
2. 上传到对象存储服务（如火山引擎TOS）
3. 设置视频为公开可访问
4. 获取视频的公开访问URL
5. 确保URL可以直接在浏览器中播放

#### 第三步：使用系统
1. 在"动作模仿"页面中
2. 输入图片URL到"图片URL地址"框
3. 输入视频URL到"视频URL地址"框
4. 确保已配置 AccessKeyId 和 SecretAccessKey
5. 点击"开始生成动作模仿视频"按钮
6. 等待处理完成（1-5分钟）
7. 下载生成的视频

### URL示例

#### 正确的URL格式 ✅

```
图片URL:
https://example.com/images/portrait.jpg
https://i.imgur.com/abc123.png
https://tos-cn-beijing.volces.com/bucket/image.jpg

视频URL:
https://example.com/videos/dance.mp4
https://tos-cn-beijing.volces.com/bucket/video.mp4
https://storage.example.com/animations/motion.mp4
```

#### 错误的格式 ❌

```
❌ 本地文件路径: C:\Users\user\image.jpg
❌ 相对路径: ./images/photo.png
❌ base64编码: data:image/jpeg;base64,/9j/4AAQ...
❌ 没有协议: example.com/image.jpg
```

## 技术细节

### API请求格式

```javascript
// 正确的请求体
{
  "req_key": "realman_avatar_imitator_v2v_gen_video",
  "image_url": "https://example.com/image.jpg",  // 必须是完整的HTTP/HTTPS URL
  "driving_video_info": {
    "store_type": 0,                              // 固定值
    "video_url": "https://example.com/video.mp4"  // 必须是完整的HTTP/HTTPS URL
  }
}
```

### 代码改进

**修改前：**
```javascript
// 支持本地文件上传，转换为base64
if (formData.useImageFile) {
  imageUrl = await fileToBase64(formData.imageFile);  // ❌ API不支持
} else {
  imageUrl = formData.imageUrl.trim();
}
```

**修改后：**
```javascript
// 只支持URL，添加验证
if (!formData.imageUrl.trim()) {
  showAlert('warning', '请输入图片URL地址');
  return;
}

// 验证URL格式
try {
  new URL(formData.imageUrl.trim());
} catch (urlError) {
  showAlert('warning', '请输入有效的URL地址');
  return;
}

const imageUrl = formData.imageUrl.trim();  // ✅ 直接使用URL
```

## 常见问题

### Q1: 为什么不能上传本地文件？
**A:** 火山引擎的动作模仿API只接受URL格式的输入，不支持base64编码。这是API本身的限制，不是系统的限制。

### Q2: 如何将本地文件转换为URL？
**A:** 
1. 将文件上传到图床或对象存储服务
2. 获取上传后的公开访问链接
3. 使用这个链接作为URL输入

### Q3: 可以使用百度网盘、OneDrive等网盘链接吗？
**A:** 不可以。必须是**直接访问**的图片/视频URL，在浏览器中打开链接应该直接显示图片或播放视频，而不是网盘的分享页面。

### Q4: URL需要什么权限？
**A:** URL必须是**公开可访问**的，不需要登录、不需要认证、不需要下载器。火山引擎的服务器需要能够直接访问这个URL。

### Q5: 推荐使用哪个服务？
**A:** 
- **图片**：建议使用Imgur或SM.MS（免费、稳定）
- **视频**：建议使用火山引擎TOS或阿里云OSS（稳定、快速、与API在同一云服务商）

### Q6: 视频链接会过期吗？
**A:** 
- 输入的URL：取决于您使用的服务（建议设置较长或永久有效期）
- 生成的视频URL：**有效期1小时**，请及时下载保存

### Q7: 遇到"URL无法访问"错误怎么办？
**A:** 
1. 在浏览器中直接打开URL，确认可以正常访问
2. 检查URL是否包含完整的协议（http:// 或 https://）
3. 确认文件权限设置为公开可访问
4. 尝试使用其他图床或存储服务

## 相关文档

- [动作模仿功能设置指南](./MOTION_IMITATION_SETUP.md)
- [动作模仿任务列表功能](./MOTION_IMITATION_TASK_LIST.md)
- [API文档](./单图视频驱动.md)

## 更新日志

**v1.2.0** - 2025-10-13
- 🔧 修复：移除不支持的base64编码方式
- ✨ 改进：简化UI为纯URL输入
- ✨ 新增：URL格式验证
- 📝 更新：使用说明和警告提示
- 🐛 修复：400 Bad Request错误

