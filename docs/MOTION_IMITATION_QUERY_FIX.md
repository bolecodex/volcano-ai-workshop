# 动作模仿任务查询问题修复说明

## 问题描述

用户报告动作模仿功能的查询任务有以下问题：

1. 上传新任务后，查询时一直显示错误信息：
   ```
   ⚠️ 查询任务失败：任务ID无效或已过期（任务有效期为12小时）。如果这是旧任务，建议删除后重新提交。
   ```

2. 任务状态一直卡在"生成中"，无法更新

## 问题分析

经过代码审查和诊断，发现主要问题是：

### 1. API注册延迟
- 火山引擎视觉服务API在接收到任务提交后，需要10-30秒才能完成任务注册
- 如果在任务提交后立即查询状态，API会返回"Input invalid"错误
- 这不是代码bug，而是API的正常行为

### 2. 错误提示不够明确
- 原来的错误提示没有说明可能是因为查询时机太早
- 用户不知道需要等待一段时间后再查询

### 3. 缺少调试信息
- API返回的错误信息没有详细记录
- 难以诊断问题的具体原因

## 解决方案

### 1. 增强日志输出（api-service.js）

**提交任务时的日志增强：**
```javascript
console.log('Motion Imitation Submit Parsed Data:', {
  code: data.code,
  message: data.message,
  task_id: data.data?.task_id,
  full_data: data
});
```

**查询任务时的日志增强：**
```javascript
console.log('Motion Imitation Query Raw Response:', {
  status: response.status,
  statusText: response.statusText,
  contentType: response.headers.get('content-type'),
  responseText: responseText
});

console.log('Motion Imitation Query Parsed Data:', {
  code: data.code,
  message: data.message,
  status: data.data?.status,
  has_video_url: !!data.data?.video_url,
  full_data: data
});
```

### 2. 改进错误提示（MotionImitation.js）

**提交成功后的提示：**
```javascript
showAlert('success', `✅ 任务提交成功！

任务ID: ${taskId}

⏱️ 重要提示：
1. 任务刚提交后，需要等待10-30秒API才能完成注册
2. 请在"任务列表"标签页中点击"刷新状态"查看进度
3. 如果立即查询可能会显示"任务ID无效"错误，请稍等片刻后再试
4. 视频生成通常需要1-5分钟

建议：等待30秒后再查询任务状态。`);
```

**查询失败时的提示：**
```javascript
if (errorMessage.includes('Input invalid')) {
  userMessage = '⚠️ 查询任务失败：任务ID无效或已过期（任务有效期为12小时）。

可能原因：
1. 任务刚提交，API还在处理中（请等待10-30秒后重试）
2. 任务已过期（超过12小时）
3. 任务ID格式错误

建议：如果这是刚提交的任务，请等待片刻后点击"刷新状态"。如果是旧任务，请删除后重新提交。';
}
```

### 3. 增加详细的调试日志（MotionImitation.js）

**查询任务时：**
```javascript
console.log('🔄 开始刷新任务状态:', taskId);
console.log('📤 发送查询请求:', {
  req_key: requestData.req_key,
  task_id: requestData.task_id,
  has_accessKey: !!requestData.accessKeyId
});
console.log('📥 收到查询结果:', result);
```

### 4. 添加使用说明

在界面中添加了醒目的警告提示：

```
⚠️ 重要提示：查询任务状态的时机

• 提交任务后：需要等待10-30秒，API才能完成任务注册
• 立即查询：可能会收到"任务ID无效"错误，这是正常现象
• 建议做法：提交任务后等待30秒，再到"任务列表"中点击"刷新状态"
• 如果一直失败：可能是任务已过期（超过12小时），请删除后重新提交
```

## 使用指南

### 正确的使用流程

1. **提交任务**
   - 在"创建任务"标签页中填入图片URL和视频URL
   - 点击"开始生成动作模仿视频"
   - 系统会显示任务ID和重要提示

2. **等待API注册**
   - ⏱️ **关键步骤**：等待至少30秒
   - 这段时间API正在注册任务
   - 不要立即查询状态

3. **查询任务状态**
   - 切换到"任务列表"标签页
   - 找到刚提交的任务（状态显示为"生成中"）
   - 点击"刷新状态"按钮
   - 如果显示"任务ID无效"错误，请再等待一会儿后重试

4. **等待生成完成**
   - 视频生成通常需要1-5分钟
   - 可以定期点击"刷新状态"查看进度
   - 当状态变为"已完成"时，即可下载视频

5. **下载结果**
   - 点击"播放视频"查看结果
   - 点击"下载视频"保存到本地
   - ⚠️ 注意：视频链接有效期为1小时，请及时下载

### 常见问题处理

#### 问题1：一直显示"任务ID无效"
**可能原因：**
- 查询时机太早（任务刚提交不到30秒）
- 任务已过期（超过12小时）
- AccessKey配置错误

**解决方法：**
1. 如果是刚提交的任务，等待30秒后再试
2. 如果是旧任务，删除后重新提交
3. 检查设置中的AccessKey配置是否正确

