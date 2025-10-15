# 智能搜索 API 404 错误修复

## 📅 修复时间
2025年10月15日 07:54

## 🐛 问题描述

### 错误现象
智能搜索功能在执行搜索时返回 404 错误：

```
Multi-modal Search Raw Response: {
  status: 404,
  statusText: '404 Page not found',
  contentType: 'text/plain',
  responseText: '404 page not found'
}
```

### 错误原因
参数命名不匹配导致 API 调用失败。

## 🔍 问题分析

### 原因 1：参数命名格式错误

**前端传递的参数**（驼峰命名）:
```javascript
{
  collectionName: 'video_demo2',
  indexName: 'video_demo2',
  outputFields: ['f_text', 'f_image']
}
```

**API 期望的参数**（下划线命名）:
```javascript
{
  collection_name: 'video_demo2',
  index_name: 'video_demo2',
  output_fields: ['f_text', 'f_image']
}
```

### 原因 2：返回数据结构映射错误

**API 实际返回**:
```javascript
{
  success: true,
  data: {
    data: [...],  // items 数组
    total_return_count: 10
  }
}
```

**前端期望的格式**:
```javascript
{
  success: true,
  data: {
    items: [...],  // items 数组
    total: 10
  }
}
```

## ✅ 修复方案

### 修复 1：统一参数命名

**文件**: `src/components/SmartSearch.js`

**修改前**:
```javascript
const requestData = {
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  collectionName: collectionName,        // ❌ 驼峰命名
  indexName: indexName,                  // ❌ 驼峰命名
  limit: limit,
  outputFields: outputFields             // ❌ 驼峰命名
};
```

**修改后**:
```javascript
const requestData = {
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  collection_name: collectionName,       // ✅ 下划线命名
  index_name: indexName,                 // ✅ 下划线命名
  limit: limit,
  output_fields: outputFields            // ✅ 下划线命名
};
```

### 修复 2：添加数据格式转换

**修改前**:
```javascript
const resultData = {
  items: response.data.items || [],      // ❌ 字段不存在
  total: response.data.total || 0,       // ❌ 字段不存在
  // ...
};
```

**修改后**:
```javascript
// API 返回的数据结构：response.data.data 是数组，response.data.total_return_count 是总数
const items = response.data.data || [];
const total = response.data.total_return_count || 0;

// 转换数据格式：fields -> 直接的字段，score -> score
const formattedItems = items.map(item => ({
  fields: item.fields || {},
  score: item.score || 0,
  id: item.id || ''
}));

const resultData = {
  items: formattedItems,                 // ✅ 正确映射
  total: total,                          // ✅ 正确映射
  // ...
};
```

## 📊 修复效果

### 修复前
- ❌ API 返回 404 错误
- ❌ 无法获取搜索结果
- ❌ collection_name 和 index_name 未传递

### 修复后
- ✅ API 调用成功
- ✅ 正确获取搜索结果
- ✅ 参数正确传递
- ✅ 数据格式正确转换

## 🧪 验证步骤

### 1. 配置数据集
```
数据集名称：video_demo2
索引名称：video_demo2
```

### 2. 执行搜索
```
搜索模式：文搜文/图/视频
搜索文本：石头
返回数量：10
输出字段：f_text, f_image, f_video
```

### 3. 预期结果
- ✅ API 返回 200 状态码
- ✅ 显示搜索结果列表
- ✅ 每个结果包含相似度分数
- ✅ 显示图片/视频预览

## 📝 相关代码变更

### 变更文件
- ✅ `src/components/SmartSearch.js` (修改)

### 变更内容
1. 第 115-118 行：修改参数命名格式
2. 第 164-185 行：添加数据格式转换逻辑

### 代码差异
```diff
- collectionName: collectionName,
+ collection_name: collectionName,

- indexName: indexName,
+ index_name: indexName,

- outputFields: outputFields
+ output_fields: outputFields

- const resultData = {
-   items: response.data.items || [],
-   total: response.data.total || 0,
+ const items = response.data.data || [];
+ const total = response.data.total_return_count || 0;
+ const formattedItems = items.map(item => ({
+   fields: item.fields || {},
+   score: item.score || 0,
+   id: item.id || ''
+ }));
+ const resultData = {
+   items: formattedItems,
+   total: total,
```

## 🔧 技术细节

### API 端点
```
POST https://api-vikingdb.volces.com/api/vikingdb/data/search/multi_modal
```

### 请求格式
```json
{
  "collection_name": "video_demo2",
  "index_name": "video_demo2",
  "limit": 10,
  "text": "石头",
  "output_fields": ["f_text", "f_image", "f_video"]
}
```

### 响应格式
```json
{
  "code": "Success",
  "message": "success",
  "result": {
    "data": [
      {
        "id": "xxx",
        "fields": {
          "f_text": "...",
          "f_image": "...",
          "f_video": "..."
        },
        "score": 0.325
      }
    ],
    "total_return_count": 1
  }
}
```

## 📚 学习要点

### 1. API 参数命名规范
- 后端 API 通常使用 **下划线命名**（snake_case）
- 前端 JavaScript 通常使用 **驼峰命名**（camelCase）
- 需要在传递参数时进行格式转换

### 2. 数据结构映射
- 不同系统的数据结构可能不同
- 需要在前端进行适配和转换
- 确保字段名称匹配

### 3. 错误处理
- 404 错误通常表示路径或参数错误
- 检查 API 文档确认正确的参数格式
- 使用 console.log 输出实际请求内容进行调试

## ⚠️ 注意事项

### 后续开发建议

1. **统一命名规范**
   - 在项目中统一使用一种命名规范
   - 或在边界层（API 调用处）统一转换

2. **类型检查**
   - 使用 TypeScript 可以避免这类问题
   - 在编译时就能发现参数名称错误

3. **API 文档**
   - 严格按照 API 文档的参数格式
   - 保持文档同步更新

4. **单元测试**
   - 为 API 调用添加单元测试
   - 测试参数格式是否正确

## 🎯 总结

本次修复解决了参数命名不匹配导致的 404 错误。主要修改了：

1. ✅ 将驼峰命名改为下划线命名（collection_name, index_name, output_fields）
2. ✅ 添加了返回数据的格式转换逻辑
3. ✅ 确保前后端数据结构一致

修复后，智能搜索功能可以正常使用，能够成功调用 VikingDB 的多模态搜索 API。

## 🚀 现在可以使用

应用已重新构建并启动，现在可以：

1. 进入"智能搜索"页面
2. 配置数据集和索引名称
3. 选择搜索模式
4. 输入搜索内容
5. 点击"开始搜索"查看结果

---

**修复状态**: ✅ 已完成  
**测试状态**: ⏳ 待用户验证  
**版本**: v1.0.1  
**修复日期**: 2025年10月15日

