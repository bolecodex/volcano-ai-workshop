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
  ProgressBar, 
  Modal,
  Table,
  Spinner,
  Tabs,
  Tab,
  InputGroup
} from 'react-bootstrap';
import { storage } from '../utils/storage';
import { webAPI } from '../utils/apiClient';

function VideoGenerator() {
  // 状态管理
  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  
  // 创建任务相关状态
  const [taskForm, setTaskForm] = useState({
    model: 'jimeng_ti2v_v30_pro', // 默认选择即梦3.0 Pro
    generationType: 'text-to-video', // 'text-to-video' 或 'image-to-video'
    textPrompt: '',
    imageFile: null,
    imageUrl: '',
    useImageFile: true,
    imageRole: 'first_frame',
    resolution: '720p',
    ratio: '16:9',
    duration: 5,
    framespersecond: 24,
    watermark: false,
    seed: -1,
    camerafixed: false,
    returnLastFrame: false,
    callbackUrl: ''
  });

  // 提示词示例
  const promptExamples = {
    'text-to-video': [
      '一只可爱的小猫在花园里追蝴蝶，阳光明媚，画面温馨',
      '城市夜景，霓虹灯闪烁，车流如织，现代都市风格',
      '海边日落，波浪轻拍沙滩，海鸥飞翔，浪漫唯美',
      '森林中的小溪，清澈的水流，阳光透过树叶洒下',
      '雪山之巅，云雾缭绕，壮丽的自然风光'
    ],
    'image-to-video': [
      '让画面中的人物开始微笑和眨眼',
      '让静态的风景动起来，树叶摇摆，云朵飘动',
      '为画面添加动态效果，水面波光粼粼',
      '让画面中的动物开始移动和活动',
      '为静态场景增加生动的动态元素'
    ]
  };

  // 模型配置 - 根据API文档更新（使用确切的模型名称）
  const modelConfig = {
    'text-to-video': [
      { 
        value: 'jimeng_ti2v_v30_pro', 
        label: '即梦视频 3.0 Pro ⭐', 
        description: '1080P高清，多镜头叙事，专业级质感',
        recommended: true,
        apiType: 'jimeng30pro', // 标识使用即梦3.0 Pro API
        supportedRoles: ['first_frame'],
        requireAccessKey: true // 需要AccessKey认证
      },
      { 
        value: 'doubao-seedance-1-0-pro-250528', 
        label: 'Seedance 1.0 Pro', 
        description: '高质量文生视频，支持复杂场景',
        apiType: 'ark', // 标识使用火山方舟API
        supportedRoles: ['first_frame'] // 支持首帧图生视频
      },
      { 
        value: 'doubao-seedance-1-0-lite-t2v', 
        label: 'Seedance 1.0 Lite T2V', 
        description: '轻量级文生视频，速度更快',
        apiType: 'ark',
        supportedRoles: [] // 仅文生视频
      }
    ],
    'image-to-video': [
      { 
        value: 'jimeng_ti2v_v30_pro', 
        label: '即梦视频 3.0 Pro ⭐', 
        description: '1080P高清图生视频（首帧），专业级质感',
        recommended: true,
        apiType: 'jimeng30pro',
        supportedRoles: ['first_frame'],
        requireAccessKey: true
      },
      { 
        value: 'doubao-seedance-1-0-pro-250528', 
        label: 'Seedance 1.0 Pro', 
        description: '支持首帧图生视频，效果优秀',
        apiType: 'ark',
        supportedRoles: ['first_frame'],
        note: '推荐用于首帧图生视频'
      },
      { 
        value: 'doubao-seedance-1-0-lite-i2v', 
        label: 'Seedance 1.0 Lite I2V', 
        description: '多功能图生视频模型',
        apiType: 'ark',
        supportedRoles: ['first_frame', 'last_frame', 'reference_image'],
        note: '支持首帧、首尾帧、参考图生视频'
      }
    ]
  };
  
  // 任务列表和查询相关状态
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskQuery, setTaskQuery] = useState({
    pageNum: 1,
    pageSize: 10,
    status: '',
    taskIds: '',
    model: ''
  });
  const [taskStats, setTaskStats] = useState({
    total: 0,
    queued: 0,
    running: 0,
    succeeded: 0,
    failed: 0
  });

  // 显示提示信息
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  // 处理生成类型变化
  const handleGenerationTypeChange = (type) => {
    const defaultModels = {
      'text-to-video': 'jimeng_ti2v_v30_pro',
      'image-to-video': 'jimeng_ti2v_v30_pro'
    };
    
    setTaskForm(prev => ({
      ...prev,
      generationType: type,
      model: defaultModels[type],
      textPrompt: '', // 清空提示词
      imageFile: null, // 清空图片
      imageUrl: ''
    }));
  };

  // 插入示例提示词
  const insertExamplePrompt = (example) => {
    setTaskForm(prev => ({
      ...prev,
      textPrompt: example
    }));
  };

  // 处理文件上传
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        showAlert('danger', '不支持的图片格式，请上传 JPEG、PNG、WebP、BMP、TIFF 或 GIF 格式的图片');
        return;
      }
      
      // 检查文件大小 (30MB)
      if (file.size > 30 * 1024 * 1024) {
        showAlert('danger', '图片文件大小不能超过 30MB');
        return;
      }
      
      setTaskForm(prev => ({ ...prev, imageFile: file }));
    }
  };

  // 将文件转换为 Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // 创建视频生成任务
  const createVideoTask = async () => {
    try {
      setIsLoading(true);
      
      // 获取当前选择的模型配置
      const currentModelConfig = modelConfig[taskForm.generationType].find(m => m.value === taskForm.model);
      
      // 根据模型类型检查认证
      if (currentModelConfig?.apiType === 'jimeng30pro') {
        // 即梦3.0 Pro 需要 AccessKey
        const accessKeys = storage.getAccessKeys();
        if (!accessKeys.accessKeyId || !accessKeys.secretAccessKey) {
          showAlert('warning', '即梦3.0 Pro需要配置Access Key ID和Secret Access Key，请在设置页面配置访问密钥');
          return;
        }
      } else {
        // 其他模型需要 API Key
        const apiKey = storage.getApiKey();
        if (!apiKey) {
          showAlert('warning', '请先在设置页面配置API Key');
          return;
        }
      }
      
      // 验证输入
      if (taskForm.generationType === 'text-to-video') {
        if (!taskForm.textPrompt.trim()) {
          showAlert('warning', '文生视频模式下，文本提示词为必填项');
          return;
        }
      } else if (taskForm.generationType === 'image-to-video') {
        const hasImage = (taskForm.useImageFile && taskForm.imageFile) || 
                        (!taskForm.useImageFile && taskForm.imageUrl.trim());
        if (!hasImage) {
          showAlert('warning', '图生视频模式下，必须提供图片');
          return;
        }
      }

      // 根据模型类型调用不同的API
      let result;
      
      if (currentModelConfig?.apiType === 'jimeng30pro') {
        // ========== 即梦3.0 Pro API ==========
        const accessKeys = storage.getAccessKeys();
        
        // 构建即梦3.0 Pro请求数据
        const jimengRequestData = {
          accessKeyId: accessKeys.accessKeyId,
          secretAccessKey: accessKeys.secretAccessKey,
          frames: taskForm.duration === 5 ? 121 : 241, // 5秒=121帧, 10秒=241帧
          aspect_ratio: taskForm.ratio
        };
        
        // 添加提示词
        if (taskForm.textPrompt.trim()) {
          jimengRequestData.prompt = taskForm.textPrompt.trim();
        }
        
        // 添加种子值
        if (taskForm.seed !== -1) {
          jimengRequestData.seed = taskForm.seed;
        }
        
        // 添加图片（如果是图生视频）
        if (taskForm.generationType === 'image-to-video') {
          if (taskForm.useImageFile && taskForm.imageFile) {
            // 使用 base64
            const base64String = await fileToBase64ForJimeng(taskForm.imageFile);
            jimengRequestData.binary_data_base64 = [base64String];
          } else if (!taskForm.useImageFile && taskForm.imageUrl.trim()) {
            // 使用 URL
            jimengRequestData.image_urls = [taskForm.imageUrl.trim()];
          }
        }
        
        console.log('📤 即梦3.0 Pro请求:', {
          model: taskForm.model,
          hasPrompt: !!jimengRequestData.prompt,
          hasImage: !!(jimengRequestData.binary_data_base64 || jimengRequestData.image_urls),
          frames: jimengRequestData.frames,
          aspect_ratio: jimengRequestData.aspect_ratio
        });
        
        if (window.electronAPI) {
          result = await window.electronAPI.submitJimeng30ProVideoTask(jimengRequestData);
          
          // 即梦3.0 Pro需要额外处理任务ID格式
          if (result.success) {
            const taskId = result.data.task_id;
            
            // 转换为统一格式
            result.data = {
              id: taskId,
              task_id: taskId,
              status: 'in_queue',
              model: taskForm.model,
              apiType: 'jimeng30pro'
            };
            
            // 保存到本地存储
            const taskInfo = {
              id: taskId,
              task_id: taskId,
              model: taskForm.model,
              status: 'in_queue',
              apiType: 'jimeng30pro',
              prompt: taskForm.textPrompt,
              generationType: taskForm.generationType,
              frames: jimengRequestData.frames,
              aspect_ratio: jimengRequestData.aspect_ratio
            };
            storage.saveJimeng30ProTask(taskInfo);
            console.log('✅ 即梦3.0 Pro任务已保存到本地存储:', taskId);
            
            // 开始轮询查询任务状态
            pollJimeng30ProTaskInline(taskId);
          }
        } else {
          showAlert('warning', '即梦3.0 Pro功能需要在Electron桌面应用中使用');
          return;
        }
      } else {
        // ========== 火山方舟 API ==========
        const apiKey = storage.getApiKey();
        const content = [];
        
        // 添加文本内容
        if (taskForm.textPrompt.trim()) {
          let textContent = taskForm.textPrompt.trim();
          
          // 添加参数到文本提示词
          const params = [];
          if (taskForm.resolution !== '720p') params.push(`--resolution ${taskForm.resolution}`);
          if (taskForm.ratio !== '16:9') params.push(`--ratio ${taskForm.ratio}`);
          if (taskForm.duration !== 5) params.push(`--duration ${taskForm.duration}`);
          if (taskForm.framespersecond !== 24) params.push(`--fps ${taskForm.framespersecond}`);
          if (taskForm.watermark) params.push('--watermark true');
          if (taskForm.seed !== -1) params.push(`--seed ${taskForm.seed}`);
          if (taskForm.camerafixed) params.push('--camerafixed true');
          
          if (params.length > 0) {
            textContent += ' ' + params.join(' ');
          }
          
          content.push({
            type: 'text',
            text: textContent
          });
        }
        
        // 添加图片内容（仅在图生视频模式下）
        if (taskForm.generationType === 'image-to-video') {
          if (taskForm.useImageFile && taskForm.imageFile) {
            const base64Image = await fileToBase64(taskForm.imageFile);
            
            const imageContent = {
              type: 'image_url',
              image_url: {
                url: base64Image
              }
            };
            
            if (currentModelConfig && currentModelConfig.supportedRoles.includes(taskForm.imageRole)) {
              imageContent.role = taskForm.imageRole;
            }
            
            content.push(imageContent);
          } else if (!taskForm.useImageFile && taskForm.imageUrl.trim()) {
            const imageContent = {
              type: 'image_url',
              image_url: {
                url: taskForm.imageUrl.trim()
              }
            };
            
            if (currentModelConfig && currentModelConfig.supportedRoles.includes(taskForm.imageRole)) {
              imageContent.role = taskForm.imageRole;
            }
            
            content.push(imageContent);
          }
        }
        
        if (content.length === 0) {
          showAlert('warning', '请提供有效的输入内容');
          return;
        }
        
        // 构建请求体
        const requestData = {
          model: taskForm.model,
          content: content,
          apiKey: apiKey
        };
        
        if (taskForm.callbackUrl.trim()) {
          requestData.callback_url = taskForm.callbackUrl.trim();
        }
        
        if (taskForm.returnLastFrame) {
          requestData.return_last_frame = true;
        }
        
        console.log('📋 火山方舟请求:', {
          model: taskForm.model,
          contentLength: content.length
        });
        
        if (window.electronAPI) {
          result = await window.electronAPI.createVideoTask(requestData);
        } else {
          showAlert('warning', '检测到Web环境，请使用Electron桌面应用以获得最佳体验');
          return;
        }
      }
      
      if (result.success) {
        showAlert('success', `视频生成任务创建成功！任务ID: ${result.data.id || result.data.task_id}`);
        // 重置表单
        setTaskForm(prev => ({
          ...prev,
          textPrompt: '',
          imageFile: null,
          imageUrl: '',
          callbackUrl: ''
        }));
        // 刷新任务列表
        if (activeTab === 'list') {
          fetchTasks();
        }
      } else {
        const errorMessage = result.error?.message || result.error || '未知错误';
        
        // 特殊处理模型不存在的错误
        if (errorMessage.includes('does not exist') || errorMessage.includes('do not have access')) {
          showAlert('danger', `模型访问失败: 所选模型 "${taskForm.model}" 不存在或您没有访问权限。请尝试选择其他模型或联系管理员开通权限。`);
        } else {
          showAlert('danger', `创建任务失败: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('创建视频任务失败:', error);
      showAlert('danger', `创建任务失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取任务列表
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      
      // 获取本地存储的即梦 3.0 Pro 任务
      let jimeng30ProTasks = storage.getJimeng30ProTasks();
      
      // 检查API Key（用于火山方舟任务）
      const apiKey = storage.getApiKey();
      let arkTasks = [];
      
      if (apiKey) {
        const queryParams = {
          page_num: taskQuery.pageNum,
          page_size: taskQuery.pageSize,
          status: taskQuery.status,
          task_ids: taskQuery.taskIds,
          model: taskQuery.model
        };
        
        // 使用IPC或HTTP请求获取火山方舟任务
        let result;
        if (window.electronAPI) {
          // Electron环境，使用IPC
          result = await window.electronAPI.getVideoTasks(queryParams, apiKey);
        } else {
          // Web环境，直接调用云端API
          result = await webAPI.getVideoTasks({ queryParams, apiKey });
        }
        
        if (result.success) {
          arkTasks = result.data.items || [];
        } else {
          console.error('获取火山方舟任务失败:', result.error);
        }
      }
      
      // 应用筛选条件到即梦 3.0 Pro 任务
      if (taskQuery.status) {
        // 映射即梦状态到火山方舟状态格式
        const statusMap = {
          'in_queue': 'queued',
          'generating': 'running',
          'done': 'succeeded',
          'not_found': 'failed',
          'expired': 'failed'
        };
        const mappedStatus = Object.entries(statusMap).find(([k, v]) => v === taskQuery.status)?.[0];
        if (mappedStatus) {
          jimeng30ProTasks = jimeng30ProTasks.filter(task => task.status === mappedStatus);
        } else {
          jimeng30ProTasks = [];
        }
      }
      
      if (taskQuery.taskIds) {
        const searchIds = taskQuery.taskIds.split(',').map(id => id.trim());
        jimeng30ProTasks = jimeng30ProTasks.filter(task => 
          searchIds.some(searchId => task.id && task.id.includes(searchId))
        );
      }
      
      if (taskQuery.model && taskQuery.model !== 'jimeng_ti2v_v30_pro') {
        jimeng30ProTasks = [];
      } else if (taskQuery.model === 'jimeng_ti2v_v30_pro') {
        arkTasks = [];
      }
      
      // 合并任务列表（即梦任务在前）
      const allTasks = [...jimeng30ProTasks, ...arkTasks];
      setTasks(allTasks);
      
      // 计算统计信息
      const stats = {
        total: allTasks.length,
        queued: 0,
        running: 0,
        succeeded: 0,
        failed: 0
      };
      
      allTasks.forEach(task => {
        // 映射即梦状态到统计格式
        let statKey = task.status;
        if (task.apiType === 'jimeng30pro') {
          const statusMap = {
            'in_queue': 'queued',
            'generating': 'running',
            'done': 'succeeded',
            'not_found': 'failed',
            'expired': 'failed'
          };
          statKey = statusMap[task.status] || task.status;
        }
        
        if (stats[statKey] !== undefined) {
          stats[statKey]++;
        }
      });
      
      setTaskStats(stats);
    } catch (error) {
      console.error('获取任务列表失败:', error);
      showAlert('danger', `获取任务列表失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 查询单个任务详情
  const fetchTaskDetail = async (taskId) => {
    try {
      // 首先检查是否是即梦 3.0 Pro 任务
      const jimeng30ProTasks = storage.getJimeng30ProTasks();
      const jimeng30ProTask = jimeng30ProTasks.find(t => t.id === taskId);
      
      if (jimeng30ProTask) {
        // 如果是即梦 3.0 Pro 任务，尝试查询最新状态
        if (window.electronAPI) {
          const accessKeys = storage.getAccessKeys();
          try {
            const result = await window.electronAPI.queryJimeng30ProVideoTask({
              task_id: taskId,
              accessKeyId: accessKeys.accessKeyId,
              secretAccessKey: accessKeys.secretAccessKey
            });
            
            if (result.success) {
              // 更新本地存储
              const updates = {
                status: result.data.status
              };
              if (result.data.video_url) {
                updates.video_url = result.data.video_url;
              }
              storage.updateJimeng30ProTask(taskId, updates);
              
              // 显示更新后的任务信息
              setSelectedTask({ ...jimeng30ProTask, ...updates });
              setShowTaskModal(true);
            } else {
              // 查询失败，显示本地存储的信息
              setSelectedTask(jimeng30ProTask);
              setShowTaskModal(true);
            }
          } catch (error) {
            console.error('查询即梦 3.0 Pro 任务失败:', error);
            // 显示本地存储的信息
            setSelectedTask(jimeng30ProTask);
            setShowTaskModal(true);
          }
        } else {
          // 非 Electron 环境，直接显示本地存储的信息
          setSelectedTask(jimeng30ProTask);
          setShowTaskModal(true);
        }
        return;
      }
      
      // 否则是火山方舟任务
      const apiKey = storage.getApiKey();
      if (!apiKey) {
        showAlert('warning', '请先在设置页面配置API Key');
        return;
      }
      
      // 使用IPC或云端API
      let result;
      if (window.electronAPI) {
        // Electron环境，使用IPC
        result = await window.electronAPI.getVideoTask({ taskId, apiKey });
      } else {
        // Web环境，直接调用云端API
        result = await webAPI.getVideoTask({ taskId, apiKey });
      }
      
      if (result.success) {
        setSelectedTask(result.data);
        setShowTaskModal(true);
      } else {
        showAlert('danger', `获取任务详情失败: ${result.error?.message || result.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('获取任务详情失败:', error);
      showAlert('danger', `获取任务详情失败: ${error.message}`);
    }
  };

  // 取消/删除任务
  const deleteTask = async (taskId) => {
    if (!window.confirm('确定要删除这个任务吗？')) {
      return;
    }
    
    try {
      // 首先检查是否是即梦 3.0 Pro 任务
      const jimeng30ProTasks = storage.getJimeng30ProTasks();
      const jimeng30ProTask = jimeng30ProTasks.find(t => t.id === taskId);
      
      if (jimeng30ProTask) {
        // 如果是即梦 3.0 Pro 任务，从本地存储删除
        const success = storage.deleteJimeng30ProTask(taskId);
        if (success) {
          showAlert('success', '任务删除成功');
          fetchTasks(); // 刷新列表
          if (selectedTask && selectedTask.id === taskId) {
            setShowTaskModal(false);
            setSelectedTask(null);
          }
        } else {
          showAlert('danger', '删除任务失败');
        }
        return;
      }
      
      // 否则是火山方舟任务
      const apiKey = storage.getApiKey();
      if (!apiKey) {
        showAlert('warning', '请先在设置页面配置API Key');
        return;
      }
      
      // 使用IPC或云端API
      let result;
      if (window.electronAPI) {
        // Electron环境，使用IPC
        result = await window.electronAPI.deleteVideoTask({ taskId, apiKey });
      } else {
        // Web环境，直接调用云端API
        result = await webAPI.deleteVideoTask({ taskId, apiKey });
      }
      
      if (result.success) {
        showAlert('success', '任务删除成功');
        fetchTasks(); // 刷新列表
        if (selectedTask && selectedTask.id === taskId) {
          setShowTaskModal(false);
          setSelectedTask(null);
        }
      } else {
        showAlert('danger', `删除任务失败: ${result.error?.message || result.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      showAlert('danger', `删除任务失败: ${error.message}`);
    }
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  // 获取状态徽章样式
  const getStatusBadge = (status) => {
    const statusMap = {
      // 火山方舟视频生成状态
      queued: { bg: 'secondary', text: '排队中' },
      running: { bg: 'primary', text: '运行中' },
      succeeded: { bg: 'success', text: '成功' },
      failed: { bg: 'danger', text: '失败' },
      cancelled: { bg: 'warning', text: '已取消' },
      // 即梦 3.0 Pro 状态
      in_queue: { bg: 'secondary', text: '排队中' },
      generating: { bg: 'primary', text: '生成中' },
      done: { bg: 'success', text: '完成' },
      not_found: { bg: 'danger', text: '未找到' },
      expired: { bg: 'warning', text: '已过期' }
    };
    
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  // 页面加载时获取任务列表
  useEffect(() => {
    if (activeTab === 'list') {
      fetchTasks();
    }
  }, [activeTab]);

  // ========== 即梦 3.0 Pro 辅助函数 ==========
  
  // 将文件转换为 Base64（用于即梦 3.0 Pro）
  const fileToBase64ForJimeng = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // 移除 data:image/xxx;base64, 前缀，只保留 base64 字符串
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  // 轮询查询即梦 3.0 Pro 任务状态（集成版本）
  const pollJimeng30ProTaskInline = async (taskId, maxAttempts = 60) => {
    const accessKeys = storage.getAccessKeys();
    let attempts = 0;
    
    const poll = async () => {
      try {
        attempts++;
        
        if (window.electronAPI) {
          const result = await window.electronAPI.queryJimeng30ProVideoTask({
            task_id: taskId,
            accessKeyId: accessKeys.accessKeyId,
            secretAccessKey: accessKeys.secretAccessKey
          });
          
          if (result.success) {
            const status = result.data.status;
            
            console.log(`轮询即梦3.0 Pro任务 ${taskId}, 第${attempts}次, 状态: ${status}`);
            
            // 更新本地存储的任务状态
            const updates = {
              status: status
            };
            if (result.data.video_url) {
              updates.video_url = result.data.video_url;
            }
            storage.updateJimeng30ProTask(taskId, updates);
            
            if (status === 'done') {
              if (result.data.video_url) {
                showAlert('success', `即梦3.0 Pro视频生成完成！任务ID: ${taskId}`);
              }
              // 刷新任务列表
              if (activeTab === 'list') {
                fetchTasks();
              }
              return; // 停止轮询
            } else if (status === 'not_found' || status === 'expired') {
              showAlert('danger', `即梦3.0 Pro任务${status === 'not_found' ? '未找到' : '已过期'}，任务ID: ${taskId}`);
              return; // 停止轮询
            } else if (status === 'in_queue' || status === 'generating') {
              // 继续轮询
              if (attempts < maxAttempts) {
                setTimeout(poll, 5000); // 5秒后再次查询
              } else {
                showAlert('warning', `即梦3.0 Pro任务查询超时，请在任务列表中手动查看。任务ID: ${taskId}`);
              }
            }
          } else {
            console.error('查询即梦3.0 Pro任务失败:', result.error);
            if (attempts < maxAttempts) {
              setTimeout(poll, 5000);
            }
          }
        }
      } catch (error) {
        console.error('轮询查询即梦3.0 Pro任务出错:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      }
    };
    
    // 开始轮询
    poll();
  };


  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-camera-video me-2"></i>
                视频生成
              </h4>
            </Card.Header>
            <Card.Body>
              {alert.show && (
                <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, type: '', message: '' })}>
                  {alert.message}
                </Alert>
              )}

              {/* 视频生成快捷入口 */}
              <Row className="mb-4">
                <Col>
                  <Card className="bg-gradient-primary text-white border-0 shadow video-entry-card">
                    <Card.Body className="py-4">
                      <Row className="align-items-center">
                        <Col md={8}>
                          <div className="d-flex align-items-center">
                            <div className="video-entry-icon rounded-circle p-3 me-3">
                              <i className="bi bi-camera-video fs-3"></i>
                            </div>
                            <div>
                              <h4 className="mb-2 fw-bold">AI 视频生成工作台</h4>
                              <p className="mb-0 opacity-90 fs-6">
                                🎬 支持文生视频、图生视频 | 🎯 多种AI模型可选 | ⚡ 高质量视频输出
                              </p>
                            </div>
                          </div>
                        </Col>
                        <Col md={4} className="text-end">
                          <div className="d-flex flex-column align-items-end">
                            <Button 
                              variant="light" 
                              size="lg"
                              className="mb-2 px-4 py-2 btn-video-create fw-bold"
                              onClick={() => setActiveTab('create')}
                              disabled={!storage.getApiKey()}
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              立即创建视频
                            </Button>
                            {!storage.getApiKey() ? (
                              <small className="text-white-50">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                请先在设置中配置API Key
                              </small>
                            ) : (
                              <small className="text-white-75">
                                <i className="bi bi-check-circle me-1"></i>
                                API Key已配置，可以开始创建
                              </small>
                            )}
                          </div>
                        </Col>
                      </Row>
                      
                      {/* 统计信息栏 */}
                      <Row className="mt-4 pt-3 border-top border-white border-opacity-25">
                        <Col xs={6} md={3} className="text-center video-stats-item">
                          <div className="d-flex flex-column align-items-center">
                            <div className="h3 mb-1 fw-bold">{taskStats.total}</div>
                            <small className="opacity-75">
                              <i className="bi bi-collection me-1"></i>
                              总任务数
                            </small>
                          </div>
                        </Col>
                        <Col xs={6} md={3} className="text-center video-stats-item">
                          <div className="d-flex flex-column align-items-center">
                            <div className="h3 mb-1 fw-bold">
                              {taskStats.running > 0 && <i className="bi bi-arrow-clockwise me-1 text-warning"></i>}
                              {taskStats.running}
                            </div>
                            <small className="opacity-75">
                              <i className="bi bi-hourglass-split me-1"></i>
                              运行中
                            </small>
                          </div>
                        </Col>
                        <Col xs={6} md={3} className="text-center video-stats-item">
                          <div className="d-flex flex-column align-items-center">
                            <div className="h3 mb-1 fw-bold">
                              {taskStats.succeeded > 0 && <i className="bi bi-check-circle me-1 text-success"></i>}
                              {taskStats.succeeded}
                            </div>
                            <small className="opacity-75">
                              <i className="bi bi-check2-circle me-1"></i>
                              已完成
                            </small>
                          </div>
                        </Col>
                        <Col xs={6} md={3} className="text-center video-stats-item">
                          <div className="d-flex flex-column align-items-center">
                            <div className="h3 mb-1 fw-bold">
                              {taskStats.failed > 0 && <i className="bi bi-exclamation-circle me-1 text-danger"></i>}
                              {taskStats.failed}
                            </div>
                            <small className="opacity-75">
                              <i className="bi bi-x-circle me-1"></i>
                              失败
                            </small>
                          </div>
                        </Col>
                      </Row>
                      
                      {/* 快捷操作按钮 */}
                      <Row className="mt-3">
                        <Col className="text-center">
                          <Button 
                            variant="outline-light" 
                            size="sm" 
                            className="me-2"
                            onClick={() => setActiveTab('list')}
                          >
                            <i className="bi bi-list-ul me-1"></i>
                            查看任务列表
                          </Button>
                          <Button 
                            variant="outline-light" 
                            size="sm"
                            onClick={() => {
                              setActiveTab('list');
                              fetchTasks();
                            }}
                          >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            刷新状态
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                {/* 创建任务标签页 */}
                <Tab eventKey="create" title={<><i className="bi bi-plus-circle me-1"></i>创建任务</>}>
                  <Row>
                    <Col lg={8}>
                      <Form>
                        {/* 生成类型选择 */}
                        <Card className="mb-4 border-primary">
                          <Card.Header className="bg-primary text-white">
                            <h6 className="mb-0">
                              <i className="bi bi-gear me-2"></i>
                              选择生成类型
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              <Col md={6}>
                                <div 
                                  className={`generation-type-card p-3 border rounded ${
                                    taskForm.generationType === 'text-to-video' ? 'active' : ''
                                  }`}
                                  onClick={() => handleGenerationTypeChange('text-to-video')}
                                >
                                  <div className="d-flex align-items-center mb-2">
                                    <i className="bi bi-type fs-4 me-2 text-primary"></i>
                                    <h6 className="mb-0">文生视频</h6>
                                  </div>
                                  <p className="small text-muted mb-0">
                                    根据文本描述生成视频，适合创意内容制作
                                  </p>
                                </div>
                              </Col>
                              <Col md={6}>
                                <div 
                                  className={`generation-type-card p-3 border rounded ${
                                    taskForm.generationType === 'image-to-video' ? 'active' : ''
                                  }`}
                                  onClick={() => handleGenerationTypeChange('image-to-video')}
                                >
                                  <div className="d-flex align-items-center mb-2">
                                    <i className="bi bi-image fs-4 me-2 text-success"></i>
                                    <h6 className="mb-0">图生视频</h6>
                                  </div>
                                  <p className="small text-muted mb-0">
                                    基于图片生成动态视频，让静态画面动起来
                                  </p>
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>

                        {/* 模型选择 */}
                        <Row>
                          <Col md={taskForm.generationType === 'image-to-video' ? 6 : 12}>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                <i className="bi bi-cpu me-1"></i>
                                AI模型选择
                              </Form.Label>
                              <Form.Select 
                                value={taskForm.model}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, model: e.target.value }))}
                              >
                                {modelConfig[taskForm.generationType].map(model => (
                                  <option key={model.value} value={model.value}>
                                    {model.recommended ? '⭐ ' : ''}{model.label} - {model.description}
                                  </option>
                                ))}
                              </Form.Select>
                              
                              {/* 显示当前选择模型的注意事项 */}
                              {(() => {
                                const currentModel = modelConfig[taskForm.generationType].find(m => m.value === taskForm.model);
                                return currentModel?.note && (
                                  <Form.Text className="text-warning">
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    {currentModel.note}
                                  </Form.Text>
                                );
                              })()}
                            </Form.Group>
                          </Col>
                          {taskForm.generationType === 'image-to-video' && (
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  <i className="bi bi-image me-1"></i>
                                  图片角色
                                </Form.Label>
                                <Form.Select 
                                  value={taskForm.imageRole}
                                  onChange={(e) => setTaskForm(prev => ({ ...prev, imageRole: e.target.value }))}
                                >
                                  <option value="first_frame">首帧图片</option>
                                  <option value="last_frame">尾帧图片</option>
                                  <option value="reference_image">参考图片</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          )}
                        </Row>

                        {/* 文本提示词 */}
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <i className="bi bi-chat-text me-1"></i>
                            文本提示词
                            {taskForm.generationType === 'text-to-video' && (
                              <span className="text-danger">*</span>
                            )}
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder={
                              taskForm.generationType === 'text-to-video' 
                                ? "请输入视频生成的文本描述，支持中英文，建议不超过500字..."
                                : "可选：描述希望图片如何动起来，或添加动态效果..."
                            }
                            value={taskForm.textPrompt}
                            onChange={(e) => setTaskForm(prev => ({ ...prev, textPrompt: e.target.value }))}
                          />
                          
                          {/* 示例提示词 */}
                          <div className="mt-2">
                            <small className="text-muted d-block mb-2">
                              <i className="bi bi-lightbulb me-1"></i>
                              点击下方示例快速填入：
                            </small>
                            <div className="d-flex flex-wrap gap-1">
                              {promptExamples[taskForm.generationType].map((example, index) => (
                                <Button
                                  key={index}
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => insertExamplePrompt(example)}
                                  className="prompt-example-btn text-start"
                                  title={example}
                                >
                                  {example.length > 20 ? example.substring(0, 20) + '...' : example}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <Form.Text className="text-muted">
                            提示：可以在文本后添加参数，如 --ratio 16:9 --duration 10
                          </Form.Text>
                        </Form.Group>

                        {/* 图片输入 - 仅在图生视频模式下显示 */}
                        {taskForm.generationType === 'image-to-video' && (
                          <Card className="mb-3 border-success">
                            <Card.Header className="bg-success text-white">
                              <h6 className="mb-0">
                                <i className="bi bi-image me-2"></i>
                                图片输入 <span className="text-warning">*</span>
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <Form.Group className="mb-3">
                                <Form.Label>选择输入方式</Form.Label>
                                <div className="mb-3">
                                  <Form.Check
                                    type="radio"
                                    label="📁 上传本地图片文件"
                                    name="imageInputType"
                                    checked={taskForm.useImageFile}
                                    onChange={() => setTaskForm(prev => ({ ...prev, useImageFile: true }))}
                                  />
                                  <Form.Check
                                    type="radio"
                                    label="🔗 使用图片URL链接"
                                    name="imageInputType"
                                    checked={!taskForm.useImageFile}
                                    onChange={() => setTaskForm(prev => ({ ...prev, useImageFile: false }))}
                                  />
                                </div>
                                
                                {taskForm.useImageFile ? (
                                  <div>
                                    <Form.Control
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff,image/gif"
                                      onChange={handleFileChange}
                                      className="mb-2"
                                    />
                                    {taskForm.imageFile && (
                                      <div className="mt-2 p-2 bg-light rounded">
                                        <small className="text-success">
                                          <i className="bi bi-check-circle me-1"></i>
                                          已选择文件: {taskForm.imageFile.name}
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Form.Control
                                    type="url"
                                    placeholder="请输入图片URL地址，如：https://example.com/image.jpg"
                                    value={taskForm.imageUrl}
                                    onChange={(e) => setTaskForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                  />
                                )}
                                
                                <Form.Text className="text-muted">
                                  <i className="bi bi-info-circle me-1"></i>
                                  支持格式：JPEG、PNG、WebP、BMP、TIFF、GIF | 
                                  宽高比：0.4-2.5 | 尺寸：300-6000px | 大小：&lt;30MB
                                </Form.Text>
                              </Form.Group>
                            </Card.Body>
                          </Card>
                        )}

                        <Row>
                          <Col md={3}>
                            <Form.Group className="mb-3">
                              <Form.Label>分辨率</Form.Label>
                              <Form.Select 
                                value={taskForm.resolution}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, resolution: e.target.value }))}
                              >
                                <option value="480p">480p</option>
                                <option value="720p">720p</option>
                                <option value="1080p">1080p</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group className="mb-3">
                              <Form.Label>宽高比</Form.Label>
                              <Form.Select 
                                value={taskForm.ratio}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, ratio: e.target.value }))}
                              >
                                <option value="16:9">16:9</option>
                                <option value="4:3">4:3</option>
                                <option value="1:1">1:1</option>
                                <option value="3:4">3:4</option>
                                <option value="9:16">9:16</option>
                                <option value="21:9">21:9</option>
                                <option value="keep_ratio">保持原比例</option>
                                <option value="adaptive">自适应</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group className="mb-3">
                              <Form.Label>时长(秒)</Form.Label>
                              <Form.Control
                                type="number"
                                min="3"
                                max="12"
                                value={taskForm.duration}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group className="mb-3">
                              <Form.Label>帧率</Form.Label>
                              <Form.Select 
                                value={taskForm.framespersecond}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, framespersecond: parseInt(e.target.value) }))}
                              >
                                <option value="16">16 FPS</option>
                                <option value="24">24 FPS</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>种子值 (可选)</Form.Label>
                              <Form.Control
                                type="number"
                                placeholder="-1 (随机)"
                                value={taskForm.seed === -1 ? '' : taskForm.seed}
                                onChange={(e) => setTaskForm(prev => ({ 
                                  ...prev, 
                                  seed: e.target.value === '' ? -1 : parseInt(e.target.value) 
                                }))}
                              />
                              <Form.Text className="text-muted">
                                -1为随机，相同种子值会产生相似结果
                              </Form.Text>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>回调URL (可选)</Form.Label>
                              <Form.Control
                                type="url"
                                placeholder="任务状态变化时的回调地址"
                                value={taskForm.callbackUrl}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, callbackUrl: e.target.value }))}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col>
                            <Form.Group className="mb-3">
                              <Form.Check
                                type="checkbox"
                                label="添加水印"
                                checked={taskForm.watermark}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, watermark: e.target.checked }))}
                              />
                              <Form.Check
                                type="checkbox"
                                label="固定摄像头"
                                checked={taskForm.camerafixed}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, camerafixed: e.target.checked }))}
                              />
                              <Form.Check
                                type="checkbox"
                                label="返回尾帧图像"
                                checked={taskForm.returnLastFrame}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, returnLastFrame: e.target.checked }))}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="d-grid">
                          <Button 
                            variant="primary" 
                            size="lg" 
                            onClick={createVideoTask}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                创建中...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-play-circle me-2"></i>
                                创建视频生成任务
                              </>
                            )}
                          </Button>
                        </div>
                      </Form>
                    </Col>
                    
                    <Col lg={4}>
                      <Card className="bg-light">
                        <Card.Header>
                          <h6 className="mb-0">
                            <i className="bi bi-info-circle me-1"></i>
                            使用说明
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <div className="small">
                            <p><strong>模型说明：</strong></p>
                            <ul>
                              <li><strong>⭐ Seedance Pro:</strong> 推荐使用，支持文生视频和图生视频</li>
                              <li><strong>Seedance Lite:</strong> 轻量版本，支持多种生成模式</li>
                            </ul>
                            
                            <Alert variant="warning" className="py-2 px-3 mb-3">
                              <small>
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                <strong>模型权限提示：</strong><br/>
                                如果遇到"模型不存在或无权限"错误，请：<br/>
                                1. 选择 Seedance Pro 模型（推荐）<br/>
                                2. 联系管理员开通相应模型权限
                              </small>
                            </Alert>
                            
                            <p><strong>图片要求：</strong></p>
                            <ul>
                              <li>格式：JPEG、PNG、WebP、BMP、TIFF、GIF</li>
                              <li>宽高比：0.4-2.5之间</li>
                              <li>尺寸：300-6000像素</li>
                              <li>大小：小于30MB</li>
                            </ul>
                            
                            <p><strong>提示词技巧：</strong></p>
                            <ul>
                              <li>描述要具体详细</li>
                              <li>可以指定镜头、动作、风格</li>
                              <li>建议不超过500字</li>
                            </ul>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>

                {/* 任务列表标签页 */}
                <Tab eventKey="list" title={<><i className="bi bi-list-ul me-1"></i>任务列表</>}>
                  <Row className="mb-3">
                    <Col md={8}>
                      <Row>
                        <Col md={3}>
                          <Form.Select 
                            value={taskQuery.status}
                            onChange={(e) => setTaskQuery(prev => ({ ...prev, status: e.target.value }))}
                          >
                            <option value="">全部状态</option>
                            <option value="queued">排队中</option>
                            <option value="running">运行中</option>
                            <option value="succeeded">成功</option>
                            <option value="failed">失败</option>
                            <option value="cancelled">已取消</option>
                          </Form.Select>
                        </Col>
                        <Col md={4}>
                          <InputGroup>
                            <Form.Control
                              placeholder="输入任务ID搜索"
                              value={taskQuery.taskIds}
                              onChange={(e) => setTaskQuery(prev => ({ ...prev, taskIds: e.target.value }))}
                            />
                            <Button variant="outline-secondary" onClick={fetchTasks}>
                              <i className="bi bi-search"></i>
                            </Button>
                          </InputGroup>
                        </Col>
                        <Col md={2}>
                          <Form.Select 
                            value={taskQuery.pageSize}
                            onChange={(e) => setTaskQuery(prev => ({ ...prev, pageSize: parseInt(e.target.value) }))}
                          >
                            <option value="10">10条/页</option>
                            <option value="20">20条/页</option>
                            <option value="50">50条/页</option>
                          </Form.Select>
                        </Col>
                        <Col md={3}>
                          <Button variant="primary" onClick={fetchTasks} disabled={isLoading}>
                            {isLoading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-arrow-clockwise"></i>}
                            刷新
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                    <Col md={4}>
                      <Row className="text-center">
                        <Col>
                          <div className="small text-muted">总计</div>
                          <div className="h5 mb-0">{taskStats.total}</div>
                        </Col>
                        <Col>
                          <div className="small text-muted">成功</div>
                          <div className="h5 mb-0 text-success">{taskStats.succeeded}</div>
                        </Col>
                        <Col>
                          <div className="small text-muted">运行中</div>
                          <div className="h5 mb-0 text-primary">{taskStats.running}</div>
                        </Col>
                        <Col>
                          <div className="small text-muted">失败</div>
                          <div className="h5 mb-0 text-danger">{taskStats.failed}</div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  {isLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" />
                      <div className="mt-2">加载中...</div>
                    </div>
                  ) : (
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th style={{ width: '25%' }}>任务ID</th>
                          <th style={{ width: '20%' }}>模型</th>
                          <th style={{ width: '10%' }}>状态</th>
                          <th style={{ width: '15%' }}>创建时间</th>
                          <th style={{ width: '15%' }}>更新时间</th>
                          <th style={{ width: '15%' }}>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-4 text-muted">
                              暂无任务数据
                            </td>
                          </tr>
                        ) : (
                          tasks.map((task) => (
                            <tr key={task.id}>
                              <td>
                                <span className="task-id">{task.id}</span>
                              </td>
                              <td>{task.model}</td>
                              <td>{getStatusBadge(task.status)}</td>
                              <td>{formatTimestamp(task.created_at)}</td>
                              <td>{formatTimestamp(task.updated_at)}</td>
                              <td>
                                <div className="task-action-buttons d-flex flex-column gap-1">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => fetchTaskDetail(task.id)}
                                    className="d-flex align-items-center justify-content-start"
                                  >
                                    <i className="bi bi-eye me-1"></i>
                                    查看详情
                                  </Button>
                                  
                                  {((task.status === 'succeeded' && task.content?.video_url) || 
                                    (task.status === 'done' && task.video_url)) && (
                                    <Button 
                                      size="sm"
                                      className="btn-play d-flex align-items-center justify-content-start"
                                      onClick={() => {
                                        setSelectedTask(task);
                                        setShowTaskModal(true);
                                      }}
                                    >
                                      <i className="bi bi-play-circle me-1"></i>
                                      播放视频
                                    </Button>
                                  )}
                                  
                                  {(task.status === 'running' || task.status === 'generating') && (
                                    <Button 
                                      variant="outline-warning" 
                                      size="sm"
                                      onClick={() => fetchTaskDetail(task.id)}
                                      className="d-flex align-items-center justify-content-start"
                                    >
                                      <i className="bi bi-hourglass-split me-1"></i>
                                      查看进度
                                    </Button>
                                  )}
                                  
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => deleteTask(task.id)}
                                    className="d-flex align-items-center justify-content-start"
                                  >
                                    <i className="bi bi-trash me-1"></i>
                                    删除任务
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  )}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
            <Row>
              <Col md={6}>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td><strong>任务ID:</strong></td>
                      <td><code>{selectedTask.id}</code></td>
                    </tr>
                    <tr>
                      <td><strong>模型:</strong></td>
                      <td>{selectedTask.model}</td>
                    </tr>
                    <tr>
                      <td><strong>状态:</strong></td>
                      <td>{getStatusBadge(selectedTask.status)}</td>
                    </tr>
                    <tr>
                      <td><strong>分辨率:</strong></td>
                      <td>{selectedTask.resolution}</td>
                    </tr>
                    <tr>
                      <td><strong>宽高比:</strong></td>
                      <td>{selectedTask.ratio}</td>
                    </tr>
                    <tr>
                      <td><strong>时长:</strong></td>
                      <td>{selectedTask.duration}秒</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td><strong>帧率:</strong></td>
                      <td>{selectedTask.framespersecond} FPS</td>
                    </tr>
                    <tr>
                      <td><strong>种子值:</strong></td>
                      <td>{selectedTask.seed}</td>
                    </tr>
                    <tr>
                      <td><strong>创建时间:</strong></td>
                      <td>{formatTimestamp(selectedTask.created_at)}</td>
                    </tr>
                    <tr>
                      <td><strong>更新时间:</strong></td>
                      <td>{formatTimestamp(selectedTask.updated_at)}</td>
                    </tr>
                    {selectedTask.usage && (
                      <tr>
                        <td><strong>Token消耗:</strong></td>
                        <td>{selectedTask.usage.total_tokens}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>
              
              {((selectedTask.content && selectedTask.content.video_url) || selectedTask.video_url) && (
                <Col xs={12} className="mt-3">
                  <Alert variant="success">
                    <Alert.Heading>视频生成成功！</Alert.Heading>
                    
                    {/* 视频播放器 */}
                    <div className="mb-3 video-player">
                      <video 
                        controls 
                        className="w-100"
                        style={{ maxHeight: '400px' }}
                        preload="metadata"
                        poster=""
                      >
                        <source src={selectedTask.content?.video_url || selectedTask.video_url} type="video/mp4" />
                        您的浏览器不支持视频播放。请 
                        <a href={selectedTask.content?.video_url || selectedTask.video_url} target="_blank" rel="noopener noreferrer">
                          点击这里下载视频
                        </a>
                      </video>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="video-controls">
                      <Button 
                        variant="success" 
                        href={selectedTask.content?.video_url || selectedTask.video_url} 
                        target="_blank"
                        download
                      >
                        <i className="bi bi-download me-1"></i>
                        下载视频
                      </Button>
                      
                      <Button 
                        variant="outline-primary" 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTask.content?.video_url || selectedTask.video_url);
                          showAlert('info', '视频链接已复制到剪贴板');
                        }}
                      >
                        <i className="bi bi-clipboard me-1"></i>
                        复制链接
                      </Button>
                      
                      {selectedTask.content?.last_frame_url && (
                        <Button 
                          variant="outline-success" 
                          href={selectedTask.content.last_frame_url} 
                          target="_blank"
                          download
                        >
                          <i className="bi bi-image me-1"></i>
                          下载尾帧
                        </Button>
                      )}
                    </div>
                    
                    {/* 视频信息 */}
                    <div className="small text-muted">
                      <div className="row">
                        <div className="col-md-6">
                          <i className="bi bi-info-circle me-1"></i>
                          分辨率: {selectedTask.resolution} | 宽高比: {selectedTask.ratio}
                        </div>
                        <div className="col-md-6">
                          <i className="bi bi-clock me-1"></i>
                          时长: {selectedTask.duration}秒 | 帧率: {selectedTask.framespersecond} FPS
                        </div>
                      </div>
                      <div className="mt-1">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        注意：视频链接有效期为24小时，请及时下载保存
                      </div>
                    </div>
                  </Alert>
                </Col>
              )}
              
              {selectedTask.error && (
                <Col xs={12} className="mt-3">
                  <Alert variant="danger">
                    <Alert.Heading>任务失败</Alert.Heading>
                    <p><strong>错误码:</strong> {selectedTask.error.code}</p>
                    <p><strong>错误信息:</strong> {selectedTask.error.message}</p>
                  </Alert>
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedTask && (
            <Button 
              variant="outline-danger" 
              onClick={() => {
                deleteTask(selectedTask.id);
              }}
            >
              <i className="bi bi-trash me-1"></i>
              删除任务
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

export default VideoGenerator;