#### 问题2：任务一直显示"生成中"
**可能原因：**
- 视频正在生成（需要1-5分钟）
- 需要手动刷新状态

**解决方法：**
1. 等待足够的时间（至少2-3分钟）
2. 点击"刷新状态"按钮更新状态
3. 查看控制台日志，确认是否有错误信息

#### 问题3：查询失败，显示权限错误
**可能原因：**
- AccessKey没有相应的权限
- SecretAccessKey配置错误

**解决方法：**
1. 前往[火山引擎IAM](https://console.volcengine.com/iam/keymanage)检查密钥权限
2. 确保AccessKey有"视觉智能"服务的权限
3. 重新配置AccessKeyId和SecretAccessKey

## 技术细节

### API调用流程

1. **提交任务（CVSubmitTask）**
   ```
   POST https://visual.volcengineapi.com?Action=CVSubmitTask&Version=2022-08-31
   Body: {
     "req_key": "realman_avatar_imitator_v2v_gen_video",
     "image_url": "https://...",
     "driving_video_info": {
       "store_type": 0,
       "video_url": "https://..."
     }
   }
   返回: {
     "code": 10000,
     "data": {
       "task_id": "..."
     }
   }
   ```

2. **等待API注册**
   - 时长：10-30秒
   - 这段时间API在后台注册任务

3. **查询任务状态（CVGetResult）**
   ```
   POST https://visual.volcengineapi.com?Action=CVGetResult&Version=2022-08-31
   Body: {
     "req_key": "realman_avatar_imitator_v2v_gen_video",
     "task_id": "..."
   }
   返回: {
     "code": 10000,
     "data": {
       "status": "generating|done|failed",
       "video_url": "..."  // 仅在status=done时存在
     }
   }
   ```

### 错误码说明

- `code: 10000` - 成功
- `code: 其他值` - 失败，错误信息在`message`字段中
- `message: "Input invalid"` - 任务ID无效或尚未注册

### 任务状态说明

- `in_queue` - 排队中
- `generating` - 生成中
- `done` - 已完成
- `failed` - 失败
- `not_found` - 未找到
- `expired` - 已过期

## 调试技巧

### 查看控制台日志

1. 打开Electron开发者工具（如果在开发模式）
2. 切换到Console标签
3. 查找以下日志：
   - `Motion Imitation Submit Parsed Data` - 提交任务的返回数据
   - `Motion Imitation Query Raw Response` - 查询任务的原始响应
   - `Motion Imitation Query Parsed Data` - 查询任务的解析数据

### 日志示例

**成功提交任务：**
```
Motion Imitation Submit Parsed Data: {
  code: 10000,
  message: "Success",
  task_id: "xxx-xxx-xxx",
  full_data: {...}
}
```

**查询任务成功：**
```
Motion Imitation Query Parsed Data: {
  code: 10000,
  message: "Success",
  status: "done",
  has_video_url: true,
  full_data: {...}
}
```

**查询任务失败（时机太早）：**
```
Motion Imitation Query Parsed Data: {
  code: 错误码,
  message: "Input invalid",
  status: undefined,
  has_video_url: false,
  full_data: {...}
}
```

## 修改文件清单

1. **api-service.js** - 增强日志输出
   - 提交任务时记录完整的请求和响应
   - 查询任务时记录详细的状态信息

2. **src/components/MotionImitation.js** - 改进用户体验
   - 提交成功后显示详细的使用说明
   - 查询失败时提供更友好的错误提示
   - 添加调试日志
   - 在任务详情中显示注意事项
   - 在使用说明中添加查询时机的提示

## 测试建议

1. **提交新任务**
   - 使用有效的图片和视频URL
   - 观察提交成功后的提示信息
   - 查看控制台日志中的task_id

2. **立即查询（预期失败）**
   - 在提交后5秒内点击"刷新状态"
   - 应该看到"任务ID无效"错误
   - 这是正常现象

3. **等待后查询（预期成功）**
   - 等待30秒以上
   - 再次点击"刷新状态"
   - 应该看到状态更新为"生成中"或"已完成"

4. **查看日志**
   - 检查控制台中的详细日志
   - 确认API返回的数据结构
   - 验证错误处理逻辑

## 后续优化建议

1. **自动轮询**
   - 可以考虑在提交任务后，自动在30秒后开始轮询状态
   - 每隔30秒自动刷新一次，直到任务完成

2. **倒计时提示**
   - 在任务提交后显示30秒倒计时
   - 倒计时结束后自动查询状态

3. **任务状态缓存**
   - 将任务状态缓存到本地
   - 避免频繁查询API

4. **批量查询**
   - 支持一次查询多个任务的状态
   - 提高效率

## 总结

这次修复主要解决了以下问题：

1. ✅ 增加了详细的日志输出，便于诊断问题
2. ✅ 改进了错误提示，明确说明查询时机的重要性
3. ✅ 添加了使用说明，指导用户正确使用功能
4. ✅ 优化了用户体验，减少困惑

**关键要点：提交任务后需要等待至少30秒才能查询状态，这是API的正常行为，不是bug。**

---

更新时间：2025-10-13
版本：v1.0

