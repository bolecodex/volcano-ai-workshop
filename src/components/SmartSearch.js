import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, 
  Alert, Badge, Spinner, Image, ListGroup, 
  Tabs, Tab, ProgressBar
} from 'react-bootstrap';
import { storage } from '../utils/storage';

function SmartSearch() {
  // 认证配置
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  
  // 数据集配置
  const [collectionName, setCollectionName] = useState('');
  const [indexName, setIndexName] = useState('');
  
  // 搜索配置
  const [searchMode, setSearchMode] = useState('text-search'); // text-search, image-search
  const [limit, setLimit] = useState(10);
  const [outputFields, setOutputFields] = useState(['video_id', 'landscape_video']);
  
  // 输入状态
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  // 结果状态
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [presignedUrls, setPresignedUrls] = useState({}); // 存储TOS预签名URL: {tosUrl: signedUrl}
  const [generatingUrls, setGeneratingUrls] = useState(false); // 是否正在生成预签名URL

  // 加载配置
  useEffect(() => {
    const loadSettings = () => {
      const keys = storage.getAccessKeys();
      if (keys.accessKeyId) setAccessKeyId(keys.accessKeyId);
      if (keys.secretAccessKey) setSecretAccessKey(keys.secretAccessKey);
      
      const savedHistory = localStorage.getItem('smartSearchHistory');
      if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
      
      const savedCollection = localStorage.getItem('vikingdb_collection');
      if (savedCollection) setCollectionName(savedCollection);
      
      const savedIndex = localStorage.getItem('vikingdb_index');
      if (savedIndex) setIndexName(savedIndex);
    };
    loadSettings();
  }, []);

  // 保存配置
  const saveCollectionConfig = () => {
    localStorage.setItem('vikingdb_collection', collectionName);
    localStorage.setItem('vikingdb_index', indexName);
  };

  // 保存历史
  const saveHistory = (newHistory) => {
    setSearchHistory(newHistory);
    localStorage.setItem('smartSearchHistory', JSON.stringify(newHistory));
  };

  // 生成 TOS 预签名 URL
  useEffect(() => {
    if (!searchResult || !searchResult.items || searchResult.items.length === 0) {
      return;
    }

    const generatePresignedUrls = async () => {
      setGeneratingUrls(true);
      const newPresignedUrls = {};
      
      try {
        for (const item of searchResult.items) {
          // 查找视频字段
          const videoField = Object.keys(item.fields || {}).find(key => 
            key.toLowerCase().includes('video') || key.toLowerCase().includes('landscape')
          );
          const videoUrl = videoField ? (item.fields[videoField]?.value || item.fields[videoField]) : null;
          
          if (!videoUrl || typeof videoUrl !== 'string' || presignedUrls[videoUrl]) {
            continue;
          }
          
          let tosUrl = null;
          let needsPresigning = false;
          
          // 检查是否是 TOS URL (tos://格式)
          if (videoUrl.startsWith('tos://')) {
            tosUrl = videoUrl;
            needsPresigning = true;
          }
          // 检查是否是 TOS HTTPS URL
          else if (videoUrl.includes('.tos-cn-beijing.volces.com/') || 
                   videoUrl.includes('.tos') && videoUrl.includes('.volces.com/')) {
            // 从HTTPS URL转换回TOS URL格式
            const httpsMatch = videoUrl.match(/https?:\/\/([^.]+)\.tos[^/]*\.volces\.com\/(.+)$/);
            if (httpsMatch) {
              const [, bucket, objectKey] = httpsMatch;
              tosUrl = `tos://${bucket}/${objectKey}`;
              needsPresigning = true;
            }
          }
          
          // 如果需要预签名且未生成过
          if (needsPresigning && tosUrl && !presignedUrls[videoUrl]) {
            try {
              console.log('🔗 生成 TOS 预签名 URL:', tosUrl, '(原始URL:', videoUrl, ')');
              
              if (window.electronAPI && window.electronAPI.getTosPreSignedUrl) {
                const response = await window.electronAPI.getTosPreSignedUrl({
                  accessKeyId,
                  secretAccessKey,
                  tosUrl: tosUrl,
                  region: 'cn-beijing',
                  endpoint: 'tos-cn-beijing.volces.com',
                  expiresIn: 3600
                });
                
                if (response.success && response.data && response.data.url) {
                  // 使用原始URL作为key，这样可以匹配HTTPS格式的URL
                  newPresignedUrls[videoUrl] = response.data.url;
                  console.log('✅ 预签名 URL 生成成功');
                } else {
                  console.error('❌ 预签名 URL 生成失败:', response.error);
                }
              }
            } catch (err) {
              console.error('❌ 生成预签名 URL 时出错:', err);
            }
          }
        }
        
        // 更新状态
        if (Object.keys(newPresignedUrls).length > 0) {
          setPresignedUrls(prev => ({ ...prev, ...newPresignedUrls }));
        }
      } finally {
        setGeneratingUrls(false);
      }
    };
    
    generatePresignedUrls();
    // eslint-disable-next-line
  }, [searchResult, accessKeyId, secretAccessKey]);

  // 处理图片上传
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理视频上传
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 执行搜索
  const handleSearch = async () => {
    if (!accessKeyId || !secretAccessKey) {
      setError('请先在设置中配置 AccessKeyId 和 SecretAccessKey');
      return;
    }

    if (!collectionName || !indexName) {
      setError('请先配置数据集名称和索引名称');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      const requestData = {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        collection_name: collectionName,
        index_name: indexName,
        limit: limit,
        output_fields: outputFields
      };

      // 根据搜索模式添加不同的输入
      if (searchMode === 'text-search') {
        if (!textInput) {
          throw new Error('请输入搜索文本');
        }
        requestData.text = textInput;
      } else if (searchMode === 'image-search') {
        if (!imagePreview && !imageUrl) {
          throw new Error('请上传图片或输入图片URL');
        }
        requestData.image = imagePreview || imageUrl;
      } else if (searchMode === 'video-search') {
        if (!videoPreview && !videoUrl) {
          throw new Error('请上传视频或输入视频URL');
        }
        requestData.video = videoPreview || videoUrl;
      } else if (searchMode === 'mixed-search') {
        if (!textInput && !imagePreview && !imageUrl) {
          throw new Error('请至少提供文本或图片输入');
        }
        if (textInput) requestData.text = textInput;
        if (imagePreview || imageUrl) requestData.image = imagePreview || imageUrl;
        if (videoPreview || videoUrl) requestData.video = videoPreview || videoUrl;
      }

      console.log('🔍 开始搜索，模式:', searchMode, '参数:', {
        collection: collectionName,
        index: indexName,
        hasText: !!requestData.text,
        hasImage: !!requestData.image,
        hasVideo: !!requestData.video
      });

      // 调用多模态搜索API
      if (window.electronAPI && window.electronAPI.searchByMultiModal) {
        const response = await window.electronAPI.searchByMultiModal(requestData);

        if (!response.success) {
          throw new Error(response.error.message);
        }

        console.log('✅ 搜索成功:', response.data);

        // API 返回的数据结构：response.data.data 是数组，response.data.total_return_count 是总数
        const items = response.data.data || [];
        const total = response.data.total_return_count || 0;

        // 转换数据格式：fields -> 直接的字段，score -> score
        const formattedItems = items.map(item => ({
          fields: item.fields || {},
          score: item.score || 0,
          id: item.id || ''
        }));

        const resultData = {
          items: formattedItems,
          total: total,
          timestamp: new Date().toISOString(),
          searchMode: searchMode,
          query: {
            text: textInput,
            hasImage: !!(imagePreview || imageUrl),
            hasVideo: !!(videoPreview || videoUrl)
          }
        };

        setSearchResult(resultData);

        // 添加到历史
        const newHistory = [
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            mode: searchMode,
            collection: collectionName,
            index: indexName,
            query: textInput || '图片/视频搜索',
            resultCount: resultData.items.length
          },
          ...searchHistory.slice(0, 19)
        ];
        saveHistory(newHistory);

      } else {
        throw new Error('此功能需要在 Electron 环境中运行');
      }

    } catch (err) {
      console.error('搜索失败:', err);
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="bi bi-search-heart me-2"></i>
            素材搜索
          </h2>
          <p className="text-muted">
            基于火山引擎 VikingDB 向量数据库的多模态素材搜索，支持文搜文/图/视频、图搜图/视频
          </p>
        </Col>
      </Row>

      {/* 配置提示 */}
      {(!accessKeyId || !secretAccessKey) && (
        <Alert variant="warning" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          请先在"设置"页面配置 AccessKeyId 和 SecretAccessKey
        </Alert>
      )}

      <Tabs defaultActiveKey="search" className="mb-4">
        {/* 搜索标签页 */}
        <Tab eventKey="search" title={<><i className="bi bi-search me-2"></i>搜索</>}>
          <Card>
            <Card.Body>
              {/* 数据集配置 */}
              <h5 className="mb-3">
                <i className="bi bi-database me-2"></i>
                数据集配置
              </h5>
              
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>数据集名称（Collection）</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="例如: video_demo2"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      onBlur={saveCollectionConfig}
                    />
                    <Form.Text className="text-muted">
                      在 VikingDB 控制台创建的数据集名称
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>索引名称（Index）</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="例如: video_demo2"
                      value={indexName}
                      onChange={(e) => setIndexName(e.target.value)}
                      onBlur={saveCollectionConfig}
                    />
                    <Form.Text className="text-muted">
                      数据集对应的索引名称
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <hr />

              {/* 搜索模式选择 */}
              <h5 className="mb-3">
                <i className="bi bi-sliders me-2"></i>
                搜索模式
              </h5>

              <Form.Group className="mb-3">
                <div>
                  <Button
                    variant={searchMode === 'text-search' ? 'primary' : 'outline-primary'}
                    className="me-2 mb-2"
                    onClick={() => setSearchMode('text-search')}
                  >
                    <i className="bi bi-type me-1"></i>
                    文搜文/图/视频
                  </Button>
                  <Button
                    variant={searchMode === 'image-search' ? 'primary' : 'outline-primary'}
                    className="me-2 mb-2"
                    onClick={() => setSearchMode('image-search')}
                  >
                    <i className="bi bi-image me-1"></i>
                    图搜图/视频
                  </Button>
                  <Button
                    variant={searchMode === 'video-search' ? 'primary' : 'outline-primary'}
                    className="me-2 mb-2"
                    onClick={() => setSearchMode('video-search')}
                  >
                    <i className="bi bi-camera-video me-1"></i>
                    视频搜索
                  </Button>
                  <Button
                    variant={searchMode === 'mixed-search' ? 'primary' : 'outline-primary'}
                    className="me-2 mb-2"
                    onClick={() => setSearchMode('mixed-search')}
                  >
                    <i className="bi bi-collection me-1"></i>
                    混合搜索
                  </Button>
                </div>
              </Form.Group>

              <hr />

              {/* 输入区域 */}
              <h5 className="mb-3">
                <i className="bi bi-input-cursor me-2"></i>
                搜索内容
              </h5>

              {/* 文本输入 */}
              {(searchMode === 'text-search' || searchMode === 'mixed-search') && (
                <Form.Group className="mb-3">
                  <Form.Label>搜索文本</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="输入要搜索的文本内容..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    可以搜索文本、图片或视频内容
                  </Form.Text>
                </Form.Group>
              )}

              {/* 图片输入 */}
              {(searchMode === 'image-search' || searchMode === 'mixed-search') && (
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>上传图片</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/bmp"
                        onChange={handleImageUpload}
                      />
                      <Form.Text className="text-muted">
                        支持 JPEG、PNG、WebP、BMP 格式
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>或输入图片 URL</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="https://example.com/image.jpg 或 tos://..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  {imagePreview && (
                    <Col md={12} className="mt-3">
                      <div className="text-center">
                        <Image 
                          src={imagePreview} 
                          thumbnail 
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    </Col>
                  )}
                </Row>
              )}

              {/* 视频输入 */}
              {(searchMode === 'video-search' || searchMode === 'mixed-search') && (
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>上传视频</Form.Label>
                      <Form.Control
                        type="file"
                        accept="video/mp4,video/avi,video/mov"
                        onChange={handleVideoUpload}
                      />
                      <Form.Text className="text-muted">
                        支持 MP4、AVI、MOV 格式
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>或输入视频 URL</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="https://example.com/video.mp4 或 tos://..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              <hr />

              {/* 搜索参数 */}
              <h5 className="mb-3">
                <i className="bi bi-sliders me-2"></i>
                搜索参数
              </h5>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>返回结果数量（TopK）</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      max={100}
                      value={limit}
                      onChange={(e) => setLimit(parseInt(e.target.value))}
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>输出字段</Form.Label>
                    <Form.Control
                      type="text"
                      value={outputFields.join(', ')}
                      onChange={(e) => setOutputFields(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      placeholder="f_text, f_image, f_video"
                    />
                    <Form.Text className="text-muted">
                      多个字段用逗号分隔，例如: f_text, f_image, f_video
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* 错误提示 */}
              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  <Alert.Heading>错误</Alert.Heading>
                  <p>{error}</p>
                </Alert>
              )}

              {/* 搜索按钮 */}
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSearch}
                  disabled={isSearching || !accessKeyId || !secretAccessKey || !collectionName || !indexName}
                >
                  {isSearching ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      搜索中...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2"></i>
                      开始搜索
                    </>
                  )}
                </Button>
              </div>

              {/* 搜索结果 */}
              {searchResult && (
                <div className="mt-4">
                  <h5>
                    <i className="bi bi-list-check me-2"></i>
                    搜索结果
                  </h5>
                  
                  <Alert variant="success" className="mb-3">
                    <strong>找到 {searchResult.items.length} 个结果</strong>
                    {searchResult.total > 0 && ` (共 ${searchResult.total} 条)`}
                  </Alert>

                  {searchResult.items.length > 0 ? (
                    <Row>
                      {searchResult.items.map((item, idx) => {
                        // 查找视频字段
                        const videoField = Object.keys(item.fields || {}).find(key => 
                          key.toLowerCase().includes('video') || key.toLowerCase().includes('landscape')
                        );
                        const videoUrl = videoField ? (item.fields[videoField]?.value || item.fields[videoField]) : null;
                        
                        // 判断是否是 TOS 地址
                        const isTosUrl = videoUrl && typeof videoUrl === 'string' && videoUrl.startsWith('tos://');
                        // 检查是否是 HTTPS 格式的 TOS URL
                        const isHttpsTosUrl = videoUrl && typeof videoUrl === 'string' && 
                          (videoUrl.includes('.tos-cn-beijing.volces.com/') || 
                           (videoUrl.includes('.tos') && videoUrl.includes('.volces.com/')));
                        
                        let isHttpUrl = videoUrl && typeof videoUrl === 'string' && 
                          (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) && 
                          !isHttpsTosUrl; // 排除TOS的HTTPS URL
                        
                        // 优先使用预签名URL
                        let displayUrl = null;
                        let needsPresignedUrl = false;
                        
                        // 检查是否已有预签名URL
                        if (presignedUrls[videoUrl]) {
                          displayUrl = presignedUrls[videoUrl];
                          isHttpUrl = true;
                        } else if (isTosUrl || isHttpsTosUrl) {
                          // 需要预签名URL但还未生成
                          needsPresignedUrl = true;
                          displayUrl = null; // 不显示未签名的URL
                        } else if (isHttpUrl) {
                          // 普通的HTTP URL,可以直接使用
                          displayUrl = videoUrl;
                        }
                        
                        return (
                          <Col md={6} lg={4} key={idx} className="mb-3">
                            <Card>
                              {/* 视频预览区域 */}
                              <div style={{ height: '200px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                {needsPresignedUrl && generatingUrls ? (
                                  <div className="text-white text-center">
                                    <Spinner animation="border" variant="light" className="mb-2" />
                                    <div className="small">正在生成访问链接...</div>
                                  </div>
                                ) : needsPresignedUrl && !displayUrl ? (
                                  <div className="text-white text-center">
                                    <i className="bi bi-lock" style={{ fontSize: '48px' }}></i>
                                    <div className="mt-2 small">
                                      需要生成预签名URL才能访问
                                    </div>
                                  </div>
                                ) : displayUrl && isHttpUrl ? (
                                  <video 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    controls
                                    preload="metadata"
                                  >
                                    <source src={displayUrl} type="video/mp4" />
                                    您的浏览器不支持视频标签
                                  </video>
                                ) : (
                                  <div className="text-white text-center">
                                    <i className="bi bi-play-circle" style={{ fontSize: '48px' }}></i>
                                    <div className="mt-2 small">
                                      视频
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <Card.Body>
                                {/* 相似度分数 */}
                                <div className="mb-3">
                                  <ProgressBar 
                                    now={item.score * 100} 
                                    label={`${(item.score * 100).toFixed(2)}%`}
                                    variant={item.score > 0.3 ? 'success' : item.score > 0.2 ? 'info' : 'warning'}
                                  />
                                  <small className="text-muted">相似度分数</small>
                                </div>
                                
                                {/* 显示所有字段 */}
                                <div className="mb-3">
                                  {Object.entries(item.fields || {}).map(([key, value]) => {
                                    const displayValue = typeof value === 'object' && value?.value ? value.value : value;
                                    const isVideo = key.toLowerCase().includes('video') || key.toLowerCase().includes('landscape');
                                    
                                    return (
                                      <div key={key} className="small mb-1">
                                        <strong>{key}:</strong>{' '}
                                        {isVideo ? (
                                          <span className="text-muted" style={{ fontSize: '0.85em' }}>
                                            {String(displayValue).substring(0, 40)}...
                                          </span>
                                        ) : (
                                          <span>{String(displayValue)}</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {/* 操作按钮 */}
                                <div className="d-flex gap-2">
                                  {displayUrl && (
                                    <>
                                      {isHttpUrl && (
                                        <Button 
                                          size="sm" 
                                          variant="outline-primary"
                                          href={displayUrl}
                                          target="_blank"
                                        >
                                          <i className="bi bi-box-arrow-up-right me-1"></i>
                                          新窗口打开
                                        </Button>
                                      )}
                                      <Button 
                                        size="sm" 
                                        variant="outline-success"
                                        onClick={() => {
                                          const a = document.createElement('a');
                                          a.href = displayUrl;
                                          a.download = `video_${idx + 1}.mp4`;
                                          a.click();
                                        }}
                                      >
                                        <i className="bi bi-download me-1"></i>
                                        下载
                                      </Button>
                                    </>
                                  )}
                                </div>
                                
                                {(isTosUrl || isHttpsTosUrl || needsPresignedUrl) && (
                                  <Alert 
                                    variant={presignedUrls[videoUrl] ? "success" : generatingUrls ? "info" : "warning"} 
                                    className="mt-2 mb-0 py-2 small"
                                  >
                                    {presignedUrls[videoUrl] ? (
                                      <>
                                        <i className="bi bi-check-circle me-1"></i>
                                        已使用预签名URL（1小时有效期）
                                      </>
                                    ) : generatingUrls ? (
                                      <>
                                        <Spinner animation="border" size="sm" className="me-1" />
                                        正在生成预签名URL...
                                      </>
                                    ) : (
                                      <>
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        TOS私有资源需要预签名URL才能访问
                                      </>
                                    )}
                                  </Alert>
                                )}
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  ) : (
                    <Alert variant="info">
                      <i className="bi bi-info-circle me-2"></i>
                      未找到匹配的结果
                    </Alert>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* 历史记录标签页 */}
        <Tab eventKey="history" title={<><i className="bi bi-clock-history me-2"></i>历史</>}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <h5>搜索历史</h5>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => saveHistory([])}
                  disabled={searchHistory.length === 0}
                >
                  <i className="bi bi-trash me-1"></i>
                  清空历史
                </Button>
              </div>

              {searchHistory.length > 0 ? (
                <ListGroup>
                  {searchHistory.map((item) => (
                    <ListGroup.Item key={item.id}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div style={{ flex: 1 }}>
                          <div className="mb-2">
                            <Badge bg="primary" className="me-2">
                              {item.mode === 'text-search' ? '文本搜索' : 
                               item.mode === 'image-search' ? '图片搜索' :
                               item.mode === 'video-search' ? '视频搜索' : '混合搜索'}
                            </Badge>
                            <Badge bg="secondary" className="me-2">{item.collection}</Badge>
                            <Badge bg="info">{item.index}</Badge>
                          </div>
                          <div>
                            <strong>查询:</strong> {item.query}
                          </div>
                          <div className="text-muted small mt-1">
                            找到 {item.resultCount} 个结果 · {new Date(item.timestamp).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  暂无搜索历史
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* 说明标签页 */}
        <Tab eventKey="docs" title={<><i className="bi bi-book me-2"></i>说明</>}>
          <Card>
            <Card.Body>
              <h5>功能说明</h5>
              <p>素材搜索基于火山引擎 VikingDB 向量数据库，支持多模态搜索。</p>

              <h6 className="mt-3">搜索模式</h6>
              <ul>
                <li><strong>文搜文/图/视频</strong>: 使用文本描述搜索文本、图片或视频内容</li>
                <li><strong>图搜图/视频</strong>: 使用图片搜索相似的图片或视频</li>
                <li><strong>视频搜索</strong>: 使用视频搜索相似的视频内容</li>
                <li><strong>混合搜索</strong>: 结合文本、图片、视频进行综合搜索</li>
              </ul>

              <h6 className="mt-3">使用步骤</h6>
              <ol>
                <li>在"设置"页面配置 AccessKeyId 和 SecretAccessKey</li>
                <li>填入你在 VikingDB 控制台创建的数据集名称和索引名称</li>
                <li>选择搜索模式</li>
                <li>输入搜索内容（文本、图片或视频）</li>
                <li>设置搜索参数（返回数量、输出字段）</li>
                <li>点击"开始搜索"按钮</li>
              </ol>

              <h6 className="mt-3">数据集配置</h6>
              <ul>
                <li><strong>Collection（数据集）</strong>: 在 VikingDB 控制台创建的数据集名称</li>
                <li><strong>Index（索引）</strong>: 数据集对应的索引名称，通常与数据集名称相同</li>
                <li><strong>Output Fields（输出字段）</strong>: 指定返回哪些字段，如 f_text, f_image, f_video</li>
              </ul>

              <h6 className="mt-3">注意事项</h6>
              <ul>
                <li>需要先在 VikingDB 控制台创建数据集并导入数据</li>
                <li>确保数据集中包含对应的向量字段</li>
                <li>图片和视频可以使用 TOS 地址或公开的 HTTP/HTTPS 链接</li>
                <li>搜索结果按相似度分数排序，分数越高表示越相似</li>
              </ul>

              <Alert variant="info" className="mt-3">
                <strong>提示</strong>: 如果搜索返回 404 错误，请检查数据集和索引名称是否正确，
                以及是否有权限访问该数据集。
              </Alert>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default SmartSearch;

