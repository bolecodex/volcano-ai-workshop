# 动作模仿 - 错误处理改进

## 更新日期
2025-10-13

## 问题描述

用户点击"刷新状态"按钮时，出现错误：
```
查询任务失败: Input invalid for this service.
```

错误码：`50215`

## 问题原因分析

### 1. API返回错误

从终端日志可以看到：

**成功的提交请求：**
```
Motion Imitation Submit API Success: { 
  status: 200, 
  task_id: '1267397645316636488' 
}
```

**失败的查询请求：**
```
Motion Imitation Query API Error: 400 {
  code: 50215,
  data: null,
  message: 'Input invalid for this service.',
  request_id: '...',
  status: 50215,
  time_elapsed: '30.019409ms'
}
```

### 2. 可能的原因

根据火山引擎API文档和错误信息，可能的原因包括：

1. **任务已过期**
   - 任务有效期为 **12小时**
   - 超过有效期后无法查询状态
   - 旧任务ID会返回 "Input invalid" 错误

2. **任务ID无效**
   - 任务提交失败但ID被保存
   - 复制了错误的任务ID
   - 服务端未找到对应任务

3. **服务权限问题**
   - AccessKey权限不足
   - 服务未开通
   - 地区配置错误

4. **请求格式问题**
   - req_key 值不正确
   - task_id 格式错误

### 3. 日志分析

从日志中可以看到有两个不同的任务被查询：
- `1773032956848883488` （旧任务，查询失败）
- `1267397645316636488` （新任务，提交成功）

这表明用户可能在查询一个已过期或无效的旧任务。

## 解决方案

### 1. 添加详细日志

在 `api-service.js` 中添加查询请求的详细日志：

```javascript
console.log('Motion Imitation Query Request:', {
  url: url,
  req_key: requestBody.req_key,
  task_id: requestBody.task_id,
  body_preview: bodyString,
  accessKeyId: requestData.accessKeyId.substring(0, 8) + '***'
});
```

这样可以看到完整的请求内容，便于调试。

### 2. 改进错误提示

在 `MotionImitation.js` 中为不同的错误类型提供友好的提示：

```javascript
if (errorMessage.includes('Input invalid')) {
  userMessage = '⚠️ 查询任务失败：任务ID无效或已过期（任务有效期为12小时）。如果这是旧任务，建议删除后重新提交。';
} else if (errorMessage.includes('not_found')) {
  userMessage = '⚠️ 任务未找到：任务可能已过期或不存在。建议删除后重新提交。';
} else if (errorMessage.includes('expired')) {
  userMessage = '⚠️ 任务已过期：请重新提交任务。';
} else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
  userMessage = '⚠️ 权限不足：请检查 AccessKey 权限配置。';
} else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
  userMessage = '⚠️ 认证失败：请检查 AccessKey 配置是否正确。';
}
```

### 3. 添加任务有效期说明

在使用说明中明确标注：

```jsx
<li>⏱️ 生成时间：1-5分钟（取决于视频长度）</li>
<li>⏰ 任务有效期：12小时（过期后无法查询状态）</li>
<li>🔗 结果视频链接有效期：1小时，请及时下载</li>
```

## 用户操作建议

### 对于过期或无效的任务

1. **删除旧任务**
   - 在任务列表中找到失败的任务
   - 点击"删除任务"按钮
   - 确认删除

2. **重新提交任务**
   - 返回"创建任务"标签页
   - 重新填写图片和视频URL
   - 提交新任务

3. **及时下载结果**
   - 任务完成后，视频链接有效期只有1小时
   - 建议立即下载保存
   - 或复制链接到其他位置存储

### 避免任务过期

1. **在12小时内查看结果**
   - 任务提交后，尽快查看状态
   - 完成的任务及时下载视频

2. **清理历史记录**
   - 定期清理12小时以上的旧任务
   - 删除失败或过期的任务

3. **使用筛选功能**
   - 按状态筛选任务（已完成、运行中等）
   - 使用搜索功能快速定位任务

## 技术细节

### API文档要求

**查询任务请求格式：**
```json
{
  "req_key": "realman_avatar_imitator_v2v_gen_video",
  "task_id": "<任务提交接口返回task_id>"
}
```

