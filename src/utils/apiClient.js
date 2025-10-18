/**
 * 前端 API 客户端
 * 通过代理服务器调用火山引擎云端 API
 */

// 代理服务器配置
const PROXY_BASE_URL = 'http://150.5.162.248:8000/proxy/';

// 火山引擎API基础地址（作为target_url参数）
const VOLCANO_API_BASE_URL = 'https://api-vikingdb.volces.com';  // 向量数据库API
const ARK_API_BASE_URL = 'https://ark.cn-beijing.volces.com';   // 方舟API

class APIClient {
  constructor() {
    this.proxyURL = PROXY_BASE_URL;
  }

  /**
   * 通用请求方法 - 通过代理服务器调用云端API
   */
  async request(endpoint, options = {}) {
    // 判断API类型，选择正确的目标URL
    let targetBaseURL;
    let targetEndpoint = endpoint;
    
    if (endpoint.startsWith('/api/v3/')) {
      // 方舟图片生成API
      targetBaseURL = ARK_API_BASE_URL;
      // 保留完整路径，不删除 /api
      targetEndpoint = endpoint;
    } else if (endpoint.startsWith('/api/video/')) {
      // 方舟视频生成API  
      targetBaseURL = ARK_API_BASE_URL;
      targetEndpoint = endpoint.replace('/api/video', '/api/v1/text2video');
    } else if (endpoint.startsWith('/api/embedding/') || endpoint.startsWith('/api/search/') || endpoint.startsWith('/api/vector/')) {
      // 向量数据库API
      targetBaseURL = VOLCANO_API_BASE_URL;
      targetEndpoint = endpoint;
    } else {
      // 其他API需要通过IPC或本地服务器
      console.warn(`Endpoint ${endpoint} 需要使用 Electron IPC 或配置本地代理服务器`);
      return {
        success: false,
        error: {
          message: '该API需要使用Electron桌面应用或配置本地代理服务器',
          code: 'UNSUPPORTED_ENDPOINT'
        }
      };
    }
    
    // 构建完整的目标URL
    const targetURL = `${targetBaseURL}${targetEndpoint}`;
    
    // 构建代理请求URL
    const proxyURL = `${this.proxyURL}?target_url=${(targetURL)}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    console.log('🔄 通过代理请求:', {
      proxy: this.proxyURL,
      target: targetURL,
      finalURL: proxyURL
    });

    try {
      const response = await fetch(proxyURL, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'API_ERROR'
        }
      };
    }
  }

  // ===== 图片生成 =====

  async generateImages(requestData) {
    return this.request('/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${requestData.apiKey}`
      },
      body: JSON.stringify(requestData)
    });
  }

  async testConnection(apiKey) {
    return this.request('/api/test-connection', {
      method: 'POST',
      body: JSON.stringify({ apiKey })
    });
  }

  // ===== 即梦系列图片生成 =====

  async submitJimeng40Task(requestData) {
    return this.request('/api/jimeng40/submit', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async queryJimeng40Task(requestData) {
    return this.request('/api/jimeng40/query', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async submitJimeng31Task(requestData) {
    return this.request('/api/jimeng31/submit', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async queryJimeng31Task(requestData) {
    return this.request('/api/jimeng31/query', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async submitJimengI2I30Task(requestData) {
    return this.request('/api/jimeng-i2i30/submit', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async queryJimengI2I30Task(requestData) {
    return this.request('/api/jimeng-i2i30/query', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  // ===== 视频生成 =====

  async createVideoTask(requestData) {
    return this.request('/api/video/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${requestData.apiKey}`
      },
      body: JSON.stringify(requestData)
    });
  }

  async getVideoTask(taskId, apiKey) {
    return this.request(`/api/video/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
  }

  async getVideoTasks(queryParams, apiKey) {
    const params = new URLSearchParams();
    if (queryParams.page_num) params.append('page_num', queryParams.page_num);
    if (queryParams.page_size) params.append('page_size', queryParams.page_size);
    if (queryParams.status) params.append('filter.status', queryParams.status);
    if (queryParams.task_ids) params.append('filter.task_ids', queryParams.task_ids);
    if (queryParams.model) params.append('filter.model', queryParams.model);

    return this.request(`/api/video/tasks?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
  }

  async deleteVideoTask(taskId, apiKey) {
    return this.request(`/api/video/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
  }

  async submitJimeng30ProVideoTask(requestData) {
    return this.request('/api/jimeng30pro-video/submit', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async queryJimeng30ProVideoTask(requestData) {
    return this.request('/api/jimeng30pro-video/query', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  // ===== 动作模仿 =====

  async submitMotionImitationTask(requestData) {
    return this.request('/api/motion-imitation/submit', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async queryMotionImitationTask(requestData) {
    return this.request('/api/motion-imitation/query', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async submitJimengMotionImitationTask(requestData) {
    return this.request('/api/jimeng-motion-imitation/submit', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async queryJimengMotionImitationTask(requestData) {
    return this.request('/api/jimeng-motion-imitation/query', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  // ===== OmniHuman1.5 数字人 =====

  async submitOmniHumanIdentifyTask(requestData) {
    return this.request('/api/omnihuman/identify/submit', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async queryOmniHumanIdentifyTask(requestData) {
    return this.request('/api/omnihuman/identify/query', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async detectOmniHumanSubject(requestData) {
    return this.request('/api/omnihuman/detect', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async submitOmniHumanVideoTask(requestData) {
    return this.request('/api/omnihuman/video/submit', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async queryOmniHumanVideoTask(requestData) {
    return this.request('/api/omnihuman/video/query', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  // ===== Inpainting 涂抹编辑 =====

  async submitInpaintingTask(requestData) {
    return this.request('/api/inpainting/submit', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  // ===== 视频编辑 =====

  async submitVideoEditTask(requestData) {
    return this.request('/api/video-edit/submit', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async queryVideoEditTask(requestData) {
    return this.request('/api/video-edit/query', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  // ===== 向量搜索 =====

  async imageEmbedding(requestData) {
    return this.request('/api/embedding/image', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async searchByMultiModal(requestData) {
    return this.request('/api/search/multimodal', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async computeEmbedding(requestData) {
    return this.request('/api/embedding/compute', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async upsertVectorData(requestData) {
    return this.request('/api/vector/upsert', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async getTosPreSignedUrl(requestData) {
    return this.request('/api/tos/presigned-url', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  // ===== TOS 文件上传 =====

  async uploadToTOS(fileData, config) {
    return this.request('/api/tos/upload', {
      method: 'POST',
      body: JSON.stringify({ fileData, config })
    });
  }

  // ===== 系统功能 =====

  async getAppInfo() {
    return {
      success: true,
      data: {
        platform: 'web',
        version: '2.0.0',
        isElectron: false,
        isDev: process.env.NODE_ENV === 'development'
      }
    };
  }
}

// 创建单例实例
const apiClient = new APIClient();

// 导出与 electronAPI 兼容的接口
export const webAPI = {
  generateImages: (data) => apiClient.generateImages(data),
  testConnection: (apiKey) => apiClient.testConnection(apiKey),
  
  // 即梦系列
  submitJimeng40Task: (data) => apiClient.submitJimeng40Task(data),
  queryJimeng40Task: (data) => apiClient.queryJimeng40Task(data),
  submitJimeng31Task: (data) => apiClient.submitJimeng31Task(data),
  queryJimeng31Task: (data) => apiClient.queryJimeng31Task(data),
  submitJimengI2I30Task: (data) => apiClient.submitJimengI2I30Task(data),
  queryJimengI2I30Task: (data) => apiClient.queryJimengI2I30Task(data),
  
  // 视频生成
  createVideoTask: (data) => apiClient.createVideoTask(data),
  getVideoTask: ({ taskId, apiKey }) => apiClient.getVideoTask(taskId, apiKey),
  getVideoTasks: ({ queryParams, apiKey }) => apiClient.getVideoTasks(queryParams, apiKey),
  deleteVideoTask: ({ taskId, apiKey }) => apiClient.deleteVideoTask(taskId, apiKey),
  submitJimeng30ProVideoTask: (data) => apiClient.submitJimeng30ProVideoTask(data),
  queryJimeng30ProVideoTask: (data) => apiClient.queryJimeng30ProVideoTask(data),
  
  // 动作模仿
  submitMotionImitationTask: (data) => apiClient.submitMotionImitationTask(data),
  queryMotionImitationTask: (data) => apiClient.queryMotionImitationTask(data),
  submitJimengMotionImitationTask: (data) => apiClient.submitJimengMotionImitationTask(data),
  queryJimengMotionImitationTask: (data) => apiClient.queryJimengMotionImitationTask(data),
  
  // OmniHuman1.5
  submitOmniHumanIdentifyTask: (data) => apiClient.submitOmniHumanIdentifyTask(data),
  queryOmniHumanIdentifyTask: (data) => apiClient.queryOmniHumanIdentifyTask(data),
  detectOmniHumanSubject: (data) => apiClient.detectOmniHumanSubject(data),
  submitOmniHumanVideoTask: (data) => apiClient.submitOmniHumanVideoTask(data),
  queryOmniHumanVideoTask: (data) => apiClient.queryOmniHumanVideoTask(data),
  
  // Inpainting
  submitInpaintingTask: (data) => apiClient.submitInpaintingTask(data),
  
  // 视频编辑
  submitVideoEditTask: (data) => apiClient.submitVideoEditTask(data),
  queryVideoEditTask: (data) => apiClient.queryVideoEditTask(data),
  
  // 向量搜索
  imageEmbedding: (data) => apiClient.imageEmbedding(data),
  searchByMultiModal: (data) => apiClient.searchByMultiModal(data),
  computeEmbedding: (data) => apiClient.computeEmbedding(data),
  upsertVectorData: (data) => apiClient.upsertVectorData(data),
  getTosPreSignedUrl: (data) => apiClient.getTosPreSignedUrl(data),
  
  // TOS
  uploadToTOS: (fileData, config) => apiClient.uploadToTOS(fileData, config),
  
  // 系统
  getAppInfo: () => apiClient.getAppInfo()
};

export default apiClient;

