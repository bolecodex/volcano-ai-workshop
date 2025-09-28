const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const apiService = require('../api-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// API Routes
app.post('/api/v3/images/generations', async (req, res) => {
  try {
    console.log('Received image generation request:', {
      model: req.body.model,
      prompt: req.body.prompt?.substring(0, 50) + '...',
      size: req.body.size
    });

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', response.status, data);
      return res.status(response.status).json(data);
    }

    console.log('API Success:', {
      status: response.status,
      generatedImages: data.usage?.generated_images || 0
    });

    res.json(data);
  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      }
    });
  }
});

// 视频生成API路由
// 创建视频生成任务
app.post('/api/video/create', async (req, res) => {
  try {
    console.log('Received video creation request:', {
      model: req.body.model,
      contentCount: req.body.content?.length || 0
    });

    // 从请求头获取API Key
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'MISSING_API_KEY',
          message: 'Authorization header with Bearer token is required'
        }
      });
    }

    const apiKey = authHeader.substring(7); // 移除 "Bearer " 前缀
    
    const requestData = {
      ...req.body,
      apiKey: apiKey
    };

    const result = await apiService.createVideoTask(requestData);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({
        error: result.error
      });
    }
  } catch (error) {
    console.error('Video creation server error:', error.message);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      }
    });
  }
});

// 查询单个视频任务
app.get('/api/video/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    console.log('Received video task query request:', taskId);

    // 从请求头获取API Key
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'MISSING_API_KEY',
          message: 'Authorization header with Bearer token is required'
        }
      });
    }

    const apiKey = authHeader.substring(7);
    
    const result = await apiService.getVideoTask(taskId, apiKey);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({
        error: result.error
      });
    }
  } catch (error) {
    console.error('Video task query server error:', error.message);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      }
    });
  }
});

// 查询视频任务列表
app.get('/api/video/tasks', async (req, res) => {
  try {
    console.log('Received video tasks list request:', req.query);

    // 从请求头获取API Key
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'MISSING_API_KEY',
          message: 'Authorization header with Bearer token is required'
        }
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
      res.status(500).json({
        error: result.error
      });
    }
  } catch (error) {
    console.error('Video tasks list server error:', error.message);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      }
    });
  }
});

// 删除视频任务
app.delete('/api/video/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    console.log('Received video task deletion request:', taskId);

    // 从请求头获取API Key
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'MISSING_API_KEY',
          message: 'Authorization header with Bearer token is required'
        }
      });
    }

    const apiKey = authHeader.substring(7);
    
    const result = await apiService.deleteVideoTask(taskId, apiKey);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({
        error: result.error
      });
    }
  } catch (error) {
    console.error('Video task deletion server error:', error.message);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error: ' + error.message
      }
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Serve React app for any other routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Image API: http://localhost:${PORT}/api/v3/images/generations`);
  console.log(`🎬 Video API: http://localhost:${PORT}/api/video/create`);
  console.log(`📋 Video Tasks: http://localhost:${PORT}/api/video/tasks`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
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
