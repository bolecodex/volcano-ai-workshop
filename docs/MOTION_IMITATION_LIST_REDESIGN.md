# 动作模仿任务列表重新设计

## 设计目标

参考视频生成页面，重新设计动作模仿的任务列表，提供更完善的功能和更好的用户体验。

## 主要改进点

### 1. 任务筛选和搜索
参考视频生成页面的筛选功能：
- ✅ 按状态筛选（排队中、生成中、已完成、失败）
- ✅ 任务ID搜索
- ✅ 每页显示数量调整
- ✅ 刷新按钮

### 2. 任务统计面板
添加统计信息显示：
- 📊 总任务数
- ✅ 成功任务数
- 🔄 运行中任务数
- ❌ 失败任务数

### 3. 任务列表表格
改进表格显示：
- 📝 任务ID（可复制）
- 🎯 任务状态（彩色徽章）
- 📅 创建时间
- 🔄 更新时间
- 🖼️ 预览图（缩略图）
- ⚙️ 操作按钮组

### 4. 操作按钮
丰富的操作选项：
- 👁️ 查看详情
- ▶️ 播放视频（完成后）
- 🔄 刷新状态（运行中）
- ⬇️ 下载视频（完成后）
- 🗑️ 删除任务

### 5. 任务详情模态框
完善的详情展示：
- 📋 任务完整信息
- 🖼️ 输入图片预览
- 🎬 驱动视频信息
- 📊 任务状态和进度
- 📹 生成的视频（可播放）
- ⬇️ 下载链接

### 6. 用户体验优化
- 🔄 自动刷新运行中的任务
- ⏱️ 剩余有效时间提示
- ⚠️ 错误信息友好展示
- 💬 操作反馈提示
- 📱 响应式设计

## 当前状态 vs 目标状态

### 当前实现
```
- 简单的任务列表
- 基本的搜索功能
- 简单的操作按钮（查看、刷新、下载、删除）
- 基础的任务详情模态框
```

### 目标实现
```
- 完整的筛选和搜索系统
- 任务统计面板
- 丰富的表格展示
- 分组的操作按钮
- 详细的任务信息展示
- 自动状态更新
- 更好的视觉设计
```

## 实施计划

### 阶段 1：基础改进 ✅
- [x] 添加任务筛选下拉菜单
- [x] 添加统计面板
- [x] 改进表格布局
- [x] 优化操作按钮分组

### 阶段 2：功能增强 🚧
- [ ] 实现任务统计逻辑
- [ ] 添加自动刷新功能
- [ ] 改进详情模态框
- [ ] 添加视频播放功能

### 阶段 3：体验优化 📋
- [ ] 添加加载状态
- [ ] 优化错误提示
- [ ] 添加空状态展示
- [ ] 改进响应式设计

### 阶段 4：高级功能 💡
- [ ] 批量操作
- [ ] 任务导出
- [ ] 历史记录管理
- [ ] 性能优化

## 详细设计

### 任务列表顶部

```jsx
<Row className="mb-3">
  <Col md={8}>
    <Row>
      {/* 状态筛选 */}
      <Col md={3}>
        <Form.Select value={filter.status} onChange={...}>
          <option value="">全部状态</option>
          <option value="in_queue">排队中</option>
          <option value="generating">生成中</option>
          <option value="done">已完成</option>
          <option value="failed">失败</option>
        </Form.Select>
      </Col>
      
      {/* 任务ID搜索 */}
      <Col md={5}>
        <InputGroup>
          <Form.Control
            placeholder="输入任务ID搜索"
            value={filter.taskId}
            onChange={...}
          />
          <Button variant="outline-secondary">
            <i className="bi bi-search"></i>
          </Button>
        </InputGroup>
      </Col>
      
      {/* 每页数量 */}
      <Col md={2}>
        <Form.Select value={pageSize} onChange={...}>
          <option value="10">10条/页</option>
          <option value="20">20条/页</option>
          <option value="50">50条/页</option>
        </Form.Select>
      </Col>
      
      {/* 刷新按钮 */}
      <Col md={2}>
        <Button variant="primary" onClick={refresh}>
          <i className="bi bi-arrow-clockwise"></i> 刷新
        </Button>
      </Col>
    </Row>
  </Col>
  
  {/* 统计面板 */}
  <Col md={4}>
    <Row className="text-center">
      <Col>
        <div className="small text-muted">总计</div>
        <div className="h5 mb-0">{stats.total}</div>
      </Col>
      <Col>
        <div className="small text-muted">成功</div>
        <div className="h5 mb-0 text-success">{stats.succeeded}</div>
      </Col>
      <Col>
        <div className="small text-muted">运行中</div>
        <div className="h5 mb-0 text-primary">{stats.running}</div>
      </Col>
      <Col>
        <div className="small text-muted">失败</div>
        <div className="h5 mb-0 text-danger">{stats.failed}</div>
      </Col>
    </Row>
  </Col>
</Row>
```

### 任务列表表格

