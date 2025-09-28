const fetch = require('node-fetch');

class APIService {
  constructor() {
    this.baseURL = 'https://ark.cn-beijing.volces.com';
  }

  async generateImages(requestData) {
    try {
      console.log('API Service: Generating images with data:', {
        model: requestData.model,
        prompt: requestData.prompt?.substring(0, 50) + '...',
        size: requestData.size
      });

      const response = await fetch(`${this.baseURL}/api/v3/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${requestData.apiKey}`
        },
        body: JSON.stringify({
          model: requestData.model,
          prompt: requestData.prompt,
          size: requestData.size,
          sequential_image_generation: requestData.sequential_image_generation,
          stream: requestData.stream,
          response_format: requestData.response_format,
          watermark: requestData.watermark,
          guidance_scale: requestData.guidance_scale,
          seed: requestData.seed,
          sequential_image_generation_options: requestData.sequential_image_generation_options
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', response.status, data);
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('API Success:', {
        status: response.status,
        generatedImages: data.usage?.generated_images || 0
      });

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'API_ERROR'
        }
      };
    }
  }

  async testConnection(apiKey) {
    try {
      console.log('API Service: Testing connection');

      const response = await fetch(`${this.baseURL}/api/v3/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'doubao-seedream-4-0-250828',
          prompt: 'test',
          size: '2K',
          sequential_image_generation: 'disabled',
          response_format: 'url',
          watermark: true
        })
      });

      const data = await response.json();

      return {
        success: response.ok || response.status === 400, // 400 might be expected for test
        status: response.status,
        data: data
      };

    } catch (error) {
      console.error('Connection Test Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'CONNECTION_ERROR'
        }
      };
    }
  }

  // 视频生成相关方法
  async createVideoTask(requestData) {
    try {
      console.log('API Service: Creating video generation task with data:', {
        model: requestData.model,
        contentCount: requestData.content?.length || 0,
        content: requestData.content,
        callback_url: requestData.callback_url,
        return_last_frame: requestData.return_last_frame
      });

      // 详细打印请求体
      const requestBody = {
        model: requestData.model,
        content: requestData.content,
        callback_url: requestData.callback_url,
        return_last_frame: requestData.return_last_frame
      };
      
      console.log('📤 发送到火山方舟的完整请求体:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.baseURL}/api/v3/contents/generations/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${requestData.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      console.log('📥 火山方舟API响应:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      });

      if (!response.ok) {
        console.error('❌ Video API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData: data,
          requestBody: requestBody
        });
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Video API Success:', {
        status: response.status,
        taskId: data.id,
        responseData: data
      });

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Video API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'VIDEO_API_ERROR'
        }
      };
    }
  }

  async getVideoTask(taskId, apiKey) {
    try {
      console.log('API Service: Getting video task:', taskId);

      const response = await fetch(`${this.baseURL}/api/v3/contents/generations/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Video Task API Error:', response.status, data);
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Video Task API Success:', {
        status: response.status,
        taskId: data.id,
        taskStatus: data.status
      });

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Video Task API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'VIDEO_TASK_API_ERROR'
        }
      };
    }
  }

  async getVideoTasks(queryParams, apiKey) {
    try {
      console.log('API Service: Getting video tasks with params:', queryParams);

      const params = new URLSearchParams();
      if (queryParams.page_num) params.append('page_num', queryParams.page_num);
      if (queryParams.page_size) params.append('page_size', queryParams.page_size);
      if (queryParams.status) params.append('filter.status', queryParams.status);
      if (queryParams.task_ids) params.append('filter.task_ids', queryParams.task_ids);
      if (queryParams.model) params.append('filter.model', queryParams.model);

      const response = await fetch(`${this.baseURL}/api/v3/contents/generations/tasks?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Video Tasks API Error:', response.status, data);
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Video Tasks API Success:', {
        status: response.status,
        totalTasks: data.total || 0,
        returnedTasks: data.items?.length || 0
      });

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Video Tasks API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'VIDEO_TASKS_API_ERROR'
        }
      };
    }
  }

  async deleteVideoTask(taskId, apiKey) {
    try {
      console.log('API Service: Deleting video task:', taskId);

      const response = await fetch(`${this.baseURL}/api/v3/contents/generations/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Delete Video Task API Error:', response.status, data);
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Delete Video Task API Success:', {
        status: response.status,
        taskId: taskId
      });

      return {
        success: true,
        data: {}
      };

    } catch (error) {
      console.error('Delete Video Task API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'DELETE_VIDEO_TASK_API_ERROR'
        }
      };
    }
  }
}

module.exports = new APIService();