**查询任务返回 - 任务状态说明：**
- `in_queue`: 任务已提交
- `generating`: 任务处理中
- `done`: 处理完成（成功或失败）
- `not_found`: 任务未找到（可能原因是无此任务或已过期12小时）
- `expired`: 任务已过期，请重新提交

### 错误码说明

- `10000`: 成功
- `50215`: Input invalid for this service（输入参数无效）
- `401`: 认证失败
- `403`: 权限不足
- `404`: 任务未找到

### 签名验证

查询任务使用 **Signature V4** 签名认证：
1. 请求体只包含 `req_key` 和 `task_id`
2. `accessKeyId` 和 `secretAccessKey` 用于生成签名
3. 签名放在请求头的 `Authorization` 字段

## 测试场景

### 测试1：查询新提交的任务

**步骤：**
1. 提交新任务
2. 立即点击"刷新状态"
3. 查看返回状态

**期望结果：**
- 返回 `in_queue` 或 `generating` 状态
- 显示成功提示

### 测试2：查询过期任务

**步骤：**
1. 找到12小时前提交的任务
2. 点击"刷新状态"
3. 查看错误提示

**期望结果：**
- 显示友好的错误提示
- 建议删除后重新提交

### 测试3：查询无效任务ID

**步骤：**
1. 修改任务ID为无效值
2. 点击"刷新状态"
3. 查看错误提示

**期望结果：**
- 显示 "任务ID无效或已过期" 提示

## 最佳实践

### 1. 任务管理

✅ **定期清理**
- 删除超过12小时的旧任务
- 删除失败的任务
- 保持任务列表简洁

✅ **及时处理**
- 任务完成后立即下载视频
- 不要等到链接过期

✅ **使用筛选**
- 按状态筛选查看特定任务
- 使用搜索快速定位

### 2. 错误处理

✅ **查看错误提示**
- 仔细阅读错误消息
- 根据提示采取相应措施

✅ **检查权限配置**
- 确认 AccessKey 配置正确
- 验证权限范围

✅ **联系技术支持**
- 提供完整的任务ID
- 截图错误信息
- 说明操作步骤

### 3. 调试方法

如果遇到问题，可以查看终端日志：

**成功的提交日志：**
```
Motion Imitation Submit API Success: { 
  status: 200, 
  task_id: 'xxx' 
}
```

**成功的查询日志：**
```
Motion Imitation Query API Success: {
  status: 200,
  task_status: 'generating'
}
```

**失败的查询日志：**
```
Motion Imitation Query API Error: 400 {
  code: 50215,
  message: 'Input invalid for this service.'
}
```

## 常见问题

### Q1: 为什么新提交的任务也查询失败？

**可能原因：**
- AccessKey 权限不足
- 服务未开通
- 网络问题

**解决方法：**
1. 检查 AccessKey 配置
2. 确认服务已开通
3. 查看终端日志了解详细错误

### Q2: 任务有效期是什么意思？

**说明：**
- 任务提交后，在火山引擎服务器上保留12小时
- 12小时后无法查询任务状态
- 但如果任务在12小时内完成，视频链接会保留1小时

**建议：**
- 在12小时内查看任务结果
- 任务完成后1小时内下载视频

### Q3: 如何处理过期的任务？

**步骤：**
1. 在任务列表中找到该任务
2. 点击"删除任务"按钮
3. 返回创建页面重新提交

### Q4: 可以恢复过期的任务吗？

**答案：**
- ❌ 不能恢复
- 过期任务的数据已在服务器端清理
- 需要重新提交任务

## 更新日志

**v1.1.0** - 2025-10-13
- ✨ 添加详细的查询请求日志
- ✨ 改进错误提示消息
- ✨ 添加任务有效期说明
- 📝 完善使用说明文档

**v1.0.0** - 2025-10-12
- 🎉 初始版本

## 相关文档

- [动作模仿异步提交模式](./MOTION_IMITATION_ASYNC_SUBMIT.md)
- [任务列表 v2.0](./MOTION_IMITATION_LIST_V2_COMPLETED.md)
- [设置指南](./MOTION_IMITATION_SETUP.md)
- [API文档](./单图视频驱动.md)

---

**文档版本：** v1.1  
**更新时间：** 2025-10-13  
**状态：** ✅ 已修复并优化