```jsx
<Table responsive striped hover>
  <thead>
    <tr>
      <th>任务ID</th>
      <th>状态</th>
      <th>创建时间</th>
      <th>更新时间</th>
      <th>预览</th>
      <th>操作</th>
    </tr>
  </thead>
  <tbody>
    {tasks.map(task => (
      <tr key={task.task_id}>
        <td>
          <code className="task-id">{task.task_id}</code>
        </td>
        <td>
          <Badge bg={getStatusBadge(task.status).bg}>
            {getStatusBadge(task.status).text}
          </Badge>
        </td>
        <td>{formatTime(task.create_time)}</td>
        <td>{formatTime(task.update_time)}</td>
        <td>
          {task.image_preview && (
            <Image 
              src={task.image_preview} 
              thumbnail 
              style={{ width: '50px', height: '50px' }}
            />
          )}
        </td>
        <td>
          <div className="d-flex flex-column gap-1">
            <Button size="sm" variant="outline-primary">
              <i className="bi bi-eye me-1"></i>查看详情
            </Button>
            {task.status === 'done' && task.video_url && (
              <>
                <Button size="sm" className="btn-play">
                  <i className="bi bi-play-circle me-1"></i>播放视频
                </Button>
                <Button size="sm" variant="outline-success">
                  <i className="bi bi-download me-1"></i>下载视频
                </Button>
              </>
            )}
            {task.status === 'generating' && (
              <Button size="sm" variant="outline-warning">
                <i className="bi bi-arrow-clockwise me-1"></i>刷新状态
              </Button>
            )}
            <Button size="sm" variant="outline-danger">
              <i className="bi bi-trash me-1"></i>删除
            </Button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

### 任务详情模态框

```jsx
<Modal show={showModal} onHide={closeModal} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>
      <i className="bi bi-info-circle me-2"></i>
      任务详情
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Row>
      {/* 左列：基本信息 */}
      <Col md={6}>
        <Table borderless size="sm">
          <tbody>
            <tr>
              <td><strong>任务ID:</strong></td>
              <td><code>{task.task_id}</code></td>
            </tr>
            <tr>
              <td><strong>状态:</strong></td>
              <td><Badge>{task.status}</Badge></td>
            </tr>
            <tr>
              <td><strong>创建时间:</strong></td>
              <td>{formatTime(task.create_time)}</td>
            </tr>
            <tr>
              <td><strong>更新时间:</strong></td>
              <td>{formatTime(task.update_time)}</td>
            </tr>
          </tbody>
        </Table>
      </Col>
      
      {/* 右列：输入信息 */}
      <Col md={6}>
        <h6>输入图片</h6>
        <Image src={task.image_preview} fluid rounded />
        
        {task.video_preview && (
          <>
            <h6 className="mt-3">驱动视频</h6>
            <video src={task.video_preview} controls style={{ width: '100%' }} />
          </>
        )}
      </Col>
      
      {/* 完整宽度：生成结果 */}
      {task.status === 'done' && task.video_url && (
        <Col xs={12} className="mt-3">
          <Alert variant="success">
            <Alert.Heading>视频生成成功！</Alert.Heading>
            <p>您可以在下方预览或下载生成的视频</p>
          </Alert>
          
          <video 
            src={task.video_url} 
            controls 
            autoPlay
            style={{ width: '100%', maxHeight: '500px' }}
          />
          
          <Alert variant="warning" className="mt-3">
            <small>
              <i className="bi bi-clock me-1"></i>
              视频链接有效期为1小时，请及时下载保存
            </small>
          </Alert>
        </Col>
      )}
    </Row>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={closeModal}>
      关闭
    </Button>
    {task.video_url && (
      <>
        <Button variant="success" href={task.video_url} download>
          <i className="bi bi-download me-1"></i>
          下载视频
        </Button>
        <Button variant="outline-primary" onClick={copyLink}>
          <i className="bi bi-clipboard me-1"></i>
          复制链接
        </Button>
      </>
    )}
  </Modal.Footer>
</Modal>
```

## 状态管理

### 新增状态
```javascript
const [filter, setFilter] = useState({
  status: '',
  taskId: '',
  pageSize: 10,
  pageNum: 1
});

const [stats, setStats] = useState({
  total: 0,
  succeeded: 0,
  running: 0,
  failed: 0
});
```

### 辅助函数
```javascript
// 格式化时间
const formatTime = (isoString) => {
  return new Date(isoString).toLocaleString('zh-CN');
};

// 获取状态徽章
const getStatusBadge = (status) => {
  const map = {
    'in_queue': { bg: 'secondary', text: '排队中' },
    'generating': { bg: 'primary', text: '生成中' },
    'done': { bg: 'success', text: '已完成' },
    'failed': { bg: 'danger', text: '失败' }
  };
  return map[status] || { bg: 'secondary', text: status };
};

// 计算统计信息
const calculateStats = (tasks) => {
  return {
    total: tasks.length,
    succeeded: tasks.filter(t => t.status === 'done').length,
    running: tasks.filter(t => t.status === 'generating' || t.status === 'in_queue').length,
    failed: tasks.filter(t => t.status === 'failed').length
  };
};
```

## CSS 样式

```css
/* 任务ID样式 */
.task-id {
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  word-break: break-all;
}

/* 播放按钮样式 */
.btn-play {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.btn-play:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: white;
}

/* 操作按钮容器 */
.task-action-buttons {
  min-width: 120px;
}

.task-action-buttons .btn {
  text-align: left;
  white-space: nowrap;
}
```

## 下一步

1. 实施基础的筛选和统计功能
2. 改进表格布局和操作按钮
3. 增强任务详情模态框
4. 添加自动刷新功能
5. 优化加载和错误状态

---

**设计版本：** v2.0
**更新时间：** 2025-10-13
**参考：** VideoGenerator.js 任务列表实现

