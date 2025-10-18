const express = require('express');
const cors = require('cors');
const path = require('path');
const apiService = require('../api-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 支持大文件上传
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../build')));

// ===== 图片生成 API =====

// Seedream 4.0 图片生成
app.post('/api/v3/images/generations', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { code: 'MISSING_API_KEY', message: 'Authorization header with Bearer token is required' }
      });
    }

    const apiKey = authHeader.substring(7);
    const result = await apiService.generateImages({ ...req.body, apiKey });
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 测试连接
app.post('/api/test-connection', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const result = await apiService.testConnection(apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ===== 即梦系列图片生成 API =====

// 即梦 4.0 - 提交任务
app.post('/api/jimeng40/submit', async (req, res) => {
  try {
    const result = await apiService.submitJimeng40Task(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 即梦 4.0 - 查询任务
app.post('/api/jimeng40/query', async (req, res) => {
  try {
    const result = await apiService.queryJimeng40Task(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 即梦 3.1 - 提交任务
app.post('/api/jimeng31/submit', async (req, res) => {
  try {
    const result = await apiService.submitJimeng31Task(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 即梦 3.1 - 查询任务
app.post('/api/jimeng31/query', async (req, res) => {
  try {
    const result = await apiService.queryJimeng31Task(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 即梦图生图 3.0 - 提交任务
app.post('/api/jimeng-i2i30/submit', async (req, res) => {
  try {
    const result = await apiService.submitJimengI2I30Task(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 即梦图生图 3.0 - 查询任务
app.post('/api/jimeng-i2i30/query', async (req, res) => {
  try {
    const result = await apiService.queryJimengI2I30Task(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// ===== 视频生成 API =====

// 创建视频生成任务
app.post('/api/video/create', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { code: 'MISSING_API_KEY', message: 'Authorization header with Bearer token is required' }
      });
    }

    const apiKey = authHeader.substring(7);
    const requestData = { ...req.body, apiKey };
    const result = await apiService.createVideoTask(requestData);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 查询单个视频任务
app.get('/api/video/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { code: 'MISSING_API_KEY', message: 'Authorization header with Bearer token is required' }
      });
    }

    const apiKey = authHeader.substring(7);
    const result = await apiService.getVideoTask(taskId, apiKey);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 查询视频任务列表
app.get('/api/video/tasks', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { code: 'MISSING_API_KEY', message: 'Authorization header with Bearer token is required' }
      });
    }

    const apiKey = authHeader.substring(7);
    const queryParams = {
      page_num: req.query.page_num,
      page_size: req.query.page_size,
      status: req.query['filter.status'],
      task_ids: req.query['filter.task_ids'],
      model: req.query['filter.model']
    };
    
    const result = await apiService.getVideoTasks(queryParams, apiKey);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 删除视频任务
app.delete('/api/video/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { code: 'MISSING_API_KEY', message: 'Authorization header with Bearer token is required' }
      });
    }

    const apiKey = authHeader.substring(7);
    const result = await apiService.deleteVideoTask(taskId, apiKey);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 即梦 3.0 Pro 视频 - 提交任务
app.post('/api/jimeng30pro-video/submit', async (req, res) => {
  try {
    const result = await apiService.submitJimeng30ProVideoTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 即梦 3.0 Pro 视频 - 查询任务
app.post('/api/jimeng30pro-video/query', async (req, res) => {
  try {
    const result = await apiService.queryJimeng30ProVideoTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// ===== 动作模仿 API =====

// 经典版 - 提交任务
app.post('/api/motion-imitation/submit', async (req, res) => {
  try {
    const result = await apiService.submitMotionImitationTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 经典版 - 查询任务
app.post('/api/motion-imitation/query', async (req, res) => {
  try {
    const result = await apiService.queryMotionImitationTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 即梦动作模仿 - 提交任务
app.post('/api/jimeng-motion-imitation/submit', async (req, res) => {
  try {
    const result = await apiService.submitJimengMotionImitationTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 即梦动作模仿 - 查询任务
app.post('/api/jimeng-motion-imitation/query', async (req, res) => {
  try {
    const result = await apiService.queryJimengMotionImitationTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// ===== OmniHuman1.5 数字人 API =====

// 主体识别 - 提交任务
app.post('/api/omnihuman/identify/submit', async (req, res) => {
  try {
    const result = await apiService.submitOmniHumanIdentifyTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 主体识别 - 查询任务
app.post('/api/omnihuman/identify/query', async (req, res) => {
  try {
    const result = await apiService.queryOmniHumanIdentifyTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 主体检测 - 同步接口
app.post('/api/omnihuman/detect', async (req, res) => {
  try {
    const result = await apiService.detectOmniHumanSubject(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 视频生成 - 提交任务
app.post('/api/omnihuman/video/submit', async (req, res) => {
  try {
    const result = await apiService.submitOmniHumanVideoTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 视频生成 - 查询任务
app.post('/api/omnihuman/video/query', async (req, res) => {
  try {
    const result = await apiService.queryOmniHumanVideoTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// ===== Inpainting 涂抹编辑 API =====

app.post('/api/inpainting/submit', async (req, res) => {
  try {
    const result = await apiService.submitInpaintingTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// ===== 视频编辑 API =====

// 视频编辑 - 提交任务
app.post('/api/video-edit/submit', async (req, res) => {
  try {
    const result = await apiService.submitVideoEditTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 视频编辑 - 查询任务
app.post('/api/video-edit/query', async (req, res) => {
  try {
    const result = await apiService.queryVideoEditTask(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// ===== 向量搜索 API =====

// 图像向量化
app.post('/api/embedding/image', async (req, res) => {
  try {
    const result = await apiService.imageEmbedding(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 多模态检索
app.post('/api/search/multimodal', async (req, res) => {
  try {
    const result = await apiService.searchByMultiModal(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 向量化计算
app.post('/api/embedding/compute', async (req, res) => {
  try {
    const result = await apiService.computeEmbedding(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 数据写入
app.post('/api/vector/upsert', async (req, res) => {
  try {
    const result = await apiService.upsertVectorData(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// TOS预签名URL
app.post('/api/tos/presigned-url', async (req, res) => {
  try {
    const result = await apiService.getTosPreSignedUrl(req.body);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// ===== TOS 文件上传 API =====

app.post('/api/tos/upload', async (req, res) => {
  try {
    const { fileData, config } = req.body;
    const result = await apiService.uploadToTOS(fileData, config);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '火山AI创作工坊后端服务运行中',
    timestamp: new Date().toISOString(),
    port: PORT,
    version: '2.0.0-web'
  });
});

// Serve React app for any other routes (must be last)
app.use((req, res) => {
  // 检查 build 目录是否存在
  const indexPath = path.join(__dirname, '../build/index.html');
  const fs = require('fs');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>火山AI创作工坊 Web版</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 40px;
              background: rgba(255,255,255,0.1);
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
            h1 { font-size: 2.5em; margin-bottom: 20px; }
            p { font-size: 1.2em; margin: 10px 0; }
            code { background: rgba(0,0,0,0.3); padding: 5px 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🌋 火山AI创作工坊 Web版</h1>
            <h2>后端服务器运行中</h2>
            <p>✅ API 服务器已启动</p>
            <p>⚠️ 前端尚未构建</p>
            <br>
            <p>请先构建前端：<code>npm run build</code></p>
            <p>或启动开发模式：<code>npm run dev</code></p>
            <br>
            <p>API 端点: <code>http://localhost:${PORT}/api/health</code></p>
          </div>
        </body>
      </html>
    `);
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log('');
  console.log('🌋 ========================================');
  console.log('   火山AI创作工坊 Web版 - 后端服务');
  console.log('========================================== 🌋');
  console.log('');
  console.log(`🚀 服务器运行中: http://localhost:${PORT}`);
  console.log('');
  console.log('📡 API 端点:');
  console.log(`   图片生成: http://localhost:${PORT}/api/v3/images/generations`);
  console.log(`   视频生成: http://localhost:${PORT}/api/video/create`);
  console.log(`   动作模仿: http://localhost:${PORT}/api/motion-imitation/submit`);
  console.log(`   数字人: http://localhost:${PORT}/api/omnihuman/video/submit`);
  console.log(`   智能绘图: http://localhost:${PORT}/api/inpainting/submit`);
  console.log(`   视频编辑: http://localhost:${PORT}/api/video-edit/submit`);
  console.log(`   健康检查: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('✨ 准备就绪，开始创作！');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
