import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Form, Button, Alert, Badge, Spinner, Image, Modal } from 'react-bootstrap';
import { storage } from '../utils/storage';

function InpaintingEditor() {
  const [formData, setFormData] = useState({
    sourceImage: null,
    maskImage: null,
    sourceImageUrl: '',
    maskImageUrl: '',
    useImageUrl: false,
    customPrompt: '',
    steps: 25,
    scale: 5,
    seed: -1,
    returnUrl: true
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [previewImages, setPreviewImages] = useState({
    source: null,
    mask: null
  });

  const [imageDimensions, setImageDimensions] = useState({
    source: null,
    mask: null
  });

  // Canvas相关状态 - 用于绘制mask
  const [drawingMode, setDrawingMode] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Load AccessKey from storage on component mount
  useEffect(() => {
    const accessKeyId = storage.getAccessKeyId();
    const secretAccessKey = storage.getSecretAccessKey();
    
    if (!accessKeyId || !secretAccessKey) {
      setError('请先在设置页面配置 AccessKeyId 和 SecretAccessKey');
    }
  }, []);

  // 初始化Canvas
  useEffect(() => {
    if (drawingMode && canvasRef.current && previewImages.source) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // 加载原图到canvas
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = previewImages.source;
    }
  }, [drawingMode, previewImages.source]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理原图文件上传
  const handleSourceImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 检查文件类型和大小
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('仅支持 JPEG 和 PNG 格式的图片');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    setFormData(prev => ({ ...prev, sourceImage: file }));
    
    // 预览并获取尺寸
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions(prev => ({ 
          ...prev, 
          source: { width: img.width, height: img.height }
        }));
      };
      img.src = e.target.result;
      setPreviewImages(prev => ({ ...prev, source: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // 处理Mask图片上传
  const handleMaskImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!['image/png'].includes(file.type)) {
      setError('Mask图仅支持 PNG 格式');
      return;
    }

    setFormData(prev => ({ ...prev, maskImage: file }));
    
    // 预览并获取尺寸
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions(prev => ({ 
          ...prev, 
          mask: { width: img.width, height: img.height }
        }));
        
        // 自动检查尺寸是否匹配
        if (imageDimensions.source) {
          if (img.width !== imageDimensions.source.width || 
              img.height !== imageDimensions.source.height) {
            setError(
              `⚠️ 尺寸不匹配提醒：\n` +
              `原图：${imageDimensions.source.width} × ${imageDimensions.source.height}\n` +
              `Mask：${img.width} × ${img.height}\n\n` +
              `请使用"手绘Mask"功能，或重新上传相同尺寸的Mask图。`
            );
          } else {
            setError(''); // 清除错误
          }
        }
      };
      img.src = e.target.result;
      setPreviewImages(prev => ({ ...prev, mask: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Canvas绘制功能
  const startDrawing = (e) => {
    if (!drawingMode || !canvasRef.current) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
    ctx.fill();
  };

  // 清除Canvas
  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 重新加载原图
    if (previewImages.source) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = previewImages.source;
    }
  };

  // 保存Canvas为Mask
  const saveMaskFromCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const file = new File([blob], 'mask.png', { type: 'image/png' });
      setFormData(prev => ({ ...prev, maskImage: file }));
      
      // 预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => ({ ...prev, mask: e.target.result }));
      };
      reader.readAsDataURL(file);
      
      setDrawingMode(false);
      setError('');
      alert('Mask已保存，可以开始生成了');
    }, 'image/png');
  };

  // 将文件转换为 Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // 移除data:image/xxx;base64,前缀
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  // 获取图片尺寸
  const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 验证图片尺寸是否匹配
  const validateImageDimensions = async () => {
    if (formData.useImageUrl) {
      // URL模式下跳过验证（由API处理）
      return true;
    }

    if (!formData.sourceImage || !formData.maskImage) {
      return false;
    }

    try {
      const sourceDim = await getImageDimensions(formData.sourceImage);
      const maskDim = await getImageDimensions(formData.maskImage);

      if (sourceDim.width !== maskDim.width || sourceDim.height !== maskDim.height) {
        setError(
          `❌ 图片尺寸不匹配！\n\n` +
          `原图尺寸：${sourceDim.width} × ${sourceDim.height}\n` +
          `Mask图尺寸：${maskDim.width} × ${maskDim.height}\n\n` +
          `请确保原图和Mask图的尺寸完全一致。\n\n` +
          `💡 建议：使用"手绘Mask"功能，可以自动确保尺寸一致。`
        );
        return false;
      }

      console.log('✅ 图片尺寸验证通过:', sourceDim);
      return true;
    } catch (err) {
      console.error('图片尺寸验证失败:', err);
      setError('无法读取图片尺寸，请确保上传的是有效的图片文件');
      return false;
    }
  };

  const generateImage = async () => {
    // 获取AccessKey
    const accessKeyId = storage.getAccessKeyId();
    const secretAccessKey = storage.getSecretAccessKey();

    if (!accessKeyId || !secretAccessKey) {
      setError('请先在设置页面配置 AccessKeyId 和 SecretAccessKey');
      return;
    }

    if (!formData.customPrompt.trim()) {
      setError('请输入提示词');
      return;
    }

    // 检查是否提供了原图和mask
    if (formData.useImageUrl) {
      if (!formData.sourceImageUrl || !formData.maskImageUrl) {
        setError('请输入原图URL和Mask图URL');
        return;
      }
    } else {
      if (!formData.sourceImage || !formData.maskImage) {
        setError('请上传原图和Mask图');
        return;
      }
      
      // 验证图片尺寸是否匹配
      const isValid = await validateImageDimensions();
      if (!isValid) {
        return;
      }
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      // 准备请求数据
      const requestData = {
        accessKeyId,
        secretAccessKey,
        custom_prompt: formData.customPrompt,
        steps: formData.steps,
        scale: formData.scale,
        seed: formData.seed,
        return_url: formData.returnUrl
      };

      // 处理图片输入
      if (formData.useImageUrl) {
        // 使用URL
        requestData.image_urls = [
          formData.sourceImageUrl,
          formData.maskImageUrl
        ];
      } else {
        // 使用上传的文件
        const sourceBase64 = await fileToBase64(formData.sourceImage);
        const maskBase64 = await fileToBase64(formData.maskImage);
        requestData.binary_data_base64 = [sourceBase64, maskBase64];
      }

      console.log('提交Inpainting任务...');
      const result = await window.electronAPI.submitInpaintingTask(requestData);

      if (!result.success) {
        throw new Error(result.error?.message || '生成失败');
      }

      console.log('生成成功:', result.data);

      // 处理返回结果
      if (result.data.image_urls && result.data.image_urls.length > 0) {
        setResults(result.data.image_urls.map(url => ({ url })));
      } else if (result.data.binary_data_base64 && result.data.binary_data_base64.length > 0) {
        setResults(result.data.binary_data_base64.map(base64 => ({
          url: `data:image/jpeg;base64,${base64}`
        })));
      } else {
        setError('生成完成，但未返回图片');
      }

      setLoading(false);

    } catch (err) {
      console.error('Inpainting生成失败:', err);
      
      let errorMessage = err.message;
      
      // 处理常见错误
      if (err.message.includes('Access Denied')) {
        errorMessage = `
⚠️ 权限不足：智能绘图功能需要特殊权限

可能的原因：
1. 该服务未开通
2. 当前AccessKey没有访问权限
3. AccessKey配置不正确

解决方案：
• 访问火山引擎控制台申请服务权限
• 确认AccessKey具有"视觉智能"相关权限

控制台地址：https://console.volcengine.com/
        `;
      } else if (err.message.includes('operands could not be broadcast') || err.message.includes('shapes')) {
        errorMessage = `
❌ 图片尺寸不匹配！

API返回错误：原图和Mask图的尺寸不一致。

解决方案：
1. 使用"手绘Mask"功能（自动匹配尺寸）
2. 或确保上传的Mask图与原图尺寸完全相同

💡 推荐：删除当前Mask图，使用内置的手绘工具重新创建。
        `;
      } else if (err.message.includes('50411')) {
        errorMessage = '输入图片前审核未通过，请更换图片';
      } else if (err.message.includes('50511')) {
        errorMessage = '输出图片后审核未通过，请调整提示词';
      } else if (err.message.includes('50412') || err.message.includes('50413')) {
        errorMessage = '输入文本审核未通过，请修改提示词';
      } else if (err.message.includes('Internal Error') || err.message.includes('50500')) {
        errorMessage = `
⚠️ 服务器内部错误

这通常是由于：
• 图片尺寸不匹配（原图和Mask图必须完全相同）
• 图片格式不符合要求
• 服务端处理异常

建议：
1. 使用"手绘Mask"功能确保尺寸一致
2. 检查图片格式是否符合要求
3. 如果问题持续，请稍后重试
        `;
      }
      
      setError(`生成失败: ${errorMessage}`);
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
      link.download = `inpainting-result-${index + 1}.jpg`;
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-brush me-2"></i>
          智能绘图 (Inpainting)
        </h2>
        <Badge bg="primary">视觉智能</Badge>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
        </Alert>
      )}

      <Alert variant="info" className="mb-4">
        <i className="bi bi-info-circle me-2"></i>
        <strong>功能说明：</strong>通过涂抹、选区等方式建立重绘区域，按照提示词重新绘制指定内容。支持主体编辑、背景编辑和自定义区域编辑。
      </Alert>

      <Row>
        {/* 配置面板 */}
        <Col md={4}>
          <Card className="feature-card mb-4">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-gear me-2"></i>
              生成配置
            </Card.Header>
            <Card.Body>
              {/* 提示词 */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-chat-text me-1"></i>
                  提示词 *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="描述你想在涂抹区域生成的内容，例如：一只小狗、蓝天白云、草地..."
                  value={formData.customPrompt}
                  onChange={(e) => handleInputChange('customPrompt', e.target.value)}
                />
                <Form.Text className="text-muted">
                  字符数: {formData.customPrompt.length} / 100
                </Form.Text>
              </Form.Group>

              {/* 高级设置 */}
              <div className="border-top pt-3">
                <h6 className="text-muted mb-3">高级设置</h6>
                
                {/* 采样步数 */}
                <Form.Group className="mb-3">
                  <Form.Label>采样步数: {formData.steps}</Form.Label>
                  <Form.Range
                    min="10"
                    max="50"
                    value={formData.steps}
                    onChange={(e) => handleInputChange('steps', parseInt(e.target.value))}
                  />
                  <Form.Text className="text-muted">
                    越大效果可能更好，但耗时更长（默认: 25）
                  </Form.Text>
                </Form.Group>

                {/* Scale */}
                <Form.Group className="mb-3">
                  <Form.Label>文本引导强度: {formData.scale}</Form.Label>
                  <Form.Range
                    min="1"
                    max="20"
                    step="0.5"
                    value={formData.scale}
                    onChange={(e) => handleInputChange('scale', parseFloat(e.target.value))}
                  />
                  <Form.Text className="text-muted">
                    影响文本描述的程度（范围: 1-20，默认: 5）
                  </Form.Text>
                </Form.Group>

                {/* 随机种子 */}
                <Form.Group className="mb-3">
                  <Form.Label>随机种子</Form.Label>
                  <Form.Control
                    type="number"
                    min="-1"
                    value={formData.seed}
                    onChange={(e) => handleInputChange('seed', parseInt(e.target.value))}
                  />
                  <Form.Text className="text-muted">
                    -1 表示随机生成，固定值可复现结果
                  </Form.Text>
                </Form.Group>

                {/* 返回URL */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="return-url-switch"
                    label="返回图片链接（24小时有效）"
                    checked={formData.returnUrl}
                    onChange={(e) => handleInputChange('returnUrl', e.target.checked)}
                  />
                </Form.Group>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* 主要内容区域 */}
        <Col md={8}>
          {/* 图片输入 */}
          <Card className="feature-card mb-4">
            <Card.Header className="bg-warning text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <i className="bi bi-images me-2"></i>
                  图片输入
                </div>
                <Form.Check
                  type="switch"
                  id="use-url-switch"
                  label="使用URL"
                  checked={formData.useImageUrl}
                  onChange={(e) => handleInputChange('useImageUrl', e.target.checked)}
                  className="text-white"
                />
              </div>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="small mb-3">
                <strong>图片要求：</strong>
                <ul className="mb-0 mt-2">
                  <li>原图：JPG/PNG格式，≤5MB，分辨率 64×64 ~ 4096×4096</li>
                  <li>Mask图：PNG格式，单通道灰度图，黑色(0)保持，白色(255)重绘</li>
                </ul>
              </Alert>

              {!formData.useImageUrl ? (
                <Row>
                  {/* 原图上传 */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>原图 *</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleSourceImageChange}
                      />
                      {previewImages.source && (
                        <div className="mt-2">
                          <Image src={previewImages.source} thumbnail style={{ maxHeight: '200px' }} />
                          {imageDimensions.source && (
                            <small className="text-success d-block mt-1">
                              <i className="bi bi-check-circle me-1"></i>
                              尺寸: {imageDimensions.source.width} × {imageDimensions.source.height}
                            </small>
                          )}
                        </div>
                      )}
                    </Form.Group>
                  </Col>

                  {/* Mask图上传或绘制 */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mask图 *</Form.Label>
                      {!drawingMode ? (
                        <>
                          <Form.Control
                            type="file"
                            accept="image/png"
                            onChange={handleMaskImageChange}
                            className="mb-2"
                          />
                          {previewImages.source && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => setDrawingMode(true)}
                              className="w-100"
                            >
                              <i className="bi bi-brush me-1"></i>
                              或者手绘Mask
                            </Button>
                          )}
                        </>
                      ) : (
                        <div>
                          <div className="mb-2">
                            <Form.Label className="small">画笔大小: {brushSize}px</Form.Label>
                            <Form.Range
                              min="5"
                              max="50"
                              value={brushSize}
                              onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            />
                          </div>
                          <div className="d-flex gap-2 mb-2">
                            <Button variant="outline-secondary" size="sm" onClick={clearCanvas}>
                              <i className="bi bi-arrow-counterclockwise me-1"></i>
                              清除
                            </Button>
                            <Button variant="success" size="sm" onClick={saveMaskFromCanvas}>
                              <i className="bi bi-check-lg me-1"></i>
                              保存Mask
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => setDrawingMode(false)}>
                              取消
                            </Button>
                          </div>
                        </div>
                      )}
                      {previewImages.mask && !drawingMode && (
                        <div className="mt-2">
                          <Image src={previewImages.mask} thumbnail style={{ maxHeight: '200px' }} />
                          {imageDimensions.mask && (
                            <small className={
                              imageDimensions.source && 
                              imageDimensions.source.width === imageDimensions.mask.width &&
                              imageDimensions.source.height === imageDimensions.mask.height
                                ? 'text-success d-block mt-1'
                                : 'text-warning d-block mt-1'
                            }>
                              <i className={
                                imageDimensions.source && 
                                imageDimensions.source.width === imageDimensions.mask.width &&
                                imageDimensions.source.height === imageDimensions.mask.height
                                  ? 'bi bi-check-circle me-1'
                                  : 'bi bi-exclamation-triangle me-1'
                              }></i>
                              尺寸: {imageDimensions.mask.width} × {imageDimensions.mask.height}
                              {imageDimensions.source && (
                                imageDimensions.source.width !== imageDimensions.mask.width ||
                                imageDimensions.source.height !== imageDimensions.mask.height
                              ) && (
                                <span className="d-block mt-1">⚠️ 与原图尺寸不匹配</span>
                              )}
                            </small>
                          )}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              ) : (
                <Row>
                  {/* 原图URL */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>原图URL *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={formData.sourceImageUrl}
                        onChange={(e) => handleInputChange('sourceImageUrl', e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  {/* Mask图URL */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mask图URL *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="https://example.com/mask.png"
                        value={formData.maskImageUrl}
                        onChange={(e) => handleInputChange('maskImageUrl', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {/* Canvas绘制区域 */}
              {drawingMode && (
                <div className="border rounded p-2 bg-light" style={{ overflow: 'auto', maxHeight: '400px' }}>
                  <p className="small text-muted mb-2">
                    <i className="bi bi-info-circle me-1"></i>
                    在图片上涂抹白色区域，白色部分将被重绘
                  </p>
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{ cursor: 'crosshair', maxWidth: '100%' }}
                  />
                </div>
              )}

              {/* 示例提示词 */}
              <div className="border rounded p-3 bg-light mt-3">
                <h6 className="mb-2">
                  <i className="bi bi-lightbulb me-1"></i>
                  示例提示词
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {[
                    "一只小狗",
                    "蓝天白云",
                    "绿色草地",
                    "红色跑车",
                    "现代建筑",
                    "森林背景"
                  ].map((example, index) => (
                    <Button
                      key={index}
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleInputChange('customPrompt', example)}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 生成按钮 */}
              <div className="d-grid mt-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="btn-gradient"
                  onClick={generateImage}
                  disabled={loading || !formData.customPrompt.trim()}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-magic me-1"></i>
                      开始生成
                    </>
                  )}
                </Button>
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
                  <p>暂无生成结果，请上传图片并输入提示词后生成</p>
                </div>
              )}

              {results.length > 0 && (
                <Row>
                  {results.map((result, index) => (
                    <Col md={6} lg={4} key={index} className="mb-3">
                      <Card className="h-100">
                        <div style={{ position: 'relative', paddingBottom: '100%', overflow: 'hidden' }}>
                          <Image
                            src={result.url}
                            alt={`Result ${index + 1}`}
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

export default InpaintingEditor;

