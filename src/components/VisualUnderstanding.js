import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../utils/storage';

function VisualUnderstanding() {
  // 状态管理
  const [mode, setMode] = useState('understanding'); // 'understanding' 或 'grounding'
  const [imageSource, setImageSource] = useState('url'); // 'url' 或 'file'
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [prompt, setPrompt] = useState('');
  const [modelId, setModelId] = useState('doubao-seed-1-6-251015');
  const [detail, setDetail] = useState('low');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [resultImage, setResultImage] = useState('');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [history, setHistory] = useState([]);
  const [credentials, setCredentials] = useState(null);
  
  const canvasRef = useRef(null);

  // 加载历史记录和凭证
  useEffect(() => {
    const savedHistory = storage.get('visual_understanding_history', []);
    setHistory(savedHistory);
    
    // 检查火山方舟凭证
    const arkCredentials = storage.get('ark_credentials');
    setCredentials(arkCredentials);
  }, []);

  // 预设提示词
  const presetPrompts = {
    understanding: [
      '请详细描述这张图片的内容',
      '这张图片中有什么物体？',
      '分析图片中的场景和氛围',
      '识别图片中的文字内容'
    ],
    grounding: [
      '框出图片中的主要物体，输出 bounding box 的坐标',
      '定位图片中所有的人物，以<bbox>x1 y1 x2 y2</bbox>的形式表示',
      '标注图中的文字，格式为<text>text</text><polygon>x1 y1, x2 y2, x3 y3, x4 y4</polygon>'
    ]
  };

  // 显示提示
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  // 处理文件选择
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showAlert('danger', '图片大小不能超过10MB');
        return;
      }
      
      setImageFile(file);
      
      // 生成预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理URL输入
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setImagePreview(url);
    }
  };

  // 切换模式
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setResult('');
    setResultImage('');
    // 设置默认提示词
    if (newMode === 'understanding') {
      setPrompt(presetPrompts.understanding[0]);
    } else {
      setPrompt(presetPrompts.grounding[0]);
    }
  };

  // 在画布上绘制边界框
  const drawBoundingBoxes = (imageUrl, bboxes) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // 绘制边界框
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#ff0000';

      bboxes.forEach((bbox, index) => {
        const { x_min, y_min, x_max, y_max, label } = bbox;
        
        // 坐标从0-1000归一化到实际像素
        const x1 = (x_min / 1000) * img.width;
        const y1 = (y_min / 1000) * img.height;
        const x2 = (x_max / 1000) * img.width;
        const y2 = (y_max / 1000) * img.height;

        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        
        if (label) {
          ctx.fillText(label, x1, y1 - 5);
        }
      });

      setResultImage(canvas.toDataURL());
    };

    img.src = imageUrl;
  };

  // 解析边界框坐标
  const parseBoundingBoxes = (text) => {
    const bboxes = [];
    
    // 匹配 <bbox>x1 y1 x2 y2</bbox> 格式
    const bboxRegex = /<bbox>([\d\s]+)<\/bbox>/g;
    let match;
    
    while ((match = bboxRegex.exec(text)) !== null) {
      const coords = match[1].trim().split(/\s+/).map(Number);
      if (coords.length === 4) {
        bboxes.push({
          x_min: coords[0],
          y_min: coords[1],
          x_max: coords[2],
          y_max: coords[3]
        });
      }
    }

    // 匹配 JSON 格式的多目标检测
    try {
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        const objects = JSON.parse(jsonMatch[0]);
        objects.forEach(obj => {
          if (obj.bbox) {
            const bboxMatch = obj.bbox.match(/<bbox>([\d\s]+)<\/bbox>/);
            if (bboxMatch) {
              const coords = bboxMatch[1].trim().split(/\s+/).map(Number);
              if (coords.length === 4) {
                bboxes.push({
                  x_min: coords[0],
                  y_min: coords[1],
                  x_max: coords[2],
                  y_max: coords[3],
                  label: obj.category
                });
              }
            }
          }
        });
      }
    } catch (e) {
      // JSON解析失败，继续使用正则匹配的结果
    }

    return bboxes;
  };

  // 提交分析请求
  const handleSubmit = async () => {
    // 验证输入
    if (!prompt.trim()) {
      showAlert('warning', '请输入提示词');
      return;
    }

    let imageData = '';
    if (imageSource === 'url') {
      if (!imageUrl.trim()) {
        showAlert('warning', '请输入图片URL');
        return;
      }
      imageData = imageUrl;
    } else {
      if (!imageFile) {
        showAlert('warning', '请选择图片文件');
        return;
      }
      imageData = imagePreview;
    }

    // 检查凭证
    if (!credentials || !credentials.apiKey) {
      showAlert('danger', '请先在设置中配置火山方舟 API Key');
      return;
    }

    setIsLoading(true);
    setResult('');
    setResultImage('');

    try {
      const API_BASE_URL = window.location.protocol === 'file:'
        ? 'http://localhost:3001'
        : '';

      const requestBody = {
        model: modelId,
        mode: mode,
        imageData: imageData,
        imageSource: imageSource,
        prompt: prompt,
        detail: detail,
        apiKey: credentials.apiKey
      };

      const response = await fetch(`${API_BASE_URL}/api/visual-understanding/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        const content = data.content;
        setResult(content);

        // 如果是视觉定位模式，解析并绘制边界框
        if (mode === 'grounding') {
          const bboxes = parseBoundingBoxes(content);
          if (bboxes.length > 0) {
            drawBoundingBoxes(imagePreview, bboxes);
            showAlert('success', `视觉定位成功！检测到 ${bboxes.length} 个目标`);
          } else {
            showAlert('warning', '未检测到边界框坐标');
          }
        } else {
          showAlert('success', '视觉理解成功！');
        }

        // 保存到历史记录
        const newHistoryItem = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          mode: mode,
          prompt: prompt,
          imagePreview: imagePreview.substring(0, 100) + '...',
          result: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          modelId: modelId
        };
        const newHistory = [newHistoryItem, ...history].slice(0, 20);
        setHistory(newHistory);
        storage.set('visual_understanding_history', newHistory);

      } else {
        if (data.error && data.error.includes('401')) {
          showAlert('danger',
            '❌ 认证失败(401)：API Key 无效。\n\n' +
            '请检查：\n' +
            '• API Key 是否正确\n' +
            '• API Key 是否已过期\n\n' +
            '请前往【设置】→【火山方舟凭证配置】重新配置。'
          );
        } else {
          showAlert('danger', `分析失败: ${data.error}`);
        }
      }
    } catch (error) {
      console.error('视觉理解错误:', error);
      showAlert('danger', `请求失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-0">
            <i className="bi bi-eye me-2"></i>
            视觉理解
          </h2>
          <p className="text-muted">基于火山方舟大模型的图片理解与视觉定位</p>
        </div>
      </div>

      {/* 提示信息 */}
      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          <div style={{ whiteSpace: 'pre-line' }}>{alert.message}</div>
          <button type="button" className="btn-close" onClick={() => setAlert({ show: false })}></button>
        </div>
      )}

      <div className="row">
        {/* 左侧：输入区域 */}
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"><i className="bi bi-gear me-2"></i>分析配置</h5>
            </div>
            <div className="card-body">
              {/* 模式选择 */}
              <div className="mb-3">
                <label className="form-label fw-bold">分析模式</label>
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${mode === 'understanding' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleModeChange('understanding')}
                  >
                    <i className="bi bi-chat-dots me-2"></i>视觉理解
                  </button>
                  <button
                    type="button"
                    className={`btn ${mode === 'grounding' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleModeChange('grounding')}
                  >
                    <i className="bi bi-bounding-box me-2"></i>视觉定位
                  </button>
                </div>
                <small className="text-muted d-block mt-1">
                  {mode === 'understanding' ? '理解图片内容并生成描述' : '定位图片中的目标并返回坐标'}
                </small>
              </div>

              {/* 图片来源 */}
              <div className="mb-3">
                <label className="form-label fw-bold">图片来源</label>
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${imageSource === 'url' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setImageSource('url')}
                  >
                    <i className="bi bi-link-45deg me-2"></i>URL
                  </button>
                  <button
                    type="button"
                    className={`btn ${imageSource === 'file' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setImageSource('file')}
                  >
                    <i className="bi bi-upload me-2"></i>本地文件
                  </button>
                </div>
              </div>

              {/* 图片输入 */}
              {imageSource === 'url' ? (
                <div className="mb-3">
                  <label className="form-label fw-bold">图片URL</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={handleUrlChange}
                  />
                </div>
              ) : (
                <div className="mb-3">
                  <label className="form-label fw-bold">选择图片</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <small className="text-muted">支持 JPG、PNG、GIF 等格式，最大10MB</small>
                </div>
              )}

              {/* 图片预览 */}
              {imagePreview && (
                <div className="mb-3">
                  <label className="form-label fw-bold">图片预览</label>
                  <div className="border rounded p-2 text-center" style={{ maxHeight: '300px', overflow: 'auto' }}>
                    <img src={imagePreview} alt="预览" style={{ maxWidth: '100%', maxHeight: '280px' }} />
                  </div>
                </div>
              )}

              {/* 模型选择 */}
              <div className="mb-3">
                <label className="form-label fw-bold">模型</label>
                <select
                  className="form-select"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                >
                  <option value="doubao-seed-1-6-251015">Doubao Seed 1.6</option>
                  <option value="doubao-1.5-vision-pro">Doubao 1.5 Vision Pro</option>
                </select>
              </div>

              {/* 精细度控制（仅视觉理解） */}
              {mode === 'understanding' && (
                <div className="mb-3">
                  <label className="form-label fw-bold">理解精细度</label>
                  <select
                    className="form-select"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                  >
                    <option value="low">低精度（快速）</option>
                    <option value="high">高精度（详细）</option>
                  </select>
                  <small className="text-muted">高精度会处理更多细节，但速度较慢</small>
                </div>
              )}

              {/* 提示词 */}
              <div className="mb-3">
                <label className="form-label fw-bold">提示词</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder={mode === 'understanding' ? '请描述这张图片...' : '框出图片中的目标...'}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                ></textarea>
                
                {/* 预设提示词 */}
                <div className="mt-2">
                  <small className="text-muted d-block mb-1">快速选择：</small>
                  <div className="d-flex flex-wrap gap-1">
                    {presetPrompts[mode].map((preset, index) => (
                      <button
                        key={index}
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setPrompt(preset)}
                      >
                        {preset.substring(0, 20)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 凭证状态显示 */}
              <div className="mb-3">
                <div className={`alert ${credentials && credentials.apiKey ? 'alert-success' : 'alert-warning'} py-2 px-3`}>
                  <i className={`bi ${credentials && credentials.apiKey ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                  {credentials && credentials.apiKey ? 
                    '✅ 火山方舟凭证已配置' : 
                    '⚠️ 请先在设置中配置火山方舟 API Key'
                  }
                </div>
              </div>

              {/* 提交按钮 */}
              <button
                className="btn btn-primary w-100"
                onClick={handleSubmit}
                disabled={isLoading || !credentials || !credentials.apiKey}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    分析中...
                  </>
                ) : (
                  <>
                    <i className="bi bi-play-fill me-2"></i>
                    开始分析
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：结果区域 */}
        <div className="col-md-6">
          {/* 分析结果 */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"><i className="bi bi-file-text me-2"></i>分析结果</h5>
            </div>
            <div className="card-body">
              {result ? (
                <>
                  <div className="mb-3">
                    <h6 className="fw-bold">文本结果：</h6>
                    <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                      {result}
                    </div>
                  </div>

                  {/* 显示标注后的图片（视觉定位模式） */}
                  {resultImage && (
                    <div className="mt-3">
                      <h6 className="fw-bold">标注图片：</h6>
                      <div className="border rounded p-2 text-center">
                        <img src={resultImage} alt="标注结果" style={{ maxWidth: '100%' }} />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3">选择图片并提交后，分析结果将显示在这里</p>
                </div>
              )}
            </div>
          </div>

          {/* 历史记录 */}
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i>历史记录</h5>
            </div>
            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {history.length > 0 ? (
                <div className="list-group">
                  {history.map((item) => (
                    <div key={item.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className={`badge ${item.mode === 'understanding' ? 'bg-primary' : 'bg-success'} me-2`}>
                            {item.mode === 'understanding' ? '视觉理解' : '视觉定位'}
                          </span>
                          <small className="text-muted">
                            {new Date(item.timestamp).toLocaleString('zh-CN')}
                          </small>
                        </div>
                      </div>
                      <p className="mb-1 mt-2"><strong>提示词：</strong>{item.prompt}</p>
                      <p className="mb-0 text-muted small">{item.result}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-3">
                  <p>暂无历史记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 隐藏的canvas用于绘制边界框 */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
}

export default VisualUnderstanding;

