# OmniHuman1.5 数字人功能集成

## 更新时间
2025-10-17

## 概述
成功集成了**OmniHuman1.5（即梦同源数字人模型）**功能，支持通过单张图片 + 音频生成高质量的数字人视频。

## 功能特点

### 🎯 核心能力
- **任意画幅支持**：支持输入任意画幅包含人物或主体（人物、宠物、动漫等）的图片
- **高质量生成**：结合音频生成高质量视频，人物的情绪、动作与音频强关联
- **主体灵活性**：支持人物、宠物、动漫等多种形象
- **指定说话人**：可选择性地指定图片中的特定主体说话
- **提示词增强**：支持通过提示词调整画面、动作、运镜效果

### 🔧 技术特性
- **运动自然度提升**：相较上一代模型，运动表现力和画面质量更优
- **结构稳定性增强**：在运动自然度和结构稳定性方面提升明显
- **广泛应用场景**：适用于剧情对话、多人对话/对唱、商品交互、漫剧等内容

## 实现步骤

### 1. 后端API集成

#### 文件：`api-service.js`
新增5个API方法：

1. **submitOmniHumanIdentifyTask** - 步骤1：提交主体识别任务
   - 识别图片中是否包含人、类人、拟人等主体
   - 使用 `req_key: jimeng_realman_avatar_picture_create_role_omni_v15`

2. **queryOmniHumanIdentifyTask** - 步骤1：查询主体识别结果
   - 查询识别结果，返回是否包含主体（status: 0/1）

3. **detectOmniHumanSubject** - 步骤2：主体检测（同步）
   - 检测图片中的主体并返回mask图URL列表
   - 使用 `req_key: jimeng_realman_avatar_object_detection`
   - 最多支持检测5个主体

4. **submitOmniHumanVideoTask** - 步骤3：提交视频生成任务
   - 提交视频生成任务（图片 + 音频）
   - 使用 `req_key: jimeng_realman_avatar_picture_omni_v15`
   - 支持可选参数：mask_url、prompt、seed、pe_fast_mode

5. **queryOmniHumanVideoTask** - 步骤3：查询视频生成结果
   - 查询任务状态和生成的视频URL

### 2. IPC通信配置

#### 文件：`desktop-app.js`
注册5个IPC handlers：
- `submit-omnihuman-identify-task`
- `query-omnihuman-identify-task`
- `detect-omnihuman-subject`
- `submit-omnihuman-video-task`
- `query-omnihuman-video-task`

#### 文件：`public/preload.js`
暴露5个IPC接口到渲染进程：
- `submitOmniHumanIdentifyTask`
- `queryOmniHumanIdentifyTask`
- `detectOmniHumanSubject`
- `submitOmniHumanVideoTask`
- `queryOmniHumanVideoTask`

### 3. 前端页面开发

#### 文件：`src/components/DigitalHuman.js`
创建全新的数字人组件，包含：

**工作流设计**：
- **步骤1：准备素材** - 上传/输入图片和音频
- **步骤2：主体检测（可选）** - 检测并选择特定主体
- **步骤3：视频生成** - 提交任务并生成视频

**主要功能**：
1. **素材输入**
   - 支持图片URL或本地上传
   - 支持音频URL或本地上传
   - 自动主体识别验证

2. **可选主体检测**
   - 开关式启用/禁用
   - 检测多个主体并支持选择
   - 实时预览检测结果

3. **高级选项**
   - 提示词输入（支持多语言）
   - 随机种子设置
   - 快速模式开关

4. **任务管理**
   - 任务列表展示
   - 状态筛选和搜索
   - 批量刷新运行中任务
   - 任务详情查看
   - 视频预览和下载

5. **工作流可视化**
   - 进度条显示当前步骤
   - 状态卡片实时更新
   - 步骤引导提示

### 4. 路由和导航集成

#### 文件：`src/App.js`
- 导入 `DigitalHuman` 组件
- 添加 `digital-human` 路由

#### 文件：`src/components/Sidebar.js`
- 添加"数字人"导航项
- 图标：`bi-person-video3`
- 位置：动作模仿和智能搜索之间

## API接口说明

### 步骤1：主体识别

**提交任务**
```javascript
POST https://visual.volcengineapi.com?Action=CVSubmitTask&Version=2022-08-31
{
  "req_key": "jimeng_realman_avatar_picture_create_role_omni_v15",
  "image_url": "https://..."
}
```

**查询结果**
```javascript
POST https://visual.volcengineapi.com?Action=CVGetResult&Version=2022-08-31
{
  "req_key": "jimeng_realman_avatar_picture_create_role_omni_v15",
  "task_id": "..."
}

// 返回
{
  "code": 10000,
  "data": {
    "status": "done",
    "resp_data": "{\"status\":1}" // 1=包含主体, 0=不包含
  }
}
```

### 步骤2：主体检测（可选）

