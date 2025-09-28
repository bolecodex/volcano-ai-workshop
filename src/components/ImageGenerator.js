import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert, Badge, Spinner, Image, Modal } from 'react-bootstrap';
import { storage } from '../utils/storage';

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
    max_images: 15
  });

  const [apiKey, setApiKey] = useState('07ab6074-ed6e-43e2-8f80-bf6a70fc8b98');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [proxyStatus, setProxyStatus] = useState('unknown'); // 'working', 'failed', 'unknown'

  const models = [
    { value: 'doubao-seedream-4-0-250828', label: 'Seedream 4.0 (推荐)', description: '支持文生图、图生图、组图生成' },
    { value: 'doubao-seedream-3-0-t2i', label: 'Seedream 3.0 T2I', description: '文生图专用模型' },
    { value: 'doubao-seededit-3-0-i2i', label: 'SeedEdit 3.0 I2I', description: '图生图专用模型' }
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
    const savedApiKey = storage.getApiKey();
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // Set the provided API key and save it
      const providedApiKey = '07ab6074-ed6e-43e2-8f80-bf6a70fc8b98';
      setApiKey(providedApiKey);
      storage.setApiKey(providedApiKey);
    }

    // Check if running in Electron and set proxy status
    if (window.electronAPI) {
      setProxyStatus('working'); // IPC communication
    } else {
      setProxyStatus('failed'); // Browser mode
    }
  }, []);

  // Save API key when it changes
  useEffect(() => {
    if (apiKey && apiKey.trim()) {
      storage.setApiKey(apiKey);
    }
  }, [apiKey]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateImage = async () => {
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

      // 根据模型添加特定参数
      if (formData.model.includes('seedream-3') || formData.model.includes('seededit-3')) {
        requestBody.guidance_scale = formData.guidance_scale;
        if (formData.seed !== -1) {
          requestBody.seed = formData.seed;
        }
      }

      if (formData.model.includes('seedream-4') && formData.sequential_image_generation === 'auto') {
        requestBody.sequential_image_generation_options = {
          max_images: formData.max_images
        };
      }

      let result;
      
      if (window.electronAPI) {
        // Use IPC communication in Electron
        console.log('Using IPC communication');
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
        // Fallback to HTTP request in browser
        console.log('Using HTTP request (browser mode)');
        setProxyStatus('failed');
        
        const response = await fetch('http://localhost:3001/api/v3/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanApiKey}`
          },
          body: JSON.stringify(requestBody)
        });

        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response received:', text.substring(0, 200));
          throw new Error('服务器返回了非 JSON 响应，可能是代理配置问题');
        }

        if (!response.ok) {
          throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        setResults(data.data || []);
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
        // Use IPC communication for testing
        console.log('Testing IPC connection');
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
        // Fallback to HTTP request for browser mode
        console.log('Testing HTTP connection (browser mode)');
        const response = await fetch('http://localhost:3001/api/v3/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanApiKey}`
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

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Test connection: Non-JSON response received:', text.substring(0, 200));
          setError('代理配置可能有问题，服务器返回了 HTML 页面而不是 API 响应');
          return;
        }

        if (response.status === 401) {
          setError('API Key 无效或已过期');
        } else if (response.status === 403) {
          setError('API Key 权限不足');
        } else if (response.ok || response.status === 400) {
          setError('');
          alert('API 连接测试成功！您可以开始生成图片了。');
        } else {
          setError(`连接测试失败: HTTP ${response.status}`);
        }
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setError('网络连接失败，请检查网络或在 Electron 桌面应用中使用');
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
                
                {/* 文本权重 */}
                {(formData.model.includes('seedream-3') || formData.model.includes('seededit-3')) && (
                  <Form.Group className="mb-3">
                    <Form.Label>文本权重: {formData.guidance_scale}</Form.Label>
                    <Form.Range
                      min="1"
                      max="10"
                      step="0.1"
                      value={formData.guidance_scale}
                      onChange={(e) => handleInputChange('guidance_scale', parseFloat(e.target.value))}
                    />
                  </Form.Group>
                )}

                {/* 随机种子 */}
                {(formData.model.includes('seedream-3') || formData.model.includes('seededit-3')) && (
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
                  placeholder="请输入图片生成的提示词，支持中英文。建议不超过300个汉字或600个英文单词..."
                  value={formData.prompt}
                  onChange={(e) => handleInputChange('prompt', e.target.value)}
                />
                <div className="d-flex justify-content-between mt-2">
                  <Form.Text className="text-muted">
                    字符数: {formData.prompt.length}
                  </Form.Text>
                  <Button
                    variant="primary"
                    className="btn-gradient"
                    onClick={generateImage}
                    disabled={loading || !formData.prompt.trim() || !apiKey.trim()}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-magic me-1"></i>
                        生成图片
                      </>
                    )}
                  </Button>
                </div>
              </Form.Group>

              {/* 示例提示词 */}
              <div className="border rounded p-3 bg-light">
                <h6 className="mb-2">
                  <i className="bi bi-lightbulb me-1"></i>
                  示例提示词
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {[
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
              </div>
            </Card.Body>
          </Card>

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
