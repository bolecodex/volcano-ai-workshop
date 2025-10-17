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
  InputGroup
} from 'react-bootstrap';
import { storage } from '../utils/storage';

function MotionImitation() {
  // 状态管理
  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // 表单数据
  const [formData, setFormData] = useState({
    imageUrl: '',
    videoUrl: '',
    imageFile: null,
    videoFile: null,
    useImageFile: false,  // true=本地文件, false=URL
    useVideoFile: false,   // true=本地文件, false=URL
    apiVersion: 'jimeng'  // 'classic' = 旧版, 'jimeng' = 即梦动作模仿
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
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  // 任务历史管理
  const STORAGE_KEY = 'motion_imitation_task_history';

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
    
    return filtered;
  };

  // 格式化时间
  const formatTimestamp = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('zh-CN');
  };

  // 保存任务到历史记录
  const saveTaskToHistory = (task) => {
    try {
      const history = localStorage.getItem(STORAGE_KEY);
      const tasks = history ? JSON.parse(history) : [];
      
      // 检查任务是否已存在
      const existingIndex = tasks.findIndex(t => t.task_id === task.task_id);
      if (existingIndex >= 0) {
        // 更新现有任务
        tasks[existingIndex] = { ...tasks[existingIndex], ...task, update_time: new Date().toISOString() };
      } else {
        // 添加新任务
        tasks.unshift(task);
      }
      
      // 只保留最近100个任务
      const trimmedTasks = tasks.slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedTasks));
      setTaskHistory(trimmedTasks);
      calculateStats(trimmedTasks);
    } catch (error) {
      console.error('保存任务历史失败:', error);
    }
  };

  // 更新任务状态
  const updateTaskInHistory = (taskId, updates) => {
    try {
      const history = localStorage.getItem(STORAGE_KEY);
      if (history) {
        const tasks = JSON.parse(history);
        const taskIndex = tasks.findIndex(t => t.task_id === taskId);
        if (taskIndex >= 0) {
          tasks[taskIndex] = { ...tasks[taskIndex], ...updates, update_time: new Date().toISOString() };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
          setTaskHistory([...tasks]);
          calculateStats(tasks);
        }
      }
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  };

  // 刷新单个任务状态
  const refreshTask = async (taskId) => {
    try {
      console.log('🔄 开始刷新任务状态:', taskId);
      
      const accessKeyId = storage.getAccessKeyId();
      const secretAccessKey = storage.getSecretAccessKey();
      if (!accessKeyId || !secretAccessKey) {
        showAlert('warning', '请先配置 AccessKey');
        return;
      }

      // 🔍 检查任务创建时间，避免过早查询
      const task = taskHistory.find(t => t.task_id === taskId);
      if (task && task.create_time) {
        const createTime = new Date(task.create_time);
        const now = new Date();
        const ageInSeconds = (now - createTime) / 1000;
        
        // 如果任务创建不到30秒，给出友好提示
        if (ageInSeconds < 30) {
          const waitTime = Math.ceil(30 - ageInSeconds);
          showAlert('info', `⏳ 任务刚提交 ${Math.floor(ageInSeconds)} 秒\n\n建议再等待 ${waitTime} 秒后查询，以避免"任务无效"错误。\n\n💡 说明：火山引擎API需要约30秒时间来注册新任务。`);
          return;
        }
      }

      // 检查任务使用的API版本
      const apiVersion = task?.api_version || 'classic';  // 默认使用旧版
      
      let requestData;
      let result;

      if (apiVersion === 'jimeng') {
        // 即梦动作模仿接口
        requestData = {
          task_id: taskId,
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey
        };

        console.log('📤 发送查询请求（即梦版本）:', {
          task_id: requestData.task_id,
          has_accessKey: !!requestData.accessKeyId
        });

        if (window.electronAPI && window.electronAPI.queryJimengMotionImitationTask) {
          result = await window.electronAPI.queryJimengMotionImitationTask(requestData);
          console.log('📥 收到查询结果:', result);
        } else {
          showAlert('warning', '请使用Electron桌面应用');
          return;
        }
      } else {
        // 旧版动作模仿接口
        requestData = {
          req_key: 'realman_avatar_imitator_v2v_gen_video',
          task_id: taskId,
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey
        };

        console.log('📤 发送查询请求（经典版本）:', {
          req_key: requestData.req_key,
          task_id: requestData.task_id,
          has_accessKey: !!requestData.accessKeyId
        });

        if (window.electronAPI && window.electronAPI.queryMotionImitationTask) {
          result = await window.electronAPI.queryMotionImitationTask(requestData);
          console.log('📥 收到查询结果:', result);
        } else {
          showAlert('warning', '请使用Electron桌面应用');
          return;
        }
      }

      if (result.success) {
        const status = result.data.status;
        const updates = {
          status: status,
          message: result.data.message || '',
          update_time: new Date().toISOString()
        };
        
        console.log('✅ 查询成功，任务状态:', status);
        
        if (status === 'done' && result.data.video_url) {
          updates.video_url = result.data.video_url;
          console.log('🎬 任务已完成，视频URL:', result.data.video_url);
        }
        
        updateTaskInHistory(taskId, updates);
        
        const statusText = getStatusInfo(status).text;
        showAlert('success', `✅ 任务状态已更新: ${statusText}`);
      } else {
        const errorMessage = result.error?.message || '未知错误';
        const errorCode = result.error?.code || '';
        console.error('❌ 查询失败，错误信息:', errorMessage);
        console.error('完整错误对象:', result.error);
        
        // 提供更友好的错误提示
        let userMessage = `查询任务失败: ${errorMessage}`;
        
        // 处理500 Internal Error
        if (errorMessage.includes('Internal Error') || errorMessage.includes('500')) {
          userMessage = `⚠️ 服务器内部错误 (500)\n\n可能原因：\n1. 任务正在初始化中，系统还未完全准备好\n2. API服务端暂时性故障\n3. 任务处理遇到问题\n\n💡 建议：\n• 等待1-2分钟后再次刷新\n• 如果持续失败，可能需要重新提交任务\n• 检查输入的图片和视频URL是否正常访问\n\n任务ID: ${taskId}`;
        } else if (errorMessage.includes('Input invalid')) {
          // 检查任务年龄并提供精准提示
          let ageInfo = '';
          if (task) {
            const createTime = new Date(task.create_time);
            const ageInMinutes = Math.floor((new Date() - createTime) / 1000 / 60);
            const ageInHours = Math.floor(ageInMinutes / 60);
            
            if (ageInHours >= 12) {
              ageInfo = `\n\n⏰ 任务年龄：${ageInHours} 小时（已超过12小时有效期）`;
              // 自动标记为expired
              updateTaskInHistory(taskId, {
                status: 'expired',
                message: '任务已过期（超过12小时）',
                update_time: new Date().toISOString()
              });
            } else if (ageInMinutes < 1) {
              ageInfo = '\n\n⏰ 任务刚刚创建（不到1分钟）';
            } else if (ageInMinutes < 60) {
              ageInfo = `\n\n⏰ 任务年龄：${ageInMinutes} 分钟`;
            } else {
              ageInfo = `\n\n⏰ 任务年龄：${ageInHours} 小时 ${ageInMinutes % 60} 分钟`;
            }
          }
          
          userMessage = `⚠️ 查询任务失败：任务ID无效或API尚未注册${ageInfo}\n\n📋 可能原因：\n1. 任务刚提交，API还在注册（需要30秒）\n2. 任务已过期（有效期12小时）\n3. 任务ID格式错误\n\n💡 建议：\n• 新任务：等待30秒后重试\n• 旧任务：删除后重新提交`;
        } else if (errorMessage.includes('not_found')) {
          userMessage = '⚠️ 任务未找到：任务可能已过期（>12小时）或不存在。建议删除后重新提交。';
        } else if (errorMessage.includes('expired')) {
          userMessage = '⚠️ 任务已过期：有效期为12小时，请重新提交任务。';
        } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          userMessage = '⚠️ 权限不足：请检查 AccessKey 的权限配置。';
        } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          userMessage = '⚠️ 认证失败：请检查 AccessKey 配置是否正确。';
        }
        
        showAlert('warning', userMessage);
      }
    } catch (error) {
      console.error('❌ 刷新任务状态时发生异常:', error);
      showAlert('danger', `刷新失败: ${error.message}`);
    }
  };

  // 删除任务
  const deleteTask = (taskId) => {
    if (!window.confirm('确定要删除这个任务吗？')) {
      return;
    }
    
    try {
      const history = localStorage.getItem(STORAGE_KEY);
      if (history) {
        const tasks = JSON.parse(history);
        const filteredTasks = tasks.filter(t => t.task_id !== taskId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTasks));
        setTaskHistory(filteredTasks);
        calculateStats(filteredTasks);
        showAlert('success', '任务已从历史记录中删除');
        
        // 如果删除的是当前查看的任务，关闭模态框
        if (selectedTask && selectedTask.task_id === taskId) {
          setShowTaskModal(false);
          setSelectedTask(null);
        }
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      showAlert('danger', '删除任务失败');
    }
  };

  // 查看任务详情
  const viewTaskDetails = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // 加载任务历史（组件挂载时）
  useEffect(() => {
    loadTaskHistory();
  }, []);

  // 切换标签页时清空警告提示
  useEffect(() => {
    setAlert({ show: false, type: '', message: '' });
  }, [activeTab]);


  // 文件转Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // 处理文件选择
  const handleFileChange = async (type, file) => {
    if (!file) return;

    // 验证文件大小 (限制10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showAlert('warning', `文件过大！${type === 'image' ? '图片' : '视频'}文件大小不能超过 10MB`);
      return;
    }

    // 验证文件类型
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
    
    if (type === 'image' && !validImageTypes.includes(file.type)) {
      showAlert('warning', '图片格式不支持！请上传 JPG、JPEG 或 PNG 格式的图片');
      return;
    }
    
    if (type === 'video' && !validVideoTypes.includes(file.type)) {
      showAlert('warning', '视频格式不支持！请上传 MP4 格式的视频');
      return;
    }

    if (type === 'image') {
      setFormData(prev => ({ ...prev, imageFile: file }));
    } else {
      setFormData(prev => ({ ...prev, videoFile: file }));
    }
  };

  // URL验证辅助函数
  const validateUrl = async (url, type) => {
    try {
      // 基本URL格式验证
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(url)) {
        return { valid: false, error: `${type}URL格式无效，必须以http://或https://开头` };
      }
      
      // 尝试获取URL头信息（使用HEAD请求）
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // 允许跨域
      });
      
      return { valid: true };
    } catch (error) {
      console.warn(`${type}URL验证警告:`, error.message);
      // 即使HEAD请求失败，也允许继续（因为可能是CORS问题，但URL本身可能是有效的）
      return { valid: true, warning: `无法验证${type}URL是否可访问，但将尝试提交` };
    }
  };

  // 上传文件到TOS
  const uploadFileToTOS = async (file, type) => {
    try {
      // 读取文件为ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // 获取TOS配置
      const tosConfig = storage.getTOSConfig();
      const accessKeyId = storage.getAccessKeyId();
      const secretAccessKey = storage.getSecretAccessKey();

      // 检查配置
      if (!tosConfig.bucket || !accessKeyId || !secretAccessKey) {
        throw new Error('TOS配置不完整。请在设置中配置 TOS Bucket 和访问密钥。');
      }

      // 准备上传数据
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        buffer: arrayBuffer
      };

      const config = {
        ...tosConfig,
        accessKeyId,
        secretAccessKey
      };

      // 使用IPC上传
      if (window.electronAPI && window.electronAPI.uploadToTOS) {
        const result = await window.electronAPI.uploadToTOS(fileData, config);
        if (!result.success) {
          throw new Error(result.error?.message || '上传失败');
        }
        return result.url;
      } else {
        throw new Error('上传功能仅在桌面应用中可用');
      }
    } catch (error) {
      console.error(`${type}上传失败:`, error);
      throw error;
    }
  };

  // 提交动作模仿任务
  const submitTask = async () => {
    try {
      setIsLoading(true);
      
      let imageUrl = '';
      let videoUrl = '';
      
      // 处理图片输入
      if (formData.useImageFile) {
        // 使用本地文件 - 上传到TOS
        if (!formData.imageFile) {
          showAlert('warning', '请选择图片文件');
          return;
        }
        console.log('📁 使用本地图片文件:', formData.imageFile.name);
        showAlert('info', '正在上传图片到对象存储...请稍候');
        
        imageUrl = await uploadFileToTOS(formData.imageFile, '图片');
        console.log('✅ 图片上传完成，URL:', imageUrl);
        showAlert('success', `✅ 图片上传成功！`);
      } else {
        // 使用URL
        if (!formData.imageUrl.trim()) {
          showAlert('warning', '请输入图片URL地址');
          return;
        }
        try {
          new URL(formData.imageUrl.trim());
          imageUrl = formData.imageUrl.trim();
        } catch (urlError) {
          showAlert('warning', '图片URL格式无效，请输入有效的URL地址');
          return;
        }
      }
      
      // 处理视频输入
      if (formData.useVideoFile) {
        // 使用本地文件 - 上传到TOS
        if (!formData.videoFile) {
          showAlert('warning', '请选择视频文件');
          return;
        }
        console.log('📁 使用本地视频文件:', formData.videoFile.name);
        showAlert('info', '正在上传视频到对象存储...请稍候（视频较大可能需要一些时间）');
        
        videoUrl = await uploadFileToTOS(formData.videoFile, '视频');
        console.log('✅ 视频上传完成，URL:', videoUrl);
        showAlert('success', `✅ 视频上传成功！`);
      } else {
        // 使用URL
        if (!formData.videoUrl.trim()) {
          showAlert('warning', '请输入驱动视频URL地址');
          return;
        }
        try {
          new URL(formData.videoUrl.trim());
          videoUrl = formData.videoUrl.trim();
        } catch (urlError) {
          showAlert('warning', '视频URL格式无效，请输入有效的URL地址');
          return;
        }
      }
      
      console.log('✅ 文件准备完成，开始提交任务...');

      // 构建请求体
      // 获取 AccessKey 和 SecretKey
      const accessKeyId = storage.getAccessKeyId();
      const secretAccessKey = storage.getSecretAccessKey();
      
      if (!accessKeyId || !secretAccessKey) {
        showAlert('warning', '请先在设置页面配置火山引擎 AccessKey 和 SecretKey');
        return;
      }

      // 根据选择的API版本构建不同的请求数据
      let requestData;
      let result;
      
      if (formData.apiVersion === 'jimeng') {
        // 即梦动作模仿接口（新版）
        requestData = {
          image_url: imageUrl,
          video_url: videoUrl,
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey
        };

        // 使用IPC发送请求
        if (window.electronAPI && window.electronAPI.submitJimengMotionImitationTask) {
          console.log('🖥️ 使用即梦动作模仿接口提交任务');
          result = await window.electronAPI.submitJimengMotionImitationTask(requestData);
        } else {
          console.log('⚠️ 未找到即梦动作模仿IPC接口，请使用Electron桌面应用');
          showAlert('warning', '请使用Electron桌面应用以获得完整功能');
          return;
        }
      } else {
        // 旧版动作模仿接口
        requestData = {
          req_key: 'realman_avatar_imitator_v2v_gen_video',
          image_url: imageUrl,
          driving_video_info: {
            store_type: 0,
            video_url: videoUrl
          },
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey
        };

        // 使用IPC发送请求
        if (window.electronAPI && window.electronAPI.submitMotionImitationTask) {
          console.log('🖥️ 使用经典动作模仿接口提交任务');
          result = await window.electronAPI.submitMotionImitationTask(requestData);
        } else {
          console.log('⚠️ 未找到IPC接口，请使用Electron桌面应用');
          showAlert('warning', '请使用Electron桌面应用以获得完整功能');
          return;
        }
      }
      
      if (result.success) {
        const taskId = result.data.task_id;
        
        console.log('✅ 任务提交成功，任务ID:', taskId);
        console.log('返回的完整数据:', result.data);
        
        // 保存到任务历史（初始状态为"生成中"）
        const taskData = {
          task_id: taskId,
          status: 'generating',
          create_time: new Date().toISOString(),
          image_preview: formData.useImageFile && formData.imageFile ? URL.createObjectURL(formData.imageFile) : imageUrl,
          video_preview: formData.useVideoFile ? '本地视频文件' : videoUrl,
          message: '任务已提交，正在处理...',
          api_version: formData.apiVersion  // 保存使用的API版本
        };
        saveTaskToHistory(taskData);
        
        // 显示成功提示，自动切换到任务列表
        const apiVersionText = formData.apiVersion === 'jimeng' ? '即梦动作模仿' : '经典版本';
        showAlert('success', `✅ 任务提交成功！\n\n📋 任务ID: ${taskId}\n🔧 接口: ${apiVersionText}\n\n任务正在生成中，请在"任务列表"标签页中查看进度。\n\n⏱️ 重要提示：\n• 新任务需要约1-3分钟开始处理\n• 建议等待3-5分钟后再点击"刷新状态"\n• 过早查询可能会遇到"Internal Error"，这是正常现象\n• 生成完整视频通常需要5-10分钟`);
        
        // 自动切换到任务列表标签页
        setTimeout(() => {
          setActiveTab('list');
        }, 1500);
        
        // 清空表单
        setFormData({
          imageUrl: '',
          videoUrl: '',
          imageFile: null,
          videoFile: null,
          useImageFile: false,
          useVideoFile: false,
          apiVersion: 'jimeng'  // 重置为默认版本
        });
        
        // 可选：自动切换到任务列表标签页
        // setActiveTab('list');
      } else {
        const errorMessage = result.error?.message || result.error || '未知错误';
        console.error('Task submission failed:', result);
        
        // 提供更详细的错误信息
        let userMessage = `提交任务失败: ${errorMessage}`;
        
        if (errorMessage.includes('504') || errorMessage.includes('Gateway Time-out')) {
          userMessage = '提交任务失败: 网关超时。可能原因：1) 文件过大（建议使用URL方式） 2) 网络问题 3) 服务器繁忙。请稍后重试或使用较小的文件。';
        } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          userMessage = '提交任务失败: 权限不足。请检查 AccessKey 是否有相应的权限。';
        } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          userMessage = '提交任务失败: 认证失败。请检查 AccessKeyId 和 SecretAccessKey 是否正确。';
        } else if (errorMessage.includes('非JSON响应') && !errorMessage.includes('504')) {
          userMessage = '提交任务失败: API返回了意外的响应格式。请查看控制台日志获取详细信息。';
        }
        
        showAlert('danger', userMessage);
      }
    } catch (error) {
      console.error('提交任务失败:', error);
      showAlert('danger', `提交任务失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  // 重置表单
  const resetForm = () => {
    setFormData({
      imageUrl: '',
      videoUrl: '',
      imageFile: null,
      videoFile: null,
      useImageFile: false,
      useVideoFile: false,
      apiVersion: 'jimeng'  // 默认使用即梦版本
    });
  };

  // 获取状态文本和样式
  const getStatusInfo = (status) => {
    const statusMap = {
      'in_queue': { text: '排队中', variant: 'secondary' },
      'generating': { text: '生成中', variant: 'primary' },
      'done': { text: '已完成', variant: 'success' },
      'not_found': { text: '未找到', variant: 'warning' },
      'expired': { text: '已过期', variant: 'danger' }
    };
    return statusMap[status] || { text: status, variant: 'secondary' };
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-video2 me-2"></i>
                动作模仿
              </h4>
              <small>上传一张图片和一段驱动视频，让图片中的人物模仿视频中的动作</small>
            </Card.Header>
            <Card.Body>
              {alert.show && (
                <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, type: '', message: '' })}>
                  {alert.message}
                </Alert>
              )}

              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                {/* 创建任务标签页 */}
                <Tab eventKey="create" title={<span><i className="bi bi-plus-circle me-1"></i>创建任务</span>}>

              {/* 功能说明卡片 */}
              <Row className="mb-4">
                <Col>
                  <Card className="bg-gradient-primary text-white border-0 shadow">
                    <Card.Body className="py-4">
                      <Row className="align-items-center">
                        <Col md={8}>
                          <div className="d-flex align-items-center">
                            <div className="video-entry-icon rounded-circle bg-white bg-opacity-25 p-3 me-3">
                              <i className="bi bi-person-video2 fs-3"></i>
                            </div>
                            <div>
                              <h4 className="mb-2 fw-bold">AI 动作模仿工作台</h4>
                              <p className="mb-0 opacity-90 fs-6">
                                🖼️ 上传静态图片 | 🎬 提供驱动视频 | 🎭 生成动作模仿视频
                              </p>
                            </div>
                          </div>
                        </Col>
                        <Col md={4} className="text-end">
                          <div className="d-flex flex-column align-items-end">
                            {!storage.getAccessKeyId() || !storage.getSecretAccessKey() ? (
                              <small className="text-white-50">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                请先在设置中配置 AccessKey
                              </small>
                            ) : (
                              <small className="text-white-75">
                                <i className="bi bi-check-circle me-1"></i>
                                AccessKey 已配置，可以开始创建
                              </small>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                {/* 左侧：输入配置 */}
                <Col lg={6}>
                  <Form>
                    {/* API版本选择 */}
                    <Card className="mb-4 border-info">
                      <Card.Header className="bg-info text-white">
                        <h6 className="mb-0">
                          <i className="bi bi-gear me-2"></i>
                          选择接口版本
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Form.Group>
                          <Form.Label>动作模仿接口</Form.Label>
                          <div className="d-flex gap-3">
                            <Form.Check
                              type="radio"
                              label="🔥 即梦动作模仿（推荐）"
                              name="apiVersion"
                              value="jimeng"
                              checked={formData.apiVersion === 'jimeng'}
                              onChange={(e) => setFormData(prev => ({ ...prev, apiVersion: e.target.value }))}
                            />
                            <Form.Check
                              type="radio"
                              label="📦 经典版本"
                              name="apiVersion"
                              value="classic"
                              checked={formData.apiVersion === 'classic'}
                              onChange={(e) => setFormData(prev => ({ ...prev, apiVersion: e.target.value }))}
                            />
                          </div>
                          <Form.Text className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            {formData.apiVersion === 'jimeng' 
                              ? '即梦动作模仿（生动模式）：更稳定、更逼真，支持各种画幅比例，突破竖屏限制'
                              : '经典版本：原有的动作模仿接口'
                            }
                          </Form.Text>
                        </Form.Group>
                      </Card.Body>
                    </Card>

                    {/* 图片输入 */}
                    <Card className="mb-4 border-primary">
                      <Card.Header className="bg-primary text-white">
                        <h6 className="mb-0">
                          <i className="bi bi-image me-2"></i>
                          1. 输入图片 <span className="text-warning">*</span>
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        {/* 选择输入方式 */}
                        <Form.Group className="mb-3">
                          <Form.Label>输入方式</Form.Label>
                          <div className="d-flex gap-3">
                            <Form.Check
                              type="radio"
                              label="🔗 URL地址"
                              name="imageInputType"
                              checked={!formData.useImageFile}
                              onChange={() => setFormData(prev => ({ ...prev, useImageFile: false }))}
                            />
                            <Form.Check
                              type="radio"
                              label="📁 本地文件"
                              name="imageInputType"
                              checked={formData.useImageFile}
                              onChange={() => setFormData(prev => ({ ...prev, useImageFile: true }))}
                            />
                          </div>
                        </Form.Group>

                        {/* URL输入 */}
                        {!formData.useImageFile && (
                          <Form.Group className="mb-3">
                            <Form.Label>图片URL地址</Form.Label>
                            <Form.Control
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              value={formData.imageUrl}
                              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                              required
                            />
                            <Form.Text className="text-muted">
                              <i className="bi bi-info-circle me-1"></i>
                              请输入可访问的图片URL地址（支持 JPEG、PNG 格式）
                            </Form.Text>
                          </Form.Group>
                        )}

                        {/* 文件上传 */}
                        {formData.useImageFile && (
                          <Form.Group className="mb-3">
                            <Form.Label>选择图片文件</Form.Label>
                            <Form.Control
                              type="file"
                              accept="image/jpeg,image/jpg,image/png"
                              onChange={(e) => handleFileChange('image', e.target.files[0])}
                            />
                            <Form.Text className="text-muted">
                              <i className="bi bi-info-circle me-1"></i>
                              支持 JPG、PNG 格式，文件大小不超过 10MB
                            </Form.Text>
                            {formData.imageFile && (
                              <Alert variant="success" className="mt-2 small mb-0">
                                <i className="bi bi-check-circle me-1"></i>
                                已选择: {formData.imageFile.name} ({(formData.imageFile.size / 1024).toFixed(2)} KB)
                              </Alert>
                            )}
                          </Form.Group>
                        )}
                      </Card.Body>
                    </Card>

                    {/* 驱动视频输入 */}
                    <Card className="mb-4 border-success">
                      <Card.Header className="bg-success text-white">
                        <h6 className="mb-0">
                          <i className="bi bi-camera-video me-2"></i>
                          2. 输入驱动视频 <span className="text-warning">*</span>
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        {/* 选择输入方式 */}
                        <Form.Group className="mb-3">
                          <Form.Label>输入方式</Form.Label>
                          <div className="d-flex gap-3">
                            <Form.Check
                              type="radio"
                              label="🔗 URL地址"
                              name="videoInputType"
                              checked={!formData.useVideoFile}
                              onChange={() => setFormData(prev => ({ ...prev, useVideoFile: false }))}
                            />
                            <Form.Check
                              type="radio"
                              label="📁 本地文件"
                              name="videoInputType"
                              checked={formData.useVideoFile}
                              onChange={() => setFormData(prev => ({ ...prev, useVideoFile: true }))}
                            />
                          </div>
                        </Form.Group>

                        {/* URL输入 */}
                        {!formData.useVideoFile && (
                          <Form.Group className="mb-3">
                            <Form.Label>视频URL地址</Form.Label>
                            <Form.Control
                              type="url"
                              placeholder="https://example.com/video.mp4"
                              value={formData.videoUrl}
                              onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                              required
                            />
                            <Form.Text className="text-muted">
                              <i className="bi bi-info-circle me-1"></i>
                              请输入可访问的视频URL地址（支持 MP4 格式）
                            </Form.Text>
                          </Form.Group>
                        )}

                        {/* 文件上传 */}
                        {formData.useVideoFile && (
                          <Form.Group className="mb-3">
                            <Form.Label>选择视频文件</Form.Label>
                            <Form.Control
                              type="file"
                              accept="video/mp4,video/mpeg,video/quicktime"
                              onChange={(e) => handleFileChange('video', e.target.files[0])}
                            />
                            <Form.Text className="text-muted">
                              <i className="bi bi-info-circle me-1"></i>
                              支持 MP4 格式，文件大小不超过 10MB
                            </Form.Text>
                            {formData.videoFile && (
                              <Alert variant="success" className="mt-2 small mb-0">
                                <i className="bi bi-check-circle me-1"></i>
                                已选择: {formData.videoFile.name} ({(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB)
                              </Alert>
                            )}
                          </Form.Group>
                        )}
                      </Card.Body>
                    </Card>

                    {/* 提交按钮 */}
                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={submitTask}
                        disabled={isLoading || !storage.getAccessKeyId() || !storage.getSecretAccessKey()}
                      >
                        {isLoading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            提交中...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-play-circle me-2"></i>
                            开始生成动作模仿视频
                          </>
                        )}
                      </Button>
                      
                      {(!storage.getAccessKeyId() || !storage.getSecretAccessKey()) && (
                        <Alert variant="warning" className="mb-0 small">
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>
                          <strong>无法提交任务：</strong>需要先配置 AccessKey 和 SecretAccessKey。
                          <div className="mt-2">
                            <strong>配置步骤：</strong>
                            <ol className="mb-0 mt-1 ps-3">
                              <li>点击左侧菜单的 <i className="bi bi-gear"></i> <strong>Settings</strong></li>
                              <li>在"API 凭证配置"中填写 <strong>AccessKeyId</strong> 和 <strong>SecretAccessKey</strong></li>
                              <li>点击"保存 API 凭证"</li>
                              <li>返回本页面即可提交任务</li>
                            </ol>
                          </div>
                        </Alert>
                      )}
                      
                      <Button 
                        variant="outline-secondary" 
                        onClick={resetForm}
                        disabled={isLoading}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        重置表单
                      </Button>
                    </div>
                  </Form>
                </Col>

                {/* 右侧：说明和状态 */}
                <Col lg={6}>
                  {/* 使用说明 */}
                  <Card className="mb-4 bg-light">
                    <Card.Header>
                      <h6 className="mb-0">
                        <i className="bi bi-info-circle me-1"></i>
                        使用说明
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="small">
                        <p><strong>功能介绍：</strong></p>
                        <p>动作模仿功能可以让静态图片中的人物"动"起来，模仿驱动视频中的动作和表情。适用于制作动态头像、虚拟形象视频等场景。</p>
                        
                        <Alert variant="success" className="py-2 px-3 mb-3">
                          <small>
                            <i className="bi bi-star-fill me-1"></i>
                            <strong>🔥 即梦动作模仿（推荐）</strong><br/>
                            • 更稳定、更逼真的动作还原效果<br/>
                            • 突破竖屏限制，支持各种画幅和比例<br/>
                            • 支持多种风格角色（真人、二次元等）<br/>
                            • 具备一定的运镜还原能力<br/>
                            • 主体及背景特征与输入图片保持一致
                          </small>
                        </Alert>
                        
                        <Alert variant="danger" className="py-2 px-3 mb-3">
                          <small>
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                            <strong>⚠️ 重要：API仅支持URL方式，不支持本地文件上传！</strong><br/>
                            <strong>⚠️ 如果任务一直"处理中"，99%是URL无效导致的！</strong><br/>
                            <br/>
                            <strong>URL必须满足以下条件：</strong><br/>
                            ✅ 可公网访问（不能是局域网或需要登录）<br/>
                            ✅ 无防盗链限制（允许跨域访问）<br/>
                            ✅ 使用HTTPS协议（推荐）<br/>
                            ✅ 文件格式正确（图片: JPG/PNG, 视频: MP4）<br/>
                            <br/>
                            <strong>推荐使用：</strong>火山引擎TOS、阿里云OSS、腾讯云COS等对象存储服务
                          </small>
                        </Alert>
                        
                        <p><strong>使用步骤：</strong></p>
                        <ol>
                          <li>选择输入方式：URL地址 或 本地文件上传</li>
                          <li><strong>如使用URL：</strong>填入可访问的图片和视频URL地址</li>
                          <li><strong>如使用本地文件：</strong>选择本地图片和视频文件
                            <ul>
                              <li>⚠️ 需要先在设置页面配置 TOS 对象存储</li>
                              <li>文件会自动上传到您的 TOS Bucket</li>
                              <li>上传完成后自动获取URL并提交任务</li>
                            </ul>
                          </li>
                          <li>点击"开始生成动作模仿视频"按钮</li>
                          <li>等待AI处理完成（通常需要1-5分钟）</li>
                          <li>在任务列表中查看进度和下载结果</li>
                        </ol>
                        
                        <p><strong>图片要求：</strong></p>
                        <ul>
                          <li>格式：JPEG、PNG</li>
                          <li>大小：建议不超过 10MB</li>
                          <li>内容：包含清晰的人脸</li>
                          <li>URL方式：需公网可访问，无防盗链</li>
                          <li>本地上传：自动上传到TOS后获取URL</li>
                        </ul>
                        
                        <p><strong>驱动视频要求：</strong></p>
                        <ul>
                          <li>格式：MP4</li>
                          <li>大小：建议不超过 50MB</li>
                          <li>内容：包含要模仿的动作和表情</li>
                          <li>URL方式：需公网可访问，无防盗链</li>
                          <li>本地上传：自动上传到TOS后获取URL</li>
                        </ul>
                        
                        <Alert variant="info" className="py-2 px-3 mt-3">
                          <small>
                            <i className="bi bi-info-circle me-1"></i>
                            <strong>认证配置说明：</strong><br/>
                            该功能使用火山引擎视觉服务API的签名认证（Signature V4）。<br/>
                            需要配置 <strong>AccessKeyId</strong> 和 <strong>SecretAccessKey</strong>（非API Key）。<br/>
                            请前往 <a href="https://console.volcengine.com/iam/keymanage" target="_blank" rel="noopener noreferrer">火山引擎IAM</a> 创建访问密钥，并在设置页面配置。
                          </small>
                        </Alert>
                        
                        <Alert variant="success" className="py-2 px-3 mt-3">
                          <small>
                            <i className="bi bi-lightbulb me-1"></i>
                            <strong>推荐服务：</strong><br/>
                            <ul className="mb-0 mt-2">
                              <li><strong>图片：</strong>imgur、火山引擎TOS、七牛云、又拍云</li>
                              <li><strong>视频：</strong>火山引擎TOS、阿里云OSS、腾讯云COS、AWS S3</li>
                              <li>⏱️ 生成时间：1-5分钟（取决于视频长度）</li>
                              <li>⏰ 任务有效期：12小时（过期后无法查询状态）</li>
                              <li>🔗 结果视频链接有效期：1小时，请及时下载</li>
                            </ul>
                          </small>
                        </Alert>
                        
                        <Alert variant="warning" className="py-2 px-3 mt-3">
                          <small>
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                            <strong>⚠️ 重要提示：查询任务状态的时机</strong><br/>
                            <ul className="mb-0 mt-2">
                              <li><strong>提交任务后：</strong>需要等待10-30秒，API才能完成任务注册</li>
                              <li><strong>立即查询：</strong>可能会收到"任务ID无效"错误，这是正常现象</li>
                              <li><strong>建议做法：</strong>提交任务后等待30秒，再到"任务列表"中点击"刷新状态"</li>
                              <li><strong>如果一直失败：</strong>可能是任务已过期（超过12小时），请删除后重新提交</li>
                            </ul>
                          </small>
                        </Alert>
                      </div>
                    </Card.Body>
                  </Card>

                </Col>
              </Row>
                </Tab>

                {/* 任务列表标签页 */}
                <Tab eventKey="list" title={<span><i className="bi bi-list-ul me-1"></i>任务列表</span>}>
                  <Row className="mb-3">
                    <Col md={8}>
                      <Row>
                        {/* 状态筛选 */}
                        <Col md={3}>
                          <Form.Select 
                            value={taskFilter.status}
                            onChange={(e) => setTaskFilter(prev => ({ ...prev, status: e.target.value }))}
                          >
                            <option value="">全部状态</option>
                            <option value="in_queue">排队中</option>
                            <option value="generating">生成中</option>
                            <option value="running">运行中</option>
                            <option value="done">已完成</option>
                            <option value="failed">失败</option>
                          </Form.Select>
                        </Col>
                        
                        {/* 任务ID搜索 */}
                        <Col md={5}>
                          <InputGroup>
                            <Form.Control
                              placeholder="输入任务ID搜索"
                              value={taskFilter.taskId}
                              onChange={(e) => setTaskFilter(prev => ({ ...prev, taskId: e.target.value }))}
                            />
                            <Button 
                              variant="outline-secondary" 
                              onClick={() => setTaskFilter(prev => ({ ...prev, taskId: '' }))}
                            >
                              <i className="bi bi-x"></i>
                            </Button>
                          </InputGroup>
                        </Col>
                        
                        {/* 每页数量 */}
                        <Col md={2}>
                          <Form.Select 
                            value={taskFilter.pageSize}
                            onChange={(e) => setTaskFilter(prev => ({ ...prev, pageSize: parseInt(e.target.value) }))}
                          >
                            <option value="10">10条/页</option>
                            <option value="20">20条/页</option>
                            <option value="50">50条/页</option>
                          </Form.Select>
                        </Col>
                        
                        {/* 刷新按钮 */}
                        <Col md={2}>
                          <Button variant="primary" onClick={loadTaskHistory}>
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

                  {taskHistory.length === 0 ? (
                    <Alert variant="info">
                      <i className="bi bi-info-circle me-2"></i>
                      暂无任务记录。创建第一个动作模仿任务吧！
                    </Alert>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th style={{ width: '20%' }}>任务ID</th>
                              <th style={{ width: '8%' }}>接口</th>
                              <th style={{ width: '8%' }}>状态</th>
                              <th style={{ width: '13%' }}>创建时间</th>
                              <th style={{ width: '13%' }}>更新时间</th>
                              <th style={{ width: '10%' }}>预览</th>
                              <th style={{ width: '28%' }}>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredTasks().length === 0 ? (
                              <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">
                                  {taskFilter.status || taskFilter.taskId ? '没有找到匹配的任务' : '暂无任务数据'}
                                </td>
                              </tr>
                            ) : (
                              getFilteredTasks().slice(0, taskFilter.pageSize).map((task) => {
                                const statusInfo = getStatusInfo(task.status);
                                return (
                                  <tr key={task.task_id}>
                                    <td>
                                      <code className="task-id">{task.task_id}</code>
                                    </td>
                                    <td>
                                      <Badge bg={task.api_version === 'jimeng' ? 'info' : 'secondary'}>
                                        {task.api_version === 'jimeng' ? '即梦' : '经典'}
                                      </Badge>
                                    </td>
                                    <td>
                                      <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>
                                    </td>
                                    <td>
                                      <small>{formatTimestamp(task.create_time)}</small>
                                    </td>
                                    <td>
                                      <small>{formatTimestamp(task.update_time)}</small>
                                    </td>
                                    <td>
                                      {task.image_preview && (
                                        <Image 
                                          src={task.image_preview} 
                                          alt="预览" 
                                          thumbnail
                                          style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }} 
                                          onClick={() => viewTaskDetails(task)}
                                        />
                                      )}
                                    </td>
                                    <td>
                                      <div className="d-flex flex-column gap-1">
                                        <Button 
                                          size="sm" 
                                          variant="outline-primary"
                                          onClick={() => viewTaskDetails(task)}
                                          className="d-flex align-items-center justify-content-start"
                                        >
                                          <i className="bi bi-eye me-1"></i>
                                          查看详情
                                        </Button>
                                        
                                        {task.status === 'done' && task.video_url && (
                                          <>
                                            <Button 
                                              size="sm" 
                                              className="btn-play d-flex align-items-center justify-content-start"
                                              onClick={() => viewTaskDetails(task)}
                                            >
                                              <i className="bi bi-play-circle me-1"></i>
                                              播放视频
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              variant="outline-success"
                                              href={task.video_url}
                                              target="_blank"
                                              download
                                              className="d-flex align-items-center justify-content-start"
                                            >
                                              <i className="bi bi-download me-1"></i>
                                              下载视频
                                            </Button>
                                          </>
                                        )}
                                        
                                        {(task.status === 'generating' || task.status === 'in_queue') && (
                                          <Button 
                                            size="sm" 
                                            variant="outline-warning"
                                            onClick={() => refreshTask(task.task_id)}
                                            className="d-flex align-items-center justify-content-start"
                                          >
                                            <i className="bi bi-arrow-clockwise me-1"></i>
                                            刷新状态
                                          </Button>
                                        )}
                                        
                                        <Button 
                                          size="sm" 
                                          variant="outline-danger"
                                          onClick={() => deleteTask(task.task_id)}
                                          className="d-flex align-items-center justify-content-start"
                                        >
                                          <i className="bi bi-trash me-1"></i>
                                          删除任务
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </Table>
                      </div>
                      
                      {getFilteredTasks().length > taskFilter.pageSize && (
                        <Alert variant="info" className="small">
                          <i className="bi bi-info-circle me-1"></i>
                          显示 {Math.min(taskFilter.pageSize, getFilteredTasks().length)} / {getFilteredTasks().length} 个任务
                        </Alert>
                      )}
                    </>
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
              {/* 左列：基本信息 */}
              <Col md={6}>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td><strong>任务ID:</strong></td>
                      <td><code>{selectedTask.task_id}</code></td>
                    </tr>
                    <tr>
                      <td><strong>接口版本:</strong></td>
                      <td>
                        <Badge bg={selectedTask.api_version === 'jimeng' ? 'info' : 'secondary'}>
                          {selectedTask.api_version === 'jimeng' ? '即梦动作模仿' : '经典版本'}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>状态:</strong></td>
                      <td>
                        <Badge bg={getStatusInfo(selectedTask.status).variant}>
                          {getStatusInfo(selectedTask.status).text}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>创建时间:</strong></td>
                      <td>{formatTimestamp(selectedTask.create_time)}</td>
                    </tr>
                    <tr>
                      <td><strong>更新时间:</strong></td>
                      <td>{formatTimestamp(selectedTask.update_time)}</td>
                    </tr>
                    {selectedTask.message && (
                      <tr>
                        <td><strong>消息:</strong></td>
                        <td><small className="text-muted">{selectedTask.message}</small></td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>
              
              {/* 右列：输入信息 */}
              <Col md={6}>
                {selectedTask.image_preview && (
                  <>
                    <h6 className="mb-2">输入图片</h6>
                    <Image 
                      src={selectedTask.image_preview} 
                      alt="输入图片" 
                      fluid
                      rounded 
                      className="mb-3"
                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                    />
                  </>
                )}
              </Col>
              
              {/* 完整宽度：生成结果 */}
              {selectedTask.status === 'done' && selectedTask.video_url && (
                <Col xs={12} className="mt-3">
                  <Alert variant="success">
                    <Alert.Heading>动作模仿视频生成成功！</Alert.Heading>
                    <p className="mb-0">您可以在下方预览或下载生成的视频</p>
                  </Alert>
                  
                  <video 
                    controls 
                    autoPlay
                    className="w-100"
                    style={{ maxHeight: '500px', borderRadius: '8px' }}
                  >
                    <source src={selectedTask.video_url} type="video/mp4" />
                    您的浏览器不支持视频播放。
                  </video>
                  
                  <Alert variant="warning" className="mt-3 small">
                    <i className="bi bi-clock me-1"></i>
                    视频链接有效期为1小时，请及时下载保存
                  </Alert>
                </Col>
              )}
              
              {/* 运行中状态 */}
              {(selectedTask.status === 'generating' || selectedTask.status === 'in_queue') && (
                <Col xs={12} className="mt-3">
                  <Alert variant="info">
                    <Alert.Heading>
                      <Spinner animation="border" size="sm" className="me-2" />
                      任务处理中...
                    </Alert.Heading>
                    <p className="mb-2">
                      您的任务正在队列中处理，请稍候。通常需要1-5分钟。
                    </p>
                    <Alert variant="warning" className="small mb-2">
                      <strong>⏱️ 注意事项：</strong><br/>
                      1. 如果任务刚提交（少于30秒），请等待片刻后再刷新<br/>
                      2. 如果一直显示"任务ID无效"错误，可能是任务已过期，请删除后重新提交<br/>
                      3. 任务有效期为12小时，超时后无法查询
                    </Alert>
                    <Button 
                      variant="info" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        refreshTask(selectedTask.task_id);
                        showAlert('info', '正在刷新任务状态...');
                      }}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      刷新状态
                    </Button>
                  </Alert>
                </Col>
              )}
              
              {/* 失败状态 */}
              {(selectedTask.status === 'failed' || selectedTask.status === 'not_found' || selectedTask.status === 'expired') && (
                <Col xs={12} className="mt-3">
                  <Alert variant="danger">
                    <Alert.Heading>任务失败</Alert.Heading>
                    <p className="mb-0">
                      {selectedTask.message || '任务处理失败，请检查输入参数或重试。'}
                    </p>
                  </Alert>
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
            关闭
          </Button>
          {selectedTask && selectedTask.video_url && (
            <>
              <Button 
                variant="success" 
                href={selectedTask.video_url} 
                target="_blank"
                download
              >
                <i className="bi bi-download me-1"></i>
                下载视频
              </Button>
              <Button 
                variant="outline-primary" 
                onClick={() => {
                  navigator.clipboard.writeText(selectedTask.video_url);
                  showAlert('info', '视频链接已复制到剪贴板');
                }}
              >
                <i className="bi bi-clipboard me-1"></i>
                复制链接
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default MotionImitation;

