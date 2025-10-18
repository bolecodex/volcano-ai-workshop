import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Alert, 
  Badge, 
  Modal,
  Spinner,
  Image,
  Tabs,
  Tab,
  Table,
  InputGroup,
  ProgressBar,
  ListGroup
} from 'react-bootstrap';
import { storageSync as storage } from '../utils/storageSync';

function DigitalHuman() {
  // 状态管理
  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // 工作流步骤状态
  const [workflowStep, setWorkflowStep] = useState(1); // 1: 准备, 2: 检测, 3: 生成
  const [identifyResult, setIdentifyResult] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  
  // 表单数据
  const [formData, setFormData] = useState({
    // 图片输入
    imageUrl: '',
    imageFile: null,
    useImageFile: false,
    
    // 音频输入
    audioUrl: '',
    audioFile: null,
    useAudioFile: false,
    
    // 高级选项
    enableDetection: false, // 是否启用主体检测（步骤2）
    selectedMaskIndex: 0,   // 选择的主体索引
    prompt: '',             // 提示词
    seed: -1,               // 随机种子
    fastMode: false         // 快速模式
  });

  // 任务列表
  const [taskHistory, setTaskHistory] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFilter, setTaskFilter] = useState({
    status: '',
    taskId: '',
    pageSize: 10
  });
  const [taskStats, setTaskStats] = useState({
    total: 0,
    succeeded: 0,
    running: 0,
    failed: 0
  });

  // 显示提示信息
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 6000);
  };

  // 任务历史管理
  const STORAGE_KEY = 'digital_human_task_history';

  // 从本地存储加载任务历史
  const loadTaskHistory = () => {
    try {
      const history = localStorage.getItem(STORAGE_KEY);
      if (history) {
        const tasks = JSON.parse(history);
        const sortedTasks = tasks.sort((a, b) => new Date(b.create_time) - new Date(a.create_time));
        setTaskHistory(sortedTasks);
        calculateStats(sortedTasks);
      }
    } catch (error) {
      console.error('加载任务历史失败:', error);
    }
  };

  // 计算任务统计
  const calculateStats = (tasks) => {
    setTaskStats({
      total: tasks.length,
      succeeded: tasks.filter(t => t.status === 'done').length,
      running: tasks.filter(t => t.status === 'generating' || t.status === 'in_queue').length,
      failed: tasks.filter(t => t.status === 'failed' || t.status === 'not_found' || t.status === 'expired').length
    });
  };

  // 获取筛选后的任务列表
  const getFilteredTasks = () => {
    let filtered = [...taskHistory];
    
    // 按状态筛选
    if (taskFilter.status) {
      if (taskFilter.status === 'running') {
        filtered = filtered.filter(t => t.status === 'generating' || t.status === 'in_queue');
      } else if (taskFilter.status === 'failed') {
        filtered = filtered.filter(t => t.status === 'failed' || t.status === 'not_found' || t.status === 'expired');
      } else {
        filtered = filtered.filter(t => t.status === taskFilter.status);
      }
    }
    
    // 按任务ID筛选
    if (taskFilter.taskId) {
      filtered = filtered.filter(t => t.task_id.includes(taskFilter.taskId));
    }
    
    // 限制显示数量
    return filtered.slice(0, taskFilter.pageSize);
  };

  // 保存任务到历史
  const saveTaskToHistory = (taskData) => {
    try {
      const newTask = {
        ...taskData,
        create_time: new Date().toISOString()
      };
      
      const updatedHistory = [newTask, ...taskHistory];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      setTaskHistory(updatedHistory);
      calculateStats(updatedHistory);
    } catch (error) {
      console.error('保存任务历史失败:', error);
    }
  };

  // 更新任务状态
  const updateTaskInHistory = (taskId, updates) => {
    try {
      const updatedHistory = taskHistory.map(task =>
        task.task_id === taskId ? { ...task, ...updates, update_time: new Date().toISOString() } : task
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      setTaskHistory(updatedHistory);
      calculateStats(updatedHistory);
      
      // 如果当前选中的任务被更新，同步更新
      if (selectedTask && selectedTask.task_id === taskId) {
        setSelectedTask({ ...selectedTask, ...updates });
      }
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  };

  // 组件加载时读取任务历史
  useEffect(() => {
    loadTaskHistory();
  }, []);

  // 文件上传处理
  const handleFileUpload = async (file, type) => {
    try {
      setIsLoading(true);
      
      // 获取 TOS 配置和访问密钥
      const tosConfig = storage.getTOSConfig();
      const accessKeyId = storage.getAccessKeyId();
      const secretAccessKey = storage.getSecretAccessKey();
      
      // 验证配置是否完整
      if (!tosConfig.bucket || !accessKeyId || !secretAccessKey) {
        throw new Error('TOS配置不完整。请在设置中配置 Bucket 名称和访问密钥。');
      }
      
      const fileData = await readFileAsArrayBuffer(file);
      
      const config = {
        bucket: tosConfig.bucket,
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        region: tosConfig.region || 'cn-beijing'
      };

      const uploadData = {
        name: file.name,
        size: file.size,
        type: file.type,
        buffer: Array.from(new Uint8Array(fileData))
      };

      const result = await window.electronAPI.uploadToTOS(uploadData, config);
      
      if (result.success) {
        showAlert('success', `${type === 'image' ? '图片' : '音频'}上传成功！`);
        return result.url;  // 修复：直接使用 result.url 而不是 result.data.url
      } else {
        throw new Error(result.error?.message || '上传失败');
      }
    } catch (error) {
      showAlert('danger', `${type === 'image' ? '图片' : '音频'}上传失败: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 读取文件为ArrayBuffer
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // 步骤1：主体识别
  const handleIdentifySubject = async () => {
    try {
      setIsLoading(true);
      setWorkflowStep(1);
      
      // 获取图片URL
      let imageUrl = formData.imageUrl;
      if (formData.useImageFile && formData.imageFile) {
        imageUrl = await handleFileUpload(formData.imageFile, 'image');
        if (!imageUrl) return;
        setFormData(prev => ({ ...prev, imageUrl }));
      }

      if (!imageUrl) {
        showAlert('warning', '请提供图片URL或上传图片');
        return;
      }

      const accessKeyId = storage.getAccessKeyId();
      const secretAccessKey = storage.getSecretAccessKey();
      if (!accessKeyId || !secretAccessKey) {
        showAlert('danger', '请先在设置中配置访问密钥');
        return;
      }

      // 提交识别任务
      const submitResult = await window.electronAPI.submitOmniHumanIdentifyTask({
        image_url: imageUrl,
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
      });

      if (!submitResult.success) {
        throw new Error(submitResult.error?.message || '提交识别任务失败');
      }

      const taskId = submitResult.data.task_id;
      showAlert('info', '正在识别图片主体...');

      // 轮询查询结果
      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = 2000;

      const poll = async () => {
        if (attempts >= maxAttempts) {
          showAlert('warning', '识别超时，请稍后重试');
          setIsLoading(false);
          return;
        }

        attempts++;
        
        const queryResult = await window.electronAPI.queryOmniHumanIdentifyTask({
          task_id: taskId,
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey
        });

        if (queryResult.success) {
          const status = queryResult.data.status;
          
          if (status === 'done') {
            const hasSubject = queryResult.data.has_subject;
            setIdentifyResult({ hasSubject, taskId, imageUrl });
            
            if (hasSubject) {
              showAlert('success', '✅ 识别成功！图片包含人物或主体，可以继续下一步');
              if (formData.enableDetection) {
                setWorkflowStep(2);
              } else {
                setWorkflowStep(3);
              }
            } else {
              showAlert('warning', '⚠️ 图片中未检测到人物或主体，请更换图片');
            }
            setIsLoading(false);
            return;
          } else if (status === 'generating' || status === 'in_queue') {
            setTimeout(poll, pollInterval);
          } else {
            showAlert('danger', `识别失败: ${status}`);
            setIsLoading(false);
          }
        } else {
          showAlert('danger', `查询识别结果失败: ${queryResult.error?.message}`);
          setIsLoading(false);
        }
      };

      poll();

    } catch (error) {
      console.error('主体识别错误:', error);
      showAlert('danger', `识别失败: ${error.message}`);
      setIsLoading(false);
    }
  };

  // 步骤2：主体检测（同步）
  const handleDetectSubject = async () => {
    try {
      setIsLoading(true);
      
      const imageUrl = identifyResult?.imageUrl || formData.imageUrl;
      if (!imageUrl) {
        showAlert('warning', '请先完成主体识别');
        return;
      }

      const accessKeyId = storage.getAccessKeyId();
      const secretAccessKey = storage.getSecretAccessKey();
      
      const result = await window.electronAPI.detectOmniHumanSubject({
        image_url: imageUrl,
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
      });

      if (result.success) {
        const maskUrls = result.data.mask_urls || [];
        setDetectionResult({ maskUrls, imageUrl });
        
        if (maskUrls.length > 0) {
          showAlert('success', `✅ 检测到 ${maskUrls.length} 个主体，请选择要使用的主体`);
        } else {
          showAlert('warning', '未检测到主体，将使用整张图片生成视频');
        }
        setWorkflowStep(3);
      } else {
        throw new Error(result.error?.message || '主体检测失败');
      }
    } catch (error) {
      console.error('主体检测错误:', error);
      showAlert('danger', `检测失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 步骤3：提交视频生成任务
  const handleSubmitVideoTask = async () => {
    try {
      setIsLoading(true);
      
      // 获取图片URL
      let imageUrl = identifyResult?.imageUrl || formData.imageUrl;
      if (formData.useImageFile && formData.imageFile && !imageUrl) {
        imageUrl = await handleFileUpload(formData.imageFile, 'image');
        if (!imageUrl) return;
      }

      // 获取音频URL
      let audioUrl = formData.audioUrl;
      if (formData.useAudioFile && formData.audioFile) {
        audioUrl = await handleFileUpload(formData.audioFile, 'audio');
        if (!audioUrl) return;
        setFormData(prev => ({ ...prev, audioUrl }));
      }

      if (!imageUrl || !audioUrl) {
        showAlert('warning', '请提供图片和音频');
        return;
      }

      const accessKeyId = storage.getAccessKeyId();
      const secretAccessKey = storage.getSecretAccessKey();
      if (!accessKeyId || !secretAccessKey) {
        showAlert('danger', '请先在设置中配置访问密钥');
        return;
      }

      const requestData = {
        image_url: imageUrl,
        audio_url: audioUrl,
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
      };

      // 添加可选参数
      if (detectionResult && detectionResult.maskUrls.length > 0 && formData.selectedMaskIndex >= 0) {
        requestData.mask_url = [detectionResult.maskUrls[formData.selectedMaskIndex]];
      }

      if (formData.prompt) {
        requestData.prompt = formData.prompt;
      }

      if (formData.seed !== -1) {
        requestData.seed = formData.seed;
      }

      if (formData.fastMode) {
        requestData.pe_fast_mode = true;
      }

      // 提交任务
      const result = await window.electronAPI.submitOmniHumanVideoTask(requestData);

      if (result.success) {
        const taskId = result.data.task_id;
        
        // 保存到任务历史
        saveTaskToHistory({
          task_id: taskId,
          image_url: imageUrl,
          audio_url: audioUrl,
          prompt: formData.prompt || '',
          status: 'in_queue',
          has_mask: !!requestData.mask_url,
          fast_mode: formData.fastMode
        });

        showAlert('success', `✅ 任务提交成功！\n\n📋 任务ID: ${taskId}\n\n任务正在生成中，请在"任务列表"标签页中查看进度。\n\n⏱️ 提示：\n• 视频生成通常需要2-5分钟\n• 请等待2-3分钟后再刷新状态`);
        
        // 切换到任务列表
        setTimeout(() => setActiveTab('history'), 2000);
      } else {
        throw new Error(result.error?.message || '提交任务失败');
      }
    } catch (error) {
      console.error('提交任务错误:', error);
      showAlert('danger', `提交失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新任务状态
  const refreshTask = async (task) => {
    try {
      const accessKeyId = storage.getAccessKeyId();
      const secretAccessKey = storage.getSecretAccessKey();
      if (!accessKeyId || !secretAccessKey) {
        showAlert('danger', '请先在设置中配置访问密钥');
        return;
      }

      const result = await window.electronAPI.queryOmniHumanVideoTask({
        task_id: task.task_id,
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
      });

      if (result.success) {
        const updates = {
          status: result.data.status,
          video_url: result.data.video_url
        };

        updateTaskInHistory(task.task_id, updates);
        
        if (result.data.status === 'done' && result.data.video_url) {
          showAlert('success', '✅ 视频生成完成！');
        } else if (result.data.status === 'generating' || result.data.status === 'in_queue') {
          showAlert('info', '⏳ 任务处理中，请稍后再试');
        } else {
          showAlert('warning', `任务状态: ${result.data.status}`);
        }
      } else {
        showAlert('danger', `刷新失败: ${result.error?.message}`);
      }
    } catch (error) {
      console.error('刷新任务错误:', error);
      showAlert('danger', `刷新失败: ${error.message}`);
    }
  };

  // 批量刷新运行中的任务
  const refreshRunningTasks = async () => {
    const runningTasks = taskHistory.filter(t => 
      t.status === 'generating' || t.status === 'in_queue'
    );
    
    if (runningTasks.length === 0) {
      showAlert('info', '没有运行中的任务');
      return;
    }

    showAlert('info', `正在刷新 ${runningTasks.length} 个任务...`);
    
    for (const task of runningTasks) {
      await refreshTask(task);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // 查看任务详情
  const viewTaskDetail = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // 删除任务
  const deleteTask = (taskId) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      const updatedHistory = taskHistory.filter(t => t.task_id !== taskId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      setTaskHistory(updatedHistory);
      calculateStats(updatedHistory);
      showAlert('success', '任务已删除');
    }
  };

  // 清空任务历史
  const clearHistory = () => {
    if (window.confirm('确定要清空所有任务历史吗？此操作不可恢复！')) {
      localStorage.removeItem(STORAGE_KEY);
      setTaskHistory([]);
      calculateStats([]);
      showAlert('success', '任务历史已清空');
    }
  };

  // 重置工作流
  const resetWorkflow = () => {
    setWorkflowStep(1);
    setIdentifyResult(null);
    setDetectionResult(null);
    setFormData({
      imageUrl: '',
      imageFile: null,
      useImageFile: false,
      audioUrl: '',
      audioFile: null,
      useAudioFile: false,
      enableDetection: false,
      selectedMaskIndex: 0,
      prompt: '',
      seed: -1,
      fastMode: false
    });
  };

  // 获取状态徽章
  const getStatusBadge = (status) => {
    const statusMap = {
      'in_queue': { bg: 'secondary', text: '排队中' },
      'generating': { bg: 'primary', text: '生成中' },
      'done': { bg: 'success', text: '完成' },
      'failed': { bg: 'danger', text: '失败' },
      'not_found': { bg: 'warning', text: '未找到' },
      'expired': { bg: 'dark', text: '已过期' }
    };
    
    const config = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  return (
    <Container fluid className="py-4">
      {/* 页面标题 */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">
            <i className="bi bi-person-video2 me-2"></i>
            OmniHuman1.5 数字人
          </h2>
          <p className="text-muted">
            单张图片 + 音频生成高质量数字人视频，支持多种主体（人物、宠物、动漫等）
          </p>
        </Col>
      </Row>

      {/* 提示信息 */}
      {alert.show && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, type: '', message: '' })}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{alert.message}</pre>
        </Alert>
      )}

      {/* 主内容 */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        {/* 创建任务标签页 */}
        <Tab eventKey="create" title={<span><i className="bi bi-plus-circle me-2"></i>创建任务</span>}>
          <Row>
            <Col lg={8}>
              {/* 使用说明 */}
              <Alert variant="info" className="mb-3">
                <Alert.Heading className="h6">
                  <i className="bi bi-info-circle me-2"></i>
                  使用说明
                </Alert.Heading>
                <ul className="mb-0 small">
                  <li><strong>支持任意画幅：</strong>包含人物或主体（宠物、动漫等）的图片</li>
                  <li><strong>音频时长：</strong>必须小于35秒</li>
                  <li><strong>可选步骤：</strong>如需指定特定主体说话，可启用"主体检测"</li>
                  <li><strong>提示词：</strong>支持中文、英语、日语、韩语等，可调整画面、动作、运镜</li>
                  <li><strong>快速模式：</strong>牺牲部分效果加快生成速度</li>
                </ul>
              </Alert>

              {/* 工作流进度 */}
              <Card className="mb-4">
                <Card.Header className="bg-primary text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-diagram-3 me-2"></i>
                    生成流程
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className={workflowStep >= 1 ? 'text-primary fw-bold' : 'text-muted'}>
                      1️⃣ 准备素材
                    </span>
                    <i className={`bi bi-arrow-right ${workflowStep >= 2 ? 'text-primary' : 'text-muted'}`}></i>
                    <span className={workflowStep >= 2 ? 'text-primary fw-bold' : 'text-muted'}>
                      2️⃣ 主体检测 {!formData.enableDetection && <small>(可选)</small>}
                    </span>
                    <i className={`bi bi-arrow-right ${workflowStep >= 3 ? 'text-primary' : 'text-muted'}`}></i>
                    <span className={workflowStep >= 3 ? 'text-primary fw-bold' : 'text-muted'}>
                      3️⃣ 视频生成
                    </span>
                  </div>
                  <ProgressBar 
                    now={formData.enableDetection ? (workflowStep / 3 * 100) : ((workflowStep === 1 ? 33 : 100))} 
                    variant={workflowStep === 3 ? 'success' : 'primary'}
                    animated={isLoading}
                  />
                </Card.Body>
              </Card>

              {/* 步骤1：图片输入 */}
              <Card className="mb-4">
                <Card.Header className="bg-light">
                  <h6 className="mb-0">
                    <i className="bi bi-image me-2"></i>
                    步骤1：上传图片
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="radio"
                      label="使用图片URL"
                      checked={!formData.useImageFile}
                      onChange={() => setFormData(prev => ({ ...prev, useImageFile: false }))}
                    />
                    <Form.Check
                      type="radio"
                      label="上传本地图片"
                      checked={formData.useImageFile}
                      onChange={() => setFormData(prev => ({ ...prev, useImageFile: true }))}
                    />
                  </Form.Group>

                  {!formData.useImageFile ? (
                    <Form.Group>
                      <Form.Label>图片URL</Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      />
                    </Form.Group>
                  ) : (
                    <Form.Group>
                      <Form.Label>选择图片文件</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData(prev => ({ ...prev, imageFile: e.target.files[0] }))}
                      />
                      {formData.imageFile && (
                        <Form.Text className="text-muted">
                          已选择: {formData.imageFile.name} ({(formData.imageFile.size / 1024).toFixed(2)} KB)
                        </Form.Text>
                      )}
                    </Form.Group>
                  )}

                  {identifyResult && identifyResult.imageUrl && (
                    <div className="mt-3">
                      <Badge bg="success">✓ 已验证</Badge>
                      <Image src={identifyResult.imageUrl} thumbnail className="mt-2" style={{ maxHeight: '200px' }} />
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* 步骤2：音频输入 */}
              <Card className="mb-4">
                <Card.Header className="bg-light">
                  <h6 className="mb-0">
                    <i className="bi bi-music-note-beamed me-2"></i>
                    步骤2：上传音频
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="radio"
                      label="使用音频URL"
                      checked={!formData.useAudioFile}
                      onChange={() => setFormData(prev => ({ ...prev, useAudioFile: false }))}
                    />
                    <Form.Check
                      type="radio"
                      label="上传本地音频"
                      checked={formData.useAudioFile}
                      onChange={() => setFormData(prev => ({ ...prev, useAudioFile: true }))}
                    />
                  </Form.Group>

                  {!formData.useAudioFile ? (
                    <Form.Group>
                      <Form.Label>音频URL</Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://example.com/audio.mp3"
                        value={formData.audioUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, audioUrl: e.target.value }))}
                      />
                      <Form.Text className="text-muted">
                        音频时长必须小于35秒
                      </Form.Text>
                    </Form.Group>
                  ) : (
                    <Form.Group>
                      <Form.Label>选择音频文件</Form.Label>
                      <Form.Control
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setFormData(prev => ({ ...prev, audioFile: e.target.files[0] }))}
                      />
                      {formData.audioFile && (
                        <Form.Text className="text-muted">
                          已选择: {formData.audioFile.name} ({(formData.audioFile.size / 1024).toFixed(2)} KB)
                        </Form.Text>
                      )}
                    </Form.Group>
                  )}
                </Card.Body>
              </Card>

              {/* 高级选项 */}
              <Card className="mb-4">
                <Card.Header className="bg-light">
                  <h6 className="mb-0">
                    <i className="bi bi-gear me-2"></i>
                    高级选项
                  </h6>
                </Card.Header>
                <Card.Body>
                  {/* 主体检测开关 */}
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="启用主体检测（如需指定特定主体说话）"
                      checked={formData.enableDetection}
                      onChange={(e) => setFormData(prev => ({ ...prev, enableDetection: e.target.checked }))}
                    />
                  </Form.Group>

                  {/* 主体选择 */}
                  {formData.enableDetection && detectionResult && detectionResult.maskUrls.length > 0 && (
                    <Form.Group className="mb-3">
                      <Form.Label>选择主体</Form.Label>
                      <Form.Select
                        value={formData.selectedMaskIndex}
                        onChange={(e) => setFormData(prev => ({ ...prev, selectedMaskIndex: parseInt(e.target.value) }))}
                      >
                        {detectionResult.maskUrls.map((url, index) => (
                          <option key={index} value={index}>主体 {index + 1}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  )}

                  {/* 提示词 */}
                  <Form.Group className="mb-3">
                    <Form.Label>提示词（可选）</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="描述画面、动作、运镜等（支持中文、英语、日语、韩语等）"
                      value={formData.prompt}
                      onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                    />
                  </Form.Group>

                  {/* 随机种子 */}
                  <Form.Group className="mb-3">
                    <Form.Label>随机种子（-1为随机）</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.seed}
                      onChange={(e) => setFormData(prev => ({ ...prev, seed: parseInt(e.target.value) }))}
                    />
                  </Form.Group>

                  {/* 快速模式 */}
                  <Form.Group>
                    <Form.Check
                      type="switch"
                      label="快速模式（加快生成速度，但效果会有所下降）"
                      checked={formData.fastMode}
                      onChange={(e) => setFormData(prev => ({ ...prev, fastMode: e.target.checked }))}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* 操作按钮 */}
              <Card>
                <Card.Body>
                  <div className="d-flex gap-2 flex-wrap">
                    {/* 步骤按钮 */}
                    {workflowStep === 1 && (
                      <>
                        {formData.enableDetection ? (
                          <Button
                            variant="primary"
                            onClick={handleIdentifySubject}
                            disabled={isLoading || (!formData.imageUrl && !formData.imageFile)}
                          >
                            {isLoading ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                识别中...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-search me-2"></i>
                                开始识别主体
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            onClick={handleSubmitVideoTask}
                            disabled={isLoading || (!formData.imageUrl && !formData.imageFile) || (!formData.audioUrl && !formData.audioFile)}
                          >
                            {isLoading ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                提交中...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-play-circle me-2"></i>
                                直接生成视频
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}

                    {workflowStep === 2 && (
                      <Button
                        variant="primary"
                        onClick={handleDetectSubject}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            检测中...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-bullseye me-2"></i>
                            检测主体
                          </>
                        )}
                      </Button>
                    )}

                    {workflowStep === 3 && formData.enableDetection && (
                      <Button
                        variant="success"
                        onClick={handleSubmitVideoTask}
                        disabled={isLoading || (!formData.audioUrl && !formData.audioFile)}
                      >
                        {isLoading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            提交中...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-play-circle me-2"></i>
                            生成视频
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      variant="outline-secondary"
                      onClick={resetWorkflow}
                      disabled={isLoading}
                    >
                      <i className="bi bi-arrow-counterclockwise me-2"></i>
                      重置
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* 右侧信息栏 */}
            <Col lg={4}>
              {/* 当前状态 */}
              <Card className="mb-3">
                <Card.Header className="bg-info text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    当前状态
                  </h6>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>流程步骤:</strong>
                      <Badge bg="primary" className="ms-2">
                        {workflowStep === 1 && '准备素材'}
                        {workflowStep === 2 && '主体检测'}
                        {workflowStep === 3 && '视频生成'}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>图片:</strong>
                      {identifyResult ? (
                        <Badge bg="success" className="ms-2">✓ 已验证</Badge>
                      ) : (
                        <Badge bg="secondary" className="ms-2">未验证</Badge>
                      )}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>主体检测:</strong>
                      {formData.enableDetection ? (
                        detectionResult ? (
                          <Badge bg="success" className="ms-2">
                            已检测 ({detectionResult.maskUrls.length})
                          </Badge>
                        ) : (
                          <Badge bg="warning" className="ms-2">待检测</Badge>
                        )
                      ) : (
                        <Badge bg="secondary" className="ms-2">已跳过</Badge>
                      )}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>音频:</strong>
                      {formData.audioUrl || formData.audioFile ? (
                        <Badge bg="success" className="ms-2">✓ 已选择</Badge>
                      ) : (
                        <Badge bg="secondary" className="ms-2">未选择</Badge>
                      )}
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>

              {/* 功能特点 */}
              <Card>
                <Card.Header className="bg-success text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-star-fill me-2"></i>
                    功能特点
                  </h6>
                </Card.Header>
                <Card.Body>
                  <ul className="mb-0 small">
                    <li>支持任意画幅的图片输入</li>
                    <li>人物动作与音频强关联</li>
                    <li>支持人物、宠物、动漫等主体</li>
                    <li>可指定特定主体说话</li>
                    <li>运动自然度和结构稳定性优秀</li>
                    <li>支持提示词调整画面效果</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* 任务列表标签页 */}
        <Tab eventKey="history" title={<span><i className="bi bi-clock-history me-2"></i>任务列表 ({taskHistory.length})</span>}>
          {/* 任务统计 */}
          <Row className="mb-3">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-primary">{taskStats.total}</h3>
                  <small className="text-muted">总任务数</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-success">{taskStats.succeeded}</h3>
                  <small className="text-muted">成功</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-warning">{taskStats.running}</h3>
                  <small className="text-muted">运行中</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-danger">{taskStats.failed}</h3>
                  <small className="text-muted">失败</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* 筛选和操作 */}
          <Card className="mb-3">
            <Card.Body>
              <Row className="align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>状态筛选</Form.Label>
                    <Form.Select
                      value={taskFilter.status}
                      onChange={(e) => setTaskFilter(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="">全部状态</option>
                      <option value="done">完成</option>
                      <option value="running">运行中</option>
                      <option value="failed">失败</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>任务ID搜索</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="输入任务ID"
                      value={taskFilter.taskId}
                      onChange={(e) => setTaskFilter(prev => ({ ...prev, taskId: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>显示数量</Form.Label>
                    <Form.Select
                      value={taskFilter.pageSize}
                      onChange={(e) => setTaskFilter(prev => ({ ...prev, pageSize: parseInt(e.target.value) }))}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={refreshRunningTasks}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      刷新运行中
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={clearHistory}
                    >
                      <i className="bi bi-trash me-1"></i>
                      清空
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* 任务列表 */}
          <Card>
            <Card.Body className="p-0">
              {getFilteredTasks().length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-2">暂无任务记录</p>
                </div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '180px' }}>任务ID</th>
                      <th>创建时间</th>
                      <th>状态</th>
                      <th style={{ width: '80px' }}>主体</th>
                      <th style={{ width: '80px' }}>快速</th>
                      <th style={{ width: '200px' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTasks().map((task) => (
                      <tr key={task.task_id}>
                        <td>
                          <small className="font-monospace">{task.task_id.substring(0, 16)}...</small>
                        </td>
                        <td>
                          <small>{new Date(task.create_time).toLocaleString('zh-CN')}</small>
                        </td>
                        <td>
                          {getStatusBadge(task.status)}
                        </td>
                        <td className="text-center">
                          {task.has_mask ? (
                            <Badge bg="info">✓</Badge>
                          ) : (
                            <Badge bg="secondary">-</Badge>
                          )}
                        </td>
                        <td className="text-center">
                          {task.fast_mode ? (
                            <Badge bg="warning">⚡</Badge>
                          ) : (
                            <Badge bg="secondary">-</Badge>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => viewTaskDetail(task)}
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => refreshTask(task)}
                              disabled={task.status === 'done' || task.status === 'failed'}
                            >
                              <i className="bi bi-arrow-clockwise"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => deleteTask(task.task_id)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* 任务详情模态框 */}
      <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-info-circle me-2"></i>
            任务详情
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <>
              <Table bordered>
                <tbody>
                  <tr>
                    <td><strong>任务ID:</strong></td>
                    <td className="font-monospace">{selectedTask.task_id}</td>
                  </tr>
                  <tr>
                    <td><strong>状态:</strong></td>
                    <td>{getStatusBadge(selectedTask.status)}</td>
                  </tr>
                  <tr>
                    <td><strong>创建时间:</strong></td>
                    <td>{new Date(selectedTask.create_time).toLocaleString('zh-CN')}</td>
                  </tr>
                  {selectedTask.update_time && (
                    <tr>
                      <td><strong>更新时间:</strong></td>
                      <td>{new Date(selectedTask.update_time).toLocaleString('zh-CN')}</td>
                    </tr>
                  )}
                  <tr>
                    <td><strong>使用主体检测:</strong></td>
                    <td>{selectedTask.has_mask ? '是' : '否'}</td>
                  </tr>
                  <tr>
                    <td><strong>快速模式:</strong></td>
                    <td>{selectedTask.fast_mode ? '是' : '否'}</td>
                  </tr>
                  {selectedTask.prompt && (
                    <tr>
                      <td><strong>提示词:</strong></td>
                      <td>{selectedTask.prompt}</td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* 输入素材预览 */}
              <Row className="mb-3">
                <Col md={6}>
                  <h6>输入图片</h6>
                  {selectedTask.image_url && (
                    <Image src={selectedTask.image_url} thumbnail className="w-100" />
                  )}
                </Col>
                <Col md={6}>
                  <h6>音频</h6>
                  {selectedTask.audio_url && (
                    <audio controls className="w-100">
                      <source src={selectedTask.audio_url} />
                    </audio>
                  )}
                </Col>
              </Row>

              {/* 生成结果 */}
              {selectedTask.status === 'done' && selectedTask.video_url && (
                <>
                  <h6>生成视频</h6>
                  <video controls className="w-100" style={{ maxHeight: '400px' }}>
                    <source src={selectedTask.video_url} />
                  </video>
                  <div className="mt-2">
                    <Button
                      variant="success"
                      size="sm"
                      href={selectedTask.video_url}
                      target="_blank"
                    >
                      <i className="bi bi-download me-2"></i>
                      下载视频
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
            关闭
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default DigitalHuman;


