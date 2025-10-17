# 即梦动作模仿接口集成

## 更新日期
2025-10-16

## 更新概述
在动作模仿功能中集成了新的"即梦动作模仿"接口，用户现在可以选择使用经典版本或即梦版本的动作模仿API。

## 新增功能

### 1. 即梦动作模仿 API 支持
- ✅ 添加了即梦动作模仿的提交任务接口 (`submitJimengMotionImitationTask`)
- ✅ 添加了即梦动作模仿的查询任务接口 (`queryJimengMotionImitationTask`)
- ✅ 使用新的API端点：
  - 提交任务：`CVSync2AsyncSubmitTask`
  - 查询任务：`CVSync2AsyncGetResult`
  - req_key: `jimeng_dream_actor_m1_gen_video_cv`

### 2. 接口版本选择
- ✅ 用户可以在创建任务时选择使用哪个版本的API：
  - **即梦动作模仿（推荐）**: 更稳定、更逼真，支持各种画幅
  - **经典版本**: 原有的动作模仿接口
- ✅ 任务历史记录中保存了使用的API版本
- ✅ 刷新任务状态时自动使用对应的API版本

### 3. UI 增强
- ✅ 在表单顶部添加了API版本选择器
- ✅ 任务列表中显示任务使用的接口版本（即梦/经典）
- ✅ 任务详情中显示接口版本信息
- ✅ 添加了即梦动作模仿的功能说明

## 技术变更

### 文件修改清单

#### 1. `/api-service.js`
- 新增 `submitJimengMotionImitationTask()` 方法
- 新增 `queryJimengMotionImitationTask()` 方法
- 使用更简洁的请求参数（不需要 `driving_video_info` 包装）

#### 2. `/desktop-app.js`
- 注册新的IPC handler: `submit-jimeng-motion-imitation-task`
- 注册新的IPC handler: `query-jimeng-motion-imitation-task`

#### 3. `/public/preload.js`
- 暴露 `submitJimengMotionImitationTask` 方法到前端
- 暴露 `queryJimengMotionImitationTask` 方法到前端

#### 4. `/src/components/MotionImitation.js`
- 添加 `apiVersion` 状态字段（默认为 'jimeng'）
- 更新 `submitTask()` 函数以支持两种API版本
- 更新 `refreshTask()` 函数以根据任务版本调用对应API
- 添加API版本选择UI组件
- 在任务历史中保存和显示API版本信息
- 更新使用说明，添加即梦接口特性介绍

## 即梦动作模仿特性

根据官方文档，即梦动作模仿相较于前一代模型具有以下优势：

1. **更稳定、更逼真的效果**: 动作和表情还原更加自然
2. **突破竖屏限制**: 支持各种画幅和比例的视频
3. **多风格支持**: 支持真人、二次元等多种风格角色
4. **运镜还原**: 具备一定的运镜还原能力
5. **特征保持**: 主体及背景特征与输入图片保持一致

## API 差异对比

### 经典版本
```json
{
  "req_key": "realman_avatar_imitator_v2v_gen_video",
  "image_url": "https://...",
  "driving_video_info": {
    "store_type": 0,
    "video_url": "https://..."
  }
}
```

### 即梦版本
```json
{
  "req_key": "jimeng_dream_actor_m1_gen_video_cv",
  "image_url": "https://...",
  "video_url": "https://..."
}
```

## 使用说明

### 选择接口版本
1. 打开动作模仿功能页面
2. 在"选择接口版本"卡片中选择：
   - 🔥 **即梦动作模仿（推荐）**: 适合需要高质量输出的场景
   - 📦 **经典版本**: 保持向后兼容

### 提交任务
1. 选择接口版本
2. 输入图片URL或上传本地图片
3. 输入驱动视频URL或上传本地视频
4. 点击"开始生成动作模仿视频"

### 查看任务
- 任务列表中的"接口"列显示任务使用的版本
- 点击"查看详情"可以看到完整的任务信息

## 兼容性说明

- ✅ 向后兼容：已有的经典版本任务仍可正常查询和显示
- ✅ 默认设置：新任务默认使用即梦版本
- ✅ 版本识别：系统自动识别任务版本并使用对应API查询

## 测试建议

1. **新任务测试**: 
   - 使用即梦版本创建新任务
   - 使用经典版本创建新任务
   - 验证两者都能正常提交和查询

2. **兼容性测试**:
   - 查看历史任务（无版本标记的任务应显示为"经典"）
   - 刷新旧任务状态

3. **切换测试**:
   - 在两个版本之间切换
   - 验证表单正确显示选择的版本

## 注意事项

⚠️ **重要提示**:
- 两个接口都需要配置火山引擎 AccessKey 和 SecretKey
- 两个接口都使用 Signature V4 认证
- 图片和视频URL必须可公网访问
- 任务有效期为 12 小时
- 结果视频链接有效期为 1 小时

## 相关文档

- [即梦动作模仿接口文档](../api/即梦动作模仿.md)
- [动作模仿使用指南](../guides/MOTION_IMITATION_GUIDE.md)

## 后续计划

- [ ] 收集用户反馈，优化接口选择体验
- [ ] 添加两个版本的效果对比示例
- [ ] 考虑在设置中添加默认接口版本配置


