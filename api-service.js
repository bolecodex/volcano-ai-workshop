const fetch = require('node-fetch');
const SignatureV4 = require('./signature-v4');

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

  // 动作模仿 API - 提交任务
  async submitMotionImitationTask(requestData) {
    try {
      console.log('API Service: Submitting motion imitation task');
      
      // 检查是否提供了AccessKey和SecretKey
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey。请在设置中配置访问密钥。');
      }
      
      const visualBaseURL = 'https://visual.volcengineapi.com';
      const url = `${visualBaseURL}?Action=CVSubmitTask&Version=2022-08-31`;
      
      // 构建请求体
      const requestBody = {
        req_key: requestData.req_key || 'realman_avatar_imitator_v2v_gen_video',
        image_url: requestData.image_url,
        driving_video_info: requestData.driving_video_info
      };

      const bodyString = JSON.stringify(requestBody);

      console.log('Motion Imitation Request:', {
        url: url,
        req_key: requestBody.req_key,
        has_image: !!requestBody.image_url,
        has_video: !!requestBody.driving_video_info,
        image_url_type: requestBody.image_url?.startsWith('data:') ? 'base64' : 'url',
        image_url_length: requestBody.image_url?.length || 0,
        image_url_preview: requestBody.image_url?.substring(0, 100),
        video_url_type: requestBody.driving_video_info?.video_url?.startsWith('data:') ? 'base64' : 'url',
        video_url_length: requestBody.driving_video_info?.video_url?.length || 0,
        video_url_preview: requestBody.driving_video_info?.video_url?.substring(0, 100),
        body_size: bodyString.length,
        body_preview: bodyString.substring(0, 500),
        accessKeyId: requestData.accessKeyId.substring(0, 8) + '***'
      });

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };
      
      // 生成签名并获取完整的headers
      const signedHeaders = signer.sign('POST', url, baseHeaders, bodyString);
      
      console.log('Signed Headers:', Object.keys(signedHeaders));

      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      // 首先获取响应文本
      const responseText = await response.text();
      console.log('Motion Imitation Submit Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText
      });

      // 尝试解析JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }

      console.log('Motion Imitation Submit Parsed Data:', {
        code: data.code,
        message: data.message,
        task_id: data.data?.task_id,
        full_data: data
      });

      if (!response.ok || (data.code && data.code !== 10000)) {
        console.error('Motion Imitation Submit API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Motion Imitation Submit API Success:', {
        status: response.status,
        task_id: data.data?.task_id
      });

      return {
        success: true,
        data: {
          task_id: data.data?.task_id,
          message: data.message,
          ...data.data
        }
      };

    } catch (error) {
      console.error('Motion Imitation Submit API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'MOTION_IMITATION_SUBMIT_ERROR'
        }
      };
    }
  }

  // 动作模仿 API - 查询任务
  async queryMotionImitationTask(requestData) {
    try {
      console.log('API Service: Querying motion imitation task:', requestData.task_id);
      
      // 检查是否提供了AccessKey和SecretKey
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey。请在设置中配置访问密钥。');
      }
      
      const visualBaseURL = 'https://visual.volcengineapi.com';
      const url = `${visualBaseURL}?Action=CVGetResult&Version=2022-08-31`;
      
      const requestBody = {
        req_key: requestData.req_key || 'realman_avatar_imitator_v2v_gen_video',
        task_id: requestData.task_id
      };

      const bodyString = JSON.stringify(requestBody);
      
      console.log('Motion Imitation Query Request:', {
        url: url,
        req_key: requestBody.req_key,
        task_id: requestBody.task_id,
        body_preview: bodyString,
        accessKeyId: requestData.accessKeyId.substring(0, 8) + '***'
      });

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };
      
      // 生成签名并获取完整的headers
      const signedHeaders = signer.sign('POST', url, baseHeaders, bodyString);

      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Motion Imitation Query Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText
      });
      
      // 尝试解析JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }

      console.log('Motion Imitation Query Parsed Data:', {
        code: data.code,
        message: data.message,
        status: data.data?.status,
        has_video_url: !!data.data?.video_url,
        full_data: data
      });

      if (!response.ok || (data.code && data.code !== 10000)) {
        console.error('Motion Imitation Query API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Motion Imitation Query API Success:', {
        status: response.status,
        task_status: data.data?.status,
        has_video: !!data.data?.video_url
      });

      return {
        success: true,
        data: {
          status: data.data?.status,
          video_url: data.data?.video_url,
          message: data.data?.message || data.message,
          ...data.data
        }
      };

    } catch (error) {
      console.error('Motion Imitation Query API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'MOTION_IMITATION_QUERY_ERROR'
        }
      };
    }
  }

  // 即梦动作模仿 API - 提交任务（新版本）
  async submitJimengMotionImitationTask(requestData) {
    try {
      console.log('API Service: Submitting Jimeng motion imitation task');
      
      // 检查是否提供了AccessKey和SecretKey
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey。请在设置中配置访问密钥。');
      }
      
      const visualBaseURL = 'https://visual.volcengineapi.com';
      const url = `${visualBaseURL}?Action=CVSync2AsyncSubmitTask&Version=2022-08-31`;
      
      // 构建请求体 - 新版本接口参数更简洁
      const requestBody = {
        req_key: 'jimeng_dream_actor_m1_gen_video_cv',
        video_url: requestData.video_url,
        image_url: requestData.image_url
      };

      const bodyString = JSON.stringify(requestBody);

      console.log('Jimeng Motion Imitation Request:', {
        url: url,
        req_key: requestBody.req_key,
        has_image: !!requestBody.image_url,
        has_video: !!requestBody.video_url,
        image_url_preview: requestBody.image_url?.substring(0, 100),
        video_url_preview: requestBody.video_url?.substring(0, 100),
        body_size: bodyString.length,
        body_preview: bodyString.substring(0, 500),
        accessKeyId: requestData.accessKeyId.substring(0, 8) + '***'
      });

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };
      
      // 生成签名并获取完整的headers
      const signedHeaders = signer.sign('POST', url, baseHeaders, bodyString);
      
      console.log('Signed Headers:', Object.keys(signedHeaders));

      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      // 首先获取响应文本
      const responseText = await response.text();
      console.log('Jimeng Motion Imitation Submit Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText
      });

      // 尝试解析JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }

      console.log('Jimeng Motion Imitation Submit Parsed Data:', {
        code: data.code,
        message: data.message,
        task_id: data.data?.task_id,
        full_data: data
      });

      if (!response.ok || (data.code && data.code !== 10000)) {
        console.error('Jimeng Motion Imitation Submit API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Jimeng Motion Imitation Submit API Success:', {
        status: response.status,
        task_id: data.data?.task_id
      });

      return {
        success: true,
        data: {
          task_id: data.data?.task_id,
          message: data.message,
          ...data.data
        }
      };

    } catch (error) {
      console.error('Jimeng Motion Imitation Submit API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'JIMENG_MOTION_IMITATION_SUBMIT_ERROR'
        }
      };
    }
  }

  // 即梦动作模仿 API - 查询任务（新版本）
  async queryJimengMotionImitationTask(requestData) {
    try {
      console.log('API Service: Querying Jimeng motion imitation task:', requestData.task_id);
      
      // 检查是否提供了AccessKey和SecretKey
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey。请在设置中配置访问密钥。');
      }
      
      const visualBaseURL = 'https://visual.volcengineapi.com';
      const url = `${visualBaseURL}?Action=CVSync2AsyncGetResult&Version=2022-08-31`;
      
      const requestBody = {
        req_key: 'jimeng_dream_actor_m1_gen_video_cv',
        task_id: requestData.task_id
      };

      const bodyString = JSON.stringify(requestBody);
      
      console.log('Jimeng Motion Imitation Query Request:', {
        url: url,
        req_key: requestBody.req_key,
        task_id: requestBody.task_id,
        body_preview: bodyString,
        accessKeyId: requestData.accessKeyId.substring(0, 8) + '***'
      });

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };
      
      // 生成签名并获取完整的headers
      const signedHeaders = signer.sign('POST', url, baseHeaders, bodyString);

      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Jimeng Motion Imitation Query Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText
      });
      
      // 尝试解析JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }

      console.log('Jimeng Motion Imitation Query Parsed Data:', {
        code: data.code,
        message: data.message,
        status: data.data?.status,
        has_video_url: !!data.data?.video_url,
        full_data: data
      });

      if (!response.ok || (data.code && data.code !== 10000)) {
        console.error('Jimeng Motion Imitation Query API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          requestId: data.request_id,
          fullResponse: data
        });
        
        // 为500错误提供额外信息
        if (response.status === 500 || data.code === 50500) {
          console.warn('⚠️ 500 Internal Error - 可能原因：');
          console.warn('1. 任务刚提交，系统还在初始化');
          console.warn('2. API服务端暂时性故障');
          console.warn('3. 输入参数有问题导致处理失败');
          console.warn('建议：等待1-2分钟后重试，或检查输入URL是否可访问');
        }
        
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Jimeng Motion Imitation Query API Success:', {
        status: response.status,
        task_status: data.data?.status,
        has_video: !!data.data?.video_url
      });

      return {
        success: true,
        data: {
          status: data.data?.status,
          video_url: data.data?.video_url,
          message: data.data?.message || data.message,
          ...data.data
        }
      };

    } catch (error) {
      console.error('Jimeng Motion Imitation Query API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'JIMENG_MOTION_IMITATION_QUERY_ERROR'
        }
      };
    }
  }

  // 上传文件到TOS (对象存储) - 使用官方SDK
  async uploadToTOS(fileData, config) {
    try {
      console.log('API Service: Uploading file to TOS...', {
        fileName: fileData.name,
        fileSize: fileData.size,
        bucket: config.bucket
      });

      // 检查TOS配置
      if (!config.bucket || !config.accessKeyId || !config.secretAccessKey) {
        throw new Error('TOS配置不完整。请在设置中配置 Bucket 名称和访问密钥。');
      }

      // 动态导入TOS SDK
      const { TosClient } = require('@volcengine/tos-sdk');

      // 生成唯一文件名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileExt = fileData.name.split('.').pop();
      // 根据文件类型决定上传目录
      const folder = fileData.type?.startsWith('video/') ? 'video-edit' : 'motion-imitation';
      const objectKey = `${folder}/${timestamp}-${randomStr}.${fileExt}`;

      // 创建TOS客户端
      const region = config.region || 'cn-beijing';
      const client = new TosClient({
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.secretAccessKey,
        region: region,
        endpoint: config.endpoint || `tos-${region}.volces.com`,
        secure: true
      });

      console.log('Uploading to TOS:', {
        bucket: config.bucket,
        objectKey: objectKey,
        region: region
      });

      // 上传文件
      const uploadResult = await client.putObject({
        bucket: config.bucket,
        key: objectKey,
        body: Buffer.from(fileData.buffer),
        contentType: fileData.type || 'application/octet-stream'
      });

      console.log('✅ TOS Upload Result:', {
        statusCode: uploadResult.statusCode,
        requestId: uploadResult.requestId
      });

      if (uploadResult.statusCode !== 200) {
        throw new Error(`上传失败: HTTP ${uploadResult.statusCode}`);
      }

      // 生成预签名URL（24小时有效期，确保后端服务可以访问）
      try {
        const preSignedUrl = await client.getPreSignedUrl({
          bucket: config.bucket,
          key: objectKey,
          expires: 86400 // 24小时
        });
        
        console.log('✅ File uploaded successfully with pre-signed URL');
        
        return {
          success: true,
          url: preSignedUrl,  // 使用预签名URL
          publicUrl: `https://${config.bucket}.tos-${region}.volces.com/${objectKey}`,  // 标准URL
          objectKey: objectKey
        };
      } catch (signError) {
        console.warn('⚠️ Failed to generate pre-signed URL, using standard URL:', signError.message);
        // 如果生成预签名URL失败，回退到标准URL
        const fileUrl = `https://${config.bucket}.tos-${region}.volces.com/${objectKey}`;
        
        console.log('✅ File uploaded successfully:', fileUrl);
        
        return {
          success: true,
          url: fileUrl,
          objectKey: objectKey
        };
      }

    } catch (error) {
      console.error('TOS Upload Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'TOS_UPLOAD_ERROR'
        }
      };
    }
  }

  // 即梦文生图 3.1 - 提交任务
  async submitJimeng31Task(requestData) {
    try {
      console.log('API Service: Submitting Jimeng 3.1 task...');

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      const apiUrl = 'https://visual.volcengineapi.com?Action=CVSync2AsyncSubmitTask&Version=2022-08-31';
      
      // 准备请求体
      const body = {
        req_key: 'jimeng_t2i_v31',
        prompt: requestData.prompt
      };

      // 添加可选参数
      if (requestData.use_pre_llm !== undefined) {
        body.use_pre_llm = requestData.use_pre_llm;
      }
      if (requestData.seed !== undefined && requestData.seed !== -1) {
        body.seed = requestData.seed;
      }
      if (requestData.width && requestData.height) {
        body.width = requestData.width;
        body.height = requestData.height;
      }

      const bodyString = JSON.stringify(body);

      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };

      // 生成签名
      const signedHeaders = signer.sign('POST', apiUrl, baseHeaders, bodyString);

      console.log('Jimeng 3.1 Submit Request:', {
        url: apiUrl,
        prompt: requestData.prompt.substring(0, 50) + '...',
        body_preview: bodyString.substring(0, 200),
        accessKeyId: requestData.accessKeyId.substring(0, 12) + '***'
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Jimeng 3.1 Submit Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 500)
      });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: {
            message: 'API返回了非JSON响应',
            details: responseText.substring(0, 200)
          }
        };
      }

      console.log('Jimeng 3.1 Submit Parsed Data:', {
        code: data.code,
        message: data.message,
        task_id: data.data?.task_id,
        full_data: data
      });

      if (response.status === 200 && data.code === 10000) {
        console.log('Jimeng 3.1 Submit API Success:', {
          status: response.status,
          task_id: data.data?.task_id
        });

        return {
          success: true,
          data: {
            task_id: data.data?.task_id,
            full_response: data
          }
        };
      } else {
        console.error('Jimeng 3.1 Submit API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });

        throw new Error(data.message || `HTTP ${response.status}`);
      }

    } catch (error) {
      console.error('Jimeng 3.1 Submit API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'JIMENG31_SUBMIT_ERROR'
        }
      };
    }
  }

  // 即梦文生图 3.1 - 查询任务
  async queryJimeng31Task(requestData) {
    try {
      console.log('API Service: Querying Jimeng 3.1 task:', requestData.task_id);

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      const apiUrl = 'https://visual.volcengineapi.com?Action=CVSync2AsyncGetResult&Version=2022-08-31';
      
      // 准备请求体
      const body = {
        req_key: 'jimeng_t2i_v31',
        task_id: requestData.task_id
      };

      // 添加可选参数
      if (requestData.req_json) {
        body.req_json = requestData.req_json;
      }

      const bodyString = JSON.stringify(body);

      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };

      // 生成签名
      const signedHeaders = signer.sign('POST', apiUrl, baseHeaders, bodyString);

      console.log('Jimeng 3.1 Query Request:', {
        url: apiUrl,
        task_id: requestData.task_id,
        body_preview: bodyString.substring(0, 200),
        accessKeyId: requestData.accessKeyId.substring(0, 12) + '***'
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Jimeng 3.1 Query Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 500)
      });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: {
            message: 'API返回了非JSON响应',
            details: responseText.substring(0, 200)
          }
        };
      }

      console.log('Jimeng 3.1 Query Parsed Data:', {
        code: data.code,
        message: data.message,
        status: data.data?.status,
        has_images: !!(data.data?.image_urls || data.data?.binary_data_base64),
        full_data: data
      });

      if (response.status === 200 && data.code === 10000) {
        console.log('Jimeng 3.1 Query API Success:', {
          status: response.status,
          task_status: data.data?.status,
          has_images: !!(data.data?.image_urls || data.data?.binary_data_base64)
        });

        return {
          success: true,
          data: {
            status: data.data?.status,
            image_urls: data.data?.image_urls,
            binary_data_base64: data.data?.binary_data_base64,
            full_response: data
          }
        };
      } else {
        console.error('Jimeng 3.1 Query API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });

        return {
          success: false,
          error: {
            message: data.message || `HTTP ${response.status}`,
            code: data.code,
            task_status: data.data?.status
          }
        };
      }

    } catch (error) {
      console.error('Jimeng 3.1 Query API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'JIMENG31_QUERY_ERROR'
        }
      };
    }
  }

  // 即梦AI 4.0 - 提交任务
  async submitJimeng40Task(requestData) {
    try {
      console.log('API Service: Submitting Jimeng 4.0 task...');

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      const apiUrl = 'https://visual.volcengineapi.com?Action=CVSync2AsyncSubmitTask&Version=2022-08-31';
      
      // 准备请求体
      const body = {
        req_key: 'jimeng_t2i_v40',
        prompt: requestData.prompt
      };

      // 添加可选参数
      if (requestData.image_urls && requestData.image_urls.length > 0) {
        body.image_urls = requestData.image_urls;
      }
      if (requestData.size) {
        body.size = requestData.size;
      }
      if (requestData.width && requestData.height) {
        body.width = requestData.width;
        body.height = requestData.height;
      }
      if (requestData.scale !== undefined) {
        body.scale = requestData.scale;
      }
      if (requestData.force_single !== undefined) {
        body.force_single = requestData.force_single;
      }
      if (requestData.min_ratio) {
        body.min_ratio = requestData.min_ratio;
      }
      if (requestData.max_ratio) {
        body.max_ratio = requestData.max_ratio;
      }

      const bodyString = JSON.stringify(body);

      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };

      // 生成签名
      const signedHeaders = signer.sign('POST', apiUrl, baseHeaders, bodyString);

      console.log('Jimeng 4.0 Submit Request:', {
        url: apiUrl,
        prompt: requestData.prompt.substring(0, 50) + '...',
        body_preview: bodyString.substring(0, 200),
        accessKeyId: requestData.accessKeyId.substring(0, 12) + '***'
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Jimeng 4.0 Submit Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 500)
      });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: {
            message: 'API返回了非JSON响应',
            details: responseText.substring(0, 200)
          }
        };
      }

      console.log('Jimeng 4.0 Submit Parsed Data:', {
        code: data.code,
        message: data.message,
        task_id: data.data?.task_id,
        full_data: data
      });

      if (response.status === 200 && data.code === 10000) {
        console.log('Jimeng 4.0 Submit API Success:', {
          status: response.status,
          task_id: data.data?.task_id
        });

        return {
          success: true,
          data: {
            task_id: data.data?.task_id,
            full_response: data
          }
        };
      } else {
        console.error('Jimeng 4.0 Submit API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });

        throw new Error(data.message || `HTTP ${response.status}`);
      }

    } catch (error) {
      console.error('Jimeng 4.0 Submit API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'JIMENG40_SUBMIT_ERROR'
        }
      };
    }
  }

  // 即梦AI 4.0 - 查询任务
  async queryJimeng40Task(requestData) {
    try {
      console.log('API Service: Querying Jimeng 4.0 task:', requestData.task_id);

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      const apiUrl = 'https://visual.volcengineapi.com?Action=CVSync2AsyncGetResult&Version=2022-08-31';
      
      // 准备请求体
      const body = {
        req_key: 'jimeng_t2i_v40',
        task_id: requestData.task_id
      };

      // 添加可选参数
      if (requestData.req_json) {
        body.req_json = requestData.req_json;
      }

      const bodyString = JSON.stringify(body);

      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };

      // 生成签名
      const signedHeaders = signer.sign('POST', apiUrl, baseHeaders, bodyString);

      console.log('Jimeng 4.0 Query Request:', {
        url: apiUrl,
        task_id: requestData.task_id,
        body_preview: bodyString.substring(0, 200),
        accessKeyId: requestData.accessKeyId.substring(0, 12) + '***'
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Jimeng 4.0 Query Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 500)
      });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: {
            message: 'API返回了非JSON响应',
            details: responseText.substring(0, 200)
          }
        };
      }

      console.log('Jimeng 4.0 Query Parsed Data:', {
        code: data.code,
        message: data.message,
        status: data.data?.status,
        has_images: !!(data.data?.image_urls || data.data?.binary_data_base64),
        full_data: data
      });

      if (response.status === 200 && data.code === 10000) {
        console.log('Jimeng 4.0 Query API Success:', {
          status: response.status,
          task_status: data.data?.status,
          has_images: !!(data.data?.image_urls || data.data?.binary_data_base64)
        });

        return {
          success: true,
          data: {
            status: data.data?.status,
            image_urls: data.data?.image_urls,
            binary_data_base64: data.data?.binary_data_base64,
            full_response: data
          }
        };
      } else {
        console.error('Jimeng 4.0 Query API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });

        return {
          success: false,
          error: {
            message: data.message || `HTTP ${response.status}`,
            code: data.code,
            task_status: data.data?.status
          }
        };
      }

    } catch (error) {
      console.error('Jimeng 4.0 Query API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'JIMENG40_QUERY_ERROR'
        }
      };
    }
  }

  // 即梦AI 视频生成 3.0 Pro - 提交任务
  async submitJimeng30ProVideoTask(requestData) {
    try {
      console.log('API Service: Submitting Jimeng 3.0 Pro video task...');

      // 检查是否提供了AccessKey和SecretKey
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey。请在设置中配置访问密钥。');
      }

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      const apiUrl = 'https://visual.volcengineapi.com?Action=CVSync2AsyncSubmitTask&Version=2022-08-31';
      
      // 准备请求体
      const body = {
        req_key: 'jimeng_ti2v_v30_pro'
      };

      // 添加必需和可选参数
      if (requestData.prompt) {
        body.prompt = requestData.prompt;
      }
      if (requestData.binary_data_base64 && requestData.binary_data_base64.length > 0) {
        body.binary_data_base64 = requestData.binary_data_base64;
      }
      if (requestData.image_urls && requestData.image_urls.length > 0) {
        body.image_urls = requestData.image_urls;
      }
      if (requestData.seed !== undefined && requestData.seed !== -1) {
        body.seed = requestData.seed;
      }
      if (requestData.frames) {
        body.frames = requestData.frames;
      }
      if (requestData.aspect_ratio) {
        body.aspect_ratio = requestData.aspect_ratio;
      }

      const bodyString = JSON.stringify(body);

      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };

      // 生成签名
      const signedHeaders = signer.sign('POST', apiUrl, baseHeaders, bodyString);

      console.log('Jimeng 3.0 Pro Submit Request:', {
        url: apiUrl,
        prompt: requestData.prompt?.substring(0, 50) + '...',
        has_image: !!(requestData.binary_data_base64 || requestData.image_urls),
        frames: requestData.frames,
        aspect_ratio: requestData.aspect_ratio,
        body_preview: bodyString.substring(0, 300),
        accessKeyId: requestData.accessKeyId.substring(0, 12) + '***'
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Jimeng 3.0 Pro Submit Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 500)
      });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }

      console.log('Jimeng 3.0 Pro Submit Parsed Data:', {
        code: data.code,
        message: data.message,
        task_id: data.data?.task_id,
        full_data: data
      });

      if (!response.ok || (data.code && data.code !== 10000)) {
        console.error('Jimeng 3.0 Pro Submit API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Jimeng 3.0 Pro Submit API Success:', {
        status: response.status,
        task_id: data.data?.task_id
      });

      return {
        success: true,
        data: {
          task_id: data.data?.task_id,
          message: data.message,
          ...data.data
        }
      };

    } catch (error) {
      console.error('Jimeng 3.0 Pro Submit API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'JIMENG30PRO_SUBMIT_ERROR'
        }
      };
    }
  }

  // 即梦AI 视频生成 3.0 Pro - 查询任务
  async queryJimeng30ProVideoTask(requestData) {
    try {
      console.log('API Service: Querying Jimeng 3.0 Pro video task:', requestData.task_id);

      // 检查是否提供了AccessKey和SecretKey
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey。请在设置中配置访问密钥。');
      }

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      const apiUrl = 'https://visual.volcengineapi.com?Action=CVSync2AsyncGetResult&Version=2022-08-31';
      
      // 准备请求体
      const body = {
        req_key: 'jimeng_ti2v_v30_pro',
        task_id: requestData.task_id
      };

      const bodyString = JSON.stringify(body);

      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };

      // 生成签名
      const signedHeaders = signer.sign('POST', apiUrl, baseHeaders, bodyString);

      console.log('Jimeng 3.0 Pro Query Request:', {
        url: apiUrl,
        task_id: requestData.task_id,
        body_preview: bodyString,
        accessKeyId: requestData.accessKeyId.substring(0, 12) + '***'
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Jimeng 3.0 Pro Query Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 500)
      });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }

      console.log('Jimeng 3.0 Pro Query Parsed Data:', {
        code: data.code,
        message: data.message,
        status: data.data?.status,
        has_video: !!data.data?.video_url,
        full_data: data
      });

      if (!response.ok || (data.code && data.code !== 10000)) {
        console.error('Jimeng 3.0 Pro Query API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Jimeng 3.0 Pro Query API Success:', {
        status: response.status,
        task_status: data.data?.status,
        has_video: !!data.data?.video_url
      });

      return {
        success: true,
        data: {
          status: data.data?.status,
          video_url: data.data?.video_url,
          message: data.data?.message || data.message,
          ...data.data
        }
      };

    } catch (error) {
      console.error('Jimeng 3.0 Pro Query API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'JIMENG30PRO_QUERY_ERROR'
        }
      };
    }
  }

  // 即梦图生图3.0智能参考 - 提交任务
  async submitJimengI2I30Task(requestData) {
    try {
      console.log('API Service: Submitting Jimeng I2I 3.0 task...');

      // 检查是否提供了AccessKey和SecretKey
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey。请在设置中配置访问密钥。');
      }

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      const apiUrl = 'https://visual.volcengineapi.com?Action=CVSync2AsyncSubmitTask&Version=2022-08-31';
      
      // 准备请求体
      const body = {
        req_key: 'jimeng_i2i_v30',
        prompt: requestData.prompt
      };

      // 添加图片输入（二选一）
      if (requestData.binary_data_base64 && requestData.binary_data_base64.length > 0) {
        body.binary_data_base64 = requestData.binary_data_base64;
      } else if (requestData.image_urls && requestData.image_urls.length > 0) {
        body.image_urls = requestData.image_urls;
      } else {
        throw new Error('必须提供图片输入（binary_data_base64 或 image_urls）');
      }

      // 添加可选参数
      if (requestData.seed !== undefined && requestData.seed !== -1) {
        body.seed = requestData.seed;
      }
      if (requestData.scale !== undefined) {
        body.scale = requestData.scale;
      }
      if (requestData.width && requestData.height) {
        body.width = requestData.width;
        body.height = requestData.height;
      }

      const bodyString = JSON.stringify(body);

      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };

      // 生成签名
      const signedHeaders = signer.sign('POST', apiUrl, baseHeaders, bodyString);

      console.log('Jimeng I2I 3.0 Submit Request:', {
        url: apiUrl,
        prompt: requestData.prompt?.substring(0, 50) + '...',
        has_image: !!(requestData.binary_data_base64 || requestData.image_urls),
        scale: requestData.scale,
        body_preview: bodyString.substring(0, 300),
        accessKeyId: requestData.accessKeyId.substring(0, 12) + '***'
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Jimeng I2I 3.0 Submit Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 500)
      });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }

      console.log('Jimeng I2I 3.0 Submit Parsed Data:', {
        code: data.code,
        message: data.message,
        task_id: data.data?.task_id,
        full_data: data
      });

      if (!response.ok || (data.code && data.code !== 10000)) {
        console.error('Jimeng I2I 3.0 Submit API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Jimeng I2I 3.0 Submit API Success:', {
        status: response.status,
        task_id: data.data?.task_id
      });

      return {
        success: true,
        data: {
          task_id: data.data?.task_id,
          message: data.message,
          ...data.data
        }
      };

    } catch (error) {
      console.error('Jimeng I2I 3.0 Submit API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'Jimengi2I30_SUBMIT_ERROR'
        }
      };
    }
  }

  // 即梦图生图3.0智能参考 - 查询任务
  async queryJimengI2I30Task(requestData) {
    try {
      console.log('API Service: Querying Jimeng I2I 3.0 task:', requestData.task_id);

      // 检查是否提供了AccessKey和SecretKey
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey。请在设置中配置访问密钥。');
      }

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      const apiUrl = 'https://visual.volcengineapi.com?Action=CVSync2AsyncGetResult&Version=2022-08-31';
      
      // 准备请求体
      const body = {
        req_key: 'jimeng_i2i_v30',
        task_id: requestData.task_id
      };

      // 添加可选参数
      if (requestData.req_json) {
        body.req_json = requestData.req_json;
      }

      const bodyString = JSON.stringify(body);

      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };

      // 生成签名
      const signedHeaders = signer.sign('POST', apiUrl, baseHeaders, bodyString);

      console.log('Jimeng I2I 3.0 Query Request:', {
        url: apiUrl,
        task_id: requestData.task_id,
        body_preview: bodyString,
        accessKeyId: requestData.accessKeyId.substring(0, 12) + '***'
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Jimeng I2I 3.0 Query Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 500)
      });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }

      console.log('Jimeng I2I 3.0 Query Parsed Data:', {
        code: data.code,
        message: data.message,
        status: data.data?.status,
        has_images: !!(data.data?.image_urls || data.data?.binary_data_base64),
        full_data: data
      });

      if (!response.ok || (data.code && data.code !== 10000)) {
        console.error('Jimeng I2I 3.0 Query API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Jimeng I2I 3.0 Query API Success:', {
        status: response.status,
        task_status: data.data?.status,
        has_images: !!(data.data?.image_urls || data.data?.binary_data_base64)
      });

      return {
        success: true,
        data: {
          status: data.data?.status,
          image_urls: data.data?.image_urls,
          binary_data_base64: data.data?.binary_data_base64,
          message: data.data?.message || data.message,
          ...data.data
        }
      };

    } catch (error) {
      console.error('Jimeng I2I 3.0 Query API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'JИМЕНGI2I30_QUERY_ERROR'
        }
      };
    }
  }

  // 图像向量化 API
  async imageEmbedding(requestData) {
    try {
      console.log('API Service: Creating image embedding...');

      // 检查必需的参数
      if (!requestData.apiKey) {
        throw new Error('需要提供 API Key。请在设置中配置 API Key。');
      }

      if (!requestData.input || requestData.input.length === 0) {
        throw new Error('需要提供输入内容（图片、视频或文本）');
      }

      const response = await fetch(`${this.baseURL}/api/v3/embeddings/multimodal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${requestData.apiKey}`
        },
        body: JSON.stringify({
          model: requestData.model || 'doubao-embedding-vision-250615',
          input: requestData.input,
          encoding_format: requestData.encoding_format || 'float',
          dimensions: requestData.dimensions || 2048
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Image Embedding API Error:', response.status, data);
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Image Embedding API Success:', {
        status: response.status,
        embedding_length: data.data?.embedding?.length,
        tokens_used: data.usage?.total_tokens
      });

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Image Embedding API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'IMAGE_EMBEDDING_ERROR'
        }
      };
    }
  }

  // TOS - 生成预签名 URL (使用官方SDK)
  async getTosPreSignedUrl(requestData) {
    try {
      console.log('API Service: Generating TOS pre-signed URL using official SDK...');

      // 检查必需参数
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey');
      }

      if (!requestData.tosUrl) {
        throw new Error('需要提供 TOS URL');
      }

      // 解析 TOS URL: tos://bucket/object_key
      const tosUrlPattern = /^tos:\/\/([^/]+)\/(.+)$/;
      const match = requestData.tosUrl.match(tosUrlPattern);
      
      if (!match) {
        throw new Error('无效的 TOS URL 格式，正确格式：tos://bucket/object_key');
      }

      const [, bucket, objectKey] = match;
      
      // TOS 配置
      const region = requestData.region || 'cn-beijing';
      const expiresIn = requestData.expiresIn || 3600; // 默认1小时有效期

      console.log('TOS Pre-signed URL Request:', {
        bucket,
        objectKey: objectKey.substring(0, 50),
        region,
        expiresIn
      });

      // 使用官方 SDK 生成预签名 URL
      const { TosClient } = require('@volcengine/tos-sdk');
      
      const client = new TosClient({
        accessKeyId: requestData.accessKeyId,
        accessKeySecret: requestData.secretAccessKey,
        region: region,
        bucket: bucket
      });

      // 生成预签名 URL
      const signedUrl = await client.getPreSignedUrl({
        bucket: bucket,
        key: objectKey,
        expires: expiresIn,
        method: 'GET'
      });

      console.log('✅ TOS Pre-signed URL generated successfully using SDK');
      console.log('🔗 Signed URL:', signedUrl.substring(0, 100) + '...');

      return {
        success: true,
        data: {
          url: signedUrl,
          bucket,
          objectKey,
          expiresIn
        }
      };

    } catch (error) {
      console.error('TOS Pre-signed URL Error:', error.message);
      console.error('Error details:', error);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'TOS_URL_ERROR'
        }
      };
    }
  }

  // 向量数据库 - 多模态检索
  async searchByMultiModal(requestData) {
    try {
      console.log('API Service: Multi-modal search...');

      // 检查是否提供了AccessKey和SecretKey
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey。请在设置中配置访问密钥。');
      }

      // 使用签名V4生成签名（VikingDB使用特定的service和region）
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey, {
        service: 'vikingdb',
        region: 'cn-beijing'
      });
      
      const apiUrl = 'https://api-vikingdb.vikingdb.cn-beijing.volces.com/api/vikingdb/data/search/multi_modal';
      
      // 准备请求体
      const body = {
        collection_name: requestData.collection_name,
        index_name: requestData.index_name,
        limit: requestData.limit || 10
      };

      // 添加检索内容
      if (requestData.text) {
        body.text = requestData.text;
        // 文本检索时需要设置 need_instruction
        body.need_instruction = requestData.need_instruction !== undefined ? requestData.need_instruction : false;
      }
      if (requestData.image) {
        body.image = requestData.image;
      }
      if (requestData.video) {
        body.video = requestData.video;
      }

      // 添加可选参数
      if (requestData.output_fields) {
        body.output_fields = requestData.output_fields;
      }

      const bodyString = JSON.stringify(body);

      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };

      // 生成签名
      const signedHeaders = signer.sign('POST', apiUrl, baseHeaders, bodyString);

      console.log('Multi-modal Search Request:', {
        url: apiUrl,
        collection: body.collection_name,
        index: body.index_name,
        has_text: !!body.text,
        has_image: !!body.image,
        has_video: !!body.video,
        body_preview: bodyString.substring(0, 300),
        accessKeyId: requestData.accessKeyId.substring(0, 12) + '***'
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Multi-modal Search Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 500)
      });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }

      console.log('Multi-modal Search Parsed Data:', {
        code: data.code,
        message: data.message,
        total_results: data.result?.total_return_count,
        full_data: data
      });

      if (data.code !== 'Success' && response.status !== 200) {
        console.error('Multi-modal Search API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Multi-modal Search API Success:', {
        status: response.status,
        total_results: data.result?.total_return_count
      });

      return {
        success: true,
        data: {
          data: data.result?.data || [],
          total_return_count: data.result?.total_return_count || 0,
          real_text_query: data.result?.real_text_query,
          token_usage: data.result?.token_usage,
          request_id: data.request_id
        }
      };

    } catch (error) {
      console.error('Multi-modal Search API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'MULTIMODAL_SEARCH_ERROR'
        }
      };
    }
  }

  // 向量数据库 - 数据写入
  async upsertVectorData(requestData) {
    try {
      console.log('API Service: Upsert vector data...');

      // 检查是否提供了AccessKey和SecretKey
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey。请在设置中配置访问密钥。');
      }

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey, {
        service: 'air',
        region: 'cn-beijing'
      });
      
      const apiUrl = 'https://api-vikingdb.volces.com/api/vikingdb/data/upsert';
      
      // 准备请求体
      const body = {
        collection_name: requestData.collection_name,
        data: requestData.data
      };

      // 添加可选参数
      if (requestData.ttl) {
        body.ttl = requestData.ttl;
      }
      if (requestData.async !== undefined) {
        body.async = requestData.async;
      }

      const bodyString = JSON.stringify(body);

      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };

      // 生成签名
      const signedHeaders = signer.sign('POST', apiUrl, baseHeaders, bodyString);

      console.log('Upsert Vector Data Request:', {
        url: apiUrl,
        collection: body.collection_name,
        data_count: body.data.length,
        body_preview: bodyString.substring(0, 300),
        accessKeyId: requestData.accessKeyId.substring(0, 12) + '***'
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Upsert Vector Data Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 500)
      });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }

      console.log('Upsert Vector Data Parsed Data:', {
        code: data.code,
        message: data.message,
        full_data: data
      });

      if (data.code !== 'Success' && response.status !== 200) {
        console.error('Upsert Vector Data API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Upsert Vector Data API Success:', {
        status: response.status,
        token_usage: data.result?.token_usage
      });

      return {
        success: true,
        data: {
          token_usage: data.result?.token_usage,
          request_id: data.request_id
        }
      };

    } catch (error) {
      console.error('Upsert Vector Data API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'UPSERT_VECTOR_DATA_ERROR'
        }
      };
    }
  }

  // 向量数据库 - 向量化计算(Embedding)
  async computeEmbedding(requestData) {
    try {
      console.log('API Service: Compute embedding...');

      // 检查是否提供了AccessKey和SecretKey
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey。请在设置中配置访问密钥。');
      }

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey, {
        service: 'air',
        region: 'cn-beijing'
      });
      
      const apiUrl = 'https://api-vikingdb.volces.com/api/vikingdb/embedding';
      
      // 准备请求体
      const body = {
        data: requestData.data
      };

      // 添加模型配置
      if (requestData.dense_model) {
        body.dense_model = requestData.dense_model;
      }
      if (requestData.sparse_model) {
        body.sparse_model = requestData.sparse_model;
      }

      const bodyString = JSON.stringify(body);

      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };

      // 生成签名
      const signedHeaders = signer.sign('POST', apiUrl, baseHeaders, bodyString);

      console.log('Compute Embedding Request:', {
        url: apiUrl,
        data_count: body.data.length,
        has_dense_model: !!body.dense_model,
        has_sparse_model: !!body.sparse_model,
        body_preview: bodyString.substring(0, 300),
        accessKeyId: requestData.accessKeyId.substring(0, 12) + '***'
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      
      console.log('Compute Embedding Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 500)
      });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }

      console.log('Compute Embedding Parsed Data:', {
        code: data.code,
        message: data.message,
        data_count: data.result?.data?.length,
        full_data: data
      });

      if (data.code !== 'Success' && response.status !== 200) {
        console.error('Compute Embedding API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Compute Embedding API Success:', {
        status: response.status,
        data_count: data.result?.data?.length,
        token_usage: data.result?.token_usage
      });

      return {
        success: true,
        data: {
          data: data.result?.data || [],
          token_usage: data.result?.token_usage,
          request_id: data.request_id
        }
      };

    } catch (error) {
      console.error('Compute Embedding API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'COMPUTE_EMBEDDING_ERROR'
        }
      };
    }
  }
  // OmniHuman1.5 - 步骤1：主体识别
  async submitOmniHumanIdentifyTask(requestData) {
    try {
      console.log('API Service: Submitting OmniHuman identify task');
      
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey');
      }
      
      const visualBaseURL = 'https://visual.volcengineapi.com';
      const url = `${visualBaseURL}?Action=CVSubmitTask&Version=2022-08-31`;
      
      const requestBody = {
        req_key: 'jimeng_realman_avatar_picture_create_role_omni_v15',
        image_url: requestData.image_url
      };

      const bodyString = JSON.stringify(requestBody);
      
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      const baseHeaders = { 'Content-Type': 'application/json' };
      const signedHeaders = signer.sign('POST', url, baseHeaders, bodyString);

      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      console.log('OmniHuman Identify Submit Response:', responseText.substring(0, 200));

      const data = JSON.parse(responseText);

      if (!response.ok || (data.code && data.code !== 10000)) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: {
          task_id: data.data?.task_id,
          ...data.data
        }
      };
    } catch (error) {
      console.error('OmniHuman Identify Submit Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'OMNIHUMAN_IDENTIFY_ERROR'
        }
      };
    }
  }

  // OmniHuman1.5 - 步骤1：查询主体识别结果
  async queryOmniHumanIdentifyTask(requestData) {
    try {
      console.log('API Service: Querying OmniHuman identify task:', requestData.task_id);
      
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey');
      }
      
      const visualBaseURL = 'https://visual.volcengineapi.com';
      const url = `${visualBaseURL}?Action=CVGetResult&Version=2022-08-31`;
      
      const requestBody = {
        req_key: 'jimeng_realman_avatar_picture_create_role_omni_v15',
        task_id: requestData.task_id
      };

      const bodyString = JSON.stringify(requestBody);
      
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      const baseHeaders = { 'Content-Type': 'application/json' };
      const signedHeaders = signer.sign('POST', url, baseHeaders, bodyString);

      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (!response.ok || (data.code && data.code !== 10000)) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      // 解析resp_data中的status
      let hasSubject = false;
      if (data.data?.resp_data) {
        try {
          const respData = JSON.parse(data.data.resp_data);
          hasSubject = respData.status === 1;
        } catch (e) {
          console.warn('Failed to parse resp_data:', e);
        }
      }

      return {
        success: true,
        data: {
          status: data.data?.status,
          has_subject: hasSubject,
          resp_data: data.data?.resp_data,
          ...data.data
        }
      };
    } catch (error) {
      console.error('OmniHuman Identify Query Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'OMNIHUMAN_IDENTIFY_QUERY_ERROR'
        }
      };
    }
  }

  // OmniHuman1.5 - 步骤2：主体检测（同步接口）
  async detectOmniHumanSubject(requestData) {
    try {
      console.log('API Service: Detecting OmniHuman subject');
      
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey');
      }
      
      const visualBaseURL = 'https://visual.volcengineapi.com';
      const url = `${visualBaseURL}?Action=CVProcess&Version=2022-08-31`;
      
      const requestBody = {
        req_key: 'jimeng_realman_avatar_object_detection',
        image_url: requestData.image_url
      };

      const bodyString = JSON.stringify(requestBody);
      
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      const baseHeaders = { 'Content-Type': 'application/json' };
      const signedHeaders = signer.sign('POST', url, baseHeaders, bodyString);

      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      console.log('OmniHuman Detect Response:', responseText.substring(0, 200));

      const data = JSON.parse(responseText);

      if (!response.ok || (data.code && data.code !== 10000)) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      // 解析resp_data获取mask URLs
      let maskUrls = [];
      if (data.data?.resp_data) {
        try {
          const respData = JSON.parse(data.data.resp_data);
          if (respData.object_detection_result?.mask?.url) {
            maskUrls = respData.object_detection_result.mask.url;
          }
        } catch (e) {
          console.warn('Failed to parse resp_data:', e);
        }
      }

      return {
        success: true,
        data: {
          mask_urls: maskUrls,
          resp_data: data.data?.resp_data,
          ...data.data
        }
      };
    } catch (error) {
      console.error('OmniHuman Detect Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'OMNIHUMAN_DETECT_ERROR'
        }
      };
    }
  }

  // OmniHuman1.5 - 步骤3：提交视频生成任务
  async submitOmniHumanVideoTask(requestData) {
    try {
      console.log('API Service: Submitting OmniHuman video task');
      
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey');
      }
      
      const visualBaseURL = 'https://visual.volcengineapi.com';
      const url = `${visualBaseURL}?Action=CVSubmitTask&Version=2022-08-31`;
      
      const requestBody = {
        req_key: 'jimeng_realman_avatar_picture_omni_v15',
        image_url: requestData.image_url,
        audio_url: requestData.audio_url
      };

      // 可选参数
      if (requestData.mask_url && requestData.mask_url.length > 0) {
        requestBody.mask_url = requestData.mask_url;
      }
      if (requestData.seed !== undefined && requestData.seed !== -1) {
        requestBody.seed = requestData.seed;
      }
      if (requestData.prompt) {
        requestBody.prompt = requestData.prompt;
      }
      if (requestData.pe_fast_mode !== undefined) {
        requestBody.pe_fast_mode = requestData.pe_fast_mode;
      }

      const bodyString = JSON.stringify(requestBody);
      
      console.log('OmniHuman Video Request:', {
        has_image: !!requestBody.image_url,
        has_audio: !!requestBody.audio_url,
        has_mask: !!requestBody.mask_url,
        has_prompt: !!requestBody.prompt
      });
      
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      const baseHeaders = { 'Content-Type': 'application/json' };
      const signedHeaders = signer.sign('POST', url, baseHeaders, bodyString);

      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      console.log('OmniHuman Video Submit Response:', responseText.substring(0, 200));

      const data = JSON.parse(responseText);

      if (!response.ok || (data.code && data.code !== 10000)) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: {
          task_id: data.data?.task_id,
          ...data.data
        }
      };
    } catch (error) {
      console.error('OmniHuman Video Submit Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'OMNIHUMAN_VIDEO_ERROR'
        }
      };
    }
  }

  // OmniHuman1.5 - 步骤3：查询视频生成结果
  async queryOmniHumanVideoTask(requestData) {
    try {
      console.log('API Service: Querying OmniHuman video task:', requestData.task_id);
      
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey');
      }
      
      const visualBaseURL = 'https://visual.volcengineapi.com';
      const url = `${visualBaseURL}?Action=CVGetResult&Version=2022-08-31`;
      
      const requestBody = {
        req_key: 'jimeng_realman_avatar_picture_omni_v15',
        task_id: requestData.task_id
      };

      const bodyString = JSON.stringify(requestBody);
      
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      const baseHeaders = { 'Content-Type': 'application/json' };
      const signedHeaders = signer.sign('POST', url, baseHeaders, bodyString);

      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      console.log('OmniHuman Video Query Result:', {
        status: data.data?.status,
        has_video: !!data.data?.video_url
      });

      if (!response.ok || (data.code && data.code !== 10000)) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: {
          status: data.data?.status,
          video_url: data.data?.video_url,
          ...data.data
        }
      };
    } catch (error) {
      console.error('OmniHuman Video Query Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'OMNIHUMAN_VIDEO_QUERY_ERROR'
        }
      };
    }
  }

  // Inpainting涂抹编辑 API - 同步接口
  async submitInpaintingTask(requestData) {
    try {
      console.log('API Service: Submitting Inpainting task');
      
      // 检查是否提供了AccessKey和SecretKey
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey。请在设置中配置访问密钥。');
      }
      
      const visualBaseURL = 'https://visual.volcengineapi.com';
      const url = `${visualBaseURL}?Action=CVProcess&Version=2022-08-31`;
      
      // 构建请求体
      const requestBody = {
        req_key: 'img2img_inpainting_edit_zi2i',
        custom_prompt: requestData.custom_prompt,
        scale: requestData.scale || 5,
        seed: requestData.seed !== undefined ? requestData.seed : -1,
        steps: requestData.steps || 25
      };

      // 添加图片输入（二选一）
      if (requestData.binary_data_base64 && requestData.binary_data_base64.length > 0) {
        requestBody.binary_data_base64 = requestData.binary_data_base64;
      } else if (requestData.image_urls && requestData.image_urls.length > 0) {
        requestBody.image_urls = requestData.image_urls;
      } else {
        throw new Error('必须提供图片输入（binary_data_base64 或 image_urls）');
      }

      // 添加可选参数
      if (requestData.return_url !== undefined) {
        requestBody.return_url = requestData.return_url;
      }

      const bodyString = JSON.stringify(requestBody);

      console.log('Inpainting Request:', {
        url: url,
        req_key: requestBody.req_key,
        has_binary_data: !!requestBody.binary_data_base64,
        has_image_urls: !!requestBody.image_urls,
        prompt: requestBody.custom_prompt,
        body_size: bodyString.length,
        accessKeyId: requestData.accessKeyId.substring(0, 8) + '***'
      });

      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      
      // 准备基础headers
      const baseHeaders = {
        'Content-Type': 'application/json'
      };
      
      // 生成签名并获取完整的headers
      const signedHeaders = signer.sign('POST', url, baseHeaders, bodyString);
      
      console.log('Signed Headers:', Object.keys(signedHeaders));

      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });

      // 首先获取响应文本
      const responseText = await response.text();
      console.log('Inpainting Submit Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 500)
      });

      // 尝试解析JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }

      console.log('Inpainting Submit Parsed Data:', {
        code: data.code,
        message: data.message,
        has_images: !!(data.data?.image_urls || data.data?.binary_data_base64),
        full_data: data
      });

      if (!response.ok || (data.code && data.code !== 10000)) {
        console.error('Inpainting Submit API Error:', {
          httpStatus: response.status,
          responseCode: data.code,
          message: data.message,
          fullResponse: data
        });
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Inpainting Submit API Success:', {
        status: response.status,
        has_images: !!(data.data?.image_urls || data.data?.binary_data_base64)
      });

      return {
        success: true,
        data: {
          image_urls: data.data?.image_urls,
          binary_data_base64: data.data?.binary_data_base64,
          request_id: data.data?.request_id,
          message: data.message,
          ...data.data
        }
      };

    } catch (error) {
      console.error('Inpainting Submit API Service Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'INPAINTING_SUBMIT_ERROR'
        }
      };
    }
  }

  // ===== 视频编辑 API =====
  
  /**
   * 提交视频编辑任务
   * @param {Object} requestData - 请求数据
   * @param {string} requestData.accessKeyId - AccessKeyId
   * @param {string} requestData.secretAccessKey - SecretAccessKey
   * @param {string} requestData.prompt - 编辑指令文本
   * @param {string} requestData.video_url - 视频URL
   * @param {number} [requestData.seed] - 随机种子，默认-1
   * @param {number} [requestData.max_frame] - 输出视频最大帧数，默认121
   */
  async submitVideoEditTask(requestData) {
    try {
      console.log('API Service: Submitting Video Edit task');
      
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey');
      }
      
      const visualBaseURL = 'https://visual.volcengineapi.com';
      const url = `${visualBaseURL}?Action=CVSync2AsyncSubmitTask&Version=2022-08-31`;
      
      // 构建请求体
      const requestBody = {
        req_key: 'dm_seedance_videoedit_tob',
        prompt: requestData.prompt,
        video_url: requestData.video_url
      };
      
      // 添加可选参数
      if (requestData.seed !== undefined) {
        requestBody.seed = requestData.seed;
      }
      if (requestData.max_frame !== undefined) {
        requestBody.max_frame = requestData.max_frame;
      }
      
      const bodyString = JSON.stringify(requestBody);
      
      console.log('Video Edit Submit Request:', {
        url: url,
        prompt: requestData.prompt.substring(0, 50) + '...',
        video_url: requestData.video_url,
        seed: requestBody.seed,
        max_frame: requestBody.max_frame,
        accessKeyId: requestData.accessKeyId.substring(0, 8) + '***'
      });
      
      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      const baseHeaders = { 'Content-Type': 'application/json' };
      const signedHeaders = signer.sign('POST', url, baseHeaders, bodyString);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });
      
      const responseText = await response.text();
      console.log('Video Edit Submit Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 200)
      });
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }
      
      console.log('Video Edit Submit Parsed Data:', {
        code: data.code,
        message: data.message,
        task_id: data.data?.task_id,
        full_data: data
      });
      
      if (!response.ok || (data.code && data.code !== 10000)) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('Video Edit Submit API Success:', {
        status: response.status,
        task_id: data.data?.task_id
      });
      
      return {
        success: true,
        data: {
          task_id: data.data?.task_id,
          ...data.data
        }
      };
      
    } catch (error) {
      console.error('Video Edit Submit Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'VIDEO_EDIT_SUBMIT_ERROR'
        }
      };
    }
  }
  
  /**
   * 查询视频编辑任务结果
   * @param {Object} requestData - 请求数据
   * @param {string} requestData.accessKeyId - AccessKeyId
   * @param {string} requestData.secretAccessKey - SecretAccessKey
   * @param {string} requestData.task_id - 任务ID
   */
  async queryVideoEditTask(requestData) {
    try {
      console.log('API Service: Querying Video Edit task:', requestData.task_id);
      
      if (!requestData.accessKeyId || !requestData.secretAccessKey) {
        throw new Error('需要提供 AccessKeyId 和 SecretAccessKey');
      }
      
      const visualBaseURL = 'https://visual.volcengineapi.com';
      const url = `${visualBaseURL}?Action=CVSync2AsyncGetResult&Version=2022-08-31`;
      
      // 构建请求体
      const requestBody = {
        req_key: 'dm_seedance_videoedit_tob',
        task_id: requestData.task_id
      };
      
      const bodyString = JSON.stringify(requestBody);
      
      console.log('Video Edit Query Request:', {
        url: url,
        task_id: requestData.task_id,
        accessKeyId: requestData.accessKeyId.substring(0, 8) + '***'
      });
      
      // 使用签名V4生成签名
      const signer = new SignatureV4(requestData.accessKeyId, requestData.secretAccessKey);
      const baseHeaders = { 'Content-Type': 'application/json' };
      const signedHeaders = signer.sign('POST', url, baseHeaders, bodyString);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: signedHeaders,
        body: bodyString
      });
      
      const responseText = await response.text();
      console.log('Video Edit Query Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseText: responseText.substring(0, 200)
      });
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`API返回了非JSON响应: ${responseText.substring(0, 200)}`);
      }
      
      console.log('Video Edit Query Parsed Data:', {
        code: data.code,
        message: data.message,
        status: data.data?.status,
        has_video: !!data.data?.video_url,
        full_data: data
      });
      
      if (!response.ok || (data.code && data.code !== 10000)) {
        // 特殊处理服务器内部错误
        if (data.code === 50501 || data.code === 50500) {
          console.warn('⚠️ Video Edit Query: Server Internal Error - Task may still be processing');
          console.warn('Error details:', data.message?.substring(0, 200));
          
          // 返回一个特殊的状态，而不是抛出错误
          return {
            success: true,
            data: {
              status: 'generating',  // 标记为处理中
              message: '任务处理中，请稍后再试。如果持续出现此错误，可能是视频格式不支持。',
              server_error: true,
              error_code: data.code,
              error_message: data.message
            }
          };
        }
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('Video Edit Query API Success:', {
        status: response.status,
        task_status: data.data?.status,
        has_video: !!data.data?.video_url
      });
      
      return {
        success: true,
        data: {
          status: data.data?.status,
          video_url: data.data?.video_url,
          aigc_meta_tagged: data.data?.aigc_meta_tagged,
          message: data.message,
          ...data.data
        }
      };
      
    } catch (error) {
      console.error('Video Edit Query Error:', error.message);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'VIDEO_EDIT_QUERY_ERROR'
        }
      };
    }
  }
}

module.exports = new APIService();