**同步接口**
```javascript
POST https://visual.volcengineapi.com?Action=CVProcess&Version=2022-08-31
{
  "req_key": "jimeng_realman_avatar_object_detection",
  "image_url": "https://..."
}

// 返回
{
  "code": 10000,
  "data": {
    "resp_data": "{\"object_detection_result\":{\"mask\":{\"url\":[\"https://...\"]}}}"
  }
}
```

### 步骤3：视频生成

**提交任务**
```javascript
POST https://visual.volcengineapi.com?Action=CVSubmitTask&Version=2022-08-31
{
  "req_key": "jimeng_realman_avatar_picture_omni_v15",
  "image_url": "https://...",
  "audio_url": "https://...",
  "mask_url": ["https://..."], // 可选
  "prompt": "描述文本",        // 可选
  "seed": 12345,              // 可选，-1为随机
  "pe_fast_mode": false       // 可选
}
```

**查询结果**
```javascript
POST https://visual.volcengineapi.com?Action=CVGetResult&Version=2022-08-31
{
  "req_key": "jimeng_realman_avatar_picture_omni_v15",
  "task_id": "..."
}

// 返回
{
  "code": 10000,
  "data": {
    "status": "done",
    "video_url": "https://..."
  }
}
```

## 使用限制

### 输入要求
- **音频时长**：必须小于35秒
- **图片格式**：支持常见图片格式（JPG、PNG等）
- **主体检测**：最多支持检测5个主体

### 提示词支持语言
- 中文
- 英语
- 日语
- 韩语
- 墨西哥语
- 印尼语

### 任务状态
- `in_queue`：任务已提交，排队中
- `generating`：任务处理中
- `done`：处理完成
- `not_found`：任务未找到
- `expired`：任务已过期（12小时）

## 错误处理

### 常见错误码
- `10000`：请求成功
- `50411`：输入图片前审核未通过
- `50511`：输出图片后审核未通过
- `50412`：输入文本前审核未通过
- `50215`：输入参数无效（如音频过长）
- `50429`：QPS超限
- `50430`：并发超限
- `50500`：内部错误
- `50501`：内部算法错误

### 前端错误处理
- 文件上传失败自动重试提示
- 任务轮询超时处理
- 详细的错误信息展示
- 用户友好的操作引导

## 用户体验优化

### 工作流引导
- 步骤可视化进度条
- 当前状态实时更新
- 清晰的操作按钮提示

### 可选步骤设计
- 主体检测可开关
- 跳过检测直接生成
- 高级选项折叠展示

### 任务管理
- 本地历史记录持久化
- 任务统计数据展示
- 快速筛选和搜索
- 批量状态刷新

### 视觉反馈
- Loading状态动画
- 成功/失败提示
- 图片/视频预览
- 响应式布局设计

## 测试建议

### 基础功能测试
1. 图片URL输入 + 音频URL输入
2. 本地图片上传 + 本地音频上传
3. 主体识别成功/失败情况
4. 主体检测多个主体选择
5. 视频生成任务提交和查询

### 边界条件测试
1. 音频超过35秒的提示
2. 图片中无主体的处理
3. 任务超时的处理
4. 无效URL的错误提示
5. 网络异常的重试机制

### 工作流测试
1. 跳过主体检测直接生成
2. 完整三步工作流
3. 中途重置工作流
4. 任务历史查看和刷新

## 技术亮点

1. **三步工作流设计**：清晰的步骤划分，用户操作流程明确
2. **可选步骤机制**：灵活的主体检测开关，满足不同需求
3. **智能轮询查询**：自动轮询异步任务结果，用户体验流畅
4. **状态持久化**：任务历史本地存储，重启应用不丢失
5. **错误处理完善**：详细的错误提示和用户引导
6. **UI/UX优化**：进度可视化、状态反馈、响应式设计

## 下一步计划

### 功能增强
- [ ] 支持批量生成
- [ ] 视频编辑器集成
- [ ] 音频在线录制
- [ ] 模板预设管理

### 性能优化
- [ ] 图片预压缩
- [ ] 音频格式转换
- [ ] 任务队列管理
- [ ] 缓存机制优化

### 用户体验
- [ ] 更多提示词示例
- [ ] 历史任务搜索优化
- [ ] 视频播放控制增强
- [ ] 导出设置自定义

## 相关文档

- [OmniHuman1.5 官方文档](https://www.volcengine.com/docs/6791/1269736)
- [即梦AI 产品介绍](https://www.volcengine.com/product/jimeng)
- [API 签名机制说明](https://www.volcengine.com/docs/6791/1269744)

## 总结

OmniHuman1.5的集成为应用增添了强大的数字人视频生成能力。通过三步工作流设计，用户可以轻松地从图片和音频生成高质量的数字人视频。完善的错误处理和友好的用户界面确保了良好的使用体验。这个功能特别适合用于内容创作、教育培训、营销推广等多个场景。


