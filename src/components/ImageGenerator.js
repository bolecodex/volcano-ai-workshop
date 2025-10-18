import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert, Badge, Spinner, Image, Modal } from 'react-bootstrap';
import { storage } from '../utils/storage';
import { webAPI } from '../utils/apiClient';

function ImageGenerator() {
  const [formData, setFormData] = useState({
    model: 'doubao-seedream-4-0-250828',
    prompt: '',
    size: '2K',
    sequential_image_generation: 'disabled',
    stream: false,
    response_format: 'url',
    watermark: true,
    guidance_scale: 2.5,
    seed: -1,
    max_images: 15,
    // 图生图相关
    useImage: false,
    imageFiles: [],
    imageUrls: '',
    useImageUrl: false
  });

  const [apiKey, setApiKey] = useState('07ab6074-ed6e-43e2-8f80-bf6a70fc8b98');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [proxyStatus, setProxyStatus] = useState('unknown'); // 'working', 'failed', 'unknown'
  
  // 即梦4.0异步任务状态
  const [jimeng40TaskId, setJimeng40TaskId] = useState(null);
  const [jimeng40TaskStatus, setJimeng40TaskStatus] = useState(''); // 'in_queue', 'generating', 'done'
  const [jimeng40PollingInterval, setJimeng40PollingInterval] = useState(null);

  // 即梦3.1异步任务状态
  const [jimeng31TaskId, setJimeng31TaskId] = useState(null);
  const [jimeng31TaskStatus, setJimeng31TaskStatus] = useState(''); // 'in_queue', 'generating', 'done'
  const [jimeng31PollingInterval, setJimeng31PollingInterval] = useState(null);

  // 即梦图生图3.0异步任务状态
  const [jimengI2I30TaskId, setJimengI2I30TaskId] = useState(null);
  const [jimengI2I30TaskStatus, setJimengI2I30TaskStatus] = useState(''); // 'in_queue', 'generating', 'done'
  const [jimengI2I30PollingInterval, setJimengI2I30PollingInterval] = useState(null);

  const models = [
    { value: 'doubao-seedream-4-0-250828', label: 'Seedream 4.0 (推荐)', description: '支持文生图、图生图、组图生成' },
    { value: 'jimeng-t2i-v40', label: '即梦AI 4.0 ⭐', description: '文生图、图生图、多图融合，支持4K，组图生成' },
    { value: 'jimeng-i2i-v30', label: '即梦图生图 3.0 智能参考 🖼️', description: '图生图编辑专用，精准执行编辑指令，保持图像完整性' },
    { value: 'jimeng-t2i-v31', label: '即梦文生图 3.1 🎨', description: '画面美感升级，风格精准多样，细节丰富' }
  ];

  const sizeOptions = [
    { value: '1K', label: '1K 分辨率' },
    { value: '2K', label: '2K 分辨率 (推荐)' },
    { value: '4K', label: '4K 分辨率' },
    { value: '2048x2048', label: '2048×2048 (1:1)' },
    { value: '2304x1728', label: '2304×1728 (4:3)' },
    { value: '1728x2304', label: '1728×2304 (3:4)' },
    { value: '2560x1440', label: '2560×1440 (16:9)' },
    { value: '1440x2560', label: '1440×2560 (9:16)' }
  ];

  // Load API key from storage on component mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const savedApiKey = await storage.getApiKey();
        if (savedApiKey) {
          setApiKey(savedApiKey);
        } else {
          // Set the provided API key and save it
          const providedApiKey = '07ab6074-ed6e-43e2-8f80-bf6a70fc8b98';
          setApiKey(providedApiKey);
          await storage.setApiKey(providedApiKey);
        }
      } catch (error) {
        console.error('加载 API Key 失败:', error);
      }
    };

    loadApiKey();

    // Check if running in Electron and set proxy status
    if (window.electronAPI) {
      setProxyStatus('working'); // IPC communication
    } else {
      setProxyStatus('failed'); // Browser mode
    }
  }, []);

  // Save API key when it changes
  useEffect(() => {
    const saveApiKey = async () => {
      if (apiKey && apiKey.trim()) {
        try {
          await storage.setApiKey(apiKey);
        } catch (error) {
          console.error('保存 API Key 失败:', error);
        }
      }
    };
    saveApiKey();
  }, [apiKey]);

  // 清理即梦4.0轮询interval
  useEffect(() => {
    return () => {
      if (jimeng40PollingInterval) {
        clearInterval(jimeng40PollingInterval);
      }
    };
  }, [jimeng40PollingInterval]);

  // 清理即梦3.1轮询interval
  useEffect(() => {
    return () => {
      if (jimeng31PollingInterval) {
        clearInterval(jimeng31PollingInterval);
      }
    };
  }, [jimeng31PollingInterval]);

  // 清理即梦图生图3.0轮询interval
  useEffect(() => {
    return () => {
      if (jimengI2I30PollingInterval) {
        clearInterval(jimengI2I30PollingInterval);
      }
    };
  }, [jimengI2I30PollingInterval]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // 如果切换到即梦图生图3.0模型,自动启用图生图功能
      if (field === 'model' && value === 'jimeng-i2i-v30') {
        newData.useImage = true;
      }
      
      return newData;
    });
  };

  // 处理图片文件上传
  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      setError('最多只能上传10张图片');
      return;
    }
    
    // 检查文件类型和大小
    for (const file of files) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('仅支持 JPEG 和 PNG 格式的图片');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`图片 ${file.name} 超过10MB限制`);
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, imageFiles: files }));
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

  // 即梦3.1异步任务生成函数
  const generateJimeng31Image = async () => {
    // 获取AccessKey
    const accessKeyId = storage.getAccessKeyId();
    const secretAccessKey = storage.getSecretAccessKey();

    if (!accessKeyId || !secretAccessKey) {
      setError('即梦3.1需要配置AccessKey。请前往设置页面配置访问密钥（AccessKeyId 和 SecretAccessKey）');
      return;
    }

    if (!formData.prompt.trim()) {
      setError('请输入提示词');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setJimeng31TaskStatus('submitting');

    try {
      // 准备请求数据
      const requestData = {
        accessKeyId,
        secretAccessKey,
        prompt: formData.prompt
      };

      // 处理尺寸参数
      if (formData.size.includes('x')) {
        const [w, h] = formData.size.split('x').map(n => parseInt(n));
        requestData.width = w;
        requestData.height = h;
      } else {
        // 默认尺寸设置
        if (formData.size === '1K') {
          requestData.width = 1328;
          requestData.height = 1328;
        } else if (formData.size === '2K') {
          requestData.width = 2048;
          requestData.height = 2048;
        }
      }

      // 添加seed参数
      if (formData.seed !== -1) {
        requestData.seed = formData.seed;
      }

      // 提交任务
      console.log('提交即梦3.1任务...');
      const submitResult = await window.electronAPI.submitJimeng31Task(requestData);

      if (!submitResult.success) {
        throw new Error(submitResult.error?.message || '提交任务失败');
      }

      const taskId = submitResult.data.task_id;
      console.log('任务已提交，Task ID:', taskId);
      
      setJimeng31TaskId(taskId);
      setJimeng31TaskStatus('in_queue');
      setError(`任务已提交（ID: ${taskId}），正在处理中...`);

      // 开始轮询查询任务状态
      const pollInterval = setInterval(async () => {
        try {
          const queryResult = await window.electronAPI.queryJimeng31Task({
            accessKeyId,
            secretAccessKey,
            task_id: taskId,
            req_json: JSON.stringify({ return_url: true })
          });

          if (!queryResult.success) {
            console.error('查询任务失败:', queryResult.error);
            return;
          }

          const status = queryResult.data.status;
          console.log('任务状态:', status);
          
          setJimeng31TaskStatus(status);

          if (status === 'done') {
            clearInterval(pollInterval);
            setJimeng31PollingInterval(null);
            
            const images = queryResult.data.image_urls || [];
            if (images.length > 0) {
              setResults(images.map(url => ({ url })));
              setError('');
              setLoading(false);
            } else {
              setError('任务完成，但未生成图片');
              setLoading(false);
            }
          } else if (status === 'generating') {
            setError(`任务处理中...（ID: ${taskId}）`);
          } else if (status === 'not_found' || status === 'expired') {
            clearInterval(pollInterval);
            setJimeng31PollingInterval(null);
            setError(`任务${status === 'not_found' ? '未找到' : '已过期'}`);
            setLoading(false);
          }
        } catch (pollError) {
          console.error('轮询查询错误:', pollError);
        }
      }, 3000); // 每3秒查询一次

      setJimeng31PollingInterval(pollInterval);

      // 设置30秒超时
      setTimeout(() => {
        if (jimeng31TaskStatus !== 'done') {
          clearInterval(pollInterval);
          setJimeng31PollingInterval(null);
          setError('任务超时，请稍后在控制台手动查询任务ID: ' + taskId);
          setLoading(false);
        }
      }, 30000);

    } catch (err) {
      console.error('即梦3.1生成失败:', err);
      
      let errorMessage = err.message;
      
      // 处理常见错误
      if (err.message.includes('Access Denied')) {
        errorMessage = `
⚠️ 权限不足：即梦文生图 3.1需要特殊权限

可能的原因：
1. 即梦3.1服务未开通
2. 当前AccessKey没有即梦3.1的访问权限
3. AccessKey配置不正确

解决方案：
• 访问火山引擎控制台申请即梦服务权限
• 确认AccessKey具有"视觉智能-即梦AI"权限
• 或者暂时使用 Seedream 4.0 模型（不需要AccessKey）

控制台地址：https://console.volcengine.com/
        `;
      }
      
      setError(`生成失败: ${errorMessage}`);
      setLoading(false);
    }
  };

  // 即梦4.0异步任务生成函数
  const generateJimeng40Image = async () => {
    // 获取AccessKey
    const accessKeyId = storage.getAccessKeyId();
    const secretAccessKey = storage.getSecretAccessKey();

    if (!accessKeyId || !secretAccessKey) {
      setError('即梦4.0需要配置AccessKey。请前往设置页面配置访问密钥（AccessKeyId 和 SecretAccessKey）');
      return;
    }

    if (!formData.prompt.trim()) {
      setError('请输入提示词');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setJimeng40TaskStatus('submitting');

    try {
      // 准备请求数据
      const requestData = {
        accessKeyId,
        secretAccessKey,
        prompt: formData.prompt
      };

      // 处理图片URL输入
      if (formData.useImage && formData.useImageUrl && formData.imageUrls.trim()) {
        const urls = formData.imageUrls.split('\n').map(url => url.trim()).filter(url => url);
        if (urls.length > 0) {
          requestData.image_urls = urls;
        }
      }

      // 处理尺寸参数
      if (formData.size === '1K') {
        requestData.size = 1024 * 1024;
      } else if (formData.size === '2K') {
        requestData.size = 2048 * 2048;
      } else if (formData.size === '4K') {
        requestData.size = 4096 * 4096;
      } else if (formData.size.includes('x')) {
        const [w, h] = formData.size.split('x').map(n => parseInt(n));
        requestData.width = w;
        requestData.height = h;
      }

      // 提交任务
      console.log('提交即梦4.0任务...');
      const submitResult = await window.electronAPI.submitJimeng40Task(requestData);

      if (!submitResult.success) {
        throw new Error(submitResult.error?.message || '提交任务失败');
      }

      const taskId = submitResult.data.task_id;
      console.log('任务已提交，Task ID:', taskId);
      
      setJimeng40TaskId(taskId);
      setJimeng40TaskStatus('in_queue');
      setError(`任务已提交（ID: ${taskId}），正在处理中...`);

      // 开始轮询查询任务状态
      const pollInterval = setInterval(async () => {
        try {
          const queryResult = await window.electronAPI.queryJimeng40Task({
            accessKeyId,
            secretAccessKey,
            task_id: taskId,
            req_json: JSON.stringify({ return_url: true })
          });

          if (!queryResult.success) {
            console.error('查询任务失败:', queryResult.error);
            return;
          }

          const status = queryResult.data.status;
          console.log('任务状态:', status);
          
          setJimeng40TaskStatus(status);

          if (status === 'done') {
            clearInterval(pollInterval);
            setJimeng40PollingInterval(null);
            
            const images = queryResult.data.image_urls || [];
            if (images.length > 0) {
              setResults(images.map(url => ({ url })));
              setError('');
              setLoading(false);
            } else {
              setError('任务完成，但未生成图片');
              setLoading(false);
            }
          } else if (status === 'generating') {
            setError(`任务处理中...（ID: ${taskId}）`);
          } else if (status === 'not_found' || status === 'expired') {
            clearInterval(pollInterval);
            setJimeng40PollingInterval(null);
            setError(`任务${status === 'not_found' ? '未找到' : '已过期'}`);
            setLoading(false);
          }
        } catch (pollError) {
          console.error('轮询查询错误:', pollError);
        }
      }, 3000); // 每3秒查询一次

      setJimeng40PollingInterval(pollInterval);

      // 设置30秒超时
      setTimeout(() => {
        if (jimeng40TaskStatus !== 'done') {
          clearInterval(pollInterval);
          setJimeng40PollingInterval(null);
          setError('任务超时，请稍后在控制台手动查询任务ID: ' + taskId);
          setLoading(false);
        }
      }, 30000);

    } catch (err) {
      console.error('即梦4.0生成失败:', err);
      
      let errorMessage = err.message;
      
      // 处理常见错误
      if (err.message.includes('Access Denied')) {
        errorMessage = `
⚠️ 权限不足：即梦AI 4.0需要特殊权限

可能的原因：
1. 即梦4.0服务未开通（该服务处于公测阶段）
2. 当前AccessKey没有即梦4.0的访问权限
3. AccessKey配置不正确

解决方案：
• 访问火山引擎控制台申请即梦4.0公测权限
• 确认AccessKey具有"视觉智能-即梦AI"权限
• 或者暂时使用 Seedream 4.0 模型（不需要AccessKey）

控制台地址：https://console.volcengine.com/
        `;
      }
      
      setError(`生成失败: ${errorMessage}`);
      setLoading(false);
    }
  };

  // 即梦图生图3.0异步任务生成函数
  const generateJimengI2I30Image = async () => {
    // 获取AccessKey
    const accessKeyId = storage.getAccessKeyId();
    const secretAccessKey = storage.getSecretAccessKey();

    if (!accessKeyId || !secretAccessKey) {
      setError('即梦图生图3.0需要配置AccessKey。请前往设置页面配置访问密钥（AccessKeyId 和 SecretAccessKey）');
      return;
    }

    if (!formData.prompt.trim()) {
      setError('请输入编辑指令（提示词）');
      return;
    }

    // 检查是否上传了图片
    if (!formData.useImage || (!formData.imageFiles.length && !formData.imageUrls.trim())) {
      setError('即梦图生图3.0需要上传一张图片作为输入。请启用图生图功能并上传图片。');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setJimengI2I30TaskStatus('submitting');

    try {
      // 准备请求数据
      const requestData = {
        accessKeyId,
        secretAccessKey,
        prompt: formData.prompt
      };

      // 处理图片输入
      if (formData.useImageUrl && formData.imageUrls.trim()) {
        // 使用图片URL（只支持单张）
        const urls = formData.imageUrls.split('\n').map(url => url.trim()).filter(url => url);
        if (urls.length > 1) {
          setError('即梦图生图3.0仅支持单张图片输入');
          setLoading(false);
          return;
        }
        requestData.image_urls = [urls[0]];
      } else if (formData.imageFiles.length > 0) {
        // 使用上传的文件（只支持单张）
        if (formData.imageFiles.length > 1) {
          setError('即梦图生图3.0仅支持单张图片输入');
          setLoading(false);
          return;
        }
        const base64 = await fileToBase64(formData.imageFiles[0]);
        // 移除data:image/xxx;base64,前缀
        const base64Data = base64.split(',')[1];
        requestData.binary_data_base64 = [base64Data];
      }

      // 添加scale参数（编辑强度）
      if (formData.guidance_scale !== undefined) {
        requestData.scale = formData.guidance_scale / 10; // UI上是0-10，API需要0-1
      }

      // 添加seed参数
      if (formData.seed !== -1) {
        requestData.seed = formData.seed;
      }

      // 处理尺寸参数
      if (formData.size.includes('x')) {
        const [w, h] = formData.size.split('x').map(n => parseInt(n));
        // 确保尺寸在[512, 2016]范围内
        if (w >= 512 && w <= 2016 && h >= 512 && h <= 2016) {
          requestData.width = w;
          requestData.height = h;
        }
      }

      // 提交任务
      console.log('提交即梦图生图3.0任务...');
      const submitResult = await window.electronAPI.submitJimengI2I30Task(requestData);

      if (!submitResult.success) {
        throw new Error(submitResult.error?.message || '提交任务失败');
      }

      const taskId = submitResult.data.task_id;
      console.log('任务已提交，Task ID:', taskId);
      
      setJimengI2I30TaskId(taskId);
      setJimengI2I30TaskStatus('in_queue');
      setError(`任务已提交（ID: ${taskId}），正在处理中...`);

      // 开始轮询查询任务状态
      const pollInterval = setInterval(async () => {
        try {
          const queryResult = await window.electronAPI.queryJimengI2I30Task({
            accessKeyId,
            secretAccessKey,
            task_id: taskId,
            req_json: JSON.stringify({ return_url: true })
          });

          if (!queryResult.success) {
            console.error('查询任务失败:', queryResult.error);
            return;
          }

          const status = queryResult.data.status;
          console.log('任务状态:', status);
          
          setJimengI2I30TaskStatus(status);

          if (status === 'done') {
            clearInterval(pollInterval);
            setJimengI2I30PollingInterval(null);
            
            const images = queryResult.data.image_urls || [];
            if (images.length > 0) {
              setResults(images.map(url => ({ url })));
              setError('');
              setLoading(false);
            } else {
              setError('任务完成，但未生成图片');
              setLoading(false);
            }
          } else if (status === 'generating') {
            setError(`任务处理中...（ID: ${taskId}）`);
          } else if (status === 'not_found' || status === 'expired') {
            clearInterval(pollInterval);
            setJimengI2I30PollingInterval(null);
            setError(`任务${status === 'not_found' ? '未找到' : '已过期'}`);
            setLoading(false);
          }
        } catch (pollError) {
          console.error('轮询查询错误:', pollError);
        }
      }, 3000); // 每3秒查询一次

      setJimengI2I30PollingInterval(pollInterval);

      // 设置30秒超时
      setTimeout(() => {
        if (jimengI2I30TaskStatus !== 'done') {
          clearInterval(pollInterval);
          setJimengI2I30PollingInterval(null);
          setError('任务超时，请稍后在控制台手动查询任务ID: ' + taskId);
          setLoading(false);
        }
      }, 30000);

    } catch (err) {
      console.error('即梦图生图3.0生成失败:', err);
      
      let errorMessage = err.message;
      
      // 处理常见错误
      if (err.message.includes('Access Denied')) {
        errorMessage = `
⚠️ 权限不足：即梦图生图3.0需要特殊权限

可能的原因：
1. 即梦图生图3.0服务未开通
2. 当前AccessKey没有即梦图生图3.0的访问权限
3. AccessKey配置不正确

解决方案：
• 访问火山引擎控制台申请即梦图生图服务权限
• 确认AccessKey具有"视觉智能-即梦AI"权限
• 或者暂时使用 Seedream 4.0 或 SeedEdit 3.0 模型

控制台地址：https://console.volcengine.com/
        `;
      }
      
      setError(`生成失败: ${errorMessage}`);
      setLoading(false);
    }
  };

  const generateImage = async () => {
    // 如果选择了即梦3.1模型，使用异步任务流程
    if (formData.model === 'jimeng-t2i-v31') {
      await generateJimeng31Image();
      return;
    }

    // 如果选择了即梦4.0模型，使用异步任务流程
    if (formData.model === 'jimeng-t2i-v40') {
      await generateJimeng40Image();
      return;
    }

    // 如果选择了即梦图生图3.0模型，使用异步任务流程
    if (formData.model === 'jimeng-i2i-v30') {
      await generateJimengI2I30Image();
      return;
    }

    // 以下是原有的同步生成流程（Seedream模型）
    if (!apiKey.trim()) {
      setError('请先设置 API Key');
      return;
    }

    // Validate API key format
    const cleanApiKey = apiKey.trim();
    if (!/^[a-zA-Z0-9._-]+$/.test(cleanApiKey)) {
      setError('API Key 格式不正确，只能包含字母、数字、点、下划线和连字符');
      return;
    }

    if (!formData.prompt.trim()) {
      setError('请输入提示词');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const requestBody = {
        model: formData.model,
        prompt: formData.prompt,
        size: formData.size,
        sequential_image_generation: formData.sequential_image_generation,
        stream: formData.stream,
        response_format: formData.response_format,
        watermark: formData.watermark
      };

      // 处理图片输入（图生图或多图融合）
      if (formData.useImage) {
        if (formData.useImageUrl && formData.imageUrls.trim()) {
          // 使用图片URL
          const urls = formData.imageUrls.split('\n').map(url => url.trim()).filter(url => url);
          if (urls.length === 1) {
            requestBody.image = urls[0];
          } else if (urls.length > 1) {
            requestBody.image = urls;
          }
        } else if (formData.imageFiles.length > 0) {
          // 使用上传的文件
          if (formData.imageFiles.length === 1) {
            const base64 = await fileToBase64(formData.imageFiles[0]);
            requestBody.image = base64;
          } else {
            const base64Images = await Promise.all(
              formData.imageFiles.map(file => fileToBase64(file))
            );
            requestBody.image = base64Images;
          }
        }
      }

      // 根据模型添加特定参数
      if (formData.model.includes('seedream-4') && formData.sequential_image_generation === 'auto') {
        requestBody.sequential_image_generation_options = {
          max_images: formData.max_images
        };
      }

      let result;
      
      if (window.electronAPI) {
        // 优先使用 Electron IPC
        console.log('使用 Electron IPC 通信');
        setProxyStatus('working');
        
        const requestData = {
          ...requestBody,
          apiKey: cleanApiKey
        };
        
        result = await window.electronAPI.generateImages(requestData);
        
        if (!result.success) {
          throw new Error(result.error?.message || 'IPC 调用失败');
        }
        
        setResults(result.data.data || []);
      } else {
        // Web模式：直接调用云端API
        console.log('Web模式：直接连接火山引擎云端API');
        setProxyStatus('failed');
        
        const requestData = {
          ...requestBody,
          apiKey: cleanApiKey
        };
        
        result = await webAPI.generateImages(requestData);
        
        if (!result.success) {
          throw new Error(result.error?.message || '云端API调用失败');
        }
        
        setResults(result.data.data || []);
      }
      
    } catch (err) {
      let errorMessage = err.message;
      
      // Handle common errors
      if (err.message.includes('Failed to fetch')) {
        errorMessage = '网络请求失败。这通常是由于 CORS 跨域限制。建议：1) 使用 Chrome 浏览器并禁用安全检查 2) 使用 Electron 桌面版本 3) 或者等待服务器端 CORS 配置';
      } else if (err.message.includes('CORS')) {
        errorMessage = 'CORS 跨域错误。由于浏览器安全限制，建议使用 Electron 桌面版本或配置浏览器允许跨域请求';
      } else if (err.message.includes('非 JSON 响应')) {
        errorMessage = '服务器返回了错误的响应格式，可能是 API 地址错误或服务器问题';
      } else if (err.message.includes('401')) {
        errorMessage = 'API Key 无效或已过期，请检查您的 API Key';
      } else if (err.message.includes('429')) {
        errorMessage = '请求过于频繁，请稍后再试';
      } else if (err.message.includes('500')) {
        errorMessage = '服务器内部错误，请稍后重试';
      }
      
      setError(`生成失败: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (url, index) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `generated-image-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(`下载失败: ${err.message}`);
    }
  };

  const previewImage = (url) => {
    setSelectedImage(url);
    setShowModal(true);
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setError('请先设置 API Key');
      return;
    }

    const cleanApiKey = apiKey.trim();
    if (!/^[a-zA-Z0-9._-]+$/.test(cleanApiKey)) {
      setError('API Key 格式不正确');
      return;
    }

    setTestingConnection(true);
    setError('');

    try {
      if (window.electronAPI) {
        // 使用 Electron IPC 测试连接
        console.log('使用 IPC 测试连接');
        const result = await window.electronAPI.testConnection(cleanApiKey);
        
        if (result.success) {
          setError('');
          alert('API 连接测试成功！您可以开始生成图片了。');
        } else if (result.status === 401) {
          setError('API Key 无效或已过期');
        } else if (result.status === 403) {
          setError('API Key 权限不足');
        } else {
          setError(`连接测试失败: ${result.error?.message || '未知错误'}`);
        }
      } else {
        // Web模式：直接调用云端API测试
        console.log('Web模式：直接测试云端API连接');
        const result = await webAPI.testConnection(cleanApiKey);
        
        if (result.success) {
          setError('');
          alert('API 连接测试成功！您可以开始生成图片了。');
        } else if (result.status === 401) {
          setError('API Key 无效或已过期');
        } else if (result.status === 403) {
          setError('API Key 权限不足');
        } else {
          setError(`连接测试失败: ${result.error?.message || '未知错误'}`);
        }
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setError('网络连接失败，请检查网络连接或CORS设置');
      } else {
        setError(`连接测试失败: ${err.message}`);
      }
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-image me-2"></i>
          AI 图片生成
        </h2>
        <div>
          <Badge bg="primary">Seedream 4.0 API</Badge>
          {proxyStatus === 'working' && (
            <Badge bg="success" className="ms-2">
              <i className="bi bi-check-circle me-1"></i>
              IPC 通信
            </Badge>
          )}
          {proxyStatus === 'failed' && (
            <Badge bg="warning" className="ms-2">
              <i className="bi bi-exclamation-triangle me-1"></i>
              浏览器模式
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          {(error.includes('CORS') || error.includes('Failed to fetch')) && (
            <div className="mt-3">
              <strong>CORS 解决方案：</strong>
              <ul className="mt-2 mb-0">
                <li>使用 Chrome 浏览器，启动时添加参数：<code>--disable-web-security --user-data-dir=/tmp/chrome_dev</code></li>
                <li>或者安装 CORS 浏览器扩展（如 CORS Unblock）</li>
                <li>推荐：使用 Electron 桌面版本（无 CORS 限制）</li>
              </ul>
            </div>
          )}
        </Alert>
      )}

      <Row>
        {/* 配置面板 */}
        <Col md={4}>
          <Card className="feature-card mb-4">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-gear me-2"></i>
              生成配置
            </Card.Header>
            <Card.Body>
              {/* API Key */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-key me-1"></i>
                  API Key
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="输入您的 ARK API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  isInvalid={apiKey && !/^[a-zA-Z0-9._-]+$/.test(apiKey.trim())}
                />
                <Form.Control.Feedback type="invalid">
                  API Key 格式不正确，只能包含字母、数字、点、下划线和连字符
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  请在 <a href="https://console.volcengine.com/ark" target="_blank" rel="noopener noreferrer">火山引擎控制台</a> 获取 API Key
                </Form.Text>
                <div className="mt-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={testConnection}
                    disabled={testingConnection || !apiKey.trim() || (apiKey && !/^[a-zA-Z0-9._-]+$/.test(apiKey.trim()))}
                  >
                    {testingConnection ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        测试中...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-wifi me-1"></i>
                        测试连接
                      </>
                    )}
                  </Button>
                </div>
              </Form.Group>

              {/* 模型选择 */}
              <Form.Group className="mb-3">
                <Form.Label>模型选择</Form.Label>
                <Form.Select
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                >
                  {models.map(model => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  {models.find(m => m.value === formData.model)?.description}
                </Form.Text>
              </Form.Group>

              {/* 图片尺寸 */}
              <Form.Group className="mb-3">
                <Form.Label>图片尺寸</Form.Label>
                <Form.Select
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                >
                  {sizeOptions.map(size => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* 组图功能 */}
              {formData.model.includes('seedream-4') && (
                <Form.Group className="mb-3">
                  <Form.Label>组图功能</Form.Label>
                  <Form.Select
                    value={formData.sequential_image_generation}
                    onChange={(e) => handleInputChange('sequential_image_generation', e.target.value)}
                  >
                    <option value="disabled">关闭 (生成单图)</option>
                    <option value="auto">自动 (生成组图)</option>
                  </Form.Select>
                  {formData.sequential_image_generation === 'auto' && (
                    <div className="mt-2">
                      <Form.Label className="small">最大图片数量</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="15"
                        value={formData.max_images}
                        onChange={(e) => handleInputChange('max_images', parseInt(e.target.value))}
                      />
                    </div>
                  )}
                </Form.Group>
              )}

              {/* 高级设置 */}
              <div className="border-top pt-3">
                <h6 className="text-muted">高级设置</h6>
                
                {/* 即梦图生图3.0 编辑强度 */}
                {formData.model === 'jimeng-i2i-v30' && (
                  <Form.Group className="mb-3">
                    <Form.Label>编辑强度 (Scale): {(formData.guidance_scale / 10).toFixed(1)}</Form.Label>
                    <Form.Range
                      min="0"
                      max="10"
                      step="0.5"
                      value={formData.guidance_scale}
                      onChange={(e) => handleInputChange('guidance_scale', parseFloat(e.target.value))}
                    />
                    <Form.Text className="text-muted">
                      数值越大越贴近指令执行，默认值: 0.5 (范围: 0-1)
                    </Form.Text>
                  </Form.Group>
                )}

                {/* 随机种子 */}
                {(formData.model === 'jimeng-i2i-v30') && (
                  <Form.Group className="mb-3">
                    <Form.Label>随机种子</Form.Label>
                    <Form.Control
                      type="number"
                      min="-1"
                      max="2147483647"
                      value={formData.seed}
                      onChange={(e) => handleInputChange('seed', parseInt(e.target.value))}
                    />
                    <Form.Text className="text-muted">
                      -1 表示随机生成
                    </Form.Text>
                  </Form.Group>
                )}

                {/* 水印设置 */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="watermark-switch"
                    label="添加水印"
                    checked={formData.watermark}
                    onChange={(e) => handleInputChange('watermark', e.target.checked)}
                  />
                </Form.Group>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* 主要内容区域 */}
        <Col md={8}>
          {/* 提示词输入 */}
          <Card className="feature-card mb-4">
            <Card.Header className="bg-success text-white">
              <i className="bi bi-chat-text me-2"></i>
              提示词输入
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder={
                    formData.model === 'jimeng-i2i-v30'
                      ? "请输入编辑指令，例如：把背景换成海边、添加一道彩虹、把衣服改成红色...建议使用单指令，长度≤120字符"
                      : "请输入图片生成的提示词，支持中英文。建议不超过300个汉字或600个英文单词..."
                  }
                  value={formData.prompt}
                  onChange={(e) => handleInputChange('prompt', e.target.value)}
                />
                <div className="d-flex justify-content-between mt-2">
                  <Form.Text className="text-muted">
                    字符数: {formData.prompt.length}
                    {formData.model === 'jimeng-i2i-v30' && formData.prompt.length > 120 && (
                      <span className="text-warning ms-2">⚠️ 建议≤120字符</span>
                    )}
                  </Form.Text>
                  <Button
                    variant="primary"
                    className="btn-gradient"
                    onClick={generateImage}
                    disabled={loading || !formData.prompt.trim() || (formData.model !== 'jimeng-i2i-v30' && formData.model !== 'jimeng-t2i-v40' && formData.model !== 'jimeng-t2i-v31' && !apiKey.trim())}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-magic me-1"></i>
                        {formData.model === 'jimeng-i2i-v30' ? '编辑图片' : '生成图片'}
                      </>
                    )}
                  </Button>
                </div>
              </Form.Group>

              {/* 示例提示词 */}
              <div className="border rounded p-3 bg-light">
                <h6 className="mb-2">
                  <i className="bi bi-lightbulb me-1"></i>
                  {formData.model === 'jimeng-i2i-v30' ? '示例编辑指令' : '示例提示词'}
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {formData.model === 'jimeng-i2i-v30' ? [
                    "背景换成海边",
                    "添加一道彩虹",
                    "把衣服改成红色",
                    "改成漫画风格",
                    "让他笑",
                    "删除图上的女孩"
                  ].map((example, index) => (
                    <Button
                      key={index}
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleInputChange('prompt', example)}
                    >
                      {example}
                    </Button>
                  )) : [
                    "一只可爱的小猫咪，坐在窗台上，阳光透过窗户洒在它身上",
                    "未来科技城市，霓虹灯闪烁，飞行汽车穿梭其中",
                    "油画风格的向日葵田，梵高风格，色彩鲜艳",
                    "中国古典园林，小桥流水，亭台楼阁"
                  ].map((example, index) => (
                    <Button
                      key={index}
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleInputChange('prompt', example)}
                    >
                      {example.substring(0, 20)}...
                    </Button>
                  ))}
                </div>
                {formData.model === 'jimeng-i2i-v30' && (
                  <Alert variant="success" className="mt-3 mb-0 small">
                    <strong>💡 编辑技巧：</strong>
                    <ul className="mb-0 mt-1">
                      <li>推荐在海报设计场景中加入「海报」「平面设计」等词</li>
                      <li>期望文字请用引号标出，例如：上面写着"Merry Christmas"</li>
                      <li>编辑效果不明显时可调整编辑强度(scale)数值</li>
                      <li>使用清晰、高分辨率的底图效果更好</li>
                    </ul>
                  </Alert>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* 图片输入区域 - 支持图生图和多图融合 */}
          {(formData.model.includes('seedream-4') || formData.model === 'jimeng-i2i-v30') && (
            <Card className="feature-card mb-4">
              <Card.Header className="bg-warning text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-images me-2"></i>
                    图片输入 {formData.model === 'jimeng-i2i-v30' ? '(必需)' : '(可选)'}
                  </div>
                  <Form.Check
                    type="switch"
                    id="use-image-switch"
                    label="启用图生图"
                    checked={formData.useImage}
                    onChange={(e) => handleInputChange('useImage', e.target.checked)}
                    className="text-white"
                  />
                </div>
              </Card.Header>
              {formData.useImage && (
                <Card.Body>
                  <Alert variant="info" className="small">
                    <i className="bi bi-info-circle me-1"></i>
                    <strong>图生图功能说明：</strong>
                    <ul className="mb-0 mt-2">
                      {formData.model === 'jimeng-i2i-v30' && (
                        <>
                          <li>即梦图生图3.0智能参考：精准执行编辑指令，保持图像完整性</li>
                          <li>仅支持单张图片输入</li>
                          <li>图片格式：JPEG、PNG | 大小：≤4.7MB | 分辨率：≤4096×4096</li>
                          <li>长边与短边比例在3以内</li>
                          <li>推荐：编辑指令使用自然语言，单指令效果更好</li>
                        </>
                      )}
                      {formData.model.includes('seedream-4') && (
                        <>
                          <li>doubao-seedream-4.0 支持 1-10 张参考图</li>
                          <li>图片格式：JPEG、PNG | 大小：≤10MB | 像素：≤6000×6000</li>
                          <li>宽高比范围：1/3 到 3 之间</li>
                        </>
                      )}
                    </ul>
                  </Alert>

                  {/* 选择输入方式 */}
                  <Form.Group className="mb-3">
                    <Form.Label>选择输入方式</Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="radio"
                        label="📁 上传本地图片"
                        name="imageInputType"
                        checked={!formData.useImageUrl}
                        onChange={() => handleInputChange('useImageUrl', false)}
                      />
                      <Form.Check
                        type="radio"
                        label="🔗 使用图片URL"
                        name="imageInputType"
                        checked={formData.useImageUrl}
                        onChange={() => handleInputChange('useImageUrl', true)}
                      />
                    </div>
                  </Form.Group>

                  {/* 文件上传 */}
                  {!formData.useImageUrl && (
                    <Form.Group className="mb-3">
                      <Form.Label>
                        上传图片
                        {formData.model.includes('seedream-4') && (
                          <small className="text-muted ms-2">(可上传1-10张)</small>
                        )}
                        {formData.model === 'jimeng-i2i-v30' && (
                          <small className="text-muted ms-2">(仅支持单张)</small>
                        )}
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/jpeg,image/png"
                        multiple={formData.model.includes('seedream-4')}
                        onChange={handleImageFilesChange}
                      />
                      {formData.imageFiles.length > 0 && (
                        <div className="mt-2">
                          <small className="text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            已选择 {formData.imageFiles.length} 张图片：
                          </small>
                          <ul className="small mb-0">
                            {Array.from(formData.imageFiles).map((file, index) => (
                              <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Form.Group>
                  )}

                  {/* URL输入 */}
                  {formData.useImageUrl && (
                    <Form.Group className="mb-3">
                      <Form.Label>
                        图片URL
                        {formData.model.includes('seedream-4') && (
                          <small className="text-muted ms-2">(多个URL请换行输入)</small>
                        )}
                        {formData.model === 'jimeng-i2i-v30' && (
                          <small className="text-muted ms-2">(仅支持单张)</small>
                        )}
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={formData.model.includes('seedream-4') ? 5 : 2}
                        placeholder={
                          formData.model.includes('seedream-4')
                            ? "输入图片URL，支持多张图片，每行一个URL\n例如：\nhttps://example.com/image1.jpg\nhttps://example.com/image2.jpg"
                            : "输入图片URL，例如：https://example.com/image.jpg"
                        }
                        value={formData.imageUrls}
                        onChange={(e) => handleInputChange('imageUrls', e.target.value)}
                      />
                      <Form.Text className="text-muted">
                        请确保图片URL可以被访问
                      </Form.Text>
                    </Form.Group>
                  )}
                </Card.Body>
              )}
            </Card>
          )}

          {/* 生成结果 */}
          <Card className="feature-card">
            <Card.Header className="bg-info text-white">
              <i className="bi bi-images me-2"></i>
              生成结果
              {results.length > 0 && (
                <Badge bg="light" text="dark" className="ms-2">
                  {results.length} 张图片
                </Badge>
              )}
            </Card.Header>
            <Card.Body>
              {loading && (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">正在生成图片，请稍候...</p>
                </div>
              )}

              {results.length === 0 && !loading && (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-image display-1 mb-3"></i>
                  <p>暂无生成结果，请输入提示词并点击生成</p>
                </div>
              )}

              {results.length > 0 && (
                <Row>
                  {results.map((result, index) => (
                    <Col md={6} lg={4} key={index} className="mb-3">
                      {result.url ? (
                        <Card className="h-100">
                          <div style={{ position: 'relative', paddingBottom: '100%', overflow: 'hidden' }}>
                            <Image
                              src={result.url}
                              alt={`Generated ${index + 1}`}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                cursor: 'pointer'
                              }}
                              onClick={() => previewImage(result.url)}
                            />
                          </div>
                          <Card.Body className="p-2">
                            {result.size && (
                              <small className="text-muted d-block mb-2">
                                尺寸: {result.size}
                              </small>
                            )}
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => previewImage(result.url)}
                              >
                                <i className="bi bi-eye"></i>
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => downloadImage(result.url, index)}
                              >
                                <i className="bi bi-download"></i>
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      ) : result.error ? (
                        <Card className="h-100 border-danger">
                          <Card.Body className="text-center text-danger">
                            <i className="bi bi-exclamation-triangle display-4 mb-2"></i>
                            <p className="small">{result.error.message}</p>
                          </Card.Body>
                        </Card>
                      ) : null}
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 图片预览模态框 */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>图片预览</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImage && (
            <Image src={selectedImage} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            关闭
          </Button>
          <Button variant="primary" onClick={() => downloadImage(selectedImage, 0)}>
            <i className="bi bi-download me-1"></i>
            下载图片
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ImageGenerator;
