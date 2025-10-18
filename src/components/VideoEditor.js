import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner, Modal, Table } from 'react-bootstrap';
import { storage } from '../utils/storage';

function VideoEditor() {
  // ===== 状态管理 =====
  const [formData, setFormData] = useState({
    prompt: '',
    videoUrl: '',
    videoFile: null,
    seed: -1,
    maxFrame: 121
  });

  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [taskHistory, setTaskHistory] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoInputRef = useRef(null);

  // ===== 初始化 =====
  useEffect(() => {
    const initialize = async () => {
      try {
        const accessKeyId = await storage.getAccessKeyId();
        const secretAccessKey = await storage.getSecretAccessKey();
        
        if (!accessKeyId || !secretAccessKey) {
          showAlert('danger', '请先在设置页面配置 AccessKeyId 和 SecretAccessKey');
        }

        // 加载任务历史
        const history = await storage.getVideoEditHistory();
        setTaskHistory(history || []);
      } catch (error) {
        console.error('初始化失败:', error);
        showAlert('danger', '加载配置失败');
      }
    };
    
    initialize();
  }, []);

  // ===== 辅助函数 =====
  const showAlert = (variant, message) => {
    setAlert({ show: true, variant, message });
    setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 5000);
  };

  const saveTaskToHistory = async (task) => {
    const newHistory = [task, ...taskHistory.slice(0, 19)]; // 保留最近20条
    setTaskHistory(newHistory);
    
    // 保存到 IndexedDB
    try {
      await storage.setVideoEditHistory(newHistory);
    } catch (error) {
      console.error('保存任务历史失败:', error);
    }
  };

  const updateTaskInHistory = (taskId, updates) => {
    const newHistory = taskHistory.map(task =>
      task.task_id === taskId ? { ...task, ...updates } : task
    );
    setTaskHistory(newHistory);
    
    if (storage.setVideoEditHistory) {
      storage.setVideoEditHistory(newHistory);
    }
  };

  // ===== 文件上传处理 =====
  const handleVideoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('video/')) {
      showAlert('danger', '请选择视频文件');
      return;
    }

    // 检查文件大小（15MB限制）
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      showAlert('warning', '视频文件大小超过15MB，可能导致处理异常。建议压缩后上传。');
    }

    setFormData(prev => ({ ...prev, videoFile: file }));

    // 上传到 TOS
    try {
      setLoading(true);
      setUploadProgress(0);
      showAlert('info', '正在上传视频到 TOS...');

      const accessKeyId = storage.getAccessKeyId();
      const secretAccessKey = storage.getSecretAccessKey();
      const tosConfig = storage.getTosConfig();

      if (!tosConfig.bucket || !tosConfig.region) {
        throw new Error('请先在设置中配置 TOS Bucket 和 Region');
      }
      
      if (!accessKeyId || !secretAccessKey) {
        throw new Error('请先在设置中配置访问密钥');
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          // 将 ArrayBuffer 转换为 Uint8Array，然后转换为普通数组
          const uint8Array = new Uint8Array(arrayBuffer);
          const buffer = Array.from(uint8Array);

          const result = await window.electronAPI.uploadToTOS(
            {
              buffer: buffer,
              name: file.name,  // 原始文件名
              size: file.size,  // 文件大小
              type: file.type   // 文件类型
            },
            {
              accessKeyId: accessKeyId,
              secretAccessKey: secretAccessKey,
              region: tosConfig.region,
              bucket: tosConfig.bucket
            }
          );

          if (result.success) {
            setFormData(prev => ({ ...prev, videoUrl: result.url }));
            showAlert('success', '视频上传成功！');
            setUploadProgress(100);
          } else {
            throw new Error(result.error?.message || '上传失败');
          }
        } catch (error) {
          console.error('视频上传失败:', error);
          showAlert('danger', `视频上传失败: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        showAlert('danger', '读取文件失败');
        setLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('上传过程出错:', error);
      showAlert('danger', `上传失败: ${error.message}`);
      setLoading(false);
    }
  };

  // ===== 表单处理 =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'seed' || name === 'maxFrame' ? parseInt(value) : value
    }));
  };

  // ===== 提交任务 =====
  const handleSubmit = async () => {
    try {
      // 验证
      if (!formData.prompt.trim()) {
        showAlert('warning', '请输入编辑指令');
        return;
      }

      if (!formData.videoUrl.trim()) {
        showAlert('warning', '请上传视频或输入视频URL');
        return;
      }

      setLoading(true);
      
      const accessKeyId = storage.getAccessKeyId();
      const secretAccessKey = storage.getSecretAccessKey();
      
      if (!accessKeyId || !secretAccessKey) {
        throw new Error('请先在设置中配置访问密钥');
      }

      // 提交任务
      const requestData = {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        prompt: formData.prompt,
        video_url: formData.videoUrl
      };

      // 添加可选参数
      if (formData.seed !== -1) {
        requestData.seed = formData.seed;
      }
      if (formData.maxFrame !== 121) {
        requestData.max_frame = formData.maxFrame;
      }

      const result = await window.electronAPI.submitVideoEditTask(requestData);

      if (result.success) {
        const task = {
          task_id: result.data.task_id,
          prompt: formData.prompt,
          video_url: formData.videoUrl,
          seed: formData.seed,
          max_frame: formData.maxFrame,
          status: 'in_queue',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        saveTaskToHistory(task);
        showAlert('success', `任务提交成功！任务ID: ${result.data.task_id}`);

        // 清空表单（保留部分设置）
        setFormData(prev => ({
          ...prev,
          prompt: '',
          videoFile: null
        }));

        if (videoInputRef.current) {
          videoInputRef.current.value = '';
        }
      } else {
        throw new Error(result.error?.message || '提交失败');
      }
    } catch (error) {
      console.error('提交任务失败:', error);
      showAlert('danger', `提交失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== 查询任务 =====
  const handleQueryTask = async (taskId) => {
    try {
      const accessKeyId = storage.getAccessKeyId();
      const secretAccessKey = storage.getSecretAccessKey();
      
      if (!accessKeyId || !secretAccessKey) {
        throw new Error('请先在设置中配置访问密钥');
      }

      const result = await window.electronAPI.queryVideoEditTask({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        task_id: taskId
      });

      if (result.success) {
        const updates = {
          status: result.data.status,
          video_url_result: result.data.video_url,
          updated_at: new Date().toISOString()
        };

        updateTaskInHistory(taskId, updates);

        // 处理服务器内部错误
        if (result.data.server_error) {
          showAlert('warning', `⚠️ ${result.data.message || '任务处理中，请稍后重试'}`);
          return result.data;
        }

        if (result.data.status === 'done' && result.data.video_url) {
          showAlert('success', '✅ 任务完成！视频已生成');
        } else if (result.data.status === 'in_queue' || result.data.status === 'generating') {
          showAlert('info', `🔄 任务处理中，当前状态: ${getStatusText(result.data.status)}`);
        } else {
          showAlert('warning', `⚠️ 任务状态: ${getStatusText(result.data.status)}`);
        }

        return result.data;
      } else {
        throw new Error(result.error?.message || '查询失败');
      }
    } catch (error) {
      console.error('查询任务失败:', error);
      showAlert('danger', `查询失败: ${error.message}`);
      return null;
    }
  };

  // ===== 查看任务详情 =====
  const handleViewTask = async (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);

    // 自动查询最新状态
    if (task.status !== 'done' && task.status !== 'expired' && task.status !== 'not_found') {
      const latestData = await handleQueryTask(task.task_id);
      if (latestData) {
        setSelectedTask(prev => ({ ...prev, ...latestData }));
      }
    }
  };

  // ===== 获取状态文本 =====
  const getStatusText = (status) => {
    const statusMap = {
      'in_queue': '排队中',
      'generating': '生成中',
      'done': '已完成',
      'not_found': '未找到',
      'expired': '已过期'
    };
    return statusMap[status] || status;
  };

  const getStatusBadge = (status) => {
    const badgeMap = {
      'in_queue': 'warning',
      'generating': 'info',
      'done': 'success',
      'not_found': 'secondary',
      'expired': 'danger'
    };
    return badgeMap[status] || 'secondary';
  };

  // ===== 最大帧数选项 =====
  const maxFrameOptions = [
    { value: 49, label: '49帧 (约2秒)' },
    { value: 73, label: '73帧 (约3秒)' },
    { value: 97, label: '97帧 (约4秒)' },
    { value: 121, label: '121帧 (约5秒) - 推荐' },
    { value: 145, label: '145帧 (约6秒)' },
    { value: 169, label: '169帧 (约7秒)' },
    { value: 193, label: '193帧 (约8秒)' },
    { value: 217, label: '217帧 (约9秒)' },
    { value: 241, label: '241帧 (约10秒)' }
  ];

  // ===== 渲染 =====
  return (
    <Container fluid className="p-4">
      {/* 页面标题 */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="fw-bold">
                <i className="bi bi-film me-2"></i>
                视频指令编辑
              </h2>
              <p className="text-muted mb-0">
                通过文本指令智能编辑视频内容，支持画面元素替换、新增和删除
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* 警告提示 */}
      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false })}>
          {alert.message}
        </Alert>
      )}

      <Row>
        {/* 左侧：编辑表单 */}
        <Col lg={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-pencil-square me-2"></i>
              编辑配置
            </Card.Header>
            <Card.Body>
              {/* 视频上传 */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-upload me-2"></i>
                  上传视频
                  <Badge bg="danger" className="ms-2">必填</Badge>
                </Form.Label>
                <Form.Control
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  建议：文件≤15MB，分辨率≤1080P，时长≤10秒，格式为MP4
                </Form.Text>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="progress mt-2">
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                )}
              </Form.Group>

              {/* 视频URL */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-link-45deg me-2"></i>
                  视频URL
                  <Badge bg="info" className="ms-2">重要</Badge>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="上传视频后自动填充，也可以手动输入公网可访问的视频URL"
                  disabled={loading}
                />
                <Form.Text className="text-danger">
                  ⚠️ 请确保视频URL公网可访问！如果使用TOS，请确保Bucket有公共读权限
                </Form.Text>
              </Form.Group>

              {/* 编辑指令 */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-chat-quote me-2"></i>
                  编辑指令
                  <Badge bg="danger" className="ms-2">必填</Badge>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleInputChange}
                  placeholder="请输入编辑指令，例如：将此视频变成新海诚风格"
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  💡 提示：使用自然语言描述即可，单指令效果更好，局部编辑时描述需精准
                </Form.Text>
              </Form.Group>

              {/* 高级参数 */}
              <Card className="mb-3 border-secondary">
                <Card.Header className="bg-light">
                  <i className="bi bi-sliders me-2"></i>
                  高级参数（可选）
                </Card.Header>
                <Card.Body>
                  {/* 随机种子 */}
                  <Form.Group className="mb-3">
                    <Form.Label>随机种子</Form.Label>
                    <Form.Control
                      type="number"
                      name="seed"
                      value={formData.seed}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">
                      默认-1（随机），设置相同种子可复现结果
                    </Form.Text>
                  </Form.Group>

                  {/* 最大帧数 */}
                  <Form.Group className="mb-0">
                    <Form.Label>输出视频最大帧数</Form.Label>
                    <Form.Select
                      name="maxFrame"
                      value={formData.maxFrame}
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      {maxFrameOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      控制输出视频的最长时长（FPS固定为24）
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* 提交按钮 */}
              <div className="d-grid">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading || !formData.prompt.trim() || !formData.videoUrl.trim()}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      开始编辑
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* 使用说明 */}
          <Card className="shadow-sm border-info">
            <Card.Header className="bg-info text-white">
              <i className="bi bi-info-circle me-2"></i>
              使用说明
            </Card.Header>
            <Card.Body>
              <ul className="mb-2">
                <li>支持通过文本指令对视频进行智能编辑</li>
                <li>可以替换、新增或删除视频画面元素</li>
                <li>输入视频建议小于等于10秒，文件小于等于15MB</li>
                <li>输出视频固定720P，FPS为24</li>
                <li>每次编辑使用单指令效果更好</li>
                <li>局部编辑时描述要精准，尤其是有多个实体时</li>
              </ul>
              <hr />
              <div className="text-muted small">
                <strong>⏱️ 处理时间：</strong>
                <ul className="mb-0 mt-1">
                  <li>任务提交后需要等待1-3分钟进行处理</li>
                  <li>如果查询时显示"任务处理中"，请等待后再次刷新</li>
                  <li>建议每隔30秒点击一次"刷新状态"按钮</li>
                  <li>处理失败可能是视频格式不支持，建议转换为标准MP4格式</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* 右侧：任务历史 */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-secondary text-white">
              <i className="bi bi-clock-history me-2"></i>
              任务历史
              <Badge bg="light" text="dark" className="ms-2">
                {taskHistory.length}
              </Badge>
            </Card.Header>
            <Card.Body style={{ maxHeight: '800px', overflowY: 'auto' }}>
              {taskHistory.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3">暂无任务历史</p>
                </div>
              ) : (
                <div className="list-group">
                  {taskHistory.map((task, index) => (
                    <div
                      key={task.task_id || index}
                      className="list-group-item list-group-item-action mb-2 border rounded"
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold">
                            {task.prompt.substring(0, 40)}
                            {task.prompt.length > 40 ? '...' : ''}
                          </h6>
                          <small className="text-muted">
                            <i className="bi bi-calendar me-1"></i>
                            {new Date(task.created_at).toLocaleString('zh-CN')}
                          </small>
                        </div>
                        <Badge bg={getStatusBadge(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </div>
                      
                      <div className="d-flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleViewTask(task)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          查看详情
                        </Button>
                        {(task.status === 'in_queue' || task.status === 'generating') && (
                          <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() => handleQueryTask(task.task_id)}
                          >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            刷新状态
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 任务详情模态框 */}
      <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-card-list me-2"></i>
            任务详情
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <>
              <Table bordered hover>
                <tbody>
                  <tr>
                    <th style={{ width: '30%' }}>任务ID</th>
                    <td>
                      <code>{selectedTask.task_id}</code>
                    </td>
                  </tr>
                  <tr>
                    <th>状态</th>
                    <td>
                      <Badge bg={getStatusBadge(selectedTask.status)}>
                        {getStatusText(selectedTask.status)}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <th>编辑指令</th>
                    <td>{selectedTask.prompt}</td>
                  </tr>
                  <tr>
                    <th>输入视频</th>
                    <td>
                      <a href={selectedTask.video_url} target="_blank" rel="noopener noreferrer">
                        查看原视频
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th>随机种子</th>
                    <td>{selectedTask.seed}</td>
                  </tr>
                  <tr>
                    <th>最大帧数</th>
                    <td>{selectedTask.max_frame}</td>
                  </tr>
                  <tr>
                    <th>创建时间</th>
                    <td>{new Date(selectedTask.created_at).toLocaleString('zh-CN')}</td>
                  </tr>
                  <tr>
                    <th>更新时间</th>
                    <td>{new Date(selectedTask.updated_at).toLocaleString('zh-CN')}</td>
                  </tr>
                </tbody>
              </Table>

              {/* 结果视频 */}
              {selectedTask.video_url_result && selectedTask.status === 'done' && (
                <Card className="mt-3 border-success">
                  <Card.Header className="bg-success text-white">
                    <i className="bi bi-check-circle me-2"></i>
                    编辑结果
                  </Card.Header>
                  <Card.Body>
                    <video
                      controls
                      style={{ width: '100%', maxHeight: '400px' }}
                      src={selectedTask.video_url_result}
                    >
                      您的浏览器不支持视频播放
                    </video>
                    <div className="mt-2">
                      <a
                        href={selectedTask.video_url_result}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="bi bi-download me-1"></i>
                        下载视频
                      </a>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedTask && (selectedTask.status === 'in_queue' || selectedTask.status === 'generating') && (
            <Button
              variant="info"
              onClick={async () => {
                const latestData = await handleQueryTask(selectedTask.task_id);
                if (latestData) {
                  setSelectedTask(prev => ({ ...prev, ...latestData }));
                }
              }}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              刷新状态
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
            关闭
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default VideoEditor;

